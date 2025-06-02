import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { TemplateService } from '@/features/templates/template-service';
import { compileTemplate } from '@/features/templates/utils/compileTemplate';

// TODO: Move to config/env util if needed
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// TODO: Implement structured output for generated notes (e.g., JSON or sections) instead of plain text.

export async function POST(req: Request) {
  try {
    const { transcription, templateId, quickNotes, typedInput, inputMode } = await req.json();

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

    // Compile template with input data based on mode
    const { system, user } = compileTemplate(
      template.dsl,
      transcription || '',
      quickNotes || [],
      typedInput,
      inputMode,
    );

    // Call OpenAI o4-mini with streaming
    const stream = await openai.chat.completions.create({
      model: 'o4-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      // TODO: Add settings e.g. temperature, max_completion_tokens, top_p, frequency_penalty, presence_penalty
      // TODO: Add response_format if structured output is needed
      stream: true,
    });

    // Stream the response to the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
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
    console.error('Note generation error:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Failed to generate note' }, { status: 500 });
  }
}
