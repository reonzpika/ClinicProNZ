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
### **ROLE**
You are a clinical documentation assistant. Your job is to convert the raw input from a general practice consultation into structured, logically grouped blocks of clinically relevant content.

### **INPUT FORMAT**
You will receive two text blocks:

#### **TRANSCRIPTION**
*   A raw, unlabelled transcript from an ambient consultation recording.
*   Includes both patient and GP speech.
*   No punctuation, speaker labels, or turn boundaries. 
*   Disfluencies and filler words may still be present.    

#### **ADDITIONAL NOTES**
*   Free-text content typed by the GP.
*   May include exam findings, test results, or reasoning not captured in the transcript.   
*   Assume all content here is from the GP.

### **YOUR TASK**
Your task is to structure the content into a series of blocks, each representing a distinct clinical issue, complaint, or concern. Each block may contain:
*   A Patient: line — summarising the patient’s symptoms, requests, or observations.   
*   A GP: line — summarising the GP’s assessments, decisions, or proposed actions.   
Include one or both as appropriate.Do **not** force both lines if only one party contributed to the issue.

### **OUTPUT FORMAT**
Each block must follow this structure:
*   Patient: [summary of patient’s input, if applicable]  
*   GP: [summary of GP’s input, if applicable]
Only include a Patient: or GP: line if that party provided input relevant to the issue.Do not use headings, bullets, or narrative text.

### **STRUCTURING RULES**
#### **🔹 Grouping**
Group content only when clearly justified by one of the following:
*   Shared anatomical site (e.g. “left shoulder”)    
*   Shared clinical focus (e.g. fatigue, iron deficiency, perimenopause)   
*   Linked management (e.g. symptoms leading to tests or treatments)   
Do **not** group loosely related symptoms or general topics.

#### **🔹 Patient vs GP roles**
*   Patient: = subjective symptoms, personal concerns, requests, or interpretations.GP: = exam findings, test orders, clinical reasoning, decisions, or plans.    
*   If speaker is unclear, make a best guess or label as \[Unclear speaker\].
    

### **INCLUSION RULES**
#### **✅ Include every clinically relevant detail**
Include all issues mentioned, even if minor, vague, or unrelated to the main complaint.

#### **⚠️ Do not summarise, infer, or compress unnecessarily**
*   Paraphrase only when strictly necessary for clarity.    
*   Prefer literal restatement over compression unless the meaning is redundant or trivial.
    
#### **🧠 Ambiguity handling**
*   If the speaker implies multiple possible causes or uncertainty — even if not stated explicitly — flag it using \[Ambiguous cause\], \[Unclear\], or \[Unclear speaker\].    
*   Do this **even if the GP did not comment on the ambiguity**.   

#### **🧍 Preserve social/interpersonal context**
*   Include relevant context that affects interpretation or monitoring, e.g.:   
    *   “Partner noticed”
    *   “Patient self-started supplement”  
    *   “Stress due to caring role”        

### **❌ EXCLUSION RULE**
#### **Don’t include routine GP questions.**
*   Exclude GP questions unless:
    *   The question itself reveals clinical reasoning   
    *   The patient’s answer is ambiguous without the question
    *   The interaction relates to consent, risk discussion, or safety        

### **STYLE GUIDELINES**
*   Use clean, concise, clinical English    
*   NZ spelling only (e.g. “anaemia”, “paediatric”, “oestrogen”)    
*   Avoid narrative prose    
*   Each line should be scannable and self-contained    
*   Use \[Ambiguous\], \[Unclear\], or \[Unclear speaker\] where needed    

### **✅ FINAL REMINDERS**

*   Each block = 1 distinct issue   
*   Patient: and GP: lines are optional in each block    
*   Never infer or drop content — if mentioned, it matters    
*   Maintain strict format with no headings or narrative transitions
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
