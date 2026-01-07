# Mobile UI Specification

**Feature**: Clinical Images Widget - Mobile Capture  
**Last Updated**: 2025-12-09  
**Version**: 1.0.0  
**Status**: Ready for Implementation

---

## Overview

Mobile interface for capturing clinical images via phone camera or gallery. Images are uploaded to temporary storage (S3) with optional metadata, then either sent to desktop for review or committed directly to Medtech.

---

## Architecture Context

**Session Scope**: Per patient (1 hour expiry from last activity)  
**Storage**: Redis (session metadata) + S3 (temporary images)  
**Real-Time Sync**: Ably (mobile → desktop notifications)  
**Commit Paths**: 
- Default: Upload to S3 → Desktop review → Commit to Medtech
- Optional: Upload to S3 → Direct commit to Medtech

---

## User Flow Summary

```
Screen 1: Landing (Patient Context)
   ↓
   ├→ Camera → Capture → Screen 3A (Single Review)
   │                        ↓
   │                        ├→ Retake → Camera
   │                        ├→ Take More → Camera → Screen 3A (next)
   │                        └→ Done → Screen 3
   │
   └→ Gallery → Select → Screen 3 (directly)

Screen 3: Review Grid
   ↓
   ├→ Tap "Details ▼" → Expand bulk metadata section
   ├→ Tap image → Screen 4 (individual metadata)
   ├→ + Add more → Camera → Screen 3A
   └→ Upload button ▼
       ├→ Main: Screen 5 (desktop review) → Screen 6A
       └→ Dropdown: Confirm → Screen 5 (commit) → Screen 6B

Screen 6A/6B: Success
   ↓
   ├→ Capture More → Screen 1
   └→ Done → End
```

---

## Screen Specifications

### Screen 1: Landing / Patient Context

**URL**: `/medtech-images/mobile?s={sessionId}`

**Purpose**: Validate session, display patient context, provide capture options

**Layout**:
```
┌─────────────────────────────────┐
│  ClinicPro Images               │
│  Mobile Capture                 │
├─────────────────────────────────┤
│                                 │
│  📋 Patient Context             │
│                                 │
│  ┌───────────────────────────┐ │
│  │  👤 John Smith            │ │
│  │     NHI: ABC1234          │ │
│  │     DOB: 15 Jan 1980      │ │
│  └───────────────────────────┘ │
│                                 │
│                                 │
│  [   📷 Open Camera    ]        │
│                                 │
│  [   📁 Choose Photos  ]        │
│                                 │
│                                 │
│                                 │
│                                 │
└─────────────────────────────────┘
```

**Elements**:
- Header: "ClinicPro Images" + "Mobile Capture" subtitle
- Patient card (white background, border, padding)
  - Patient icon
  - Name (bold)
  - NHI (if available)
  - DOB (if available)
- "Open Camera" button (primary, full width, camera icon)
- "Choose Photos" button (secondary, full width, gallery icon)

**Interactions**:
- **Open Camera**: Opens native camera (single photo) → Screen 3A after capture
- **Choose Photos**: Opens native gallery (multiple select) → Screen 3 after selection

**States**:
- **Loading**: Shows spinner + "Loading session..."
- **Invalid Session**: Shows error card "Session expired, scan QR again"
- **Active**: Shows patient info + capture buttons

**API Calls**:
- `GET /api/medtech/session/{sessionId}` - Fetch patient context
  - Returns: `{ patientId, patientName, patientNHI, patientDOB, encounterId, facilityId }`

**Validation**:
- If sessionId missing from URL → Show error
- If session expired → Show error with "scan QR again" message
- If patient context missing → Show generic error

---

### Screen 2A: Camera Capture

**Trigger**: Native camera via `<input type="file" accept="image/*" capture="environment">`

**Behavior**:
- Opens device camera app
- GP takes 1 photo
- After capture → Automatically goes to Screen 3A

**No UI** (native camera handles this)

---

### Screen 2B: Gallery Selection

**Trigger**: Native gallery via `<input type="file" accept="image/*" multiple>`

**Behavior**:
- Opens device gallery/photos app
- GP selects 1+ photos
- After selection → Automatically goes to Screen 3

**No UI** (native gallery handles this)

---

### Screen 3A: Single Image Review (NEW)

**Purpose**: Immediate review after camera capture, quick accept/reject with optional metadata

**Layout**:
```
┌─────────────────────────────────┐
│  ✗                     Image 1  │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │                         │   │
│  │                         │   │
│  │   [Full image preview]  │   │
│  │                         │   │
│  │                         │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Laterality (optional):         │
│  [ Left ]  [ Right ]  [ N/A ]   │
│    ○          ○          ○      │
│                                 │
│  Body Site / Comment (optional):│
│  ┌─────────────────────────┐   │
│  │ e.g., Left forearm      │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  [ 🔄 Retake ]  [ ➕ Take More ] │
│                                 │
│  [      ✓ Done (1)      ]       │
└─────────────────────────────────┘
```

**Elements**:

**Header**:
- ✗ button (top-left): Cancel/discard, return to Screen 1
- "Image 1" text (top-right)

**Image Preview**:
- Full-width image display
- Max height: 60% of screen
- Object-fit: contain

**Laterality Toggle** (optional):
- Label: "Laterality (optional)"
- Three buttons: Left / Right / N/A
- Single select (radio behavior)
- Can tap again to deselect
- Default: None selected

**Body Site / Comment Field** (optional):
- Label: "Body Site / Comment (optional)"
- Text input
- Placeholder: "e.g., Left forearm"
- Mobile keyboard appears on focus

**Action Buttons**:
- **Retake** (secondary, left):
  - Icon: 🔄
  - Discards image
  - Opens camera again
- **Take More** (secondary, right):
  - Icon: ➕
  - Saves image with metadata (if entered)
  - Opens camera for next photo
  - Counter increments (Image 2, Image 3, etc.)
- **Done (1)** (primary, full width):
  - Icon: ✓
  - Shows count: "Done (1)"
  - Saves image with metadata (if entered)
  - Goes to Screen 3 (Review Grid)

**Data Handling**:
- Compress image client-side (target <1MB)
- Store in local state with metadata
- Do NOT upload to S3 yet (upload happens from Screen 5)

**Navigation**:
- ✗ → Screen 1 (discard image, confirm if metadata entered)
- Retake → Opens camera, replaces current image
- Take More → Saves current, opens camera for next
- Done → Screen 3 with all captured images

---

### Screen 3: Review Grid

**Purpose**: Review all captured images, apply bulk metadata, choose upload destination

**Default State (Collapsed Metadata)**:
```
┌─────────────────────────────────┐
│  ← Back    Review Images        │
├─────────────────────────────────┤
│                                 │
│  👤 John Smith · NHI: ABC1234   │
│                                 │
│  Details ▼                      │
│                                 │
│  ─────────────────────────      │
│                                 │
│  ┌─────────┐  ┌─────────┐      │
│  │         │  │         │      │
│  │ Image 1 │  │ Image 2 │      │
│  │  📝 Add │  │   ✓     │      │
│  │ Details │  │ Ready   │      │
│  └─────────┘  └─────────┘      │
│                                 │
│  ┌─────────┐                    │
│  │         │                    │
│  │   +     │  Add more          │
│  │         │                    │
│  └─────────┘                    │
│                                 │
│  ─────────────────────────      │
│                                 │
│  [    Upload (2)     ▼   ]      │
│                                 │
└─────────────────────────────────┘
```

**Expanded State (Metadata Section Open)**:
```
┌─────────────────────────────────┐
│  ← Back    Review Images        │
├─────────────────────────────────┤
│                                 │
│  👤 John Smith · NHI: ABC1234   │
│                                 │
│  Details ▲                      │
│                                 │
│  Apply to all images:           │
│                                 │
│  Laterality:                    │
│  [ Left ]  [ Right ]  [ N/A ]   │
│    ○          ○          ○      │
│                                 │
│  Body Site / Comment:           │
│  ┌─────────────────────────┐   │
│  │ e.g., Left forearm      │   │
│  └─────────────────────────┘   │
│                                 │
│  ─────────────────────────      │
│                                 │
│  ┌─────────┐  ┌─────────┐      │
│  │         │  │         │      │
│  │ Image 1 │  │ Image 2 │      │
│  │  📝 Add │  │   ✓     │      │
│  │ Details │  │ Ready   │      │
│  └─────────┘  └─────────┘      │
│                                 │
│  ┌─────────┐                    │
│  │         │                    │
│  │   +     │  Add more          │
│  │         │                    │
│  └─────────┘                    │
│                                 │
│  ─────────────────────────      │
│                                 │
│  [    Upload (2)     ▼   ]      │
│                                 │
└─────────────────────────────────┘
```

**Elements**:

**Header**:
- ← Back button: Return to Screen 1 (confirm if images selected)
- "Review Images" title

**Patient Banner**:
- Patient name + NHI
- Small text, gray background

**Bulk Metadata Section** (collapsible):
- **Collapsed**: "Details ▼" text button
- **Expanded**: "Details ▲" + form fields
- Toggle on tap

**Bulk Metadata Form** (when expanded):
- Label: "Apply to all images:"
- Laterality toggle: Left / Right / N/A (same as Screen 3A)
- Body Site / Comment text field (same as Screen 3A)
- **Behavior**: Values apply to ALL images that don't have individual metadata

**Image Grid**:
- 2 columns
- Square thumbnails (aspect ratio 1:1, object-fit: cover)
- Max 3 rows visible, scroll for more
- Each thumbnail shows:
  - Image preview
  - Badge (bottom-right):
    - "📝 Add Details" (yellow/orange) - No individual metadata
    - "✓ Ready" (green) - Has individual metadata
- Tap thumbnail → Screen 4 (edit individual metadata)

**Add More Tile**:
- "+" icon (large, centered)
- "Add more" text below
- Same size as image thumbnails
- Dashed border
- Tap → Opens camera → Screen 3A after capture

**Upload Button** (sticky at bottom):
- Primary button, full width
- Shows count: "Upload (2)" or "Upload (5)"
- Down arrow icon "▼" on right side
- **Main button area**: Upload for desktop review (default)
- **Arrow area**: Opens dropdown menu

**Upload Dropdown Menu**:
```
┌─────────────────────────────────┐
│  [    Upload (2)     ▼   ]      │
├─────────────────────────────────┤
│  ⭐ Upload for Desktop Review   │
│  ─────────────────────────      │
│  ⚡ Commit to Medtech Now       │
└─────────────────────────────────┘
```

**Dropdown Options**:
1. **⭐ Upload for Desktop Review** (recommended):
   - Star icon
   - Default/recommended path
   - Action: Upload to S3 → Screen 5 → Screen 6A
2. **⚡ Commit to Medtech Now**:
   - Lightning icon
   - Direct commit path
   - Action: Show confirmation dialog → Upload + commit → Screen 5 → Screen 6B

**Metadata Priority Logic**:
```javascript
// When preparing image for upload
const finalMetadata = {
  laterality: image.individualLaterality || bulkLaterality || null,
  bodySite: image.individualBodySite || bulkBodySite || null
};

// Individual metadata always overrides bulk metadata
```

**Interactions**:
- **← Back**: Confirm if images captured, return to Screen 1
- **Details ▼/▲**: Toggle metadata section
- **Laterality/Body Site (bulk)**: Save to all images without individual metadata
- **Tap thumbnail**: Open Screen 4 for individual metadata
- **Tap + tile**: Open camera → Screen 3A
- **Upload button (main area)**: Upload for desktop review
- **Upload button (▼ arrow)**: Open dropdown menu
- **Dropdown option 1**: Upload for desktop review
- **Dropdown option 2**: Show confirmation → Direct commit

**Validation**:
- No validation on this screen
- Images can be uploaded without metadata (metadata optional on mobile)

**State Management**:
- Track bulk metadata separately from individual image metadata
- Update image badges when bulk metadata changes
- If bulk metadata set + image has no individual metadata → Badge changes to "✓ Ready"

---

### Screen 4: Individual Image Metadata

**Purpose**: Edit metadata for specific image, navigate between images

**Layout**:
```
┌─────────────────────────────────┐
│  📝 Image 2 of 3            ✗   │
├─────────────────────────────────┤
│                                 │
│  Preview:                       │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │    [Image preview]      │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Laterality (optional):         │
│                                 │
│  [ Left ]  [ Right ]  [ N/A ]   │
│    ●          ○          ○      │
│                                 │
│  Body Site / Comment (optional):│
│  ┌─────────────────────────┐   │
│  │ Left forearm            │   │
│  └─────────────────────────┘   │
│                                 │
│  💡 This overrides bulk         │
│  metadata for this image        │
│                                 │
│  [ ← Previous ]  [ Next → ]     │
│                                 │
│  [       Save ✓       ]         │
│                                 │
└─────────────────────────────────┘
```

**Elements**:

**Header**:
- Title: "📝 Image 2 of 3" (shows position)
- ✗ button (top-right): Close without saving, return to Screen 3

**Image Preview**:
- Medium size (30-40% of screen height)
- Centered
- Border/shadow for clarity

**Laterality Toggle** (optional):
- Same as Screen 3A
- Pre-filled if individual metadata exists
- Pre-filled with bulk metadata if no individual metadata (shown as suggestion)

**Body Site / Comment Field** (optional):
- Same as Screen 3A
- Pre-filled if individual metadata exists
- Pre-filled with bulk metadata if no individual metadata (shown as suggestion)

**Info Message**:
- Light blue background
- Icon: 💡
- Text: "This overrides bulk metadata for this image"

**Navigation Buttons** (horizontal):
- **← Previous** (left half):
  - Disabled on first image (opacity 50%)
  - Auto-saves current metadata before navigating
- **Next →** (right half):
  - Disabled on last image (opacity 50%)
  - Auto-saves current metadata before navigating

**Save Button**:
- Primary, full width
- Icon: ✓
- Text: "Save"
- Action: Save metadata, close sheet, return to Screen 3

**Behavior**:

**Auto-save on navigation**:
- When GP taps Previous/Next, current metadata is auto-saved
- No confirmation needed
- Smooth transition to previous/next image

**Button states**:
- First image (1 of 3): Previous disabled, Next enabled
- Middle image (2 of 3): Both enabled
- Last image (3 of 3): Previous enabled, Next disabled

**Metadata inheritance**:
- When opening sheet, check if image has individual metadata
- If no individual metadata, show bulk metadata as placeholder (light gray text)
- If GP edits field, it becomes individual metadata (dark text)
- Individual metadata persists when navigating away

**Interactions**:
- **✗**: Close sheet without saving changes to current image, return to Screen 3
- **← Previous**: Save current → Go to previous image in grid
- **Next →**: Save current → Go to next image in grid
- **Save ✓**: Save metadata → Close sheet → Return to Screen 3 → Badge updates

**State Management**:
- Track which images have individual metadata
- Update badge on Screen 3 when saved
- Preserve both bulk and individual metadata separately

---

### Screen 5: Upload Progress

**Purpose**: Show upload progress, provide feedback

**Layout**:
```
┌─────────────────────────────────┐
│  Uploading...                   │
├─────────────────────────────────┤
│                                 │
│  👤 John Smith                  │
│  📸 3 images                    │
│                                 │
│  ┌─────────────────────────┐   │
│  │     ⬆️  Uploading...     │   │
│  │                          │   │
│  │  ▓▓▓▓▓▓▓▓▓▓░░░░░░ 67%   │   │
│  │                          │   │
│  │  Image 2 of 3            │   │
│  └─────────────────────────┘   │
│                                 │
│  Please wait...                 │
│                                 │
└─────────────────────────────────┘
```

**Elements**:
- Header: "Uploading..."
- Patient name
- Image count: "📸 3 images"
- Progress card:
  - Upload icon
  - Progress bar (animated)
  - Percentage text
  - Current image: "Image 2 of 3"
- Status text: "Please wait..."

**Behavior**:

**Upload Process**:
1. Compress each image (client-side, target <1MB)
2. Apply final metadata (individual or bulk)
3. Upload images one-by-one to S3 via BFF:
   ```
   POST /api/medtech/session/{sessionId}/upload
   Body: FormData with image + metadata JSON
   ```
4. Update progress bar after each image
5. Send Ably notification per image:
   ```
   channel: session:{sessionId}
   event: image-uploaded
   data: { imageId, s3Key, metadata, sequenceNumber }
   ```

**Progress Calculation**:
```javascript
const progress = Math.round(((currentIndex + 1) / totalImages) * 100);
```

**What Happens Next** (depends on commit path):

**Path A: Desktop Review**:
- Upload to S3 only
- Notify desktop via Ably
- Go to Screen 6A

**Path B: Direct Commit**:
- Upload to S3
- Immediately commit to Medtech via BFF:
  ```
  POST /api/medtech/session/{sessionId}/commit
  ```
- Go to Screen 6B

**Error Handling**:
- If upload fails → Show error screen (Screen 5E)
- If partial failure → Show partial failure screen (Screen 5E variant)
- Network errors → Retry with exponential backoff (3 attempts)

**No dismiss/cancel** during upload (prevent data loss)

---

### Screen 5E: Upload Error (Error State)

**Layout**:
```
┌─────────────────────────────────┐
│  ❌ Upload Failed               │
├─────────────────────────────────┤
│                                 │
│  Could not upload images.       │
│                                 │
│  Error: Network timeout         │
│                                 │
│  Your images are saved locally. │
│                                 │
│  [  🔄 Try Again  ]             │
│                                 │
│  [  ← Back  ]                   │
│                                 │
└─────────────────────────────────┘
```

**Elements**:
- Error icon + title
- Error message (from API or generic)
- Reassurance: Images not lost
- Try Again button (primary) → Retry upload
- Back button (secondary) → Return to Screen 3

---

### Screen 6A: Success - Desktop Review Path

**Purpose**: Confirm upload success, images waiting for desktop review

**Layout**:
```
┌─────────────────────────────────┐
│  ✓ Uploaded                     │
├─────────────────────────────────┤
│                                 │
│  👤 John Smith                  │
│  ✓ 3 images uploaded            │
│                                 │
│  ┌─────────────────────────┐   │
│  │   ✓                      │   │
│  │                          │   │
│  │  Images ready for        │   │
│  │  review on desktop       │   │
│  │                          │   │
│  └─────────────────────────┘   │
│                                 │
│  Review and commit images on    │
│  your desktop computer.         │
│                                 │
│  ─────────────────────────      │
│                                 │
│  [  📷 Capture More Images  ]   │
│                                 │
│  [  ✓ Done  ]                   │
│                                 │
└─────────────────────────────────┘
```

**Elements**:
- Success icon + title: "✓ Uploaded"
- Patient name
- Count: "✓ 3 images uploaded"
- Success card:
  - Large checkmark
  - Message: "Images ready for review on desktop"
- Explanation text
- Action buttons:
  - **Capture More Images** (secondary) → Return to Screen 1 (same session)
  - **Done** (primary) → Show "You can close this page"

**Interactions**:
- **Capture More**: Return to Screen 1, keep session active
- **Done**: Show message "You can close this page now" → End

---

### Screen 6B: Success - Committed to Medtech

**Purpose**: Confirm direct commit to Medtech (permanent)

**Layout**:
```
┌─────────────────────────────────┐
│  ✓ Committed to Medtech         │
├─────────────────────────────────┤
│                                 │
│  👤 John Smith                  │
│  ✓ 3 images committed           │
│                                 │
│  ┌─────────────────────────┐   │
│  │   ✓✓✓                    │   │
│  │                          │   │
│  │  Images saved to         │   │
│  │  patient record          │   │
│  │                          │   │
│  └─────────────────────────┘   │
│                                 │
│  Images are now in Medtech      │
│  and ready for referrals.       │
│                                 │
│  ─────────────────────────      │
│                                 │
│  [  📷 Capture More Images  ]   │
│                                 │
│  [  ✓ Done  ]                   │
│                                 │
└─────────────────────────────────┘
```

**Differences from 6A**:
- Title: "Committed to Medtech" (emphasizes permanence)
- Triple checkmarks (✓✓✓) instead of single
- Message: "Images saved to patient record" (permanent)
- Explanation: "ready for referrals" (clinical context)

**Same actions**: Capture More / Done

---

### Screen E1: Session Expired

**Purpose**: Handle expired session

**Layout**:
```
┌─────────────────────────────────┐
│  ⚠️  Session Expired            │
├─────────────────────────────────┤
│                                 │
│  This session has ended.        │
│                                 │
│  Please scan the QR code        │
│  again from the desktop.        │
│                                 │
│  ─────────────────────────      │
│                                 │
│  Session expired because:       │
│  • 1 hour timeout               │
│  • Patient changed on desktop   │
│                                 │
└─────────────────────────────────┘
```

**Trigger**: Session validation fails (API returns 404 or expired status)

**Action**: None (GP must scan new QR)

---

## Data Structures

### Session Object (from API)
```typescript
interface MobileSession {
  sessionId: string;
  patientId: string;
  patientName?: string;
  patientNHI?: string;
  patientDOB?: string;
  encounterId: string;
  facilityId: string;
  expiresAt: string; // ISO timestamp
  status: 'active' | 'expired';
}
```

### Image Metadata
```typescript
interface ImageMetadata {
  laterality?: 'left' | 'right' | 'n/a';
  bodySite?: string; // Free text
}

interface CapturedImage {
  id: string; // UUID
  file: File;
  preview: string; // Object URL for display
  sequenceNumber: number; // 1, 2, 3...
  individualMetadata?: ImageMetadata; // If set by GP on Screen 3A or 4
}
```

### Bulk Metadata State
```typescript
interface BulkMetadata {
  laterality?: 'left' | 'right' | 'n/a';
  bodySite?: string;
}
```

### Upload Payload
```typescript
// Per image upload
POST /api/medtech/session/{sessionId}/upload

FormData:
  - image: File (compressed JPEG)
  - metadata: JSON string
    {
      laterality: 'left' | 'right' | 'n/a' | null,
      bodySite: string | null,
      sequenceNumber: number
    }

Response:
  {
    success: true,
    imageId: string,
    s3Key: string
  }
```

---

## Validation Rules

### Mobile Validation (Lenient)
- **No required fields** on mobile
- Laterality: Optional
- Body Site / Comment: Optional
- GP can upload images without any metadata

**Rationale**: Mobile is for quick capture. Desktop provides review + validation before commit.

---

## Component Architecture

### File Structure
```
/app/(medtech)/medtech-images/mobile/
  - page.tsx (main router)

/src/medtech/images-widget/components/mobile/
  - LandingScreen.tsx (Screen 1)
  - SingleImageReview.tsx (Screen 3A)
  - ReviewGrid.tsx (Screen 3)
  - ImageMetadataSheet.tsx (Screen 4)
  - UploadProgress.tsx (Screen 5)
  - SuccessScreen.tsx (Screen 6A/6B)
  - ErrorScreen.tsx (Screen E1, 5E)
  - BulkMetadataForm.tsx (collapsible section)
  - LateralityToggle.tsx (shared component)
  - BodySiteInput.tsx (shared component)

/src/medtech/images-widget/hooks/
  - useMobileSession.ts (session management)
  - useMobileUpload.ts (upload logic)
  - useImageCompression.ts (client-side compression)
```

### State Management
```typescript
// Zustand store for mobile
interface MobileWidgetStore {
  // Session
  session: MobileSession | null;
  setSession: (session: MobileSession) => void;
  
  // Images
  images: CapturedImage[];
  addImage: (image: CapturedImage) => void;
  updateImageMetadata: (id: string, metadata: ImageMetadata) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  
  // Bulk metadata
  bulkMetadata: BulkMetadata;
  setBulkMetadata: (metadata: BulkMetadata) => void;
  
  // UI state
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
}
```

---

## API Endpoints Required

### 1. Get Session
```
GET /api/medtech/session/{sessionId}

Response:
  {
    success: true,
    session: {
      sessionId: string,
      patientId: string,
      patientName: string,
      patientNHI: string,
      patientDOB: string,
      encounterId: string,
      facilityId: string,
      expiresAt: string,
      status: 'active' | 'expired'
    }
  }

Error 404:
  { success: false, error: 'Session not found or expired' }
```

### 2. Upload Image
```
POST /api/medtech/session/{sessionId}/upload

Body: FormData
  - image: File
  - metadata: JSON string

Response:
  {
    success: true,
    imageId: string,
    s3Key: string,
    uploadedAt: string
  }

Error:
  { success: false, error: string }
```

### 3. Direct Commit
```
POST /api/medtech/session/{sessionId}/commit

Body:
  {
    imageIds: string[] // From previous uploads
  }

Response:
  {
    success: true,
    committedCount: number,
    mediaIds: string[] // Medtech Media resource IDs
  }

Error:
  { success: false, error: string }
```

---

## Image Compression

**Target**: <1MB per image  
**Format**: JPEG  
**Quality**: 85%  
**Library**: `browser-image-compression`

```typescript
import imageCompression from 'browser-image-compression';

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/jpeg',
};

const compressedFile = await imageCompression(file, options);
```

**HEIC Handling**:
- iOS may capture HEIC
- Convert to JPEG using Canvas API before compression
- Fallback: Upload as-is if conversion fails (backend handles)

---

## Real-Time Notifications (Ably)

**Channel**: `session:{sessionId}`  
**Event**: `image-uploaded`

**Payload**:
```typescript
{
  imageId: string,
  s3Key: string,
  metadata: {
    laterality: string | null,
    bodySite: string | null,
    sequenceNumber: number
  },
  uploadedAt: string
}
```

**When to Send**:
- After successful S3 upload
- Before returning upload response to mobile
- Desktop listens to this channel and fetches image from S3

---

## Error Handling

### Network Errors
- **Retry**: 3 attempts with exponential backoff (1s, 2s, 4s)
- **Show**: "Network error. Retrying..." message
- **After 3 failures**: Show Screen 5E with "Try Again" button

### Session Expired Mid-Flow
- **Detection**: API returns 404 or expired status
- **Action**: Show Screen E1 "Session expired, scan QR again"
- **No data loss**: Images stored locally (can retry after scanning new QR)

### API Errors
- **400 Bad Request**: Show error message from API
- **500 Server Error**: Show generic "Server error, try again"
- **503 Service Unavailable**: Show "Service temporarily unavailable"

---

## Accessibility

- **Touch targets**: Minimum 44×44 px
- **Font sizes**: Minimum 16px (no zoom on input focus)
- **Color contrast**: WCAG AA compliant
- **Labels**: All inputs have visible labels
- **Error messages**: Clear, actionable text

---

## Performance Targets

- **Screen load**: <500ms
- **Image compression**: <2s per image (background)
- **Upload**: <5s per image (1MB, mobile network)
- **Screen transitions**: <100ms (smooth animations)

---

## Testing Checklist

### Functional
- [ ] Session validation (valid/expired/missing)
- [ ] Camera capture flow
- [ ] Gallery selection flow
- [ ] Single image review (Screen 3A)
- [ ] Bulk metadata application
- [ ] Individual metadata overrides
- [ ] Previous/Next navigation in Screen 4
- [ ] Upload progress display
- [ ] Desktop review path (Screen 6A)
- [ ] Direct commit path (Screen 6B)
- [ ] Error handling (network, API, session expired)

### Cross-Device
- [ ] iOS Safari (iPhone 12+)
- [ ] Android Chrome (Pixel 4+)
- [ ] iPad Safari
- [ ] Android tablet

### Image Formats
- [ ] JPEG (from camera)
- [ ] HEIC (iOS camera)
- [ ] PNG (from gallery)
- [ ] Multiple images from gallery

### Network Conditions
- [ ] 4G (normal)
- [ ] 3G (slow)
- [ ] Offline → Online recovery
- [ ] Upload interruption + retry

---

## Open Questions

1. **Patient change detection**: How does Medtech Evolution notify widget of patient change? (Perplexity research needed)
2. **Session cleanup**: Should expired sessions auto-delete S3 images, or wait for commit timeout?
3. **Maximum images**: Is there a limit per session? (Suggest: 20 images)
4. **HEIC conversion**: Should backend handle HEIC → JPEG, or always do client-side?

---

**End of Mobile UI Specification**
