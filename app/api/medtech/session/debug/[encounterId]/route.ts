/**
 * GET /api/medtech/session/debug/[encounterId]
 *
 * Debug endpoint to inspect session data
 * (Remove this in production)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { redisSessionService } from '@/src/lib/services/session-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ encounterId: string }> },
) {
  try {
    const { encounterId } = await params;

    console.log('[Debug] Fetching session', { encounterId });

    const session = await redisSessionService.getSession(encounterId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      session,
      imageCount: session.images.length,
      images: session.images.map((img, idx) => ({
        index: idx,
        s3Key: img.s3Key,
        metadata: img.metadata,
        uploadedAt: new Date(img.uploadedAt).toISOString(),
      })),
    });
  }
  catch (error) {
    console.error('[Debug] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
