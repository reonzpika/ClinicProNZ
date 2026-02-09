# Project Log - ClinicPro SaaS

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
