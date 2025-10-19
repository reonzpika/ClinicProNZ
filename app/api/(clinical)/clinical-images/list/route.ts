import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { auth } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { and, desc, eq, inArray } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { clinicalImageAnalyses, clinicalImageMetadata, patientSessions } from '@/db/schema';
import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';

// Initialize S3 client for NZ region (use explicit credentials for consistent performance)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Helper function to get latest analysis for multiple image keys
async function getImageAnalyses(userId: string, imageKeys: string[]) {
  if (imageKeys.length === 0) {
 return {};
}

  const db = getDb();
  // Fetch only analyses for the requested keys to reduce load
  const analyses = await db
    .select()
    .from(clinicalImageAnalyses)
    .where(
      and(
        eq(clinicalImageAnalyses.userId, userId),
        inArray(clinicalImageAnalyses.imageKey, imageKeys),
      ),
    )
    .orderBy(desc(clinicalImageAnalyses.analyzedAt));

  // Create a map of imageKey -> latest analysis
  const analysisMap: Record<string, any> = {};

  for (const analysis of analyses) {
    if (!analysisMap[analysis.imageKey]) {
      analysisMap[analysis.imageKey] = {
        id: analysis.id,
        prompt: analysis.prompt,
        result: analysis.result,
        modelUsed: analysis.modelUsed,
        analyzedAt: analysis.analyzedAt.toISOString(),
      };
    }
  }

  return analysisMap;
}

// Removed mass presign helper: URLs are fetched lazily via /api/uploads/download

export async function GET(req: NextRequest) {
  try {
    // Extract RBAC context and check authentication
    const context = await extractRBACContext(req);
    const permissionCheck = await checkCoreAccess(context);

    if (!permissionCheck.allowed) {
      return NextResponse.json({
        error: permissionCheck.reason || 'Access denied',
      }, { status: 403 });
    }

    // Authentication (prefer RBAC context to avoid hard dependency on Clerk during preview builds)
    let userId = context.userId;
    if (!userId) {
      const fromClerk = await auth();
      userId = fromClerk.userId;
    }
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate S3 configuration early and degrade gracefully
    if (!BUCKET_NAME) {
      console.warn('S3_BUCKET_NAME is not set. Returning empty image list.');
      return NextResponse.json({ images: [], count: 0 });
    }

    const allImages: any[] = [];

    // Optional filter by sessionId; default to user scope only
    const sessionId = req.nextUrl.searchParams.get('sessionId') || undefined;
    const clinicalImagesPrefix = sessionId
      ? `clinical-images/${userId}/${sessionId}/`
      : `clinical-images/${userId}/`;

    const clinicalCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: clinicalImagesPrefix,
      MaxKeys: 100,
    });

    try {
      const clinicalResponse = await s3Client.send(clinicalCommand);

      if (clinicalResponse.Contents) {
        const clinicalImages = clinicalResponse.Contents
          .filter(obj => obj.Key && obj.Size && obj.Size > 0)
          .map((obj) => {
            const filename = obj.Key!.split('/').pop() || 'unknown';
            const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
            const segments = obj.Key!.split('/');
            // Path pattern: clinical-images/{userId}/{optionalSessionId}/{file}
            const derivedSessionId = (segments.length >= 4) ? segments[2] : undefined;

            // Determine MIME type from extension
            let mimeType = 'image/jpeg';
            if (fileExtension === 'png') {
              mimeType = 'image/png';
            } else if (fileExtension === 'webp') {
              mimeType = 'image/webp';
            } else if (fileExtension === 'gif') {
              mimeType = 'image/gif';
            }

            // Derive thumbnail key by convention (best-effort): thumbnails/clinical-images/.../filename
            const thumbKeyGuess = `thumbnails/${obj.Key!}`;
            // Best-effort: read client-hash from S3 object metadata (requires a HeadObject call)
            // Avoid extra round-trips for all objects; we'll fetch lazily for recent ones below
            return {
              id: `clinical-${obj.Key!.replace(/\//g, '-')}`,
              key: obj.Key!,
              filename,
              mimeType,
              size: obj.Size!,
              uploadedAt: obj.LastModified?.toISOString() || new Date().toISOString(),
              source: 'clinical',
              ...(derivedSessionId ? { sessionId: derivedSessionId } : {}),
              thumbnailKey: thumbKeyGuess,
            };
          });

        allImages.push(...clinicalImages);
      }
    } catch (error) {
      console.error('Error fetching clinical images:', error);
    }
    // Removed legacy consultations listing from default endpoint for performance

    // Sort by newest first
    allImages.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    // Get analysis data for all images
    const imageKeys = allImages.map(img => img.key);
    const analysisMap = await getImageAnalyses(userId, imageKeys);

    // Fetch metadata (display names) for returned keys
    let metadataMap: Record<string, { displayName?: string | null; patientName?: string | null; identifier?: string | null }> = {};
    if (imageKeys.length > 0) {
      try {
        const db = getDb();
        const rows = await db
          .select({ imageKey: clinicalImageMetadata.imageKey, displayName: clinicalImageMetadata.displayName, patientName: clinicalImageMetadata.patientName, identifier: clinicalImageMetadata.identifier })
          .from(clinicalImageMetadata)
          .where(inArray(clinicalImageMetadata.imageKey, imageKeys));
        metadataMap = Object.fromEntries(rows.map(r => [r.imageKey, { displayName: r.displayName, patientName: r.patientName, identifier: r.identifier }]));
      } catch (e) {
        console.warn('Failed to fetch clinical_image_metadata:', e);
      }
    }

    // Optionally join session names for grouping headings on UI
    const sessionIds = Array.from(new Set(allImages.map(i => i.sessionId).filter(Boolean))) as string[];
    let sessionNameMap: Record<string, string> = {};
    if (sessionIds.length > 0) {
      try {
        const db = getDb();
        const rows = await db
          .select({ id: patientSessions.id, patientName: patientSessions.patientName })
          .from(patientSessions)
          .where(inArray(patientSessions.id, sessionIds));
        sessionNameMap = Object.fromEntries(rows.map(r => [r.id, r.patientName || 'Untitled Session']));
      } catch {}
    }

    // No mass presign here; clients fetch per-tile via /api/uploads/download
    // Best-effort: attach presigned thumbnail URLs when the thumbnail object exists
    const imagesWithData = await Promise.all(allImages.map(async (image) => {
      // No S3 HEADs in list; minimise S3 calls. ClientHash omitted unless persisted elsewhere.
      return {
        ...image,
        displayName: metadataMap[image.key]?.displayName || undefined,
        patientName: metadataMap[image.key]?.patientName || undefined,
        identifier: metadataMap[image.key]?.identifier || undefined,
        sessionName: image.sessionId ? sessionNameMap[image.sessionId] : undefined,
        analysis: analysisMap[image.key] || undefined,
        // Provide proxy path; client will lazy-fetch and fallback on error if missing
        ...(image.thumbnailKey ? { thumbnailUrlPath: `/api/images/thumb?key=${encodeURIComponent(image.thumbnailKey)}` } : {}),
      };
    }));

    return NextResponse.json({
      images: imagesWithData,
      count: imagesWithData.length,
    });
  } catch (error) {
    console.error('Error listing user images:', error);
    return NextResponse.json({
      error: 'Failed to list images',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    }, { status: 500 });
  }
}
