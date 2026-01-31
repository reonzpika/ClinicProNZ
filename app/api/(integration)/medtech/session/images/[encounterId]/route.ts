/**
 * GET /api/medtech/session/images/[encounterId]
 *
 * Get all images for encounter with presigned download URLs
 *
 * Response:
 * {
 *   images: [
 *     {
 *       s3Key: string,
 *       downloadUrl: string,
 *       expiresAt: number,
 *       metadata?: {...},
 *       uploadedAt: number
 *     }
 *   ],
 *   sessionCreatedAt: number,
 *   lastActivity: number
 * }
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { redisSessionService, s3ImageService } from '@/src/lib/services/session-storage';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ encounterId: string }> },
) {
  try {
    const { encounterId } = await params;

    console.log('[Get Session Images] Fetching images', { encounterId });

    // Step 1: Get session from Redis
    const session = await redisSessionService.getSession(encounterId);

    if (!session) {
      console.warn('[Get Session Images] Session not found', { encounterId });
      return NextResponse.json({
        images: [],
        sessionCreatedAt: null,
        lastActivity: null,
      });
    }

    // Step 2: Generate presigned download URLs for all images
    const s3Keys = session.images.map(img => img.s3Key);
    const downloadUrls = await s3ImageService.generatePresignedDownloadUrls(s3Keys);

    // Step 3: Build response with download URLs
    const images = session.images.map((img) => {
      const urlData = downloadUrls.get(img.s3Key);

      return {
        s3Key: img.s3Key,
        downloadUrl: urlData?.downloadUrl || null,
        expiresAt: urlData?.expiresAt || null,
        metadata: img.metadata,
        uploadedAt: img.uploadedAt,
      };
    });

    // Step 4: Touch session (refresh TTL)
    await redisSessionService.touchSession(encounterId);

    console.log('[Get Session Images] Images fetched', {
      encounterId,
      imageCount: images.length,
      withDownloadUrls: images.filter(img => img.downloadUrl).length,
    });

    return NextResponse.json({
      images,
      sessionCreatedAt: session.createdAt,
      lastActivity: session.lastActivity,
      patientId: session.patientId,
      facilityId: session.facilityId,
    });
  } catch (error) {
    console.error('[Get Session Images] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get session images',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
