# Scripts

One-time maintenance and migration scripts for ClinicPro.

## Referral Images: Email 2 Backfill

**File:** `backfill-checkin-email.ts`

**Purpose:** Send the Day 3 check-in email (Email 2) to all existing users who signed up before the feature was implemented.

### When to Use

Run this **once** after deploying the Email 2 feature to catch users who signed up more than 3 days ago.

### Prerequisites

- Email 2 feature deployed (migration `0042_referral_images_checkin_email.sql` applied)
- `RESEND_API_KEY` environment variable set
- Database connection configured

### Usage

**Dry run first (recommended):**
```bash
DRY_RUN=true pnpm tsx scripts/backfill-checkin-email.ts
```

This shows you which users would receive the email without actually sending anything.

**Live run (sends emails):**
```bash
pnpm tsx scripts/backfill-checkin-email.ts
```

### What It Does

1. Finds all users where:
   - `check_in_email_sent_at` is `NULL` (haven't received Email 2 yet)
   - `email` is not `NULL` (have an email address)
   - `created_at` is more than 3 days ago (existing users)

2. For each user:
   - Sends the check-in email via `sendCheckInEmail()`
   - Updates `check_in_email_sent_at` timestamp
   - Updates `updated_at` timestamp

3. Reports success/failure counts

### Example Output

```
============================================================
Referral Images: Email 2 (Check-in) Backfill
============================================================
Mode: DRY RUN (no emails sent)

Finding users who signed up before: 2026-02-05T10:30:00.000Z

Found 42 eligible user(s)

DRY RUN - Would send emails to:
------------------------------------------------------------
- user1@example.com (signed up: 2026-01-15T08:23:12.000Z)
- user2@example.com (signed up: 2026-01-20T14:45:30.000Z)
...
------------------------------------------------------------

Total: 42 email(s) would be sent

To actually send emails, run: pnpm tsx scripts/backfill-checkin-email.ts
```

### After Running

After the backfill:
- New users will receive Email 2 automatically via the daily cron job (Day 3 after signup)
- Existing users who were backfilled won't receive it again (timestamp prevents duplicates)
- You can safely run this script multiple times (it only sends to users without `check_in_email_sent_at`)

### Safety Features

- ✅ Dry run mode available
- ✅ Won't send duplicates (checks `check_in_email_sent_at`)
- ✅ Per-user error handling (one failure doesn't stop the batch)
- ✅ Detailed logging for each send
- ✅ Success/failure reporting

### Troubleshooting

**"No users to process"**
- All eligible users have already received the email
- No users signed up more than 3 days ago
- Check database: `SELECT COUNT(*) FROM users WHERE check_in_email_sent_at IS NULL AND email IS NOT NULL AND created_at < NOW() - INTERVAL '3 days';`

**Email send failures**
- Check `RESEND_API_KEY` is set correctly
- Check Resend API quota/limits
- Check individual error messages in output

**Script won't run**
- Ensure `pnpm tsx` works: `pnpm tsx --version`
- Check database connection: `DATABASE_URL` environment variable
- Try dry run first to test connectivity
