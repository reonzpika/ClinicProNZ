#!/usr/bin/env tsx

import { searchSimilarDocuments } from '../src/lib/rag';

async function runQuery(q: string): Promise<void> {
  const results = await searchSimilarDocuments(q, 5, 0.35);
  console.log(`\n=== Query: ${q} ===`);
  results.forEach((r, idx) => {
    if (!r) return;
    const snippet = (r.content ?? '').slice(0, 220).replace(/\s+/g, ' ');
    const score = typeof r.score === 'number' ? r.score.toFixed(3) : '0.000';
    console.log(`#${idx + 1} [${score}] ${r.title}`);
    console.log(`Source: ${r.source}`);
    console.log(`Snippet: ${snippet}...\n`);
  });
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

