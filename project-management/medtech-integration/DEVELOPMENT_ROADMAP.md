# Medtech Integration - Development Roadmap

**Created**: 2025-11-12  
**Last Updated**: 2026-01-07  
**Status**: Phase 1C Complete | Commit to ALEX working end-to-end  
**Estimated Total Time**: 13-19 hours  
**Current Phase**: Phase 1C ✅ Complete | Next: Phase 1D (Medtech UI validation + hardening + launch mechanism)

**Feature Overview**: See [Clinical Images Feature Overview](./features/clinical-images/FEATURE_OVERVIEW.md) for architectural decisions and context.

---

## Quick Start - Next Development Session

**Current Status**: ✅ Phase 1C Complete. Commit path creates FHIR `Media` in ALEX UAT via Lightsail BFF (static IP), working end-to-end (desktop + mobile).

**Phase 1 Architecture Finalized** (2025-12-09):
- Redis + S3 for session storage (supports 100+ concurrent GPs)
- Ably for real-time sync (existing infrastructure)
- Optional mobile metadata (laterality + body site)
- Frontend image compression and HEIC → JPEG conversion

**What's Ready**:
- ✅ Infrastructure complete (OAuth, BFF, ALEX API connectivity)
- ✅ POST Media validated (widget can upload images)
- ✅ Desktop widget complete (capture, edit, metadata, commit flow)
- ✅ Architecture decisions finalized for 100+ concurrent scale
- ✅ Redis + S3 session storage implemented (Upstash + AWS)
- ✅ Mobile upload implemented (real backend, not alert())
- ✅ Mobile → Desktop sync implemented (Ably)
- ✅ Commit implemented via Lightsail BFF (`POST /api/medtech/session/commit`) and Vercel proxy (`POST /api/medtech/attachments/commit`)
- ⏳ Confirm committed images appear in Medtech UI (Inbox/Daily Record) and validate workflow
- ⏳ Widget launch mechanism needed (from within Medtech Evolution)

**Test Environment**:
- BFF URL: https://api.clinicpro.co.nz
- BFF IP: 13.236.58.12 (whitelisted)
- ALEX API: https://alexapiuat.medtechglobal.com/FHIR
- Test Patient ID: `14e52e16edb7a435bfa05e307afd008b` (NHI: ZZZ0016)
- Facility ID: `F2N060-E`

**Quick Commands**:
```bash
# SSH into Lightsail BFF
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12

# Check BFF status
sudo systemctl status clinicpro-bff

# View logs
sudo journalctl -u clinicpro-bff -f

# Restart if needed
sudo systemctl restart clinicpro-bff
```

**Next Immediate Task**: Implement Redis + S3 session storage, then mobile upload UI

---

## Overview

This roadmap outlines the 3-phase development plan to complete the Medtech integration widget and prepare it for production deployment.

**Current Status**: 
- ✅ Infrastructure complete (OAuth, BFF, ALEX API connectivity)
- ✅ POST Media validated (widget can upload images)
- ✅ Desktop complete (capture, edit, metadata, commit flow, error handling)
- ✅ Phase 1 architecture finalized (Redis + S3, Ably, scale assumptions)
- ✅ Redis + S3 session storage implemented
- ✅ Mobile upload implemented
- ✅ Mobile → Desktop dataflow implemented
- ⏳ Dataflow review needed (Desktop/Mobile → Medtech)
- ✅ Phase 1C commit working end-to-end (creates FHIR `Media` in ALEX UAT via Lightsail BFF)
- ⏳ Widget launch mechanism needed

---

## Phase 1: Mobile Upload & Dataflow Review ✅ COMPLETE

**Goal**: Complete mobile upload flow with Redis + S3 session storage and review dataflow from desktop/mobile → Medtech  
**Time Estimate**: 6-8 hours (actual: ~4 hours with AI assistance)  
**Priority**: High (mobile handoff is core feature, dataflow must be correct)  
**Completed**: 2026-01-02

**Final State**:
- ✅ Desktop error handling complete
- ✅ Desktop image editor complete
- ✅ Desktop QR panel generates mobile URL
- ✅ Architecture decisions finalized (Redis + S3, Ably, compression strategy)
- ✅ Redis + S3 session storage implemented (Upstash + AWS)
- ✅ Mobile UI complete (7-screen flow with metadata capture)
- ✅ Mobile upload with real backend (presigned S3 URLs + auto-retry)
- ✅ Mobile → Desktop dataflow implemented (Ably real-time sync)
- ✅ Build successful (TypeScript passes, production-ready)

---

### 1.0 Session Storage Implementation (Redis + S3) - 2 hours ✅ COMPLETE

**Completed**: 2026-01-02  
**Implementation**: Redis stores session metadata, S3 stores temporary images

**Architecture Decision** (2025-12-09):
- **Redis**: Session metadata, S3 keys, 10-minute TTL
- **S3/Supabase Storage**: Temporary image storage (1-hour retention)
- **Scale**: Supports 100+ concurrent GPs (10MB Redis vs 500MB in-memory)

**Tasks Completed**:
- ✅ **Set up Redis client** - Upstash Redis with REST API
- ✅ **Set up S3 client** - AWS S3 with presigned URLs
- ✅ **Create session API routes**:
  - POST `/api/medtech/session/create` - Create session, return token
  - POST `/api/medtech/session/presigned-url` - Get S3 upload URL
  - POST `/api/medtech/session/images` - Add image + publish Ably event
  - GET `/api/medtech/session/images/:encounterId` - Get all images
  - GET `/api/medtech/session/token/:token` - Validate QR token
  
**Session Schema** (Redis):
```
Key: session:${token}
Value: {
  userId: string,
  images: [{ s3Key: string, metadata?: {...} }],
  createdAt: number,
  lastActivity: number
}
TTL: 600 seconds (10 minutes)
```

**S3 Key Format**:
```
sessions/${token}/${timestamp}_${uuid}.jpg
```

**Success Criteria Met**:
- ✅ Redis client connected (Upstash)
- ✅ S3 presigned URLs working
- ✅ Session CRUD operations implemented
- ✅ Sessions auto-expire after 2 hours (configurable TTL)
- ✅ Auto-retry logic (3 attempts, exponential backoff)

---

### 1.1 Mobile Upload UI/UX Review & Implementation - 2-3 hours ✅ COMPLETE

**Completed**: 2026-01-02  
**Final State**: Full 7-screen mobile flow with metadata capture

**File**: `/app/(medtech)/medtech-images/mobile/page.tsx`

**Tasks**:
- [ ] **Review mobile UI** (30 minutes)
  - Check capture flow (camera vs. gallery)
  - Review image preview grid
  - Identify UX improvements needed
  - Decision: Add metadata entry on mobile? Or desktop only?

- [ ] **Implement real upload** (1.5 hours)
  - Replace alert() with real API call
  - Upload images to session (via token)
  - Show upload progress per image
  - Handle upload errors
  - Success state with confirmation

- [ ] **Add loading/error states** (30 minutes)
  - Upload progress indicator (per image)
  - Error display (network failure, etc.)
  - Retry failed uploads
  - Success confirmation

- [ ] **Image compression on mobile** (30 minutes)
  - Compress images before upload (< 1MB target)
  - Show compression progress
  - Use existing compression service

**Success Criteria**:
- ✅ Mobile can capture/select images
- ✅ Images upload to backend (not just alert)
- ✅ Upload progress visible to user
- ✅ Errors handled gracefully
- ✅ Success confirmation shown

**Questions to Answer**:
1. Does mobile need metadata entry? Or desktop only?
2. Should mobile compress before upload or after?
3. How long should QR session last? (currently 2-hour TTL; confirm desired TTL)

---

### 1.2 Mobile → Desktop Dataflow Implementation - 1-2 hours ✅ COMPLETE

**Completed**: 2026-01-02  
**Final State**: Ably real-time sync with eager fetch implemented

**How it should work**:
```
1. Desktop generates QR with session token
2. Mobile scans QR, gets token
3. Mobile uploads images → backend with token
4. Backend associates images with session
5. Desktop polls/websocket for new images
6. Images appear in desktop store automatically
```

**Tasks**:
- [ ] **Backend session API** (1 hour)
  - POST /api/medtech/mobile/initiate - Create session with token
  - POST /api/medtech/mobile/upload - Upload images to session
  - GET /api/medtech/mobile/session/:token - Get session images
  - File: `/app/api/(integration)/medtech/mobile/` routes

- [ ] **Desktop polling/websocket** (1 hour)
  - Poll for new images every 2-3 seconds (simple approach)
  - Or: WebSocket connection for real-time updates (better UX)
  - Add new images to imageWidgetStore automatically
  - Show notification when images arrive

**Success Criteria**:
- ✅ Mobile uploads appear on desktop automatically
- ✅ No manual refresh needed
- ✅ Images appear within 3 seconds of mobile upload
- ✅ Multiple mobile devices can upload to same session

**Implementation Decision**:
- **Simple**: Polling every 2-3 seconds (easier to implement)
- **Better**: WebSocket for real-time (better UX, more complex)
- **Recommendation**: Start with polling, upgrade to WebSocket later if needed

---

### 1.3 Desktop/Mobile → Medtech Dataflow Review - 1 hour ✅ COMPLETE

**Completed**: 2026-01-02  
**Outcome**: Architecture documented in `PHASE_1B_COMPLETE.md`

**Tasks**:
- [ ] **Map desktop flow** (20 minutes)
  ```
  Desktop capture → imageWidgetStore → Commit button → 
  POST /api/medtech/attachments/commit → BFF → 
  POST /Media (FHIR) → ALEX API → Medtech DB
  ```

- [ ] **Map mobile flow** (20 minutes)
  ```
  Mobile capture → Upload → POST /api/medtech/mobile/upload → 
  Session storage → Desktop polls → imageWidgetStore → 
  (same commit flow as desktop)
  ```

- [ ] **Identify gaps/issues** (20 minutes)
  - Where does compression happen? (frontend or BFF)
  - Where is base64 conversion? (frontend or BFF)
  - How are commit errors reported back to user?
  - What happens if BFF is down?
  - What happens if ALEX API is down?

**Deliverable**: Dataflow diagram document (text or mermaid)

**Success Criteria**:
- ✅ Complete dataflow documented
- ✅ All transformation points identified
- ✅ Error handling points mapped
- ✅ Ready for Phase 2 implementation

---

### Phase 1 Outcome ✅ DELIVERED

**Deliverables Complete**:
- ✅ Mobile upload UI complete (7 screens with metadata capture)
- ✅ Mobile → Desktop dataflow working (Ably real-time sync)
- ✅ Desktop/Mobile → Medtech dataflow documented
- ✅ Redis + S3 session storage operational
- ✅ Build successful, production-ready
- ✅ Testing guide created (`PHASE_1B_TESTING.md`)
- ✅ Ready to connect real ALEX API in Phase 2

**Not Included** (deferred):
- ❌ Mobile metadata entry (if not needed)
- ❌ WebSocket implementation (if using polling)
- ❌ Advanced mobile features (edit, crop on mobile)

---

## Phase 2: Complete the Integration (Backend)

**Goal**: Connect frontend widget to real ALEX API via Lightsail BFF (static IP)  
**Time Estimate**: 4-6 hours  
**Priority**: Critical (enables end-to-end functionality)

### Phase 1C: Commit creates FHIR Media in ALEX via Lightsail BFF ✅ COMPLETE

**Outcome**: End-to-end commit working (desktop + mobile). Vercel proxies to BFF only; BFF creates FHIR `Media` in ALEX UAT using base64 `content.data`.

**Implementation details (constraints)**:
- ✅ **Mandatory identifier**: `Media.identifier[0].system = https://clinicpro.co.nz/image-id`; `value = UUID`
- ✅ **No S3 URLs in FHIR**: Use `content.data` base64 (ALEX cannot fetch S3 URLs)
- ✅ **Size enforcement**: Per-file `< 1MB` enforced in BFF
- ✅ **Input sources supported**: `{ base64Data }` or `{ downloadUrl }` (BFF fetches and base64-encodes downloadUrl)

**Completed tasks**:
- ✅ **Lightsail BFF**: Added `POST /api/medtech/session/commit` that creates FHIR `Media` in ALEX UAT (static IP allow-listed)
- ✅ **Vercel**: `POST /api/medtech/attachments/commit` proxies to BFF only; requires `patientId`; presigns mobile `s3Key` to `downloadUrl`
- ✅ **Widget**: Commit sends commit-ready sources (desktop `base64Data`, mobile `s3Key`) and always includes `patientId`

**Evidence (UAT + smoke tests)**:
- Vercel log: `[Medtech Commit] Commit complete { duration: 3330, successCount: 2, errorCount: 0 }`
- Direct smoke test mediaId example: `a4fcaddd4b8f24f377eca1c6b889ad76`
- Health checks: `GET /health` OK; `GET /api/medtech/test?nhi=ZZZ0016` success

**Code Example** (from WIDGET_IMPLEMENTATION_REQUIREMENTS.md):
```typescript
// For each image:
const mediaResource = {
  resourceType: 'Media',
  identifier: [{
    system: 'https://clinicpro.co.nz/image-id',
    value: crypto.randomUUID(),
  }],
  status: 'completed',
  type: {
    coding: [{
      system: 'http://terminology.hl7.org/CodeSystem/media-type',
      code: 'image',
      display: 'Image',
    }],
  },
  subject: {
    reference: `Patient/${patientId}`,
  },
  createdDateTime: new Date().toISOString(),
  content: {
    contentType: imageFile.contentType,
    data: base64Data,
    title: imageTitle,
  },
};

const response = await alexApiClient.post('/Media', mediaResource, {
  headers: {
    'mt-facilityid': facilityId,
  },
});
```

**Implementation Details**:

**Code Example**:
```typescript
// For each image:
const mediaResource = {
  resourceType: 'Media',
  identifier: [{
    system: 'https://clinicpro.co.nz/image-id',
    value: crypto.randomUUID(),
  }],
  status: 'completed',
  type: {
    coding: [{
      system: 'http://terminology.hl7.org/CodeSystem/media-type',
      code: 'image',
      display: 'Image',
    }],
  },
  subject: {
    reference: `Patient/${patientId}`,
  },
  createdDateTime: new Date().toISOString(),
  content: {
    contentType: imageFile.contentType,
    data: base64Data,
    title: imageTitle,
  },
};

const response = await alexApiClient.post('/Media', mediaResource);
```

**Required Media Fields** (Validated):
- ✅ `resourceType: "Media"`
- ✅ `identifier` (with system and value) — Must be unique per image
- ✅ `status: "completed"`
- ✅ `type` (image coding)
- ✅ `subject` (patient reference)
- ✅ `content.data` (base64 image)
- ✅ `content.contentType` (image/png, image/jpeg, etc.)

---

### Phase 1D (Proposed): Medtech UI validation + hardening + launch mechanism

**Goal**: Confirm end-user workflow and make commit robust for pilot clinics.

**Tasks**:
- [ ] **Confirm in Medtech UI**: Verify committed images appear where expected (Inbox + Daily Record) and are usable for referrals
- [ ] **Hardening**: Improve partial failure reporting (per-image errors), map OperationOutcome clearly, add request tracing/correlation IDs
- [ ] **Launch mechanism**: Decide and implement widget launch path from within Medtech Evolution (context passing + auth)
- [ ] **Optional workflow routing**: Decide any inbox/task routing behaviour (only if needed)

**Test Patient** (UAT):
- Patient ID: `14e52e16edb7a435bfa05e307afd008b`
- NHI: ZZZ0016
- Name: Mr UNRELATED STRING TESTING
- Facility: F2N060-E

**Verification**:
- Check BFF logs: `sudo journalctl -u clinicpro-bff -f`
- Verify 201 Created responses in logs
- Note Media IDs returned
- **(Later)** Check Medtech Evolution to verify images appear in Inbox/Daily Record

---

### 2.3 Frontend Integration - 1 hour

**Tasks**:
- ✅ **Commit route proxies to BFF only** (Phase 1C)
  - Vercel `POST /api/medtech/attachments/commit` proxies to Lightsail BFF
  - Requires `patientId`
  - Presigns mobile `s3Key` to `downloadUrl` (BFF fetches and base64-encodes)
  
- ✅ **End-to-end UAT (desktop + mobile)** (Phase 1C)
  - Evidence: `[Medtech Commit] Commit complete { duration: 3330, successCount: 2, errorCount: 0 }`
  - Example BFF smoke test mediaId: `a4fcaddd4b8f24f377eca1c6b889ad76`

**Success Criteria**:
- ✅ Images upload to real ALEX API
- ✅ User sees success message with count
- ✅ Media IDs logged in BFF
- ✅ Ready to verify in Medtech Evolution

---

### Phase 2 Outcome

**Deliverables**:
- Fully functional widget that uploads images to Medtech ALEX API
- Real FHIR Media resources created in Medtech database
- End-to-end tested with multiple image formats and scenarios
- Error handling validated

**Blockers Resolved**:
- ✅ OAuth working
- ✅ POST Media validated (201 Created)
- ✅ Facility ID configured (F2N060-E)
- ✅ BFF operational

---

## Phase 3: Widget Launch Mechanism

**Goal**: Enable widget launch from within Medtech Evolution  
**Time Estimate**: 3-5 hours  
**Priority**: Medium (needed for production, but can demo without it)

### 3.1 Determine Launch Method - 1-2 hours

**Current State**: Unknown how to launch widget from Medtech Evolution  
**Target State**: Widget launches from Medtech Evolution with patient context

**Investigation Tasks**:
- [ ] **Research Medtech Extension Points** (1 hour)
  - Review Medtech Evolution User Guide (Section: Custom Widgets/Extensions)
  - Check ALEX API docs for widget integration guidance
  - Test local Medtech Evolution instance (Login: ADM, blank password)
  
- [ ] **Test Launch Options** (1 hour)
  - Option A: iFrame embed (widget renders inside Medtech)
  - Option B: New tab/window (widget opens in browser)
  - Option C: Custom button/menu item (launches URL)
  - Document which option is supported

**Questions to Answer**:
1. Where does the widget launch from? (Dashboard, Left Pane, Ribbon, Direct module)
2. How is patient context passed? (URL params, JWT, PostMessage)
3. Does Medtech Evolution support iFrame or only new tab?

**References**:
- Medtech Evolution User Guide: https://insight.medtechglobal.com/download/user-guide-medtech-evolution-layout/
- ALEX API Documentation: https://alexapidoc.medtechglobal.com/

---

### 3.2 Implement Context Passing - 1-2 hours

**Target State**: Widget receives patient ID and facility ID on launch

**Tasks**:
- [ ] **Parse context from launch URL** (1 hour)
  - Read patient ID from URL parameter or JWT
  - Read facility ID from URL parameter or config
  - Validate context before allowing capture
  - File: `app/(medtech)/medtech-images/page.tsx`
  
- [ ] **Handle missing context** (30 minutes)
  - Show error if patient ID missing
  - Disable capture/commit until context available
  - Log missing context for debugging

**Launch URL Examples**:
```
Option A (URL Parameters):
https://widget.clinicpro.co.nz/medtech-images?patientId=14e52e16...&facilityId=F2N060-E

Option B (JWT Token):
https://widget.clinicpro.co.nz/medtech-images?token=eyJhbGciOi...
```

**Code Example**:
```typescript
// In page.tsx
const searchParams = useSearchParams();
const patientId = searchParams.get('patientId');
const facilityId = searchParams.get('facilityId');

if (!patientId) {
  return <ErrorScreen message="Patient context missing. Please launch from Medtech." />;
}
```

---

### 3.3 Test Launch from Medtech Evolution - 1 hour

**Tasks**:
- [ ] **Configure widget in Medtech Evolution** (30 minutes)
  - Add custom button/menu item (if supported)
  - Configure launch URL with patient context
  - Test from patient record view
  
- [ ] **End-to-end launch test** (30 minutes)
  - Open patient in Medtech Evolution
  - Click widget launch button
  - Verify widget opens with correct patient context
  - Upload test image
  - Verify image appears in Medtech Inbox/Daily Record

**Success Criteria**:
- ✅ Widget launches from Medtech Evolution
- ✅ Patient context passed correctly
- ✅ Images upload to correct patient
- ✅ Images visible in Medtech Evolution immediately

---

### Phase 3 Outcome

**Deliverables**:
- Widget launchable from within Medtech Evolution
- Patient context automatically passed (no manual entry)
- Full integration with Medtech workflow
- Ready for GP practice pilots

**Remaining Questions**:
- Medtech approval process (if any)
- Distribution method (URL shared with practices, or Medtech installs centrally)
- Support process (who GPs contact for issues)

---

## Timeline Summary

| Phase | Tasks | Time Estimate | Priority |
|-------|-------|---------------|----------|
| **Phase 1: Mobile Upload & Dataflow** | Redis + S3 setup + Mobile UI + Mobile→Desktop sync + Dataflow review | 6-8 hours | High |
| **Phase 2: Complete Integration** | BFF commit endpoint + Testing | 4-6 hours | Critical |
| **Phase 3: Widget Launch Mechanism** | Launch method + Context passing | 3-5 hours | Medium |
| **Total** | | **13-19 hours** | |

**Target Completion**: TBD (depends on start date)

---

## Phase Order Rationale

### Why Phase 1 First (Mobile Upload & Dataflow)?

1. **Mobile handoff is core differentiator** - QR code workflow is key selling point
2. **Dataflow must be correct before backend integration** - Need to understand full flow before connecting ALEX API
3. **Mobile → Desktop sync is complex** - Better to solve this early, test thoroughly
4. **Desktop polish already done** - Error handling and editor complete, focus on mobile gap

### Why Phase 2 Second (Backend Integration)?

1. **Core functionality** - Without this, widget doesn't work
2. **Already validated** - POST Media tested and working (low risk)
3. **Clear implementation path** - Code examples ready in docs
4. **Enables testing** - Can verify images appear in Medtech

### Why Phase 3 Last (Launch Mechanism)?

1. **Can demo without it** - Widget works standalone (just need to pass patient ID manually for demo)
2. **Unknown complexity** - May require Medtech support/approval
3. **Not blocking revenue** - Can pilot with manual launch, automate later
4. **Production polish** - Nice-to-have, but not critical for validation

---

## Success Criteria (Overall)

### Phase 1 Complete ✅
- Redis + S3 session storage implemented
- Mobile upload UI complete with real backend
- Mobile → Desktop dataflow working (Ably sync)
- Desktop/Mobile → Medtech dataflow documented and reviewed

### Phase 2 Complete ✅
- Images upload to real ALEX API
- End-to-end tested with multiple scenarios
- Error handling validated

### Phase 3 Complete ✅
- Widget launches from Medtech Evolution
- Patient context passed automatically
- Ready for GP practice pilots

---

## Post-Launch Roadmap (Out of Scope)

**Future Enhancements** (after pilots running):
1. Image annotations (arrows, text, shapes)
2. Keyboard shortcuts
3. Mobile per-image metadata
4. Bulk upload (drag folder)
5. Image templates (pre-set body sites)
6. Analytics (usage tracking)
7. Hybrid Connection Manager setup (for local facility F99669-C)

---

## Code Locations

- Frontend Widget: `/src/medtech/images-widget/`
- Vercel Commit Proxy: `/app/api/(integration)/medtech/attachments/commit/route.ts`
- Lightsail BFF Commit Endpoint: `/api/medtech/session/commit` (Lightsail service; source in `/lightsail-bff/`)
- Widget Page: `/app/(medtech)/medtech-images/page.tsx`
- Mobile Page: `/app/(medtech)/medtech-images/mobile/page.tsx`
- Store: `/src/medtech/images-widget/store/imageWidgetStore.ts`

---

**Document Status**: Active Development Roadmap  
**Last Updated**: 2025-12-09  
**Version**: 2.1  
**Changes**: 
- Added Redis + S3 session storage implementation (Phase 1.0)
- Updated time estimates: Phase 1 now 6-8 hours (was 4-6)
- Updated total: 13-19 hours (was 12-18)
- Added reference to FEATURE_OVERVIEW.md for architectural context
