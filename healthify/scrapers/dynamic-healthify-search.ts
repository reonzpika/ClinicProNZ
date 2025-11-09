import type { HealthifySearchResult } from '../types';
import { EnhancedHealthifyScraper } from './enhanced-healthify-scraper';

export class DynamicHealthifySearch {
  private scraper = new EnhancedHealthifyScraper();
  private baseUrl = 'https://healthify.nz';

  /**
   * Dynamic workflow: search healthify → scrape articles → ingest → return results
   */
  async searchAndIngest(query: string, maxResults: number = 3): Promise<HealthifySearchResult[]> {
    try {
      // 1. Search healthify.nz for the query
      const searchResults = await this.searchHealthify(query, maxResults);

      if (searchResults.length === 0) {
        return [];
      }

      // 2. Scrape and ingest each article
      const ingestedResults: HealthifySearchResult[] = [];

      for (const result of searchResults) {
        try {
          // Check if we already have this URL in our database
          const exists = await this.checkIfArticleExists(result.url);

          if (!exists) {
            await this.scraper.scrapeAndIngest(result.url);
          }

          ingestedResults.push(result);

          // Small delay to be respectful
          await this.sleep(1000);
        } catch (error) {
          // Log error but continue with other articles
          console.error(`Failed to process ${result.url}:`, error);
        }
      }

      return ingestedResults;
    } catch (error) {
      console.error('Dynamic search failed:', error);
      return [];
    }
  }

  /**
   * Search healthify.nz and return relevant article URLs
   */
  private async searchHealthify(query: string, maxResults: number): Promise<HealthifySearchResult[]> {
    // Skip the broken HTML scraping approach, go directly to URL patterns
    console.log(`[HEALTHIFY SEARCH] Using URL pattern matching for "${query}" (Swiftype JS search not scrapeable)`);

    try {
      const results = await this.searchHealthifyKnownPatterns(query, maxResults);
      if (results.length > 0) {
        console.log(`[HEALTHIFY SEARCH] Found ${results.length} results with URL pattern approach`);
        return results;
      }
    } catch (error) {
      console.error('URL pattern search failed:', error);
    }

    return [];
  }

  // (Direct search removed; Healthify uses client-side Swiftype)

    /**
     * Try known URL patterns for common medical topics
     */
  private async searchHealthifyKnownPatterns(query: string, maxResults: number): Promise<HealthifySearchResult[]> {
    const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const firstLetter = normalizedQuery.charAt(0);

    // Expanded patterns for healthify URLs - more comprehensive
    const patterns = [
      // Basic patterns
      `${this.baseUrl}/health-a-z/${firstLetter}/${normalizedQuery}`,
      `${this.baseUrl}/health-a-z/${firstLetter}/${normalizedQuery}-overview`,
      `${this.baseUrl}/health-a-z/${firstLetter}/${normalizedQuery}-topics`,

      // Management and treatment
      `${this.baseUrl}/health-a-z/${firstLetter}/${normalizedQuery}-management`,
      `${this.baseUrl}/health-a-z/${firstLetter}/${normalizedQuery}-management-topics`,
      `${this.baseUrl}/health-a-z/${firstLetter}/${normalizedQuery}-treatment`,

      // Type variants
      `${this.baseUrl}/health-a-z/${firstLetter}/${normalizedQuery}-type-1`,
      `${this.baseUrl}/health-a-z/${firstLetter}/${normalizedQuery}-type-1-overview`,
      `${this.baseUrl}/health-a-z/${firstLetter}/${normalizedQuery}-type-1-topics`,
      `${this.baseUrl}/health-a-z/${firstLetter}/${normalizedQuery}-type-2`,
      `${this.baseUrl}/health-a-z/${firstLetter}/${normalizedQuery}-type-2-overview`,
      `${this.baseUrl}/health-a-z/${firstLetter}/${normalizedQuery}-type-2-topics`,
      `${this.baseUrl}/health-a-z/${firstLetter}/${normalizedQuery}-type-2-medicines`,

      // Testing and monitoring
      `${this.baseUrl}/health-a-z/${firstLetter}/${normalizedQuery}-blood-glucose-testing`,
      `${this.baseUrl}/health-a-z/${firstLetter}/${normalizedQuery}-home-blood-glucose-testing`,
    ];

    const results: HealthifySearchResult[] = [];
    console.log(`[HEALTHIFY PATTERNS] Trying ${patterns.length} URL patterns for "${query}"`);

    for (const url of patterns) {
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (response.ok) {
          console.log(`[HEALTHIFY PATTERNS] Found valid page: ${url}`);
          if (!this.isValidHealthifyURL(url)) {
            continue;
          }
          results.push({
            title: this.generateTitleFromUrl(url),
            url,
            snippet: `Information about ${query} from Healthify NZ`,
          });

          if (results.length >= maxResults) {
 break;
}
        }
      } catch {
        // Continue with next pattern
        continue;
      }
    }

    return results;
  }

  /**
   * Generate a reasonable title from URL
   */
  private generateTitleFromUrl(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      const segments = pathname.split('/');
      const articleSlug = segments[segments.length - 1] || segments[segments.length - 2] || '';
      return articleSlug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    } catch {
      return 'Healthify Article';
    }
  }

  /**
   * Validate if URL is a proper healthify article
   */
  private isValidHealthifyURL(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname === 'healthify.nz'
        && parsedUrl.pathname.includes('/health-a-z/')
        && !parsedUrl.pathname.endsWith('/health-a-z/') // Avoid index pages
        && parsedUrl.pathname.split('/').length > 3; // Ensure it's a specific article
    } catch {
      return false;
    }
  }

  /**
   * Check if article already exists in database
   */
  private async checkIfArticleExists(url: string): Promise<boolean> {
    try {
      // Import here to avoid circular dependencies
      const { getDb } = await import('@/db/client');
      const { ragDocuments } = await import('@/db/schema/rag');
      const { eq } = await import('drizzle-orm');

      const db = getDb();
      const existing = await db
        .select({ id: ragDocuments.id })
        .from(ragDocuments)
        .where(eq(ragDocuments.source, url))
        .limit(1);

      return existing.length > 0;
    } catch (error) {
      console.error('Failed to check if article exists:', error);
      return false; // If check fails, proceed to scrape anyway
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Utility function for external use
 */
export async function dynamicHealthifySearch(query: string, maxResults: number = 3): Promise<HealthifySearchResult[]> {
  const searcher = new DynamicHealthifySearch();
  return await searcher.searchAndIngest(query, maxResults);
}
