import { getDb } from 'database/client';
import { and, count, eq, inArray, sql } from 'drizzle-orm';
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

const BATCH_SIZE = 8; // Reduced from 10 to stay well under 10s timeout

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
  // Check if already initialized (idempotent - safe to retry)
  const existingEmails = await db
    .select({ count: count() })
    .from(openmailerEmails)
    .where(eq(openmailerEmails.campaignId, campaignId));
  
  const alreadyInitialized = (existingEmails[0]?.count ?? 0) > 0;

  if (campaign.status === 'draft' && !alreadyInitialized) {
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

    // Create tracking links once (check for duplicates) - BULK INSERT
    const urls = extractUrlsFromHtml(campaign.bodyHtml);
    const existingLinks = await db
      .select()
      .from(openmailerLinks)
      .where(eq(openmailerLinks.campaignId, campaignId));
    const existingUrls = new Set(existingLinks.map(l => l.url));

    const newLinks = urls
      .filter(url => !existingUrls.has(url))
      .map(url => ({
        id: crypto.randomUUID(),
        campaignId,
        url,
        shortCode: nanoid(10),
      }));

    if (newLinks.length > 0) {
      await db.insert(openmailerLinks).values(newLinks);
    }

    // Create all email records as pending - BULK INSERT (much faster, atomic)
    const emailRecords = active.map(sub => ({
      id: crypto.randomUUID(),
      campaignId,
      subscriberId: sub.id,
      status: 'pending' as const,
    }));

    await db.insert(openmailerEmails).values(emailRecords);

    // Set campaign to sending state
    await db
      .update(openmailerCampaigns)
      .set({
        totalRecipients: active.length,
        status: 'sending',
        updatedAt: new Date(),
      })
      .where(eq(openmailerCampaigns.id, campaignId));
  } else if (campaign.status === 'draft' && alreadyInitialized) {
    // Partial initialization occurred - just update status to 'sending'
    const emailCount = existingEmails[0]?.count ?? 0;
    await db
      .update(openmailerCampaigns)
      .set({
        totalRecipients: emailCount,
        status: 'sending',
        updatedAt: new Date(),
      })
      .where(eq(openmailerCampaigns.id, campaignId));
  }

  // Phase 2: Process next batch of pending emails
  
  // SAFEGUARD 1: Reset stuck 'processing' emails (timeout recovery)
  // If emails have been 'processing' for >5 minutes, assume timeout and reset to 'pending'
  await db
    .update(openmailerEmails)
    .set({ status: 'pending' })
    .where(
      and(
        eq(openmailerEmails.campaignId, campaignId),
        eq(openmailerEmails.status, 'processing'),
        sql`created_at < NOW() - INTERVAL '5 minutes'`,
      ),
    );

  // Use PostgreSQL's FOR UPDATE SKIP LOCKED to prevent race conditions
  // This atomically locks rows so concurrent requests get different batches
  const claimedEmails = await db.execute<{ id: string }>(sql`
    UPDATE ${openmailerEmails}
    SET status = 'processing'
    WHERE id IN (
      SELECT id FROM ${openmailerEmails}
      WHERE campaign_id = ${campaignId}
        AND status = 'pending'
      LIMIT ${BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING id
  `);

  if (claimedEmails.rows.length === 0) {
    // No emails claimed - either done or another request is processing
    // Calculate final count and mark campaign as complete
    const countResult = await db
      .select({ value: count() })
      .from(openmailerEmails)
      .where(
        and(
          eq(openmailerEmails.campaignId, campaignId),
          eq(openmailerEmails.status, 'sent'),
        ),
      );
    const finalSentCount = countResult[0]?.value ?? 0;

    const [campaign] = await db
      .select()
      .from(openmailerCampaigns)
      .where(eq(openmailerCampaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Update with final count and mark as sent
    await db
      .update(openmailerCampaigns)
      .set({
        status: 'sent',
        sentAt: new Date(),
        totalSent: finalSentCount,
        updatedAt: new Date(),
      })
      .where(eq(openmailerCampaigns.id, campaignId));

    return NextResponse.json({
      sent: finalSentCount,
      total: campaign.totalRecipients,
      continue: false,
    });
  }

  // Fetch subscriber details for the claimed emails
  const claimedIds = claimedEmails.rows.map(row => row.id);
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
    .where(inArray(openmailerEmails.id, claimedIds));

  if (pendingEmails.length === 0) {
    // No more emails to send - calculate final count and mark campaign as sent
    const countResult = await db
      .select({ value: count() })
      .from(openmailerEmails)
      .where(
        and(
          eq(openmailerEmails.campaignId, campaignId),
          eq(openmailerEmails.status, 'sent'),
        ),
      );
    const finalSentCount = countResult[0]?.value ?? 0;

    const [campaign] = await db
      .select()
      .from(openmailerCampaigns)
      .where(eq(openmailerCampaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Update with final count and mark as sent
    await db
      .update(openmailerCampaigns)
      .set({
        status: 'sent',
        sentAt: new Date(),
        totalSent: finalSentCount,
        updatedAt: new Date(),
      })
      .where(eq(openmailerCampaigns.id, campaignId));

    return NextResponse.json({
      sent: finalSentCount,
      total: campaign.totalRecipients,
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

  // Calculate totalSent from actual database state (resilient to timeouts)
  const countResult = await db
    .select({ value: count() })
    .from(openmailerEmails)
    .where(
      and(
        eq(openmailerEmails.campaignId, campaignId),
        eq(openmailerEmails.status, 'sent'),
      ),
    );
  const actualTotalSent = countResult[0]?.value ?? 0;

  // Update campaign with actual count
  const [updated] = await db
    .select()
    .from(openmailerCampaigns)
    .where(eq(openmailerCampaigns.id, campaignId))
    .limit(1);

  if (!updated) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  await db
    .update(openmailerCampaigns)
    .set({
      totalSent: actualTotalSent,
      updatedAt: new Date(),
    })
    .where(eq(openmailerCampaigns.id, campaignId));

  return NextResponse.json({
    sent: actualTotalSent,
    total: updated.totalRecipients,
    continue: true,
  });
}
