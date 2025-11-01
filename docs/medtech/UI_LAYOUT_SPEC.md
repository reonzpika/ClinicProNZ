# Medtech Images Widget - UI Layout Specification

**Date**: 2025-10-31  
**Layout**: Option B - Compact Gallery + Detail Pane  
**Rationale**: 4-10 images per session; focus on metadata entry workflow

---

## 🎨 Final Layout (Option B)

```
┌────────────────────────────────────────────────────────────┐
│  [Upload] [Camera]  |  [QR]  [Commit 5]          [MOCK]   │ ← Compact top bar
├────────────────────────────────────────────────────────────┤
│  QR Code Panel (collapsible, when [QR] clicked)           │ ← Optional
├────────────────────────────────────────────────────────────┤
│  Thumbnails:                                               │
│  [img1] [img2] [img3*] [img4] [img5]  • 5 images, 3 ready │ ← Horizontal strip
├──────────────────────────────┬─────────────────────────────┤
│                              │  Metadata                   │
│   Large Image Preview        │  ─────────────              │
│                              │  Laterality *               │
│   (Image 3 of 5)             │  [Left] [Right] [Bilateral] │
│                              │                             │
│                              │  Body Site *                │
│                              │  [Forearm ▼]                │
│   [< Prev]  [Edit]  [Next >]│                             │
│                              │  View                       │
│   Zoom: [−] 100% [+] [Reset] │  [Close-up] [Dermoscopy]   │
│                              │                             │
│                              │  Type                       │
│                              │  [Lesion] [Rash] [Wound]    │
│                              │                             │
│                              │  Label                      │
│                              │  [____________]             │
│                              │                             │
│                              │  ✓ Metadata complete        │
└──────────────────────────────┴─────────────────────────────┘
  Image Preview (60%)            Metadata Form (40%)
```

**Dimensions**:
- Top bar: 60px height
- Thumbnail strip: 140px height (120px thumbs + padding)
- Main content: Remaining height split 60/40

---

## 📋 Component Breakdown

### **1. Top Bar** (Always visible)

**Left side**:
- Upload button
- Camera button
- Separator line
- QR button (toggle)

**Right side**:
- Status counter ("5 images, 3 ready")
- Select All / Clear button
- Commit button (when images selected)
- Mock mode badge

**Design notes**:
- No patient info (Medtech provides)
- No ClinicPro branding
- Compact, single line
- Actions only

---

### **2. QR Panel** (Collapsible)

**When visible** (after clicking QR button):
- Horizontal layout (to minimize vertical space)
- QR code (200x200px) on left
- Instructions + countdown on right
- Close/collapse button

**When hidden**:
- Collapsed, just "Show QR" button in top bar

---

### **3. Thumbnail Strip** (Always visible)

**Features**:
- Horizontal scrollable (for >8 images)
- 120x120px thumbnails
- Current image highlighted (purple border + ring)
- Selection checkbox (top-left corner)
- Status badge (bottom-right: dot for pending, check for committed)
- Tiny metadata indicators (bottom-left: "L" for Left, "For" for Forearm)
- Remove button (X, on hover)
- Count display ("5 images, 3 ready")

**States**:
- Empty: "No images uploaded yet" placeholder
- 1-8 images: All visible, no scroll
- 9+ images: Scroll horizontally

---

### **4. Image Preview** (Left, 60%)

**Features**:
- Large image display (max-height, centered)
- Zoom controls (zoom in, zoom out, reset, percentage display)
- Navigation arrows (Previous, Next)
- Edit button
- Image info (filename, size, label) at bottom

**States**:
- No image: Empty state with icon
- Image selected: Show with controls
- Zoomed: Image scales, can pan (future enhancement)

---

### **5. Metadata Form** (Right, 40%)

**Layout**:
```
┌─────────────────────────────┐
│ Image Metadata              │ ← Header
├─────────────────────────────┤
│                             │
│ Laterality * [required]     │
│ [Left] [Right] [Bilateral]  │
│                             │
│ Body Site * [required]      │
│ [Forearm ▼]                 │
│                             │
│ View                        │
│ [Close-up] [Dermoscopy]     │
│                             │
│ Type                        │
│ [Lesion] [Rash] [Wound]     │
│                             │
│ Label                       │
│ [_____________________]     │
│                             │
├─────────────────────────────┤
│ ✓ Metadata complete         │ ← Footer status
└─────────────────────────────┘
```

**Features**:
- Header: "Image Metadata" + required fields note
- Scrollable content area (if many fields)
- Footer: Validation status
  - Green check: All required fields filled
  - Orange warning: Missing required fields (list them)

---

## 🎯 Key Features (vs Old Layout)

### **Old Layout** (Gallery-centric):
- ❌ Large gallery area (wasted space for 4-10 images)
- ❌ Metadata hidden in expandable cards
- ❌ Patient header (redundant with Medtech)
- ❌ Sidebar panels (too many sections)

### **New Layout** (Focus on workflow):
- ✅ Compact horizontal gallery (perfect for 4-10 images)
- ✅ Large preview + metadata side-by-side (main workflow)
- ✅ No patient header (Medtech provides)
- ✅ Simple, clean, focused
- ✅ Easy navigation (Prev/Next buttons)
- ✅ Visual feedback (metadata complete status)

---

## 🔄 User Workflow

**1. Upload images** (Top bar: Upload/Camera)
```
Click Upload → Select 5 images → Auto-compress → Appear in thumbnail strip
```

**2. Add metadata** (Navigate through images)
```
Image 1 auto-selected → Add laterality + body site → Click "Next →"
Image 2 selected → Add metadata → Click "Next →"
... repeat for all images
```

**3. Review**
```
Scroll thumbnail strip → Check all have metadata
Status shows: "5 images, 5 ready"
```

**4. Commit**
```
Click "Select All" → Click "Commit 5" → Configure inbox/task → Confirm
```

**5. Success**
```
Thumbnails show green "Committed" badges
Can continue with more images or close widget
```

---

## 🎨 Visual Design Principles

### **Colors**:
- **Purple/Indigo** — Primary actions (Commit, current image highlight)
- **Orange** — Pending/incomplete states
- **Green** — Success/completed states
- **Red** — Errors, remove actions
- **Gray** — Neutral, disabled states

### **Spacing**:
- Top bar: `py-3` (12px vertical padding)
- Thumbnail strip: `py-4` (16px vertical padding)
- Main content: `p-6` (24px padding)
- Gap between preview/metadata: `gap-6` (24px)

### **Typography**:
- Headers: `font-semibold text-slate-900`
- Body text: `text-sm text-slate-600`
- Small text: `text-xs text-slate-500`
- Required field labels: `text-xs font-medium text-slate-700` + asterisk

### **Borders**:
- Cards: `border border-slate-200 rounded-lg`
- Current image: `border-2 border-purple-500 ring-2 ring-purple-200`
- Dashed (empty states): `border-2 border-dashed border-slate-300`

---

## 🖼️ Component Dimensions

### **Thumbnail Strip**:
- Container height: `140px` (120px thumbs + 20px padding)
- Thumbnail size: `120x120px`
- Gap between thumbs: `8px`
- Horizontal scroll if needed

### **Main Content Split**:
- Image preview: `flex-[3]` (60% width)
- Metadata form: `flex-[2]` (40% width)
- Gap: `24px`

### **QR Panel** (when expanded):
- Height: `auto` (collapses when hidden)
- QR code: `200x200px`
- Horizontal layout to minimize height

---

## 📱 Responsive Behavior

### **Desktop (≥1024px)** — Full layout
```
[Top Bar]
[Thumbnails]
[Preview 60% | Metadata 40%]
```

### **Tablet (768-1023px)** — Stacked
```
[Top Bar]
[Thumbnails]
[Preview 100%]
[Metadata 100%] ← Stacked below
```

### **Mobile (<768px)** — Redirect to mobile flow
```
Redirect to /medtech-images/mobile
(Mobile-optimized capture flow)
```

---

## 🎯 Success Criteria

**Layout must:**
- ✅ No patient header (Medtech provides context)
- ✅ Compact gallery (4-10 images fit without scroll)
- ✅ Focus on current image + metadata
- ✅ Easy navigation (Previous/Next)
- ✅ Clear visual feedback (status badges, validation)
- ✅ Single-purpose: Add metadata and commit

**User should be able to:**
- ✅ Upload 5 images in <1 minute
- ✅ Add metadata to all 5 in <5 minutes (1 min per image)
- ✅ Review and commit in <1 minute
- ✅ Total workflow: <7 minutes for 5 images

---

## 🚀 Next Enhancements

After basic layout is working:

1. **Bulk metadata** — Apply to multiple images at once
2. **Keyboard shortcuts** — Arrow keys to navigate, Space to select
3. **Drag & drop zone** — Full-page drop zone overlay
4. **Better validation** — Real-time feedback, prevent commit if incomplete
5. **Image editor** — Crop, rotate, annotate modal

---

**Status**: ✅ Layout redesigned and implemented (2025-10-31)  
**Next**: Test the new layout, refine spacing/colors, add remaining features
