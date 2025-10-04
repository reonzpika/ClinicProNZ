#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';

import { ingestDocument } from '../src/lib/rag';
import { Document as LlamaDocument, MarkdownNodeParser, SentenceSplitter } from 'llamaindex';
import type { DocumentToIngest } from '../src/lib/rag/types';

type HealthifyJson = {
  url: string;
  title?: string;
  markdown?: string;
  content?: string;
  metadata?: Record<string, unknown> & {
    crawledAt?: string;
    crawled_at?: string;
    date?: string;
    lastModified?: string;
  };
};

async function readHealthifyFiles(dataDir: string): Promise<HealthifyJson[]> {
  try {
    const entries = await fs.readdir(dataDir, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.json'))
      .map((e) => path.join(dataDir, e.name));

    const results: HealthifyJson[] = [];
    for (const file of files) {
      try {
        const raw = await fs.readFile(file, 'utf8');
        const parsed = JSON.parse(raw) as HealthifyJson;
        results.push(parsed);
      } catch (err) {
        console.warn(`[INGEST] Skipping malformed JSON: ${path.basename(file)}:`, (err as Error)?.message);
      }
    }
    return results;
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      console.warn(`[INGEST] Data directory not found at ${dataDir}. Nothing to ingest.`);
      return [];
    }
    throw err;
  }
}

function coerceDate(meta?: HealthifyJson['metadata']): Date | null {
  if (!meta) return null;
  const candidates = [meta.crawledAt, meta.crawled_at, meta.lastModified, meta.date].filter(Boolean) as string[];
  for (const c of candidates) {
    const d = new Date(c as string);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

async function main(): Promise<void> {
  if (!process.env.OPENAI_API_KEY) {
    console.error('[INGEST] Missing OPENAI_API_KEY. Set it before running ingestion.');
    process.exit(1);
  }

  const dataDir = path.resolve(process.cwd(), 'data');
  console.log(`[INGEST] Reading Healthify JSON files from ${dataDir} ...`);
  const items = await readHealthifyFiles(dataDir);
  console.log(`[INGEST] Found ${items.length} files to consider.`);

  let ingested = 0;
  let skipped = 0;
  // Configure LlamaIndex chunking (SentenceSplitter as Semantic not available in JS)
  const splitter = new SentenceSplitter({ chunkSize: 800, chunkOverlap: 120 });
  const mdParser = new MarkdownNodeParser();

  for (const item of items) {
    const text = (item.markdown && item.markdown.trim().length > 0) ? item.markdown : (item.content || '');
    if (!item.url || !text) {
      skipped++;
      continue;
    }
    const lastUpdated = coerceDate(item.metadata || undefined);

    try {
      // Build LlamaIndex Document and get markdown-aware nodes, then split
      const liDoc = new LlamaDocument({ text, metadata: { url: item.url, title: item.title || 'Untitled' } });
      const mdNodes = mdParser.getNodesFromDocuments([liDoc]);
      const nodes = splitter.getNodesFromDocuments(mdNodes);

      let chunkIdx = 0;
      for (const node of nodes) {
        const content = node.getContent ? node.getContent() : (node.text ?? '');
        if (!content || content.trim().length === 0) {
          continue;
        }

        const doc: DocumentToIngest = {
          title: item.title || 'Untitled',
          content,
          source: item.url,
          sourceType: 'healthify',
          lastUpdated: lastUpdated || undefined,
          enhancementStatus: 'basic',
        };

        await ingestDocument(doc, { chunkIndex: chunkIdx });
        chunkIdx++;
        ingested++;
      }

      if ((ingested + skipped) % 50 === 0) {
        console.log(`[INGEST] Progress: processed ${ingested + skipped}/${items.length} files; total chunks ingested: ${ingested}`);
      }
    } catch (err) {
      skipped++;
      console.error(`[INGEST] Failed to ingest ${item.url}:`, (err as Error)?.message || err);
    }
  }

  console.log(`\n[INGEST] Done. Ingested: ${ingested}, Skipped: ${skipped}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[INGEST] Fatal error:', err);
    process.exit(1);
  });
}

