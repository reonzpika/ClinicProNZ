import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { extractRBACContext } from '@/src/lib/rbac-enforcer';
import { recordSessionMetrics } from '@/src/lib/services/session-metrics-service';
import { calculateCostUsd } from '@/src/shared/utils/ai-pricing';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY');
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

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
  const start = Date.now();
  try {
    const context = await extractRBACContext(req);
    const { messages, consultationNote, useContext, rawConsultationData, sessionId } = await req.json();

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
        systemPrompt += CONSULTATION_CONTEXT_PREFIX + consultationNote + CONSULTATION_CONTEXT_SUFFIX;
      } else if (rawConsultationData) {
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

    const model = 'gpt-4';

    // Prepare messages for OpenAI API
    const openaiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // Call OpenAI with streaming
    const stream = await openai.chat.completions.create({
      model,
      messages: openaiMessages,
      temperature: 0.3,
      max_tokens: 300,
      stream: true,
    });

    let outputCharCount = 0;

    // Stream the response to the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              outputCharCount += content.length;
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

    // After the stream is initiated, fire-and-forget metrics record
    (async () => {
      try {
        const latencyMs = Date.now() - start;
        const inputTokens = 0; // unknown; could estimate from prompt size later
        const outputTokens = Math.ceil(outputCharCount / 4);
        const cost = calculateCostUsd(model, inputTokens, outputTokens) ?? null;
        if (context.userId) {
          await recordSessionMetrics({
            userId: context.userId,
            sessionId: sessionId || null,
            aiModel: model,
            inputTokens,
            outputTokens,
            latencyMs,
            tokenCostUsd: cost,
          });
        }
      } catch (err) {
        console.warn('Failed to record chat metrics:', err);
      }
    })();

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
