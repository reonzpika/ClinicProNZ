import { NextResponse } from 'next/server';
import { getDb } from 'database/client';
import { and, eq } from 'drizzle-orm';
import OpenAI from 'openai';

import { trackOpenAIUsage } from '@/src/features/admin/cost-tracking/services/costTracker';
import { TemplateService } from '@/src/features/templates/template-service';
import { compileTemplate } from '@/src/features/templates/utils/compileTemplate';
import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';
import { apiUsageCosts, patientSessions, users } from '@/db/schema';
import { calculateDeepgramCost } from '@/src/features/admin/cost-tracking/services/costCalculator';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey, timeout: 45000 });
}

// Add a timeout wrapper for promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs),
    ),
  ]);
}

// Generate clinical notes using AI
export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    // Parse request body early with timeout
    const body = await withTimeout(
      req.json(),
      5000,
      'Request parsing timeout',
    );

    const { rawConsultationData, templateId } = body;

    // Quick validation first
    if (!templateId) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Missing templateId' }, { status: 400 });
    }

    if (!rawConsultationData || rawConsultationData.trim() === '') {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Missing rawConsultationData' }, { status: 400 });
    }

    // Run RBAC and template fetch in parallel to save time
    const [context, template] = await withTimeout(
      Promise.all([
        extractRBACContext(req),
        TemplateService.getById(templateId),
      ]),
      10000,
      'Authentication and template fetch timeout',
    );

    // Early return if template not found
    if (!template) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Template not found' }, { status: 404 });
    }

    // Check permissions
    const permissionCheck = await withTimeout(
      checkCoreAccess(context),
      5000,
      'Permission check timeout',
    );

    if (!permissionCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: permissionCheck.reason || 'Access denied',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Compile template with raw consultation data
    const { system, user } = compileTemplate(
      template.templateBody,
      rawConsultationData,
    );

    // Check remaining time before starting OpenAI call
    const elapsedTime = Date.now() - startTime;
    const remainingTime = 55000 - elapsedTime; // Leave 5s buffer before Vercel timeout

    if (remainingTime < 10000) {
      return NextResponse.json({
        code: 'TIMEOUT_ERROR',
        message: 'Request processing took too long. Please try again.',
      }, { status: 408 });
    }

    // Call OpenAI (non-streaming) to reliably capture usage metrics
    const openaiTimeout = Math.min(remainingTime - 5000, 40000);
    const openai = getOpenAI();
    const completion: any = await withTimeout(
      openai.chat.completions.create({
        model: 'gpt-4.1-mini', // Faster, more affordable reasoning model
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.1,
        max_tokens: 2000,
        stream: false,
      }),
      openaiTimeout,
      'OpenAI API timeout',
    );

    const fullContent = completion.choices?.[0]?.message?.content || '';
    const usage = (completion as any)?.usage || {};
    const totalInputTokens = usage?.prompt_tokens || 0;
    const totalOutputTokens = usage?.completion_tokens || 0;
    const totalCachedInputTokens = usage?.prompt_tokens_details?.cached_tokens || 0;

    // Track OpenAI usage cost
    try {
      // Try attach current session id if available
      let currentSessionId: string | null = null;
      try {
        if (context.userId) {
          const db = getDb();
          const current = await db
            .select({ currentSessionId: users.currentSessionId })
            .from(users)
            .where(eq(users.id, context.userId))
            .limit(1);
          currentSessionId = current?.[0]?.currentSessionId || null;
        }
      } catch {}

      await trackOpenAIUsage(
        { userId: context.userId, sessionId: currentSessionId || undefined },
        totalInputTokens,
        totalOutputTokens,
        totalCachedInputTokens,
      );
    } catch (error) {
      console.warn('[Notes] Failed to track OpenAI cost:', error);
    }

    // Aggregate Deepgram transcription cost for the session and clear tracked durations
    try {
      const db = getDb();
      const userId = context.userId;
      if (userId) {
        const rows = await db
          .select({ currentSessionId: users.currentSessionId })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        const sessionId = rows?.[0]?.currentSessionId || null;

        if (sessionId) {
          const existing = await db
            .select({ transcriptions: patientSessions.transcriptions })
            .from(patientSessions)
            .where(and(eq(patientSessions.id, sessionId), eq(patientSessions.userId, userId)))
            .limit(1);

          const raw = existing?.[0]?.transcriptions || '[]';
          let entries: Array<any> = [];
          try {
            entries = JSON.parse(raw || '[]');
            if (!Array.isArray(entries)) entries = [];
          } catch { entries = []; }

          const totalDurationSec = entries.reduce((sum: number, e: any) => sum + (Number.isFinite(Number(e?.durationSec)) ? Number(e.durationSec) : 0), 0);
          const totalMinutes = totalDurationSec / 60;

          try {
            await db.delete(apiUsageCosts).where(
              and(
                eq(apiUsageCosts.sessionId, sessionId),
                eq(apiUsageCosts.apiProvider, 'deepgram'),
                eq(apiUsageCosts.apiFunction, 'transcription'),
              ),
            );
          } catch {}

          const breakdown = calculateDeepgramCost({ duration: totalMinutes } as any);
          await db.insert(apiUsageCosts).values({
            userId,
            sessionId,
            apiProvider: 'deepgram',
            apiFunction: 'transcription',
            usageMetrics: { duration: totalMinutes },
            costUsd: breakdown.costUsd.toString(),
          } as any);

          // Clear tracked durations (reset transcriptions array)
          try {
            await db
              .update(patientSessions)
              .set({ transcriptions: JSON.stringify([]), updatedAt: new Date() })
              .where(and(eq(patientSessions.id, sessionId), eq(patientSessions.userId, userId)));
          } catch {}
        }
      }
    } catch (err) {
      try { console.warn('[Notes] Failed to aggregate Deepgram cost on process note:', err); } catch {}
    }

    // Stream the final content to the client (single-chunk stream)
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(fullContent));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Note generation error:', error);

    // Handle timeout errors specifically
    if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('TIMEOUT'))) {
      return NextResponse.json({
        code: 'TIMEOUT_ERROR',
        message: 'The request took too long to process. Please try with shorter input or try again.',
      }, { status: 408 });
    }

    // Handle OpenAI specific errors
    if (error instanceof Error && error.message.includes('OpenAI')) {
      return NextResponse.json({
        code: 'AI_SERVICE_ERROR',
        message: 'AI service is currently busy. Please try again in a moment.',
      }, { status: 503 });
    }

    return NextResponse.json({
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Failed to generate note',
    }, { status: 500 });
  }
}
