import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { trackOpenAIUsage } from '@/src/features/admin/cost-tracking/services/costTracker';
import { TemplateService } from '@/src/features/templates/template-service';
import { compileTemplate } from '@/src/features/templates/utils/compileTemplate';
import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';

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

    // Call OpenAI with dynamic timeout based on remaining time
    const openaiTimeout = Math.min(remainingTime - 5000, 40000);
    const openai = getOpenAI();
    const stream = await withTimeout(
      openai.chat.completions.create({
        model: 'gpt-4.1-mini', // Faster, more affordable reasoning model
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        stream: true,
        // Ensure final usage chunk is emitted so we can record tokens
        stream_options: { include_usage: true } as any,
        max_completion_tokens: 2000, // Reduced further for faster generation
        temperature: 0.1, // Lower temperature for faster, more deterministic responses
      } as any),
      openaiTimeout,
      'OpenAI API timeout',
    );

    // Stream the response to the client with dynamic timeout
    const encoder = new TextEncoder();
    const streamTimeout = Math.min(remainingTime - 2000, 35000);

    const readable = new ReadableStream({
      async start(controller) {
        let timeoutId: NodeJS.Timeout | null = null;
        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        let totalCachedInputTokens = 0;

        try {
          timeoutId = setTimeout(() => {
            controller.error(new Error('Stream timeout'));
          }, streamTimeout);

          for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }

            // Collect token usage from the stream
            if (chunk.usage) {
              totalInputTokens = chunk.usage.prompt_tokens || 0;
              totalOutputTokens = chunk.usage.completion_tokens || 0;
              // Try to capture cached tokens when prompt caching is used
              const details = (chunk.usage as any).prompt_tokens_details || {};
              totalCachedInputTokens = details.cached_tokens || details.cached || 0;
            }
          }

          // Track OpenAI usage cost after streaming completes
          try {
            await trackOpenAIUsage(
              { userId: context.userId },
              totalInputTokens,
              totalOutputTokens,
              totalCachedInputTokens,
            );
          } catch (error) {
            console.warn('[Notes] Failed to track OpenAI cost:', error);
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
