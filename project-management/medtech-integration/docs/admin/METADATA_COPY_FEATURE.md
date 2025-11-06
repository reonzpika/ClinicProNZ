# Metadata Copy Feature - Implementation Summary

**Date**: 2025-10-31  
**Status**: ✅ Complete & Deployed  
**Commit**: `5d1a4308`

---

## 🎯 Problem Solved

**User Issue**: When editing multiple similar images (e.g., 5 photos of same forearm lesion), GPs had to manually click the same chips (Laterality, Body Site, View, Type) for each image. This was repetitive and time-consuming.

**Solution**: Add "Apply to Other Images" functionality with two paths:
1. **Fast path**: Apply to all invalid images (one click)
2. **Selective path**: Choose specific images via modal

---

## 📐 Implementation (Option C)

### **Visual Layout**

```
Body Site *
[Forearm ▼] [Other...]

[✓ Apply to 3 Invalid]  Choose Images...
 ↑ Primary button        ↑ Link style
```

**Two buttons appear when**:
- Laterality AND Body Site are both selected for current image

**Button 1 - "Apply to X Invalid"**:
- Primary style (solid button)
- Shows count of invalid images
- Hides if no invalid images exist
- One-click apply to all invalid images

**Button 2 - "Choose Images..."**:
- Link style (underlined text)
- Always visible when L+BS selected
- Opens modal for selective apply

---

## 🖼️ Modal Features

```
┌──────────────────────────────────────────────────────┐
│ Apply Metadata to Images                         [×] │
├──────────────────────────────────────────────────────┤
│ Select which images to apply this metadata to:      │
│                                                      │
│ Copying from: IMG_003.jpg                           │
│ • Laterality: Left                                  │
│ • Body Site: Forearm                                │
│ • View: Close-up                                    │
│ • Type: Lesion                                      │
│                                                      │
│ ┌─────────────────────────────────────────────┐    │
│ │  ☑  [img1]         ☑  [img2]                │    │
│ │  🔴 IMG_001.jpg    🔴 IMG_002.jpg            │    │
│ │                                              │    │
│ │  ☐  [img4]         ☐  [img5]                │    │
│ │  ✅ IMG_004.jpg    IMG_005.jpg               │    │
│ │  (committed)       (already valid)           │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ 2 images selected                                   │
│                                                      │
│               [Cancel]  [Apply to 2 Images]         │
└──────────────────────────────────────────────────────┘
```

**Modal Features**:
- 2-column grid of image thumbnails
- Checkboxes for selection
- Status badges: 🔴 Invalid | ✅ Committed | No badge = Valid
- Metadata summary showing what will be copied
- Pre-selects all invalid images by default
- Dynamic button text: "Apply to X Images"
- Selected count display

---

## 🔧 Technical Implementation

### **1. New Component: `ApplyMetadataModal.tsx`**

**Location**: `src/medtech/images-widget/components/desktop/ApplyMetadataModal.tsx`

**Props**:
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close handler
- `sourceImage: WidgetImage` - Image to copy from
- `availableImages: WidgetImage[]` - All session images
- `onApply: (targetIds: string[]) => void` - Apply callback

**Logic**:
- Filters out source image from selection
- Pre-selects invalid images (`!laterality || !bodySite`)
- Shows metadata summary from source
- Handles checkbox toggling
- Passes selected IDs to parent

---

### **2. Store Action: `applyMetadataToImages`**

**Location**: `src/medtech/images-widget/stores/imageWidgetStore.ts`

**Signature**:
```typescript
applyMetadataToImages: (sourceId: string, targetIds: string[]) => void;
```

**What it copies**:
```typescript
{
  laterality: sourceImage.metadata.laterality,
  bodySite: sourceImage.metadata.bodySite,
  view: sourceImage.metadata.view,
  type: sourceImage.metadata.type,
}
```

**NOT copied**: `label` (image-specific)

**Logic**:
1. Find source image by ID
2. Extract metadata fields
3. Apply to all target images
4. Merge with existing metadata (preserves label)

---

### **3. Updated Component: `MetadataForm.tsx`**

**New state**:
```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
```

**New logic**:
```typescript
// Calculate invalid images
const invalidImages = sessionImages.filter((img) => {
  if (img.id === image.id) return false; // Not self
  return (!img.metadata.laterality || !img.metadata.bodySite) 
    && img.status !== 'committed';
});

// Show buttons when L+BS selected
const canApply = hasLaterality && hasBodySite;
```

**Two handlers**:
1. `handleApplyToInvalid()` - Quick apply to all invalid
2. `handleChooseImages()` - Open modal for selective apply

---

## 📊 User Flows

### **Flow 1: Quick Apply (Common Case)**

```
1. Upload 5 similar images (all 🔴 invalid)
2. Select IMG_001
3. Pick: Left + Forearm + Close-up + Lesion
4. Click "Apply to 4 Invalid"
5. ✓ All 5 images now have same metadata
6. Optional: Edit labels individually
7. Click "Commit All 5 Images"
```

**Time saved**: 4 images × 4 clicks = 16 clicks reduced to 1 click

---

### **Flow 2: Selective Apply (Edge Case)**

```
1. Upload 5 images: 3 forearm, 2 back
2. Select IMG_001 (forearm)
3. Pick: Left + Forearm + Close-up + Lesion
4. Click "Choose Images..."
5. Modal opens with all images pre-checked
6. Uncheck IMG_004 and IMG_005 (back images)
7. Click "Apply to 2 Images"
8. Modal closes
9. Select IMG_004 (back)
10. Pick: Right + Back + Wide View + Rash
11. Click "Apply to 1 Invalid"
12. ✓ All images have correct metadata
```

---

## 🎨 UI/UX Details

### **Button Styling**

**Primary** ("Apply to X Invalid"):
```tsx
<Button variant="default" size="sm">
  <CheckCheck className="mr-2 size-4" />
  Apply to {invalidImages.length} Invalid
</Button>
```
- Solid purple background
- White text
- CheckCheck icon
- Only shows when invalid images exist

**Link** ("Choose Images..."):
```tsx
<Button variant="link" size="sm">
  <ImagePlus className="mr-2 size-4" />
  Choose Images...
</Button>
```
- No background
- Underline on hover
- Purple text
- ImagePlus icon
- Always visible when L+BS selected

---

### **Button Placement**

Below "Body Site" chips:
```
Body Site *
[Forearm ▼] [Other...]

─────────────────────────────  ← Border separator
[✓ Apply to 3 Invalid]  Choose Images...
```

**Spacing**:
- `mt-6`: 24px top margin
- `border-t`: Top border for visual separation
- `pt-4`: 16px padding top
- `gap-3`: 12px gap between buttons

---

## ✅ Testing Checklist

- [x] Buttons appear when Laterality + Body Site selected
- [x] "Apply to Invalid" button shows correct count
- [x] "Apply to Invalid" button hides when 0 invalid
- [x] "Choose Images..." always visible when L+BS selected
- [x] Modal opens on "Choose Images..." click
- [x] Modal pre-selects invalid images
- [x] Modal shows source metadata summary
- [x] Modal displays thumbnails with status badges
- [x] Checkboxes toggle correctly
- [x] Selected count updates in modal
- [x] Apply button disabled when 0 selected
- [x] Apply copies L+BS+V+T (not Label)
- [x] Modal closes after apply
- [x] Target images update immediately
- [x] Red badges clear when metadata complete
- [x] No console errors
- [x] Compiles successfully

---

## 🔮 Future Enhancements

**Phase 2 (Not Implemented Yet)**:
1. **Toast notifications** instead of console.log
2. **Undo functionality** for accidental applies
3. **Bulk label templating** (e.g., "Lesion 1", "Lesion 2", ...)
4. **Apply on navigation** (prompt: "Apply to remaining 3 images?")
5. **Smart suggestions** ("These 3 images look similar, apply metadata?")

---

## 📄 Files Modified

1. **`src/medtech/images-widget/components/desktop/ApplyMetadataModal.tsx`** (NEW)
   - 187 lines
   - Modal component with image selection grid

2. **`src/medtech/images-widget/components/desktop/MetadataForm.tsx`**
   - Added state, handlers, and two buttons
   - +40 lines

3. **`src/medtech/images-widget/stores/imageWidgetStore.ts`**
   - Added `applyMetadataToImages` action
   - +20 lines

**Total**: ~250 lines added

---

## 🎯 Impact

**Before**:
- 5 images × 4 clicks per image = 20 clicks
- Time: ~2-3 minutes

**After (quick apply)**:
- Fill 1 image (4 clicks) + Apply (1 click) = 5 clicks
- Time: ~30 seconds

**Time saved**: ~75% for batches of similar images

---

**Feature complete and ready for production!** 🚀
