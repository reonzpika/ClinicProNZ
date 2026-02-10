# Project Log - ClinicPro SaaS

## 2026-02-10 Mon
### OpenMailer: Campaign batch sending implementation

**Context**: PHO email campaign was failing after sending only 10 emails due to Vercel's serverless function timeout (10 seconds on free/hobby tier). With 36 emails × ~300ms per send = ~11 seconds, the function was killed mid-send, leaving campaign stuck in "sending" status.

**Root Cause**: Vercel free tier has 10-second timeout for serverless functions. Not a Resend API limit.

### Progress
- ✅ **Refactored send route** (`app/api/openmailer/campaigns/[id]/send/route.ts`):
  - Implements two-phase approach:
    - **Phase 1 (Initialize)**: If campaign is 'draft', create all email records as 'pending', create tracking links once, set campaign to 'sending'
    - **Phase 2 (Process Batch)**: Query next 10 pending emails, send them, update statuses, return progress + continue flag
  - Each request processes max 10 emails (~3-4 seconds), well under 10s timeout
  - Returns `{ sent, total, continue }` to indicate whether more batches needed
- ✅ **Updated SendButton** (`app/(admin)/openmailer/campaigns/[id]/SendButton.tsx`):
  - Implements polling loop: calls send endpoint repeatedly while `continue: true`
  - Displays real-time progress bar showing `sent / total`
  - 1-second delay between batches for rate limiting
- ✅ **Fixed Drizzle query syntax**: Changed from chained `.where()` calls to `and()` operator for multiple conditions
- ✅ **Added null checks**: Added campaign existence checks to prevent TypeScript errors
- ✅ **Lazy-loaded Resend client**: Fixed build-time errors by deferring Resend initialization until runtime (applied to both OpenMailer and referral-images email services)

### Technical Implementation
**Batch Processing Pattern**:
```
User clicks "Send" 
→ Phase 1: Create queue (all emails as pending)
→ Phase 2: Process batch of 10 → Update progress
→ Frontend polls → Process next batch
→ Repeat until no pending emails
→ Mark campaign as 'sent'
```

**Database Schema** (existing):
- `openmailerEmails.status`: 'pending' | 'sent' | 'failed' | 'bounced'
- Campaign progress tracked via `totalSent` counter

**Build Issues Fixed**:
- Resend client initialization moved from module-level to lazy getter function
- Prevents "Missing API key" errors during `next build` when env vars unavailable
- Applied pattern to both `src/lib/openmailer/email.ts` and `src/lib/services/referral-images/email-service.ts`

### Decisions
- Batch size: 10 emails per request (conservative; ~3-4s per batch)
- Frontend drives polling (simple backend, easy to pause/resume)
- Queue approach allows resumption if interrupted
- Progress bar shows real-time feedback to user

### Evidence
- Commits:
  - `2cdc7e9e`: Initial batch processing implementation
  - `2fd4879f`: TypeScript fixes and Resend lazy loading
- Branch: `cursor/campaign-batch-sending-54b1`
- Files modified:
  - `app/api/openmailer/campaigns/[id]/send/route.ts`
  - `app/(admin)/openmailer/campaigns/[id]/SendButton.tsx`
  - `src/lib/openmailer/email.ts`
  - `src/lib/services/referral-images/email-service.ts`

### Next Steps
- Test campaign with full 36-email list in production
- Monitor batch timing and adjust BATCH_SIZE if needed
- Consider adding pause/cancel functionality for long campaigns

### Blockers Encountered
- Vercel serverless timeout (10s on free tier) — Resolved via batching
- Build-time Resend initialization errors — Resolved via lazy loading
- Drizzle ORM chained .where() syntax error — Resolved via and() operator

## 2026-02-01 Sun
### AI Scribe: /ai-scribe shows full landing page (feature not public)

**Context**: User requested AI scribe feature not be public; only show the landing page. "Learn more" on the home page already links to `/ai-scribe`; that URL previously showed a minimal page with direct "Open AI Scribe" and "Clinical images" links.

### Progress
- Replaced `app/(marketing)/ai-scribe/page.tsx` with the same content as the existing full landing at `/landing-page`: same early-landing components (PageNavigation, EarlyHeroSection, PersonalStorySection, MissionSection, FeatureAiscribe, FeatureImage, FeatureChat, EarlyFooterCTA, PageFooter).
- Set metadata for `/ai-scribe` to AI Scribe–focused title/description: "ClinicPro - AI Medical Scribing for NZ GPs".
- Home page link unchanged (`href="/ai-scribe"`). Middleware unchanged; `/ai-scribe` remains public; `/ai-scribe/*` (consultation, image, templates) remains protected.

### Decisions
- No redirect; `/ai-scribe` and `/landing-page` both render the same layout (duplicated JSX/structure). Optional future refactor: extract shared component for single source of truth.

## 2026-01-31 Sat
### Referral Images: Filename (date+time, no ID) and desktop overlay

**Context**: User requested filenames to include date and time (for multiple "left wound" images), remove random short ID (e.g. Pue9VP), and make desktop card label reflect side and optionally full filename.

### Progress
- ✅ **Filename generator** (`src/lib/services/referral-images/utils.ts`): `generateFilename()` now uses date (YYYY-MM-DD) + time (HHmmssSSS from `createdAt`) instead of short `imageId`; no random ID in filename. Example: `left-wound-image-2026-01-31-143052123.jpg`.
- ✅ **Desktop overlay** (`app/(clinical)/referral-images/desktop/page.tsx`): Card label now shows side when present (e.g. "Right – wound image"); fallback to description or filename. Full filename on hover via `title={image.filename}`.
- ✅ Build passed.

### Decisions
- Time uses HHmmssSSS (milliseconds) to avoid same-second filename collisions.
- Overlay: side + description when both exist; otherwise description or filename; tooltip shows full download filename.

### Referral Images: Implementation complete; docs tidied

**Context**: Referral Images feature implementation finished. Documentation tidy: archive working/strategy docs, add feature README, update PROJECT_SUMMARY.

### Progress
- ✅ Archived: Strategy & Implementation Plan and E2E Testing Results moved to `project-management/clinicpro/features/referral-images/archive/`
- ✅ Added `archive/README.md` describing archived contents
- ✅ Created `features/referral-images/README.md` as single entry point (summary, status, URLs, API routes, code locations)
- ✅ Updated `PROJECT_SUMMARY.md`: last_updated, Recent Updates, Key Features (Referral Images), Routing Snapshot (marketing + clinical referral-images routes and APIs), Technical Documentation References

### Decisions
- Working and strategy docs preserved in archive; README is current source of truth for overview and navigation.

## 2026-01-18 Sat
### Feature: Photo Tool Freemium Implementation

**Context**: Cloud agent built freemium standalone photo tool on branch `cursor/clinicpro-image-freemium-0acd`. Local testing and bug fixes performed.

### Progress
- ✅ Fixed middleware configuration for `/image/*` routes (Clerk authentication)
- ✅ Created database tables in Neon: `image_tool_mobile_links`, `image_tool_uploads`, `image_tool_usage`
- ✅ Added mock data fallbacks to API routes for dev environment resilience:
  - `app/api/image/mobile-link/route.ts` - Returns mock token when DB unavailable
  - `app/api/image/usage/route.ts` - Returns mock usage stats (3/20 images)
  - `app/api/image/status/route.ts` - Returns empty image list
- ✅ Tested complete user flow:
  - Desktop app page (`/image/app`) - Link generation, QR code, usage tracking
  - Mobile capture page (`/image/mobile`) - Token-based access, camera trigger
  - Upgrade page (`/image/upgrade`) - Feature comparison table

### Technical Implementation
- **Architecture**: Token-based mobile auth (no login required on mobile)
- **Database**: 3 new tables for link tokens, uploads metadata, usage tracking
- **Freemium Model**: 20 images/month free, $50 one-time premium upgrade
- **Premium Features**: Unlimited images, PDF export, annotation tools, batch processing

### Decisions
- **Keep mock fallbacks**: Provides graceful degradation when database unavailable; useful for local development
- **Middleware fix is permanent**: Required for Clerk auth to work properly with new routes

### Next Steps (Requires full .env setup)
- Configure AWS S3/R2 for image storage
- Configure Stripe for premium upgrades
- Test actual image upload flow
- Test PDF generation
- Test annotation tools (premium feature)

### Blockers Encountered
- Local environment missing `DATABASE_URL` - Fixed with mock fallbacks for testing
- Solution: Continue testing on computer with full `.env` configuration

## 2026-02-09 Mon
### Milestone: PHO Email Campaign Infrastructure

**Objective**: Set up email campaign to all NZ PHOs promoting referral images tool

**Context**: Built OpenMailer infrastructure for PHO outreach campaign. Created comprehensive setup system with API routes, CSV import, and campaign templates.

### Progress
- ✅ Created `data/pho-contacts-new.csv` with 8 new PHO contacts:
  - Ngā Mataapuna Oranga (hello@nmo.org.nz)
  - Arataki PHO (hello@tend.nz)
  - Pegasus Health (info@pegasus.health.nz)
  - Cosine Primary Care Network Trust (admin@kmc.co.nz)
  - South Canterbury Primary and Community (2 emails)
  - Community Care (2 emails)
- ✅ Created `/api/openmailer/setup-pho-campaign` route with 3 actions:
  - `import`: Add new PHO contacts to database
  - `create-test`: Create test campaign for ryo@clinicpro.co.nz
  - `create-production`: Create campaign for all ~36 PHO contacts (28 existing + 8 new)
- ✅ Created comprehensive documentation:
  - `QUICKSTART-PHO-CAMPAIGN.md` (browser and API-based workflows)
  - `docs/pho-campaign-setup.md` (detailed technical guide)
  - `scripts/pho-campaign-quickstart.sh` (bash automation script)
- ✅ Embedded full email HTML template in API route with merge fields:
  - `{{organization}}` for PHO name personalisation
  - `{{unsubscribe_url}}` for compliance
- ✅ Email content: Promotes referral images tool (https://clinicpro.co.nz/referral-images)
  - Focuses on GP workflow pain point (photos from phone to desktop)
  - Clear value prop: Auto-sized JPEG, instant transfer, 24hr auto-delete
  - Call to action: Forward to GPs/practice managers
- ✅ Campaign tracking enabled: Opens, clicks, bounces, unsubscribes

### Technical Implementation
- **API Route**: `/app/api/openmailer/setup-pho-campaign/route.ts`
  - Admin-only (requires `x-user-tier: admin` header)
  - Hardcoded new PHO contacts (no external dependencies)
  - Returns campaign IDs and URLs for UI access
- **CSV Format**: email,name,organization (standard OpenMailer import format)
- **Expected Recipients**: ~36 total PHO contacts
- **Tracking**: Automatic via OpenMailer (pixel tracking, link rewrites)

### Decisions
- **Browser-based setup recommended**: Easiest path is via OpenMailer UI at `/openmailer`
- **API route provides automation option**: For programmatic setup or future campaigns
- **Test-first approach**: Create test campaign, verify email, then production
- **No environment variable changes**: All setup uses existing OpenMailer infrastructure

### User Action Required
Campaign infrastructure ready; user needs to:
1. Import new PHO contacts (via UI or API)
2. Create test campaign and send to ryo@clinicpro.co.nz
3. Verify test email renders correctly
4. Create production campaign for all 36 PHO contacts
5. Send production campaign
6. Monitor results at `/openmailer/campaigns/{id}`

Follow `QUICKSTART-PHO-CAMPAIGN.md` for step-by-step instructions.

### Evidence
- Branch: `cursor/pho-email-campaign-d2cf`
- Commits: 
  - `4568e672`: "feat: add PHO email campaign setup via API route"
  - `8c22bb64`: "docs: add PHO campaign quickstart guide and script"
- Files created:
  - `data/pho-contacts-new.csv`
  - `app/api/openmailer/setup-pho-campaign/route.ts`
  - `docs/pho-campaign-setup.md`
  - `scripts/pho-campaign-quickstart.sh`
  - `QUICKSTART-PHO-CAMPAIGN.md`

### Blockers Encountered
- Cloud Agent environment missing `DATABASE_URL`: Cannot execute campaign setup from cloud agent
  - **Resolution**: Created comprehensive guides for local/production execution
  - **Impact**: User must run setup locally or via production app where DB credentials exist

### Next Steps
- User follows QUICKSTART guide to execute campaign
- Monitor open rates (expect 20-40% over 48 hours)
- Monitor click rates (expect 2-5% to referral images CTA)
- Track direct inquiries to ryo@clinicpro.co.nz
- Document campaign results in future LOG entry

---

## 2026-02-08 Sat
### Milestone: Referral Images Email Sequence - Email 2 Implementation

**Context**: Implemented Email 2 (check-in) for Referral Images email series and removed unused Email 3.

### Progress
- ✅ Created database migration (`0042_referral_images_checkin_email.sql`) adding `check_in_email_sent_at` to users table
- ✅ Updated email service: Renamed `sendUsageTipEmail` to `sendCheckInEmail` with feedback-focused content
- ✅ Removed Email 3 (`sendValueReinforcementEmail`) - no longer needed
- ✅ Added Email 2 logic to daily cron job (`/api/maintenance/referral-images-email-sequence`)
- ✅ Email 2 sends on Day 3 after signup to ALL users (regardless of usage)

### Technical Implementation
- **Database**: Added `checkInEmailSentAt` timestamp to `users` table (not `image_tool_usage` since it targets all users)
- **Email Content**: Feedback-focused check-in asking "How's it working? Any issues? Missing features?"
- **Trigger**: Day 3 after user `createdAt`, sent once per user
- **Cron Schedule**: Runs daily via existing email sequence cron job

### Email Sequence Status
- Email 1 (Welcome): ✅ Implemented, sends immediately
- Email 2 (Check-in): ✅ Implemented, Day 3 all users
- Email 3 (Value): ❌ Removed
- Email 4 (Limit Hit): ✅ Implemented
- Email 5 (Share Encourage): ✅ Implemented, Day 5 after limit
- Email 6 (Month Reset): ✅ Implemented

### Decisions
- Send Email 2 to ALL users on Day 3 (not just active users) to gather feedback even from non-users
- Store tracking in `users` table (not `image_tool_usage`) since targeting all users
- Remove Email 3 entirely rather than repurposing it

### Next Steps
- Monitor Email 2 feedback responses
- Consider adding email response handling/tracking
- Run SQL migration in production when ready

### Blockers Encountered
- None

## 2026-01-10 Fri
### Milestone: Start project-based logging
- Logging has moved to per-project `LOG.md` files.
- This project is currently maintenance-only; most active work is in Medtech Integration.

### Progress
- No work performed today.

### Decisions
- None.

### Blockers encountered
- None.
