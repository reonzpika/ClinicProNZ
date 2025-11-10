/**
 * Medtech Integration Test Script
 *
 * Tests the medtech ALEX API client and mock services
 * Run with: tsx test-medtech-integration.ts
 */

import { resolve } from 'node:path';

import { config } from 'dotenv';

import { alexApiClient } from './src/lib/services/medtech/alex-api-client';
import { generateCorrelationId } from './src/lib/services/medtech/correlation-id';
import { oauthTokenService } from './src/lib/services/medtech/oauth-token-service';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

console.log('🧪 Medtech Integration Test Suite\n');

async function testCorrelationId() {
  console.log('📝 Testing Correlation ID Generation...');
  const id1 = generateCorrelationId();
  const id2 = generateCorrelationId();

  console.log(`  Generated ID 1: ${id1}`);
  console.log(`  Generated ID 2: ${id2}`);
  console.log(`  ✓ IDs are unique: ${id1 !== id2}`);
  console.log();
}

async function testOAuthTokenService() {
  console.log('🔐 Testing OAuth Token Service...');

  try {
    // Check if we're in mock mode
    const useMock = process.env.NEXT_PUBLIC_MEDTECH_USE_MOCK === 'true';
    console.log(`  Mode: ${useMock ? 'MOCK' : 'REAL'}`);

    if (!useMock) {
      // Check environment variables
      const hasClientId = !!process.env.MEDTECH_CLIENT_ID;
      const hasClientSecret = !!process.env.MEDTECH_CLIENT_SECRET;
      const hasTenantId = !!process.env.MEDTECH_TENANT_ID;
      const hasScope = !!process.env.MEDTECH_API_SCOPE;

      console.log(`  ✓ Has Client ID: ${hasClientId}`);
      console.log(`  ✓ Has Client Secret: ${hasClientSecret}`);
      console.log(`  ✓ Has Tenant ID: ${hasTenantId}`);
      console.log(`  ✓ Has Scope: ${hasScope}`);

      if (hasClientId && hasClientSecret && hasTenantId && hasScope) {
        console.log('  ⚠️  Real API credentials configured (not testing token acquisition)');
      } else {
        console.log('  ⚠️  Missing real API credentials (expected in mock mode)');
      }
    } else {
      console.log('  ✓ Mock mode enabled - skipping real OAuth test');
    }

    const tokenInfo = oauthTokenService.getTokenInfo();
    console.log(`  Token cached: ${tokenInfo.isCached}`);
    if (tokenInfo.expiresIn) {
      console.log(`  Token expires in: ${Math.round(tokenInfo.expiresIn / 1000)}s`);
    }
    console.log();
  } catch (error) {
    console.error('  ✗ OAuth test failed:', error instanceof Error ? error.message : 'Unknown error');
    console.log();
  }
}

async function testAlexApiClient() {
  console.log('🌐 Testing ALEX API Client...');

  const useMock = process.env.NEXT_PUBLIC_MEDTECH_USE_MOCK === 'true';

  if (useMock) {
    console.log('  ⚠️  Mock mode enabled - skipping real API test');
    console.log('  ℹ️  To test real API:');
    console.log('     1. Set NEXT_PUBLIC_MEDTECH_USE_MOCK=false');
    console.log('     2. Configure MEDTECH_CLIENT_* credentials');
    console.log('     3. Ensure IP is allow-listed by Medtech');
    console.log();
    return;
  }

  try {
    const hasBaseUrl = !!process.env.MEDTECH_API_BASE_URL;
    const hasFacilityId = !!process.env.MEDTECH_FACILITY_ID;

    console.log(`  ✓ Has Base URL: ${hasBaseUrl} ${hasBaseUrl ? `(${process.env.MEDTECH_API_BASE_URL})` : ''}`);
    console.log(`  ✓ Has Facility ID: ${hasFacilityId} ${hasFacilityId ? `(${process.env.MEDTECH_FACILITY_ID})` : ''}`);

    if (!hasBaseUrl || !hasFacilityId) {
      console.log('  ⚠️  Missing API configuration');
      console.log();
      return;
    }

    // Test capability statement (doesn't require auth in some cases)
    console.log('  Testing /metadata endpoint...');
    try {
      const metadata = await alexApiClient.get('/metadata');
      console.log('  ✓ Metadata endpoint accessible');
      console.log(`  Resource Type: ${(metadata as any).resourceType}`);
    } catch (error: any) {
      console.log(`  ✗ Metadata endpoint failed: ${error.message}`);
      if (error.statusCode === 401) {
        console.log('    (401 Unauthorized - OAuth credentials may be invalid)');
      } else if (error.statusCode === 403) {
        console.log('    (403 Forbidden - IP may not be allow-listed)');
      }
    }
    console.log();
  } catch (error) {
    console.error('  ✗ API client test failed:', error instanceof Error ? error.message : 'Unknown error');
    console.log();
  }
}

async function testEnvironmentConfiguration() {
  console.log('⚙️  Testing Environment Configuration...');

  const config = {
    useMock: process.env.NEXT_PUBLIC_MEDTECH_USE_MOCK === 'true',
    hasBaseUrl: !!process.env.MEDTECH_API_BASE_URL,
    hasFacilityId: !!process.env.MEDTECH_FACILITY_ID,
    hasClientId: !!process.env.MEDTECH_CLIENT_ID,
    hasClientSecret: !!process.env.MEDTECH_CLIENT_SECRET,
    hasTenantId: !!process.env.MEDTECH_TENANT_ID,
    hasScope: !!process.env.MEDTECH_API_SCOPE,
  };

  console.log('  Mock Mode:', config.useMock);
  console.log('  API Configuration:');
  console.log(`    Base URL: ${config.hasBaseUrl ? '✓' : '✗'}`);
  console.log(`    Facility ID: ${config.hasFacilityId ? '✓' : '✗'}`);
  console.log('  OAuth Configuration:');
  console.log(`    Client ID: ${config.hasClientId ? '✓' : '✗'}`);
  console.log(`    Client Secret: ${config.hasClientSecret ? '✓' : '✗'}`);
  console.log(`    Tenant ID: ${config.hasTenantId ? '✓' : '✗'}`);
  console.log(`    Scope: ${config.hasScope ? '✓' : '✗'}`);

  if (config.useMock) {
    console.log('\n  ✓ Mock mode configuration is correct for development');
  } else {
    const allConfigured = config.hasBaseUrl && config.hasFacilityId
      && config.hasClientId && config.hasClientSecret
      && config.hasTenantId && config.hasScope;

    if (allConfigured) {
      console.log('\n  ✓ Real API configuration is complete');
      console.log('  ⚠️  Ensure your IP is allow-listed by Medtech');
    } else {
      console.log('\n  ⚠️  Real API configuration is incomplete');
      console.log('  ℹ️  Set NEXT_PUBLIC_MEDTECH_USE_MOCK=true for development');
    }
  }
  console.log();
}

async function runTests() {
  try {
    await testEnvironmentConfiguration();
    await testCorrelationId();
    await testOAuthTokenService();
    await testAlexApiClient();

    console.log('✅ Medtech integration test suite completed\n');
    console.log('📋 Next steps:');
    console.log('  1. Start dev server: pnpm dev');
    console.log('  2. Test API endpoint: curl http://localhost:3000/api/medtech/capabilities');
    console.log('  3. Test desktop widget: http://localhost:3000/medtech-images?encounterId=test&patientId=test');
    console.log('  4. Test mobile widget: http://localhost:3000/medtech-images/mobile');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

runTests();
