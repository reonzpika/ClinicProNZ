/**
 * POST /api/medtech/attachments/commit
 *
 * Commit images to encounter via Lightsail BFF (static IP) which calls ALEX FHIR API.
 *
 * Flow:
 * 1. Validate request includes encounterId + patientId
 * 2. Ensure each file has a commit-ready source:
 *    - Desktop: base64Data provided by the browser
 *    - Mobile: s3Key is presigned to a downloadUrl (server-side), then passed to BFF
 * 3. Convert to legacy-compatible formats for Inbox Scan:
 *    - Images: TIFF (<= 1MB)
 *    - PDFs: pass through (<= 1MB)
 * 4. POST to BFF: /api/medtech/session/commit (DocumentReference write-back)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

import { s3ImageService } from '@/src/lib/services/session-storage';
import type { CommitRequest, CommitResponse } from '@/src/medtech/images-widget/types';

export const runtime = 'nodejs';

const BFF_BASE_URL = process.env.MEDTECH_BFF_URL || 'https://api.clinicpro.co.nz';
const MAX_ATTACHMENT_BYTES = 1024 * 1024; // 1MB (ALEX constraint)

type DetectedType = 'image/jpeg' | 'image/png' | 'image/tiff' | 'application/pdf' | null;

type BffCommitRequest = {
  encounterId: string;
  patientId: string;
  facilityId: string;
  correlationId?: string;
  files: Array<{
    clientRef: string;
    contentType?: string;
    title?: string;
    meta?: unknown;
    source:
      | { base64Data: string }
      | { downloadUrl: string };
  }>;
};

type BffCommitResponse = {
  files: Array<{
    clientRef: string;
    status: 'committed' | 'error';
    mediaId?: string;
    documentReferenceId?: string;
    warnings?: string[];
    error?: string;
  }>;
};

function stripDataUrlPrefix(base64OrDataUrl: string): { base64: string; hintedContentType: string | null } {
  // Supports: data:image/jpeg;base64,AAAA... and plain base64 AAAA...
  const trimmed = base64OrDataUrl.trim();
  if (!trimmed.startsWith('data:')) {
    return { base64: trimmed, hintedContentType: null };
  }

  const commaIndex = trimmed.indexOf(',');
  if (commaIndex < 0) {
    return { base64: trimmed, hintedContentType: null };
  }

  // data:<mime>;base64,<payload>
  const header = trimmed.slice(5, commaIndex); // after "data:"
  const mime = header.split(';')[0]?.trim() || null;
  const base64 = trimmed.slice(commaIndex + 1).trim();
  return { base64, hintedContentType: mime };
}

function sniffContentType(bytes: Uint8Array): DetectedType {
  if (bytes.length < 4) return null;

  // PDF: "%PDF"
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'application/pdf';
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8
    && bytes[0] === 0x89
    && bytes[1] === 0x50
    && bytes[2] === 0x4E
    && bytes[3] === 0x47
    && bytes[4] === 0x0D
    && bytes[5] === 0x0A
    && bytes[6] === 0x1A
    && bytes[7] === 0x0A
  ) {
    return 'image/png';
  }

  // TIFF (little endian): 49 49 2A 00 ; big endian: 4D 4D 00 2A
  if (
    (bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2A && bytes[3] === 0x00)
    || (bytes[0] === 0x4D && bytes[1] === 0x4D && bytes[2] === 0x00 && bytes[3] === 0x2A)
  ) {
    return 'image/tiff';
  }

  return null;
}

async function convertImageToTiffUnderLimit(inputBytes: Buffer): Promise<{ bytes: Buffer; warnings: string[] }> {
  const warnings: string[] = [];

  // Strategy: progressively resize + reduce JPEG-in-TIFF quality until under MAX_ATTACHMENT_BYTES.
  // NOTE: We intentionally produce TIFF because Medtech's Inbox Scan DocumentReference endpoint
  // only supports TIFF for images.
  const longestEdges = [1920, 1600, 1400, 1200, 1024, 896, 768, 640];
  const qualities = [80, 70, 60, 50, 40, 30];

  for (const longestEdge of longestEdges) {
    for (const quality of qualities) {
      try {
        const out = await sharp(inputBytes, { failOnError: false })
          .rotate() // honour EXIF orientation if present
          .resize({
            width: longestEdge,
            height: longestEdge,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .tiff({
            compression: 'jpeg',
            quality,
          })
          .toBuffer();

        if (out.length <= MAX_ATTACHMENT_BYTES) {
          if (longestEdge !== longestEdges[0] || quality !== qualities[0]) {
            warnings.push(`Converted to TIFF under 1MB (resize=${longestEdge}px, quality=${quality})`);
          }
          return { bytes: out, warnings };
        }
      } catch (err) {
        // Continue trying smaller settings; surface final error if all attempts fail.
        warnings.push(`TIFF conversion attempt failed (resize=${longestEdge}px, quality=${quality})`);
      }
    }
  }

  throw new Error('Image too large to convert to TIFF under 1MB');
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const correlationId = randomUUID();

  try {
    const body: CommitRequest = await request.json();

    if (!body.encounterId) {
      return NextResponse.json(
        { error: 'encounterId is required' },
        { status: 400 },
      );
    }

    // Phase 1C requirement: patientId must be provided by widget context.
    // We do NOT look up Patient from ALEX inside Vercel.
    if (!body.patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 },
      );
    }

    if (!body.facilityId) {
      return NextResponse.json(
        { error: 'facilityId is required' },
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
      encounterId: body.encounterId,
      fileCount: body.files.length,
      correlationId,
      facilityId: body.facilityId,
    });

    const { patientId, facilityId } = body;

    // Batch presign download URLs for mobile images (s3Key -> downloadUrl).
    const s3KeysToPresign = body.files
      .map(f => f.source?.s3Key)
      .filter((k): k is string => !!k);

    const presignedMap = s3KeysToPresign.length > 0
      ? await s3ImageService.generatePresignedDownloadUrls(s3KeysToPresign)
      : new Map<string, { downloadUrl: string; expiresAt: number }>();

    const localErrors = new Map<string, CommitResponse['files'][number]>();
    const bffFiles: BffCommitRequest['files'] = [];

    for (const file of body.files) {
      const { source, contentType } = file;

      if (source?.base64Data) {
        try {
          const { base64, hintedContentType } = stripDataUrlPrefix(source.base64Data);
          const bytes = Buffer.from(base64, 'base64');
          if (bytes.length === 0) {
            throw new Error('Invalid base64Data (empty)');
          }
          const sniffed = sniffContentType(bytes);
          const effectiveInputType = (sniffed || (hintedContentType as DetectedType) || (contentType as DetectedType) || null);

          // PDFs pass through; images convert to TIFF.
          if (effectiveInputType === 'application/pdf') {
            if (bytes.length > MAX_ATTACHMENT_BYTES) {
              throw new Error(`PDF too large: ${bytes.length} bytes (max ${MAX_ATTACHMENT_BYTES})`);
            }
            bffFiles.push({
              clientRef: file.fileId,
              contentType: 'application/pdf',
              title: file.meta?.title,
              meta: file.meta,
              source: { base64Data: bytes.toString('base64') },
            });
          } else {
            const { bytes: tiffBytes, warnings } = await convertImageToTiffUnderLimit(bytes);
            // Preserve warnings for the BFF response mapping; embed them in meta for now.
            // (BFF may also add warnings; CommitResponse supports warnings array.)
            bffFiles.push({
              clientRef: file.fileId,
              contentType: 'image/tiff',
              title: file.meta?.title,
              meta: { ...file.meta, _conversionWarnings: warnings },
              source: { base64Data: tiffBytes.toString('base64') },
            });
          }
        } catch (err) {
          localErrors.set(file.fileId, {
            fileId: file.fileId,
            status: 'error',
            error: err instanceof Error ? err.message : 'Failed to process base64Data',
          });
        }
        continue;
      }

      if (source?.s3Key) {
        const presigned = presignedMap.get(source.s3Key);
        if (!presigned?.downloadUrl) {
          localErrors.set(file.fileId, {
            fileId: file.fileId,
            status: 'error',
            error: `Failed to generate presigned downloadUrl for s3Key: ${source.s3Key}`,
          });
          continue;
        }

        try {
          const downloaded = await fetch(presigned.downloadUrl, { method: 'GET', cache: 'no-store' });
          if (!downloaded.ok) {
            const errorText = await downloaded.text().catch(() => '');
            throw new Error(`Failed to download image: ${downloaded.status} ${errorText}`.trim());
          }
          const arrayBuffer = await downloaded.arrayBuffer();
          const bytes = Buffer.from(arrayBuffer);
          if (bytes.length === 0) {
            throw new Error('Downloaded image was empty');
          }

          const headerContentType = downloaded.headers.get('content-type');
          const sniffed = sniffContentType(bytes);
          const effectiveInputType = (sniffed || (headerContentType as DetectedType) || (contentType as DetectedType) || null);

          if (effectiveInputType === 'application/pdf') {
            if (bytes.length > MAX_ATTACHMENT_BYTES) {
              throw new Error(`PDF too large: ${bytes.length} bytes (max ${MAX_ATTACHMENT_BYTES})`);
            }
            bffFiles.push({
              clientRef: file.fileId,
              contentType: 'application/pdf',
              title: file.meta?.title,
              meta: file.meta,
              source: { base64Data: bytes.toString('base64') },
            });
          } else {
            const { bytes: tiffBytes, warnings } = await convertImageToTiffUnderLimit(bytes);
            bffFiles.push({
              clientRef: file.fileId,
              contentType: 'image/tiff',
              title: file.meta?.title,
              meta: { ...file.meta, _conversionWarnings: warnings },
              source: { base64Data: tiffBytes.toString('base64') },
            });
          }
        } catch (err) {
          localErrors.set(file.fileId, {
            fileId: file.fileId,
            status: 'error',
            error: err instanceof Error ? err.message : 'Failed to process s3Key image',
          });
        }
        continue;
      }

      localErrors.set(file.fileId, {
        fileId: file.fileId,
        status: 'error',
        error: 'No commit source provided (expected base64Data or s3Key)',
      });
    }

    // If nothing can be committed, return per-file errors.
    if (bffFiles.length === 0) {
      return NextResponse.json(
        { files: body.files.map(f => localErrors.get(f.fileId)!).filter(Boolean) } as CommitResponse,
        { status: 200 },
      );
    }

    // Call Lightsail BFF (static IP); it writes DocumentReference to Inbox Scan in ALEX.
    const bffResponse = await fetch(`${BFF_BASE_URL}/api/medtech/session/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        encounterId: body.encounterId,
        patientId,
        facilityId,
        correlationId,
        files: bffFiles,
      } satisfies BffCommitRequest),
    });

    let bffPayload: BffCommitResponse | null = null;
    let bffErrorText: string | null = null;
    try {
      bffPayload = await bffResponse.json();
    } catch {
      bffErrorText = await bffResponse.text().catch(() => null);
    }

    if (!bffResponse.ok || !bffPayload) {
      const details = bffPayload ? JSON.stringify(bffPayload) : (bffErrorText || '(no body)');
      throw new Error(`BFF commit failed: ${bffResponse.status} ${details}`);
    }

    const bffResultsByFileId = new Map<string, CommitResponse['files'][number]>();
    for (const r of bffPayload.files || []) {
      // Pull through any conversion warnings we attached to meta (if present).
      const conversionWarnings = (bffFiles.find(f => f.clientRef === r.clientRef)?.meta as any)?._conversionWarnings as string[] | undefined;
      bffResultsByFileId.set(r.clientRef, {
        fileId: r.clientRef,
        status: r.status,
        documentReferenceId: r.documentReferenceId,
        mediaId: r.mediaId,
        warnings: [...(r.warnings || []), ...(conversionWarnings || [])],
        error: r.error,
      });
    }

    const duration = Date.now() - startTime;

    // Check if all files succeeded
    const mergedResults: CommitResponse['files'] = body.files.map((f) => {
      return (
        bffResultsByFileId.get(f.fileId)
        || localErrors.get(f.fileId)
        || { fileId: f.fileId, status: 'error', error: 'Missing commit result' }
      );
    });

    const successCount = mergedResults.filter(r => r.status === 'committed').length;
    const errorCount = mergedResults.filter(r => r.status === 'error').length;

    console.log('[Medtech Commit] Commit complete', {
      duration,
      successCount,
      errorCount,
      correlationId,
      mediaIds: mergedResults
        .map(r => r.mediaId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    });

    return NextResponse.json({
      correlationId,
      files: mergedResults,
    } as CommitResponse);
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('[Medtech Commit] Commit failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
      correlationId,
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
