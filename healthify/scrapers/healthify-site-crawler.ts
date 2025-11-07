import { JSDOM } from 'jsdom';

import { ingestDocument } from '@/src/lib/rag';
import type { DocumentToIngest } from '@/src/lib/rag/types';
import type { LightScrapedArticle } from '../types';

export class HealthifySiteCrawler {
  private baseUrl = 'https://healthify.nz';
  private delay = 1000; // 1 second between requests
  private maxRetries = 3;

  /**
   * Main crawling workflow: crawl entire site and create basic index
   */
  async crawlEntireSite(): Promise<void> {
    console.log('[SITE CRAWLER] Starting comprehensive Healthify site crawl');

    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let totalArticles = 0;
    let successfulArticles = 0;
    let failedArticles = 0;

    for (const letter of letters) {
      try {
        console.log(`[SITE CRAWLER] Processing letter: ${letter.toUpperCase()}`);
        const articleUrls = await this.getArticleUrlsForLetter(letter);
        console.log(`[SITE CRAWLER] Found ${articleUrls.length} articles for letter ${letter}`);

        for (const url of articleUrls) {
          totalArticles++;

          try {
            // Check if article already exists
            const exists = await this.checkIfArticleExists(url);
            if (exists) {
              console.log(`[SITE CRAWLER] Skipping existing article: ${url}`);
              continue;
            }

            const article = await this.lightScrapeArticle(url);
            if (article) {
              await this.ingestLightScrapedArticle(article);
              successfulArticles++;
              console.log(`[SITE CRAWLER] ✅ Ingested: ${article.title}`);
            } else {
              failedArticles++;
              console.log(`[SITE CRAWLER] ❌ Failed to scrape: ${url}`);
            }

            // Respectful delay
            await this.sleep(this.delay);
          } catch (error) {
            failedArticles++;
            console.error(`[SITE CRAWLER] Error processing ${url}:`, error);
          }
        }

        // Longer delay between letters
        await this.sleep(this.delay * 2);
      } catch (error) {
        console.error(`[SITE CRAWLER] Error processing letter ${letter}:`, error);
      }
    }

    console.log(`[SITE CRAWLER] Crawl complete!`);
    console.log(`[SITE CRAWLER] Total articles: ${totalArticles}`);
    console.log(`[SITE CRAWLER] Successful: ${successfulArticles}`);
    console.log(`[SITE CRAWLER] Failed: ${failedArticles}`);
  }

  /**
   * Get all article URLs for a specific letter
   */
  private async getArticleUrlsForLetter(letter: string): Promise<string[]> {
    const letterPageUrl = `${this.baseUrl}/health-a-z/${letter}`;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(letterPageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        return this.extractArticleUrls(html);
      } catch {
        if (attempt === this.maxRetries) {
          console.error(`[SITE CRAWLER] Failed to fetch ${letterPageUrl} after ${this.maxRetries} attempts`);
          return [];
        }
        await this.sleep(this.delay * 2 ** (attempt - 1));
      }
    }
    return [];
  }

  /**
   * Extract article URLs from letter page HTML
   */
  private extractArticleUrls(html: string): string[] {
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Look for links to health-a-z articles
      const links = document.querySelectorAll('a[href*="/health-a-z/"]');
      const urls: string[] = [];

      for (const link of links) {
        const href = link.getAttribute('href');
        if (!href) {
 continue;
}

        // Convert relative URLs to absolute
        const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;

        // Filter for actual article URLs (not letter index pages)
        if (this.isValidHealthifyArticleUrl(fullUrl)) {
          urls.push(fullUrl);
        }
      }

      // Remove duplicates
      return [...new Set(urls)];
    } catch (error) {
      console.error('[SITE CRAWLER] Error extracting article URLs:', error);
      return [];
    }
  }

  /**
   * Validate if URL is a proper healthify article (not index page)
   */
  private isValidHealthifyArticleUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return (
        parsedUrl.hostname === 'healthify.nz'
        && parsedUrl.pathname.includes('/health-a-z/')
        && !parsedUrl.pathname.endsWith('/health-a-z/') // Avoid index pages
        && parsedUrl.pathname.split('/').length > 3 // Ensure it's a specific article
        && !parsedUrl.pathname.includes('#') // Avoid anchor links
      );
    } catch {
      return false;
    }
  }

  /**
   * Light scrape: extract title, summary, target audience, categories only
   */
  private async lightScrapeArticle(url: string): Promise<LightScrapedArticle | null> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        return this.parseLightContent(html, url);
      } catch (error) {
        if (attempt === this.maxRetries) {
          console.error(`[SITE CRAWLER] Failed to scrape ${url} after ${this.maxRetries} attempts:`, error);
          return null;
        }
        await this.sleep(this.delay * 2 ** (attempt - 1));
      }
    }
    return null;
  }

  /**
   * Extract light content from HTML
   */
  private parseLightContent(html: string, url: string): LightScrapedArticle | null {
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Extract title
      const titleElement = document.querySelector('h1') || document.querySelector('title');
      const title = titleElement?.textContent?.trim() || 'Untitled Article';

      // Extract content summary (first 2-3 paragraphs)
      const contentElement = document.querySelector('main') || document.querySelector('[role="main"]') || document.querySelector('.content');

      let contentSummary = '';
      if (contentElement) {
        const paragraphs = contentElement.querySelectorAll('p');
        const summaryParagraphs = Array.from(paragraphs)
          .slice(0, 3)
          .map(p => p.textContent?.trim())
          .filter(text => text && text.length > 20);

        contentSummary = summaryParagraphs.join(' ').slice(0, 800);
      }

      // Extract target audience (default to patients for healthify)
      const targetAudience = 'patients';

            // Categories will be enhanced during AI analysis phase
      const categories: string[] = [];

      return {
        title,
        url,
        contentSummary,
        targetAudience,
        categories,
      };
    } catch (error) {
      console.error(`[SITE CRAWLER] Error parsing ${url}:`, error);
      return null;
    }
  }

  /**
   * Convert light scraped article to document and ingest
   */
  private async ingestLightScrapedArticle(article: LightScrapedArticle): Promise<void> {
    const document: DocumentToIngest = {
      title: article.title,
      content: article.contentSummary,
      source: article.url,
      sourceType: 'healthify',

      // Enhancement tracking
      enhancementStatus: 'basic',
      basicContent: article.contentSummary,

      // Basic metadata
      targetAudience: article.targetAudience,
      categories: article.categories,
      contentType: 'article',
    };

    await ingestDocument(document);
  }

  /**
   * Check if article already exists in database
   */
  private async checkIfArticleExists(url: string): Promise<boolean> {
    try {
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
      console.error('[SITE CRAWLER] Failed to check if article exists:', error);
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

// Utility functions for external use
export async function crawlHealthifySite(): Promise<void> {
  const crawler = new HealthifySiteCrawler();
  await crawler.crawlEntireSite();
}
