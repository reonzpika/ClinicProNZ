# ClinicPro Mobile Image Capture System

## Overview

ClinicPro's Mobile Image Capture system enables healthcare professionals to capture, review, and upload clinical images directly from mobile devices during consultations. The system integrates seamlessly with the desktop recording workflow, providing secure image storage, real-time synchronisation, and comprehensive clinical documentation.

## System Architecture

### Core Components
- **WebRTC Camera Interface**: Native camera access with optimised clinical imaging settings
- **Photo Review & Management**: Multi-photo selection, preview, and quality control
- **S3 Upload Pipeline**: Direct cloud storage with presigned URL security
- **Real-time Notifications**: Ably-powered desktop sync and upload status
- **Mobile Token Authentication**: Secure device pairing and API access

### Data Flow Pipeline
```
Camera Capture → Photo Review → Batch Processing → S3 Upload → Desktop Notification → Clinical Documentation
```

## Mobile Image Capture Workflow

### Features
- **Clinical-Optimised Camera**: Back-facing camera preference with professional settings
- **Multi-Photo Sessions**: Capture multiple images before upload decision
- **Quality Control**: Preview, delete, and retake functionality
- **Batch Upload**: Efficient multiple image processing with progress tracking
- **Desktop Integration**: Real-time notifications to desktop clinical interface
- **Secure Storage**: Direct S3 upload bypassing server storage limitations

### Technical Characteristics
- **Image Optimisation**: 800px maximum dimension for bandwidth efficiency
- **Format Standards**: JPEG/WebP support with automatic compression
- **Authentication**: Mobile token validation with database verification
- **Upload Resilience**: Sequential upload with individual failure handling
- **Progress Tracking**: Real-time upload progress with error reporting

### Mobile Workflow Steps
1. GP initiates camera mode on paired mobile device
2. Mobile captures clinical images using WebRTC camera interface
3. Images stored locally for review and quality control
4. Batch upload decision with preview and delete options
5. Sequential S3 upload with progress monitoring
6. Desktop receives real-time notification of uploaded images
7. Images automatically associated with current clinical session

## Photo Capture System

### WebRTC Camera Component
```typescript
// Camera configuration optimised for clinical use
const constraints: MediaStreamConstraints = {
  video: {
    facingMode: { ideal: 'environment' }, // Back camera preferred
    width: { ideal: 1920, max: 1920 },
    height: { ideal: 1080, max: 1080 },
  },
  audio: false,
};
```

### Image Processing Pipeline
- **Canvas Compression**: Client-side resize to 800px maximum dimension
- **Blob Generation**: Optimised file size with maintained clinical quality
- **Metadata Preservation**: Timestamp, filename, and capture context
- **Status Tracking**: Complete lifecycle from capture to upload completion

### Photo Data Structure
```typescript
type CapturedPhoto = {
  id: string;                    // Unique identifier
  blob: Blob;                    // Compressed image data
  timestamp: string;             // Capture time (ISO format)
  filename: string;              // Generated filename
  status: 'captured' | 'uploading' | 'uploaded' | 'failed';
};
```

## Upload & Storage Architecture

### S3 Integration
- **Presigned URLs**: Secure direct upload without server transit
- **Organised Storage**: `mobile-uploads/{tokenId}/{uniqueFilename}` structure
- **Metadata Tagging**: Clinical context and mobile session information
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
```typescript
// Desktop notification on successful upload
if (uploadedPhotos.length > 0 && tokenState.token) {
  sendImageNotification(tokenState.token, uploadedPhotos.length);
}
```

### Desktop Synchronisation
- **Upload Notifications**: Real-time alerts when images become available
- **Session Association**: Automatic linking to current patient consultation
- **Status Updates**: Upload progress visible on desktop interface
- **Clinical Context**: Images tagged with session and mobile token data

## Authentication & Security

### Mobile Token Validation
```typescript
// Database validation for upload endpoints
const tokenData = await db
  .select()
  .from(mobileTokens)
  .where(eq(mobileTokens.token, mobileToken))
  .limit(1);

if (!tokenData.length || !tokenData[0]?.isActive) {
  return NextResponse.json({ error: 'Invalid mobile token' }, { status: 401 });
}
```

### Security Features
- **Token-Based Access**: No permanent credentials on mobile device
- **Presigned URL Security**: Time-limited S3 access (5-minute expiry)
- **Database Validation**: Server-side token verification for all operations
- **Encrypted Storage**: AES256 server-side encryption for healthcare compliance
- **Access Logging**: Usage tracking with timestamp updates

## State Management & UI Flow

### Mobile State Transitions
```typescript
type MobileState = 'connected' | 'camera' | 'reviewing' | 'uploading' | 'error';

// Workflow progression
'connected' → 'camera' → 'reviewing' → 'uploading' → 'connected'
```

### Photo Session Management
- **Local Storage**: Images held in browser memory until upload decision
- **Status Persistence**: Upload progress maintained across UI states  
- **Error Recovery**: Failed uploads preserved for retry attempts
- **Session Cleanup**: Automatic cleanup after successful batch upload

### User Experience Flow
1. **Camera Access**: One-tap access to clinical camera interface
2. **Photo Capture**: Professional camera controls with clinical optimisation
3. **Review Mode**: Multi-photo preview with individual delete options
4. **Upload Decision**: Batch upload or individual retake capabilities
5. **Progress Tracking**: Real-time upload status with error handling
6. **Completion**: Automatic return to recording mode after upload

## File Structure & Code Organisation

### Mobile Image Components
```
src/features/clinical/mobile/components/
├── WebRTCCamera.tsx                  # Core camera interface with clinical settings
├── PhotoReview.tsx                   # Multi-photo review and upload management
└── MobileRecordingQRV2.tsx          # QR pairing with image capture integration

app/(integration)/mobile/
└── page.tsx                          # Main mobile interface with integrated camera workflow
```

### Image Capture Integration
```
app/(integration)/mobile/page.tsx     # Main mobile page with camera workflow
├── handleCameraMode()                # Transition to camera interface
├── handleCameraCapture()             # Process captured photo blobs
├── handleCameraClose()               # Camera exit with conditional review
├── uploadSinglePhoto()               # Individual photo upload pipeline
├── handleUploadAll()                 # Batch upload coordination
└── Camera workflow state management  # Complete UI state transitions
```

### API Endpoints
```
app/api/(business)/uploads/
└── presign/route.ts                  # Mobile token validation + presigned URL generation
    ├── Mobile token authentication   # Database validation for mobile uploads
    ├── S3 presigned URL generation   # Secure direct upload URLs
    ├── Metadata tagging             # Clinical context and session tracking
    └── Upload path organisation     # mobile-uploads/{tokenId}/ structure
```

### Authentication Utilities
```
src/shared/utils/index.ts
└── createAuthHeadersForMobile()      # Mobile token header creation
    ├── x-mobile-token header         # Primary mobile authentication
    ├── x-user-tier header            # User permission context
    └── FormData compatibility        # No Content-Type override
```

## Database Schema & Metadata

### Mobile Token Management
```sql
-- Mobile authentication tokens
CREATE TABLE mobile_tokens (
  token UUID PRIMARY KEY,
  userId TEXT NOT NULL,
  isActive BOOLEAN DEFAULT true,
  isPermanent BOOLEAN DEFAULT false,
  lastUsedAt TIMESTAMP DEFAULT NOW(),
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### S3 Metadata Structure
```typescript
// S3 object metadata for uploaded images
Metadata: {
  'mobile-token-id': string,      // Mobile session identifier
  'upload-type': 'mobile',        // Upload source classification
  'uploaded-by': string,          // User identifier
  'original-filename': string,    // Client-provided filename
  'upload-timestamp': string,     // Server upload time
}
```

### Storage Organisation
```
S3 Bucket Structure:
├── mobile-uploads/
│   └── {tokenId}/                    # Mobile session grouping
│       ├── {timestamp}-{uuid}.jpg    # Individual image files
│       ├── {timestamp}-{uuid}.png    # Multiple format support
│       └── ...                       # Additional session images
```

## Performance Characteristics

### Image Processing
- **Capture Latency**: <500ms from shutter to local preview
- **Compression Time**: <1 second for 800px resize and quality optimisation
- **Upload Speed**: Dependent on connection, ~2-5 seconds per image
- **Progress Updates**: 50ms intervals during upload operations

### Memory Management
- **Local Storage**: Images held as Blobs until upload completion
- **Automatic Cleanup**: Memory cleared after successful batch upload
- **Error Preservation**: Failed uploads retained for user retry decision
- **Session Isolation**: Each mobile session independently managed

### Network Optimisation
- **Sequential Uploads**: Prevents connection overwhelming
- **Bandwidth Efficiency**: 800px maximum reduces data usage
- **Progress Streaming**: Real-time upload status updates
- **Error Resilience**: Individual failure isolation

## Error Handling & Recovery

### Camera Access Failures
```typescript
// Graceful camera initialisation with fallback
try {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  // Camera successfully accessed
} catch (error) {
  setError(`Camera access failed: ${error.message}`);
  // User-friendly error messaging with retry options
}
```

### Upload Failure Management
- **Individual Isolation**: Single photo failures don't affect batch
- **Status Tracking**: Clear visual indication of failure states
- **Retry Availability**: Failed photos remain in review mode
- **Progressive Success**: Partial batch completion with continuation options

### Authentication Error Recovery
- **Token Validation**: Clear error messages for expired tokens
- **Re-pairing Options**: Graceful prompt for QR code re-scan
- **Session Continuity**: Captured photos preserved during auth recovery
- **Desktop Notification**: Auth failures communicated to desktop

### Network Resilience
- **Connection Monitoring**: Upload pause on network loss
- **Automatic Retry**: Failed uploads automatically queued for retry
- **Progress Persistence**: Upload progress maintained across disconnections
- **User Feedback**: Clear status communication during network issues

## Clinical Workflow Integration

### Standard GP Image Workflow
1. **Session Context**: Images automatically associated with current patient
2. **Capture Decision**: Clinical judgement on image necessity during consultation
3. **Quality Control**: Review and retake options for optimal clinical documentation
4. **Batch Processing**: Efficient multi-image upload for comprehensive documentation
5. **Desktop Integration**: Immediate availability on desktop clinical interface
6. **Documentation**: Images become part of complete consultation record

### Recording System Integration
- **Seamless Transition**: Camera access without interrupting audio recording
- **Workflow Continuity**: Return to recording mode after image completion
- **Session Preservation**: Recording context maintained throughout image workflow
- **Desktop Coordination**: Real-time status updates to primary consultation interface

## Scalability & Performance

### Concurrent Usage
- **Multi-User Support**: Independent mobile sessions per GP
- **Resource Isolation**: Individual mobile token and upload paths
- **Database Efficiency**: Indexed token validation with minimal overhead
- **S3 Scalability**: Unlimited storage with organised path structure

### Data Management
- **Automatic Cleanup**: Expired tokens and inactive sessions
- **Storage Optimisation**: Image compression balances quality and bandwidth
- **Metadata Efficiency**: Structured tagging for future retrieval and analysis
- **Audit Trail**: Complete upload history with timestamp tracking

---

*This document provides comprehensive coverage of ClinicPro's Mobile Image Capture System. For implementation details, refer to the relevant source code and API documentation.*
