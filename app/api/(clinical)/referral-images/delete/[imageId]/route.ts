import { getDb } from 'database/client';
import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { imageToolUploads } from '@/db/schema';
import { deleteImageToolObject } from '@/src/lib/image-tool/s3';

export const runtime = 'nodejs';

type RouteParams = {
  params: Promise<{
    imageId: string;
  }>;
};

/**
 * DELETE /api/referral-images/delete/[imageId]?u=userId
 *
 * Delete a single image. User can only delete their own images (userId from query param u).
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { imageId } = await params;
  const requestUserId = req.nextUrl.searchParams.get('u');

  if (!requestUserId) {
    return NextResponse.json(
      { error: 'Missing user ID (query param u required)' },
      { status: 400 },
    );
  }

  try {
    const db = getDb();

    const imageRow = await db
      .select({
        userId: imageToolUploads.userId,
        s3Key: imageToolUploads.s3Key,
      })
      .from(imageToolUploads)
      .where(eq(imageToolUploads.imageId, imageId))
      .limit(1);

    if (!imageRow.length) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 },
      );
    }

    const row = imageRow[0];
    if (!row) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 },
      );
    }

    if (row.userId !== requestUserId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 },
      );
    }

    await db
      .delete(imageToolUploads)
      .where(and(
        eq(imageToolUploads.imageId, imageId),
        eq(imageToolUploads.userId, requestUserId),
      ));

    try {
      await deleteImageToolObject(row.s3Key);
    } catch (s3Err) {
      console.error('[referral-images/delete] S3 delete failed (DB row already removed):', row.s3Key, s3Err);
      // Row is already deleted; return success. S3 object will expire via lifecycle.
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[referral-images/delete] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 },
    );
  }
}
