import { cosineDistance, eq, sql } from 'drizzle-orm';
import OpenAI from 'openai';

import { getDb } from '../../../database/client';
import { ragDocuments } from '../../../database/schema/rag';
import type { DocumentToIngest, RagQueryResult } from './types';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey });
}

// Helper: safely coerce JSONB/unknown values into typed objects
function coerceJsonb<T>(value: unknown): T | null {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  if (typeof value === 'object') {
    return value as T;
  }
  return null;
}

/**
 * Create embedding for text using OpenAI
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI();
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
  sourceType?: string,
): Promise<RagQueryResult[]> {
  const queryEmbedding = await createEmbedding(query);
  const db = getDb();

  const results = await db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL ivfflat.probes = 10`);
    // await tx.execute(sql`SET LOCAL enable_seqscan = off`);

    const distance = cosineDistance(ragDocuments.embedding, queryEmbedding);

    const rows = await tx
      .select({
        id: ragDocuments.id,
        title: ragDocuments.title,
        content: ragDocuments.content,
        source: ragDocuments.source,
        sourceType: ragDocuments.sourceType,
        distance,
        sectionSummaries: ragDocuments.sectionSummaries,
        overallSummary: ragDocuments.overallSummary,
        sections: ragDocuments.sections,
        enhancementStatus: ragDocuments.enhancementStatus,
      })
      .from(ragDocuments)
      .where(sourceType ? eq(ragDocuments.sourceType, sourceType) : sql`true`)
      .orderBy(distance)
      .limit(limit);

    return rows;
  });

  return results
    .map((row: any) => {
    const sectionSummaries = coerceJsonb<Record<string, string[]>>(row.sectionSummaries);
    const sections = coerceJsonb<Record<string, string>>(row.sections);
      const score = 1 - Number(row.distance);
      if (score < threshold) {
        return null;
      }
      return {
        content: row.content,
        title: row.title,
        source: row.source,
        sourceType: row.sourceType,
        score,
        sectionSummaries,
        overallSummary: row.overallSummary,
        sections,
        enhancementStatus: row.enhancementStatus,
      } as RagQueryResult;
    })
    .filter(Boolean) as RagQueryResult[];
}

/**
 * Ingest a document into the RAG system
 */
export async function ingestDocument(document: DocumentToIngest): Promise<void> {
  // Use overall summary for embedding if available, otherwise basic content or full content
  const textToEmbed = document.overallSummary || document.basicContent || document.content;
  const embedding = await createEmbedding(textToEmbed);

  const db = getDb();
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
