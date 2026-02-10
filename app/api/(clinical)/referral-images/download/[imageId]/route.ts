import { getDb } from 'database/client';
import { and, desc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { imageToolUploads } from '@/db/schema';
import { getImageToolObject } from '@/src/lib/image-tool/s3';
import { generateFilename } from '@/src/lib/services/referral-images/utils';

export const runtime = 'nodejs';

type RouteParams = {
  params: Promise<{
    imageId: string;
  }>;
};

/**
 * GET /api/referral-images/download/[imageId]?u=userId
 *
 * Proxy download: stream image from S3 so the client gets same-origin response
 * (avoids CORS issues with direct S3 presigned URLs). Requires u=userId so
 * users can only download their own images.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { imageId } = await params;
  const userId = req.nextUrl.searchParams.get('u');

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing user ID (u)' },
      { status: 400 },
    );
  }

  try {
    const db = getDb();

    const imageRow = await db
      .select({
        s3Key: imageToolUploads.s3Key,
        side: imageToolUploads.side,
        description: imageToolUploads.description,
        createdAt: imageToolUploads.createdAt,
        imageId: imageToolUploads.imageId,
      })
      .from(imageToolUploads)
      .where(
        and(
          eq(imageToolUploads.imageId, imageId),
          eq(imageToolUploads.userId, userId),
        ),
      )
      .orderBy(desc(imageToolUploads.createdAt))
      .limit(1);

    if (!imageRow.length) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 },
      );
    }

    const image = imageRow[0];
    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 },
      );
    }

    const filename = generateFilename({
      imageId: image.imageId,
      side: image.side || undefined,
      description: image.description || undefined,
      createdAt: image.createdAt,
    });

    const buffer = await getImageToolObject(image.s3Key);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (error) {
    console.error('[referral-images/download] Error:', error);
    return NextResponse.json(
      { error: 'Failed to download image' },
      { status: 500 },
    );
  }
}
