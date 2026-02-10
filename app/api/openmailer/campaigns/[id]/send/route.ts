import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  openmailerCampaigns,
  openmailerEmails,
  openmailerLinks,
  openmailerSubscribers,
} from '@/db/schema';
import {
  extractUrlsFromHtml,
  injectTrackingPixel,
  type LinkMapEntry,
  replaceLinksWithTracking,
  sendOpenmailerEmail,
} from '@/src/lib/openmailer/email';

const TRACKING_BASE
  = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';

function isAdminAuth(req: NextRequest): boolean {
  return req.headers.get('x-user-tier') === 'admin';
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { id: campaignId } = await context.params;
  const db = getDb();
  const [campaign] = await db
    .select()
    .from(openmailerCampaigns)
    .where(eq(openmailerCampaigns.id, campaignId))
    .limit(1);
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }
  if (campaign.status !== 'draft') {
    return NextResponse.json(
      { error: 'Campaign already sent or not in draft' },
      { status: 400 },
    );
  }

  const subscribers = await db
    .select()
    .from(openmailerSubscribers)
    .where(eq(openmailerSubscribers.listName, campaign.listName));
  const active = subscribers.filter(s => s.status === 'active');
  if (active.length === 0) {
    return NextResponse.json(
      { error: 'No active subscribers for this list' },
      { status: 400 },
    );
  }

  const urls = extractUrlsFromHtml(campaign.bodyHtml);
  const linkMap: LinkMapEntry[] = [];
  for (const url of urls) {
    const linkId = crypto.randomUUID();
    const shortCode = nanoid(10);
    await db.insert(openmailerLinks).values({
      id: linkId,
      campaignId,
      url,
      shortCode,
    });
    linkMap.push({ url, shortCode });
  }

  await db
    .update(openmailerCampaigns)
    .set({
      totalRecipients: active.length,
      status: 'sending',
      updatedAt: new Date(),
    })
    .where(eq(openmailerCampaigns.id, campaignId));

  let sent = 0;
  for (const sub of active) {
    const emailId = crypto.randomUUID();
    await db.insert(openmailerEmails).values({
      id: emailId,
      campaignId,
      subscriberId: sub.id,
      status: 'pending',
    });

    let html = replaceLinksWithTracking(campaign.bodyHtml, linkMap, sub.id);
    html = injectTrackingPixel(html, campaignId, sub.id);
    const org
      = (sub.metadata as Record<string, unknown> | null)?.organization as
      | string
      | undefined;
    const unsubscribeUrl = `${TRACKING_BASE}/api/openmailer/unsubscribe?email=${encodeURIComponent(sub.email)}&list=${encodeURIComponent(campaign.listName)}`;
    html = html.replace(/\{\{organization\}\}/g, org ?? sub.name ?? '');
    html = html.replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl);

    const from = `${campaign.fromName} <${campaign.fromEmail}>`;
    const result = await sendOpenmailerEmail({
      to: sub.email,
      subject: campaign.subject,
      html,
      from,
      replyTo: campaign.replyTo ?? undefined,
    });

    if (result.success) {
      await db
        .update(openmailerEmails)
        .set({
          status: 'sent',
          sentAt: new Date(),
          messageId: result.messageId,
        })
        .where(eq(openmailerEmails.id, emailId));
      sent++;
    } else {
      await db
        .update(openmailerEmails)
        .set({
          status: 'failed',
          errorMessage: result.error,
        })
        .where(eq(openmailerEmails.id, emailId));
    }

    await db
      .update(openmailerCampaigns)
      .set({
        totalSent: sent,
        updatedAt: new Date(),
      })
      .where(eq(openmailerCampaigns.id, campaignId));

    await new Promise(r => setTimeout(r, 50));
  }

  await db
    .update(openmailerCampaigns)
    .set({
      status: 'sent',
      sentAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(openmailerCampaigns.id, campaignId));

  return NextResponse.json({ sent, total: active.length });
}
