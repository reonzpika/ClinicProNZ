# LlamaIndex RAG Chatbot (Healthify pilot) — Weaviate

## Scope
- Replace legacy RAG with a LlamaIndex-based chatbot
- Use Healthify NZ as first corpus for ingestion and retrieval
- Store vectors and chunks in Weaviate (single class)
- Deliver streaming answers with inline citations; NZ clinical style

## Current state (codebase)
- Ingestion prototypes
  - Python semantic chunker: `scripts/semantic_chunk_healthify.py`
  - TS ingestion (markdown-aware): `scripts/ingest-healthify-a.ts`
  - Raw/processed artefacts: `data/`, `data_chunks/`
- RAG service (to refactor for Weaviate): `app/api/(clinical)/rag/stream/route.ts`
  - Comment notes to use LlamaIndex for chunking/retrieval; currently queries Postgres
- Healthify scrapers (for enhancement/metadata): `src/lib/scrapers/*healthify*`
- Types/abstractions: `src/lib/rag/*`, `database/schema/rag.ts` (legacy)

## Target architecture
- Crawl → Parse → Chunk (markdown + semantic) → Embed (OpenAI) → Upsert to Weaviate
- Query flow
  1. Embed user query
  2. kNN in Weaviate (RagChunk class)
  3. Optional re-rank (LlamaIndex reranker)
  4. Synthesis with strict citation rules
  5. Stream deltas + return unique source list

## Weaviate setup
- Recommended
  - Vectorizer: none (we push OpenAI embeddings)
  - Distance metric: cosine
  - Class: `RagChunk`
- Example schema (conceptual)
  - `title: text`
  - `content: text`            // the chunk body
  - `sourceUrl: text`
  - `sourceType: text`         // e.g., "healthify"
  - `chunkIndex: int`
  - `lastUpdated: date`        // optional
  - `enhancementStatus: text`  // basic|enhanced|failed
  - `overallSummary: text`     // optional
  - `sectionSummaries: text`   // JSON string
  - `sections: text`           // JSON string
  - `categories: text[]`       // optional
  - `author, medicalSpecialty, targetAudience: text`
  - Vector: OpenAI text-embedding-3-small (1536 dims)

## Environment
- Required
  - `OPENAI_API_KEY`
  - `WEAVIATE_HOST` (e.g., https://xxx.weaviate.network)
  - `WEAVIATE_API_KEY` (if secured)
  - `WEAVIATE_CLASS=RagChunk`
  - Optional: `RAG_TOP_K` (default 3), `RAG_THRESHOLD` (0.30–0.40)

## Ingestion
- Input sources
  - `data/*.json`: { url, title, markdown|content, metadata }
  - `data_chunks/*.json`: pre-split chunks with `chunkIndex`
- Chunking strategies
  - Python (preferred for semantic control): `scripts/semantic_chunk_healthify.py`
  - TypeScript (fast, markdown-aware): `scripts/ingest-healthify-a.ts`
- Upsert to Weaviate (high-level)
  1. Build LlamaIndex `Document` → markdown-aware nodes → sentence splitter
  2. For each node: compute embedding (OpenAI) → upsert object with vector
  3. Use id strategy: `${sourceUrl}#${chunkIndex}` to be idempotent

Notes
- Store `sectionSummaries`/`sections` as JSON strings to avoid schema complexity
- Keep `sourceType='healthify'` for filtering/debug
- De-duplicate by (sourceUrl, chunkIndex)

## Retrieval
- Replace DB vector search with Weaviate kNN
  - Compute query embedding
  - `nearVector` (cosine) with filters: optional `sourceType == "healthify"`
  - Return top-k objects with `title, content, sourceUrl`
- Optional LlamaIndex reranker (small k → 8–12) before synthesis

## Synthesis (chat)
- Keep SSE streaming response style in `rag/stream`
- System prompt
  - Use only retrieved context
  - NZ English
  - Inline cite: `[Title](URL)` within bullets
  - End with "Sources" list
- Payload
  - Stream `response.delta`
  - Final `sources: [{title, url}]` (unique)

## Runbook
1. Configure Weaviate (class `RagChunk`, cosine, vectorizer none)
2. Set env vars: `OPENAI_API_KEY`, `WEAVIATE_*`
3. Prepare input (`data/` or `data_chunks/`)
4. Run ingestion script (Python or TS) to upsert chunks to Weaviate
5. Update retrieval in `rag/stream` to query Weaviate (see Implementation)
6. Validate: query typical topics, confirm citations and diversity

## Implementation (delta plan)
- New helpers (TS)
  - `src/lib/weaviate/client.ts` (singleton client)
  - `src/lib/weaviate/rag.ts`:
    - `createEmbedding(text)` → OpenAI
    - `searchSimilarDocumentsWeaviate(query, topK, threshold)` → returns { title, content, sourceUrl, score }
- `app/api/(clinical)/rag/stream/route.ts`
  - Swap `searchSimilarDocuments` → `searchSimilarDocumentsWeaviate`
  - Preserve SSE and citation formatting
- Ingestion scripts
  - Add Weaviate upsert path:
    - Compute embedding, `client.data.creator().withClassName('RagChunk').withId(id).withVector(vec).withProperties({...}).do()`

## Ops & quality
- Access control: Clerk as-is
- Rate limiting: same policy
- Observability: log hit rate, avg score, source distribution
- Re-index
  - Safe to re-upsert with same IDs (idempotent)
  - Track `enhancementStatus` for progressive enrichment

## Open questions for you
- Weaviate
  - Cloud endpoint + auth method?
  - Confirm class name and property names/types?
  - Vectorizer preference: none (external vectors) vs `text2vec-openai` module?
- Embeddings
  - Confirm `text-embedding-3-small` (1536) as standard?
  - Any plan to migrate embeddings later (versioning)?
- Reranking
  - Use LlamaIndex reranker in retrieval path (and which model)?
- Scope
  - Restrict to `healthify` initially, or ingest other NZ sources now?
