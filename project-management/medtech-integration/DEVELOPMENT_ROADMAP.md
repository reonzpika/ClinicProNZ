# Medtech Integration - Development Roadmap

**Created**: 2025-11-12  
**Status**: Active Development  
**Estimated Total Time**: 12-18 hours  
**Current Phase**: Phase 1 (Frontend Enhancements)

---

## Overview

This roadmap outlines the 3-phase development plan to complete the Medtech integration widget and prepare it for production deployment.

**Current Status**: 
- ✅ Infrastructure complete (OAuth, BFF, ALEX API connectivity)
- ✅ POST Media validated (widget can upload images)
- ✅ Frontend Phase 1 complete (capture, edit, metadata, commit flow)
- ⏳ Frontend enhancements needed (60% target)
- ⏳ Backend integration needed (connect real API)
- ⏳ Widget launch mechanism needed

---

## Phase 1: Frontend Enhancements (60% Target)

**Goal**: Polish frontend UX before connecting to real backend  
**Time Estimate**: 4-6 hours  
**Priority**: High (improves UX and reduces post-launch issues)

### 1.1 Enhanced Error Handling (Critical) - 2-3 hours

**Current State**: Basic error handling, no per-image retry  
**Target State**: Granular error handling with per-image status and retry

**Tasks**:
- [ ] **Per-image error states** (1 hour)
  - Add error state to imageWidgetStore for each image
  - Display error icon/message on thumbnail
  - Show detailed error in modal
  - File: `src/medtech/images-widget/store/imageWidgetStore.ts`

- [ ] **Retry mechanism** (1 hour)
  - Add "Retry" button for failed images
  - Implement retry counter (max 3 attempts)
  - Exponential backoff for 503 errors
  - File: `src/medtech/images-widget/hooks/useCommit.ts`

- [ ] **Partial failure handling** (1 hour)
  - Show success count vs. failed count
  - Allow resubmit of failed images only
  - Keep successful uploads (don't re-upload)
  - File: `src/medtech/images-widget/components/PartialFailureDialog.tsx` (already exists, needs enhancement)

**Success Criteria**:
- ✅ User sees which specific images failed
- ✅ User can retry individual images without re-uploading all
- ✅ Clear error messages (not technical FHIR errors)

---

### 1.2 Basic Image Editor (High Value) - 2-3 hours

**Current State**: No image editing capability  
**Target State**: Basic crop and rotate (60% = skip annotations for now)

**Tasks**:
- [ ] **Image crop tool** (1.5 hours)
  - Integrate existing library (e.g., `react-easy-crop`)
  - Add crop UI in ImageEditModal
  - Apply crop before commit
  - File: `src/medtech/images-widget/components/ImageEditModal.tsx`

- [ ] **Image rotate** (0.5 hour)
  - Add rotate buttons (90° increments)
  - Apply rotation before commit
  - File: `src/medtech/images-widget/components/ImageEditModal.tsx`

- [ ] **Edit workflow** (1 hour)
  - Add "Edit" button on ImagePreview
  - Open ImageEditModal with current image
  - Apply changes to image in store
  - Re-compress after edit

**Success Criteria**:
- ✅ User can crop images to focus on clinical area
- ✅ User can rotate images (landscape → portrait)
- ✅ Edits persist until commit
- ❌ Annotations deferred to post-launch (out of scope for 60%)

**Libraries to Use** (per workspace rules):
- `react-easy-crop` - Well-maintained, 2.5k+ stars, TypeScript support
- Alternative: `react-image-crop` - 3.8k+ stars, simpler API

---

### Phase 1 Outcome

**Deliverables**:
- Enhanced error handling with per-image retry
- Basic image editing (crop + rotate)
- Better UX for failures and corrections

**Not Included** (deferred to post-launch):
- Keyboard shortcuts
- Mobile per-image metadata
- Advanced annotations (arrows, text, shapes)

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

**Reference Documents**:
- `docs/WIDGET_IMPLEMENTATION_REQUIREMENTS.md` - Section 3 (complete code examples)
- `docs/FHIR_API_TEST_RESULTS.md` - Section 4 (POST Media test results)

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
| **Phase 1: Frontend Enhancements** | Error handling + Image editor (60%) | 4-6 hours | High |
| **Phase 2: Complete Integration** | BFF commit endpoint + Testing | 4-6 hours | Critical |
| **Phase 3: Widget Launch Mechanism** | Launch method + Context passing | 3-5 hours | Medium |
| **Total** | | **12-18 hours** | |

**Target Completion**: End of Week (Nov 17, 2025)

---

## Phase Order Rationale

### Why Phase 1 First (Frontend Enhancements)?

1. **UX improvements reduce post-launch issues** - Better error handling = fewer support requests
2. **Image editing is easier to test with mock backend** - Can iterate quickly without BFF dependency
3. **Builds confidence in frontend quality** - Polish first, then connect real backend
4. **60% target = focus on high-value features** - Crop/rotate/error handling, skip nice-to-haves

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
- Enhanced error handling with per-image retry
- Basic image editor (crop + rotate)
- Better UX for failures

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

## Resources & References

### Documentation
- **FHIR API Test Results**: `docs/FHIR_API_TEST_RESULTS.md` (13 pages)
- **Widget Implementation Requirements**: `docs/WIDGET_IMPLEMENTATION_REQUIREMENTS.md` (10 pages)
- **Lightsail BFF Setup**: `docs/LIGHTSAIL_BFF_SETUP.md`
- **Architecture Guide**: `docs/ARCHITECTURE_AND_TESTING_GUIDE.md`

### Code Locations
- Frontend Widget: `/src/medtech/images-widget/`
- BFF Commit Endpoint: `/app/api/(integration)/medtech/attachments/commit/route.ts`
- Widget Page: `/app/(medtech)/medtech-images/page.tsx`
- Store: `/src/medtech/images-widget/store/imageWidgetStore.ts`

### Test Environment
- BFF URL: https://api.clinicpro.co.nz
- BFF IP: 13.236.58.12 (whitelisted)
- ALEX API: https://alexapiuat.medtechglobal.com/FHIR
- Test Patient ID: `14e52e16edb7a435bfa05e307afd008b` (NHI: ZZZ0016)
- Facility ID: `F2N060-E`

---

## Next Actions

### Immediate (This Session)
1. Read this roadmap
2. Confirm phase order and 60% frontend scope
3. Start Phase 1: Enhanced error handling

### This Week
1. Complete Phase 1 (4-6 hours)
2. Complete Phase 2 (4-6 hours)
3. Complete Phase 3 (3-5 hours)

### Next Week
1. Demo to Medtech (if needed)
2. Prepare customer pitch materials
3. Launch pilots with GP practices

---

**Document Status**: Active Development Roadmap  
**Last Updated**: 2025-11-12  
**Version**: 1.0  
**Supersedes**: IMMEDIATE_ACTION_PLAN.md (archived)
