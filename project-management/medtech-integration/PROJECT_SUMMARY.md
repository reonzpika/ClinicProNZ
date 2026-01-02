---
project_name: Medtech ALEX Integration
project_stage: Build
owner: Development Team
last_updated: "2026-01-02"
version: "1.5.0"
tags:
  - integration
  - medtech
  - healthcare
  - fhir
  - api
summary: "Clinical images widget integration with Medtech Evolution/Medtech32 via ALEX API. Enables GPs to capture/upload photos from within Medtech, saved back to patient encounters via FHIR API."
quick_reference:
  current_phase: "Phase 1 - Mobile Upload & Dataflow Review"
  status: "Architecture Complete | Implementation In Progress"
  next_action: "Implement Redis + S3 session storage and mobile upload UI"
  key_blockers: []
  facility_id: "F2N060-E (API testing)"
key_docs:
  project_rules: "PROJECT_RULES.md"
  feature_overview: "features/clinical-images/FEATURE_OVERVIEW.md"
  roadmap: "DEVELOPMENT_ROADMAP.md"
  architecture: "infrastructure/architecture.md"
  oauth_config: "infrastructure/oauth-and-config.md"
  bff_setup: "infrastructure/bff-setup.md"
  testing: "testing/testing-guide.md"
  gateway_implementation: "reference/gateway-implementation.md"
  alex_api: "reference/alex-api.md"
---

# 🚨 IMPORTANT: Read Project Rules First
**Before working on this project, read**: [PROJECT_RULES.md](./PROJECT_RULES.md)

---

# Medtech ALEX Integration

## 📋 AI Documentation Update Instructions

**After completing any task, update documentation as follows:**

### 1. Update PROJECT_SUMMARY.md (Always Required)
- **YAML frontmatter**: Update `last_updated` date, `quick_reference` fields (current_phase, status, next_action, key_blockers, facility_id)
- **Recent Updates Summary**: Add entry at top of "Recent Updates Summary" section (last 3-5 major updates only)
- **Current Status**: Update "Current Status" section if status changed
- **Active Development**: Update "Active Development" section if phase/tasks changed
- **Risks & Blockers**: Update if blockers resolved or new ones identified

### 2. Update DEVELOPMENT_ROADMAP.md (When Tasks/Phases Change)
- Mark completed tasks with ✅
- Update phase status if phase completed
- Update "Quick Start" section if environment/config changed
- Update time estimates if actual time differs significantly

### 3. Update STATUS_DETAILED.md (When Component Status Changes)
- Update component status tables (Infrastructure, API Endpoints, Frontend Components)
- Update Testing Status section if new tests completed
- Update Deployment Status if deployment changed
- **Do NOT add historical decisions/changes** — those go in CHANGELOG.md

### 4. Update CHANGELOG.md (For All Significant Changes)
- Add new entry at top with date
- Include: what changed, why, impact, related docs updated
- Move historical content from STATUS_DETAILED.md here if needed

### 5. Update Other Docs (Only When Content Changes)
- **TECHNICAL_CONFIG.md**: When config values, endpoints, or code structure changes
- **UPDATE_ENV_VARIABLES.md**: When environment variables change
- **TESTING_GUIDE_POSTMAN_AND_BFF.md**: When testing procedures change
- **GATEWAY_IMPLEMENTATION.md**: When implementation details change

### Rules
- ✅ **Always update PROJECT_SUMMARY.md** after any task
- ✅ **Update DEVELOPMENT_ROADMAP.md** when tasks/phases change
- ✅ **Update STATUS_DETAILED.md** when component status changes
- ✅ **Add to CHANGELOG.md** for all significant changes
- ❌ **Do NOT add inter-document references** (only PROJECT_SUMMARY.md references other docs)
- ❌ **Do NOT add historical decisions to STATUS_DETAILED.md** (use CHANGELOG.md)

---

## AI Quick Reference

**Current Phase**: Phase 1B - Mobile Upload & Real-Time Sync  
**Status**: ✅ Implementation Complete | Ready for Testing  
**Next Action**: Setup environment (S3 bucket + env vars) and run tests  
**Key Blockers**: None  
**Facility ID**: `F2N060-E` (API testing)  

**Where to Find**:
- **Project Rules**: [`PROJECT_RULES.md`](./PROJECT_RULES.md) - Read this first!
- **Feature Overview**: [`features/clinical-images/FEATURE_OVERVIEW.md`](./features/clinical-images/FEATURE_OVERVIEW.md) - Architectural decisions
- **Development Roadmap**: [`DEVELOPMENT_ROADMAP.md`](./DEVELOPMENT_ROADMAP.md) - Implementation tasks
- **OAuth & Config**: [`infrastructure/oauth-and-config.md`](./infrastructure/oauth-and-config.md) - Environment setup

---

## Infrastructure & Deployment Context

**Last Updated**: 2025-12-15  
**Purpose**: Document deployment architecture to avoid confusion in future sessions

### Deployment Architecture

**Split Between Vercel and Lightsail BFF**

The application is split across two hosting platforms due to Medtech's IP whitelisting requirement:

**Vercel (Dynamic IP)**:
- **Frontend**: Desktop widget + Mobile page
- **API Routes**: Session management, S3 presigned URLs, Redis operations
- **Location**: `/app/api/(integration)/medtech/session/*` (new endpoints for Phase 1)
- **Deployment**: Auto-deploy on push to main branch (GitHub → Vercel)
- **Why**: These endpoints don't call Medtech ALEX API, so dynamic IP is fine

**Lightsail BFF (Static IP: 13.236.58.12)**:
- **Commit Endpoint**: Upload images to Medtech ALEX API
- **Location**: `/home/deployer/app/` on Lightsail server
- **Source Code**: `/lightsail-bff/` in main repo (merged from separate repo 2026-01-02)
- **Deployment**: Auto-deploy via GitHub Actions on push to `lightsail-bff/**`
- **Why**: Medtech firewall requires whitelisted static IP for ALEX API access
- **Restart**: `sudo systemctl restart clinicpro-bff`

**Communication Flow**:
```
Frontend (Vercel) → Session API (Vercel) → Redis/S3
Frontend (Vercel) → Commit API (Lightsail) → ALEX API (Medtech)
```

**Key Files**:
- **Desktop Widget**: `/app/(medtech)/medtech-images/page.tsx` (already implemented)
- **Mobile Page**: `/app/(medtech)/medtech-images/mobile/page.tsx` (to be implemented)
- **Store**: `/src/medtech/images-widget/stores/imageWidgetStore.ts` (existing, no rename needed)

### Infrastructure Services (Already Configured)

| Service | Status | Configuration |
|---------|--------|---------------|
| **Redis (Upstash)** | ✅ Active | `https://unique-stallion-12716.upstash.io` + REST token |
| **Ably** | ✅ Active | Already integrated for real-time sync |
| **AWS Account** | ✅ Active | Available for S3 bucket creation |
| **Environment Variables** | ✅ Configured | All stored in Vercel dashboard |
| **S3 Bucket** | ⏳ To Setup | See `features/clinical-images/SETUP_INSTRUCTIONS.md` |

### Environment Configuration
- **All environment variables**: Stored in Vercel dashboard (not .env files)
- **API routes**: Access env vars via `process.env.*`
- **Client components**: Use `NEXT_PUBLIC_*` prefix for browser access
- **Deployment**: Auto-redeploy when env vars change (required)

### Testing Configuration
- **ALEX API Environment**: UAT (`https://alexapiuat.medtechglobal.com/FHIR`)
- **Test Facility**: `F2N060-E` (Healthier Care)
- **Test Patient**: NHI `ZZZ0016`, Patient ID `14e52e16edb7a435bfa05e307afd008b`
- **OAuth**: Client credentials flow (tokens cached for 55 minutes)

### Cost Estimate (Monthly)
- **S3**: ~$0.31/month (Sydney region, 1-day lifecycle, ~100 GPs)
- **Redis (Upstash)**: $0/month (free tier sufficient for ~10k commands/day)
- **Ably**: $0/month (free tier: 200 connections, 100k messages/day)
- **Vercel**: Existing plan (no additional cost)
- **Total New Infrastructure**: ~$0.31/month

---

## Project Overview

**Goal**: Build a clinical images widget that GPs launch from within Medtech Evolution/Medtech32 to capture/upload photos, which are then saved back to the patient's encounter in Medtech via ALEX API.

**Status**: ✅ Code Complete | Integration In Progress

**Key Value Proposition**: Enable GPs to capture clinical images directly from within Medtech, with images instantly available for HealthLink/ALEX referrals.

---

## Goals

- **Primary**: Enable GPs to capture clinical images from within Medtech and save directly to patient encounters
- **Secondary**: Provide mobile QR handoff for phone camera capture
- **Technical**: Implement FHIR R4 integration with Medtech ALEX API via Integration Gateway

---

## Current Status

### Major Milestone: POST Media Validated! ✅ [2025-11-11]

**Widget can upload images to Medtech!** POST Media endpoint working (201 Created). OAuth permissions verified, all critical endpoints tested.

**For detailed status**: See STATUS_DETAILED.md

### High-Level Achievements

- ✅ Infrastructure complete (OAuth, BFF, ALEX API connectivity)
- ✅ POST Media validated (widget can upload images)
- ✅ Desktop widget complete (capture, edit, metadata, commit flow)
- ⏳ Mobile upload needs real implementation (currently alert())
- ⏳ Backend integration needed (connect real ALEX API)
- ⏳ Widget launch mechanism needed

### Remaining Questions

1. **Widget launch mechanism** — How to launch widget from Medtech Evolution (iFrame, new tab, etc.)
2. **Encounter context passing** — How to receive patient/encounter ID from Medtech

---

## Active Development

**Current Phase**: Phase 1 - Mobile Upload & Dataflow Review (4-6 hours)

**See**: DEVELOPMENT_ROADMAP.md for complete 3-phase plan (12-18 hours total)

**Next Steps**:
1. Mobile upload UI with real backend (replace alert())
2. Mobile → Desktop dataflow (images sync automatically)
3. Desktop/Mobile → Medtech dataflow documentation and review

**Target Completion**: End of Week (Nov 17, 2025)

---

## Architecture Overview

### Integration Flow

```
Medtech Evolution → ClinicPro Widget → Integration Gateway → ALEX API → Medtech Database
```

### Components

1. **Medtech Evolution** (GP's Desktop — On-Premises) — Launches widget, passes encounter context
2. **ClinicPro Images Widget** (Cloud — Vercel) — Frontend: React/Next.js, Desktop & Mobile capture
3. **Integration Gateway** (Cloud — Lightsail BFF) — OAuth token management, FHIR ↔ REST translation
4. **Medtech ALEX API** (Medtech Cloud) — OAuth 2.0 authentication, FHIR R4 API

**For detailed architecture**: See ARCHITECTURE_AND_TESTING_GUIDE.md

---

## Key Features

- **Desktop**: Capture, edit, annotate, commit images to encounter
- **Mobile**: QR handoff for phone camera capture
- **Clinical Metadata**: Body site, laterality, view type, image classification
- **Integration**: Images instantly available for HealthLink/ALEX referrals

---

## Key Decisions & Findings

### Architecture Decision: Integration Gateway [2025-10-31]

**Chosen**: Integration Gateway abstraction layer

**Rationale**: Decouples frontend from FHIR complexity, handles ALEX-specific quirks, enables provider flexibility, simplifies error handling.

**Reference**: See GATEWAY_IMPLEMENTATION.md

### BFF Deployment Strategy [2025-10-31]

**Chosen**: Lightsail BFF with static IP (13.236.58.12)

**Rationale**: Vercel serverless uses dynamic IPs (not allow-listed), BFF provides static IP for Medtech firewall allow-listing.

### Clinical Metadata Limitation [2025-01-15]

**Finding**: Optional Media FHIR elements (body site, laterality, view type, image classification) **cannot be mapped** to Medtech Inbox fields.

**Recommendation**: Continue capturing metadata in frontend for UX, but don't expect it to appear in Medtech. Consider embedding in image if GPs need to see it in Medtech.

### Encounter Linkage [2025-01-15]

**Finding**: Each Media document written to Inbox automatically creates a Daily Record entry against the patient's record.

**Implication**: No need to separately POST DocumentReference or link to encounter — Media resource handles this automatically.

---

## Risks & Blockers

### Current Blockers

- None identified

### Medium Risks

- **Widget Launch Mechanism Undocumented** — Unclear how to launch widget from Medtech Evolution. Status: Medtech Evolution installed locally, can test launch mechanisms.

### Resolved Blockers ✅

- ~~ALEX API Firewall Blocking~~ — Resolved (Jan 15, 2025)
- ~~Clinical Metadata Schema Unknown~~ — Clarified (Jan 15, 2025)
- ~~UAT Environment Limitations~~ — Resolved (Jan 15, 2025)
- ~~503 Service Unavailable~~ — Resolved (Nov 11, 2025) — Changed facility ID to `F2N060-E`
- ~~Facility ID Configuration~~ — Resolved (Nov 11, 2025) — Using `F2N060-E` for testing

---

## Resources & Navigation

### Essential Docs (Start Here)

- **🚨 PROJECT RULES**: [`PROJECT_RULES.md`](./PROJECT_RULES.md) - Read first! Constraints, workflow, hard rules
- **📋 FEATURE OVERVIEW**: [`features/clinical-images/FEATURE_OVERVIEW.md`](./features/clinical-images/FEATURE_OVERVIEW.md) - Architectural decisions, technology stack
- **📋 DEVELOPMENT ROADMAP**: [`DEVELOPMENT_ROADMAP.md`](./DEVELOPMENT_ROADMAP.md) - 3-phase plan (13-19 hours total) with Quick Start section
- **⚙️ OAUTH & CONFIG**: [`infrastructure/oauth-and-config.md`](./infrastructure/oauth-and-config.md) - Environment setup, OAuth credentials

### Technical Documentation

**Infrastructure Documentation**:
- **🏗️ Architecture Guide**: [`infrastructure/architecture.md`](./infrastructure/architecture.md) - **⭐ AUTHORITATIVE SOURCE for Facility ID decisions** - Complete architecture, facility IDs (F2N060-E vs F99669-C), testing approaches
- **⚙️ OAuth & Config**: [`infrastructure/oauth-and-config.md`](./infrastructure/oauth-and-config.md) - OAuth credentials, environment variables setup, API endpoints
- **🖥️ BFF Setup**: [`infrastructure/bff-setup.md`](./infrastructure/bff-setup.md) - Lightsail server configuration, operations, troubleshooting

**Feature Documentation** (Clinical Images):
- **📋 Implementation Requirements**: [`features/clinical-images/implementation-requirements.md`](./features/clinical-images/implementation-requirements.md) - Technical requirements for widget implementation
- **🧪 Test Results**: [`features/clinical-images/test-results.md`](./features/clinical-images/test-results.md) - FHIR API test results (POST Media validated!)

**Testing Documentation**:
- **🧪 Testing Guide**: [`testing/testing-guide.md`](./testing/testing-guide.md) - Step-by-step testing instructions (Postman, BFF, OAuth)
- **✅ OAuth Test Results**: [`testing/OAUTH_TEST_RESULTS.md`](./testing/OAUTH_TEST_RESULTS.md) - OAuth validation results

**Reference Documentation** (Rarely Changing):
- **📚 ALEX API Reference**: [`reference/alex-api.md`](./reference/alex-api.md) - Complete ALEX API documentation
- **🏗️ Gateway Implementation**: [`reference/gateway-implementation.md`](./reference/gateway-implementation.md) - Gateway architecture and implementation details
- **📋 Product Requirements**: [`reference/product-requirements.md`](./reference/product-requirements.md) - Product requirements document
- **🛠️ FHIR MCP Setup**: [`reference/fhir-mcp-setup.md`](./reference/fhir-mcp-setup.md) - Development tool setup

**Project History**:
- **📜 Changelog**: [`CHANGELOG.md`](./CHANGELOG.md) - Full project history and major decisions

### External Documentation

- **ALEX API Documentation**: https://alexapidoc.medtechglobal.com/ (Source of Truth)
- **Medtech Evolution User Guide**: https://insight.medtechglobal.com/download/user-guide-medtech-evolution-layout/ (Widget placement reference)

---

## Recent Updates Summary

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
1. Setup S3 bucket + lifecycle policy (~10 min)
2. Verify environment variables in Vercel dashboard
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
