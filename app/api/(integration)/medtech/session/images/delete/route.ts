/**
 * DELETE /api/medtech/session/images/delete
 *
 * Remove image from session by s3Key
 *
 * Request:
 * {
 *   encounterId: string,
 *   s3Key: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   imageCount: number
 * }
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { redisSessionService } from '@/src/lib/services/session-storage';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { encounterId, s3Key } = body;

    if (!encounterId || !s3Key) {
      return NextResponse.json(
        { error: 'encounterId and s3Key are required' },
        { status: 400 },
      );
    }

    console.log('[Delete Image] Removing image from session', {
      encounterId,
      s3Key,
    });

    // Get session
    const session = await redisSessionService.getSession(encounterId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 },
      );
    }

    // Find and remove image by s3Key
    const initialLength = session.images.length;
    session.images = session.images.filter(img => img.s3Key !== s3Key);

    if (session.images.length === initialLength) {
      return NextResponse.json(
        { error: 'Image not found in session' },
        { status: 404 },
      );
    }

    session.lastActivity = Date.now();

    // Update session using the service's public updateSession method
    await redisSessionService.updateSession(encounterId, session);

    console.log('[Delete Image] Image removed successfully', {
      encounterId,
      s3Key,
      remainingCount: session.images.length,
    });

    return NextResponse.json({
      success: true,
      imageCount: session.images.length,
    });
  } catch (error) {
    console.error('[Delete Image] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete image',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
