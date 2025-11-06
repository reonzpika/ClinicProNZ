# Medtech Images Widget - Frontend Polish Plan

**Date**: 2025-10-31  
**Status**: Phase 1.5 - UX Refinements  
**Goal**: Finalize frontend UX before backend integration

---

## 🎯 Why Polish Frontend First?

### **Benefits:**
1. ✅ **Independent work** — Not blocked by Medtech response
2. ✅ **Easier iteration** — Mock backend allows rapid UX testing
3. ✅ **Sets requirements** — Frontend UX defines backend needs
4. ✅ **Better user feedback** — Polish now = clearer feedback from Medtech on launch

### **Workflow:**
```
Frontend Polish (current) → Backend Integration → End-to-End Testing
```

---

## 🎨 Priority 1: Metadata UI/UX Improvements

### **Current State:**
- ✅ Chips work for laterality, body site, view, type
- ✅ "Other" button for custom body site
- ✅ Sticky-last behavior (remembers last selection)
- ⚠️ Limited to predefined chips
- ⚠️ No search/autocomplete for body sites
- ⚠️ No bulk operations
- ⚠️ Metadata hidden in expanded cards (not visible at glance)

### **Improvements:**

#### **1.1 Body Site Autocomplete** (High Priority)
**Problem**: Limited to 9 common body sites + "Other"  
**Solution**: Searchable dropdown with full SNOMED CT body site list

**Design**:
```
[Body Site]
  [Search field: "Type to search..."]
  Quick picks: Face | Forearm | Hand | Leg | Foot
  
  [Search results]
  ✓ Forearm structure (SNOMED: 40983000)
  ✓ Finger structure (SNOMED: 7569003)
  ✓ Foot structure (SNOMED: 56459004)
  ...
```

**Implementation**:
- Component: `BodySiteSearch.tsx`
- Use Combobox pattern (shadcn/ui combobox)
- Filter SNOMED list on client-side (fast enough for ~50 body sites)
- Keep quick chips for common selections

#### **1.2 Bulk Metadata Application** (High Priority)
**Problem**: Must set metadata per image individually  
**Solution**: Apply metadata to multiple selected images

**Design**:
```
[2 images selected]
  
  Apply to selected:
  Laterality: [Left] [Right] [Bilateral] [N/A]
  Body Site:  [Forearm ▼]
  View:       [Close-up] [Dermoscopy] [Other]
  
  [Apply to 2 images]
```

**Implementation**:
- Add "Bulk Edit" mode when multiple images selected
- Show bulk metadata panel above gallery
- Apply button updates all selected images
- Store: `updateMultipleImages(ids: string[], metadata: Partial<Metadata>)`

#### **1.3 Required Field Indicators** (High Priority)
**Problem**: Not clear which fields are required  
**Solution**: Visual indicators for mandatory fields

**Design**:
```
Laterality *        [Required - red border until filled]
Body Site *         [Required]
View               [Optional - gray border]
Type               [Optional]
Label              [Optional text]
```

**Implementation**:
- Add `required` prop to ChipGroup
- Red border for empty required fields
- Prevent commit if required fields missing
- Show error message: "3 images missing required metadata"

#### **1.4 Metadata Preview in Gallery** (Medium Priority)
**Problem**: Must expand card to see metadata  
**Solution**: Show key metadata on card at all times

**Current card**:
```
┌─────────┐
│  Image  │  [Only shows laterality chip]
└─────────┘
```

**Improved card**:
```
┌─────────────────┐
│     Image       │
│  [L] [Forearm]  │  ← Laterality + Body Site always visible
│  [Close-up]     │  ← View if set
└─────────────────┘
```

---

## ✏️ Priority 2: Image Editor Implementation

### **Current State:**
- ❌ No editing capability
- ⚠️ PRD specifies: crop, rotate, arrow annotation
- ⚠️ PRD specifies: "Save as new" for committed images (non-destructive)

### **Improvements:**

#### **2.1 Image Editor Modal** (High Priority)
**Trigger**: Click "Edit" button on image card

**Design**:
```
┌─────────────────────────────────────────────────┐
│  Edit Image                              [×]    │
├─────────────────────────────────────────────────┤
│  [<] [>] Rotate    [Crop]    [↗ Arrow]  [○]    │ ← Toolbar
├─────────────────────────────────────────────────┤
│                                                  │
│            [ Image Canvas ]                      │
│                                                  │
├─────────────────────────────────────────────────┤
│  [Cancel]  [Save as New]  [Replace Original]    │
└─────────────────────────────────────────────────┘
```

**Features**:
- Rotate: 90° CW/CCW buttons
- Crop: Drag handles to select area
- Arrow: Click start → drag → release (draws red arrow)
- Circle: Click center → drag radius (draws red circle)
- Undo/Redo: Step backward/forward through edits

**Libraries to consider**:
- `react-easy-crop` — Crop with zoom/pan
- `fabric.js` or `konva` — Canvas annotations (arrows, circles)
- Or build custom with HTML Canvas API

#### **2.2 Non-Destructive Editing** (High Priority)
**PRD Requirement**: Edited copies don't replace original

**Workflow**:
```
Original Image (committed)
  ↓ [Edit]
Editor Modal
  ↓ [Save as New]
New Image (uncommitted) + Original (still committed)
  ↓ [Commit Dialog]
[×] Include original  ← Option to commit both
```

**Implementation**:
- Store: `derivedFromImageId` field
- New image references original
- Original remains in gallery (grayed out unless "Include original" checked)
- On commit: Send `derivedFromDocumentReferenceId` to backend

#### **2.3 Edit Controls** (Medium Priority)
**Undo/Redo Stack**:
```typescript
interface EditAction {
  type: 'rotate' | 'crop' | 'arrow' | 'circle';
  data: any; // Action-specific data
}

const [history, setHistory] = useState<EditAction[]>([]);
const [currentIndex, setCurrentIndex] = useState(-1);
```

**Preview**:
- Show "Original" vs "Edited" toggle
- Side-by-side comparison option

---

## ✅ Priority 3: Commit Flow Polish

### **Current State:**
- ✅ Commit dialog exists
- ✅ Shows inbox/task options
- ⚠️ No validation before commit
- ⚠️ No progress indicator
- ⚠️ Basic success handling

### **Improvements:**

#### **3.1 Pre-Commit Validation** (High Priority)
**Check before opening dialog**:
```typescript
const errors = validateImages(imagesToCommit);

if (errors.length > 0) {
  showValidationModal({
    errors: [
      "3 images missing laterality",
      "1 image missing body site",
      "2 images over 1MB (compress failed)"
    ],
    canProceed: false
  });
  return;
}
```

#### **3.2 Better Preview** (High Priority)
**Show summary in dialog**:
```
Committing 5 images:
┌──────────────────────────────────────┐
│ [thumb] Left forearm, Lesion         │
│ [thumb] Right hand, Rash             │
│ [thumb] Left leg, Wound              │
│ [thumb] Bilateral trunk, Close-up    │
│ [thumb] Face, Infection              │
└──────────────────────────────────────┘

Metadata summary:
• Laterality: Left (2), Right (1), Bilateral (1)
• Body sites: Forearm, Hand, Leg, Trunk, Face
• Views: Close-up (3), Dermoscopy (2)
```

#### **3.3 Upload Progress** (High Priority)
**Show progress during commit**:
```
Committing images...

[████████████░░░░░░░░] 60% (3 of 5)

✓ Compressing images...
✓ Uploading metadata...
⏳ Committing to encounter...
```

#### **3.4 Success Confirmation** (Medium Priority)
**After commit**:
```
✓ Successfully committed 5 images

DocumentReference IDs:
• dr-abc123 (Left forearm, Lesion)
• dr-def456 (Right hand, Rash)
...

✓ Sent to inbox: Dr Mock Smith
✓ Created task: Nurse Mock Lee (Due: 2025-11-01)

[View in Medtech]  [Done]
```

---

## 🚨 Priority 4: Error Handling

### **Current State:**
- ⚠️ Errors logged to console
- ⚠️ Some errors show in banner at top
- ⚠️ No field-level validation feedback

### **Improvements:**

#### **4.1 Visual Error Feedback** (High Priority)
**File upload errors**:
```
[!] Failed to compress 2 images:
• IMG_1234.jpg (file too large - 5MB)
• IMG_5678.heic (unsupported format)

[Retry]  [Skip these files]
```

**Commit errors**:
```
[!] Failed to commit 1 of 3 images:
• IMG_1234.jpg: Missing required field "laterality"

Fix this image and try again.

[Fix Now]  [Commit Others]
```

#### **4.2 Field-Level Validation** (Medium Priority)
**Show errors inline**:
```
Laterality * [___________________]
❌ Laterality is required
```

#### **4.3 Retry Mechanisms** (Medium Priority)
**For transient failures**:
```
[!] Network error - commit failed

[Retry Now]  [Save for Later]
```

---

## 📊 Priority 5: Gallery Improvements

### **Current State:**
- ✅ Grid layout works
- ✅ Selection works
- ⚠️ No sorting
- ⚠️ No filtering
- ⚠️ No search

### **Improvements:**

#### **5.1 Sort Options** (Medium Priority)
```
Sort by: [Most recent ▼]
  • Most recent
  • Oldest first
  • Status (pending first)
  • Body site (A-Z)
```

#### **5.2 Filter Options** (Medium Priority)
```
Filter: [All images ▼]
  • All images (23)
  • Committed (10)
  • Pending (13)
  • Has errors (0)
  
[×] Left only (5)
[×] Right only (8)
[×] Bilateral (2)
```

#### **5.3 Search** (Low Priority)
```
[🔍 Search labels...] 
  → Filters by image label field
```

#### **5.4 Keyboard Navigation** (Low Priority)
```
Arrow keys: Navigate between images
Space: Select/deselect
Enter: Open edit/commit
Esc: Close modal
```

---

## 📱 Priority 6: Mobile Flow Enhancement

### **Current State:**
- ✅ Basic camera capture works
- ✅ Gallery upload works
- ⚠️ No per-image metadata
- ⚠️ No real-time sync indicator

### **Improvements:**

#### **6.1 Per-Image Metadata** (Medium Priority)
**After capture, before upload**:
```
Review image 1 of 3:
┌─────────────┐
│   [Image]   │
└─────────────┘

Laterality: [Left] [Right] [Bilateral] [N/A]
Body site:  [Forearm ▼]

[< Previous]  [Next >]  [Skip]
```

#### **6.2 Real-Time Sync** (Low Priority)
**Desktop shows when mobile uploads**:
```
[📱 Mobile uploading...] 2 images received
```

**Mobile shows confirmation**:
```
✓ Uploaded 3 images
  Desktop will show them shortly.
  
[Capture More]  [Done]
```

---

## 🗺️ Recommended Implementation Order

### **Week 1: Core UX (High Priority)**
1. ✅ Body site autocomplete
2. ✅ Bulk metadata application
3. ✅ Required field validation
4. ✅ Commit flow validation & progress

### **Week 2: Image Editor**
5. ✅ Editor modal (crop, rotate)
6. ✅ Annotation tools (arrow, circle)
7. ✅ Non-destructive editing workflow

### **Week 3: Polish**
8. ✅ Error handling improvements
9. ✅ Gallery sort/filter
10. ✅ Success confirmations

### **Week 4: Mobile & Accessibility** (If time)
11. Mobile per-image metadata
12. Keyboard shortcuts
13. Screen reader support

---

## 📋 Success Criteria

**Before moving to backend integration:**
- [ ] Metadata can be applied to multiple images at once
- [ ] Body site search works beyond predefined chips
- [ ] Required fields are validated before commit
- [ ] Images can be edited (crop, rotate, annotate)
- [ ] Edited images are saved as new (non-destructive)
- [ ] Upload progress is visible during commit
- [ ] Errors are shown clearly with actionable feedback
- [ ] Gallery can be sorted by status/date
- [ ] Success confirmation shows DocumentReference IDs

**Nice to have:**
- [ ] Gallery can be filtered by laterality/body site
- [ ] Keyboard navigation works
- [ ] Mobile has per-image metadata
- [ ] Real-time sync shows upload status

---

## 🔄 After Frontend Polish

### **Next: Backend Integration** (Awaiting Medtech)
1. Replace mock API with real ALEX calls
2. Map metadata to FHIR extensions
3. Test OAuth token caching
4. Handle real API errors

### **Then: End-to-End Testing**
1. Test full commit flow
2. Verify images in Medtech UI
3. Test widget launch mechanism
4. Mobile-desktop sync testing

---

**Current Status**: Widget works with mock backend. Ready to polish UX before backend integration.

**Timeline**: 2-3 weeks of frontend work → Backend integration when unblocked
