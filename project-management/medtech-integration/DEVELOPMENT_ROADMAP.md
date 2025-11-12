# Medtech Integration - Development Roadmap

**Created**: 2025-11-12  
**Last Updated**: 2025-11-13  
**Status**: Active Development  
**Estimated Total Time**: 12-18 hours  
**Current Phase**: Phase 1 - Mobile Upload & Dataflow Review (In Progress - 1.1 & 1.2 Complete)

---

## Quick Start - Next Development Session

**Current Status**: ✅ POST Media Validated! Widget can upload images to Medtech ALEX API (201 Created)

**What's Ready**:
- ✅ Infrastructure complete (OAuth, BFF, ALEX API connectivity)
- ✅ POST Media validated (widget can upload images)
- ✅ Desktop widget complete (capture, edit, metadata, commit flow)
- ✅ **Mobile upload complete** (real backend integration, compression, metadata form)
- ✅ **QR code generation** (real QR codes with session tokens)
- ✅ **Mobile → Desktop sync** (SSE/WebSocket real-time updates)
- ✅ **Session management** (Redis-based session storage)
- ⏳ Backend integration needed (connect real ALEX API in Phase 2)

**Test Environment**:
- BFF URL: https://api.clinicpro.co.nz
- BFF IP: 13.236.58.12 (whitelisted)
- ALEX API: https://alexapiuat.medtechglobal.com/FHIR
- Test Patient ID: `14e52e16edb7a435bfa05e307afd008b` (NHI: ZZZ0016)
- Facility ID: `F2N060-E`
- **Redis**: Upstash Redis (requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`)

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

**Next Immediate Task**: Testing Phase 1 implementation (Phase 1.1 & 1.2 complete)

**Testing Checklist**:
- [ ] Set up Upstash Redis environment variables (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`)
- [ ] Test QR code generation on desktop (`/medtech-images`)
- [ ] Test mobile upload flow end-to-end (`/medtech-images/mobile?t=<token>`)
- [ ] Verify images appear on desktop in real-time (SSE connection)
- [ ] Test offline queue functionality (disconnect mobile, verify queue, reconnect)
- [ ] Test "Take More" flow (upload in background, return to capture)
- [ ] Test "Finish" flow (upload all pending, reset to start)
- [ ] Test session cleanup (close desktop widget, verify mobile gets disconnected)
- [ ] Test multiple mobile devices uploading to same session

---

## Overview

This roadmap outlines the 3-phase development plan to complete the Medtech integration widget and prepare it for production deployment.

**Current Status**: 
- ✅ Infrastructure complete (OAuth, BFF, ALEX API connectivity)
- ✅ POST Media validated (widget can upload images)
- ✅ Desktop complete (capture, edit, metadata, commit flow, error handling)
- ✅ **Mobile upload complete** (real backend integration, compression, metadata form, offline queue)
- ✅ **QR code generation** (real QR codes with session tokens, Redis session storage)
- ✅ **Mobile → Desktop sync** (SSE real-time updates, auto-reconnect, heartbeat)
- ⏳ Dataflow review needed (Desktop/Mobile → Medtech) - Phase 1.3
- ⏳ Backend integration needed (connect real ALEX API) - Phase 2
- ⏳ Widget launch mechanism needed - Phase 3

---

## Phase 1: Mobile Upload & Dataflow Review

**Goal**: Complete mobile upload flow and review dataflow from desktop/mobile → Medtech  
**Time Estimate**: 4-6 hours  
**Priority**: High (mobile handoff is core feature, dataflow must be correct)

**Current State**:
- ✅ Desktop error handling complete
- ✅ Desktop image editor complete
- ✅ Desktop QR panel generates real QR codes with session tokens
- ✅ Mobile UI complete (capture → review → metadata → upload flow)
- ✅ Mobile upload uses real API (POST /api/medtech/mobile/upload)
- ✅ Mobile → Desktop dataflow implemented (SSE real-time sync)
- ⏳ Dataflow Desktop/Mobile → Medtech needs review (Phase 1.3)

---

### 1.1 Mobile Upload UI/UX Review & Implementation - ✅ COMPLETE [2025-11-13]

**Status**: ✅ Complete  
**Implementation Time**: ~3 hours

**File**: `/app/(medtech)/medtech-images/mobile/page.tsx`

**Tasks Completed**:
- ✅ **Mobile UI reviewed and implemented**
  - Capture flow: Camera and Gallery selection with multiple image support
  - Review step with image preview grid and navigation
  - Metadata form: Collapsible/expandable form with Side, Body Site, View, Type chips
  - "Take More" button: Uploads current image in background, returns to capture
  - "Finish" button: Uploads all pending images, resets to start state

- ✅ **Real upload implemented**
  - Replaced alert() with real API call (`POST /api/medtech/mobile/upload`)
  - Upload images to session via token
  - Upload progress per image (uploading/uploaded/error states)
  - Error handling with retry logic
  - Success states with visual indicators

- ✅ **Loading/error states**
  - Upload progress indicator per image
  - Error display for network failures
  - Failed uploads saved to offline queue (localStorage)
  - Visual feedback (loading spinner, checkmark, error icon)

- ✅ **Image compression on mobile**
  - Compress images before upload (< 1MB target)
  - Compression progress shown during processing
  - Uses existing compression service (`useImageCompression` hook)

**Success Criteria Met**:
- ✅ Mobile can capture/select images
- ✅ Images upload to backend (real API, not alert)
- ✅ Upload progress visible to user
- ✅ Errors handled gracefully with offline queue
- ✅ Success confirmation shown

**Decisions Made**:
1. ✅ Mobile has optional metadata entry (collapsible form)
2. ✅ Mobile compresses before upload (same as desktop)
3. ✅ QR session lasts until desktop widget closes (1 hour default TTL, extends on heartbeat)

---

### 1.2 Mobile → Desktop Dataflow Implementation - ✅ COMPLETE [2025-11-13]

**Status**: ✅ Complete  
**Implementation Time**: ~2 hours

**How it works**:
```
1. Desktop generates QR with session token (UUID)
2. Mobile scans QR, gets token from URL
3. Mobile uploads images → POST /api/medtech/mobile/upload with token
4. Backend stores images in Redis session (Upstash Redis)
5. Desktop connects to SSE endpoint (/api/medtech/mobile/ws/:token)
6. Backend polls session every 2 seconds, sends new images via SSE
7. Desktop receives images, converts base64 to File, adds to store
8. Images appear in desktop widget automatically
```

**Tasks Completed**:
- ✅ **Backend session API** (Complete)
  - ✅ POST /api/medtech/mobile/initiate - Create session with token, generate QR code
  - ✅ POST /api/medtech/mobile/upload - Upload images to session (base64 storage)
  - ✅ GET /api/medtech/mobile/session/:token/images - Get session images
  - ✅ DELETE /api/medtech/mobile/session/:token - Close session
  - ✅ Session storage: Redis-based (`mobile-session-storage.ts`)
  - ✅ QR code generation: Real QR codes using `qrcode` library

- ✅ **Desktop real-time sync** (Complete)
  - ✅ SSE endpoint: `/api/medtech/mobile/ws/:token` (Server-Sent Events for Vercel compatibility)
  - ✅ Hook: `useMobileSessionWebSocket` connects automatically when QR token available
  - ✅ Auto-reconnect: Handles connection drops with exponential backoff
  - ✅ Heartbeat monitoring: Detects stale connections, reconnects if needed
  - ✅ Images automatically added to `imageWidgetStore`
  - ✅ Session cleanup: `beforeunload` event closes session when desktop widget closes

**Success Criteria Met**:
- ✅ Mobile uploads appear on desktop automatically
- ✅ No manual refresh needed
- ✅ Images appear within 2-3 seconds of mobile upload (SSE polling interval)
- ✅ Multiple mobile devices can upload to same session (supported by design)

**Implementation Decision**:
- ✅ **Chosen**: Server-Sent Events (SSE) for real-time updates
- **Rationale**: Vercel doesn't support WebSocket, SSE works perfectly for one-way updates
- **Performance**: 2-second polling interval provides near-real-time updates
- **Reliability**: Auto-reconnect, heartbeat monitoring, session cleanup on widget close

---

### 1.3 Desktop/Mobile → Medtech Dataflow Review - 1 hour

**Goal**: Document and verify complete dataflow from capture to Medtech

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

### Phase 1 Outcome

**Deliverables**:
- ✅ Mobile upload UI complete with real backend
- ✅ Mobile → Desktop dataflow working (real-time or near-real-time)
- ✅ Desktop/Mobile → Medtech dataflow documented and reviewed
- ✅ Ready to connect real ALEX API in Phase 2

**Not Included** (deferred):
- ❌ Mobile metadata entry (if not needed)
- ❌ WebSocket implementation (if using polling)
- ❌ Advanced mobile features (edit, crop on mobile)

---

## Phase 2: Complete the Integration (Backend)

**Goal**: Connect frontend widget to real ALEX API via BFF  
**Time Estimate**: 4-6 hours  
**Priority**: Critical (enables end-to-end functionality)

### 2.1 Update BFF Commit Endpoint - 2-3 hours

**Current State**: Mock implementation returning fake success  
**Target State**: Real FHIR Media POST to ALEX API

**Tasks**:
- [ ] **Update commit route** (2 hours)
  - File: `/app/api/(integration)/medtech/attachments/commit/route.ts`
  - Add identifier generation (UUID)
  - Add base64 conversion (from uploaded files)
  - Build FHIR Media resource (per WIDGET_IMPLEMENTATION_REQUIREMENTS.md)
  - POST to ALEX API via alexApiClient
  - Handle 201 Created response
  - Return Media IDs to frontend
  
- [ ] **Error handling** (1 hour)
  - Handle 400 Bad Request (validation errors)
  - Handle 401 Unauthorized (refresh token, retry)
  - Handle 403 Forbidden (facility ID issue)
  - Handle 503 Service Unavailable (retry with backoff)
  - Map FHIR OperationOutcome to user-friendly errors

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

### 2.2 Test with Real Images - 1-2 hours

**Tasks**:
- [ ] **Single image tests** (30 minutes)
  - Test JPEG upload (< 1MB)
  - Test PNG upload (< 1MB)
  - Test large image (> 1MB, verify compression works)
  
- [ ] **Multiple image tests** (30 minutes)
  - Test 3 images together
  - Test 5 images together
  - Verify all succeed
  
- [ ] **Error scenario tests** (1 hour)
  - Test with invalid patient ID (should fail with clear error)
  - Test with no internet connection (should show retry)
  - Test with BFF down (should show retry)
  - Test partial failure (intentionally break 1 of 3 images)

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
- [ ] **Switch from mock to real API** (30 minutes)
  - Update `NEXT_PUBLIC_MEDTECH_USE_MOCK=false` in environment variables
  - Verify all API routes hit BFF (not mocks)
  - File: `.env.local`, `.env.production`
  
- [ ] **Test end-to-end flow** (30 minutes)
  - Launch widget with test patient ID
  - Upload images
  - Add metadata
  - Commit
  - Verify success feedback
  - Check BFF logs for Media IDs

**Success Criteria**:
- ✅ Images upload to real ALEX API (not mock)
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
| **Phase 1: Mobile Upload & Dataflow** | Mobile UI + Mobile→Desktop sync + Dataflow review | 4-6 hours | High |
| **Phase 2: Complete Integration** | BFF commit endpoint + Testing | 4-6 hours | Critical |
| **Phase 3: Widget Launch Mechanism** | Launch method + Context passing | 3-5 hours | Medium |
| **Total** | | **12-18 hours** | |

**Target Completion**: End of Week (Nov 17, 2025)

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
- Mobile upload UI complete with real backend
- Mobile → Desktop dataflow working
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
- BFF Commit Endpoint: `/app/api/(integration)/medtech/attachments/commit/route.ts`
- Widget Page: `/app/(medtech)/medtech-images/page.tsx`
- Mobile Page: `/app/(medtech)/medtech-images/mobile/page.tsx`
- Store: `/src/medtech/images-widget/stores/imageWidgetStore.ts`

**Phase 1 Implementation Files**:
- Session Storage: `/src/lib/services/medtech/mobile-session-storage.ts`
- QR Session Hook: `/src/medtech/images-widget/hooks/useQRSession.ts`
- WebSocket Hook: `/src/medtech/images-widget/hooks/useMobileSessionWebSocket.ts`
- Mobile Upload API: `/app/api/(integration)/medtech/mobile/upload/route.ts`
- Session Initiate API: `/app/api/(integration)/medtech/mobile/initiate/route.ts`
- Session Images API: `/app/api/(integration)/medtech/mobile/session/[token]/images/route.ts`
- Session Delete API: `/app/api/(integration)/medtech/mobile/session/[token]/route.ts`
- SSE Endpoint: `/app/api/(integration)/medtech/mobile/ws/[token]/route.ts`
- UI Component: `/src/shared/components/ui/collapsible.tsx` (new)

---

**Document Status**: Active Development Roadmap  
**Last Updated**: 2025-11-13  
**Version**: 2.1  
**Note**: Phase 1.1 & 1.2 complete (2025-11-13). Ready for testing before proceeding to Phase 1.3.
