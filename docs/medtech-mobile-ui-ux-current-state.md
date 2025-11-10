# Medtech Integration - Current Mobile UI/UX Description

## Overview

The Medtech integration provides a mobile image capture workflow that allows healthcare providers to capture medical images using mobile devices and sync them to the desktop widget for annotation and commit to Medtech Evolution. The mobile experience is accessed via QR code scanning from the desktop widget.

---

## Architecture & Flow

### 1. **Desktop-to-Mobile Handoff**

**Location:** `/app/(medtech)/medtech-images/page.tsx` (Desktop Widget)

**QR Code Generation:**
- Desktop widget includes a collapsible QR panel (`QRPanel` component)
- QR code is generated via `POST /api/medtech/mobile/initiate` endpoint
- Returns:
  - `mobileUploadUrl`: URL with token parameter (`/medtech-images/mobile?t=<token>`)
  - `qrSvg`: SVG data URI of QR code
  - `ttlSeconds`: Time-to-live (currently 600 seconds / 10 minutes)

**QR Panel Features:**
- QR code display (200x200px)
- Countdown timer showing remaining time until expiration
- Expired state overlay (red badge)
- Regenerate button to create new session
- Mobile URL displayed for manual entry
- Instructions: "Scan QR → Capture → Images appear automatically"

**State Management:**
- Uses `useQRSession` hook for session lifecycle
- Tracks expiration state and remaining time
- Auto-generates on mount if not already generated

---

## 2. **Mobile Page**

**Location:** `/app/(medtech)/medtech-images/mobile/page.tsx`

**Route:** `/medtech-images/mobile?t=<token>`

### Current Implementation

#### **Page Structure**

**Header:**
- Title: "ClinicPro Images"
- Subtitle: "Mobile Upload"
- Centered layout, max-width container

#### **Step 1: Capture (`capture` step)**

**UI Components:**
- Card container with header "Capture Images"
- Two primary action buttons:
  1. **"Open Camera"** button
     - Icon: Camera (lucide-react)
     - Triggers file input with `capture="environment"` attribute
     - Opens device camera (rear camera preferred)
  2. **"Choose from Gallery"** button
     - Icon: Upload (lucide-react)
     - Variant: outline
     - Triggers standard file picker
- Both inputs accept `image/*` with `multiple` attribute
- Hidden file inputs (triggered programmatically)

**User Experience:**
- Single-step capture flow
- Multiple image selection supported
- Tip displayed: "You can select multiple images at once. Images will be compressed automatically before upload."

**Limitations:**
- No live camera preview
- No image editing/cropping before upload
- No metadata capture on mobile
- No progress indication during compression

#### **Step 2: Review (`review` step)**

**UI Components:**
- Card container with header "Review Images (N)"
- Grid layout: 2 columns, square aspect ratio thumbnails
- Each thumbnail:
  - Displays image preview (object-cover)
  - Rounded borders
  - Uses `URL.createObjectURL()` for preview

**Actions:**
- **"Add More"** button (outline variant)
  - Returns to capture step
  - Allows additional image selection
- **"Upload"** button (primary)
  - Currently shows alert: "Upload functionality: Images would be compressed and sent to desktop"
  - Resets to capture step after "upload"
  - **Not fully implemented** - placeholder functionality

**User Experience:**
- Simple grid preview of selected images
- No individual image removal
- No reordering capability
- No metadata editing
- Upload action is non-functional (alert placeholder)

---

## 3. **Current Limitations & Missing Features**

### **Mobile Page Issues:**

1. **No Real Upload Implementation**
   - Upload button shows alert instead of actual upload
   - No API integration for mobile upload
   - No WebSocket/polling for desktop sync

2. **No Image Processing**
   - Images not compressed on mobile
   - No size validation
   - No format conversion

3. **No Metadata Capture**
   - Cannot set body site, laterality, view, type on mobile
   - All metadata must be added on desktop after upload

4. **No Progress Feedback**
   - No upload progress indicator
   - No compression progress
   - No connection status

5. **No Error Handling**
   - No network error handling
   - No validation error display
   - No retry mechanism

6. **No Token Validation**
   - Token parameter checked for existence but not validated
   - No expiration check on mobile page
   - No session validation

7. **No Desktop Sync**
   - No mechanism to push images to desktop widget
   - No real-time updates
   - No connection between mobile and desktop sessions

8. **Limited Mobile UX**
   - No swipe gestures for navigation
   - No pull-to-refresh
   - No offline support
   - No image editing (crop, rotate, annotate)

---

## 4. **Desktop Widget Integration**

**Expected Flow (Not Yet Implemented):**
1. Mobile captures images
2. Images uploaded to backend
3. Images appear in desktop widget thumbnail strip
4. Desktop user annotates and commits

**Current State:**
- Desktop widget has full annotation/commit functionality
- No connection to mobile uploads
- Mobile uploads are isolated

---

## 5. **API Endpoints**

### **Mobile Initiate**
- **Route:** `POST /api/medtech/mobile/initiate`
- **Current:** Returns mock token and QR code
- **Expected:** Should create session, validate encounter, return secure token

### **Mobile Upload**
- **Route:** Not yet implemented
- **Expected:** Should accept images from mobile, store temporarily, link to session

### **Session Polling**
- **Route:** Not yet implemented
- **Expected:** Desktop widget should poll for new images from mobile session

---

## 6. **Design Patterns**

### **Component Structure:**
```
/app/(medtech)/medtech-images/
  ├── page.tsx (Desktop widget)
  └── mobile/
      └── page.tsx (Mobile capture)
```

### **State Management:**
- Desktop: Zustand store (`imageWidgetStore`)
- Mobile: Local React state (no shared state)
- No synchronization between mobile and desktop

### **Styling:**
- Tailwind CSS
- shadcn/ui components (Button, Card)
- Responsive design (max-width container)
- Slate color scheme

---

## 7. **User Journey**

### **Current Flow:**

1. **Desktop:**
   - User opens widget in Medtech Evolution
   - Clicks "Show QR" button
   - QR panel displays with code and timer
   - User scans QR code with mobile device

2. **Mobile:**
   - Mobile browser opens `/medtech-images/mobile?t=<token>`
   - User sees "Capture Images" screen
   - User taps "Open Camera" or "Choose from Gallery"
   - User selects one or more images
   - Images appear in review grid
   - User taps "Upload"
   - **Alert appears** (no actual upload)
   - User returns to capture screen

3. **Desktop:**
   - **No images appear** (upload not implemented)
   - User continues with desktop upload only

### **Intended Flow (Not Yet Implemented):**

1. Mobile captures and uploads images
2. Images appear in desktop widget automatically
3. Desktop user annotates metadata
4. Desktop user commits to Medtech

---

## 8. **Technical Stack**

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI Library:** React, shadcn/ui
- **Icons:** lucide-react
- **State:** React hooks (mobile), Zustand (desktop)
- **Styling:** Tailwind CSS
- **File Handling:** HTML5 File API

---

## 9. **Accessibility & Responsiveness**

### **Current State:**
- Basic responsive layout (max-width container)
- Semantic HTML structure
- Icon + text labels on buttons
- No ARIA labels or screen reader support
- No keyboard navigation optimization

### **Mobile-Specific:**
- Touch-friendly button sizes
- Grid layout adapts to screen size
- No landscape/portrait optimization
- No safe area insets for notched devices

---

## 10. **Security Considerations**

### **Current:**
- Token passed in URL (visible in browser history)
- No token validation on mobile page
- No session expiration check
- No encryption for image transfer

### **Should Have:**
- Secure token validation
- Session expiration handling
- Encrypted image transfer
- Token refresh mechanism

---

## Summary

The current mobile UI/UX provides a **basic capture interface** with:
- ✅ QR code generation and display
- ✅ Mobile page routing
- ✅ Camera and gallery access
- ✅ Image preview grid
- ❌ No actual upload functionality
- ❌ No desktop synchronization
- ❌ No metadata capture
- ❌ No error handling
- ❌ No progress feedback

The mobile experience is **incomplete** and requires significant development to achieve the intended workflow of seamless mobile-to-desktop image transfer and annotation.
