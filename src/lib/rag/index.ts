import { cosineDistance, sql } from 'drizzle-orm';
import OpenAI from 'openai';

import { db } from '../../../database/client';
import { ragDocuments } from '../../../database/schema/rag';
import type { DocumentToIngest, RagQueryResult } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Create embedding for text using OpenAI
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  if (!response.data[0]) {
    throw new Error('No embedding returned from OpenAI');
  }

  return response.data[0].embedding;
}

/**
 * Search for similar documents using vector similarity
 */
export async function searchSimilarDocuments(
  query: string,
  limit: number = 5,
  threshold: number = 0.7,
): Promise<RagQueryResult[]> {
  const queryEmbedding = await createEmbedding(query);

  // Calculate similarity score
  const similarity = sql<number>`1 - (${cosineDistance(ragDocuments.embedding, queryEmbedding)})`;

  const results = await db
    .select({
      id: ragDocuments.id,
      title: ragDocuments.title,
      content: ragDocuments.content,
      source: ragDocuments.source,
      sourceType: ragDocuments.sourceType,
      score: similarity,
    })
    .from(ragDocuments)
    .where(sql`${similarity} > ${threshold}`)
    .orderBy(sql`${similarity} DESC`)
    .limit(limit);

  return results.map(row => ({
    content: row.content,
    title: row.title,
    source: row.source,
    sourceType: row.sourceType,
    score: row.score,
  }));
}

/**
 * Ingest a document into the RAG system
 */
export async function ingestDocument(document: DocumentToIngest): Promise<void> {
  const embedding = await createEmbedding(document.content);

  await db.insert(ragDocuments).values({
    title: document.title,
    content: document.content,
    source: document.source,
    sourceType: document.sourceType,
    embedding,
  });
}

/**
 * Format search results for RAG context
 */
export function formatContextForRag(results: RagQueryResult[]): string {
  if (results.length === 0) {
    return 'No relevant information found in the knowledge base.';
  }

  return results
    .map((result, index) => {
      return `Source ${index + 1}: ${result.title} (${result.sourceType.toUpperCase()})
URL: ${result.source}
Content: ${result.content}
---`;
    })
    .join('\n');
}
