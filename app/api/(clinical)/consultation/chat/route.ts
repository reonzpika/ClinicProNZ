import { NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey });
}

// System prompt for NZ GP clinical assistant
const CHATBOT_SYSTEM_PROMPT = `You are a clinical AI assistant for New Zealand General Practitioners (GPs). Your role is to provide short, evidence-based answers grounded in New Zealand clinical guidelines and resources.

Rules for Responses
- Begin with a very short answer (1–2 sentences maximum) that is practical and directly answers the GP’s query.
- After the short answer, present up to 3 related follow-up options phrased as questions (e.g. “Would you like more detail on … ?”). Choose the most relevant and common extensions GPs would logically want.
- Always add a reference URL at the end.
- Prioritise New Zealand resources (HealthPathways, BPAC, NZF, Ministry of Health, Te Whatu Ora).
- If NZ-specific information is unavailable, fallback to trusted international clinical resources (e.g. NICE, UpToDate, Cochrane).
- Keep the style professional, clear, and GP-focused.
- Do not give definitive diagnoses. Instead, support safe clinical reasoning, decision-making, and highlight when specialist referral is appropriate.

When consultation note context is present, adapt advice to that context.

Always prioritise brevity, evidence, and patient safety.`;

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

    // Call OpenAI with streaming
    const openai = getOpenAI();
    const stream = await openai.chat.completions.create({
      model: 'gpt-4', // Using GPT-4 for better clinical reasoning
      messages: openaiMessages,
      temperature: 0.3, // Lower temperature for more consistent medical advice
      max_tokens: 300, // Reduced for shorter responses
      stream: true,
    });

    // Stream the response to the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
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
