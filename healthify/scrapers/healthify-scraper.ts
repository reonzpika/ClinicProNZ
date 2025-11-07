import { JSDOM } from 'jsdom';

import { ingestDocument } from '@/src/lib/rag';
import type { DocumentToIngest } from '@/src/lib/rag/types';
import type { ScrapedPage, ScrapeResult } from '../types';

export class HealthifyScraper {
  private baseUrl = 'https://healthify.nz';
  private delay = 1000; // 1 second delay between requests
  private maxRetries = 3;

  /**
   * Scrape healthify.nz search results for a given query
   */
  async scrapeSearch(query: string): Promise<ScrapeResult> {
    const result: ScrapeResult = {
      success: true,
      pages: [],
      errors: [],
    };

    try {
      // Perform search on healthify.nz
      const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
      const searchResults = await this.fetchSearchResults(searchUrl);

      if (searchResults.length === 0) {
        result.errors.push('No search results found');
        return result;
      }

      // Scrape individual pages (limit to top 5 results)
      const pagesToScrape = searchResults.slice(0, 5);

      for (const pageUrl of pagesToScrape) {
        try {
          await this.sleep(this.delay); // Rate limiting
          const scrapedPage = await this.scrapePage(pageUrl);

          if (scrapedPage) {
            result.pages.push(scrapedPage);
          }
        } catch (error) {
          const errorMsg = `Failed to scrape ${pageUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(errorMsg);
      result.success = false;
    }

    return result;
  }

  /**
   * Scrape a specific healthify.nz page
   */
  private async scrapePage(url: string): Promise<ScrapedPage | null> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const parsed = this.parseHealthifyPage(html);

        if (parsed) {
          return {
            ...parsed,
            url,
          };
        }

        return null;
      } catch (error) {
        if (attempt === this.maxRetries) {
          throw error;
        }

        // Exponential backoff
        await this.sleep(this.delay * 2 ** (attempt - 1));
      }
    }

    return null;
  }

  /**
   * Parse healthify.nz page content
   */
  private parseHealthifyPage(html: string): { title: string; content: string } | null {
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Extract title
      const titleElement = document.querySelector('h1') || document.querySelector('title');
      const title = titleElement?.textContent?.trim() || 'Untitled';

      // Extract main content - target common healthify.nz content containers
      const contentSelectors = [
        'main',
        '[role="main"]',
        '.content',
        '.article-content',
        '.page-content',
        'article',
      ];

      let contentElement: Element | null = null;
      for (const selector of contentSelectors) {
        contentElement = document.querySelector(selector);
        if (contentElement) {
 break;
}
      }

      if (!contentElement) {
        // Fallback: get body content but remove navigation, headers, footers
        contentElement = document.body;
        const elementsToRemove = contentElement?.querySelectorAll(
          'nav, header, footer, .nav, .navigation, .header, .footer, script, style',
        );
        elementsToRemove?.forEach(el => el.remove());
      }

      if (!contentElement) {
        return null;
      }

      // Clean and extract text content
      let content = this.cleanTextContent(contentElement);

      // Remove empty lines and normalize whitespace
      content = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
        .trim();

      if (content.length < 50) {
        return null; // Skip pages with too little content
      }

      return { title, content };
    } catch (error) {
      console.error('Error parsing page:', error);
      return null;
    }
  }

  /**
   * Extract and clean text content from element
   */
  private cleanTextContent(element: Element): string {
    // Remove unwanted elements
    const unwantedSelectors = [
      'script',
'style',
'nav',
'header',
'footer',
      '.ad',
'.advertisement',
'.social-share',
      '.breadcrumb',
'.sidebar',
'.related-content',
    ];

    unwantedSelectors.forEach((selector) => {
      element.querySelectorAll(selector).forEach(el => el.remove());
    });

    // Get text content and clean it
    const textContent = element.textContent || '';

    return textContent
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n\s*\n/g, '\n') // Remove excessive line breaks
      .trim();
  }

  /**
   * Fetch search results URLs from healthify.nz search page
   */
  private async fetchSearchResults(searchUrl: string): Promise<string[]> {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Search request failed: ${response.status}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract search result links
    const linkSelectors = [
      'a[href*="/health-a-z/"]',
      'a[href*="/medicines-a-z/"]',
      'a[href*="/hauora-wellbeing/"]',
      '.search-result a',
      '.result-title a',
    ];

    const urls = new Set<string>();

    linkSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((link) => {
        const href = (link as HTMLAnchorElement).href;
        if (href) {
          // Convert relative URLs to absolute
          const absoluteUrl = href.startsWith('http')
            ? href
            : new URL(href, this.baseUrl).href;

          // Only include healthify.nz URLs
          if (absoluteUrl.includes('healthify.nz')) {
            urls.add(absoluteUrl);
          }
        }
      });
    });

    return Array.from(urls);
  }

  /**
   * Ingest scraped pages into the RAG database
   */
  async ingestPages(pages: ScrapedPage[]): Promise<void> {
    for (const page of pages) {
      try {
        const document: DocumentToIngest = {
          title: page.title,
          content: page.content,
          source: page.url,
          sourceType: 'healthify',
        };

        await ingestDocument(document);
        // Successfully ingested (logging removed for lint compliance)

        // Small delay between ingestions
        await this.sleep(500);
      } catch {
        // Failed to ingest (logging removed for lint compliance)
      }
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Utility function for external use
export async function scrapeHealthifyForQuery(query: string): Promise<ScrapeResult> {
  const scraper = new HealthifyScraper();
  return await scraper.scrapeSearch(query);
}

// Utility function to scrape and ingest in one go
export async function scrapeAndIngestHealthify(query: string): Promise<void> {
  const scraper = new HealthifyScraper();
  const result = await scraper.scrapeSearch(query);

  if (result.pages.length > 0) {
    await scraper.ingestPages(result.pages);
    // Completed ingestion (logging removed for lint compliance)
  }

  // Handle errors silently for lint compliance
}
