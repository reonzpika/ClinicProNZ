import { getDb } from 'database/client';
import { and, eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import {
  openmailerCampaigns,
  openmailerClicks,
  openmailerEmails,
  openmailerLinks,
} from '@/db/schema';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await context.params;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'https://clinicpro.co.nz';

  try {
    const db = getDb();
    const [link] = await db
      .select()
      .from(openmailerLinks)
      .where(eq(openmailerLinks.shortCode, shortCode))
      .limit(1);

    if (!link) {
      return NextResponse.redirect(baseUrl);
    }

    const subscriberId = request.nextUrl.searchParams.get('s');
    if (subscriberId) {
      const [email] = await db
        .select()
        .from(openmailerEmails)
        .where(
          and(
            eq(openmailerEmails.campaignId, link.campaignId),
            eq(openmailerEmails.subscriberId, subscriberId)
          )
        )
        .limit(1);

      if (email) {
        const id = crypto.randomUUID();
        await db.insert(openmailerClicks).values({
          id,
          emailId: email.id,
          linkId: link.id,
          ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null,
          userAgent: request.headers.get('user-agent') ?? null,
        });

        if (email.clickedAt == null) {
          await db
            .update(openmailerEmails)
            .set({ clickedAt: new Date() })
            .where(eq(openmailerEmails.id, email.id));
        }

        await db
          .update(openmailerLinks)
          .set({
            clickCount: sql`${openmailerLinks.clickCount} + 1`,
          })
          .where(eq(openmailerLinks.id, link.id));

        await db
          .update(openmailerCampaigns)
          .set({
            totalClicks: sql`${openmailerCampaigns.totalClicks} + 1`,
          })
          .where(eq(openmailerCampaigns.id, link.campaignId));
      }
    }

    return NextResponse.redirect(link.url, { status: 302 });
  } catch (err) {
    console.error('OpenMailer click tracking error:', err);
    return NextResponse.redirect(baseUrl, { status: 302 });
  }
}
