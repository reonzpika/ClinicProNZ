import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// HYBRID STACK NOTE:
// Use LlamaIndex for everything else in the pipeline:
// - Chunking (semantic, markdown-aware), retrievers, rerankers
// - Query/chat engines, memory, agents
// - Provider adapters/integration
// We only use Vercel AI SDK here for HTTP streaming ergonomics (SSE helpers).
// If you later move away from Vercel AI SDK, replace streamText/toAIStreamResponse below.

import OpenAI from 'openai';

import { formatContextForRag, searchSimilarDocuments } from '@/src/lib/rag';

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userTier = (sessionClaims as any)?.metadata?.tier || 'basic';
    const enforceTier = process.env.RAG_ENFORCE_TIER === 'true';
    if (enforceTier && userTier === 'basic') {
      return new Response('Standard tier or higher required', { status: 403 });
    }

    const body = await request.json();
    const query: string | undefined = body?.query ?? body?.prompt;
    if (!query || typeof query !== 'string') {
      return new Response('Query is required', { status: 400 });
    }

    // Retrieve top-k chunks from our RAG store
    const relevantDocs = await searchSimilarDocuments(query, 5, 0.35);
    const context = formatContextForRag(relevantDocs);

    const systemPrompt = `You are a clinical assistant for New Zealand GPs and healthcare professionals.

Instructions:
- Answer based ONLY on the provided context from NZ clinical guidance
- Always cite sources using the format: [Source Title](URL)
- If no relevant information is found, state this clearly
- Use NZ medical terminology and spelling
- Be concise but thorough
- Focus on evidence-based recommendations

Context:
${context}`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response('Missing OPENAI_API_KEY', { status: 500 });
    }

    const openai = new OpenAI({ apiKey });
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.1,
      stream: true,
    });

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta.length > 0) {
            const payload = JSON.stringify({ type: 'response.delta', delta });
            await writer.write(encoder.encode(`data: ${payload}\n\n`));
          }
        }
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        // Emit minimal error event
        const payload = JSON.stringify({ type: 'error', message: 'stream_error' });
        await writer.write(encoder.encode(`data: ${payload}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('[RAG/stream] error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

