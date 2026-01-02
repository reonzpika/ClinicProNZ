/**
 * POST /api/medtech/session/presigned-url
 *
 * Generate presigned URL for S3 upload
 *
 * Request:
 * {
 *   encounterId: string,
 *   imageId: string,
 *   contentType?: string (default: 'image/jpeg')
 * }
 *
 * Response:
 * {
 *   uploadUrl: string (presigned PUT URL),
 *   s3Key: string,
 *   expiresAt: number (timestamp)
 * }
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { redisSessionService, s3ImageService } from '@/src/lib/services/session-storage';

const MAX_IMAGES_PER_SESSION = 20;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { encounterId, imageId, contentType = 'image/jpeg' } = body;

    // Validate required fields
    if (!encounterId || !imageId) {
      return NextResponse.json(
        { error: 'encounterId and imageId are required' },
        { status: 400 },
      );
    }

    console.log('[Presigned URL] Generating upload URL', {
      encounterId,
      imageId: imageId.slice(0, 8),
      contentType,
    });

    // Step 1: Validate session exists
    const session = await redisSessionService.getSession(encounterId);

    if (!session) {
      console.warn('[Presigned URL] Session not found', { encounterId });
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 },
      );
    }

    // Step 2: Check image limit
    if (session.images.length >= MAX_IMAGES_PER_SESSION) {
      console.warn('[Presigned URL] Image limit reached', {
        encounterId,
        currentCount: session.images.length,
        limit: MAX_IMAGES_PER_SESSION,
      });

      return NextResponse.json(
        {
          error: 'Image limit reached',
          message: `Maximum ${MAX_IMAGES_PER_SESSION} images per session`,
        },
        { status: 400 },
      );
    }

    // Step 3: Generate presigned URL for S3 upload
    const result = await s3ImageService.generatePresignedUploadUrl(
      encounterId,
      imageId,
      contentType,
    );

    // Step 4: Touch session (refresh TTL)
    await redisSessionService.touchSession(encounterId);

    console.log('[Presigned URL] Upload URL generated', {
      encounterId,
      imageId: imageId.slice(0, 8),
      s3Key: result.s3Key,
      expiresAt: new Date(result.expiresAt).toISOString(),
    });

    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      s3Key: result.s3Key,
      expiresAt: result.expiresAt,
    });
  }
  catch (error) {
    console.error('[Presigned URL] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate presigned URL',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
