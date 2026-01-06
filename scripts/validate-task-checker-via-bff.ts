// @ts-nocheck
/**
 * ALEX API Validation via BFF
 * 
 * Tests critical endpoints for Task Completion Checker feature
 * Uses new BFF endpoints: /api/medtech/documents, /labs, /prescriptions, etc.
 * 
 * Run: npx tsx scripts/validate-task-checker-via-bff.ts
 */

const BFF_BASE_URL = 'https://api.clinicpro.co.nz';
const TEST_PATIENT_NHI = 'ZZZ0016';

// ============================================================================
// Helper Functions
// ============================================================================

async function bffGet<T = unknown>(path: string): Promise<T> {
  const url = `${BFF_BASE_URL}${path}`;
  console.log(`📡 GET ${path}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.log(`❌ Error: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data).substring(0, 300)}`);
    throw new Error(`BFF error: ${response.status} - ${data.error || 'Unknown'}`);
  }

  console.log(`✅ Success (${data.duration}ms)`);
  return data as T;
}

function truncateJson(obj: unknown, maxLength = 2000): string {
  const str = JSON.stringify(obj, null, 2);
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '\n... (truncated)';
  }
  return str;
}

// ============================================================================
// Types
// ============================================================================

interface BffResponse<T> {
  success: boolean;
  duration: number;
  patientId?: string;
  total: number;
  error?: string;
  documents?: T[];
  reports?: T[];
  prescriptions?: T[];
  communications?: T[];
  tasks?: T[];
}

interface DocumentReference {
  id: string;
  status: string;
  date?: string;
  type?: { coding?: Array<{ display?: string }> };
  content?: Array<{
    attachment?: {
      contentType?: string;
      data?: string;
      url?: string;
    };
  }>;
}

// ============================================================================
// Tests
// ============================================================================

async function testBffHealth(): Promise<boolean> {
  console.log('\n' + '='.repeat(70));
  console.log('PRE-CHECK: BFF Health & New Endpoints');
  console.log('='.repeat(70));

  try {
    const response = await fetch(`${BFF_BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ BFF is healthy');
    console.log(`   Status: ${data.status}`);
    return true;
  } catch (error) {
    console.log(`❌ BFF not reachable: ${error}`);
    return false;
  }
}

async function testDocumentReference(): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 1: DocumentReference (Consultation Notes) ⭐ CRITICAL');
  console.log('='.repeat(70));
  console.log('Question: Can we get the actual NOTE TEXT content?\n');

  try {
    const result = await bffGet<BffResponse<DocumentReference>>(
      `/api/medtech/documents?nhi=${TEST_PATIENT_NHI}&count=3`
    );

    console.log(`\n📊 Found: ${result.total} documents`);
    console.log(`   Patient ID: ${result.patientId}`);

    if (result.documents && result.documents.length > 0) {
      const doc = result.documents[0];
      
      console.log('\n📄 First DocumentReference:');
      console.log(`   ID: ${doc.id}`);
      console.log(`   Status: ${doc.status}`);
      console.log(`   Date: ${doc.date}`);
      console.log(`   Type: ${doc.type?.coding?.[0]?.display || 'N/A'}`);
      
      // Check for content
      if (doc.content && doc.content.length > 0) {
        const attachment = doc.content[0].attachment;
        console.log('\n   📎 Attachment structure:');
        console.log(`      contentType: ${attachment?.contentType || 'N/A'}`);
        console.log(`      has inline data: ${attachment?.data ? 'YES ✅' : 'NO'}`);
        console.log(`      has URL reference: ${attachment?.url ? 'YES' : 'NO'}`);

        if (attachment?.data) {
          try {
            const decoded = Buffer.from(attachment.data, 'base64').toString('utf-8');
            console.log('\n   📝 DECODED NOTE CONTENT:');
            console.log('   ' + '-'.repeat(50));
            const preview = decoded.substring(0, 1000).replace(/\n/g, '\n   ');
            console.log(`   ${preview}`);
            console.log('   ' + '-'.repeat(50));
            console.log('\n   ✅ SUCCESS: Note text IS accessible inline!');
            console.log('   → Feature is FEASIBLE from data access perspective');
          } catch (e) {
            console.log(`   ⚠️ Content is not plain text (might be HTML/RTF/PDF)`);
            console.log(`   → May need parsing or different approach`);
          }
        } else if (attachment?.url) {
          console.log(`\n   ⚠️ Content referenced via URL: ${attachment.url}`);
          console.log('   → Need separate Binary fetch (extra API call)');
        } else {
          console.log('\n   ⚠️ No data or URL in attachment');
        }
      } else {
        console.log('\n   ⚠️ No content array in DocumentReference');
      }

      console.log('\n📋 Full document structure:');
      console.log(truncateJson(doc, 1500));
    } else {
      console.log('\n⚠️ No documents found for test patient');
      console.log('   → This is UAT test data; may not have consultation notes');
    }
  } catch (error) {
    console.log(`\n❌ Failed: ${error}`);
    console.log('   → Endpoint may not be deployed yet. See instructions below.');
  }
}

async function testDiagnosticReport(): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 2: DiagnosticReport (Lab Orders/Results)');
  console.log('='.repeat(70));

  try {
    const result = await bffGet<BffResponse<unknown>>(
      `/api/medtech/labs?nhi=${TEST_PATIENT_NHI}&count=3`
    );

    console.log(`\n📊 Found: ${result.total} lab reports`);

    if (result.reports && result.reports.length > 0) {
      console.log('\n📄 Sample DiagnosticReport:');
      console.log(truncateJson(result.reports[0], 1200));
      console.log('\n   ✅ Lab data IS accessible');
    } else {
      console.log('\n⚠️ No lab reports found for test patient');
    }
  } catch (error) {
    console.log(`\n❌ Failed: ${error}`);
  }
}

async function testMedicationRequest(): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 3: MedicationRequest (Prescriptions)');
  console.log('='.repeat(70));

  try {
    const result = await bffGet<BffResponse<unknown>>(
      `/api/medtech/prescriptions?nhi=${TEST_PATIENT_NHI}&count=3`
    );

    console.log(`\n📊 Found: ${result.total} prescriptions`);

    if (result.prescriptions && result.prescriptions.length > 0) {
      console.log('\n📄 Sample MedicationRequest:');
      console.log(truncateJson(result.prescriptions[0], 1200));
      console.log('\n   ✅ Prescription data IS accessible');
    } else {
      console.log('\n⚠️ No prescriptions found for test patient');
    }
  } catch (error) {
    console.log(`\n❌ Failed: ${error}`);
  }
}

async function testCommunication(): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 4: Communication (Referrals)');
  console.log('='.repeat(70));

  try {
    const result = await bffGet<BffResponse<unknown>>(
      `/api/medtech/communications?nhi=${TEST_PATIENT_NHI}&count=3`
    );

    console.log(`\n📊 Found: ${result.total} communications`);

    if (result.communications && result.communications.length > 0) {
      console.log('\n📄 Sample Communication:');
      console.log(truncateJson(result.communications[0], 1200));
      console.log('\n   ✅ Communication/referral data IS accessible');
    } else {
      console.log('\n⚠️ No communications found');
    }
  } catch (error) {
    console.log(`\n❌ Failed: ${error}`);
  }
}

async function testTask(): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 5: Task Resource');
  console.log('='.repeat(70));

  try {
    const result = await bffGet<BffResponse<unknown>>(
      `/api/medtech/tasks?nhi=${TEST_PATIENT_NHI}&count=3`
    );

    console.log(`\n📊 Found: ${result.total} tasks`);

    if (result.tasks && result.tasks.length > 0) {
      console.log('\n📄 Sample Task:');
      console.log(truncateJson(result.tasks[0], 1200));
      console.log('\n   ✅ Task data IS accessible');
    } else {
      console.log('\n⚠️ No tasks found (normal if none created)');
    }
  } catch (error) {
    console.log(`\n❌ Failed: ${error}`);
  }
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║   Task Completion Checker - API Validation                           ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  
  console.log('\n📋 Configuration:');
  console.log(`   BFF URL: ${BFF_BASE_URL}`);
  console.log(`   Test Patient NHI: ${TEST_PATIENT_NHI}`);

  const healthy = await testBffHealth();
  if (!healthy) {
    console.log('\n💥 Cannot proceed - BFF not reachable');
    process.exit(1);
  }

  // Run all tests
  await testDocumentReference();
  await testDiagnosticReport();
  await testMedicationRequest();
  await testCommunication();
  await testTask();

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`
┌─────────────────────────────────────────────────────────────────┐
│ CRITICAL QUESTION: Can we access consultation note TEXT?       │
├─────────────────────────────────────────────────────────────────┤
│ ✅ If TEST 1 shows decoded text → Feature is FEASIBLE          │
│ ⚠️ If content is HTML/RTF → Need parsing (still feasible)      │
│ ❌ If no content accessible → BLOCKER                          │
└─────────────────────────────────────────────────────────────────┘

NEXT STEPS (if feasible):
1. Confirm note format (plain text, HTML, RTF?)
2. Design AI prompt for task extraction from SOAP Plan section
3. Build cross-reference logic
4. Create end-of-day review UI
`);
}

main().catch(console.error);
