import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { TemplateService } from '@/src/features/templates/template-service';
import { compileTemplate } from '@/src/features/templates/utils/compileTemplate';
import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  timeout: 45000, // Increased timeout since Vercel now allows 60s
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

    // Call OpenAI with dynamic timeout based on remaining time
    const openaiTimeout = Math.min(remainingTime - 5000, 40000);
    const stream = await withTimeout(
      openai.chat.completions.create({
        model: 'gpt-4.1-mini', // Faster, more affordable reasoning model
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        stream: true,
        max_completion_tokens: 2000, // Reduced further for faster generation
        temperature: 0.1, // Lower temperature for faster, more deterministic responses
      }),
      openaiTimeout,
      'OpenAI API timeout',
    );

    // Stream the response to the client with dynamic timeout
    const encoder = new TextEncoder();
    const streamTimeout = Math.min(remainingTime - 2000, 35000);

    const readable = new ReadableStream({
      async start(controller) {
        let timeoutId: NodeJS.Timeout | null = null;

        try {
          timeoutId = setTimeout(() => {
            controller.error(new Error('Stream timeout'));
          }, streamTimeout);

          for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }

          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          controller.close();
        } catch (error) {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          console.error('Streaming error:', error);
          controller.error(error);
        }
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
