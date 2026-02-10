import { getDb } from 'database/client';
import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { openmailerCampaigns, openmailerSubscribers } from '@/db/schema';

const EMAIL_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Free tool for clinical photos</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">

  <div style="margin-bottom: 30px;">
    <p>Hi {{organization}} team,</p>
   
    <p>I'm Ryo, a GP in Auckland. I built a free tool that solves a common GP frustration: <strong>getting clinical photos from phone to desktop for e-referrals.</strong></p>
   
    <p style="background: #fef3c7; padding: 15px; border-left: 3px solid #f59e0b; margin: 20px 0;">
      <strong>Could you forward this to your GPs or practice managers?</strong> It takes 1 minutes to set up and might save them >10 minutes per referral.
    </p>
   
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
   
    <h2 style="color: #2d7a5f; font-size: 18px; margin-bottom: 15px;">The Problem</h2>
    <p>Many GPs still email photos to themselves, download, resize, upload to e-referral. QuickShot and MedImage on Medtech or Indici Image work for some, but many are still stuck with the manual workflow.</p>
   
    <h2 style="color: #2d7a5f; font-size: 18px; margin-bottom: 15px; margin-top: 25px;">The Solution</h2>
    <p><strong>Phone to desktop instantly.</strong></p>
    <ul style="margin: 10px 0; padding-left: 20px;">
      <li>Auto-sized JPEG (&lt;500KB) - no more "file too large" rejections</li>
      <li>Works with all NZ e-referral systems</li>
      <li>Images auto-delete after 24 hours</li>
      <li>Free for GPs</li>
    </ul>
   
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://clinicpro.co.nz/referral-images" style="display: inline-block; background: #2d7a5f; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Try It Free →
      </a>
    </p>
   
    <h2 style="color: #2d7a5f; font-size: 18px; margin-bottom: 15px; margin-top: 25px;">How It Works</h2>
    <ol style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
      <li>GP gets two links: desktop (bookmark) + mobile (save to home screen)</li>
      <li>Capture photos on phone during consult</li>
      <li>Photos appear on desktop instantly</li>
      <li>Download, attach to e-referral - done</li>
    </ol>
   
    <p style="background: #f0fdf4; padding: 15px; border-left: 3px solid #2d7a5f; margin: 25px 0; font-size: 15px;">
      <strong>Already helping 30+ NZ GPs.</strong> Built by a GP for GPs - no corporate backing, just solving real workflow problems.
    </p>
   
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
   
    <p style="font-size: 14px; color: #6b6b6b;">
      <strong>Ask:</strong> If this seems useful, please forward to your practices or add to your next newsletter. No obligation, no follow-up from me.
    </p>
   
    <p style="font-size: 14px; color: #6b6b6b; margin-top: 20px;">
      Happy to answer questions: <a href="mailto:ryo@clinicpro.co.nz" style="color: #2d7a5f; text-decoration: none;">ryo@clinicpro.co.nz</a>
    </p>
   
    <div style="margin-top: 30px;">
      <p style="margin: 3px 0; font-size: 14px;"><strong>Dr. Ryo Eguchi</strong></p>
      <p style="margin: 3px 0; font-size: 14px; color: #6b6b6b;">GP, Auckland</p>
    </div>
  </div>
 
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center;">
    <p style="margin: 5px 0;">Sent to {{organization}}</p>
    <p style="margin: 5px 0;">
      <a href="{{unsubscribe_url}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
    </p>
  </div>

</body>
</html>`;

const NEW_PHO_CONTACTS = [
  { email: 'hello@nmo.org.nz', name: 'Ngā Mataapuna Oranga', organization: 'Ngā Mataapuna Oranga' },
  { email: 'hello@tend.nz', name: 'Arataki PHO', organization: 'Arataki PHO' },
  { email: 'info@pegasus.health.nz', name: 'Pegasus Health', organization: 'Pegasus Health' },
  { email: 'admin@kmc.co.nz', name: 'Cosine Primary Care Network Trust', organization: 'Cosine Primary Care Network Trust' },
  { email: 'info@scdhb.health.nz', name: 'South Canterbury Primary and Community', organization: 'South Canterbury Primary and Community' },
  { email: 'admin@scdhb.health.nz', name: 'South Canterbury Primary and Community', organization: 'South Canterbury Primary and Community' },
  { email: 'info@communitycare.co.nz', name: 'Community Care', organization: 'Community Care' },
  { email: 'enquiries@communitycare.co.nz', name: 'Community Care', organization: 'Community Care' },
];

function isAdminAuth(req: NextRequest): boolean {
  const tier = req.headers.get('x-user-tier');
  return tier === 'admin';
}

export async function POST(request: NextRequest) {
  if (!isAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const { action } = await request.json().catch(() => ({ action: 'import' }));

  const db = getDb();

  try {
    if (action === 'import') {
      // Step 1: Import new PHO contacts
      let success = 0;
      let skipped = 0;
      let failed = 0;

      for (const contact of NEW_PHO_CONTACTS) {
        try {
          const [existing] = await db
            .select()
            .from(openmailerSubscribers)
            .where(eq(openmailerSubscribers.email, contact.email))
            .limit(1);

          if (existing) {
            skipped++;
            continue;
          }

          await db.insert(openmailerSubscribers).values({
            id: crypto.randomUUID(),
            email: contact.email,
            name: contact.name,
            listName: 'pho-contacts',
            source: 'import',
            status: 'active',
            metadata: { organization: contact.organization },
          });

          success++;
        } catch {
          failed++;
        }
      }

      return NextResponse.json({
        action: 'import',
        success,
        skipped,
        failed,
        message: `Imported ${success} new contacts, skipped ${skipped} existing, failed ${failed}`,
      });
    }

    if (action === 'create-test') {
      // Step 2: Create test campaign
      const testEmail = 'ryo@clinicpro.co.nz';

      // Ensure test subscriber exists
      const [existingTest] = await db
        .select()
        .from(openmailerSubscribers)
        .where(eq(openmailerSubscribers.email, testEmail))
        .limit(1);

      if (!existingTest) {
        await db.insert(openmailerSubscribers).values({
          id: crypto.randomUUID(),
          email: testEmail,
          name: 'Dr. Ryo Eguchi',
          listName: 'test',
          source: 'manual',
          status: 'active',
          metadata: { organization: 'ClinicPro' },
        });
      }

      const testCampaignId = crypto.randomUUID();
      await db.insert(openmailerCampaigns).values({
        id: testCampaignId,
        name: 'PHO Outreach – Clinical Photos Tool – Feb 2026 (TEST)',
        subject: '[TEST] Free tool for clinical photos',
        bodyHtml: EMAIL_HTML,
        fromName: 'Dr. Ryo Eguchi',
        fromEmail: 'ryo@clinicpro.co.nz',
        listName: 'test',
        status: 'draft',
        totalRecipients: 1,
      });

      return NextResponse.json({
        action: 'create-test',
        campaignId: testCampaignId,
        message: `Test campaign created`,
        url: `/openmailer/campaigns/${testCampaignId}`,
      });
    }

    if (action === 'create-production') {
      // Step 3: Create production campaign
      const subscribers = await db
        .select()
        .from(openmailerSubscribers)
        .where(
          and(
            eq(openmailerSubscribers.listName, 'pho-contacts'),
            eq(openmailerSubscribers.status, 'active'),
          ),
        );

      const prodCampaignId = crypto.randomUUID();
      await db.insert(openmailerCampaigns).values({
        id: prodCampaignId,
        name: 'PHO Outreach – Clinical Photos Tool – Feb 2026',
        subject: 'Free tool for clinical photos',
        bodyHtml: EMAIL_HTML,
        fromName: 'Dr. Ryo Eguchi',
        fromEmail: 'ryo@clinicpro.co.nz',
        listName: 'pho-contacts',
        status: 'draft',
        totalRecipients: subscribers.length,
      });

      return NextResponse.json({
        action: 'create-production',
        campaignId: prodCampaignId,
        totalRecipients: subscribers.length,
        message: `Production campaign created for ${subscribers.length} contacts`,
        url: `/openmailer/campaigns/${prodCampaignId}`,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Setup failed' },
      { status: 500 },
    );
  }
}
