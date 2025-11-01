import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { trackOpenAIUsage } from '@/src/features/admin/cost-tracking/services/costTracker';
import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey, timeout: 45000 });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs),
    ),
  ]);
}

// Generate referral letter using AI
export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const body = await withTimeout(
      req.json(),
      5000,
      'Request parsing timeout',
    );

    const { 
      consultationNote,
      specialty,
      instructions,
    } = body;

    // Validation
    if (!consultationNote || typeof consultationNote !== 'string' || consultationNote.trim() === '') {
      return NextResponse.json({ 
        code: 'BAD_REQUEST', 
        message: 'Missing consultation note' 
      }, { status: 400 });
    }

    if (!specialty || typeof specialty !== 'string' || specialty.trim() === '') {
      return NextResponse.json({ 
        code: 'BAD_REQUEST', 
        message: 'Missing specialty' 
      }, { status: 400 });
    }

    // Run RBAC check
    const context = await withTimeout(
      extractRBACContext(req),
      10000,
      'Authentication timeout',
    );

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

    // Build system prompt (hardcoded NZ GP referral style)
    const systemPrompt = `You are an expert NZ GP assistant specializing in writing clear, concise referral letters for specialists.

Your task:
1. Write a SHORT, CONCISE one-paragraph summary at the top that clearly states:
   - Why the patient is being referred
   - The key clinical concern or question
   - What the GP is asking the specialist to do

2. Follow with the consultation note (adjusted slightly for referral context if needed)

Guidelines:
- Specialists read many letters daily. Make it easy to scan.
- First paragraph should be direct and to the point.
- Use NZ medical terminology and abbreviations appropriately.
- Keep professional tone suitable for specialist-to-specialist communication.
- DO NOT add unnecessary pleasantries or verbose introductions.
- Focus on clinical relevance.

Format:
[One concise paragraph stating referral reason and question]

[Consultation note - adjusted for referral context]`;

    // Build user prompt
    const userPrompt = `Please generate a referral letter for: ${specialty.trim()}

${instructions && instructions.trim() ? `Additional context from GP:\n${instructions.trim()}\n\n` : ''}Consultation note:
${consultationNote.trim()}`;

    // Check remaining time
    const elapsedTime = Date.now() - startTime;
    const remainingTime = 55000 - elapsedTime;

    if (remainingTime < 10000) {
      return NextResponse.json({
        code: 'TIMEOUT_ERROR',
        message: 'Request processing took too long. Please try again.',
      }, { status: 408 });
    }

    // Call OpenAI
    const openaiTimeout = Math.min(remainingTime - 5000, 40000);
    const openai = getOpenAI();
    const completion: any = await withTimeout(
      openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 2500,
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
      await trackOpenAIUsage(
        { userId: context.userId },
        totalInputTokens,
        totalOutputTokens,
        totalCachedInputTokens,
      );
    } catch (error) {
      console.warn('[Referral] Failed to track OpenAI cost:', error);
    }

    // Stream the final content to the client
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
    console.error('Referral generation error:', error);

    if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('TIMEOUT'))) {
      return NextResponse.json({
        code: 'TIMEOUT_ERROR',
        message: 'The request took too long to process. Please try again.',
      }, { status: 408 });
    }

    if (error instanceof Error && error.message.includes('OpenAI')) {
      return NextResponse.json({
        code: 'AI_SERVICE_ERROR',
        message: 'AI service is currently busy. Please try again in a moment.',
      }, { status: 503 });
    }

    return NextResponse.json({
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Failed to generate referral',
    }, { status: 500 });
  }
}
