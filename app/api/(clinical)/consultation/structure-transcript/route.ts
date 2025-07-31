import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { checkCoreSessionLimit, extractRBACContext, incrementGuestSessionUsage } from '@/src/lib/rbac-enforcer';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  timeout: 45000, // Increased to match notes route
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
You are given a raw consultation transcript and typed GP notes.

---

### INPUT

* **TRANSCRIPTION**: Unstructured text. No speaker labels, punctuation, or turn boundaries. May include both GP and patient speech.
* **ADDITIONAL NOTES**: Typed comments from the GP. Always written by the GP.

---

### 🎯 GOAL

Convert the raw transcript into clean, readable lines.
**Do not group, summarise, interpret, or infer.**
Preserve the exact meaning and structure of the original.

---

### ✍️ OUTPUT FORMAT

* Output a list of **paragraph-style blocks**, separated by line breaks.
* Each block should contain **one coherent idea**.
* **Follow the exact order** of the input — do not rearrange.
* **Preserve all key terms, qualifiers, and concepts** — no omissions.

---

### 🔧 CLEANING RULES

* Add punctuation and structure for readability.
* Remove all first-person references (“I”, “my”).
* Use “Patient” **only when required for clarity**.
* Retain vague or uncertain expressions **in quotes** (e.g. “maybe”, “not really”, “kind of tired”).
* Do not add, guess, or simplify ambiguous wording.
* Eliminate filler/disfluencies only if clearly non-clinical (e.g. “um”, “you know”).

---

### 🩺 SPEAKER TAGGING

* Prefix a line with **GP:** only if it’s clearly GP speech and reflects:
  * A clinical decision, impression, instruction, plan, or reasoning
  * Typed content from **ADDITIONAL NOTES**
* Leave speaker **unlabelled** if unclear.
* Do **not include GP questions or prompts** unless absolutely required to make the patient's comment understandable.

---

### 🚫 AVOID

* ❌ Grouping separate symptoms or concerns
* ❌ Rewriting or paraphrasing
* ❌ Inference, explanation, or editorialising
* ❌ Changing the order
* ❌ Using reporting verbs (e.g. “reports”, “states”)
* ❌ Using “Patient” unless truly necessary
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
    const remainingTime = 55000 - elapsedTime; // Leave 5s buffer before Vercel timeout

    if (remainingTime < 10000) {
      return NextResponse.json({
        code: 'TIMEOUT_ERROR',
        message: 'Request processing took too long. Please try again.',
        fallbackTranscript: contentToStructure, // Provide fallback
      }, { status: 408 });
    }

    // Structure the content with dynamic timeout
    const structuringTimeout = Math.min(remainingTime - 5000, 40000); // Max 40s for AI call
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
