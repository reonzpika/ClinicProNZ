/**
 * GET /api/medtech/mobile/session/[token]/images
 *
 * Get all images for a session (for desktop polling)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getSessionImages } from '@/src/lib/services/medtech/mobile-session-storage';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'token is required' },
        { status: 400 },
      );
    }

    const images = await getSessionImages(token);

    // Return images with base64Data included
    return NextResponse.json({
      images: images.map(img => ({
        id: img.id,
        contentType: img.contentType,
        sizeBytes: img.sizeBytes,
        metadata: img.metadata,
        uploadedAt: img.uploadedAt,
        base64Data: img.base64Data, // Include base64 data for desktop to reconstruct File
      })),
      count: images.length,
    });
  } catch (error) {
    console.error('[API] GET /api/medtech/mobile/session/[token]/images error:', error);
    return NextResponse.json(
      { error: 'Failed to get session images' },
      { status: 500 },
    );
  }
}
