import { getDb } from 'database/client';
import { and, eq } from 'drizzle-orm';
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

const BATCH_SIZE = 10;

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

  // Phase 1: Initialize queue if campaign is in draft
  if (campaign.status === 'draft') {
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

    // Create tracking links once
    const urls = extractUrlsFromHtml(campaign.bodyHtml);
    for (const url of urls) {
      const linkId = crypto.randomUUID();
      const shortCode = nanoid(10);
      await db.insert(openmailerLinks).values({
        id: linkId,
        campaignId,
        url,
        shortCode,
      });
    }

    // Create all email records as pending
    for (const sub of active) {
      const emailId = crypto.randomUUID();
      await db.insert(openmailerEmails).values({
        id: emailId,
        campaignId,
        subscriberId: sub.id,
        status: 'pending',
      });
    }

    // Set campaign to sending state
    await db
      .update(openmailerCampaigns)
      .set({
        totalRecipients: active.length,
        status: 'sending',
        updatedAt: new Date(),
      })
      .where(eq(openmailerCampaigns.id, campaignId));
  }

  // Phase 2: Process next batch of pending emails
  const pendingEmails = await db
    .select({
      emailId: openmailerEmails.id,
      subscriberId: openmailerEmails.subscriberId,
      email: openmailerSubscribers.email,
      name: openmailerSubscribers.name,
      metadata: openmailerSubscribers.metadata,
    })
    .from(openmailerEmails)
    .innerJoin(
      openmailerSubscribers,
      eq(openmailerEmails.subscriberId, openmailerSubscribers.id),
    )
    .where(
      and(
        eq(openmailerEmails.campaignId, campaignId),
        eq(openmailerEmails.status, 'pending'),
      ),
    )
    .limit(BATCH_SIZE);

  if (pendingEmails.length === 0) {
    // No more emails to send - mark campaign as sent
    await db
      .update(openmailerCampaigns)
      .set({
        status: 'sent',
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(openmailerCampaigns.id, campaignId));

    const [updated] = await db
      .select()
      .from(openmailerCampaigns)
      .where(eq(openmailerCampaigns.id, campaignId))
      .limit(1);

    if (!updated) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({
      sent: updated.totalSent,
      total: updated.totalRecipients,
      continue: false,
    });
  }

  // Get tracking links for this campaign
  const links = await db
    .select()
    .from(openmailerLinks)
    .where(eq(openmailerLinks.campaignId, campaignId));
  const linkMap: LinkMapEntry[] = links.map(l => ({
    url: l.url,
    shortCode: l.shortCode,
  }));

  // Send batch
  let batchSent = 0;
  for (const email of pendingEmails) {
    let html = replaceLinksWithTracking(campaign.bodyHtml, linkMap, email.subscriberId);
    html = injectTrackingPixel(html, campaignId, email.subscriberId);
    const org
      = (email.metadata as Record<string, unknown> | null)?.organization as
      | string
      | undefined;
    const unsubscribeUrl = `${TRACKING_BASE}/api/openmailer/unsubscribe?email=${encodeURIComponent(email.email)}&list=${encodeURIComponent(campaign.listName)}`;
    html = html.replace(/\{\{organization\}\}/g, org ?? email.name ?? '');
    html = html.replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl);

    const from = `${campaign.fromName} <${campaign.fromEmail}>`;
    const result = await sendOpenmailerEmail({
      to: email.email,
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
        .where(eq(openmailerEmails.id, email.emailId));
      batchSent++;
    } else {
      await db
        .update(openmailerEmails)
        .set({
          status: 'failed',
          errorMessage: result.error,
        })
        .where(eq(openmailerEmails.id, email.emailId));
    }

    await new Promise(r => setTimeout(r, 50));
  }

  // Update campaign total sent
  const [updated] = await db
    .select()
    .from(openmailerCampaigns)
    .where(eq(openmailerCampaigns.id, campaignId))
    .limit(1);

  if (!updated) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  const newTotalSent = updated.totalSent + batchSent;
  await db
    .update(openmailerCampaigns)
    .set({
      totalSent: newTotalSent,
      updatedAt: new Date(),
    })
    .where(eq(openmailerCampaigns.id, campaignId));

  return NextResponse.json({
    sent: newTotalSent,
    total: updated.totalRecipients,
    continue: true,
  });
}
