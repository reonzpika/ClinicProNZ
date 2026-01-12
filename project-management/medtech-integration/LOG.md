# Project Log - Medtech Integration

## Project rules (current)
- The canonical Medtech Integration rules are now consolidated in `.cursor/rules/project-medtech-integration.mdc`.
- Historical log entries may mention older file names (for example `PROJECT_RULES.md`); treat those as historical context.

## 2026-01-12 Sun (Part 2)
### Milestone: LAUNCH_MECHANISM_PLAN Phase 3 Complete - Frontend Launch Support Implemented

**What was implemented**:
- Updated `/medtech-images` page to support both launch mechanism and direct parameters
- Created Vercel proxy endpoint: `GET /api/medtech/launch/proxy`
- Widget now handles three launch modes: launch mechanism (context + signature), direct parameters (encounterId + patientId), and mock fallback

**Implementation details**:

**1. Frontend page updates** (`app/(medtech)/medtech-images/page.tsx`):
- Added state: `isDecodingLaunchContext` to track launch context decoding
- Updated `useEffect` to check for `context` and `signature` parameters first
- If present: fetches `/api/medtech/launch/proxy`, decodes context, sets encounter context
- If absent: falls back to existing direct parameter parsing (backward compatible)
- Shows "Loading patient context..." message while decoding
- Error handling: displays error banner if decoding fails

**2. Vercel proxy endpoint** (`app/api/medtech/launch/proxy/route.ts`):
- Accepts `context` and `signature` query parameters
- Validates required parameters (returns 400 if missing)
- Proxies request to BFF: `GET /api/medtech/launch/decode`
- Returns BFF response (status code + JSON data)
- Error handling: returns 500 if BFF request fails

**Launch flow**:
1. Medtech Evolution launches widget URL with encrypted context + signature
2. Widget page detects launch mechanism parameters
3. Calls `/api/medtech/launch/proxy` (Vercel endpoint)
4. Vercel proxies to `/api/medtech/launch/decode` (BFF endpoint)
5. BFF decrypts context via ALEX API
6. Widget initializes with decrypted patient/facility/provider context

**Backward compatibility maintained**:
- Direct parameters still work: `/medtech-images?encounterId=X&patientId=Y`
- Mock fallback still works: `/medtech-images` (no parameters)
- All existing flows unaffected

**Testing status**:
- ⏸️ End-to-end testing pending (requires Phase 4: icon setup in F99669-C and actual launch from Medtech Evolution)
- ⚠️ Linter warnings exist in original code (pre-existing, not introduced by changes)

**Next steps**:
- LAUNCH_MECHANISM_PLAN Phase 4: Load icon into F99669-C via MT Icon Loader
- LAUNCH_MECHANISM_PLAN Phase 4: Configure ALEX Apps Configuration in Medtech Evolution
- LAUNCH_MECHANISM_PLAN Phase 4: Test end-to-end launch mechanism
- LAUNCH_MECHANISM_PLAN Phase 4: Re-test UI integration (may fix Inbox/Daily Record issues)

**Evidence**:
- Code: `app/(medtech)/medtech-images/page.tsx` lines 37-131
- Code: `app/api/medtech/launch/proxy/route.ts` (new file)
- Plan reference: `LAUNCH_MECHANISM_PLAN.md` Phase 3

---

## 2026-01-12 Sun (Part 1)
### Milestone: LAUNCH_MECHANISM_PLAN Phase 2 Complete - BFF Launch Decode Endpoint Implemented

**What was implemented**:
- BFF endpoint: `GET /api/medtech/launch/decode`
- Accepts `context` and `signature` query parameters (from Medtech Evolution launch URL)
- Validates required parameters
- Calls ALEX API: `/vendorforms/api/getlaunchcontextstring/{context}/{signature}`
- Returns decrypted launch context: `{ patientId, facilityCode, providerId, createdTime }`
- Follows existing BFF patterns: correlationId tracking, error handling, timing metrics

**Implementation details**:
- File: `lightsail-bff/index.js`
- Endpoint added after media verification endpoint (line 397)
- Uses existing `alexApiClient.get()` method (handles OAuth token automatically)
- URL-encodes context and signature for ALEX API path parameters
- Returns standardised response format: `{ success, duration, correlationId, context }`
- Error handling matches existing endpoints (400 for missing params, 500 for ALEX errors)

**Testing status**:
- ✅ Syntax validation passed (`node -c index.js`)
- ⏸️ End-to-end testing pending (requires LAUNCH_MECHANISM_PLAN Phase 1 icon setup + Phase 3 frontend route)

**Next steps**:
- LAUNCH_MECHANISM_PLAN Phase 3: Implement frontend launch route (`/medtech-images/launch`) and Vercel proxy endpoint
- LAUNCH_MECHANISM_PLAN Phase 4: Test launch mechanism with F99669-C facility

**Note**: This is Phase 2 of `LAUNCH_MECHANISM_PLAN.md` (separate from `DEVELOPMENT_ROADMAP.md` Phase 1D, which includes launch mechanism as one of its tasks).

**Evidence**:
- Code: `lightsail-bff/index.js` lines 373-445
- Plan reference: `LAUNCH_MECHANISM_PLAN.md` Phase 2

---

## 2026-01-10 Fri
### Milestone: Consolidate logging into `LOG.md`
- Legacy changelog history has been migrated into this file.
- New entries should be added here going forward.

### Progress
- No new work recorded today.

### Decisions
- None.

### Blockers encountered
- Waiting on Medtech to clarify ALEX UAT search authorisation behaviour for non-Patient resources.
- Phase 1D UI validation still requires local facility `F99669-C` to be online (Windows desktop tunnel must stay awake).

---

## 2026-01-11 Sat (Part 2)
### Learning: Launch Mechanism Guidance from Defne (ALEX Vendor Forms)

**What we learned**:
- Medtech Evolution uses **ALEX Vendor Forms launch mechanism** for third-party integrations.
- This is the proper way to launch our widget from within Medtech Evolution (not manual URL construction).
- Launch flow:
  1. GP clicks custom icon in Medtech toolbar
  2. Medtech generates encrypted launch context (patient, facility, provider)
  3. Launches our widget URL with `context` and `signature` parameters
  4. Our backend calls ALEX API to decrypt context using JWT token
  5. Widget initializes with patient/facility data

**Setup steps provided**:
1. **Icon loading**: Use "MT Icon Loader" utility to import icon into Medtech database
2. **ALEX Apps Configuration**: Configure app in Options > ALEX > ALEX Apps Configuration
3. **Launch URL**: Point to our widget with `{context}` and `{signature}` placeholders
4. **Decrypt endpoint**: Backend must call `/vendorforms/api/getlaunchcontextstring/` to decrypt

**Impact**:
- Solves the launch mechanism requirement for Phase 1D
- Provides secure patient context passing (no manual URL construction needed)
- Gives us provider context (which GP is using the widget)
- May also solve the UI integration issue (proper launch might fix Inbox/Daily Record display)

**Next steps**:
1. Create icon for ClinicPro Images
2. Implement BFF launch decode endpoint
3. Implement frontend launch route
4. Test with local facility F99669-C
5. Re-test UI integration after proper launch

**Documentation**:
- Created `LAUNCH_MECHANISM_PLAN.md` with detailed implementation plan

---

## 2026-01-11 Sat (Part 1)
### Milestone: Phase 1D UI Validation Complete (with critical findings)

**What was tested**:
- Committed 1 test image to local facility `F99669-C` via widget
- Verified appearance in Medtech Evolution UI (Inbox and Daily Record)

**Test evidence**:
- Correlation ID: `4bad6cdd-abaf-48f5-b393-156725709a79`
- File ID: `mxt2BHNXcOGqQYp8Vuo4p`
- Patient ID (F99669-C): `231f0d896dd1a8875c87a0b7ae41b941`
- NHI: `ZZZ0016`
- Timestamp: 11 Jan 2026 23:42

**Results**:
- ✅ Connectivity verified: Hybrid Connection Manager running; F99669-C reachable via BFF
- ✅ Commit successful: HTTP 200, status "committed"
- ✅ Image appears in **Inbox** (two MEDIA entries visible, dated 11 Jan 2026)
- ❌ Image does **NOT** appear in **Daily Record**
- ❌ Image displays as clickable link "View ...." instead of inline preview
- ❌ Link does not work when clicked ("The webpage cannot be displayed" error)

**Critical finding**:
Creating a plain FHIR `Media` resource via `POST /FHIR/Media` is **not sufficient** for proper Medtech Evolution UI integration. The user expects (and Medtech Evolution supports) inline image display without requiring link clicks.

**Possible causes**:
1. Missing required FHIR resource (DocumentReference or Communication) to trigger Daily Record entry
2. `Media.content.url` may be pointing to invalid/inaccessible location (causing "webpage cannot be displayed")
3. Medtech Evolution may require specific Media resource structure or additional fields for inline rendering
4. May need to use Medtech-specific API endpoint (not plain FHIR) for proper UI integration

**Next steps** (investigation required):
1. Contact Medtech support: ask how to properly commit images for inline display in Inbox and Daily Record
2. Review ALEX API documentation for Media upload best practices
3. Check if DocumentReference or Communication resource is required alongside Media
4. Investigate the `content.url` vs `content.data` approach (we're using base64 `content.data`; maybe `content.url` is expected for UI?)
5. Ask Medtech: what's the difference between images that show inline vs as links?

**Impact**:
- Phase 1D partially validates end-to-end workflow (images reach Medtech)
- Workflow is **NOT production-ready** yet (UX is broken)
- Need Medtech guidance before pilot clinic launch

---

## 2026-01-10 Sat
### Learning: ALEX UAT search works; our query shape was wrong (Defne)

**What we learned**:
- ALEX support confirmed the token roles are correct.
- Media search in UAT can work when using **identifier-based chained search**, for example:
  - `GET /FHIR/Media?patient.identifier=https://standards.digital.health.nz/ns/nhi-id|<NHI>`
- Our previous Media verification attempts using `patient=<patientId>` and `subject=Patient/<patientId>` returned `403 Authorization failed` in UAT.

**Change made**:
- Updated the Lightsail BFF `/api/medtech/media` endpoint to require `nhi` and query using `patient.identifier` only (no fallback).

**Impact**:
- Unblocks reliable "read/verify" for Media in UAT, aligning with ALEX support guidance; reduces time wasted chasing auth issues that are actually URL/query-shape issues.

## Legacy changelog (migrated from the former `CHANGELOG.md` on 2026-01-10)

**Purpose**: Track significant changes, decisions, and milestones over time.

## [2026-01-08] — Task Completion Checker; UX direction documented (Claude.ai); waiting on ALEX READ permissions

**What changed**:
- Documented the preferred UX approach for the Task Completion Checker feature: **passive background checking** with a dedicated Task Checker surface and a rate-limited queue.
- Captured fallback modes if Medtech host capabilities (patient change detection, tab/badge support) are not available.

**Blocker recorded**:
- ALEX UAT returns 403 for FHIR search on required resources (DocumentReference, DiagnosticReport, MedicationRequest, Communication, Task, Media) even though the OAuth token contains the expected app roles; waiting for Medtech to clarify the permission set/policy required for search operations.

**Impact**:
- Clear UX direction is set, but implementation is intentionally paused until data access is confirmed and Medtech constraints are verified.

## [2026-01-08] — ALEX UAT: token roles confirmed; search still returns 403; email sent to Medtech

**Evidence collected (direct ALEX calls, hosted facility `F2N060-E`)**:
- `GET /FHIR/metadata` returns `200`.
- `GET /FHIR/Patient/{id}` returns `200`.
- FHIR searches return `403` OperationOutcome "Authorization failed":
  - `GET /FHIR/Task?_count=1`
  - `GET /FHIR/Communication?...`
  - `GET /FHIR/Media?...` (both `patient=` and `subject=` variants)

**Token validation**:
- Decoded the client-credentials token payload and confirmed `roles[]` includes `patient.task.read`, `patient.media.read`, `patient.communication.generalcommunication.read`, and `patient.communication.outboxwebform.read` (plus other read roles).

**Action**:
- Sent an email to Medtech support describing the Lightsail static IP BFF setup and the direct ALEX evidence, asking whether ALEX requires additional permissions for FHIR search operations in UAT.

## [2026-01-07] — Documentation consolidation: single runbook in PROJECT_SUMMARY.md; Phase 1D test detail in ROADMAP; Media GET is often forbidden

**What changed**:
- **Docs minimised** for future work:
  - `PROJECT_SUMMARY.md` is now the **single operational runbook** (how to run tests; where to look for logs).
  - `DEVELOPMENT_ROADMAP.md` is the **only place** Phase 1D testing steps live.
  - `PROJECT_RULES.md` updated with: **latest change wins**, **no duplication**, **archive aggressively**.
- **Corrected assumption**: ALEX commonly forbids `GET /Media` (write-only); Media search is not a reliable verification path.

**Impact**:
- Less chance of missing the "right doc"; fewer active docs to maintain.
- Phase 1D now explicitly validates via **Medtech Evolution UI** (Inbox + Daily Record) rather than relying on Media search.

## [2026-01-07] — Phase 1D UI Validation Unblocked: facilityId propagation + correlationId tracing + Media verify endpoint

**Problem discovered**:
- Commits were succeeding but nothing appeared in Medtech Evolution UI.
- Root cause: commits were being written to **hosted UAT facility `F2N060-E`**, while the installed Medtech Evolution instance uses **local facility `F99669-C`**; you cannot see `F2N060-E` data inside the local UI.

**Changes made**:
- **Commit now requires `facilityId` end-to-end** (widget → Vercel → Lightsail BFF → ALEX `mt-facilityid`)
- **Tracing added**:
  - `correlationId` returned/logged for commits
  - BFF forwards `mt-correlationid` to ALEX
- **Verification endpoint added (BFF)**:
  - `GET /api/medtech/media?patient=<id>&facilityId=<facilityId>`
  - or `GET /api/medtech/media?nhi=ZZZ0016&facilityId=F99669-C`

**Impact**:
- Phase 1D UI validation can be performed correctly against `F99669-C`.
- Note: ALEX may forbid Media searches; treat the "Media verify endpoint" as best-effort only, not a guaranteed source of truth.

## [2025-12-09] — UI/UX Specifications Complete + Medtech Evolution Integration Research

**Completed**:
- Mobile UI specification (7 screens, 9,500 words): `features/clinical-images/mobile-ui-spec.md`
- Desktop UI specification (12 components, 6,500 words): `features/clinical-images/desktop-ui-spec.md`
- Medtech Evolution integration research (600 lines): `reference/medtech-evolution-integration.md`
- Medtech support questions documented: `reference/medtech-support-questions.md`
- Feature overview updated with UI/UX decisions and constraints

**Key Architectural Decisions**:
- Session scope: Per patient (1 hour from last activity)
- Two commit paths: Desktop review (default/recommended) + Mobile direct commit (optional)
- Metadata fields: Body Site/Comment required (desktop), Laterality Left/Right/N/A (optional)
- Validation: Mobile lenient (all optional), Desktop strict (body site required)

**Critical Constraint Identified**:
- Media resources in ALEX API are immutable (cannot be edited/deleted after commit)
- Desktop review is essential (not optional) to prevent mistakes
- Confirmed via Perplexity research of ALEX API documentation

**Medtech Evolution Integration Findings** (Perplexity research):
- NO widget API, PostMessage events, or lifecycle hooks available
- Apps launched via ALEX Apps toolbar as independent web applications
- Patient context passed at launch (exact format TBD from Medtech)
- No real-time patient change detection available
- Solution: Session-per-patient approach, new launch = new patient

**Patient Change Detection Strategy**:
- Browser `beforeunload` warning if uncommitted images
- Check for previous patient's uncommitted images on new launch
- Session expiry with grace period if uncommitted images exist
- Standard browser events only (no Evolution-specific events available)

**Documentation Structure**:
- Mobile: 7 screens fully specified (landing, review, metadata, upload, success, errors)
- Desktop: 12 components specified (top bar, patient banner, warning banner, QR panel, thumbnails, preview, metadata form, dialogs)
- API endpoints: 6 endpoints documented with request/response formats
- Data structures: TypeScript interfaces for all entities
- Testing checklists: Functional, cross-device, network conditions

**Open Questions** (documented in `reference/medtech-support-questions.md`):
1. Launch URL format for ALEX Apps
2. Patient context fields passed at launch
3. Launch token validation mechanism
4. ALEX Apps registration process
5. Embedding method (window, tab, or iFrame)
6. Lifecycle events documentation (if any)

**Status**: Ready for implementation, Medtech support questions documented for later

---

## [2025-12-09] — Documentation Reorganisation (Option A: Feature-Centric)

**Changes**:
- Restructured documentation into feature-centric organisation
- Created `features/clinical-images/` folder for feature-specific docs
- Created `infrastructure/` folder for shared infrastructure docs
- Created `reference/` folder for heavy reference documentation
- Consolidated `archive/` folder at root level

**Docs Moved**:
- `WIDGET_IMPLEMENTATION_REQUIREMENTS.md` → `features/clinical-images/implementation-requirements.md`
- `FHIR_API_TEST_RESULTS.md` → `features/clinical-images/test-results.md`
- `LIGHTSAIL_BFF_SETUP.md` → `infrastructure/bff-setup.md`
- `ARCHITECTURE_AND_TESTING_GUIDE.md` → `infrastructure/architecture.md`
- `TESTING_GUIDE_POSTMAN_AND_BFF.md` → `testing/testing-guide.md`
- `STATUS_DETAILED.md` → `archive/STATUS_DETAILED.md` (deprecated)
- `alex-api-review-2025-10-30.md` → `alex-api.md` (later moved to project root)
- `GATEWAY_IMPLEMENTATION.md` → `reference/gateway-implementation.md`
- `images-widget-prd.md` → `reference/product-requirements.md`
- `FHIR_MCP_SERVER_SETUP.md` → `reference/fhir-mcp-setup.md`

**Docs Consolidated**:
- `TECHNICAL_CONFIG.md` + `UPDATE_ENV_VARIABLES.md` → `infrastructure/oauth-and-config.md`

**Folders Removed**:
- `api/` (empty after move)
- `implementation/` (empty after move)
- `product/` (empty after move)
- `docs/` (all content moved)

**Benefits**:
- Clear separation: Features vs Infrastructure vs Reference
- Easier to add new features (prescriptions, referrals, etc.)
- Reference docs separated from active development docs
- Consolidated configuration documentation

---

## [2025-12-09] — Phase 1 Architecture Finalised

**Architectural Decisions**:
- Session storage: Redis + S3 (supports 100+ concurrent GPs)
- Real-time sync: Ably (existing infrastructure)
- Session lifetime: 10-minute inactivity timeout (no heartbeat)
- Image compression: Frontend (mobile/desktop before upload)
- Image format: HEIC → JPEG conversion on frontend
- Mobile metadata: Optional basic fields (laterality + body site)

**New Documents Created**:
- `PROJECT_RULES.md` - Project-specific constraints and workflow
- `features/clinical-images/FEATURE_OVERVIEW.md` - Main feature documentation

**Time Estimate Updated**:
- Phase 1: 6-8 hours (was 4-6) due to Redis + S3 implementation
- Total: 13-19 hours (was 12-18)

**Scale Assumptions Documented**:
- Target: 100 concurrent GPs
- Average: 5 images per session, 1MB each
- Session duration: 10 minutes

---

## [2025-11-12] — Documentation Consolidation & Streamlining

**Changes**:
- Reduced core project management docs to 2 files (PROJECT_SUMMARY.md and DEVELOPMENT_ROADMAP.md)
- Consolidated READY_TO_START.md into DEVELOPMENT_ROADMAP.md as "Quick Start" section
- Cleaned STATUS_DETAILED.md (removed historical decisions/changes)
- Removed inter-document references from all docs except PROJECT_SUMMARY.md
- Streamlined for better AI navigation

---

## [2025-11-12] — Development Roadmap Created

**Changes**:
- Created comprehensive 3-phase development plan (12-18 hours total)
- Phase 1: Mobile Upload & Dataflow Review (4-6 hours)
- Phase 2: Complete Integration (4-6 hours)
- Phase 3: Widget Launch Mechanism (3-5 hours)
- Target completion: Nov 17, 2025

---

## [2025-11-11] — POST Media Validated (MAJOR MILESTONE)

**Achievement**: Widget can upload images to Medtech! ✅

**Validation Results**:
- POST Media endpoint working (201 Created)
- Successfully uploaded test image to ALEX API
- OAuth permissions verified (`patient.media.write`)
- All critical endpoints tested (7 endpoints: 4 working, 3 expected limitations)
- Media ID received: `73ab84f149f0683443434e2d51f93278`

**Impact**: Core functionality validated; ready for frontend integration

---

## [2025-11-11] — Lightsail BFF Verified, 503 Error Resolved

**Changes**:
- BFF configuration verified and operational
- 503 error resolved (changed facility ID to `F2N060-E`)
- OAuth token acquisition: Working (249ms)
- FHIR Patient query: 200 OK

---

## [2025-11-10] — Integration Complete, Bug Fixes, Successful Test

**Changes**:
- OAuth bug fixed, BFF headers fixed
- Successful end-to-end test: Retrieved patient data from ALEX API
- 16 unit tests created (all passing)

---

## [2025-10-31] — OAuth Service Completed

**Achievement**: OAuth token service fully operational

**Features**:
- 55-minute token cache with auto-refresh
- Thread-safe for concurrent requests
- Automatic retry on 401 errors
- Token info endpoint for monitoring

---

## [2025-10-31] — BFF Deployed

**Achievement**: Lightsail BFF deployed with static IP

**Details**:
- Location: https://api.clinicpro.co.nz
- Static IP: 13.236.58.12 (whitelisted by Medtech)
- Service: clinicpro-bff.service (systemd)
- Code location: /home/deployer/app

---

## [2025-01-15] — IP Allow-listing Resolved

**Change**: Medtech whitelisted BFF static IP (13.236.58.12)

**Impact**: ALEX API calls now working from BFF

---

## [2025-01-15] — Clinical Metadata Limitation Identified

**Finding**: Optional Media FHIR elements (body site, laterality, view type, image classification) cannot be mapped to Medtech Inbox fields

**Decision**: Continue capturing metadata in frontend for UX, but do not expect it to appear in Medtech UI

---

## [2025-01-15] — Encounter Linkage Clarified

**Finding**: Each Media document written to Inbox automatically creates a Daily Record entry against the patient's record

**Decision**: No need to separately POST DocumentReference or link to encounter

---

## [2025-01-15] — Project Initialised

**Initial Setup**:
- Project created in `/project-management/medtech-integration/`
- Initial architecture decisions documented
- OAuth integration planned
- BFF deployment strategy defined
