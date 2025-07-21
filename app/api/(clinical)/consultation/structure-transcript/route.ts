import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { checkCoreSessionLimit, extractRBACContext, incrementGuestSessionUsage } from '@/src/lib/rbac-enforcer';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  timeout: 20000, // 20s timeout for structuring
});

// Add a timeout wrapper for promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs),
    ),
  ]);
}

// System prompt for transcript structuring
function generateStructuringPrompt(): string {
  return `You are a medical transcript organiser for New Zealand general practice.

TASK: Organise this consultation transcript by presenting problems and topics while preserving ALL information exactly as discussed.

RULES:
1. Group related discussion together chronologically
2. Preserve every medical fact, symptom, and detail mentioned
3. Maintain the natural flow and context of the conversation
4. Use clear problem-based organisation when multiple issues are discussed
5. Keep all patient quotes and clinical observations intact
6. Preserve timeline references (e.g., "2 weeks ago", "started yesterday")

OUTPUT FORMAT:
If multiple distinct problems/concerns are discussed:

PROBLEM 1: [Brief descriptive title]
- [All related discussion grouped chronologically]
- [Include all symptoms, history, examination findings for this problem]

PROBLEM 2: [Brief descriptive title]  
- [All related discussion grouped chronologically]
- [Include all symptoms, history, examination findings for this problem]

GENERAL DISCUSSION:
- [Administrative matters, general health discussion, preventive care]
- [Follow-up arrangements, general advice]

If only one main problem is discussed:
- Simply organise the content chronologically without artificial problem divisions
- Group by natural conversation flow (history → examination → discussion → plan)

CRITICAL: 
- Never add information not in the original transcript
- Never omit any medical information mentioned
- Preserve the GP's clinical observations and patient's exact descriptions
- Maintain New Zealand medical context and terminology`;
}

// Structure a consultation transcript using AI
async function structureTranscript(rawTranscript: string): Promise<string> {
  if (!rawTranscript || rawTranscript.trim() === '') {
    throw new Error('Empty transcript provided');
  }

  const systemPrompt = generateStructuringPrompt();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Please organise this consultation transcript:\n\n${rawTranscript}` },
    ],
    temperature: 0.1, // Low temperature for consistent structuring
    max_tokens: 2000, // Generous limit for structured output
  });

  const structuredContent = completion.choices[0]?.message?.content;
  if (!structuredContent) {
    throw new Error('No structured content generated');
  }

  return structuredContent.trim();
}

// Structure consultation transcript
export async function POST(req: Request) {
  const startTime = Date.now();
  let transcription = ''; // Declare here so it's available in catch block

  try {
    // Parse request body early with timeout
    const body = await withTimeout(
      req.json(),
      5000,
      'Request parsing timeout',
    );

    const { transcription: rawTranscription, guestToken: bodyGuestToken } = body;
    transcription = rawTranscription; // Store for fallback use

    // Quick validation first
    if (!transcription || transcription.trim() === '') {
      return NextResponse.json({
        code: 'BAD_REQUEST',
        message: 'Missing or empty transcription',
      }, { status: 400 });
    }

    // Extract RBAC context and check permissions
    const context = await withTimeout(
      extractRBACContext(req).then((ctx) => {
        // Override guest token from request body if not found in headers
        if (!ctx.guestToken && bodyGuestToken) {
          return { ...ctx, guestToken: bodyGuestToken };
        }
        return ctx;
      }),
      5000,
      'Authentication timeout',
    );

    // Check permissions (same as consultation/notes)
    const permissionCheck = await withTimeout(
      checkCoreSessionLimit(context),
      5000,
      'Permission check timeout',
    );

    if (!permissionCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: permissionCheck.reason || 'Access denied',
          message: permissionCheck.upgradePrompt || 'Insufficient permissions',
          remaining: permissionCheck.remaining,
          resetTime: permissionCheck.resetTime?.toISOString(),
        }),
        {
          status: permissionCheck.reason?.includes('limit') ? 429 : 403,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Use guestToken from updated context
    const guestToken = context.guestToken;

    // Start session tracking in background (don't await to prevent delays)
    if (guestToken) {
      incrementGuestSessionUsage(guestToken, `Transcript structuring ${new Date().toLocaleString()}`, 'structure-transcript')
        .catch(error => console.error('Failed to increment guest session usage:', error));
    }

    // Check remaining time before starting OpenAI call
    const elapsedTime = Date.now() - startTime;
    const remainingTime = 20000 - elapsedTime; // 20s total budget for structuring

    if (remainingTime < 5000) {
      return NextResponse.json({
        code: 'TIMEOUT_ERROR',
        message: 'Request processing took too long. Please try again.',
        fallbackTranscript: transcription, // Provide fallback
      }, { status: 408 });
    }

    // Structure the transcript with dynamic timeout
    const structuringTimeout = Math.min(remainingTime - 2000, 15000); // Max 15s for AI call
    const structuredTranscript = await withTimeout(
      structureTranscript(transcription),
      structuringTimeout,
      'Transcript structuring timeout',
    );

    return NextResponse.json({
      structuredTranscript,
      originalLength: transcription.length,
      structuredLength: structuredTranscript.length,
      processingTimeMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Transcript structuring error:', error);

    // Handle timeout errors specifically
    if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('TIMEOUT'))) {
      return NextResponse.json({
        code: 'TIMEOUT_ERROR',
        message: 'Transcript structuring took too long. Using original transcript.',
        fallbackTranscript: transcription,
      }, { status: 408 });
    }

    // Handle OpenAI specific errors
    if (error instanceof Error && error.message.includes('OpenAI')) {
      return NextResponse.json({
        code: 'AI_SERVICE_ERROR',
        message: 'AI service is currently busy. Using original transcript.',
        fallbackTranscript: transcription,
      }, { status: 503 });
    }

    return NextResponse.json({
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Failed to structure transcript',
      fallbackTranscript: transcription,
    }, { status: 500 });
  }
}
