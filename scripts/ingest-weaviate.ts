#!/usr/bin/env tsx

import { chunk } from 'lodash-es';
import { sql } from 'drizzle-orm';

import { getDb } from '../database/client';
import { ragDocuments } from '../database/schema/rag';
import configureLlamaIndex from '../src/lib/rag/settings';
import { getVectorIndexFromWeaviate } from '../src/lib/rag/li-weaviate-store';

// Minimal type for selected columns
type RagRow = {
  id: string;
  title: string;
  content: string;
  source: string;
  sourceType: string;
  chunkIndex: number;
  lastUpdated: Date | null;
  updatedAt: Date | null;
};

async function loadAllRagRows(): Promise<RagRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: ragDocuments.id,
      title: ragDocuments.title,
      content: ragDocuments.content,
      source: ragDocuments.source,
      sourceType: ragDocuments.sourceType,
      chunkIndex: ragDocuments.chunkIndex,
      lastUpdated: ragDocuments.lastUpdated,
      updatedAt: ragDocuments.updatedAt,
    })
    .from(ragDocuments)
    .orderBy(sql`updated_at ASC`);

  return rows as RagRow[];
}

async function main(): Promise<void> {
  const missing: string[] = [];
  if (!process.env.WEAVIATE_URL) missing.push('WEAVIATE_URL');
  if (!process.env.WEAVIATE_API_KEY) missing.push('WEAVIATE_API_KEY');
  if (!process.env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
  if (missing.length) {
    console.error(`[WEAVIATE INGEST] Missing required env: ${missing.join(', ')}`);
    process.exit(1);
  }

  configureLlamaIndex();
  const LI: any = await import('llamaindex');

  console.log('[WEAVIATE INGEST] Loading RAG rows from database…');
  const rows = await loadAllRagRows();
  console.log(`[WEAVIATE INGEST] Loaded ${rows.length} rows`);

  console.log('[WEAVIATE INGEST] Connecting to Weaviate via LlamaIndex…');
  const { index } = await getVectorIndexFromWeaviate();

  // Convert to LI TextNodes
  const nodes = rows.map((r) =>
    new LI.TextNode({
      id_: r.id,
      text: r.content,
      metadata: {
        url: r.source,
        title: r.title,
        sourceType: r.sourceType,
        chunkIndex: r.chunkIndex,
        lastUpdated: r.lastUpdated ? r.lastUpdated.toISOString() : null,
        updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
      },
    })
  );

  // Insert in batches to control rate limits
  const batchSize = Number(process.env.WEAVIATE_INGEST_BATCH || 64);
  let inserted = 0;
  for (const group of chunk(nodes, batchSize)) {
    try {
      await index.insertNodes(group);
      inserted += group.length;
      console.log(`[WEAVIATE INGEST] Inserted ${inserted}/${nodes.length}`);
    } catch (err) {
      console.error('[WEAVIATE INGEST] Batch insert failed:', (err as Error)?.message || err);
    }
  }

  console.log(`[WEAVIATE INGEST] Done. Inserted total: ${inserted}/${nodes.length}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[WEAVIATE INGEST] Fatal error:', err);
    process.exit(1);
  });
}
