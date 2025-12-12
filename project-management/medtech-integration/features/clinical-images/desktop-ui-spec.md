# Desktop UI Specification

**Feature**: Clinical Images Widget - Desktop Review & Commit  
**Last Updated**: 2025-12-09  
**Version**: 1.0.0  
**Status**: Ready for Implementation

---

## Overview

Desktop interface for reviewing images captured on mobile or desktop, editing metadata, and committing to Medtech. Provides QR code for mobile handoff and real-time sync of uploaded images.

---

## Architecture Context

**Session Scope**: Per patient (1 hour expiry from last activity)  
**Storage**: Redis (session metadata) + S3 (temporary images)  
**Real-Time Sync**: Ably (mobile → desktop notifications)  
**Validation**: Body Site/Comment required, Laterality optional  
**Commit**: Desktop commits all images to Medtech ALEX API (FHIR Media resources)

---

## Layout Overview

```
┌──────────────────────────────────────────────────────────────┐
│  [Top Bar]                                                   │
│  Upload + QR  |  Thumbnail Strip  |  Inbox  Task  Commit    │
├──────────────────────────────────────────────────────────────┤
│  [Patient Banner]  👤 John Smith · NHI: ABC1234             │
├──────────────────────────────────────────────────────────────┤
│  [Warning Banner]  ⚠️ 3 uncommitted images - commit!        │
├──────────────────────────────────────────────────────────────┤
│  [QR Panel - Collapsible]                                    │
├──────────────────────────────────────────────────────────────┤
│  [Main Content]                                              │
│  ┌────────────────┐  ┌────────────────────────────────────┐ │
│  │                │  │                                    │ │
│  │   Image        │  │   Metadata Form                   │ │
│  │   Preview      │  │   - Body Site / Comment *         │ │
│  │   (30%)        │  │   - Laterality                    │ │
│  │                │  │   - View, Type, Notes             │ │
│  │   [Edit]       │  │   [Previous] [Next]               │ │
│  └────────────────┘  └────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Layout Proportions**:
- Image Preview: 30% width
- Metadata Form: 70% width
- Screen: Full height (no scroll on main layout)

---

## Component Specifications

### 1. Top Bar

**Layout**:
```
┌──────────────────────────────────────────────────────────────┐
│  [Upload] [Show QR]  │ [Thumbnails······] │ □Inbox □Task [Commit] │
└──────────────────────────────────────────────────────────────┘
```

**Left Section** (stacked):
- **Upload Button** (primary):
  - Icon: Camera
  - Text: "Upload from Desktop"
  - Opens file picker (multiple select, images only)
  - Accepts: JPEG, PNG, HEIC
  - After selection → Compresses → Adds to sessionImages
- **Show QR Button** (ghost, small):
  - Text: "Show QR" or "Hide QR"
  - Toggles QR panel visibility

**Center Section**:
- **Thumbnail Strip** (horizontal scroll)
  - Shows all sessionImages
  - See "Thumbnail Strip" section below

**Right Section** (inline):
- **Inbox Checkbox**:
  - Label: "Inbox"
  - Icon: Inbox
  - When checked: Shows inbox details in commit dialog
- **Task Checkbox**:
  - Label: "Task"
  - Icon: ListTodo
  - When checked: Shows task details in commit dialog
- **Commit Button** (primary):
  - Text: "Commit All X Image(s)"
  - Icon: Check
  - Disabled if:
    - No uncommitted images
    - Any image missing body site/comment
  - Tooltip when disabled:
    - "X image(s) missing body site/comment"
    - "No images to commit"
  - Loading state: "Committing X image(s)..." with spinner

**Behavior**:
- Top bar is sticky (always visible)
- White background, border-bottom
- Horizontal padding: 24px
- Vertical padding: 16px

---

### 2. Patient Banner

**Layout**:
```
┌──────────────────────────────────────────────────────────────┐
│  Patient: John Smith    NHI: ABC1234                         │
└──────────────────────────────────────────────────────────────┘
```

**Purpose**: Show which patient's images are being captured

**Content**:
- Label: "Patient:" (medium weight)
- Patient name (from encounterContext)
- Separator: "NHI:"
- Patient NHI (from encounterContext)
- If no patient name: Show "Unknown" or patientId

**Styling**:
- Light gray background (bg-slate-50)
- Small text (text-sm)
- Horizontal padding: 24px
- Vertical padding: 8px
- Border-bottom

**Visibility**: Always visible when encounterContext exists

---

### 3. Warning Banner (Uncommitted Images)

**Layout**:
```
┌──────────────────────────────────────────────────────────────┐
│  ⚠️ 3 uncommitted images — Don't forget to commit           │
└──────────────────────────────────────────────────────────────┘
```

**Purpose**: Remind GP to commit images before closing widget

**Content**:
- Warning icon (AlertCircle)
- Text: "X uncommitted image(s) — Don't forget to commit before closing"
- Bold: Number + "uncommitted image(s)"

**Styling**:
- Yellow background (bg-yellow-50)
- Yellow border (border-yellow-200)
- Dark yellow text (text-yellow-800)
- Horizontal padding: 24px
- Vertical padding: 8px
- Border-bottom

**Visibility**: Only when uncommittedImages.length > 0

---

### 4. QR Panel (Collapsible)

**Collapsed**: QR panel hidden (default state)  
**Expanded**: QR panel visible

**Layout** (when visible):
```
┌──────────────────────────────────────────────────────────────┐
│  📱 Mobile Upload                                            │
│                                                              │
│  ┌─────────────┐                                            │
│  │             │   Mobile URL:                              │
│  │  [QR CODE]  │   https://app.clinicpro.co.nz/...         │
│  │             │                                            │
│  └─────────────┘   [Regenerate QR]                          │
│                                                              │
│  Instructions:                                               │
│  1. Scan QR with mobile device                              │
│  2. Capture images with phone camera                        │
│  3. Images appear here automatically                        │
└──────────────────────────────────────────────────────────────┘
```

**Elements**:

**Card Header**:
- Icon: QrCode (purple)
- Title: "Mobile Upload"

**QR Code Image**:
- Size: 200×200 px
- Centered
- Border: Light gray, rounded
- Generated by backend (`/api/medtech/session/generate-qr`)

**Mobile URL** (optional display):
- Label: "Mobile URL:"
- URL: Full mobile page URL with sessionId
- Small text, monospace
- For manual entry if QR fails

**Regenerate Button**:
- Text: "Regenerate QR"
- Icon: RefreshCw
- Action: Generate new session → New QR code
- Secondary button

**Instructions**:
- Blue info box (bg-blue-50)
- 3 numbered steps
- Small text

**Removed** (per requirements):
- ❌ Session expiry countdown timer
- ❌ Session ID display
- ❌ "Expires in X:XX" text

**Visibility**: Controlled by "Show QR" button in top bar

---

### 5. Thumbnail Strip

**Layout**:
```
┌────┐ ┌────┐ ┌────┐
│ 1  │ │ 2  │ │ 3  │  ← Thumbnails
│ ⚠  │ │ ✓  │ │ ✓  │  ← Status badges
└────┘ └────┘ └────┘
```

**Empty State**:
```
┌──────────────────────────────────────┐
│   No images uploaded yet             │
└──────────────────────────────────────┘
```

**Thumbnail Card**:
- Size: 120×120 px
- Border: 2px solid
  - Current/selected: Purple border + purple ring
  - Default: Gray border
  - Hover: Darker gray border
- Image: Object-fit cover (centered, cropped)
- Cursor: Pointer

**Status Badges** (bottom-right corner):
- **Yellow (⚠)**: Missing required metadata (body site/comment)
  - Icon: AlertCircle
  - Color: Yellow (bg-yellow-500)
  - Tooltip: "Missing required metadata"
- **Red (❌)**: Commit error
  - Icon: AlertCircle
  - Color: Red (bg-red-500)
  - Clickable: Opens error details modal
  - Tooltip: Error message
- **Green (✓)**: Successfully committed
  - Icon: Check
  - Color: Green (bg-green-500)
  - Tooltip: "Committed"

**Remove Button** (top-right corner):
- Icon: X
- Color: Red (bg-red-500)
- Opacity: 0 (hidden)
- On hover: Opacity 100
- Action: Confirm dialog → Remove image → Revoke object URL
- Not shown when status = uploading

**Interactions**:
- **Click thumbnail**: Select image → Show in preview + metadata form
- **Click badge (if red error)**: Open error details modal
- **Click remove**: Confirm "Remove this image?" → Remove from sessionImages

**Scrolling**:
- Horizontal scroll if thumbnails overflow
- Smooth scrolling
- Hide scrollbar on desktop (show on hover)

---

### 6. Image Preview (Left Panel - 30%)

**Layout**:
```
┌────────────────────┐
│                    │
│                    │
│    [Full Image]    │
│                    │
│                    │
│                    │
│    [Edit Button]   │
└────────────────────┘
```

**Image Display**:
- Full width of panel
- Max height: 80% of panel
- Object-fit: contain (preserve aspect ratio)
- Centered vertically
- Border: Light gray, rounded

**Edit Button** (at bottom):
- Text: "Edit Image"
- Icon: Edit
- Action: Opens Image Edit Modal (crop, rotate, annotations)
- Secondary button
- Note: Edit feature is Phase 2 (not in MVP)

**Empty State** (no image selected):
```
┌────────────────────┐
│                    │
│      ⚠️            │
│                    │
│  Select an image   │
│  to edit metadata  │
│                    │
└────────────────────┘
```

**Styling**:
- White background
- Border: Light gray
- Rounded corners
- Padding: 16px

---

### 7. Metadata Form (Right Panel - 70%)

**Layout**:
```
┌─────────────────────────────────────────┐
│  Image Metadata                         │
│  Fields marked with * are required      │
├─────────────────────────────────────────┤
│                                         │
│  Body Site / Comment *                  │
│  [___________________________]          │
│                                         │
│  Laterality                             │
│  [ Left ]  [ Right ]  [ N/A ]           │
│                                         │
│  View                                   │
│  [Select view type ▼]                   │
│                                         │
│  Type                                   │
│  [Select image type ▼]                  │
│                                         │
│  Notes                                  │
│  [___________________________]          │
│  [___________________________]          │
│  [___________________________]          │
│                                         │
│  Apply to rest:                         │
│  [Apply Laterality] [Apply Body Site]   │
│  [Apply to Selected Images]             │
│                                         │
├─────────────────────────────────────────┤
│  [← Previous]  [Next →]                 │
└─────────────────────────────────────────┘
```

**Header**:
- Title: "Image Metadata"
- Subtitle: "Fields marked with * are required"
- Asterisk color: Red

**Form Fields**:

**1. Body Site / Comment** (Required):
- Label: "Body Site / Comment *"
- Type: Text input
- Placeholder: "e.g., Left forearm"
- Autocomplete: Optional (SNOMED CT body sites)
- Validation: Required (cannot be empty)
- Error message: "Body site/comment is required"

**2. Laterality** (Optional):
- Label: "Laterality"
- Type: Button group (radio behavior)
- Options:
  - Left
  - Right
  - N/A
- Default: None selected
- Can deselect by clicking same button again
- Visual: Selected = filled, unselected = outline

**3. View** (Optional):
- Label: "View"
- Type: Dropdown
- Options:
  - Close-up
  - Dermoscopy
  - Wide angle
  - Other
- Default: None selected
- Clearable: X icon to reset

**4. Type** (Optional):
- Label: "Type"
- Type: Dropdown
- Options:
  - Lesion
  - Rash
  - Wound
  - Infection
  - Other
- Default: None selected
- Clearable: X icon to reset

**5. Notes** (Optional):
- Label: "Notes"
- Type: Textarea (3 rows)
- Placeholder: "Additional notes..."
- Max length: 500 characters

**Bulk Actions** (collapsed by default):
- Section title: "Apply to rest:"
- Buttons:
  - **Apply Laterality**: Copy laterality to all other uncommitted images
  - **Apply Body Site**: Copy body site to all other uncommitted images
  - **Apply to Selected Images**: Opens modal to select images
- Buttons disabled if:
  - No other uncommitted images
  - Current field is empty
- Tooltip when disabled: "No other images" or "Select a value first"

**Footer Navigation**:
- **Previous Button**:
  - Icon: ChevronLeft
  - Text: "Previous"
  - Disabled on first image
  - Action: Go to previous image in sessionImages
- **Next Button**:
  - Icon: ChevronRight
  - Text: "Next"
  - Disabled on last image
  - Action: Go to next image in sessionImages

**Auto-save Behavior**:
- Metadata auto-saves on change (debounced 500ms)
- No explicit "Save" button needed
- Visual feedback: Brief checkmark on field after save

**Validation Feedback**:
- Real-time validation on body site/comment
- Red border + error message if empty when attempting commit
- Thumbnail badge updates immediately (yellow ⚠ if invalid)

---

### 8. Empty State (No Images)

**Layout** (replaces image preview + metadata when no images):
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    📷        📱                              │
│                                                              │
│              No Images Yet                                   │
│                                                              │
│   Capture images from your desktop camera or                │
│   scan the QR code to upload from your mobile device        │
│                                                              │
│   [Upload from Desktop]  [Show QR Code]                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Elements**:
- Icons: Camera + QR Code (large, gray)
- Title: "No Images Yet"
- Description text
- Action buttons:
  - **Upload from Desktop**: Same as top bar upload button
  - **Show QR Code**: Toggle QR panel visibility

**Visibility**: Only when sessionImages.length === 0

---

### 9. Commit Dialog

**Triggered**: When GP clicks "Commit All" and (Inbox OR Task) is checked

**Layout**:
```
┌─────────────────────────────────────────┐
│  Commit Images                     ✗    │
├─────────────────────────────────────────┤
│                                         │
│  Committing 3 images to John Smith     │
│                                         │
│  ☑ Send to Inbox                        │
│  ┌─────────────────────────────────┐   │
│  │  Recipient:                     │   │
│  │  [Select recipient ▼]           │   │
│  │                                 │   │
│  │  Message (optional):            │   │
│  │  [_________________________]    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ☑ Create Task                          │
│  ┌─────────────────────────────────┐   │
│  │  Assign to:                     │   │
│  │  [Select staff ▼]               │   │
│  │                                 │   │
│  │  Due date:                      │   │
│  │  [Date picker]                  │   │
│  │                                 │   │
│  │  Task description:              │   │
│  │  [_________________________]    │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│  [Cancel]              [Commit Now]     │
└─────────────────────────────────────────┘
```

**Purpose**: Collect inbox and/or task details before committing

**Sections**:

**Inbox Section** (only if Inbox checked):
- Recipient dropdown (required)
- Message textarea (optional)

**Task Section** (only if Task checked):
- Assign to dropdown (required)
- Due date picker (optional)
- Task description textarea (optional)

**Actions**:
- **Cancel**: Close dialog without committing
- **Commit Now**: 
  - Validate inbox/task fields
  - Start commit process
  - Close dialog
  - Auto-commits after closing

**Behavior**:
- If neither Inbox nor Task checked: Skip dialog, commit directly
- Modal overlay (backdrop)
- Escape key: Close dialog

---

### 10. Partial Failure Dialog

**Triggered**: After commit, if some images failed

**Layout**:
```
┌─────────────────────────────────────────┐
│  ⚠️ Partial Success                ✗   │
├─────────────────────────────────────────┤
│                                         │
│  2 of 3 images committed successfully   │
│                                         │
│  ✓ Successful (2):                      │
│  • Image 1                              │
│  • Image 2                              │
│                                         │
│  ❌ Failed (1):                          │
│  • Image 3: Network timeout             │
│    [View Details]                       │
│                                         │
├─────────────────────────────────────────┤
│  [Close]              [Retry Failed]    │
└─────────────────────────────────────────┘
```

**Content**:
- Summary: "X of Y images committed successfully"
- Success list (green checkmarks)
- Failed list (red X icons) with error messages
- "View Details" links → Opens error modal

**Actions**:
- **Close**: Close dialog, keep failed images in uncommitted state
- **Retry Failed**: Retry committing only the failed images

---

### 11. Error Modal

**Triggered**: Click on red badge OR "View Details" in partial failure

**Layout**:
```
┌─────────────────────────────────────────┐
│  ❌ Commit Error                   ✗   │
├─────────────────────────────────────────┤
│                                         │
│  Image 3 failed to commit               │
│                                         │
│  Error Details:                         │
│  Network timeout after 3 attempts       │
│                                         │
│  Technical Details:                     │
│  POST /FHIR/Media                       │
│  Status: 503 Service Unavailable        │
│                                         │
│  What to do:                            │
│  • Check network connection             │
│  • Try again in a few moments           │
│  • Contact support if persists          │
│                                         │
├─────────────────────────────────────────┤
│  [Close]              [Retry]           │
└─────────────────────────────────────────┘
```

**Content**:
- Image identifier
- User-friendly error message
- Technical details (collapsed)
- Suggested actions

**Actions**:
- **Close**: Close modal
- **Retry**: Retry committing this specific image

---

### 12. Image Edit Modal (Phase 2 - Not MVP)

**Purpose**: Crop, rotate, annotate images

**Note**: This is not in MVP scope. Modal opens when "Edit Image" button clicked, but functionality not implemented yet.

---

## State Management

### Zustand Store Structure

```typescript
interface ImageWidgetStore {
  // Session
  sessionId: string | null;
  setSessionId: (id: string) => void;
  
  // Encounter context
  encounterContext: EncounterContext | null;
  setEncounterContext: (context: EncounterContext) => void;
  
  // Images
  sessionImages: WidgetImage[];
  imageCounter: number;
  addImage: (image: WidgetImage) => void;
  removeImage: (id: string) => void;
  updateMetadata: (id: string, metadata: Partial<Metadata>) => void;
  setImageStatus: (id: string, status: ImageStatus) => void;
  clearCommittedImages: () => void;
  clearAllImages: () => void;
  
  // UI state
  showQR: boolean;
  setShowQR: (show: boolean) => void;
  isCommitDialogOpen: boolean;
  setCommitDialogOpen: (open: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

interface WidgetImage {
  id: string;
  file: File | null; // null if uploaded from mobile
  preview: string; // Object URL or S3 URL
  thumbnail: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'committed' | 'error';
  metadata: {
    label?: string;
    laterality?: CodeableConcept;
    bodySite?: CodeableConcept;
    view?: CodeableConcept;
    type?: CodeableConcept;
    notes?: string;
  };
  commitOptions: {
    sendToInbox?: boolean;
    inboxRecipient?: string;
    inboxMessage?: string;
    createTask?: boolean;
    taskAssignee?: string;
    taskDueDate?: string;
    taskDescription?: string;
  };
  error?: string;
  result?: {
    mediaId: string;
    documentReferenceId?: string;
  };
  source: 'desktop' | 'mobile';
  sequenceNumber: number;
}
```

---

## Data Flow

### Desktop Upload Flow

```
1. GP clicks "Upload from Desktop"
2. File picker opens (multiple select)
3. GP selects images
4. For each image:
   - Generate UUID
   - Create object URL for preview
   - Compress image (target <1MB)
   - Create thumbnail (200×200)
   - Add to sessionImages with status 'pending'
5. Auto-select first image
6. Show in preview + metadata form
7. GP edits metadata (auto-saved)
8. GP clicks "Commit All"
9. Validate: All images have body site/comment
10. If inbox/task checked: Show commit dialog
11. Start commit process (see Commit Flow)
```

### Mobile Upload Flow (Real-Time Sync)

```
1. Mobile uploads image to S3 (see mobile spec)
2. Mobile sends Ably notification:
   channel: session:{sessionId}
   event: image-uploaded
   data: { imageId, s3Key, metadata, sequenceNumber }
3. Desktop Ably listener receives notification
4. Desktop fetches image from S3 via BFF:
   GET /api/medtech/session/image?key={s3Key}
5. Desktop creates WidgetImage:
   - source: 'mobile'
   - preview: S3 URL
   - metadata: From mobile (if provided)
   - status: 'pending'
6. Desktop adds to sessionImages
7. Thumbnail appears silently in strip (no toast)
8. GP can review and edit metadata before committing
```

### Commit Flow

```
1. GP clicks "Commit All X Image(s)"
2. Validate: All uncommitted images have body site/comment
3. If invalid: Show tooltip, disable button
4. If inbox or task checked: Show commit dialog
5. GP fills inbox/task details (if needed)
6. GP clicks "Commit Now" in dialog
7. Dialog closes
8. For each uncommitted image:
   a. Update status to 'uploading'
   b. If source === 'desktop':
      - Upload to S3 via BFF
      - POST /api/medtech/session/{sessionId}/upload
   c. Commit to Medtech via BFF:
      - POST /api/medtech/session/{sessionId}/commit-single
      - Body: { imageId, s3Key, metadata, commitOptions }
      - BFF converts to FHIR Media resource
      - BFF posts to ALEX API
   d. On success:
      - Update status to 'committed'
      - Store mediaId in result
      - Update thumbnail badge to green
   e. On error:
      - Update status to 'error'
      - Store error message
      - Update thumbnail badge to red
9. After all images processed:
   - If all succeeded: Silent success (thumbnails green)
   - If partial failure: Show Partial Failure Dialog
   - If all failed: Show error banner
```

---

## Validation Rules

### Commit Validation

**Required**:
- Body Site / Comment (cannot be empty)

**Optional**:
- Laterality
- View
- Type
- Notes

**Validation Logic**:
```typescript
const invalidImages = uncommittedImages.filter(
  img => !img.metadata.bodySite
);

const canCommit = uncommittedImages.length > 0 && invalidImages.length === 0;
```

**Visual Feedback**:
- Yellow badge (⚠) on thumbnail if body site missing
- Red border on body site input if focused and empty
- Tooltip on disabled commit button: "X image(s) missing body site/comment"

---

## Real-Time Sync (Ably)

### Setup

```typescript
import Ably from 'ably';

const ably = new Ably.Realtime({ 
  key: process.env.NEXT_PUBLIC_ABLY_API_KEY 
});

const channel = ably.channels.get(`session:${sessionId}`);

channel.subscribe('image-uploaded', async (message) => {
  const { imageId, s3Key, metadata, sequenceNumber } = message.data;
  
  // Fetch image from S3
  const imageUrl = await fetchImageFromS3(s3Key);
  
  // Add to store
  addImage({
    id: imageId,
    file: null,
    preview: imageUrl,
    thumbnail: imageUrl,
    status: 'pending',
    metadata: {
      label: `Image ${sequenceNumber}`,
      laterality: metadata.laterality,
      bodySite: metadata.bodySite,
    },
    source: 'mobile',
    sequenceNumber,
  });
});
```

### Cleanup

```typescript
useEffect(() => {
  if (!sessionId) return;
  
  // Subscribe
  const channel = ably.channels.get(`session:${sessionId}`);
  channel.subscribe('image-uploaded', handleImageUploaded);
  
  // Cleanup
  return () => {
    channel.unsubscribe();
    ably.close();
  };
}, [sessionId]);
```

---

## Patient Change Detection

### Window Close Warning

```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (uncommittedImages.length > 0) {
      e.preventDefault();
      e.returnValue = ''; // Browser shows generic message
      return '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [uncommittedImages.length]);
```

### Patient Change Detection (TBD)

**Requirement**: When patient changes in Medtech Evolution, widget should close

**Implementation depends on**:
- Medtech Evolution widget API (PostMessage events?)
- Lifecycle hooks
- Integration patterns

**Placeholder logic**:
```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'PATIENT_CHANGED') {
      if (uncommittedImages.length > 0) {
        const confirmed = window.confirm(
          `You have ${uncommittedImages.length} uncommitted images. ` +
          'Patient has changed. Close widget and discard images?'
        );
        if (confirmed) {
          window.close();
        }
      } else {
        window.close();
      }
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, [uncommittedImages.length]);
```

**Research needed**: How does Medtech Evolution communicate patient changes to embedded widgets? (See Perplexity prompt)

---

## API Endpoints Required

### 1. Generate QR Session
```
POST /api/medtech/session/generate-qr

Body:
  {
    encounterId: string,
    patientId: string,
    patientName?: string,
    patientNHI?: string,
    facilityId: string
  }

Response:
  {
    sessionId: string,
    qrSvg: string, // SVG data URL
    mobileUrl: string,
    expiresAt: string
  }
```

### 2. Get Session Images
```
GET /api/medtech/session/{sessionId}/images

Response:
  {
    images: [
      {
        imageId: string,
        s3Key: string,
        metadata: { ... },
        uploadedAt: string
      }
    ]
  }
```

### 3. Fetch Image from S3
```
GET /api/medtech/session/image?key={s3Key}

Response: Image blob
```

### 4. Upload Desktop Image
```
POST /api/medtech/session/{sessionId}/upload

Body: FormData
  - image: File
  - metadata: JSON

Response:
  {
    success: true,
    imageId: string,
    s3Key: string
  }
```

### 5. Commit Single Image
```
POST /api/medtech/session/{sessionId}/commit-single

Body:
  {
    imageId: string,
    s3Key: string,
    metadata: {
      laterality?: string,
      bodySite: string,
      view?: string,
      type?: string,
      notes?: string
    },
    commitOptions?: {
      sendToInbox: boolean,
      inboxRecipient?: string,
      inboxMessage?: string,
      createTask: boolean,
      taskAssignee?: string,
      taskDueDate?: string,
      taskDescription?: string
    }
  }

Response:
  {
    success: true,
    mediaId: string, // Medtech Media resource ID
    documentReferenceId?: string
  }

Error:
  {
    success: false,
    error: string,
    technicalDetails?: string
  }
```

### 6. Commit Batch
```
POST /api/medtech/session/{sessionId}/commit

Body:
  {
    imageIds: string[] // Already uploaded to S3
  }

Response:
  {
    successIds: string[],
    errorIds: string[],
    results: [
      { imageId: string, mediaId?: string, error?: string }
    ]
  }
```

---

## Error Handling

### Network Errors
- Show error banner at top
- Allow retry via commit button
- Don't auto-retry (GP controls timing)

### Validation Errors
- Real-time validation feedback
- Red borders on invalid fields
- Tooltip on disabled commit button

### Partial Failures
- Show Partial Failure Dialog
- List successful and failed images
- Allow retry of failed images only

### Session Expired
- Detect via 404 response from session endpoints
- Show error banner: "Session expired. Please refresh widget."
- Don't auto-refresh (could lose uncommitted work)

---

## Accessibility

- **Keyboard navigation**: Tab through all interactive elements
- **ARIA labels**: All buttons, inputs, and controls
- **Focus indicators**: Visible focus rings
- **Screen reader announcements**: Status changes, errors
- **Color contrast**: WCAG AA compliant
- **Touch targets**: Minimum 44×44 px on touch devices

---

## Performance Targets

- **Initial load**: <1s
- **Image upload**: <5s per image
- **Metadata save**: <100ms (debounced)
- **Commit**: <3s per image
- **Real-time sync**: <500ms latency (mobile → desktop)

---

## Testing Checklist

### Functional
- [ ] Desktop upload (single and multiple images)
- [ ] QR code generation and display
- [ ] Mobile → Desktop real-time sync
- [ ] Metadata editing (all fields)
- [ ] Validation enforcement (body site required)
- [ ] Bulk metadata actions
- [ ] Previous/Next navigation
- [ ] Commit flow (with and without inbox/task)
- [ ] Partial failure handling
- [ ] Error modal display
- [ ] Window close warning (with uncommitted images)

### Cross-Browser
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Integration
- [ ] Medtech Evolution embedding (if available)
- [ ] OAuth token flow
- [ ] ALEX API connectivity
- [ ] Ably real-time sync

---

## Open Questions

1. **Patient change detection**: How does Medtech Evolution notify embedded widgets? (Perplexity research needed)
2. **Widget embedding**: iFrame, new window, or tab? What's the standard pattern?
3. **Session persistence**: Should session survive page refresh? Or new session each time?
4. **Maximum images per session**: Hard limit? (Suggest 20 images)
5. **Committed images**: Show in widget as read-only? Or hide completely?

---

**End of Desktop UI Specification**
