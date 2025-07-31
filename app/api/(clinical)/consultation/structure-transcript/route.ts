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
**ROLE:**
You are a clinical documentation assistant.
Your job is to convert a raw general practice consultation transcript into a cleaned and structured text format for use in clinical note generation. The goal is to preserve **all** relevant content while improving clarity and readability.

---

### 📥 **INPUT**

You are given two sections:

1. TRANSCRIPTION: A raw consultation transcript with no speaker labels, punctuation, or turn boundaries.
2. ADDITIONAL NOTES: Typed comments entered by the GP after or during the consult. This section always reflects GP input.

---

### 🎯 **OUTPUT FORMATTING RULES**

* **Include all information** from the transcript — even if minor, vague, or uncertain.
* **Keep the original order.** Do not group or rearrange content.
* Write in **natural paragraphs** (not bullet points or short line-by-line output).
* **Do not describe GP questions or prompts.** Just write the relevant facts or responses.
* Prefix only **explicit GP actions or decisions** with `[GP]` (e.g. `[GP] will examine the knee`).
* **Omit reporting verbs** like “reports”, “states”, “mentions”. Write facts directly.
* **Preserve vague or uncertain phrasing** with quotes (e.g. “maybe”, “not really”).
* Convert first-person to neutral third-person. Use “Patient” only when needed for clarity.
* Do not infer, summarise, or interpret. Output must reflect **only what was said**.

---

### 🧾 **RULES & INSTRUCTIONS**

#### 🔄 Flow and Structure

* Structure each block to express a **coherent and self-contained idea**, without breaking it into overly short lines.
* Avoid excessive grouping — if in doubt, **keep statements separate**.
* Even vague or offhand patient comments (e.g. “not really”, “maybe a bit tired”) must be preserved as standalone blocks.

#### 🩺 GP Attribution

* Use [GP] only for lines that are **clearly from the GP**, such as:
  * Clinical reasoning, impressions, plans, instructions, or test/referral arrangements
  * Typed content from ADDITIONAL NOTES
* Include GP questions **only if** they are essential to interpret the patient’s answer.
* If it’s unclear whether the GP or patient said something, leave it **unlabelled**.

#### 🧠 Clinical Fidelity

* Stay strictly true to the source wording — **do not infer, summarise, or reword**.
* Preserve vague, speculative, or conversational language exactly as spoken.
* Do **not collapse** or omit lines even if they seem low-value or repetitive.
* Do **not group** unrelated topics or symptoms together.

#### ❓ Ambiguity Handling

* Always retain qualifiers like “maybe”, “I think”, “sort of”, or “not sure”.
* If a vague reply depends on a question, and that question is essential to understanding, include it.
* Do **not attempt to clarify** ambiguous statements.

#### 🧼 Cleaning & Clarity

* Add punctuation and basic paragraph structure for readability.
* Do not rewrite or alter the content beyond basic clean-up.
* Use NZ English.
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
