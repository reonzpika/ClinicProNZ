/**
 * POST /api/medtech/mobile/upload
 *
 * Upload image(s) to mobile session
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { addImageToSession, getMobileSession } from '@/src/lib/services/medtech/mobile-session-storage';
import type { CodeableConcept } from '@/src/medtech/images-widget/types';

type UploadRequest = {
  token: string;
  images: Array<{
    contentType: string;
    sizeBytes: number;
    base64Data: string;
    metadata?: {
      bodySite?: CodeableConcept;
      laterality?: CodeableConcept;
      view?: CodeableConcept;
      type?: CodeableConcept;
      label?: string;
    };
  }>;
};

export async function POST(request: NextRequest) {
  try {
    const body: UploadRequest = await request.json();
    const { token, images } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'token is required' },
        { status: 400 },
      );
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'images array is required and must not be empty' },
        { status: 400 },
      );
    }

    // Validate session exists
    const session = await getMobileSession(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 },
      );
    }

    // Upload each image
    const uploadedImages = await Promise.all(
      images.map(async (image) => {
        const imageId = await addImageToSession(token, {
          fileId: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          contentType: image.contentType,
          sizeBytes: image.sizeBytes,
          base64Data: image.base64Data,
          metadata: image.metadata,
        });

        return {
          id: imageId,
          contentType: image.contentType,
          sizeBytes: image.sizeBytes,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      uploaded: uploadedImages.length,
      images: uploadedImages,
    });
  } catch (error) {
    console.error('[API] POST /api/medtech/mobile/upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 },
    );
  }
}
