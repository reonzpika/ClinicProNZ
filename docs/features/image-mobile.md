# ClinicPro Mobile Image Capture System

## Overview

ClinicPro's Mobile Image Capture system enables healthcare professionals to capture, review, and upload clinical images directly from mobile devices during consultations. The system integrates seamlessly with the desktop recording workflow, providing secure image storage, real-time signalling, and comprehensive clinical documentation.

## System Architecture

### Core Components
- **WebRTC Camera Interface**: Native camera access with optimised clinical imaging settings
- **Photo Review & Management**: Multi-photo selection, preview, and quality control
- **S3 Upload Pipeline**: Direct cloud storage with presigned URL security
- **Real-time Notifications**: Ably-powered desktop signal to refresh
- **Clerk Authentication**: Same account across desktop and mobile

### Data Flow Pipeline
```
Camera Capture → Photo Review → Batch Processing → S3 Upload → Desktop Signal → Clinical Documentation
```

## Mobile Image Capture Workflow

### Features
- **Clinical-Optimised Camera**: Back-facing camera preference with professional settings
- **Multi-Photo Sessions**: Capture multiple images before upload decision
- **Quality Control**: Preview, delete, and retake functionality
- **Batch Upload**: Efficient multiple image processing with progress tracking
- **Desktop Integration**: Signal desktop on new uploads to refetch
- **Secure Storage**: Direct S3 upload with server-generated presigned URLs

### Technical Characteristics
- **Image Optimisation**: 800px maximum dimension for bandwidth efficiency
- **Format Standards**: JPEG/WebP support with automatic compression
- **Authentication**: Clerk session on mobile; no tokens
- **Upload Resilience**: Sequential upload with individual failure handling
- **Progress Tracking**: Real-time upload progress with error reporting

### Mobile Workflow Steps
1. Desktop shows QR that links to `/mobile`
2. Mobile opens `/mobile` and signs in (Clerk)
3. Images captured via WebRTC interface; review and batch upload
4. Uploads go to S3 via presigned URLs
5. Server signals desktop to refresh images
6. Images associated with current clinical session

## Upload & Storage Architecture

### S3 Integration
- **Presigned URLs**: Secure direct upload without server transit
- **Organised Storage**: `consultations/{sessionId}/` or equivalent structure
- **Server-Side Encryption**: AES256 encryption for healthcare compliance

### Upload Strategy
```typescript
// Sequential upload pattern for connection stability
for (const photo of photosToUpload) {
  try {
    await uploadSinglePhoto(photo);
  } catch (error) {
    // Individual failure handling - continue with remaining photos
  }
}
```

### Progress Management
- **Individual Tracking**: Per-photo upload progress monitoring
- **Batch Coordination**: Overall session upload status management
- **Error Isolation**: Single photo failures don't affect batch completion
- **Retry Logic**: Failed uploads remain available for re-attempt

## Real-time Desktop Integration

### Ably Communication
- Desktop listens on `user:{userId}` and refetches on image upload signals.

### Desktop Synchronisation
- **Upload Notifications**: Real-time signals when images become available
- **Session Association**: Automatic linking to current patient consultation

## Authentication & Security
- **Clerk Authentication**: Shared identity across devices
- **Presigned URL Security**: Time-limited S3 access
- **Encrypted Storage**: AES256 server-side encryption

## State Management & UI Flow

### Mobile State Transitions
```typescript
type MobileState = 'connected' | 'camera' | 'reviewing' | 'uploading' | 'error';

// Workflow progression
'connected' → 'camera' → 'reviewing' → 'uploading' → 'connected'
```

## File Structure & Code Organisation

### Mobile Image Components
```
src/features/clinical/mobile/components/
├── WebRTCCamera.tsx                  # Core camera interface with clinical settings
├── PhotoReview.tsx                   # Multi-photo review and upload management
└── MobileRecordingQRV2.tsx          # QR links to /mobile

app/(integration)/mobile/
└── page.tsx                          # Main mobile interface with integrated camera workflow
```

### API Endpoints
```
app/api/(business)/uploads/
└── presign/route.ts                  # Presigned URL generation
```

---

*This document reflects the simplified Clerk-auth mobile imaging workflow.*
