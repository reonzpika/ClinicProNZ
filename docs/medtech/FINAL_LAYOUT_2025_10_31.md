# Final Layout Specification - Medtech Images Widget

**Date**: 2025-10-31 (Final)  
**Status**: ✅ Complete & Deployed

---

## 🎨 Final Layout (Top-Heavy Design)

```
┌──────────────────────────────────────────────────────────────┐
│  [🔴][🔴][✅]           [Upload] [QR]              [MOCK]   │ ← Action panel
│  (Thumbnails left)     ☐ Inbox  ☐ Task  [Commit All 2]     │ ← (2 lines, right)
├──────────────────────────────────────────────────────────────┤
│  [Error Banner] (optional)                                   │
├──────────────────────────────────────────────────────────────┤
│  [QR Code Panel] (collapsible)                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  [< Prev] [Next] [Edit]    Zoom: [−] 100% [+] [Reset]       │
│  ┌───────────────┐                                           │
│  │               │  Metadata Form (70%)                      │
│  │   Preview     │  ────────────────                         │
│  │    (30%)      │  Laterality *                             │
│  │               │  [Left] [Right] [Bilateral] [N/A]        │
│  │               │                                           │
│  │               │  Body Site *                              │
│  └───────────────┘  [Forearm ▼] [Other...]                  │
│  filename • size                                              │
│                     View                                      │
│                     [Close-up] [Dermoscopy] [Other]          │
│                                                               │
│                     Type                                      │
│                     [Lesion] [Rash] [Wound] [Other]          │
│                                                               │
│                     Label                                     │
│                     [_________________________]              │
│                                                               │
│                     ✓ Metadata complete                       │
└───────────────────────────────────────────────────────────────┘
```

---

## 📐 Layout Sections

### **Top Section (Single row with 2-line action panel)**

**Layout**:
```
[Thumbnails (left, scrollable)]  |  [Upload] [QR] [MOCK]     ← Line 1
                                 |  ☐ Inbox  ☐ Task  [Commit] ← Line 2
```

**Left side**: Horizontal thumbnail strip
- 120x120px per thumbnail
- Scrollable horizontally
- Badge system (🔴 invalid, ✅ committed, no badge = valid)

**Right side**: 2-line action panel
- **Line 1**: Upload button + QR toggle + Mock badge
- **Line 2**: Inbox checkbox + Task checkbox + Commit button
- Compact vertical stack (gap: 8px)

**Height**: ~140px total (based on thumbnail height + padding)

---

### **Middle Section** - Optional Banners

**Error Banner** (only when error exists):
- Red background
- Dismiss button
- ~50px height

**QR Panel** (only when QR toggled):
- QR code + instructions
- Collapsible
- ~200px height when open

---

### **Main Content** - Preview + Metadata

**Image Preview (30%)**:
```
[< Prev] [Next] [Edit]    Zoom: [−] 100% [+] [Reset]  ← Controls at TOP
┌─────────────────────────────────────────────────┐
│                                                 │
│              [Image Display]                    │
│                                                 │
└─────────────────────────────────────────────────┘
filename • size • label                           ← Info at BOTTOM
```

**Metadata Form (70%)**:
```
Image Metadata
Fields marked with * are required

Laterality *
[Left] [Right] [Bilateral] [Not Applicable]

Body Site *
[Forearm ▼] [Other...]

View
[Close-up] [Dermoscopy] [Wide View] [Other]

Type
[Lesion] [Rash] [Wound] [Infection] [Other]

Label (optional)
[_________________________________]

✓ Metadata complete    OR    ⚠️ Missing: Laterality, Body Site
```

---

## 🎯 Key Design Decisions

### **1. Top-Heavy Layout with 2-Line Action Panel**
**Why**: All actions grouped in one compact area, accessible without scrolling

**Benefits**:
- ✅ Upload + commit controls always visible
- ✅ Thumbnails at top for quick overview
- ✅ Compact 2-line panel saves vertical space
- ✅ No camera button (desktop doesn't need it)

---

### **2. No Selection Needed**
**Why**: Commit all uncommitted images automatically

**Badge system**:
- 🔴 **Red** = Invalid (missing required metadata) → Blocks commit
- ✅ **Green** = Committed → Won't be re-committed
- **No badge** = Valid, ready to commit

**Commit button logic**:
- Disabled when any red badges visible
- Shows count: "Commit All 3 Images"
- During commit: "Committing 3 images..."

---

### **3. Image Controls at Top**
**Why**: Faster access, clearer visual hierarchy

**Controls grouped logically**:
- **Left**: Navigation (Prev, Next, Edit)
- **Right**: Zoom controls

**Info at bottom**: Filename, size, label (read-only context)

---

### **4. Metadata Gets 70% Width**
**Why**: Metadata entry is the main bottleneck (1-2 min per image)

**Preview at 30%**:
- Still large enough to verify image quality
- Zoom controls available for detail inspection
- Optimized for metadata workflow

---

## 🔄 User Workflow (Final)

```
1. Upload images → Thumbnails appear at top with 🔴 badges
2. Click thumbnail → Preview + metadata form appear
3. Fill metadata → 🔴 badge disappears
4. Navigate with Prev/Next → Repeat for all images
5. Optional: Check ☐ Inbox or ☐ Task
6. Click "Commit All" → Modal (if inbox/task) → Auto-commit
7. Button shows progress: "Committing X images..."
8. Success → ✅ green badges on thumbnails
```

**Fast path** (no inbox/task):
```
Upload → Metadata → Commit → Done (2 clicks after metadata)
```

**With inbox/task**:
```
Upload → Metadata → Check Inbox → Commit → Fill details → Done → Auto-commit
```

---

## 📊 Dimensions

### **Top Section**:
- Row 1 (Thumbnails): ~140px height
- Row 2 (Actions): ~50px height
- **Total**: ~190px

### **Optional Sections**:
- Error banner: ~50px (when visible)
- QR panel: ~200px (when expanded)

### **Main Content**:
- Image preview: `flex-[3]` (30% width)
- Metadata form: `flex-[7]` (70% width)
- Gap: 24px

### **Image Preview Components**:
- Controls bar: ~40px height
- Image display: Remaining height (flex-1)
- Info bar: ~24px height

---

## ✅ Implementation Complete

**Files modified**:
- `app/(integration)/medtech-images/page.tsx` — Layout restructure
- `src/medtech/images-widget/components/desktop/ImagePreview.tsx` — Controls moved to top

**Changes committed**: `1c274ac7`

**Status**: ✅ Ready to deploy and test

---

## 🧪 Test Checklist

- [ ] Thumbnails visible at top (Row 1)
- [ ] Upload/Camera/QR buttons on right of thumbnails (Row 1)
- [ ] Inbox/Task/Commit on Row 2 (right-aligned)
- [ ] Image Prev/Next/Edit/Zoom controls at TOP of preview
- [ ] Metadata form takes 70% width
- [ ] Red badges on invalid images
- [ ] Commit button disabled when red badges present
- [ ] Modal only shows when inbox/task checked
- [ ] Progress shows inline on commit button

---

**Final layout is top-heavy, action-focused, and optimized for fast metadata entry workflow.**
