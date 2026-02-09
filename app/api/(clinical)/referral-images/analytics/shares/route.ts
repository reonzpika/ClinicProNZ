import { getDb } from 'database/client';
import { and, count, eq, isNotNull, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { referrals, shareEvents } from '@/db/schema';

export const runtime = 'nodejs';

/**
 * GET /api/referral-images/analytics/shares
 *
 * Aggregate share and referral metrics for admin/analytics.
 * Optional: ?userId= to scope to a single user.
 *
 * Response:
 * - totalShares: number
 * - referralSignups: number
 * - conversionRate: string (e.g. "12.5")
 * - sharesByMethod: { method: string; count: number }[]
 * - sharesByLocation: { location: string; count: number }[]
 */
export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;

    const userFilter = userId ? eq(shareEvents.userId, userId) : undefined;
    const baseWhere = userFilter ? and(userFilter) : undefined;
    const methodWhere = userFilter
      ? and(userFilter, isNotNull(shareEvents.method))
      : isNotNull(shareEvents.method);

    const [totalSharesRow, referralSignupsRow, sharesByMethodRows, sharesByLocationRows]
      = await Promise.all([
        db
          .select({ value: count() })
          .from(shareEvents)
          .where(baseWhere ?? sql`1=1`),
        db
          .select({ value: count() })
          .from(referrals)
          .where(
            userId
              ? and(eq(referrals.signupCompleted, true), eq(referrals.referrerId, userId))
              : eq(referrals.signupCompleted, true),
          ),
        db
          .select({
            method: shareEvents.method,
            count: count(),
          })
          .from(shareEvents)
          .where(methodWhere)
          .groupBy(shareEvents.method),
        db
          .select({
            location: shareEvents.location,
            count: count(),
          })
          .from(shareEvents)
          .where(baseWhere ?? sql`1=1`)
          .groupBy(shareEvents.location),
      ]);

    const totalShares = totalSharesRow[0]?.value ?? 0;
    const referralSignups = referralSignupsRow[0]?.value ?? 0;
    const conversionRate
      = totalShares > 0 ? ((referralSignups / totalShares) * 100).toFixed(1) : '0';

    const sharesByMethod = sharesByMethodRows.map(r => ({
      method: r.method ?? 'unknown',
      count: Number(r.count),
    }));
    const sharesByLocation = sharesByLocationRows.map(r => ({
      location: r.location,
      count: Number(r.count),
    }));

    return NextResponse.json({
      totalShares,
      referralSignups,
      conversionRate,
      sharesByMethod,
      sharesByLocation,
    });
  } catch (error) {
    console.error('[referral-images/analytics/shares] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 },
    );
  }
}
