#!/usr/bin/env tsx

import { searchSimilarDocuments, formatContextForRag } from '../src/lib/rag';

async function runQuery(q: string): Promise<void> {
  const results = await searchSimilarDocuments(q, 5, 0.65);
  console.log(`\n=== Query: ${q} ===`);
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const snippet = r.content.slice(0, 220).replace(/\s+/g, ' ');
    console.log(`#${i + 1} [${r.score.toFixed(3)}] ${r.title}`);
    console.log(`Source: ${r.source}`);
    console.log(`Snippet: ${snippet}...\n`);
  }
}

async function main(): Promise<void> {
  await runQuery('abdominal pain red flags');
  await runQuery('self-care steps for mild abdominal pain');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[TEST-RAG] Error:', err);
    process.exit(1);
  });
}

