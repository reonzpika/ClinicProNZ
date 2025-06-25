import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { TemplateService } from '@/features/templates/template-service';
import { compileTemplate } from '@/features/templates/utils/compileTemplate';

// TODO: Move to config/env util if needed
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  timeout: 45000, // 45 second timeout to stay under Vercel limits
});

// TODO: Implement structured output for generated notes (e.g., JSON or sections) instead of plain text.

export async function POST(req: Request) {
  try {
    const { transcription, templateId, typedInput, inputMode, consultationNotes } = await req.json();

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

    // Call OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      // TODO: Add settings e.g. temperature, max_completion_tokens, top_p, frequency_penalty, presence_penalty

      // TODO: Add response_format if structured output is needed
      stream: true,
      max_completion_tokens: 2000, // Limit response length to reduce processing time
      temperature: 0.1,
      top_p: 0.4,
    });

    // Stream the response to the client with timeout handling
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const timeoutId = setTimeout(() => {
            controller.error(new Error('Stream timeout'));
          }, 40000); // 40 second timeout for streaming

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
