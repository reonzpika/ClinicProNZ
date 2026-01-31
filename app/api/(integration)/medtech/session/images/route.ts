/**
 * POST /api/medtech/session/images
 *
 * Add image to session after S3 upload + publish Ably event
 *
 * Request:
 * {
 *   encounterId: string,
 *   s3Key: string,
 *   metadata?: {
 *     laterality?: { code: string, display: string },
 *     bodySite?: { code: string, display: string },
 *     notes?: string
 *   }
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   imageCount: number
 * }
 */

import * as Ably from 'ably';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import type { SessionImage } from '@/src/lib/services/session-storage';
import { redisSessionService } from '@/src/lib/services/session-storage';

// Initialize Ably client (server-side)
const getAblyClient = () => {
  return new Ably.Realtime({
    key: process.env.ABLY_API_KEY!,
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { encounterId, s3Key, metadata } = body;

    // Validate required fields
    if (!encounterId || !s3Key) {
      return NextResponse.json(
        { error: 'encounterId and s3Key are required' },
        { status: 400 },
      );
    }

    console.log('[Session Images] Adding image', {
      encounterId,
      s3Key,
      hasMetadata: !!metadata,
    });

    // Step 1: Add image to Redis session
    const image: SessionImage = {
      s3Key,
      metadata,
      uploadedAt: Date.now(),
    };

    const session = await redisSessionService.addImage(encounterId, image);

    console.log('[Session Images] Image added to session', {
      encounterId,
      imageCount: session.images.length,
    });

    // Step 2: Publish Ably event for real-time sync
    const ably = getAblyClient();
    const channelName = `session:${encounterId}`;
    const channel = ably.channels.get(channelName);

    await channel.publish('image-uploaded', {
      s3Key,
      metadata,
      timestamp: Date.now(),
      imageCount: session.images.length,
    });

    console.log('[Session Images] Ably event published', {
      channel: channelName,
      encounterId,
    });

    // Close Ably connection after publishing
    ably.close();

    return NextResponse.json({
      success: true,
      imageCount: session.images.length,
    });
  } catch (error) {
    console.error('[Session Images] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to add image to session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
