/**
 * Validate Inbox Scan write-back via Lightsail BFF.
 *
 * This script is designed for the moment Medtech enables UAT roles/scopes for:
 * - POST DocumentReference (Scan inbox)
 * - GET DocumentReference (Scan) / read-by-id (if permitted)
 *
 * Run:
 *   pnpm tsx scripts/validate-scan-writeback-via-bff.ts \
 *     --facilityId=F99669-C \
 *     --patientId=<PATIENT_ID> \
 *     --file=/path/to/test.pdf \
 *     [--providerId=<PRACTITIONER_ID>] \
 *     [--bff=https://api.clinicpro.co.nz]
 */

import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

type Args = {
  bffBaseUrl: string;
  facilityId: string;
  patientId: string;
  providerId?: string;
  encounterId: string;
  filePath: string;
};

const MAX_ALEX_SCAN_PAYLOAD_BYTES = 8 * 1024 * 1024; // 8MB

function parseArgs(argv: string[]): Args {
  const args: Record<string, string> = {};
  for (const raw of argv) {
    if (!raw.startsWith('--')) {
      continue;
    }
    const [k, ...rest] = raw.slice(2).split('=');
    if (!k) {
      continue;
    }
    args[k] = rest.join('='); // allow '=' inside values
  }

  const bffBaseUrl = (args.bff || 'https://api.clinicpro.co.nz').replace(/\/+$/, '');
  const facilityId = args.facilityId || '';
  const patientId = args.patientId || '';
  const providerId = args.providerId || undefined;
  const filePath = args.file || '';
  const encounterId = args.encounterId || `scan-writeback-validate-${new Date().toISOString()}`;

  if (!facilityId.trim()) {
    throw new Error('Missing required arg: --facilityId=...');
  }
  if (!patientId.trim()) {
    throw new Error('Missing required arg: --patientId=...');
  }
  if (!filePath.trim()) {
    throw new Error('Missing required arg: --file=/path/to/file.(pdf|tif|tiff)');
  }

  return {
    bffBaseUrl,
    facilityId: facilityId.trim(),
    patientId: patientId.trim(),
    providerId: providerId?.trim() ? providerId.trim() : undefined,
    encounterId,
    filePath,
  };
}

function contentTypeFromFilename(filename: string): 'application/pdf' | 'image/tiff' {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) {
    return 'application/pdf';
  }
  if (lower.endsWith('.tif') || lower.endsWith('.tiff')) {
    return 'image/tiff';
  }
  throw new Error(`Unsupported file type: ${filename} (supported: .pdf, .tif, .tiff)`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const filename = basename(args.filePath);
  const contentType = contentTypeFromFilename(filename);

  const bytes = await readFile(args.filePath);
  const base64 = bytes.toString('base64');
  const base64Bytes = Buffer.byteLength(base64, 'utf8');

  console.log('Inbox Scan write-back validation (via BFF)');
  console.log('- BFF:', args.bffBaseUrl);
  console.log('- facilityId:', args.facilityId);
  console.log('- patientId:', args.patientId);
  console.log('- providerId:', args.providerId || '(none)');
  console.log('- encounterId (internal):', args.encounterId);
  console.log('- file:', filename);
  console.log('- contentType:', contentType);
  console.log('- raw bytes:', bytes.length);
  console.log('- base64 bytes (payload-ish):', base64Bytes);

  if (base64Bytes > MAX_ALEX_SCAN_PAYLOAD_BYTES) {
    throw new Error(
      `Base64 payload is too large for ALEX Scan write-back (${base64Bytes} > ${MAX_ALEX_SCAN_PAYLOAD_BYTES}). Use a smaller file.`,
    );
  }

  const correlationId = randomUUID();
  const clientRef = randomUUID();

  const commitResp = await fetch(`${args.bffBaseUrl}/api/medtech/session/commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      encounterId: args.encounterId,
      patientId: args.patientId,
      facilityId: args.facilityId,
      providerId: args.providerId,
      correlationId,
      files: [{
        clientRef,
        contentType,
        title: filename,
        meta: { label: 'scan-writeback-validation' },
        source: { base64Data: base64 },
      }],
    }),
  });

  const commitBody = await commitResp.json().catch(() => null);
  console.log('\nPOST /api/medtech/session/commit result:');
  console.log('- http:', commitResp.status);
  console.log('- correlationId:', correlationId);
  console.log(JSON.stringify(commitBody, null, 2));

  const documentReferenceId = commitBody?.files?.[0]?.documentReferenceId as string | undefined;
  if (!documentReferenceId) {
    console.log('\nNo DocumentReference id returned; stop here and use correlationId for Medtech support.');
    process.exit(2);
  }

  console.log('\nDocumentReference created:');
  console.log('- id:', documentReferenceId);

  // Attempt read-by-id via BFF verify endpoint.
  const verifyUrl = `${args.bffBaseUrl}/api/medtech/document-reference/${encodeURIComponent(documentReferenceId)}?facilityId=${encodeURIComponent(args.facilityId)}`;
  const verifyResp = await fetch(verifyUrl, { method: 'GET', headers: { Accept: 'application/json' } });
  const verifyBody = await verifyResp.json().catch(() => null);
  console.log('\nGET /api/medtech/document-reference/:id result:');
  console.log('- http:', verifyResp.status);
  console.log(JSON.stringify(verifyBody, null, 2));

  console.log('\nNext manual checks in Medtech Evolution UI:');
  console.log('- Facility:', args.facilityId);
  console.log('- Patient:', args.patientId);
  console.log('- Confirm the artefact appears in Inbox Scan and is accessible to legacy DOM referral workflows.');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
