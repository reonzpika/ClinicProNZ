import { getDb } from 'database/client';
import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

import { imageToolUploads } from '@/db/schema';
import { getImageToolObject, putImageToolObject } from '@/src/lib/image-tool/s3';

export const runtime = 'nodejs';

type RouteParams = {
  params: Promise<{
    imageId: string;
  }>;
};

/**
 * POST /api/referral-images/rotate/[imageId]?u=userId
 *
 * Body: { degrees: number } (e.g. 90 or -90)
 *
 * Rotate image in S3 in-place. User can only rotate their own images.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { imageId } = await params;
  const requestUserId = req.nextUrl.searchParams.get('u');

  if (!requestUserId) {
    return NextResponse.json(
      { error: 'Missing user ID (query param u required)' },
      { status: 400 },
    );
  }

  let body: { degrees?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const degrees = body.degrees;
  if (typeof degrees !== 'number' || ![-270, -180, -90, 90, 180, 270].includes(degrees)) {
    return NextResponse.json(
      { error: 'degrees must be one of: -270, -180, -90, 90, 180, 270' },
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
    if (!row || row.userId !== requestUserId) {
      return NextResponse.json(
        { error: row ? 'Forbidden' : 'Image not found' },
        { status: row ? 403 : 404 },
      );
    }

    const buffer = await getImageToolObject(row.s3Key);
    const rotatedBuffer = await sharp(buffer)
      .rotate(degrees)
      .jpeg({ quality: 85 })
      .toBuffer();

    await putImageToolObject(row.s3Key, rotatedBuffer);

    await db
      .update(imageToolUploads)
      .set({ fileSize: rotatedBuffer.length })
      .where(
        and(
          eq(imageToolUploads.imageId, imageId),
          eq(imageToolUploads.userId, requestUserId),
        ),
      );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[referral-images/rotate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to rotate image' },
      { status: 500 },
    );
  }
}
