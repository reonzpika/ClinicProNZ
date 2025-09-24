import { NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey });
}

// Trusted sources allowlists
const NZ_TRUSTED_DOMAINS = [
  'bpac.org.nz',
  'nzf.org.nz',
  'tewhatuora.govt.nz',
  'health.govt.nz',
  'healthify.nz',
  'starship.org.nz',
  'medsafe.govt.nz',
  'rph.org.nz',
];

const INTL_TRUSTED_DOMAINS = [
  'nice.org.uk',
  'cochranelibrary.com',
  'who.int',
  'cdc.gov',
  'ema.europa.eu',
];

// System prompt for NZ GP clinical assistant with strict structure and citations
const CHATBOT_SYSTEM_PROMPT = `You are a clinical AI assistant for New Zealand General Practitioners (GPs).

Response contract (follow exactly):
SHORT ANSWER:\n<one or two sentences, practical, directly answer the question>. Include inline numeric citations like [1], [2] where relevant.

FOLLOW-UPS:\n- Up to 3 short questions offering logical next steps.

SOURCES:\n[List up to 3 sources, each on its own line in the format: [n] Title — https://domain/path]

Citation policy:
- Prioritise New Zealand sources first. Allowed NZ domains: ${NZ_TRUSTED_DOMAINS.join(', ')}.
- If no suitable NZ page exists, use trusted international sources: ${INTL_TRUSTED_DOMAINS.join(', ')}.
- Use specific guideline/article pages (not homepages). Always include HTTPS URL. Avoid blogs/forums.

Clinical style:
- Professional, clear, GP-focused. Support safe reasoning; avoid definitive diagnoses. Flag red flags and referral triggers when appropriate.
- When consultation context is provided, adapt advice to that scenario.
- Be concise.
`;

const CONSULTATION_CONTEXT_PREFIX = `

CONSULTATION CONTEXT:
The following consultation note provides clinical context for this conversation:

---
`;

const CONSULTATION_CONTEXT_SUFFIX = `
---

Please use this consultation context to provide relevant, specific guidance for this clinical scenario.`;

export async function POST(req: Request) {
  try {
    const { messages, consultationNote, useContext, rawConsultationData } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'Messages array is required' },
        { status: 400 },
      );
    }

    // Build system prompt with context based on two-phase logic
    let systemPrompt = CHATBOT_SYSTEM_PROMPT;

    if (useContext) {
      if (consultationNote && consultationNote.trim()) {
        // Phase 2: Generated notes exist - use only the structured notes
        systemPrompt += CONSULTATION_CONTEXT_PREFIX + consultationNote + CONSULTATION_CONTEXT_SUFFIX;
      } else if (rawConsultationData) {
        // Phase 1: No generated notes - use raw consultation data
        let rawContext = '';

        if (rawConsultationData.transcription && rawConsultationData.transcription.trim()) {
          rawContext += `TRANSCRIPTION:\n${rawConsultationData.transcription}\n\n`;
        }

        if (rawConsultationData.typedInput && rawConsultationData.typedInput.trim()) {
          rawContext += `TYPED INPUT:\n${rawConsultationData.typedInput}\n\n`;
        }

        if (rawContext.trim()) {
          systemPrompt += `

RAW CONSULTATION DATA:
The following raw consultation data provides clinical context for this conversation:

---
${rawContext.trim()}
---

Please use this raw consultation data to provide relevant guidance. This is unstructured consultation information that may need clarification or organisation.`;
        }
      }
    }

    // Prepare messages for OpenAI API
    const openaiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // Prefer Responses API with web_search tool. Fallback to Chat Completions if unavailable.
    const openai = getOpenAI();
    let readable: ReadableStream<Uint8Array> | null = null;

    try {
      // Responses API streaming with web_search tool
      // Note: We stream only output_text deltas for compatibility with existing clients
      // and let the model handle citations and structure per system prompt.
      const respStream: any = await (openai as any).responses.stream({
        model: 'gpt-4o-mini',
        input: openaiMessages,
        tools: [{ type: 'web_search' }],
        temperature: 0.2,
        max_output_tokens: 400,
        parallel_tool_calls: true,
      });

      const encoder = new TextEncoder();
      readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of respStream as AsyncIterable<any>) {
              // Stream only text deltas
              if (event.type === 'response.output_text.delta' && event.delta) {
                controller.enqueue(encoder.encode(event.delta));
              }
              if (event.type === 'response.error') {
                console.error('Responses stream error event:', event.error);
              }
            }
            controller.close();
          } catch (err) {
            console.error('Responses API streaming error:', err);
            controller.error(err);
          }
        },
      });
    } catch (responsesErr) {
      console.warn('Falling back to Chat Completions streaming. Reason:', responsesErr);

      // Fallback: Chat Completions streaming (no web search)
      const completionStream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        temperature: 0.2,
        max_tokens: 400,
        stream: true,
      });

      const encoder = new TextEncoder();
      readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completionStream) {
              const content = chunk.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
            controller.close();
          } catch (error) {
            console.error('Chat Completions streaming error:', error);
            controller.error(error);
          }
        },
      });
    }

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to process chat request',
      },
      { status: 500 },
    );
  }
}
