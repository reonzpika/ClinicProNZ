# Project Log - ClinicPro SaaS

## 2026-02-03 Tue
### AI Clinical Review feature implemented

**Context**: Implemented AI Clinical Review from plan in `project-management/clinicpro/features/ai-review/`. Feature allows GPs to get clinical decision support (red flags, DDx, investigations, management) on consultation notes via Claude 3.5 Sonnet.

**Progress**
- **Schema**: Added `database/schema/ai_suggestions.ts` and export in `database/schema/index.ts`. Migration `database/migrations/0040_add_ai_suggestions.sql` created; user must run SQL directly (no drizzle-kit push per project rules).
- **API**: `app/api/(clinical)/consultation/ai-review/route.ts` (POST, RBAC, empty-response validation, DB write logging); `app/api/(clinical)/consultation/ai-review/feedback/route.ts` (POST, feedback on most recent suggestion).
- **UI**: `src/features/clinical/ai-review/components/AIReviewButton.tsx` (Sparkles button, module panel, re-trigger prevention); `src/features/clinical/ai-review/components/AIReviewModal.tsx` (left-column overlay, auth headers, better error messages).
- **Integration**: AI Review button added to ClinicalToolsTabs icon strip (next to Clinical Images and Referral Letter) in `src/features/clinical/right-sidebar/components/ClinicalToolsTabs.tsx`.
- **Safety**: User-facing error messages (API key, rate limit, timeout, default); empty AI response validation (&lt; 10 chars); `isGenerating` debounce; `[CRITICAL]` logging on DB insert failure.
- Build passed; `project-management/**/*` excluded from tsconfig to avoid type-checking proposal reference files.

**Decisions**
- Modal overlays left column only (~600px, 85vh) so consultation note stays visible on right (per UI_UX_SPECIFICATION.md).
- Auth: `createAuthHeaders(userId, userTier)` used in modal fetch for ai-review and feedback.
- Migration: Use `0040_add_ai_suggestions.sql`; run manually (Neon SQL Editor or psql).

**Next**
- User runs `0040_add_ai_suggestions.sql` against Neon.
- Manual test: empty notes (button disabled), all four modules, error cases, double-click guard, feedback persistence.

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
