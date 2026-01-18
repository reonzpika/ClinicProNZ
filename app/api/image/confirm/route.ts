import { getDb } from 'database/client';
import { and, eq, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { imageToolUploads, imageToolUsage } from '@/db/schema';
import { getImageToolUsage, getNzMonthKey, recordImageToolUpload, resolveImageToolUserIdFromToken } from '@/src/lib/image-tool/shared';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as any;
    const token = body?.u as string | undefined;
    const imageId = body?.imageId as string | undefined;
    const s3Key = body?.s3Key as string | undefined;
    const fileSize = body?.fileSize as number | undefined;

    if (!token || !imageId || !s3Key) {
      return NextResponse.json({ error: 'u, imageId, and s3Key are required' }, { status: 400 });
    }

    const userId = await resolveImageToolUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
    }

    // Basic key ownership check
    if (!s3Key.startsWith(`image/${userId}/`)) {
      return NextResponse.json({ error: 'Invalid s3Key' }, { status: 400 });
    }

    const db = getDb();

    // Idempotency: if this exact key already exists for this user, do not double-count
    const existing = await db
      .select({ id: imageToolUploads.id })
      .from(imageToolUploads)
      .where(and(eq(imageToolUploads.userId, userId), eq(imageToolUploads.s3Key, s3Key)))
      .limit(1);

    if (!existing[0]) {
      // Record upload metadata
      await recordImageToolUpload({ userId, imageId, s3Key, fileSize: typeof fileSize === 'number' ? fileSize : null });

      // Increment monthly usage
      const month = getNzMonthKey();
      await db
        .insert(imageToolUsage)
        .values({
          userId,
          month,
          imageCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [imageToolUsage.userId, imageToolUsage.month],
          set: {
            imageCount: sql`${imageToolUsage.imageCount} + 1`,
            updatedAt: new Date(),
          },
        });
    }

    const usage = await getImageToolUsage(userId);
    return NextResponse.json({
      success: true,
      tier: usage.tier,
      imagesUsedThisMonth: usage.imagesUsedThisMonth,
      limit: usage.limit,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to confirm upload' },
      { status: 500 },
    );
  }
}
