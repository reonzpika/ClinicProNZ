#!/usr/bin/env tsx
/**
 * Test LLM-based heading classification
 */

import { EnhancedHealthifyScraper } from '../healthify/scrapers/enhanced-healthify-scraper';

const TEST_URLS = [
  {
    name: 'Body Size & Health (Previously missed sections)',
    url: 'https://healthify.nz/health-a-z/b/body-size-and-health',
    expectedImprovement: 'Should now capture prevention/causes sections',
  },
  {
    name: 'Pain Team (Previously missed treatment)',
    url: 'https://healthify.nz/health-a-z/p/pain-team',
    expectedImprovement: 'Should now capture what team offers as treatment',
  },
];

async function testLLMClassification() {
  console.log('🤖 Testing LLM-based heading classification improvements...\n');

  const scraper = new EnhancedHealthifyScraper();

  for (const test of TEST_URLS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 TESTING: ${test.name}`);
    console.log(`🎯 EXPECTED: ${test.expectedImprovement}`);
    console.log(`${'='.repeat(60)}`);

    try {
      const result = await scraper.scrapeArticle(test.url);

      if (!result) {
        console.log('❌ Failed to extract content');
        continue;
      }

      // Results
      console.log(`📝 TITLE: ${result.title}`);
      console.log(`📋 SECTIONS: ${Object.keys(result.sections).join(', ')} (${Object.keys(result.sections).length} total)`);

      // Show all sections with content preview
      console.log('\n=== ALL SECTIONS ===');
      Object.entries(result.sections).forEach(([section, content]) => {
        console.log(`\n${section.toUpperCase()}:`);
        console.log(`${content.substring(0, 200)}...`);
        console.log(`(${content.length} chars total)`);
      });

      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Test failed for ${test.name}:`, error);
    }
  }

  console.log('\n🎯 LLM CLASSIFICATION TEST COMPLETE!');
  console.log('Compare section counts with previous test results to see improvements.');
}

if (require.main === module) {
  testLLMClassification();
}
