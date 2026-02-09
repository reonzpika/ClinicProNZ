import { getDb } from 'database/client';
import { and, eq, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { openmailerCampaigns, openmailerEmails } from '@/db/schema';

// 1x1 transparent GIF (base64)
const PIXEL
  = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const campaignId = searchParams.get('c');
  const subscriberId = searchParams.get('s');

  if (campaignId && subscriberId) {
    try {
      const db = getDb();
      const [email] = await db
        .select()
        .from(openmailerEmails)
        .where(
          and(
            eq(openmailerEmails.campaignId, campaignId),
            eq(openmailerEmails.subscriberId, subscriberId),
          ),
        )
        .limit(1);

      if (email && email.openedAt == null) {
        await db
          .update(openmailerEmails)
          .set({ openedAt: new Date() })
          .where(eq(openmailerEmails.id, email.id));

        await db
          .update(openmailerCampaigns)
          .set({
            totalOpens: sql`${openmailerCampaigns.totalOpens} + 1`,
          })
          .where(eq(openmailerCampaigns.id, campaignId));
      }
    } catch (err) {
      console.error('OpenMailer open tracking error:', err);
    }
  }

  const pixel = Buffer.from(PIXEL, 'base64');
  return new NextResponse(pixel, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
