import { JSDOM } from 'jsdom';
import OpenAI from 'openai';

import { ingestDocument } from '@/src/lib/rag';
import type { DocumentToIngest } from '@/src/lib/rag/types';
import { classifyHeadingsHybrid } from '@/src/lib/scrapers/llm-heading-classifier';
import type { StructuredHealthifyContent } from '../types';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey });
}


export class EnhancedHealthifyScraper {
  // private baseUrl = 'https://healthify.nz'; // Currently unused
  private delay = 1000;
  private maxRetries = 3;

  /**
   * Scrape and process a healthify.nz article with structured extraction
   */
  async scrapeArticle(url: string): Promise<StructuredHealthifyContent | null> {
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
        return await this.parseHealthifyArticle(html, url);
      } catch (error) {
        if (attempt === this.maxRetries) {
          throw error;
        }
        await this.sleep(this.delay * 2 ** (attempt - 1));
      }
    }
    return null;
  }

  /**
   * Parse healthify.nz article into structured content
   */
  private async parseHealthifyArticle(html: string, url: string): Promise<StructuredHealthifyContent | null> {
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Extract title
      const titleElement = document.querySelector('h1') || document.querySelector('title');
      const title = titleElement?.textContent?.trim() || 'Untitled';

      // Extract main content area
      const contentElement = document.querySelector('main')
        || document.querySelector('[role="main"]')
        || document.querySelector('.content')
        || document.querySelector('.article-content')
        || document.querySelector('.page-content')
        || document.querySelector('article');

      if (!contentElement) {
        // No content element found - skip this URL
        return null;
      }

      // Found content element for processing

      // Extract sections based on healthify.nz structure using hybrid AI classification
      const sections = await this.extractSections(contentElement);

      // Get full content for analysis
      const fullContent = this.cleanTextContent(contentElement);

      if (fullContent.length < 100) {
        return null; // Skip pages with too little content
      }

      // Extract metadata
      const author = this.extractAuthor(document);
      const lastUpdated = this.extractLastUpdated(document);
      const categories = await this.extractCategories(url, fullContent);
      const contentType = this.inferContentType(title, sections);
      const internalLinks = this.extractInternalLinks(contentElement);

      return {
        title,
        url,
        sections,
        author,
        lastUpdated,
        categories,
        contentType,
        internalLinks,
        fullContent,
      };
    } catch (error) {
      console.error('Error parsing healthify article:', error);
      return null;
    }
  }

  /**
   * Extract structured sections from healthify content using hybrid AI classification
   */
  private async extractSections(contentElement: Element): Promise<Record<string, string>> {
    const sections: Record<string, string> = {};

    // Common healthify section headings to look for
    const sectionMappings = {
      symptoms: ['symptoms', 'signs and symptoms', 'what are the symptoms'],
      causes: ['causes', 'what causes', 'risk factors'],
      treatment: ['treatment', 'treatments', 'how is it treated', 'how are', 'treated', 'management', 'self-care'],
      diagnosis: ['diagnosis', 'how is it diagnosed', 'how are', 'diagnosed', 'tests'],
      when_to_see_doctor: ['when to see', 'seek medical', 'see your doctor', 'get medical help'],
      prevention: ['prevention', 'preventing', 'how to prevent'],
      overview: ['overview', 'what is', 'what are', 'about', 'key points'],
    };

    // Try to find sections by headings (h2, h3, etc.)
    const headingElements = contentElement.querySelectorAll('h2, h3, h4');
    // Process headings found in content

    if (headingElements.length > 0) {
      // Build pairs of heading element and cleaned text, skipping empty texts to keep indices aligned
      const headingPairs = Array.from(headingElements)
        .map(el => ({ element: el, text: el.textContent?.trim() ?? '' }))
        .filter(p => p.text.length > 0);

      const headingTexts = headingPairs.map(p => p.text);

      // Use hybrid classification (pattern matching + LLM)
      const headingClassifications = await classifyHeadingsHybrid(headingTexts, sectionMappings);

      // Extract content for each classified heading
      for (const { element: heading, text: headingText } of headingPairs) {
        const sectionName = headingClassifications[headingText];

        if (sectionName) {
          const sectionContent = this.extractContentAfterHeading(heading);

          if (sectionContent.trim()) {
            // Combine content if section already exists
            if (sections[sectionName]) {
              sections[sectionName] += `\n\n${sectionContent}`;
            } else {
              sections[sectionName] = sectionContent;
            }
          }
        }
      }
    }

    // If no clear sections found, try to extract key points or summary
    if (Object.keys(sections).length === 0) {
      const keyPoints = contentElement.querySelector('.key-points, .summary, .highlights');
      if (keyPoints) {
        sections.overview = this.cleanTextContent(keyPoints);
      }
    }

    return sections;
  }

  /**
   * Extract content that follows a heading
   */
  private extractContentAfterHeading(heading: Element): string {
    const content: string[] = [];
    let nextElement = heading.nextElementSibling;

    while (nextElement && !this.isHeading(nextElement)) {
      const text = this.cleanTextContent(nextElement);
      if (text.trim()) {
        content.push(text);
      }
      nextElement = nextElement.nextElementSibling;
    }

    return content.join('\n').trim();
  }

  /**
   * Check if element is a heading
   */
  private isHeading(element: Element): boolean {
    return ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName);
  }

  /**
   * Extract author information
   */
  private extractAuthor(document: Document): string | undefined {
    const authorSelectors = [
      '[itemprop="author"]',
      '.author',
      '.byline',
      '.reviewer',
      'meta[name="author"]',
    ];

    for (const selector of authorSelectors) {
      const authorElement = document.querySelector(selector);
      if (authorElement) {
        const author = authorElement.getAttribute('content') || authorElement.textContent;
        if (author?.trim()) {
          return author.trim();
        }
      }
    }

    return undefined;
  }

  /**
   * Extract last updated date
   */
  private extractLastUpdated(document: Document): Date | undefined {
    const dateSelectors = [
      'meta[name="last-modified"]',
      'meta[property="article:modified_time"]',
      '.last-updated',
      '.modified-date',
      'time[datetime]',
    ];

    for (const selector of dateSelectors) {
      const dateElement = document.querySelector(selector);
      if (dateElement) {
        const dateStr = dateElement.getAttribute('content')
          || dateElement.getAttribute('datetime')
          || dateElement.textContent;

                 if (dateStr) {
           const date = new Date(dateStr.trim());
           if (!Number.isNaN(date.getTime())) {
             return date;
           }
         }
      }
    }

    return undefined;
  }

  /**
   * Extract categories from URL path and content
   */
  /**
   * Extract categories using AI analysis for comprehensive medical categorization
   */
  private async extractCategories(url: string, fullContent: string): Promise<string[]> {
    // For enhanced articles, use AI to generate comprehensive medical categories
    if (fullContent && fullContent.length > 100) {
      return await this.generateMedicalCategories(fullContent);
    }

    // Fallback to basic URL-based categories for short content
    const categories: Set<string> = new Set();
    const urlPath = new URL(url).pathname;
    const pathParts = urlPath.split('/').filter(part => part && part !== 'health-a-z');
    pathParts.forEach(part => categories.add(part.replace(/-/g, ' ')));

    return Array.from(categories).filter(cat => cat.length > 1);
  }

  /**
   * Generate comprehensive medical categories using AI
   */
  private async generateMedicalCategories(content: string): Promise<string[]> {
    try {
      const prompt = `Analyze this medical content and categorize it with relevant medical classifications:

${content.slice(0, 1000)}...

Generate comprehensive medical categories covering:
1. Medical specialties (cardiology, dermatology, endocrinology, etc.)
2. Body systems (cardiovascular, respiratory, endocrine, etc.) 
3. Condition types (chronic, acute, infectious, genetic, etc.)
4. Demographics (pediatric, geriatric, general, women's health, etc.)
5. Care type (preventive, diagnostic, therapeutic, palliative, etc.)

Return as JSON array of relevant categories. Be specific and medically accurate.
Format: ["category1", "category2", "category3"]`;

      const openai = getOpenAI();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0]?.message?.content?.trim();
      if (response) {
        try {
          // Handle potential markdown wrapping
          let jsonString = response;
          if (jsonString.startsWith('```json')) {
            jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
          } else if (jsonString.startsWith('```')) {
            jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
          }

          const categories = JSON.parse(jsonString);
          return Array.isArray(categories) ? categories.slice(0, 10) : []; // Limit to 10 categories
        } catch {
          // Failed to parse categories JSON - continue with fallback
        }
      }
    } catch {
      // Failed to generate categories - return empty array
    }

    return []; // Return empty array on failure
  }

  /**
   * Infer content type from title and sections
   */
  private inferContentType(title: string, sections: Record<string, string>): string {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('guide') || Object.keys(sections).length > 3) {
      return 'guide';
    } else if (titleLower.includes('fact') || titleLower.includes('overview')) {
      return 'fact sheet';
    } else {
      return 'article';
    }
  }

  /**
   * Extract internal healthify links
   */
  private extractInternalLinks(contentElement: Element): Array<{ text: string; url: string }> {
    const links: Array<{ text: string; url: string }> = [];
    const linkElements = contentElement.querySelectorAll('a[href*="healthify.nz"], a[href^="/"]');

    // Social sharing patterns to exclude
    const socialPatterns = [
      /facebook\.com/,
      /linkedin\.com/,
      /twitter\.com/,
      /email-protection/,
      /share/i,
      /social/i,
    ];

    linkElements.forEach((link) => {
      const href = link.getAttribute('href');
      const text = link.textContent?.trim();

      if (href && text && text.length > 2) {
        const fullUrl = href.startsWith('http') ? href : `https://healthify.nz${href}`;

        // Skip social sharing links
        const isSocialLink = socialPatterns.some(pattern => pattern.test(fullUrl) || pattern.test(text.toLowerCase()));

        // Skip navigation links
        const isNavLink = text.toLowerCase().includes('home')
          || text.toLowerCase().includes('health a-z')
          || text.toLowerCase().includes('menu');

        if (!isSocialLink && !isNavLink) {
          links.push({ text, url: fullUrl });
        }
      }
    });

    return links;
  }

  /**
   * Clean text content
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
      // Healthify-specific unwanted elements
      '.alert',
      '.notification',
      '.banner',
      '.strike-notice',
      '[role="alert"]',
      '.social-links',
      '.share-buttons',
      '.qr-code',
      '.print-button',
    ];

    unwantedSelectors.forEach((selector) => {
      element.querySelectorAll(selector).forEach(el => el.remove());
    });

    let textContent = element.textContent || '';

    // Remove strike/notification patterns (starts with "Nurses at Health NZ")
    textContent = textContent.replace(/^[^.]*strike[^.]*\.\s*/i, '');
    textContent = textContent.replace(/^[^.]*Emergency departments[^.]*\.\s*/i, '');
    textContent = textContent.replace(/^×\s*/, ''); // Remove close button text

    return textContent.replace(/\s+/g, ' ').trim();
  }

  /**
   * Generate summaries using OpenAI
   */
  async generateSummaries(content: StructuredHealthifyContent): Promise<{
    overallSummary: string;
    sectionSummaries: Record<string, string[]>;
  }> {
    // Generate overall summary
    const overallSummary = await this.generateOverallSummary(content);

    // Generate section-specific summaries
    const sectionSummaries: Record<string, string[]> = {};

    for (const [sectionName, sectionContent] of Object.entries(content.sections)) {
      if (sectionContent.trim()) {
        sectionSummaries[sectionName] = await this.generateSectionSummary(sectionName, sectionContent);
      }
    }

    return { overallSummary, sectionSummaries };
  }

  /**
   * Generate overall article summary
   */
  private async generateOverallSummary(content: StructuredHealthifyContent): Promise<string> {
    const contentToSummarize = Object.keys(content.sections).length > 0
      ? Object.entries(content.sections).map(([section, text]) => `${section}: ${text}`).join('\n\n')
      : content.fullContent;

    const prompt = `Create a concise medical summary for "${content.title}" suitable for clinical search.

Content to summarize:
${contentToSummarize}

Generate a professional summary that:
- Is 3-5 bullet points maximum
- Uses NZ medical terminology
- Focuses on key clinical information (symptoms, treatment, when to seek care)
- Is suitable for GP/healthcare professional use
- Each point should be 1-2 sentences

Format as bullet points with • at the start of each point.`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  }

  /**
   * Generate section-specific summary
   */
  private async generateSectionSummary(sectionName: string, sectionContent: string): Promise<string[]> {
    const prompt = `Extract 2-3 key points from this ${sectionName} section:

${sectionContent}

Return only the key points as a JSON array of strings. Each point should be:
- 1 sentence maximum
- Clinically relevant
- Using NZ medical terminology

Example format: ["Point 1", "Point 2", "Point 3"]`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content?.trim();

    try {
      const points = JSON.parse(response || '[]');
      return Array.isArray(points) ? points : [];
    } catch {
      // Fallback: split by common delimiters
      return response?.split(/[.\n•-]/).filter(point => point.trim()).slice(0, 3) || [];
    }
  }

  /**
   * Complete workflow: scrape, summarize, and ingest
   */
  async scrapeAndIngest(url: string): Promise<void> {
    const content = await this.scrapeArticle(url);
    if (!content) {
      throw new Error('Failed to scrape content from URL');
    }

    const { overallSummary, sectionSummaries } = await this.generateSummaries(content);

    const document: DocumentToIngest = {
      title: content.title,
      content: content.fullContent,
      source: content.url,
      sourceType: 'healthify',

      sections: Object.keys(content.sections).length > 0 ? content.sections : undefined,
      overallSummary,
      sectionSummaries: Object.keys(sectionSummaries).length > 0 ? sectionSummaries : undefined,

      author: content.author,
      lastUpdated: content.lastUpdated,
      categories: content.categories,
      contentType: content.contentType,
      targetAudience: 'patients',

      internalLinks: content.internalLinks,
    };

    await ingestDocument(document);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Utility functions for external use
export async function scrapeHealthifyArticle(url: string): Promise<void> {
  const scraper = new EnhancedHealthifyScraper();
  await scraper.scrapeAndIngest(url);
}
