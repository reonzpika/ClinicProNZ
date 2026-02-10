# OpenMailer manual test checklist

Use this checklist to validate the full OpenMailer flow after deployment or local run.

## 1. Database

- [ ] Run `database/migrations/0041_openmailer_tables.sql` (Neon SQL Editor or `psql "$DATABASE_URL" -f database/migrations/0041_openmailer_tables.sql`).
- [ ] Confirm five tables exist: `openmailer_subscribers`, `openmailer_campaigns`, `openmailer_emails`, `openmailer_links`, `openmailer_clicks`.

## 2. UI

- [ ] Log in as admin.
- [ ] Open `/openmailer`; confirm dashboard (counts).
- [ ] Open Subscribers, Import, and Campaigns sections.

## 3. Import

- [ ] Upload a CSV with columns `email`, `name`, `organization` (or equivalent), list name e.g. `pho-contacts`.
- [ ] Confirm success and that the subscriber list shows the imported rows.

## 4. Campaign

- [ ] Create a campaign: name, subject, HTML body with at least one link, list e.g. `pho-contacts`.
- [ ] Save and open the campaign detail page.

## 5. Send

- [ ] Click "Send campaign" and confirm.
- [ ] Confirm Resend delivery and campaign status becomes "sent".

## 6. Track open

- [ ] GET `/api/openmailer/track/open?c=<campaignId>&s=<subscriberId>` with real IDs (e.g. from DB or from a sent email).
- [ ] Expect 200 and a 1x1 GIF response.
- [ ] Confirm in DB that `openmailer_emails.opened_at` and `openmailer_campaigns.total_opens` are updated.

## 7. Track click

- [ ] Open a link from the sent email (or call the track/click URL directly).
- [ ] Expect redirect to the target URL.
- [ ] Confirm the click is recorded in the DB (`openmailer_clicks` and related counters).

## 8. Unsubscribe

- [ ] GET `/api/openmailer/unsubscribe?email=<email>&list=pho-contacts` with a real subscriber email and list.
- [ ] Expect "unsubscribed" message.
- [ ] Confirm subscriber status is updated in the DB.
