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
const CHATBOT_SYSTEM_PROMPT = `You are a clinical AI assistant specifically designed to support New Zealand General Practitioners (GPs) in their post-consultation workflow. Your role is to provide evidence-based, accurate clinical guidance that aligns with New Zealand healthcare guidelines and best practices.

Key Guidelines:
- Provide CONCISE, evidence-based medical advice grounded in current clinical guidelines
- Keep responses SHORT and to the point - aim for 2-3 sentences maximum
- Reference New Zealand-specific resources including HealthPathways when relevant
- Focus on primary care context and GP decision-making
- Ask clarifying questions when queries are ambiguous or require more context
- Acknowledge limitations and recommend specialist referral when appropriate
- Maintain professional, clear, and concise communication
- Never provide definitive diagnoses - support clinical reasoning instead
- Emphasize patient safety and appropriate follow-up care
- Be direct and practical in your advice

When consultation note context is provided, use it to ground your responses in the specific clinical scenario. When context is disabled, function as a general medical assistant for GPs.

Always prioritize patient safety and encourage appropriate clinical judgment. Keep all responses brief and actionable.`;

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
