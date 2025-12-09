# Medtech Integration - Changelog

**Purpose**: Track significant changes, decisions, and milestones over time.

---

## [2025-12-09] — Documentation Reorganization (Option A: Feature-Centric)

**Changes**:
- Restructured documentation into feature-centric organization
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
- `alex-api-review-2025-10-30.md` → `reference/alex-api.md`
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

## [2025-12-09] — Phase 1 Architecture Finalized

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

**Decision**: Continue capturing metadata in frontend for UX, but don't expect it to appear in Medtech UI

---

## [2025-01-15] — Encounter Linkage Clarified

**Finding**: Each Media document written to Inbox automatically creates a Daily Record entry against the patient's record

**Decision**: No need to separately POST DocumentReference or link to encounter

---

## [2025-01-15] — Project Initialized

**Initial Setup**:
- Project created in `/project-management/medtech-integration/`
- Initial architecture decisions documented
- OAuth integration planned
- BFF deployment strategy defined

---

*This changelog tracks major milestones, architectural decisions, and significant changes.*
