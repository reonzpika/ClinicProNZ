import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { auth } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { and, desc, eq, inArray } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { clinicalImageAnalyses } from '@/db/schema';
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

            return {
              id: `clinical-${obj.Key!.replace(/\//g, '-')}`,
              key: obj.Key!,
              filename,
              mimeType,
              size: obj.Size!,
              uploadedAt: obj.LastModified?.toISOString() || new Date().toISOString(),
              source: 'clinical',
              ...(derivedSessionId ? { sessionId: derivedSessionId } : {}),
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

    // No mass presign here; clients fetch per-tile via /api/uploads/download
    const imagesWithData = allImages.map(image => ({
      ...image,
      analysis: analysisMap[image.key] || undefined,
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
