#!/usr/bin/env tsx
/**
 * Test enhanced extraction on allergies page
 */

import { EnhancedHealthifyScraper } from '../src/lib/scrapers/enhanced-healthify-scraper';

async function testAllergiesExtraction() {
  console.log('🧪 Testing allergies page extraction with LLM classification...\n');

  const scraper = new EnhancedHealthifyScraper();
  const testUrl = 'https://healthify.nz/health-a-z/a/allergies';

  try {
    const result = await scraper.scrapeArticle(testUrl);

    if (!result) {
      console.log('❌ Failed to extract content');
      return;
    }

    console.log(`${'='.repeat(60)}`);
    console.log(`📄 ALLERGIES PAGE EXTRACTION RESULTS`);
    console.log(`${'='.repeat(60)}`);

    console.log(`📝 TITLE: ${result.title}`);
    console.log(`📋 SECTIONS: ${Object.keys(result.sections).length} total`);
    console.log(`📄 CONTENT LENGTH: ${result.fullContent.length} chars`);
    console.log(`🔗 INTERNAL LINKS: ${result.internalLinks?.length || 0} found`);
    console.log(`🏷️ CATEGORIES: ${result.categories?.length || 0} generated`);

    // Show all sections with detailed content
    console.log('\n=== DETAILED SECTION BREAKDOWN ===');
    Object.entries(result.sections).forEach(([section, content], index) => {
      console.log(`\n${index + 1}. ${section.toUpperCase()}`);
      console.log(`   Length: ${content.length} characters`);
      console.log(`   Preview: ${content.substring(0, 150)}...`);
    });

    // Show categories if available
    if (result.categories && result.categories.length > 0) {
      console.log('\n=== AI-GENERATED CATEGORIES ===');
      result.categories.forEach((category, index) => {
        console.log(`${index + 1}. ${category}`);
      });
    }

    // Show key internal links
    if (result.internalLinks && result.internalLinks.length > 0) {
      console.log('\n=== KEY INTERNAL LINKS (First 5) ===');
      result.internalLinks.slice(0, 5).forEach((link, index) => {
        console.log(`${index + 1}. ${link.text} → ${link.url}`);
      });
    }

    // Quality assessment
    console.log('\n=== QUALITY ASSESSMENT ===');
    const hasSymptoms = 'symptoms' in result.sections;
    const hasCauses = 'causes' in result.sections;
    const hasTreatment = 'treatment' in result.sections;
    const hasPrevention = 'prevention' in result.sections;
    const hasOverview = 'overview' in result.sections;

    console.log(`✅ Overview section: ${hasOverview ? '✓' : '✗'}`);
    console.log(`✅ Symptoms section: ${hasSymptoms ? '✓' : '✗'}`);
    console.log(`✅ Causes section: ${hasCauses ? '✓' : '✗'}`);
    console.log(`✅ Treatment section: ${hasTreatment ? '✓' : '✗'}`);
    console.log(`✅ Prevention section: ${hasPrevention ? '✓' : '✗'}`);

    const totalExpectedSections = [hasOverview, hasSymptoms, hasCauses, hasTreatment, hasPrevention].filter(Boolean).length;
    console.log(`\n📊 CORE SECTIONS: ${totalExpectedSections}/5 captured`);
    console.log(`📊 TOTAL SECTIONS: ${Object.keys(result.sections).length}`);

    // Content quality checks
    const hasStrikeNotice = result.fullContent.includes('Nurses at Health NZ');
    const hasSocialLinks = result.internalLinks?.some(link =>
      link.url.includes('facebook') || link.url.includes('linkedin'),
    ) || false;

    console.log(`\n=== CONTENT QUALITY ===`);
    console.log(`✅ Strike notice removed: ${!hasStrikeNotice ? '✓' : '✗'}`);
    console.log(`✅ Social links filtered: ${!hasSocialLinks ? '✓' : '✗'}`);
    console.log(`✅ Rich content depth: ${result.fullContent.length > 5000 ? '✓' : '✗'}`);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

if (require.main === module) {
  testAllergiesExtraction();
}
