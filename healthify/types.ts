/**
 * Shared types for Healthify scrapers and utilities
 */

export type ScrapedPage = {
  title: string;
  content: string;
  url: string;
};

export type ScrapeResult = {
  success: boolean;
  pages: ScrapedPage[];
  errors: string[];
};

export type LightScrapedArticle = {
  title: string;
  url: string;
  contentSummary: string;
  targetAudience: string;
  categories: string[];
};

export type StructuredHealthifyContent = {
  title: string;
  url: string;
  sections: Record<string, string>;
  author?: string;
  lastUpdated?: Date;
  categories?: string[];
  contentType?: string;
  internalLinks?: Array<{ text: string; url: string }>;
  fullContent: string;
};

export type HealthifySearchResult = {
  title: string;
  url: string;
  snippet: string;
};
