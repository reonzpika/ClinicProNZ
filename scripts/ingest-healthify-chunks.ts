#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';

import { ingestDocument } from '../src/lib/rag';
import type { DocumentToIngest } from '../src/lib/rag/types';

type ChunkJson = {
  url: string;
  title?: string;
  content: string;
  chunkIndex: number;
  metadata?: { lastUpdated?: string; [k: string]: unknown };
};

async function readChunkFiles(dir: string): Promise<ChunkJson[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.json'))
      .map((e) => path.join(dir, e.name));
    const results: ChunkJson[] = [];
    for (const file of files) {
      try {
        const raw = await fs.readFile(file, 'utf8');
        results.push(JSON.parse(raw) as ChunkJson);
      } catch (err) {
        console.warn(`[INGEST-CHUNKS] Malformed JSON skipped: ${path.basename(file)}`);
      }
    }
    return results;
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      console.warn(`[INGEST-CHUNKS] Directory not found: ${dir}`);
      return [];
    }
    throw err;
  }
}

async function main(): Promise<void> {
  if (!process.env.OPENAI_API_KEY) {
    console.error('[INGEST-CHUNKS] Missing OPENAI_API_KEY');
    process.exit(1);
  }

  const dir = path.resolve(process.cwd(), 'data_chunks');
  console.log(`[INGEST-CHUNKS] Reading chunks from ${dir}`);
  const chunks = await readChunkFiles(dir);
  console.log(`[INGEST-CHUNKS] Found ${chunks.length} chunks`);

  let ingested = 0;
  let failed = 0;
  for (const ch of chunks) {
    if (!ch.url || !ch.content || typeof ch.chunkIndex !== 'number') {
      failed++;
      continue;
    }
    const lastUpdated = ch.metadata?.lastUpdated ? new Date(ch.metadata.lastUpdated) : undefined;
    const doc: DocumentToIngest = {
      title: ch.title || 'Untitled',
      content: ch.content,
      source: ch.url,
      sourceType: 'healthify',
      lastUpdated,
      enhancementStatus: 'basic',
    };
    try {
      await ingestDocument(doc, { chunkIndex: ch.chunkIndex });
      ingested++;
      if (ingested % 50 === 0) {
        console.log(`[INGEST-CHUNKS] Ingested ${ingested}/${chunks.length}`);
      }
    } catch (err) {
      failed++;
      console.error(`[INGEST-CHUNKS] Failed chunk ${ch.url}#${ch.chunkIndex}:`, (err as Error)?.message || err);
    }
  }
  console.log(`\n[INGEST-CHUNKS] Done. Ingested: ${ingested}, Failed: ${failed}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[INGEST-CHUNKS] Fatal error:', err);
    process.exit(1);
  });
}

