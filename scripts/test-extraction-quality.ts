#!/usr/bin/env tsx
/**
 * Test extraction quality for nasal polyps page
 */

import { EnhancedHealthifyScraper } from '../src/lib/scrapers/enhanced-healthify-scraper';

async function testExtractionQuality() {
  console.log('🧪 Testing extraction quality improvements...\n');

  const scraper = new EnhancedHealthifyScraper();

  try {
    const result = await scraper.scrapeArticle('https://healthify.nz/health-a-z/n/nasal-polyps');

    if (!result) {
      console.log('❌ Failed to extract content');
      return;
    }

    console.log('=== QUALITY TEST RESULTS ===');
    console.log(`📝 TITLE: ${result.title}`);
    console.log(`📋 SECTIONS: ${Object.keys(result.sections).join(', ')} (${Object.keys(result.sections).length} total)`);
    console.log(`📄 CONTENT START: "${result.fullContent.substring(0, 150)}..."`);
    console.log(`🏷️  CATEGORIES: ${result.categories?.length || 0} generated`);
    console.log(`🔗 INTERNAL LINKS: ${result.internalLinks?.length || 0} found`);

    // Check for specific improvements
    console.log('\n=== QUALITY CHECKS ===');

    // 1. Strike notification removed?
    const hasStrikeNotice = result.fullContent.toLowerCase().includes('nurses at health nz');
    console.log(`✅ Strike notice removed: ${!hasStrikeNotice ? '✓' : '❌'}`);

    // 2. Treatment section captured?
    const hasTreatmentSection = result.sections.treatment !== undefined;
    console.log(`✅ Treatment section captured: ${hasTreatmentSection ? '✓' : '❌'}`);

    // 3. Social links filtered?
    const hasSocialLinks = result.internalLinks?.some(link =>
      link.url.includes('facebook.com')
      || link.url.includes('linkedin.com')
      || link.text.toLowerCase().includes('share'),
    );
    console.log(`✅ Social links filtered: ${!hasSocialLinks ? '✓' : '❌'}`);

    // 4. Content quality
    const contentStartsClean = !result.fullContent.startsWith('Nurses') && !result.fullContent.startsWith('×');
    console.log(`✅ Clean content start: ${contentStartsClean ? '✓' : '❌'}`);

    console.log('\n=== DETAILED SECTIONS ===');
    Object.entries(result.sections).forEach(([section, content]) => {
      console.log(`\n${section.toUpperCase()}:`);
      console.log(`${content.substring(0, 200)}...`);
    });

    if (result.internalLinks && result.internalLinks.length > 0) {
      console.log('\n=== INTERNAL LINKS (First 5) ===');
      result.internalLinks.slice(0, 5).forEach((link, i) => {
        console.log(`${i + 1}. ${link.text} → ${link.url}`);
      });
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

if (require.main === module) {
  testExtractionQuality();
}
