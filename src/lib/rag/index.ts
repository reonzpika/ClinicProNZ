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
  // Use overall summary for embedding if available, otherwise basic content or full content
  const textToEmbed = document.overallSummary || document.basicContent || document.content;
  const embedding = await createEmbedding(textToEmbed);

  await db.insert(ragDocuments).values({
    title: document.title,
    content: document.content,
    source: document.source,
    sourceType: document.sourceType,
    embedding,

    // Enhancement tracking
    enhancementStatus: document.enhancementStatus || 'basic',
    basicContent: document.basicContent || null,
    lastEnhanced: document.lastEnhanced || null,

    // Structured content
    sections: document.sections ? JSON.stringify(document.sections) : null,
    overallSummary: document.overallSummary || null,
    sectionSummaries: document.sectionSummaries ? JSON.stringify(document.sectionSummaries) : null,

    // Metadata
    author: document.author || null,
    lastUpdated: document.lastUpdated || null,
    categories: document.categories ? JSON.stringify(document.categories) : null,
    contentType: document.contentType || null,
    medicalSpecialty: document.medicalSpecialty || null,
    targetAudience: document.targetAudience || null,

    // Links
    internalLinks: document.internalLinks ? JSON.stringify(document.internalLinks) : null,
    externalCitations: document.externalCitations ? JSON.stringify(document.externalCitations) : null,
  })
  .onConflictDoUpdate({
    target: ragDocuments.source,
    set: {
      title: document.title,
      content: document.content,
      enhancementStatus: document.enhancementStatus || 'enhanced',
      lastEnhanced: new Date(),
      sections: document.sections ? JSON.stringify(document.sections) : null,
      overallSummary: document.overallSummary || null,
      sectionSummaries: document.sectionSummaries ? JSON.stringify(document.sectionSummaries) : null,
      author: document.author || null,
      lastUpdated: document.lastUpdated || null,
      categories: document.categories ? JSON.stringify(document.categories) : null,
      contentType: document.contentType || null,
      medicalSpecialty: document.medicalSpecialty || null,
      targetAudience: document.targetAudience || null,
      internalLinks: document.internalLinks ? JSON.stringify(document.internalLinks) : null,
      externalCitations: document.externalCitations ? JSON.stringify(document.externalCitations) : null,
      embedding,
      updatedAt: new Date(),
    },
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
