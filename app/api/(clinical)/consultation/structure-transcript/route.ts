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

// System prompt for consultation content structuring
function generateStructuringPrompt(): string {
  return `
Role
You are a clinical documentation assistant.
Your task is to convert a raw patient consultation transcript into a clean, logically structured set of grouped content blocks.
The input is from an ambient recording with no speaker labels, disfluencies, or turn boundaries.

TASK
Read the full transcript. Then do the following:

1. Identify and group clinical content.
Identify all distinct clinical problems, issues, or requests discussed.
(e.g. “headache”, “prescription refill”, “rash”, “stress-related sleep issues”)

For each one, extract only what was explicitly said or clearly implied.
Do not infer, summarise, or add common clinical advice.

Group related statements together only if they clearly refer to the same issue.
→ If there is any doubt, keep them as separate blocks.

2. Extract everything that is clinically relevant.
Include: symptoms, duration, severity, context, patient concerns, history, GP questions, answers, observations, medication use, requests, discussion points, etc.

Do not omit any relevant information — everything must be preserved.
→ Even vague or minor comments must be included somewhere in the output.

3. Preserve ambiguity.
If a statement is unclear, include it exactly as said.
Use flags: (unclear) or (ambiguous) as needed.

4. Formatting rules.
Output must be in natural language blocks.
Each block = one clinical problem or logical issue.
Do NOT use section headings, bullets, or labels.
Separate each block with one blank line.

5. Fidelity
Include all clinically relevant info from both sources.
If transcript and typed note differ, include both unless one is explicitly corrected.

✅ Output rules
5. Output length rule.
Output must not be longer than the input transcript.
Use clean grammar and phrasing, but do not expand or embellish.

EXAMPLE OUTPUT (structure only):
Patient reports chest tightness since last Thursday morning. It comes and goes, worsens when bending over. No cough or fever. Feels slightly dizzy when standing too fast. Describes mild pressure under sternum during work stress.

Requests renewal of insulin prescription. Currently on 18 units of NovoRapid before meals and 24 units of Lantus at night. Last HbA1c was 8.2 in May.

Requests flu vaccine. Heard about new strain circulating.

Reports difficulty sleeping since cousin passed away. Wakes at 3 AM and lies awake. Work stress contributing.

Noticed red, itchy rash on forearm since Tuesday.
`;
}

// Structure consultation content using AI
async function structureTranscript(rawContent: string): Promise<string> {
  if (!rawContent || rawContent.trim() === '') {
    throw new Error('Empty content provided');
  }

  const systemPrompt = generateStructuringPrompt();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Please organise this consultation content:\n\n${rawContent}` },
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
  let contentToStructure = ''; // Declare here so it's available in catch block

  try {
    // Parse request body early with timeout
    const body = await withTimeout(
      req.json(),
      5000,
      'Request parsing timeout',
    );

    const { transcription: rawContent, guestToken: bodyGuestToken, previewMode = false } = body;
    contentToStructure = rawContent; // Store for fallback use

    // Quick validation first
    if (!contentToStructure || contentToStructure.trim() === '') {
      return NextResponse.json({
        code: 'BAD_REQUEST',
        message: 'Missing or empty content to structure',
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
      incrementGuestSessionUsage(guestToken, `Content structuring ${new Date().toLocaleString()}`, 'structure-transcript')
        .catch(error => console.error('Failed to increment guest session usage:', error));
    }

    // Check remaining time before starting OpenAI call
    const elapsedTime = Date.now() - startTime;
    const remainingTime = 20000 - elapsedTime; // 20s total budget for structuring

    if (remainingTime < 5000) {
      return NextResponse.json({
        code: 'TIMEOUT_ERROR',
        message: 'Request processing took too long. Please try again.',
        fallbackTranscript: contentToStructure, // Provide fallback
      }, { status: 408 });
    }

    // Structure the content with dynamic timeout
    const structuringTimeout = Math.min(remainingTime - 2000, 15000); // Max 15s for AI call
    const structuredTranscript = await withTimeout(
      structureTranscript(contentToStructure),
      structuringTimeout,
      'Content structuring timeout',
    );

    // Check if admin user has requested preview mode
    const isAdminPreviewMode = context.tier === 'admin' && previewMode;

    if (isAdminPreviewMode) {
      // Return structured content for admin preview/editing
      return NextResponse.json({
        structuredTranscript,
        requiresReview: true,
        isPreviewMode: true,
        originalTranscript: contentToStructure,
        originalLength: contentToStructure.length,
        structuredLength: structuredTranscript.length,
        processingTimeMs: Date.now() - startTime,
        userTier: context.tier,
      });
    }

    // Standard response for non-preview mode
    return NextResponse.json({
      structuredTranscript,
      originalLength: contentToStructure.length,
      structuredLength: structuredTranscript.length,
      processingTimeMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Content structuring error:', error);

    // Handle timeout errors specifically
    if (error instanceof Error && (error.message.includes('timeout') || error.message.includes('TIMEOUT'))) {
      return NextResponse.json({
        code: 'TIMEOUT_ERROR',
        message: 'Content structuring took too long. Using original content.',
        fallbackTranscript: contentToStructure,
      }, { status: 408 });
    }

    // Handle OpenAI specific errors
    if (error instanceof Error && error.message.includes('OpenAI')) {
      return NextResponse.json({
        code: 'AI_SERVICE_ERROR',
        message: 'AI service is currently busy. Using original content.',
        fallbackTranscript: contentToStructure,
      }, { status: 503 });
    }

    return NextResponse.json({
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Failed to structure content',
      fallbackTranscript: contentToStructure,
    }, { status: 500 });
  }
}
