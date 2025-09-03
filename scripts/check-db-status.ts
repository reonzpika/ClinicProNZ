#!/usr/bin/env tsx
/**
 * Check current database status
 */

import { count, sql } from 'drizzle-orm';

import { db } from '../database/client';
import { ragDocuments } from '../database/schema/rag';

async function checkDatabaseStatus() {
  console.log('📊 Checking current database status...\n');

  try {
    // Count total articles
    const totalResult = await db.select({ count: count() }).from(ragDocuments);
    const total = totalResult[0]?.count || 0;

    console.log(`📄 TOTAL ARTICLES: ${total}`);

    // Count by enhancement status
    const statusCounts = await db
      .select({
        status: ragDocuments.enhancementStatus,
        count: count(),
      })
      .from(ragDocuments)
      .groupBy(ragDocuments.enhancementStatus);

    console.log('\n=== ENHANCEMENT STATUS BREAKDOWN ===');
    statusCounts.forEach(({ status, count }) => {
      console.log(`${status || 'null'}: ${count} articles`);
    });

    // Show sample of article URLs
    const sampleArticles = await db
      .select({
        title: ragDocuments.title,
        source: ragDocuments.source,
        enhancementStatus: ragDocuments.enhancementStatus,
        sectionsExist: sql<boolean>`sections IS NOT NULL`,
      })
      .from(ragDocuments)
      .limit(5);

    console.log('\n=== SAMPLE ARTICLES ===');
    sampleArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Status: ${article.enhancementStatus || 'null'}`);
      console.log(`   Has Sections: ${article.sectionsExist ? 'Yes' : 'No'}`);
      console.log(`   URL: ${article.source}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

if (require.main === module) {
  checkDatabaseStatus();
}
