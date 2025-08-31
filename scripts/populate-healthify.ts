#!/usr/bin/env tsx

/**
 * Script to populate the RAG database with healthify.nz content
 * Run with: npm run db:populate-healthify
 */

import { scrapeAndIngestHealthify } from '../src/lib/scrapers/healthify-scraper';

// Common medical topics for initial population
const INITIAL_QUERIES = [
  // Common symptoms
  'headache',
  'back pain',
  'chest pain',
  'abdominal pain',
  'dizziness',
  'fatigue',
  'fever',
  'cough',
  'shortness of breath',
  'nausea',

  // Chronic conditions
  'diabetes',
  'hypertension',
  'arthritis',
  'asthma',
  'depression',
  'anxiety',
  'high cholesterol',
  'heart disease',

  // Preventive care
  'vaccination',
  'mammogram',
  'colonoscopy',
  'blood pressure monitoring',
  'weight management',
  'smoking cessation',

  // Common procedures
  'wound care',
  'medication management',
  'contraception',
  'pregnancy care',
  'child development',
];

async function main() {
  console.log('🚀 Starting healthify.nz content population...');
  console.log(`📋 Processing ${INITIAL_QUERIES.length} medical topics`);

  let successful = 0;
  let failed = 0;

    for (let i = 0; i < INITIAL_QUERIES.length; i++) {
    const query = INITIAL_QUERIES[i];

    if (!query) {
 continue;
}

    try {
      console.log(`\n[${i + 1}/${INITIAL_QUERIES.length}] Processing: "${query}"`);
      await scrapeAndIngestHealthify(query.trim());
      successful++;
      console.log(`✅ Completed: ${query}`);

      // Delay between queries to be respectful to healthify.nz
      if (i < INITIAL_QUERIES.length - 1) {
        console.log('⏳ Waiting 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      failed++;
      console.error(`❌ Failed for "${query}":`, error instanceof Error ? error.message : error);
    }
  }

  console.log('\n📊 Population Summary:');
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((successful / INITIAL_QUERIES.length) * 100)}%`);

  if (successful > 0) {
    console.log('\n🎉 Database populated! You can now use the /search page.');
  } else {
    console.log('\n⚠️  No content was added. Check your internet connection and try again.');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as populateHealthify };
