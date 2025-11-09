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
      referralReason,
    } = body;

    // Validation
    if (!consultationNote || typeof consultationNote !== 'string' || consultationNote.trim() === '') {
      return NextResponse.json({
        code: 'BAD_REQUEST',
        message: 'Missing consultation note',
      }, { status: 400 });
    }

    if (!referralReason || typeof referralReason !== 'string' || referralReason.trim() === '') {
      return NextResponse.json({
        code: 'BAD_REQUEST',
        message: 'Missing referral reason',
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
1. Write a SHORT PARAGRAPH at the top (2-4 sentences):
   - State the main clinical concern and what you're asking for
   - Include key context: patient age, relevant history
   - Example: "45yo M with 3-day hx severe RUQ pain, fever 38.5?C, +Murphy's sign. Background T2DM, HTN. Likely cholecystitis on imaging. Request surgical review for possible cholecystectomy."

2. Follow with the consultation note:
   - COPY the structure and content from the original consultation note
   - REMOVE information not relevant to this referral
   - Keep the same section headings (History, Examination, Assessment, Plan, etc.)
   - Maintain the original writing style (whether telegraphic or prose)
   - DO NOT restructure or rewrite sections
   - Just filter out unrelated details

Guidelines:
- Specialists read many letters daily. Keep it focused and scannable.
- Opening paragraph: Include age, key symptoms, relevant background, what's requested.
- Consultation note: Copy the structure but remove irrelevant details (e.g., if referring for surgical issue, remove detailed mental health history unless directly relevant).
- DO NOT change the consultation note's format or style.
- Keep professional NZ medical terminology.
- Focus on clinical relevance to the referral reason.

Format:
[Short paragraph: patient context, clinical concern, what's requested]

[Filtered consultation note - maintain original structure and headings]`;

    // Build user prompt
    const userPrompt = `Please generate a referral letter.

Reason for referring:
${referralReason.trim()}

Consultation note:
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
