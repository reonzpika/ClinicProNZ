# PHO Email Campaign - Quickstart Guide

## What's Ready

✅ **New PHO contacts CSV**: `data/pho-contacts-new.csv` (8 contacts)  
✅ **API route**: `/api/openmailer/setup-pho-campaign` (import, test, production)  
✅ **Email template**: Embedded in API route (HTML with merge fields)  
✅ **Documentation**: `docs/pho-campaign-setup.md` (detailed guide)

## Quick Start (2 Options)

### Option A: Browser-Based (Recommended, 5 minutes)

**Prerequisites**: App running locally (`pnpm dev`) OR access to production at `https://clinicpro.co.nz`

**Step 1: Import New PHO Contacts** (1 min)
1. Navigate to `/openmailer/subscribers/import`
2. Upload `data/pho-contacts-new.csv`
3. List name: `pho-contacts`
4. Click "Import"
5. Confirm: Success: 8 (or some skipped if duplicates)

**Step 2: Create Test Campaign** (2 min)
1. Navigate to `/openmailer/campaigns/new`
2. Fill in:
   - **Name**: `PHO Outreach – Clinical Photos Tool – Feb 2026 (TEST)`
   - **Subject**: `[TEST] Free tool for clinical photos`
   - **Body HTML**: Copy from `/app/api/openmailer/setup-pho-campaign/route.ts` (EMAIL_HTML constant, lines 8-80)
   - **From**: Dr. Ryo Eguchi <ryo@clinicpro.co.nz>
   - **List**: `test`
3. Click "Create campaign"
4. On campaign page, click "Send campaign"
5. Check `ryo@clinicpro.co.nz` inbox and verify:
   - ✅ HTML renders correctly
   - ✅ Links work (https://clinicpro.co.nz/referral-images)
   - ✅ "{{organization}}" shows "ClinicPro"
   - ✅ Unsubscribe link present

**Step 3: Create Production Campaign** (1 min)
1. Navigate to `/openmailer/campaigns/new`
2. Fill in:
   - **Name**: `PHO Outreach – Clinical Photos Tool – Feb 2026`
   - **Subject**: `Free tool for clinical photos`
   - **Body HTML**: Same as test (from API route)
   - **From**: Dr. Ryo Eguchi <ryo@clinicpro.co.nz>
   - **List**: `pho-contacts`
3. Click "Create campaign"

**Step 4: Send to All PHOs** (1 min)
1. On production campaign page, verify recipient count (~36 = 28 existing + 8 new)
2. Click "Send campaign"
3. Confirm send
4. Monitor results on campaign dashboard (opens, clicks, bounces)

---

### Option B: API-Based (For Automation)

**Prerequisites**: App running locally with admin auth

```bash
# Step 1: Import new PHO contacts
curl -X POST http://localhost:3000/api/openmailer/setup-pho-campaign \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{"action": "import"}'

# Step 2: Create test campaign
curl -X POST http://localhost:3000/api/openmailer/setup-pho-campaign \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{"action": "create-test"}'
# Returns: { campaignId, url }

# Step 3: Send test (via UI at returned url)

# Step 4: Create production campaign
curl -X POST http://localhost:3000/api/openmailer/setup-pho-campaign \
  -H "Content-Type: application/json" \
  -b "your-session-cookie" \
  -d '{"action": "create-production"}'
# Returns: { campaignId, url, totalRecipients }

# Step 5: Send production (via UI at returned url)
```

---

## Email Template (for manual copy-paste)

The email HTML template is in `/app/api/openmailer/setup-pho-campaign/route.ts` at line 8 (EMAIL_HTML constant).

**Merge fields used**:
- `{{organization}}` - PHO name (e.g., "Ngā Mataapuna Oranga")
- `{{unsubscribe_url}}` - Auto-generated unsubscribe link

---

## New PHO Contacts (8 total)

Located in `data/pho-contacts-new.csv`:

1. hello@nmo.org.nz - Ngā Mataapuna Oranga
2. hello@tend.nz - Arataki PHO
3. info@pegasus.health.nz - Pegasus Health
4. admin@kmc.co.nz - Cosine Primary Care Network Trust
5. info@scdhb.health.nz - South Canterbury Primary and Community
6. admin@scdhb.health.nz - South Canterbury Primary and Community
7. info@communitycare.co.nz - Community Care
8. enquiries@communitycare.co.nz - Community Care

---

## Expected Results

- **Total PHO contacts**: 28 (existing) + 8 (new) = **36 recipients**
- **Test email**: 1 recipient (ryo@clinicpro.co.nz)
- **Open rate**: Expect 20-40% over 48 hours
- **Click rate**: Expect 2-5% to main CTA

---

## Tracking & Monitoring

After sending, monitor at `/openmailer/campaigns/{campaign-id}`:
- **Opens**: Tracked via 1x1 pixel
- **Clicks**: Tracked via link rewrites
- **Bounces**: Reported by Resend webhook
- **Unsubscribes**: Handled via `/api/openmailer/unsubscribe`

---

## Troubleshooting

**"Import failed"**: Check CSV format (email,name,organization headers)  
**"Campaign creation failed"**: Verify you're logged in as admin  
**"Send failed"**: Check RESEND_API_KEY environment variable  
**Links don't work**: Verify merge field syntax `{{field_name}}`

---

## Files Created

- `/data/pho-contacts-new.csv` - New PHO contacts
- `/app/api/openmailer/setup-pho-campaign/route.ts` - API route (import, test, production)
- `/docs/pho-campaign-setup.md` - Detailed guide
- `/scripts/pho-campaign-quickstart.sh` - Bash automation script
- `QUICKSTART-PHO-CAMPAIGN.md` - This file

---

## Next Steps After Sending

1. Monitor campaign dashboard for 48-72 hours
2. Track direct inquiries to ryo@clinicpro.co.nz
3. Document results:
   - Open rate %
   - Click rate %
   - Direct responses
   - Sign-ups attributed to campaign
4. Update project LOG.md with campaign results

---

**Ready to go!** Start with Option A (browser-based) for the quickest path.
