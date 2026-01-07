---
project_name: Medtech ALEX Integration
project_stage: Build
owner: Development Team
last_updated: "2026-01-07"
version: "1.7.0"
tags:
  - integration
  - medtech
  - healthcare
  - fhir
  - api
summary: "Clinical images widget integration with Medtech Evolution/Medtech32 via ALEX API. Enables GPs to capture/upload photos from within Medtech, saved back to patient encounters via FHIR API."
quick_reference:
  current_phase: "Phase 1D"
  status: "Phase 1C ✅ complete; Phase 1D in progress (Medtech Evolution UI validation using local facility)"
  next_action: "Run Phase 1D UI validation (see DEVELOPMENT_ROADMAP.md): resolve local patientId for NHI ZZZ0016 in F99669-C; commit 1 image to F99669-C; confirm it appears in Medtech Evolution Inbox and Daily Record"
  key_blockers:
    - "Need local patientId for NHI ZZZ0016 in facility F99669-C"
    - "ALEX often forbids GET /Media (write-only); do not rely on Media search for verification"
  facility_id: "F2N060-E (hosted UAT API testing) + F99669-C (local Medtech Evolution UI validation)"
key_docs:
  project_rules: "PROJECT_RULES.md"
  roadmap: "DEVELOPMENT_ROADMAP.md"
  changelog: "CHANGELOG.md"
  alex_api: "alex-api.md"
---

## Read order (for humans and AI)
- `PROJECT_RULES.md` (hard constraints and workflow)
- `PROJECT_SUMMARY.md` (this file; operational runbook)
- `DEVELOPMENT_ROADMAP.md` (Phase plans; Phase 1D testing details live here)
- `CHANGELOG.md` (history)

---

## Operational runbook (single source of truth)

### Architecture (why there is a BFF)
- **Vercel (Next.js)**: hosts the widget UI and non-ALEX endpoints (dynamic IP).
- **Lightsail BFF** `api.clinicpro.co.nz`: the only component that calls **ALEX** (static IP allow-listed by Medtech).

### Environments and facility IDs (critical)
- **`F2N060-E`**: Medtech hosted UAT facility. Use for API-only checks. This will not appear inside your local Medtech Evolution UI.
- **`F99669-C`**: your local Medtech Evolution facility. Use for UI validation (Inbox and Daily Record).

### Canonical endpoints
- **BFF health**: `GET https://api.clinicpro.co.nz/health`
- **ALEX connectivity test (via BFF)**: `GET https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016&facilityId=<FACILITY>`
- **Commit to ALEX (via widget)**: widget calls Vercel route `POST /api/medtech/attachments/commit`, which proxies to BFF.
- **Commit to ALEX (direct BFF, for smoke tests)**: `POST https://api.clinicpro.co.nz/api/medtech/session/commit`

### Logs and tracing
- **Vercel logs**: commit route logs correlationId and returned mediaIds.
- **Lightsail logs**: `sudo journalctl -u clinicpro-bff -f`
- **Correlation IDs**:
  - Commit generates a `correlationId`.
  - BFF forwards it to ALEX as `mt-correlationid`.

### Phase 1D UI validation (where to look)
- **The detailed test steps live in** `DEVELOPMENT_ROADMAP.md` under Phase 1D.
- **Key point**: for UI validation you must commit into `F99669-C`.

### How to resolve the local patientId for `ZZZ0016` in `F99669-C`
- Call:
  - `GET https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016&facilityId=F99669-C`
- If the response does not include a patientId, update the BFF test endpoint to include it (Lightsail BFF `index.js` can return `patientBundle.entry[0].resource.id`) and redeploy, then re-run the call above.

### Known ALEX limitations that affect debugging
- **`Media.identifier` is mandatory** on POST Media.
- **Images must be < 1MB**.
- **ALEX commonly forbids `GET /Media`** (write-only permissions); do not rely on Media search for verification. Prefer: commit, then verify in Medtech Evolution UI for Phase 1D.

---

## Current status (kept short)
- **Phase 1C complete**: commit creates FHIR `Media` in ALEX via Lightsail BFF (static IP).
- **Phase 1D in progress**: commit into local facility `F99669-C`, then confirm it appears in Medtech Evolution UI (Inbox and Daily Record).

---

## Recent updates (last 3-5 only)

### [2026-01-07] — Phase 1D Unblock: facilityId must be passed end-to-end (local Evo UI uses F99669-C) + tracing helpers

**What changed**:
- ✅ **Commit now requires `facilityId` end-to-end** (widget → Vercel → Lightsail BFF → ALEX header `mt-facilityid`)
  - Rationale: committing to hosted UAT facility (`F2N060-E`) will not appear in your local Medtech Evolution UI; UI validation requires your local facility (`F99669-C`)
- ✅ **Request tracing**:
  - Commit now emits a `correlationId` (returned to client and logged) and BFF forwards it to ALEX as `mt-correlationid`
  - Note: ALEX often forbids `GET /Media`; treat Media search as non-authoritative unless proven working.

**Why this matters**:
- Prevents false negatives during Phase 1D (commit “success” but nothing in UI) caused by facility mismatch.

### [2026-01-07] — ✅ Phase 1C Complete: Commit creates FHIR Media in ALEX via Lightsail BFF (desktop + mobile)

**What changed**:
- ✅ **Lightsail BFF**: Added real endpoint `POST /api/medtech/session/commit` (static IP) that creates FHIR `Media` in ALEX UAT using:
  - Mandatory `Media.identifier` with system `https://clinicpro.co.nz/image-id` and UUID value
  - `content.data` base64 (no S3 URL references)
  - Per-file size enforcement: `< 1MB`
  - Accepts source either `{ base64Data }` or `{ downloadUrl }` (BFF fetches `downloadUrl` then base64-encodes)
- ✅ **Vercel (Next.js)**: `POST /api/medtech/attachments/commit` now proxies to BFF only (no direct ALEX calls)
  - Requires `patientId` in request
  - For mobile images, presigns `s3Key` to a `downloadUrl` via existing `s3ImageService`
- ✅ **Widget**: Commit sends commit-ready sources
  - Desktop: converts `File` to `base64Data`
  - Mobile: sends `s3Key`
  - Always includes `patientId` in commit request

**Key constraints honoured**:
- Only Lightsail BFF calls ALEX (static IP); Vercel does not call ALEX anymore
- Size check enforced in BFF before POST (max 1MB)

**What was tested (evidence)**:
- **Direct BFF smoke test**:
  - `POST https://api.clinicpro.co.nz/api/medtech/session/commit` returned `status: committed`
  - Example `mediaId`: `a4fcaddd4b8f24f377eca1c6b889ad76`
- **Widget UAT (via Vercel logs)**:
  - `[Medtech Commit] Commit complete { duration: 3330, successCount: 2, errorCount: 0 }`
  - `POST /api/medtech/attachments/commit` returned `200` with `successCount: 2, errorCount: 0`
  - Session images endpoint returned `withDownloadUrls: 2`
  - UI shows green tick (committed) on thumbnails
- **Health checks (run from Windows)**:
  - `GET https://api.clinicpro.co.nz/health` OK
  - `GET https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016` success
- **Test widget URL used**:
  - `https://www.clinicpro.co.nz/medtech-images?encounterId=test-enc-001&patientId=14e52e16edb7a435bfa05e307afd008b&facilityId=F2N060-E`

### [2026-01-06] — 🆕 Task Completion Checker Feature Exploration Started

**New Feature Concept** (validated as technically feasible):
- AI-powered tool to extract tasks from consultation notes and flag incomplete ones
- Approach: Hybrid (AI extracts, GP confirms, tool cross-references with ALEX data)
- Focus: Labs, Prescriptions, Referrals (verifiable via ALEX API)
- Note format: SOAP structure with Plan section, free text

**What Was Created**:
- Feature folder: `features/task-completion-checker/`
- Feature overview: `features/task-completion-checker/FEATURE_OVERVIEW.md`
- BFF test endpoints: 5 new endpoints in `/lightsail-bff/index.js`
- Validation script: `/scripts/validate-task-checker-via-bff.ts`

**Next Steps**:
1. Deploy BFF with new endpoints (merge to main)
2. Run validation script to confirm note text is accessible
3. If feasible, proceed to AI prompt design and MVP

**Documentation**: See `features/task-completion-checker/FEATURE_OVERVIEW.md` for full details.
### [2026-01-06] — ✅ Phase 1B Testing Complete & Production Ready

**Testing Complete** (~3 hours across 2 days):
- ✅ All 11 Phase 1B tests executed (Tests 1-8 manual, 9-11 passive)
- ✅ 6 bugs identified and fixed during testing
- ✅ Real-time sync working (mobile → desktop via Ably)
- ✅ Image deletion from Redis implemented
- ✅ QR code workflow validated (2-hour TTL)
- ✅ 20 image per-session limit enforced
- ✅ S3 lifecycle policy confirmed (24-hour auto-delete)

**Bugs Fixed**:
1. Duplicate images on upload (stale closure in useAblySessionSync)
2. Deleted images reappearing after refresh (missing Redis DELETE API)
3. QR panel not appearing (missing useEffect for auto-generation)
4. Metadata schema mismatch (mobile: side/description → backend: laterality/notes)
5. Side dropdown simplified (removed Bilateral/Not applicable, kept Left/Right only)
6. Image limit error message now displays properly on mobile

**Production Deployment**:
- ✅ Deployed to: `https://www.clinicpro.co.nz/medtech-images`
- ✅ CORS configured for production + preview URLs
- ✅ Environment variables validated
- ✅ End-to-end flow tested and working

**Impact**:
- Phase 1B fully functional and ready for GP use
- Mobile upload → Desktop sync workflow validated
- Data lifecycle confirmed (session: 2 hours, S3: 24 hours)
- Ready to proceed to Phase 1C (FHIR commit)

---

### [2026-01-02] — ✅ Phase 1B Implementation Complete (Redis + S3 + Mobile + Ably)

**Implementation Complete** (~4 hours):
- ✅ Redis session service (Upstash) - Per-encounter storage with 2-hour TTL
- ✅ S3 image service (AWS) - Presigned URLs with auto-retry (3 attempts)
- ✅ 5 Vercel API endpoints - Session create, token validate, presigned URL, add image, get images
- ✅ Mobile page (7 screens) - Full metadata capture (laterality + body site)
- ✅ Desktop Ably listener - Real-time sync with eager fetch
- ✅ Build successful - TypeScript passes, ready for deployment

**What Was Built**:
- Infrastructure: Redis + S3 clients (~300 lines)
- API Layer: 5 new routes (~400 lines)
- Mobile: Full 7-screen flow with compression (~650 lines)
- Desktop: Ably hook for real-time sync (~150 lines)
- **Total: ~1,500 lines, 13 files created/modified, 0 new dependencies**

**Next Steps**:
1. ✅ Setup S3 bucket + lifecycle policy - COMPLETE
2. ✅ Verify environment variables in Vercel dashboard - COMPLETE
3. Deploy to Vercel (merge to main)
4. Run 11 tests from `PHASE_1B_TESTING.md` (1-2 hours)
5. Begin Phase 2 (Backend Integration - connect ALEX API)

**Documentation**:
- Testing Guide: `PHASE_1B_TESTING.md` (11 comprehensive tests)
- Implementation Summary: `PHASE_1B_COMPLETE.md` (full architecture docs)

### [2026-01-02] — 🔄 BFF Repo Merged into Main Repo

- **Repository consolidation**: Merged `clinicpro-bff` repo into main `ClinicProNZ` repo
- **New location**: BFF code now in `/lightsail-bff/` folder of main repo
- **Deployment updated**: GitHub Actions workflow updated to deploy from merged repo
- **Single source of truth**: All code now in one repository for easier management
- **Benefits**: Simpler workflow for solo founder, auto-deployment working, cleaner git history

### [2025-12-09] — 🏗️ Phase 1 Architecture Finalized & Documentation Restructure

- **Phase 1 architectural decisions finalized** for 100 concurrent GPs scale
- Session storage: Redis + S3 (vs in-memory) for reliability and scale
- Real-time sync: Ably (existing infrastructure, perfect fit)
- Session lifetime: 10-minute inactivity timeout (no heartbeat)
- Image compression: Frontend (mobile/desktop) before upload
- Image format: HEIC → JPEG conversion on frontend (Canvas API)
- Mobile metadata: Optional basic fields (laterality + body site)
- **Documentation restructure**: Feature-centric organization (Option A)
  - Created `features/`, `infrastructure/`, `reference/` folders
  - Moved feature docs to `features/clinical-images/`
  - Consolidated config docs: `oauth-and-config.md`
  - Archived deprecated docs
- **New docs**: PROJECT_RULES.md, FEATURE_OVERVIEW.md, CHANGELOG.md
- **Updated time estimate**: Phase 1 now 6-8 hours (was 4-6) due to Redis + S3 implementation

### [2025-11-12] — 📚 Documentation Consolidation & Streamlining

- Reduced core project management docs to 2 files (PROJECT_SUMMARY.md and DEVELOPMENT_ROADMAP.md)
- Consolidated READY_TO_START.md into DEVELOPMENT_ROADMAP.md as "Quick Start" section
- Cleaned STATUS_DETAILED.md - removed historical decisions/changes, kept only current status
- Removed inter-document references from all docs except PROJECT_SUMMARY.md
- Streamlined for better AI navigation (docs only accessible via PROJECT_SUMMARY.md references)

**For full history**: See CHANGELOG.md

### [2025-11-12] — 📋 Development Roadmap Created & Updated (3-Phase Plan)

- Created comprehensive 3-phase development plan (12-18 hours total)
- Phase 1: Mobile Upload & Dataflow Review (4-6 hours)
- Phase 2: Complete Integration (4-6 hours)
- Phase 3: Widget Launch Mechanism (3-5 hours)
- Target completion: Nov 17, 2025

### [2025-11-11] — 🎉 MAJOR MILESTONE: POST Media Validated, Widget Can Upload Images!

- POST Media endpoint working (201 Created) ✅
- Successfully uploaded test image to ALEX API
- OAuth permissions verified (`patient.media.write`)
- All critical endpoints tested (7 endpoints: 4 working, 3 expected limitations)

### [2025-11-11] — Lightsail BFF Verified, 503 Error Resolved, Testing Complete

- BFF configuration verified and operational ✅
- 503 error resolved (changed facility ID to `F2N060-E`)
- OAuth token acquisition: ✅ Working (249ms)
- FHIR Patient query: ✅ Working (200 OK)

### [2025-11-10] — Integration Complete, Bug Fixes, Successful Test

- OAuth bug fixed, BFF headers fixed
- Successful end-to-end test: Retrieved patient data from ALEX API
- 16 unit tests created (all passing)

---

*Project Created: [2025-01-15]*  
*Last Updated: [2025-12-09] - Phase 1 architecture finalized, documentation reorganized (feature-centric)*  
*Version: 1.3.0*
