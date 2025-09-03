#!/usr/bin/env tsx
/**
 * Test extraction quality across different content types
 */

import { EnhancedHealthifyScraper } from '../src/lib/scrapers/enhanced-healthify-scraper';

const TEST_URLS = [
  {
    name: 'Medical Condition',
    url: 'https://healthify.nz/health-a-z/h/haemorrhoids',
    expectedSections: ['overview', 'symptoms', 'causes', 'treatment'],
  },
  {
    name: 'Health Concept',
    url: 'https://healthify.nz/health-a-z/b/body-size-and-health',
    expectedSections: ['overview', 'causes', 'prevention'],
  },
  {
    name: 'Healthcare Service',
    url: 'https://healthify.nz/health-a-z/p/pain-team',
    expectedSections: ['overview', 'treatment'],
  },
];

async function testMultipleExtractions() {
  console.log('🧪 Testing extraction quality across different content types...\n');

  const scraper = new EnhancedHealthifyScraper();
  const results: any[] = [];

  for (const test of TEST_URLS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 TESTING: ${test.name.toUpperCase()} - ${test.url}`);
    console.log(`${'='.repeat(60)}`);

    try {
      const result = await scraper.scrapeArticle(test.url);

      if (!result) {
        console.log('❌ Failed to extract content');
        continue;
      }

      // Basic info
      console.log(`📝 TITLE: ${result.title}`);
      console.log(`📋 SECTIONS: ${Object.keys(result.sections).join(', ')} (${Object.keys(result.sections).length} total)`);
      console.log(`📄 CONTENT LENGTH: ${result.fullContent.length} chars`);
      console.log(`🔗 INTERNAL LINKS: ${result.internalLinks?.length || 0} found`);

      // Quality checks
      console.log('\n=== QUALITY CHECKS ===');

      // 1. Content starts clean?
      const contentStartsClean = !result.fullContent.toLowerCase().includes('nurses at health nz')
        && !result.fullContent.startsWith('×');
      console.log(`✅ Clean content start: ${contentStartsClean ? '✓' : '❌'}`);

      // 2. Expected sections captured?
      const foundSections = Object.keys(result.sections);
      const missingSections = test.expectedSections.filter(expected => !foundSections.includes(expected));
      const extraSections = foundSections.filter(found => !test.expectedSections.includes(found));

      console.log(`✅ Expected sections: ${test.expectedSections.length - missingSections.length}/${test.expectedSections.length} found`);
      if (missingSections.length > 0) {
        console.log(`   Missing: ${missingSections.join(', ')}`);
      }
      if (extraSections.length > 0) {
        console.log(`   Extra: ${extraSections.join(', ')}`);
      }

      // 3. Social links filtered?
      const hasSocialLinks = result.internalLinks?.some(link =>
        link.url.includes('facebook.com')
        || link.url.includes('linkedin.com')
        || link.text.toLowerCase().includes('share'),
      );
      console.log(`✅ Social links filtered: ${!hasSocialLinks ? '✓' : '❌'}`);

      // 4. Medical links quality
      const medicalLinks = result.internalLinks?.filter(link =>
        link.url.includes('healthify.nz/health-a-z')
        || link.url.includes('healthify.nz/medicines-a-z'),
      );
      console.log(`✅ Medical links: ${medicalLinks?.length || 0} relevant links`);

      // Store result for summary
      results.push({
        name: test.name,
        title: result.title,
        sectionsFound: foundSections.length,
        sectionsExpected: test.expectedSections.length,
        contentLength: result.fullContent.length,
        linksFound: result.internalLinks?.length || 0,
        cleanStart: contentStartsClean,
        socialFiltered: !hasSocialLinks,
        medicalLinks: medicalLinks?.length || 0,
      });

      // Show first few sections
      console.log('\n=== SECTION PREVIEWS ===');
      Object.entries(result.sections).slice(0, 3).forEach(([section, content]) => {
        console.log(`\n${section.toUpperCase()}:`);
        console.log(`${content.substring(0, 150)}...`);
      });

      // Show medical links
      if (medicalLinks && medicalLinks.length > 0) {
        console.log('\n=== MEDICAL LINKS (First 3) ===');
        medicalLinks.slice(0, 3).forEach((link, i) => {
          console.log(`${i + 1}. ${link.text} → ${link.url}`);
        });
      }

      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Test failed for ${test.name}:`, error);
      results.push({
        name: test.name,
        error: error.message,
      });
    }
  }

  // Summary report
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('📊 EXTRACTION QUALITY SUMMARY');
  console.log(`${'='.repeat(60)}`);

  results.forEach((result) => {
    if (result.error) {
      console.log(`❌ ${result.name}: Failed - ${result.error}`);
      return;
    }

    console.log(`\n📄 ${result.name.toUpperCase()}:`);
    console.log(`   Title: ${result.title}`);
    console.log(`   Sections: ${result.sectionsFound}/${result.sectionsExpected} expected`);
    console.log(`   Content: ${result.contentLength} chars`);
    console.log(`   Medical Links: ${result.medicalLinks}`);
    console.log(`   Quality: ${result.cleanStart && result.socialFiltered ? '✅ Excellent' : '⚠️ Issues found'}`);
  });

  const successfulTests = results.filter(r => !r.error);
  const avgSections = successfulTests.reduce((sum, r) => sum + r.sectionsFound, 0) / successfulTests.length;
  const avgContent = successfulTests.reduce((sum, r) => sum + r.contentLength, 0) / successfulTests.length;
  const avgLinks = successfulTests.reduce((sum, r) => sum + r.medicalLinks, 0) / successfulTests.length;

  console.log(`\n📈 AVERAGES:`);
  console.log(`   Sections per page: ${avgSections.toFixed(1)}`);
  console.log(`   Content length: ${Math.round(avgContent)} chars`);
  console.log(`   Medical links: ${avgLinks.toFixed(1)}`);

  const allClean = successfulTests.every(r => r.cleanStart && r.socialFiltered);
  console.log(`\n🎯 OVERALL QUALITY: ${allClean ? '✅ Excellent - Ready for production!' : '⚠️ Some issues need fixing'}`);
}

if (require.main === module) {
  testMultipleExtractions();
}
