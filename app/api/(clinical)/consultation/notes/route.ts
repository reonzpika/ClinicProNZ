import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { TemplateService } from '@/src/features/templates/template-service';
import { compileTemplate } from '@/src/features/templates/utils/compileTemplate';
import { checkCoreSessionLimit, extractRBACContext, incrementGuestSessionUsage } from '@/src/lib/rbac-enforcer';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  timeout: 30000, // Reduced to 30 seconds for faster failure detection
});

// Generate clinical notes using AI

export async function POST(req: Request) {
  try {
    const { transcription, templateId, typedInput, inputMode, consultationNotes, guestToken: bodyGuestToken } = await req.json();

    // Extract RBAC context and check permissions
    let context = await extractRBACContext(req);

    // Override guest token from request body if not found in headers
    if (!context.guestToken && bodyGuestToken) {
      context = {
        ...context,
        guestToken: bodyGuestToken,
      };
    }

    const permissionCheck = await checkCoreSessionLimit(context);

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

    // Validate required fields based on input mode
    if (!templateId) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Missing templateId' }, { status: 400 });
    }

    if (inputMode === 'typed') {
      if (!typedInput || typedInput.trim() === '') {
        return NextResponse.json({ code: 'BAD_REQUEST', message: 'Missing typedInput for typed mode' }, { status: 400 });
      }
    } else {
      // Default to audio mode
      if (!transcription) {
        return NextResponse.json({ code: 'BAD_REQUEST', message: 'Missing transcription for audio mode' }, { status: 400 });
      }
    }

    // Fetch template from DB
    const template = await TemplateService.getById(templateId);
    if (!template) {
      return NextResponse.json({ code: 'NOT_FOUND', message: 'Template not found' }, { status: 404 });
    }

    // Compile template with input data based on mode, including consultation notes
    const { system, user } = compileTemplate(
      template.templateBody,
      transcription || '',
      typedInput,
      inputMode,
      consultationNotes,
    );

    // Increment session usage for guest tokens BEFORE processing (to ensure proper counting)
    if (guestToken) {
      try {
        // Create a patient session to track usage
        const patientName = `Session ${new Date().toLocaleString()}`;
        await incrementGuestSessionUsage(guestToken, patientName, templateId);
      } catch (error) {
        console.error('Failed to increment guest session usage:', error);
        // Don't fail the request if usage tracking fails
      }
    }

    // Call OpenAI with optimized settings for speed
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use faster model variant
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      stream: true,
      max_completion_tokens: 1500, // Reduced from 2000 to speed up generation
      temperature: 0.3, // Lower temperature for faster, more deterministic responses
    });

    // Stream the response to the client with timeout handling
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const timeoutId = setTimeout(() => {
            controller.error(new Error('Stream timeout'));
          }, 25000); // 25 second timeout for streaming (under overall 30s limit)

          for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }

          clearTimeout(timeoutId);
          controller.close();
        } catch (error) {
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

    return NextResponse.json({
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Failed to generate note',
    }, { status: 500 });
  }
}
