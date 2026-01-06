// @ts-nocheck
/**
 * ALEX API Validation Script for Task Completion Checker Feature
 * 
 * Tests critical endpoints needed for the feature:
 * 1. DocumentReference (consultation notes) - Can we get note TEXT content?
 * 2. DiagnosticReport (lab orders/results)
 * 3. MedicationRequest (prescriptions)
 * 4. Communication/Outbox (referrals)
 * 
 * Run: npx tsx scripts/validate-task-checker-api.ts
 */

import 'dotenv/config';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  baseUrl: process.env.MEDTECH_API_BASE_URL || 'https://alexapiuat.medtechglobal.com/FHIR',
  facilityId: process.env.MEDTECH_FACILITY_ID || 'F2N060-E',
  clientId: process.env.MEDTECH_CLIENT_ID,
  clientSecret: process.env.MEDTECH_CLIENT_SECRET,
  tenantId: process.env.MEDTECH_TENANT_ID || '8a024e99-aba3-4b25-b875-28b0c0ca6096',
  scope: process.env.MEDTECH_API_SCOPE || 'api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default',
  
  // Test patient (from UAT environment)
  testPatientNhi: 'ZZZ0016',
  testPatientId: '14e52e16edb7a435bfa05e307afd008b',
};

// ============================================================================
// OAuth Token Service
// ============================================================================

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if valid
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.accessToken;
  }

  const tokenUrl = `https://login.microsoftonline.com/${CONFIG.tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: CONFIG.clientId!,
    client_secret: CONFIG.clientSecret!,
    grant_type: 'client_credentials',
    scope: CONFIG.scope,
  });

  console.log('\n🔐 Acquiring OAuth token...');
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OAuth failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + 55 * 60 * 1000, // 55 min cache
  };

  console.log('✅ OAuth token acquired successfully\n');
  return data.access_token;
}

// ============================================================================
// ALEX API Client
// ============================================================================

async function alexGet<T = unknown>(endpoint: string): Promise<T> {
  const token = await getAccessToken();
  const url = `${CONFIG.baseUrl}${endpoint}`;

  console.log(`📡 GET ${endpoint}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/fhir+json',
      'mt-facilityid': CONFIG.facilityId,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`❌ Error: ${response.status}`);
    console.log(`   Response: ${error.substring(0, 500)}`);
    throw new Error(`ALEX API error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ Success: ${response.status}`);
  return data as T;
}

// ============================================================================
// Test Functions
// ============================================================================

interface FhirBundle {
  resourceType: 'Bundle';
  total?: number;
  entry?: Array<{
    resource: Record<string, unknown>;
  }>;
}

interface DocumentReference {
  resourceType: 'DocumentReference';
  id: string;
  status: string;
  type?: { coding?: Array<{ display?: string }> };
  date?: string;
  content?: Array<{
    attachment?: {
      contentType?: string;
      data?: string; // Base64 encoded content
      url?: string;  // Reference to Binary resource
    };
  }>;
  description?: string;
}

async function testDocumentReference(): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 1: DocumentReference (Consultation Notes)');
  console.log('='.repeat(70));
  console.log('Goal: Check if we can retrieve consultation note TEXT content\n');

  try {
    // Try by patient ID first
    const bundle = await alexGet<FhirBundle>(
      `/DocumentReference?patient=${CONFIG.testPatientId}&_count=5`
    );

    console.log(`\n📊 Results: ${bundle.total ?? bundle.entry?.length ?? 0} documents found`);

    const entries = bundle.entry ?? [];
    if (entries.length > 0) {
      console.log('\n📄 Sample DocumentReference:');
      const doc = entries[0]!.resource as unknown as DocumentReference;
      
      console.log(`   ID: ${doc.id}`);
      console.log(`   Status: ${doc.status}`);
      console.log(`   Date: ${doc.date}`);
      console.log(`   Type: ${doc.type?.coding?.[0]?.display || 'N/A'}`);
      console.log(`   Description: ${doc.description || 'N/A'}`);
      
      // Check content structure
      const contentArray = doc.content ?? [];
      if (contentArray.length > 0) {
        const attachment = contentArray[0]?.attachment;
        console.log('\n   📎 Attachment:');
        console.log(`      Content-Type: ${attachment?.contentType || 'N/A'}`);
        console.log(`      Has inline data: ${attachment?.data ? 'YES ✅' : 'NO'}`);
        console.log(`      Has URL reference: ${attachment?.url ? 'YES' : 'NO'}`);
        
        if (attachment?.data) {
          // Try to decode base64 content
          try {
            const decoded = Buffer.from(attachment.data, 'base64').toString('utf-8');
            console.log(`\n   📝 Decoded Content Preview (first 500 chars):`);
            console.log(`   ${'-'.repeat(50)}`);
            console.log(`   ${decoded.substring(0, 500).replace(/\n/g, '\n   ')}`);
            console.log(`   ${'-'.repeat(50)}`);
            console.log('\n   ✅ SUCCESS: Note text content IS accessible!');
          } catch (e) {
            console.log(`      ⚠️ Could not decode as text (might be binary/PDF)`);
          }
        } else if (attachment?.url) {
          console.log(`\n   ⚠️ Content is referenced via URL: ${attachment.url}`);
          console.log('   Need to fetch Binary resource separately');
          
          // Try to fetch the Binary resource
          try {
            const binaryUrl = attachment.url.replace(CONFIG.baseUrl, '');
            console.log(`\n   📡 Attempting to fetch Binary resource...`);
            const binary = await alexGet<Record<string, unknown>>(binaryUrl);
            console.log(`   ✅ Binary resource retrieved`);
            console.log(`   Content-Type: ${binary.contentType}`);
            if (binary.data) {
              const decoded = Buffer.from(binary.data as string, 'base64').toString('utf-8');
              console.log(`\n   📝 Binary Content Preview (first 500 chars):`);
              console.log(`   ${decoded.substring(0, 500).replace(/\n/g, '\n   ')}`);
            }
          } catch (e) {
            console.log(`   ❌ Could not fetch Binary: ${e}`);
          }
        } else {
          console.log('\n   ❌ No content data found in attachment');
        }
      } else {
        console.log('\n   ⚠️ No content array in DocumentReference');
      }

      // Print full structure for analysis
      console.log('\n📋 Full DocumentReference structure (for analysis):');
      console.log(JSON.stringify(doc, null, 2).substring(0, 2000));
    } else {
      console.log('\n⚠️ No documents found for test patient');
      console.log('   This could mean: empty test data or different query needed');
    }
  } catch (error) {
    console.log(`\n❌ Test failed: ${error}`);
  }
}

async function testDiagnosticReport(): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 2: DiagnosticReport (Lab Orders/Results)');
  console.log('='.repeat(70));
  console.log('Goal: Check if we can see lab ORDERS (not just results)\n');

  try {
    const bundle = await alexGet<FhirBundle>(
      `/DiagnosticReport?patient=${CONFIG.testPatientId}&_count=5`
    );

    console.log(`\n📊 Results: ${bundle.total ?? bundle.entry?.length ?? 0} reports found`);

    const entries = bundle.entry ?? [];
    if (entries.length > 0) {
      console.log('\n📄 Sample DiagnosticReport:');
      const report = entries[0]!.resource;
      console.log(JSON.stringify(report, null, 2).substring(0, 1500));
    } else {
      console.log('\n⚠️ No diagnostic reports found for test patient');
    }
  } catch (error) {
    console.log(`\n❌ Test failed: ${error}`);
  }
}

async function testMedicationRequest(): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 3: MedicationRequest (Prescriptions)');
  console.log('='.repeat(70));
  console.log('Goal: Check if we can see prescriptions written today\n');

  try {
    const bundle = await alexGet<FhirBundle>(
      `/MedicationRequest?patient=${CONFIG.testPatientId}&_count=5`
    );

    console.log(`\n📊 Results: ${bundle.total ?? bundle.entry?.length ?? 0} prescriptions found`);

    const entries = bundle.entry ?? [];
    if (entries.length > 0) {
      console.log('\n📄 Sample MedicationRequest:');
      const rx = entries[0]!.resource;
      console.log(JSON.stringify(rx, null, 2).substring(0, 1500));
    } else {
      console.log('\n⚠️ No prescriptions found for test patient');
    }
  } catch (error) {
    console.log(`\n❌ Test failed: ${error}`);
  }
}

async function testCommunication(): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 4: Communication (Outbox/Referrals)');
  console.log('='.repeat(70));
  console.log('Goal: Check if we can see referrals sent\n');

  try {
    // Try Communication resource first
    const bundle = await alexGet<FhirBundle>(
      `/Communication?patient=${CONFIG.testPatientId}&_count=5`
    );

    console.log(`\n📊 Results: ${bundle.total ?? bundle.entry?.length ?? 0} communications found`);

    const entries = bundle.entry ?? [];
    if (entries.length > 0) {
      console.log('\n📄 Sample Communication:');
      const comm = entries[0]!.resource;
      console.log(JSON.stringify(comm, null, 2).substring(0, 1500));
    } else {
      console.log('\n⚠️ No communications found for test patient');
    }
  } catch (error) {
    console.log(`\n❌ Communication test failed: ${error}`);
    console.log('   Trying alternative endpoints...');
  }
}

async function testTask(): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 5: Task (Existing Tasks)');
  console.log('='.repeat(70));
  console.log('Goal: Check if we can read/write tasks\n');

  try {
    const bundle = await alexGet<FhirBundle>(
      `/Task?patient=${CONFIG.testPatientId}&_count=5`
    );

    console.log(`\n📊 Results: ${bundle.total ?? bundle.entry?.length ?? 0} tasks found`);

    const entries = bundle.entry ?? [];
    if (entries.length > 0) {
      console.log('\n📄 Sample Task:');
      const task = entries[0]!.resource;
      console.log(JSON.stringify(task, null, 2).substring(0, 1500));
    } else {
      console.log('\n⚠️ No tasks found for test patient');
    }
  } catch (error) {
    console.log(`\n❌ Task test failed: ${error}`);
  }
}

// ============================================================================
// Alternative: Try different query patterns
// ============================================================================

async function testAlternativeQueries(): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('BONUS: Alternative Query Patterns');
  console.log('='.repeat(70));

  // Try querying by NHI instead of patient ID
  console.log('\n🔍 Trying query by NHI (ZZZ0016)...');
  try {
    const bundle = await alexGet<FhirBundle>(
      `/DocumentReference?patient.identifier=ZZZ0016&_count=3`
    );
    console.log(`   Result: ${bundle.total ?? bundle.entry?.length ?? 0} documents`);
  } catch (e) {
    console.log(`   Query by NHI failed: ${e}`);
  }

  // Try to list all recent DocumentReferences for facility
  console.log('\n🔍 Trying to list recent documents (no patient filter)...');
  try {
    const bundle = await alexGet<FhirBundle>(
      `/DocumentReference?_count=3&_sort=-date`
    );
    console.log(`   Result: ${bundle.total ?? bundle.entry?.length ?? 0} documents`);
    if (bundle.entry && bundle.entry.length > 0) {
      console.log('   ✅ Can retrieve documents without specific patient');
    }
  } catch (e) {
    console.log(`   Query without patient failed: ${e}`);
  }
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║     ALEX API Validation for Task Completion Checker Feature          ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  
  console.log('\n📋 Configuration:');
  console.log(`   Base URL: ${CONFIG.baseUrl}`);
  console.log(`   Facility ID: ${CONFIG.facilityId}`);
  console.log(`   Test Patient NHI: ${CONFIG.testPatientNhi}`);
  console.log(`   Test Patient ID: ${CONFIG.testPatientId}`);
  console.log(`   Client ID: ${CONFIG.clientId ? '***' + CONFIG.clientId.slice(-8) : '❌ NOT SET'}`);
  console.log(`   Client Secret: ${CONFIG.clientSecret ? '***[SET]' : '❌ NOT SET'}`);

  if (!CONFIG.clientId || !CONFIG.clientSecret) {
    console.log('\n❌ ERROR: Missing OAuth credentials');
    console.log('   Set MEDTECH_CLIENT_ID and MEDTECH_CLIENT_SECRET in .env.local');
    process.exit(1);
  }

  try {
    // Run all tests
    await testDocumentReference();
    await testDiagnosticReport();
    await testMedicationRequest();
    await testCommunication();
    await testTask();
    await testAlternativeQueries();

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));
    console.log(`
Based on these tests, we can determine:

1. ✅/❌ Can we get consultation note TEXT content?
   → Check TEST 1 results above

2. ✅/❌ Can we see lab orders/results?
   → Check TEST 2 results above

3. ✅/❌ Can we see prescriptions?
   → Check TEST 3 results above

4. ✅/❌ Can we see referrals/communications?
   → Check TEST 4 results above

5. ✅/❌ Can we read/write tasks?
   → Check TEST 5 results above

If TEST 1 shows we can get note text, the feature is FEASIBLE! 🎉
`);

  } catch (error) {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  }
}

main();
