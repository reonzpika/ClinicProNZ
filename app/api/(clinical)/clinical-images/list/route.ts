import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { auth } from '@clerk/nextjs/server';
import { desc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getDb } from 'database/client';
import { clinicalImageAnalyses, patientSessions } from '@/db/schema';
import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';

// Initialize S3 client for NZ region (avoid passing undefined credentials)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Helper function to get latest analysis for multiple image keys
async function getImageAnalyses(userId: string, imageKeys: string[]) {
  if (imageKeys.length === 0) {
 return {};
}

  const db = getDb();
  const analyses = await db
    .select()
    .from(clinicalImageAnalyses)
    .where(eq(clinicalImageAnalyses.userId, userId))
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

// Helper function to generate presigned URLs for multiple images
async function generatePresignedUrls(imageKeys: string[], bucketName: string): Promise<Record<string, string>> {
  const urlPromises = imageKeys.map(async (key) => {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600, // 1 hour expiration (same as individual calls)
      });

      return { key, url: presignedUrl };
    } catch (error) {
      console.error(`Failed to generate presigned URL for ${key}:`, error);
      return { key, url: null };
    }
  });

  const results = await Promise.all(urlPromises);

  // Convert array to object map
  const urlMap: Record<string, string> = {};
  for (const result of results) {
    if (result.url) {
      urlMap[result.key] = result.url;
    }
  }

  return urlMap;
}

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
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

    // 1. Fetch new clinical images (user-based path)
    const clinicalImagesPrefix = `clinical-images/${userId}/`;

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
            const sessionId = (segments.length >= 4) ? segments[2] : undefined;

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
              ...(sessionId ? { sessionId } : {}),
            };
          });

        allImages.push(...clinicalImages);
      }
    } catch (error) {
      console.error('Error fetching clinical images:', error);
    }

    // 2. Fetch consultation images (legacy)
    // Get all user's patient sessions
    const userSessions = await db
      .select({ id: patientSessions.id })
      .from(patientSessions)
      .where(eq(patientSessions.userId, userId));

    // List images from consultations prefix for each session
    for (const session of userSessions) {
      const consultationPrefix = `consultations/${session.id}/`;

      const consultationCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: consultationPrefix,
        MaxKeys: 100,
      });

      try {
        const consultationResponse = await s3Client.send(consultationCommand);

        if (consultationResponse.Contents) {
          const consultationImages = consultationResponse.Contents
            .filter(obj => obj.Key && obj.Size && obj.Size > 0)
            .map((obj) => {
              const filename = obj.Key!.split('/').pop() || 'unknown';
              const fileExtension = filename.split('.').pop()?.toLowerCase() || '';

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
                id: `consultation-${obj.Key!.replace('/', '-')}`,
                key: obj.Key!,
                filename,
                mimeType,
                size: obj.Size!,
                uploadedAt: obj.LastModified?.toISOString() || new Date().toISOString(),
                source: 'consultation',
                sessionId: session.id,
              };
            });

          allImages.push(...consultationImages);
        }
      } catch (error) {
        console.error(`Error fetching images for session ${session.id}:`, error);
        // Continue with other sessions
      }
    }

    // Sort by newest first
    allImages.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    // Get analysis data for all images
    const imageKeys = allImages.map(img => img.key);
    const analysisMap = await getImageAnalyses(userId, imageKeys);

    // Generate presigned URLs for all images (performance optimization)
    const urlMap = await generatePresignedUrls(imageKeys, BUCKET_NAME);

    // Add analysis data and thumbnail URLs to images
    const imagesWithData = allImages.map(image => ({
      ...image,
      analysis: analysisMap[image.key] || undefined,
      thumbnailUrl: urlMap[image.key] || undefined,
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
