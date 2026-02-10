# PHO Email Campaign Setup Guide

## Overview

This guide walks through setting up and sending the PHO email campaign for the referral images tool.

## Files Created

1. `/data/pho-contacts-new.csv` - 8 new PHO contacts
2. `/scripts/import-pho-contacts.ts` - Import script for local use
3. `/scripts/create-pho-campaign.ts` - Full campaign setup script (interactive)
4. `/app/api/openmailer/setup-pho-campaign/route.ts` - API route for programmatic setup

## Campaign Details

- **Subject**: Free tool for clinical photos
- **From**: Dr. Ryo Eguchi <ryo@clinicpro.co.nz>
- **List**: pho-contacts (existing 28 + 8 new = 36 total)
- **Purpose**: Promote referral images tool to NZ PHOs

## Setup Options

### Option 1: Using the API Route (Recommended)

If your app is running locally or deployed:

**Step 1: Import new PHO contacts**
```bash
curl -X POST http://localhost:3000/api/openmailer/setup-pho-campaign \
  -H "Content-Type: application/json" \
  -H "x-user-tier: admin" \
  -d '{"action": "import"}'
```

**Step 2: Create test campaign**
```bash
curl -X POST http://localhost:3000/api/openmailer/setup-pho-campaign \
  -H "Content-Type: application/json" \
  -H "x-user-tier: admin" \
  -d '{"action": "create-test"}'
```

Response will include campaign URL like: `/openmailer/campaigns/{id}`

**Step 3: Send test email**
1. Go to the campaign URL
2. Click "Send campaign"
3. Check ryo@clinicpro.co.nz inbox
4. Verify:
   - HTML renders correctly
   - Links work (https://clinicpro.co.nz/referral-images)
   - Organization merge field populates
   - Unsubscribe link works

**Step 4: Create production campaign** (after test confirms OK)
```bash
curl -X POST http://localhost:3000/api/openmailer/setup-pho-campaign \
  -H "Content-Type: application/json" \
  -H "x-user-tier: admin" \
  -d '{"action": "create-production"}'
```

**Step 5: Send to all PHOs**
1. Go to the production campaign URL
2. Review recipients count (should be ~36)
3. Click "Send campaign"
4. Campaign will be sent to all active pho-contacts

### Option 2: Using the Interactive Script

Requires DATABASE_URL environment variable set locally.

```bash
npx tsx scripts/create-pho-campaign.ts
```

This script will:
1. Import new PHO contacts
2. Create test campaign
3. Prompt for confirmation
4. Create production campaign
5. Provide URLs for each campaign

### Option 3: Manual via OpenMailer UI

**Step 1: Import contacts**
1. Go to `/openmailer/subscribers/import`
2. Upload `/data/pho-contacts-new.csv`
3. List name: `pho-contacts`
4. Confirm import success

**Step 2: Create test campaign**
1. Go to `/openmailer/campaigns/new`
2. Fill in:
   - Name: "PHO Outreach – Clinical Photos Tool – Feb 2026 (TEST)"
   - Subject: "[TEST] Free tool for clinical photos"
   - Body HTML: Copy from the email template below
   - From: Dr. Ryo Eguchi <ryo@clinicpro.co.nz>
   - List: test
3. Create campaign

**Step 3: Add test subscriber** (if not exists)
1. Go to `/openmailer/subscribers`
2. Add subscriber:
   - Email: ryo@clinicpro.co.nz
   - Name: Dr. Ryo Eguchi
   - List: test
   - Organization: ClinicPro

**Step 4: Send test**
1. Go to test campaign
2. Send campaign
3. Check email and verify

**Step 5: Create production campaign**
1. Go to `/openmailer/campaigns/new`
2. Fill in:
   - Name: "PHO Outreach – Clinical Photos Tool – Feb 2026"
   - Subject: "Free tool for clinical photos"
   - Body HTML: Copy from the email template below
   - From: Dr. Ryo Eguchi <ryo@clinicpro.co.nz>
   - List: pho-contacts
3. Create campaign

**Step 6: Send to all PHOs**
1. Go to production campaign
2. Verify recipient count
3. Send campaign

## Email Template

The email HTML is embedded in:
- `/scripts/create-pho-campaign.ts`
- `/app/api/openmailer/setup-pho-campaign/route.ts`

Uses merge fields:
- `{{organization}}` - PHO name
- `{{unsubscribe_url}}` - Auto-generated unsubscribe link

## New PHO Contacts (8 total)

1. hello@nmo.org.nz - Ngā Mataapuna Oranga
2. hello@tend.nz - Arataki PHO
3. info@pegasus.health.nz - Pegasus Health
4. admin@kmc.co.nz - Cosine Primary Care Network Trust
5. info@scdhb.health.nz - South Canterbury Primary and Community
6. admin@scdhb.health.nz - South Canterbury Primary and Community
7. info@communitycare.co.nz - Community Care
8. enquiries@communitycare.co.nz - Community Care

## Expected Results

- Total PHO contacts: 28 (existing) + 8 (new) = 36
- Test email: 1 recipient (ryo@clinicpro.co.nz)
- Production email: ~36 recipients (all active pho-contacts)

## Tracking

After sending, you can monitor:
- Opens: `/api/openmailer/track/open` (automatic via pixel)
- Clicks: Tracked automatically via link rewrites
- Unsubscribes: `/api/openmailer/unsubscribe`
- Stats: Campaign detail page shows aggregated metrics

## Troubleshooting

**Import fails**: Check CSV format (email,name,organization headers)
**Campaign creation fails**: Verify admin authentication
**Send fails**: Check Resend API key environment variable
**Links don't work**: Verify merge fields syntax `{{field_name}}`

## Next Steps

After campaign is sent:
1. Monitor open rates (expect 20-40% over 48 hours)
2. Monitor click rates (expect 2-5% to main CTA)
3. Track any direct inquiries to ryo@clinicpro.co.nz
4. Document results in project LOG.md
