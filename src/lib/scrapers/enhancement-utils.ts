import type { RagQueryResult } from '../rag/types';

/**
 * Check which articles need enhancement
 */
export async function checkEnhancementStatus(articles: RagQueryResult[]): Promise<RagQueryResult[]> {
  try {
    const { db } = await import('../../../database/client');
    const { ragDocuments } = await import('../../../database/schema/rag');
    const { inArray } = await import('drizzle-orm');

    // Get current enhancement status for all articles
    const sources = articles.map(article => article.source);

    const enhancementStatuses = await db
      .select({
        source: ragDocuments.source,
        enhancementStatus: ragDocuments.enhancementStatus,
      })
      .from(ragDocuments)
      .where(inArray(ragDocuments.source, sources));

    // Create status map
    const statusMap = new Map(
      enhancementStatuses.map(row => [row.source, row.enhancementStatus]),
    );

    // Filter articles that need enhancement
    return articles.filter((article) => {
      const status = statusMap.get(article.source);
      return status === 'basic' || !status; // Enhance if basic or missing
    });
  } catch (error) {
    console.error('[ENHANCEMENT UTILS] Error checking enhancement status:', error);
    // If check fails, assume all need enhancement
    return articles;
  }
}

/**
 * Update enhancement status for an article
 */
export async function updateEnhancementStatus(
  source: string,
  status: 'basic' | 'enhanced' | 'failed',
): Promise<void> {
  try {
    const { db } = await import('../../../database/client');
    const { ragDocuments } = await import('../../../database/schema/rag');
    const { eq } = await import('drizzle-orm');

    await db
      .update(ragDocuments)
      .set({
        enhancementStatus: status,
        lastEnhanced: status === 'enhanced' ? new Date() : null,
      })
      .where(eq(ragDocuments.source, source));
  } catch (error) {
    console.error('[ENHANCEMENT UTILS] Error updating enhancement status:', error);
  }
}
