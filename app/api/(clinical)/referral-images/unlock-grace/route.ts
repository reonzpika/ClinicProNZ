import { getDb } from 'database/client';
import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { imageToolUsage } from '@/db/schema';
import { canUseGraceUnlock, getCurrentMonth } from '@/src/lib/services/referral-images/utils';

export const runtime = 'nodejs';

/**
 * POST /api/referral-images/unlock-grace
 *
 * Grant 10 more free images (max 2 times per month)
 *
 * Request body:
 * - userId: string
 *
 * Response:
 * - success: boolean
 * - graceUnlocksUsed: number
 * - newLimit: number
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      );
    }

    const db = getDb();
    const currentMonth = getCurrentMonth();

    // Get current usage
    const usageRow = await db
      .select({
        id: imageToolUsage.id,
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

    const usage = usageRow[0];
    if (!usage) {
      return NextResponse.json(
        { error: 'No usage record found for this month' },
        { status: 404 },
      );
    }

    const graceUnlocksUsed = usage.graceUnlocksUsed || 0;

    // Check if user can use grace unlock
    if (!canUseGraceUnlock(graceUnlocksUsed)) {
      return NextResponse.json({
        success: false,
        error: 'Maximum grace unlocks reached',
        graceUnlocksUsed,
      });
    }

    // Increment grace unlocks
    const newGraceUnlocksUsed = graceUnlocksUsed + 1;
    await db
      .update(imageToolUsage)
      .set({
        graceUnlocksUsed: newGraceUnlocksUsed,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(imageToolUsage.userId, userId),
          eq(imageToolUsage.month, currentMonth),
        ),
      );

    // Calculate new limit: 10 base + (unlocks * 10)
    const newLimit = 10 + (newGraceUnlocksUsed * 10);

    return NextResponse.json({
      success: true,
      graceUnlocksUsed: newGraceUnlocksUsed,
      newLimit,
    });
  } catch (error) {
    console.error('[referral-images/unlock-grace] Error:', error);
    return NextResponse.json(
      { error: 'Failed to unlock grace images' },
      { status: 500 },
    );
  }
}
