import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// HYBRID STACK NOTE:
// Use LlamaIndex for everything else in the pipeline:
// - Chunking (semantic, markdown-aware), retrievers, rerankers
// - Query/chat engines, memory, agents
// - Provider adapters/integration
// We only use streaming here; response format is SSE with {type:'response.delta', delta}.

import OpenAI from 'openai';

import { formatContextForRag, searchSimilarDocuments } from '@/src/lib/rag';
import configureLlamaIndex from '@/src/lib/rag/settings';
import { getVectorIndexFromPg } from '@/src/lib/rag/li-pgvector-store';
import { clinicalSystemPrompt, sourcesFromRagResults, sourcesFromLiNodes } from '@/src/lib/rag/prompts';

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
    const relevantDocs = await searchSimilarDocuments(query, 3, 0.3);
    const context = formatContextForRag(relevantDocs).slice(0, 4000);

    const systemPrompt = clinicalSystemPrompt();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response('Missing OPENAI_API_KEY', { status: 500 });
    }

    const openaiClient = new OpenAI({ apiKey });

    // Create SSE stream
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Prepare source metadata for client UI
    const sources = sourcesFromRagResults(relevantDocs, 8);

    // Early heartbeat to keep connection active
    await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'started' })}\n\n`));

    // Attempt LlamaIndex query engine streaming first; fallback to OpenAI streaming
    (async () => {
      try {
        let usedLlamaIndex = false;
        try {
          // Configure LlamaIndex providers and attempt streaming via LI QueryEngine
          configureLlamaIndex();
          const LI: any = await import('llamaindex');

          // Build LI VectorStoreIndex from PGVector
          const { LI: LI_Any, index } = await getVectorIndexFromPg();

          // Optional: configure reranker
          let reranker: any = undefined;
          const rerankModel = process.env.LI_RERANK_MODEL; // e.g., 'cohere/rerank-3'
          if (rerankModel && LI_Any.Reranker) {
            reranker = new LI_Any.Reranker({ model: rerankModel, topN: 3 });
          }

          // Optional: metadata filters; expect LI_METADATA_FILTERS as JSON like {sourceType:'healthify'}
          let filters: any = undefined;
          const rawFilters = process.env.LI_METADATA_FILTERS;
          if (rawFilters) {
            try { filters = JSON.parse(rawFilters); } catch {}
          }

          const retriever = index.asRetriever({
            similarityTopK: 3,
            filters,
          });

          const queryEngine = LI_Any.RetrieverQueryEngine.fromArgs({
            retriever,
            responseMode: 'compact',
            nodePostprocessors: reranker ? [reranker] : undefined,
          });

          const liPrompt = `${systemPrompt}\n\nQuestion: ${query}`;
          const responseStream = await queryEngine.query({ query: liPrompt, stream: true });

          // Stream tokens from LlamaIndex
          for await (const token of responseStream as AsyncIterable<any>) {
            const delta = token?.delta ?? token?.text ?? token ?? '';
            if (typeof delta === 'string' && delta.length > 0) {
              const payload = JSON.stringify({ type: 'response.delta', delta });
              await writer.write(encoder.encode(`data: ${payload}\n\n`));
            }
          }
          usedLlamaIndex = true;
          try {
            // Pull citations from LI retriever nodes if exposed
            const retrieverAny: any = (queryEngine as any).retriever || undefined;
            if (retrieverAny?.lastNodes) {
              const liSources = sourcesFromLiNodes(retrieverAny.lastNodes, 8);
              await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'sources', sources: liSources })}\n\n`));
            } else {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'sources', sources })}\n\n`));
            }
          } catch {
            await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'sources', sources })}\n\n`));
          }
        } catch (liErr) {
          // Fall back to OpenAI SDK streaming
          usedLlamaIndex = false;
        }

        if (!usedLlamaIndex) {
          const stream = await openaiClient.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: `${systemPrompt}\n\nContext:\n${context}` },
              { role: 'user', content: query },
            ],
            temperature: 0.1,
            stream: true,
          });

          for await (const chunk of stream) {
            const delta = (chunk as any).choices?.[0]?.delta?.content;
            if (typeof delta === 'string' && delta.length > 0) {
              const payload = JSON.stringify({ type: 'response.delta', delta });
              await writer.write(encoder.encode(`data: ${payload}\n\n`));
            }
          }
        }

        // Send sources at end (fallback path already emitted above in LI branch)
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
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

