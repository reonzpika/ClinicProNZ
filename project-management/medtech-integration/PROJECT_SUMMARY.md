---
project_name: Medtech ALEX Integration
project_stage: Build
owner: Development Team
last_updated: "2025-11-13"
version: "1.2.0"
tags:
  - integration
  - medtech
  - healthcare
  - fhir
  - api
summary: "Clinical images widget integration with Medtech Evolution/Medtech32 via ALEX API. Enables GPs to capture/upload photos from within Medtech, saved back to patient encounters via FHIR API."
quick_reference:
  current_phase: "Phase 1 - Mobile Upload & Dataflow Review (Phase 1.1 & 1.2 Complete)"
  status: "Code Complete | Testing Ready"
  next_action: "Test Phase 1 implementation (QR generation, mobile upload, real-time sync)"
  key_blockers: []
  facility_id: "F2N060-E (API testing)"
key_docs:
  roadmap: "DEVELOPMENT_ROADMAP.md"
  architecture: "docs/ARCHITECTURE_AND_TESTING_GUIDE.md"
  status_detailed: "docs/STATUS_DETAILED.md"
  technical_config: "docs/TECHNICAL_CONFIG.md"
  testing: "docs/TESTING_GUIDE_POSTMAN_AND_BFF.md"
  implementation: "implementation/GATEWAY_IMPLEMENTATION.md"
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

**Current Phase**: Phase 1 - Mobile Upload & Dataflow Review (Phase 1.1 & 1.2 Complete)  
**Status**: ✅ Code Complete | Testing Ready  
**Next Action**: Test Phase 1 implementation (QR generation, mobile upload, real-time sync)  
**Key Blockers**: None  
**Facility ID**: `F2N060-E` (API testing)  

**Where to Find**:
- **Current Status Details**: [`docs/STATUS_DETAILED.md`](./docs/STATUS_DETAILED.md)
- **Technical Configuration**: [`docs/TECHNICAL_CONFIG.md`](./docs/TECHNICAL_CONFIG.md)
- **Development Roadmap**: [`DEVELOPMENT_ROADMAP.md`](./DEVELOPMENT_ROADMAP.md) - Includes Quick Start section

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

**Current Phase**: Phase 1 - Mobile Upload & Dataflow Review (Phase 1.1 & 1.2 Complete)

**See**: DEVELOPMENT_ROADMAP.md for complete 3-phase plan (12-18 hours total)

**Completed** (2025-11-13):
- ✅ Mobile upload UI with real backend (complete flow: capture → review → metadata → upload)
- ✅ QR code generation (real QR codes with session tokens, Redis storage)
- ✅ Mobile → Desktop dataflow (SSE real-time sync, auto-reconnect, heartbeat)

**Next Steps**:
1. Testing Phase 1 implementation (QR generation, mobile upload, real-time sync)
2. Desktop/Mobile → Medtech dataflow documentation and review (Phase 1.3)
3. Backend integration (connect real ALEX API in Phase 2)

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

### Quick Start Guides

- **📋 DEVELOPMENT ROADMAP**: [`DEVELOPMENT_ROADMAP.md`](./DEVELOPMENT_ROADMAP.md) - **START HERE** Complete 3-phase plan (12-18 hours total) - Includes Quick Start section for next session
- **Environment Variables Guide**: [`UPDATE_ENV_VARIABLES.md`](./UPDATE_ENV_VARIABLES.md) - Step-by-step guide for updating environment variables

### Technical Documentation

**Architecture & Testing**:
- **🏗️ Architecture & Testing Guide**: [`docs/ARCHITECTURE_AND_TESTING_GUIDE.md`](./docs/ARCHITECTURE_AND_TESTING_GUIDE.md) - **⭐ AUTHORITATIVE SOURCE for Facility ID decisions** - Complete guide to architecture, facility IDs (F2N060-E vs F99669-C), and testing approaches
- **Lightsail BFF Setup**: [`docs/LIGHTSAIL_BFF_SETUP.md`](./docs/LIGHTSAIL_BFF_SETUP.md) - Complete Lightsail server configuration, operations, and troubleshooting guide

**Implementation**:
- **Gateway Implementation**: [`implementation/GATEWAY_IMPLEMENTATION.md`](./implementation/GATEWAY_IMPLEMENTATION.md) - Complete gateway implementation guide (includes OAuth setup)
- **Widget Implementation Requirements**: [`docs/WIDGET_IMPLEMENTATION_REQUIREMENTS.md`](./docs/WIDGET_IMPLEMENTATION_REQUIREMENTS.md) - Technical requirements for implementing widget based on test findings

**Testing**:
- **Testing Guide**: [`docs/TESTING_GUIDE_POSTMAN_AND_BFF.md`](./docs/TESTING_GUIDE_POSTMAN_AND_BFF.md) - Step-by-step testing instructions for Postman and Lightsail BFF (includes OAuth testing)
- **FHIR API Test Results**: [`docs/FHIR_API_TEST_RESULTS.md`](./docs/FHIR_API_TEST_RESULTS.md) - Complete test results from 2025-11-11 testing session (POST Media validated!)
- **OAuth Test Results**: [`testing/OAUTH_TEST_RESULTS.md`](./testing/OAUTH_TEST_RESULTS.md) - OAuth test results

**Reference Documents**:
- **Status Details**: [`docs/STATUS_DETAILED.md`](./docs/STATUS_DETAILED.md) - Detailed component-by-component status breakdown
- **Technical Configuration**: [`docs/TECHNICAL_CONFIG.md`](./docs/TECHNICAL_CONFIG.md) - OAuth config, API endpoints, services, components reference
- **Changelog**: [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) - Full project updates history
- **API Reference**: [`api/alex-api-review-2025-10-30.md`](./api/alex-api-review-2025-10-30.md) - Complete ALEX API reference
- **Product Requirements**: [`product/images-widget-prd.md`](./product/images-widget-prd.md) - Product requirements document

### External Documentation

- **ALEX API Documentation**: https://alexapidoc.medtechglobal.com/ (Source of Truth)
- **Medtech Evolution User Guide**: https://insight.medtechglobal.com/download/user-guide-medtech-evolution-layout/ (Widget placement reference)

---

## Recent Updates Summary

### [2025-11-13] — ✅ Phase 1.1 & 1.2 Complete: Mobile Upload & Real-Time Sync

- Mobile upload flow complete: Capture → Review → Metadata → Upload
- QR code generation: Real QR codes with session tokens (Redis storage)
- Mobile → Desktop sync: SSE real-time updates with auto-reconnect
- Session management: Redis-based storage with TTL, cleanup on widget close
- Offline queue: Failed uploads saved to localStorage, retry on reconnect
- Metadata form: Collapsible form with Side, Body Site, View, Type chips
- "Take More" flow: Uploads current image in background, returns to capture
- "Finish" flow: Uploads all pending images, resets to start state
- Ready for testing before proceeding to Phase 1.3

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
*Last Updated: [2025-11-12] - Documentation streamlined for AI navigation*  
*Version: 1.2.0*
