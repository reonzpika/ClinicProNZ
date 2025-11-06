---
project_name: Medtech ALEX Integration
project_stage: Build
owner: Development Team
last_updated: "2025-01-15"
version: "0.3.0"
tags:
  - integration
  - medtech
  - healthcare
  - fhir
  - api
summary: "Clinical images widget integration with Medtech Evolution/Medtech32 via ALEX API. Enables GPs to capture/upload photos from within Medtech, saved back to patient encounters via FHIR API."
---

# Medtech ALEX Integration

## Project Overview

**Goal**: Build a clinical images widget that GPs launch from within Medtech Evolution/Medtech32 to capture/upload photos, which are then saved back to the patient's encounter in Medtech via ALEX API.

**Current Stage**: Build — Partially blocked on external dependency

**Status**: Active — OAuth infrastructure complete, awaiting Medtech firewall update

---

## Goals

- **Primary**: Enable GPs to capture clinical images from within Medtech and save directly to patient encounters
- **Secondary**: Provide mobile QR handoff for phone camera capture
- **Technical**: Implement FHIR R4 integration with Medtech ALEX API via Integration Gateway

---

## Current Status [2025-01-15]

### ✅ Completed
- Non-commercial agreement signed with Medtech
- IP allow-listing configured by Medtech (production Vercel environment)
- OAuth credentials configured (Oct 26)
- OAuth token acquisition tested and validated (Oct 31)
- Integration Gateway OAuth Service complete (Oct 31)
  - OAuth token service with 55-min cache
  - ALEX API client with header injection
  - Correlation ID generation
  - Test endpoints for connectivity validation
- BFF deployed to Lightsail (Oct 31)
  - Location: `api.clinicpro.co.nz` (Static IP: 13.236.58.12)
  - Systemd service running (`clinicpro-bff.service`)
  - OAuth working ✅ (token acquisition successful)

### ⚠️ Blockers
- **ALEX API Firewall** (Critical — blocking BFF connectivity)
  - BFF IP (13.236.58.12) not allow-listed for ALEX API UAT
  - Port 443 times out after 10 seconds
  - Email sent to Medtech (Oct 31) requesting firewall update
  - Status: Awaiting Medtech response (expected 3-5 business days)

### 📋 Awaiting Medtech Response
1. **IP allow-listing for ALEX API** (Critical — blocking BFF)
2. **UAT testing environment access** (optional — helpful for end-to-end testing)
3. **Widget launch mechanism** documentation
4. **Clinical metadata schema** (body site, laterality, view, type)
5. **Full POST Media example** with clinical metadata

### 🔄 In Progress
- Frontend widget development (can proceed with mock backend — not blocked)

---

## Architecture

### Components
1. **Medtech Evolution** (GP's Desktop — On-Premises)
   - Launches widget (iFrame or new tab)
   - Passes encounter context to widget

2. **ClinicPro Images Widget** (Cloud — Vercel)
   - Frontend: React/Next.js
   - Desktop: Capture, edit, review, commit
   - Mobile: QR handoff for phone camera

3. **Integration Gateway** (Cloud — Lightsail BFF)
   - OAuth token management (55-min cache)
   - FHIR ↔ REST translation
   - Header injection (`mt-facilityid`, `mt-*`)
   - Clinical metadata mapping

4. **Medtech ALEX API** (Medtech Cloud)
   - OAuth 2.0 authentication (Azure AD)
   - FHIR R4 API (200+ endpoints)
   - Hybrid connector via Azure Relay

### Integration Flow
```
Medtech Evolution → ClinicPro Widget → Integration Gateway → ALEX API → Medtech Database
```

---

## Key Features

- **Desktop**: Capture, edit, annotate, commit images to encounter
- **Mobile**: QR handoff for phone camera capture
- **Clinical Metadata**: Body site, laterality, view type, image classification
- **Integration**: Images instantly available for HealthLink/ALEX referrals

---

## Milestones

### Phase 1: Foundation ✅ (Week 1-2)
- [x] OAuth credentials configured (Oct 26)
- [x] OAuth token acquisition validated (Oct 31)
- [x] Integration Gateway OAuth service implemented (Oct 31)
- [x] ALEX API client with header injection (Oct 31)
- [x] BFF infrastructure deployed (Oct 31)
- [x] Correlation ID generation (Oct 31)

### Phase 2: Gateway Development ⏳ (Week 2-3)
- [x] OAuth service deployed to BFF (Oct 31)
- [ ] GET Patient test successful (blocked by firewall)
- [ ] Clinical metadata schema confirmed (awaiting Medtech response)
- [ ] POST Media endpoint implementation (blocked until metadata schema)

### Phase 3: Frontend Widget 🔄 (Week 3-4)
- [ ] Frontend UI mockups (can proceed)
- [ ] Desktop capture/edit/commit flow (not blocked)
- [ ] Mobile QR handoff (not blocked)
- [ ] Integration with Gateway API (after Gateway complete)

### Phase 4: Testing & Launch (Week 4-6)
- [ ] UAT testing with ALEX API (blocked until firewall update)
- [ ] Demo Medtech instance testing (if available)
- [ ] Production pilot deployment
- [ ] GP practice rollout

---

## Technical Details

### OAuth Configuration
- **Client ID**: `7685ade3-f1ae-4e86-a398-fe7809c0fed1`
- **Tenant ID**: `8a024e99-aba3-4b25-b875-28b0c0ca6096`
- **API Scope**: `api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default`
- **Facility ID (UAT)**: `F2N060-E`
- **Token Expiry**: 3599 seconds (~60 minutes)
- **Cache TTL**: 55 minutes (auto-refresh before expiry)

### API Endpoints
- **UAT**: `https://alexapiuat.medtechglobal.com/FHIR`
- **Production**: `https://alexapi.medtechglobal.com/FHIR`
- **BFF**: `https://api.clinicpro.co.nz` (Static IP: 13.236.58.12)

### Key Services
- **OAuth Token Service**: `/src/lib/services/medtech/oauth-token-service.ts`
- **ALEX API Client**: `/src/lib/services/medtech/alex-api-client.ts`
- **Correlation ID**: `/src/lib/services/medtech/correlation-id.ts`
- **FHIR Types**: `/src/lib/services/medtech/types.ts`

### Test Endpoints
- `GET /api/medtech/test?nhi=ZZZ0016` — Test FHIR connectivity
- `GET /api/medtech/token-info` — OAuth token cache status

---

## Dependencies

### Outgoing Dependencies
- **Medtech ALEX API** — FHIR R4 API for media storage
- **Medtech Evolution/Medtech32** — Widget launch mechanism (TBD)
- **Azure AD** — OAuth 2.0 authentication

### Incoming Dependencies
- **ClinicPro SaaS** — Infrastructure (BFF deployment, OAuth service)
- **ClinicPro Backend** — Image storage (S3), user authentication (Clerk)

---

## Risks & Blockers

### Critical Risks
1. **ALEX API Firewall Blocking** [BLOCKING]
   - **Impact**: Cannot test BFF → ALEX API connectivity
   - **Mitigation**: Email sent to Medtech (Oct 31), awaiting response
   - **Timeline**: Expected resolution 3-5 business days

2. **Clinical Metadata Schema Unknown** [BLOCKING]
   - **Impact**: Cannot implement POST Media with metadata
   - **Mitigation**: Email sent to Medtech (Oct 31), awaiting response
   - **Timeline**: Expected response 3-5 business days

### Medium Risks
3. **Widget Launch Mechanism Undocumented**
   - **Impact**: Unclear how to launch widget from Medtech
   - **Mitigation**: Email sent to Medtech, may need iterative discovery

4. **UAT Environment Limitations**
   - **Impact**: May not be able to verify images in Medtech UI during testing
   - **Mitigation**: Asking Medtech for demo instance access

---

## Decisions [2025-01-15]

### Architecture Decision: Integration Gateway
**Date**: 2025-10-31

**Chosen**: Integration Gateway abstraction layer

**Rationale**:
- Decouples frontend from FHIR complexity
- Handles ALEX-specific quirks (headers, token management)
- Enables provider flexibility (future non-Medtech EMRs)
- Simplifies error handling (FHIR → user-friendly messages)

**Reference**: `/docs/medtech/GATEWAY_IMPLEMENTATION.md`

### BFF Deployment Strategy
**Date**: 2025-10-31

**Chosen**: Lightsail BFF with static IP (13.236.58.12)

**Rationale**:
- Vercel serverless uses dynamic IPs (not allow-listed)
- BFF provides static IP for Medtech firewall allow-listing
- Centralises OAuth token management
- Domain: `api.clinicpro.co.nz`

---

## Next Steps

### Immediate (This Week)
1. ⏳ **Wait for Medtech response** — IP allow-listing and metadata schema
2. ✅ **Build frontend mockups** — Not blocked (can proceed with mock backend)
3. ✅ **Monitor BFF logs** — Check for connectivity when firewall updated

### Short-term (Next 2 Weeks)
1. **Complete Gateway Implementation** (after Medtech response)
   - POST Media endpoint with clinical metadata
   - Inbox routing (if needed)
   - Task creation (if needed)

2. **Frontend Integration**
   - Connect frontend to Gateway API
   - Replace mock backend with real Gateway calls

### Medium-term (Next 4-6 Weeks)
1. **UAT Testing**
   - End-to-end testing with ALEX API
   - Image commit verification
   - Clinical metadata validation

2. **Production Pilot**
   - Production credentials
   - Deploy to production hosting
   - 1-2 GP practices test

---

## Technical Documentation References

**Project Management**: This file (`PROJECT_SUMMARY.md`)

**Technical Documentation**: `/docs/medtech/`
- `README.md` — Overview and quick links
- `NEXT_STEPS.md` — Current action plan
- `GATEWAY_IMPLEMENTATION.md` — Gateway implementation guide
- `alex-api-review-2025-10-30.md` — Complete ALEX API reference
- `medtech-alex-uat-quickstart.md` — OAuth setup guide
- `images-widget-prd.md` — Product requirements

**Code References**:
- OAuth Service: `/src/lib/services/medtech/oauth-token-service.ts`
- API Client: `/src/lib/services/medtech/alex-api-client.ts`
- Test Endpoints: `/app/api/(integration)/medtech/`

---

## Updates History

### [2025-01-15] — Project Management System Installation
- Created PROJECT_SUMMARY.md
- Consolidated medtech documentation references
- Added current status, blockers, and milestones
- Documented architecture and technical details

### [2025-10-31] — OAuth & Gateway Implementation
- OAuth token service implemented
- ALEX API client with header injection
- BFF deployed to Lightsail
- Firewall issue identified (awaiting Medtech response)

### [2025-10-26] — OAuth Configuration
- Credentials configured in Vercel environment variables
- IP allow-listing configured for production Vercel

---

*Project Created: [2025-01-15]*  
*Last Updated: [2025-01-15]*
*Version: 0.3.0*
