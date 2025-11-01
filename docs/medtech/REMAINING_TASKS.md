# Medtech Images Widget - Remaining Tasks

**Last Updated**: 2025-10-31  
**Current Status**: Layout complete, ready for enhancements

---

## ✅ Completed (Phase 1 + 1.5)

- ✅ Initial build with mock backend
- ✅ Desktop page with all components
- ✅ Mobile page with QR handoff
- ✅ Image compression service
- ✅ State management (Zustand)
- ✅ API routes (mock implementations)
- ✅ Layout redesign (Option B: 40/60 preview/metadata split)
- ✅ Horizontal thumbnail strip
- ✅ Compact top bar
- ✅ Navigation controls (Prev/Next)
- ✅ Status badges (pending, committed)
- ✅ Basic validation feedback (footer status)
- ✅ React hooks compliance
- ✅ TypeScript compilation
- ✅ Vercel deployment tested

---

## 🚧 Phase 2: Frontend Enhancements (Next)

### **High Priority** — Must-have for MVP

#### **1. Required Field Validation** (1-2 hours)
**Current**: Footer shows "Missing: Laterality, Body Site" but doesn't prevent commit  
**Goal**: Visual indicators + disabled commit for incomplete images

**Tasks**:
- [ ] Add red borders to MetadataChips when required fields empty
- [ ] Show asterisk (*) on required field labels
- [ ] Disable "Commit" button if any selected images missing required fields
- [ ] Show tooltip on disabled commit: "X images missing required metadata"
- [ ] Update CommitDialog to list incomplete images

**Files to edit**:
- `src/medtech/images-widget/components/desktop/MetadataChips.tsx` — Add `isRequired` prop, red border styling
- `src/medtech/images-widget/components/desktop/MetadataForm.tsx` — Pass validation status to chips
- `app/(integration)/medtech-images/page.tsx` — Check committableImages for completeness, disable button
- `src/medtech/images-widget/components/desktop/CommitDialog.tsx` — Show incomplete image list

---

#### **2. Upload Progress Indicator** (2-3 hours)
**Current**: CommitDialog shows "Committing..." with no progress details  
**Goal**: Show per-image upload progress during commit

**Tasks**:
- [ ] Add progress tracking to `useCommit` hook
- [ ] Update CommitDialog to show progress bar
- [ ] Show list: "✓ Image 1 uploaded", "⏳ Image 2 uploading...", "⏱ Image 3 pending"
- [ ] Disable close button while uploading
- [ ] Show "All images committed successfully" on completion

**Files to edit**:
- `src/medtech/images-widget/hooks/useCommit.ts` — Track upload state per image
- `src/medtech/images-widget/components/desktop/CommitDialog.tsx` — Add progress UI
- `src/medtech/images-widget/stores/imageWidgetStore.ts` — Add `uploadProgress` state

---

#### **3. Better Error Handling** (2-3 hours)
**Current**: Generic error banner at top, no per-image errors  
**Goal**: Per-image error states with retry options

**Tasks**:
- [ ] Add `errorMessage` field to `WidgetImage` type
- [ ] Show error badge in ThumbnailStrip (red badge with "!")
- [ ] Click error badge → Show error details in modal
- [ ] Add "Retry" button in error modal
- [ ] Update commit flow to handle partial failures (some succeed, some fail)
- [ ] Show toast notifications for errors (not just top banner)

**Files to edit**:
- `src/medtech/images-widget/types/index.ts` — Add `errorMessage?: string` to `WidgetImage`
- `src/medtech/images-widget/components/desktop/ThumbnailStrip.tsx` — Show error badge
- `src/medtech/images-widget/components/desktop/ErrorModal.tsx` — **NEW FILE** for error details
- `src/medtech/images-widget/hooks/useCommit.ts` — Handle partial failures
- `src/medtech/images-widget/stores/imageWidgetStore.ts` — Add `setImageError()` action

---

### **Medium Priority** — Nice-to-have

#### **4. Image Editor Modal** (4-6 hours)
**Current**: "Edit" button shows "Coming soon!" alert  
**Goal**: Modal with crop, rotate, brightness/contrast controls

**Tasks**:
- [ ] Install `react-image-crop` or `react-easy-crop`
- [ ] Create `ImageEditorModal.tsx` component
- [ ] Add crop tool with aspect ratio presets
- [ ] Add rotate buttons (90°, 180°, 270°)
- [ ] Add brightness/contrast sliders
- [ ] "Save as new" workflow (keep original + edited version)
- [ ] Update thumbnail to show "edited" badge

**Files to edit**:
- `src/medtech/images-widget/components/desktop/ImageEditorModal.tsx` — **NEW FILE**
- `app/(integration)/medtech-images/page.tsx` — Open modal on edit button
- `src/medtech/images-widget/stores/imageWidgetStore.ts` — Add `duplicateImage()` action
- `src/medtech/images-widget/types/index.ts` — Add `isEditedVersion?: boolean` flag

---

#### **5. Keyboard Shortcuts** (2-3 hours)
**Current**: Mouse-only navigation  
**Goal**: Arrow keys, Space, Delete shortcuts

**Tasks**:
- [ ] Add keyboard event listener to main page
- [ ] Arrow Left/Right → Previous/Next image
- [ ] Space → Toggle selection of current image
- [ ] Delete → Remove current image (with confirmation)
- [ ] Escape → Close modals
- [ ] Show keyboard shortcuts in help tooltip

**Files to edit**:
- `app/(integration)/medtech-images/page.tsx` — Add `useEffect` with keyboard listener
- `src/medtech/images-widget/components/desktop/KeyboardShortcutsHelp.tsx` — **NEW FILE** (optional)

---

#### **6. Mobile Flow Enhancements** (3-4 hours)
**Current**: Mobile only captures images, metadata added on desktop  
**Goal**: Optional per-image metadata on mobile

**Tasks**:
- [ ] Add metadata chips to mobile review step
- [ ] Make metadata optional (can skip, add later on desktop)
- [ ] Show "X images with metadata" counter
- [ ] Sync metadata back to desktop session via API

**Files to edit**:
- `app/(integration)/medtech-images/mobile/page.tsx` — Add MetadataChips to review step
- `src/medtech/images-widget/components/mobile/MobileMetadataChips.tsx` — **NEW FILE** (simplified version)

---

## 🚫 Explicitly Out of Scope

**Not implementing** (per user request 2025-10-31):
- ❌ Bulk metadata application (apply to multiple images at once)
- ❌ Body site autocomplete/search (dropdown is sufficient)
- ❌ Gallery sort/filter options (not needed for 4-10 images)

---

## 🔗 Backend Integration (Phase 3 - Blocked)

**Status**: ⏸️ Awaiting Medtech UAT access + widget placement clarification

**Blocked tasks**:
- [ ] Replace mock API with real ALEX API calls
- [ ] Implement OAuth token refresh logic
- [ ] Test real upload-initiate + commit flow
- [ ] Test encounter context from Medtech Evolution
- [ ] Test iframe embedding or new tab launch
- [ ] Test dual monitor support
- [ ] Handle IP allow-listing requirements

**Waiting on**:
- Medtech support response (email to Defne)
- UAT testing credentials
- Widget placement decision (Dashboard, Left Pane, Ribbon, or Module)
- Encounter context passing mechanism (JWT, URL params, PostMessage)

**Reference**: See `docs/medtech/email-draft-uat-testing-access.md` for questions sent to Medtech

---

## 📊 Estimated Timeline

**Phase 2 (Frontend Enhancements)**:
- High priority tasks: 5-8 hours (1-2 days)
- Medium priority tasks: 9-13 hours (2-3 days)
- **Total**: 14-21 hours (3-5 days)

**Phase 3 (Backend Integration)**:
- Depends on Medtech response time
- Estimated: 2-4 days after UAT access granted

**Total to MVP**: 5-9 days (assuming no blockers)

---

## 🎯 Recommended Next Steps

1. **Implement validation** (1-2 hours) — Quick win, high impact
2. **Add upload progress** (2-3 hours) — Better UX for commit flow
3. **Improve error handling** (2-3 hours) — Critical for debugging
4. **Test with real UAT data** — Once Medtech responds
5. **Image editor** (4-6 hours) — If time permits before backend integration
6. **Keyboard shortcuts** (2-3 hours) — Polish for power users

**Priority order**: 1 → 2 → 3 → (wait for Medtech) → 4 → 5 → 6

---

**Questions?** See `docs/medtech/README.md` for project overview or `docs/medtech/FRONTEND_POLISH_PLAN.md` for detailed design considerations.
