import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// HYBRID STACK NOTE:
// Use LlamaIndex for everything else in the pipeline:
// - Chunking (semantic, markdown-aware), retrievers, rerankers
// - Query/chat engines, memory, agents
// - Provider adapters/integration
// We only use Vercel AI SDK here for HTTP streaming ergonomics (SSE helpers).
// If you later move away from Vercel AI SDK, replace streamText/toAIStreamResponse below.

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

import { formatContextForRag, searchSimilarDocuments } from '@/src/lib/rag';

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userTier = (sessionClaims as any)?.metadata?.tier || 'basic';
    if (userTier === 'basic') {
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
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: [{ role: 'user', content: query }],
      temperature: 0.1,
    });

    return result.toAIStreamResponse();
  } catch (error) {
    console.error('[RAG/stream] error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

