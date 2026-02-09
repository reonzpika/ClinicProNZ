import { getDb } from 'database/client';
import { and, eq, isNull, ne, or, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { imageToolUsage, users } from '@/db/schema';
import { sendMonthResetEmail, sendShareEncourageEmail } from '@/src/lib/services/referral-images/email-service';
import { getCurrentMonth } from '@/src/lib/services/referral-images/utils';

export const runtime = 'nodejs';

function isAuthorized(req: NextRequest, url: URL): boolean {
  const secret = (process.env.CRON_SECRET as string) || '';
  if (!secret) {
 return false;
}

  const token = url.searchParams.get('token') || '';
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';
  const authHeader = req.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  return Boolean((isVercelCron && token === secret) || bearer === secret || token === secret);
}

/**
 * GET /api/maintenance/referral-images-email-sequence
 *
 * Cron: runs daily to send:
 * - Email 5 (Share Encourage): 5 days after limit hit, if user hasn't upgraded
 * - Email 6 (Month Reset): at start of new month, if user hasn't upgraded
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    if (!isAuthorized(req, url)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const currentMonth = getCurrentMonth();
    const now = new Date();
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const sixDaysAgo = new Date(now);
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

    let shareEncourageSent = 0;
    let monthResetSent = 0;

    // Email 5: Share Encourage (5 days after limit hit, free tier, not yet sent)
    const shareEncourageRows = await db
      .select({
        userId: imageToolUsage.userId,
        month: imageToolUsage.month,
      })
      .from(imageToolUsage)
      .innerJoin(users, eq(imageToolUsage.userId, users.id))
      .where(
        and(
          sql`${imageToolUsage.limitHitEmailSentAt} IS NOT NULL`,
          sql`${imageToolUsage.limitHitEmailSentAt} >= ${sixDaysAgo}`,
          sql`${imageToolUsage.limitHitEmailSentAt} < ${fiveDaysAgo}`,
          sql`${imageToolUsage.shareEncourageEmailSentAt} IS NULL`,
          eq(users.imageTier, 'free'),
        ),
      );

    for (const row of shareEncourageRows) {
      try {
        const userRow = await db
          .select({ email: users.email, name: users.name })
          .from(users)
          .where(eq(users.id, row.userId))
          .limit(1);
        const u = userRow[0];
        const email = u?.email;
        if (email) {
          await sendShareEncourageEmail({
            email,
            name: u?.name ?? email.split('@')[0],
            userId: row.userId,
          });
          await db
            .update(imageToolUsage)
            .set({
              shareEncourageEmailSentAt: new Date(),
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(imageToolUsage.userId, row.userId),
                eq(imageToolUsage.month, row.month),
              ),
            );
          shareEncourageSent++;
        }
      } catch (err) {
        console.error('[referral-images-email-sequence] Share Encourage failed for', row.userId, err);
      }
    }

    // Email 6: Month Reset (new month, free tier, had usage last month, not yet sent for this month)
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth
      = `${String(prevMonthDate.getFullYear())}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const monthResetCandidates = await db
      .select({
        userId: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .innerJoin(imageToolUsage, eq(users.id, imageToolUsage.userId))
      .where(
        and(
          eq(users.imageTier, 'free'),
          eq(imageToolUsage.month, prevMonth),
          or(
            isNull(users.lastMonthResetEmailFor),
            ne(users.lastMonthResetEmailFor, currentMonth),
          ),
        ),
      );

    // Dedupe by userId (user could have multiple usage rows)
    const seen = new Set<string>();
    for (const row of monthResetCandidates) {
      if (seen.has(row.userId)) {
 continue;
}
      seen.add(row.userId);

      const email = row.email;
      if (!email) {
 continue;
}

      try {
        await sendMonthResetEmail({
          email,
          name: row.name ?? email.split('@')[0],
          userId: row.userId,
        });
        await db
          .update(users)
          .set({
            lastMonthResetEmailFor: currentMonth,
            updatedAt: new Date(),
          })
          .where(eq(users.id, row.userId));
        monthResetSent++;
      } catch (err) {
        console.error('[referral-images-email-sequence] Month Reset failed for', row.userId, err);
      }
    }

    return NextResponse.json({
      success: true,
      shareEncourageSent,
      monthResetSent,
    });
  } catch (error) {
    console.error('[referral-images-email-sequence] Error:', error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
