#!/usr/bin/env tsx
/**
 * Comprehensive Article Enhancement Script
 * Processes all 1,165 Healthify articles for overnight batch enhancement
 */

import { eq, isNull, or } from 'drizzle-orm';

import { db } from '../database/client';
import { ragDocuments } from '../database/schema/rag';
import { EnhancedHealthifyScraper } from '../src/lib/scrapers/enhanced-healthify-scraper';

type EnhancementProgress = {
  total: number;
  processed: number;
  enhanced: number;
  failed: number;
  skipped: number;
  startTime: Date;
  currentTime: Date;
};

class ComprehensiveEnhancer {
  private scraper: EnhancedHealthifyScraper;
  private progress: EnhancementProgress;
  private batchSize = 5; // Process 5 articles in parallel
  private delayBetweenBatches = 2000; // 2s delay between batches

  constructor() {
    this.scraper = new EnhancedHealthifyScraper();
    this.progress = {
      total: 0,
      processed: 0,
      enhanced: 0,
      failed: 0,
      skipped: 0,
      startTime: new Date(),
      currentTime: new Date(),
    };
  }

  /**
   * Get all articles that need enhancement
   */
  async getArticlesToEnhance(): Promise<Array<{ id: string; source: string; title: string; enhancementStatus: string | null }>> {
    const articles = await db
      .select({
        id: ragDocuments.id,
        source: ragDocuments.source,
        title: ragDocuments.title,
        enhancementStatus: ragDocuments.enhancementStatus,
      })
      .from(ragDocuments)
      .where(
        or(
          eq(ragDocuments.enhancementStatus, 'basic'),
          eq(ragDocuments.enhancementStatus, 'failed'),
          isNull(ragDocuments.enhancementStatus),
        ),
      )
      .orderBy(ragDocuments.id); // Process in order

    return articles;
  }

  /**
   * Process a single article
   */
  async enhanceArticle(article: { id: string; source: string; title: string }): Promise<'enhanced' | 'failed' | 'skipped'> {
    try {
      // Check if it's a valid Healthify URL
      if (!article.source.includes('healthify.nz')) {
        console.log(`[ENHANCER] Skipping non-Healthify URL: ${article.source}`);
        return 'skipped';
      }

      console.log(`[ENHANCER] Processing: ${article.title}`);
      await this.scraper.scrapeAndIngest(article.source);

      // Update status to enhanced
      await db
        .update(ragDocuments)
        .set({
          enhancementStatus: 'enhanced',
          lastEnhanced: new Date(),
        })
        .where(eq(ragDocuments.id, article.id));

      console.log(`[ENHANCER] ✅ Enhanced: ${article.title}`);
      return 'enhanced';
    } catch (error) {
      console.error(`[ENHANCER] ❌ Failed to enhance "${article.title}":`, error);

      // Mark as failed
      await db
        .update(ragDocuments)
        .set({ enhancementStatus: 'failed' })
        .where(eq(ragDocuments.id, article.id));

      return 'failed';
    }
  }

  /**
   * Process articles in batches with progress tracking
   */
  async enhanceAllArticles(): Promise<void> {
    console.log('🚀 Starting comprehensive article enhancement...');

    // Get articles to process
    const articles = await this.getArticlesToEnhance();
    this.progress.total = articles.length;

    if (articles.length === 0) {
      console.log('✅ All articles are already enhanced!');
      return;
    }

    console.log(`📊 Found ${articles.length} articles to enhance`);
    console.log(`⚙️  Processing in batches of ${this.batchSize} with ${this.delayBetweenBatches}ms delays`);
    console.log(`⏰ Estimated time: ${Math.ceil(articles.length / this.batchSize * (this.delayBetweenBatches + 3000) / 1000 / 60)} minutes\n`);

    // Process in batches
    for (let i = 0; i < articles.length; i += this.batchSize) {
      const batch = articles.slice(i, i + this.batchSize);

      // Process batch in parallel
      const results = await Promise.allSettled(
        batch.map(article => this.enhanceArticle(article)),
      );

      // Update progress
      results.forEach((result, _index) => {
        this.progress.processed++;

        if (result.status === 'fulfilled') {
          if (result.value === 'enhanced') {
 this.progress.enhanced++;
} else if (result.value === 'failed') {
 this.progress.failed++;
} else if (result.value === 'skipped') {
 this.progress.skipped++;
}
        } else {
          this.progress.failed++;
          console.error(`[ENHANCER] Batch processing error:`, result.reason);
        }
      });

      // Display progress
      this.displayProgress();

      // Delay between batches (except last batch)
      if (i + this.batchSize < articles.length) {
        await this.sleep(this.delayBetweenBatches);
      }
    }

    // Final report
    this.displayFinalReport();
  }

  /**
   * Display current progress
   */
  private displayProgress(): void {
    this.progress.currentTime = new Date();
    const elapsed = (this.progress.currentTime.getTime() - this.progress.startTime.getTime()) / 1000;
    const rate = this.progress.processed / elapsed * 60; // per minute
    const eta = this.progress.total > this.progress.processed
      ? (this.progress.total - this.progress.processed) / (rate / 60)
      : 0;

    console.log(`\n📊 Progress: ${this.progress.processed}/${this.progress.total} (${Math.round(this.progress.processed / this.progress.total * 100)}%)`);
    console.log(`✅ Enhanced: ${this.progress.enhanced} | ❌ Failed: ${this.progress.failed} | ⏭️  Skipped: ${this.progress.skipped}`);
    console.log(`⏱️  Elapsed: ${Math.round(elapsed)}s | Rate: ${rate.toFixed(1)}/min | ETA: ${Math.round(eta / 60)}min\n`);
  }

  /**
   * Display final enhancement report
   */
  private displayFinalReport(): void {
    const totalTime = (this.progress.currentTime.getTime() - this.progress.startTime.getTime()) / 1000;

    console.log('\n🎉 Enhancement Complete!');
    console.log('='.repeat(50));
    console.log(`📊 Total Articles: ${this.progress.total}`);
    console.log(`✅ Successfully Enhanced: ${this.progress.enhanced}`);
    console.log(`❌ Failed: ${this.progress.failed}`);
    console.log(`⏭️  Skipped: ${this.progress.skipped}`);
    console.log(`⏱️  Total Time: ${Math.round(totalTime / 60)} minutes`);
    console.log(`📈 Success Rate: ${Math.round(this.progress.enhanced / this.progress.total * 100)}%`);

    if (this.progress.failed > 0) {
      console.log('\n❗ To retry failed articles, run this script again');
    }

    console.log('\n🔍 Articles are now ready for fast search with paragraph synthesis!');
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const enhancer = new ComprehensiveEnhancer();

  try {
    await enhancer.enhanceAllArticles();
  } catch (error) {
    console.error('Fatal error during enhancement:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Enhancement interrupted. Progress saved. You can resume by running this script again.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Enhancement terminated. Progress saved. You can resume by running this script again.');
  process.exit(0);
});

if (require.main === module) {
  main();
}
