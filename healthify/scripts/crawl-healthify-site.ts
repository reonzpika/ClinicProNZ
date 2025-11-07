#!/usr/bin/env tsx
/**
 * Script to perform initial comprehensive crawl of healthify.nz
 * This creates a basic index of all articles that can be enhanced on-demand
 */

import { crawlHealthifySite } from '../scrapers/healthify-site-crawler';

async function main() {
  console.log('🚀 Starting comprehensive Healthify.nz site crawl...');
  console.log('This will create a basic index of all available articles.');
  console.log('Estimated time: 15-30 minutes depending on site size.\n');

  try {
    await crawlHealthifySite();
    console.log('\n✅ Site crawl completed successfully!');
    console.log('📊 Check the database for newly indexed articles.');
    console.log('🔍 Users can now search and articles will be enhanced on-demand.');
  } catch (error) {
    console.error('\n❌ Site crawl failed:', error);
    process.exit(1);
  }
}

// Check if running directly (not imported)
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default main;
