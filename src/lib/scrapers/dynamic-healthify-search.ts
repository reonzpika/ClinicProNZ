import { JSDOM } from 'jsdom';

import { EnhancedHealthifyScraper } from './enhanced-healthify-scraper';

type HealthifySearchResult = {
  title: string;
  url: string;
  snippet: string;
};

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

  /**
   * Direct search on healthify.nz
   */
  async searchHealthifyDirect(query: string, maxResults: number): Promise<HealthifySearchResult[]> {
    const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
    console.log(`[HEALTHIFY SEARCH] Searching: ${searchUrl}`);

    try {
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      if (!response.ok) {
        console.error(`[HEALTHIFY SEARCH] Request failed with status: ${response.status}`);
        throw new Error(`Search request failed: ${response.status}`);
      }

      const html = await response.text();
      console.log(`[HEALTHIFY SEARCH] Received ${html.length} chars of HTML`);
      const results = this.parseSearchResults(html, maxResults);
      console.log(`[HEALTHIFY SEARCH] Found ${results.length} results`);
      return results;
    } catch (error) {
      console.error('Healthify direct search failed:', error);
      return [];
    }
  }

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
          results.push({
            title: this.generateTitleFromUrl(url),
            url,
            snippet: `Information about ${query} from Healthify NZ`,
          });

          if (results.length >= maxResults) {
 break;
}
        }
      } catch (error) {
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
   * Parse healthify search results page
   */
  private parseSearchResults(html: string, maxResults: number): HealthifySearchResult[] {
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      const results: HealthifySearchResult[] = [];

      // Common selectors for search result links
      const resultSelectors = [
        '.search-result',
        '.search-item',
        '.result-item',
        'article',
        '.content-item',
      ];

      let resultElements: Element[] = [];

      // Try different selectors until we find results
      for (const selector of resultSelectors) {
        resultElements = Array.from(document.querySelectorAll(selector));
        console.log(`[HEALTHIFY PARSE] Selector '${selector}' found ${resultElements.length} elements`);
        if (resultElements.length > 0) {
 break;
}
      }

      // Fallback: look for any links to health-a-z pages
      if (resultElements.length === 0) {
        console.log('[HEALTHIFY PARSE] No structured results, looking for health-a-z links');
        const links = document.querySelectorAll('a[href*="/health-a-z/"]');
        console.log(`[HEALTHIFY PARSE] Found ${links.length} health-a-z links`);
        resultElements = Array.from(links).map((link: Element) => link.closest('div, article, li') || link);
      }

      console.log(`[HEALTHIFY PARSE] Processing ${resultElements.length} elements (max ${maxResults})`);

      for (const element of resultElements.slice(0, maxResults)) {
        const result = this.extractSearchResult(element);
        if (result && this.isValidHealthifyURL(result.url)) {
          console.log(`[HEALTHIFY PARSE] Valid result: ${result.title} - ${result.url}`);
          results.push(result);
        } else if (result) {
          console.log(`[HEALTHIFY PARSE] Invalid URL skipped: ${result.url}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to parse search results:', error);
      return [];
    }
  }

  /**
   * Extract individual search result
   */
  private extractSearchResult(element: Element): HealthifySearchResult | null {
    try {
      // Find the main link
      const linkElement = element.querySelector('a[href*="/health-a-z/"]')
        || element.querySelector('a[href*="healthify.nz"]')
        || (element.tagName === 'A' ? element : null);

      if (!linkElement) {
 return null;
}

      const href = linkElement.getAttribute('href');
      if (!href) {
 return null;
}

      // Convert relative URLs to absolute
      const url = href.startsWith('http') ? href : `${this.baseUrl}${href}`;

      // Extract title
      const titleElement = element.querySelector('h1, h2, h3, h4, .title') || linkElement;
      const title = titleElement?.textContent?.trim() || 'Untitled';

      // Extract snippet/description
      const snippetElement = element.querySelector('p, .description, .excerpt, .summary');
      const snippet = snippetElement?.textContent?.trim() || '';

      return {
        title: this.cleanTitle(title),
        url,
        snippet: snippet.slice(0, 200), // Limit snippet length
      };
    } catch (error) {
      console.error('Failed to extract search result:', error);
      return null;
    }
  }

  /**
   * Clean up title text
   */
  private cleanTitle(title: string): string {
    return title
      .replace(/\s+/g, ' ')
      .replace(/^\W+|\W+$/g, '')
      .trim();
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
      const { db } = await import('../../../database/client');
      const { ragDocuments } = await import('../../../database/schema/rag');
      const { eq } = await import('drizzle-orm');

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
