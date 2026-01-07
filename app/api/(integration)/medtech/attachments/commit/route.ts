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
 * 3. POST to BFF: /api/medtech/session/commit
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { s3ImageService } from '@/src/lib/services/session-storage';
import type { CommitRequest, CommitResponse } from '@/src/medtech/images-widget/types';

const BFF_BASE_URL = process.env.MEDTECH_BFF_URL || 'https://api.clinicpro.co.nz';

type BffCommitRequest = {
  encounterId: string;
  patientId: string;
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

export async function POST(request: NextRequest) {
  const startTime = Date.now();

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

    if (!body.files || body.files.length === 0) {
      return NextResponse.json(
        { error: 'files array is required' },
        { status: 400 },
      );
    }

    console.log('[Medtech Commit] Starting commit', {
      encounterId: body.encounterId,
      fileCount: body.files.length,
    });

    const { patientId } = body;

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
        bffFiles.push({
          clientRef: file.fileId,
          contentType: contentType || 'image/jpeg',
          title: file.meta?.title,
          meta: file.meta,
          source: { base64Data: source.base64Data },
        });
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

        bffFiles.push({
          clientRef: file.fileId,
          contentType: contentType || 'image/jpeg',
          title: file.meta?.title,
          meta: file.meta,
          source: { downloadUrl: presigned.downloadUrl },
        });
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

    // Call Lightsail BFF (static IP); it posts FHIR Media to ALEX.
    const bffResponse = await fetch(`${BFF_BASE_URL}/api/medtech/session/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        encounterId: body.encounterId,
        patientId,
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
      bffResultsByFileId.set(r.clientRef, {
        fileId: r.clientRef,
        status: r.status,
        documentReferenceId: r.documentReferenceId,
        mediaId: r.mediaId,
        warnings: r.warnings || [],
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
    });

    return NextResponse.json({
      files: mergedResults,
    } as CommitResponse);
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('[Medtech Commit] Commit failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    });

    return NextResponse.json(
      {
        error: 'Failed to commit attachments',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
