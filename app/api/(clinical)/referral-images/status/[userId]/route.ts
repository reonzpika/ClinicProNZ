import { getDb } from 'database/client';
import { and, desc, eq, gt } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { imageToolUploads, imageToolUsage, users } from '@/db/schema';
import { generateImageToolPresignedDownload } from '@/src/lib/image-tool/s3';
import { calculateLimit, generateFilename, getCurrentMonth, getMonthFromDate } from '@/src/lib/services/referral-images/utils';

export const runtime = 'nodejs';

type RouteParams = {
  params: Promise<{
    userId: string;
  }>;
};

/**
 * GET /api/referral-images/status/[userId]
 *
 * Get usage status and uploaded images for a user
 *
 * Response:
 * - tier: 'free' | 'premium'
 * - imageCount: number
 * - limit: number
 * - limitReached: boolean
 * - graceUnlocksRemaining: number
 * - images: Array<{...}>
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { userId } = await params;

  try {
    const db = getDb();
    const currentMonth = getCurrentMonth();
    const now = new Date();

    // Get user tier and created date
    const userRow = await db
      .select({
        tier: users.imageTier,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = userRow[0];
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    const tier = user.tier || 'free';
    const accountCreatedMonth = getMonthFromDate(user.createdAt);

    // Get usage for current month
    const usageRow = await db
      .select({
        imageCount: imageToolUsage.imageCount,
        graceUnlocksUsed: imageToolUsage.graceUnlocksUsed,
      })
      .from(imageToolUsage)
      .where(
        and(
          eq(imageToolUsage.userId, userId),
          eq(imageToolUsage.month, currentMonth),
        ),
      )
      .limit(1);

    const imageCount = usageRow[0]?.imageCount || 0;
    const graceUnlocksUsed = usageRow[0]?.graceUnlocksUsed || 0;

    // Calculate limit
    const limit = calculateLimit(tier, accountCreatedMonth, currentMonth, graceUnlocksUsed);
    const limitReached = imageCount >= limit && limit !== 999999;
    const graceUnlocksRemaining = Math.max(0, 2 - graceUnlocksUsed);

    // Get images from last 24h (not expired)
    const imageRows = await db
      .select({
        id: imageToolUploads.id,
        imageId: imageToolUploads.imageId,
        s3Key: imageToolUploads.s3Key,
        fileSize: imageToolUploads.fileSize,
        side: imageToolUploads.side,
        description: imageToolUploads.description,
        createdAt: imageToolUploads.createdAt,
      })
      .from(imageToolUploads)
      .where(
        and(
          eq(imageToolUploads.userId, userId),
          gt(imageToolUploads.expiresAt, now),
        ),
      )
      .orderBy(desc(imageToolUploads.createdAt))
      .limit(50);

    // Generate presigned URLs and filenames
    const images = await Promise.all(
      imageRows.map(async (row) => {
        const signed = await generateImageToolPresignedDownload(row.s3Key);
        const filename = generateFilename({
          imageId: row.imageId,
          side: row.side || undefined,
          description: row.description || undefined,
          createdAt: row.createdAt,
        });

        return {
          imageId: row.imageId,
          presignedUrl: signed.downloadUrl,
          filename,
          fileSize: row.fileSize || 0,
          createdAt: row.createdAt.toISOString(),
          metadata: {
            side: row.side as 'R' | 'L' | undefined,
            description: row.description || undefined,
          },
        };
      }),
    );

    return NextResponse.json({
      tier,
      imageCount,
      limit,
      limitReached,
      graceUnlocksRemaining,
      images,
    });
  } catch (error) {
    console.error('[referral-images/status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 },
    );
  }
}
