/**
 * POST /api/medtech/attachments/commit
 * 
 * Commit images to encounter via ALEX FHIR API
 * 
 * Flow:
 * 1. Get encounter and patient info from ALEX API
 * 2. Upload files to S3 (if needed)
 * 3. Create FHIR Media resources
 * 4. POST to ALEX API
 */

import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { alexApiClient, generateCorrelationId } from '@/src/lib/services/medtech';
import type { CommitRequest, CommitResponse } from '@/src/medtech/images-widget/types';
import type { FhirMedia, FhirEncounter, FhirPatient } from '@/src/lib/services/medtech/types';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

/**
 * Get encounter and patient info from ALEX API
 */
async function getEncounterInfo(encounterId: string, correlationId: string): Promise<{
  encounter: FhirEncounter;
  patient: FhirPatient;
}> {
  // Get encounter
  const encounter = await alexApiClient.get<FhirEncounter>(
    `/Encounter/${encounterId}`,
    { correlationId },
  );

  // Get patient reference from encounter
  const patientRef = encounter.subject?.reference;
  if (!patientRef) {
    throw new Error('Encounter missing patient reference');
  }

  // Extract patient ID from reference (format: "Patient/123" or just "123")
  const patientId = patientRef.includes('/') ? patientRef.split('/')[1] : patientRef;

  // Get patient
  const patient = await alexApiClient.get<FhirPatient>(
    `/Patient/${patientId}`,
    { correlationId },
  );

  return { encounter, patient };
}

/**
 * Upload file to S3 and return URL
 * 
 * Note: For MVP, we assume files are sent as base64 data.
 * In production, files should be uploaded to S3 first via presigned URLs,
 * and this endpoint should receive S3 keys/URLs instead.
 */
async function uploadFileToS3(
  fileData: string, // base64 encoded
  contentType: string,
  filename: string,
): Promise<string> {
  // Decode base64
  const buffer = Buffer.from(fileData, 'base64');

  // Generate S3 key (medtech-images/encounterId/filename)
  const timestamp = Date.now();
  const fileExtension = filename.split('.').pop() || 'jpg';
  const key = `medtech-images/${timestamp}-${uuidv4()}.${fileExtension}`;

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
    Metadata: {
      'upload-type': 'medtech',
      'upload-timestamp': timestamp.toString(),
    },
  });

  await s3Client.send(command);

  // Return S3 URL (public URL or presigned URL)
  // For now, return key - caller will construct URL
  // In production, generate presigned URL or use public bucket
  return `s3://${BUCKET_NAME}/${key}`;
}

/**
 * Create FHIR Media resource from file metadata
 */
function createMediaResource(
  fileId: string,
  s3Url: string,
  contentType: string,
  patientId: string,
  encounterId: string,
  metadata: CommitRequest['files'][0]['meta'],
): FhirMedia {
  const now = new Date().toISOString();

  // Build Media resource
  const media: FhirMedia = {
    resourceType: 'Media',
    status: 'completed',
    type: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/media-type',
        code: 'photo',
        display: 'Photo',
      }],
    },
    subject: {
      reference: `Patient/${patientId}`,
    },
    encounter: {
      reference: `Encounter/${encounterId}`,
    },
    createdDateTime: now,
    content: {
      contentType: contentType || 'image/jpeg',
      url: s3Url, // S3 URL - ALEX API will need to access this
      // Note: Metadata (bodySite, laterality, view, type) cannot be mapped
      // to Medtech Inbox fields per project findings. We include them
      // in the resource for completeness, but they won't appear in Medtech.
    },
  };

  // Add optional metadata (won't appear in Medtech Inbox, but included for completeness)
  if (metadata.bodySite) {
    media.bodySite = {
      coding: metadata.bodySite.system ? [{
        system: metadata.bodySite.system,
        code: metadata.bodySite.code,
        display: metadata.bodySite.display,
      }] : undefined,
      text: metadata.bodySite.display,
    };
  }

  if (metadata.laterality) {
    media.modality = {
      coding: metadata.laterality.system ? [{
        system: metadata.laterality.system,
        code: metadata.laterality.code,
        display: metadata.laterality.display,
      }] : undefined,
      text: metadata.laterality.display,
    };
  }

  if (metadata.view) {
    media.view = {
      coding: metadata.view.system ? [{
        system: metadata.view.system,
        code: metadata.view.code,
        display: metadata.view.display,
      }] : undefined,
      text: metadata.view.display,
    };
  }

  // Add title/label if provided
  if (metadata.title || metadata.label) {
    media.content.title = metadata.title || metadata.label;
  }

  return media;
}

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const startTime = Date.now();

  try {
    const body: CommitRequest = await request.json();

    if (!body.encounterId) {
      return NextResponse.json(
        { error: 'encounterId is required' },
        { status: 400 },
      );
    }

    if (!body.files || body.files.length === 0) {
      return NextResponse.json(
        { error: 'files array is required' },
        { status: 400 },
      );
    }

    console.log('[Medtech Commit] Starting commit', {
      correlationId,
      encounterId: body.encounterId,
      fileCount: body.files.length,
    });

    // Step 1: Get encounter and patient info
    const { encounter, patient } = await getEncounterInfo(body.encounterId, correlationId);
    const patientId = patient.id || encounter.subject?.reference?.split('/')[1];
    
    if (!patientId) {
      throw new Error('Unable to determine patient ID from encounter');
    }

    console.log('[Medtech Commit] Got encounter info', {
      correlationId,
      encounterId: encounter.id,
      patientId,
    });

    // Step 2: Process each file
    // NOTE: Current implementation assumes files are uploaded to S3 first via upload-initiate endpoint.
    // The fileId should map to an S3 key. If files aren't uploaded yet, we need to modify the flow.
    const results: CommitResponse['files'] = [];

    for (const file of body.files) {
      try {
        // TODO: Files need to be uploaded to S3 first via upload-initiate endpoint.
        // For now, we'll construct S3 key from fileId.
        // In production, upload-initiate should return S3 keys that map to fileIds.
        const s3Key = `medtech-images/${body.encounterId}/${file.fileId}.jpg`;
        
        // Generate presigned URL for S3 object (read access)
        // Note: ALEX API needs to access this URL, so it should be publicly accessible
        // or we need to configure ALEX API with S3 access credentials
        const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-southeast-2'}.amazonaws.com/${s3Key}`;

        // Step 3: Create Media resource
        const mediaResource = createMediaResource(
          file.fileId,
          s3Url,
          'image/jpeg', // TODO: Get from file metadata
          patientId,
          body.encounterId,
          file.meta,
        );

        console.log('[Medtech Commit] Creating Media resource', {
          correlationId,
          fileId: file.fileId,
          mediaId: mediaResource.id,
        });

        // Step 4: POST to ALEX API
        const createdMedia = await alexApiClient.post<FhirMedia>(
          '/Media',
          mediaResource,
          { correlationId },
        );

        console.log('[Medtech Commit] Media created successfully', {
          correlationId,
          fileId: file.fileId,
          mediaId: createdMedia.id,
        });

        // Success
        results.push({
          fileId: file.fileId,
          status: 'committed',
          documentReferenceId: createdMedia.id, // Media ID serves as document reference
          mediaId: createdMedia.id,
          // Note: Inbox and Task creation would happen here if needed
          // but for MVP, Media resource automatically creates Daily Record entry
          warnings: [],
        });
      } catch (error) {
        console.error('[Medtech Commit] File commit failed', {
          correlationId,
          fileId: file.fileId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        results.push({
          fileId: file.fileId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to commit file',
        });
      }
    }

    const duration = Date.now() - startTime;

    // Check if all files succeeded
    const successCount = results.filter(r => r.status === 'committed').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log('[Medtech Commit] Commit complete', {
      correlationId,
      duration,
      successCount,
      errorCount,
    });

    return NextResponse.json({
      files: results,
    } as CommitResponse);
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('[Medtech Commit] Commit failed', {
      correlationId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    });

    return NextResponse.json(
      {
        error: 'Failed to commit attachments',
        message: error instanceof Error ? error.message : 'Unknown error',
        correlationId,
      },
      { status: 500 },
    );
  }
}
