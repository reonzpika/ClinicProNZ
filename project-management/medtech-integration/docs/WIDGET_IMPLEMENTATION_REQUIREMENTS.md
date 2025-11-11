# Widget Implementation Requirements

**Based on**: FHIR API Test Results (2025-11-11)  
**Status**: Ready for Implementation  
**Priority**: High (Core Functionality Validated)

---

## Executive Summary

The widget's primary function has been **validated**: it can successfully upload images to Medtech via ALEX API. This document outlines the technical requirements for implementing the full widget based on test findings.

---

## 1. Required Context on Widget Launch

The widget **cannot** browse patients or encounters. It **must** receive context when launched from Medtech Evolution.

### Mandatory Context

| Parameter | Type | Source | Example | Notes |
|-----------|------|--------|---------|-------|
| `patientId` | string | Medtech Evolution | `14e52e16edb7a435bfa05e307afd008b` | FHIR Patient resource ID |
| `facilityId` | string | Configuration | `F2N060-E` | HPI Facility ID |

### Optional Context

| Parameter | Type | Source | Example | Notes |
|-----------|------|--------|---------|-------|
| `encounterId` | string | Medtech Evolution | `abc123...` | FHIR Encounter ID (if available) |
| `nhi` | string | Medtech Evolution | `ZZZ0016` | National Health Index |
| `practitionerId` | string | Medtech Evolution | `9bf0832...` | Current practitioner |

### Context Passing Methods

**Option A: URL Parameters** (Simplest)
```
https://your-widget.vercel.app/medtech-images?patientId=14e52e16edb7a435bfa05e307afd008b&facilityId=F2N060-E
```

**Option B: JWT Token** (Most Secure)
```
https://your-widget.vercel.app/medtech-images?token=eyJhbGciOi...
```
Decode token to extract patient context.

**Option C: PostMessage API** (Cross-origin communication)
```javascript
window.addEventListener('message', (event) => {
  if (event.origin === 'medtech-expected-origin') {
    const { patientId, facilityId } = event.data;
  }
});
```

**Recommendation**: Start with Option A (URL parameters) for simplicity. Move to Option B (JWT) for production.

---

## 2. Required FHIR Media Resource Format

Based on successful test (201 Created), the Media resource **must** include:

### Mandatory Fields

```typescript
interface MediaResource {
  resourceType: 'Media';
  
  // MANDATORY: Unique identifier for tracking
  identifier: Array<{
    system: string;  // e.g., 'https://clinicpro.co.nz/image-id'
    value: string;   // e.g., UUID '550e8400-e29b-41d4-a716-446655440000'
  }>;
  
  // MANDATORY: Status
  status: 'completed';  // Always use 'completed' for uploaded images
  
  // MANDATORY: Media type
  type: {
    coding: Array<{
      system: 'http://terminology.hl7.org/CodeSystem/media-type';
      code: 'image';
      display: 'Image';
    }>;
  };
  
  // MANDATORY: Patient reference
  subject: {
    reference: string;  // e.g., 'Patient/14e52e16edb7a435bfa05e307afd008b'
  };
  
  // MANDATORY: Image data
  content: {
    contentType: string;  // e.g., 'image/png', 'image/jpeg'
    data: string;         // Base64-encoded image
  };
}
```

### Optional Fields

```typescript
interface MediaResourceOptional {
  // Optional: Timestamp
  createdDateTime?: string;  // ISO 8601 format
  
  // Optional: Title/description
  content?: {
    title?: string;  // Display title for image
  };
  
  // Optional: Encounter linkage (if encounter ID available)
  context?: {
    reference: string;  // e.g., 'Encounter/abc123...'
  };
}
```

### Example Complete Resource

```json
{
  "resourceType": "Media",
  "identifier": [
    {
      "system": "https://clinicpro.co.nz/image-id",
      "value": "550e8400-e29b-41d4-a716-446655440000"
    }
  ],
  "status": "completed",
  "type": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/media-type",
        "code": "image",
        "display": "Image"
      }
    ]
  },
  "subject": {
    "reference": "Patient/14e52e16edb7a435bfa05e307afd008b"
  },
  "createdDateTime": "2025-11-11T15:30:00+13:00",
  "content": {
    "contentType": "image/jpeg",
    "data": "/9j/4AAQSkZJRgABAQEAAA...",
    "title": "Clinical Photo - Left Arm Rash"
  }
}
```

---

## 3. Image Upload Workflow

### Frontend (Widget) → BFF → ALEX API

```
┌─────────────────┐
│   User Action   │
│ (Capture/Upload)│
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   Frontend Widget       │
│  (Vercel)               │
│                         │
│  1. Compress image      │
│  2. Validate size       │
│  3. Generate metadata   │
└────────┬────────────────┘
         │ POST /api/medtech/attachments/commit
         │ { images: [...], patientId, ... }
         ▼
┌─────────────────────────┐
│   Lightsail BFF         │
│  (api.clinicpro.co.nz)  │
│                         │
│  1. Get OAuth token     │
│  2. Convert to base64   │
│  3. Generate UUID       │
│  4. Build FHIR Media    │
│  5. POST to ALEX API    │
└────────┬────────────────┘
         │ POST /FHIR/Media
         │ { resourceType: 'Media', ... }
         ▼
┌─────────────────────────┐
│     ALEX API (UAT)      │
│  (Medtech Cloud)        │
│                         │
│  1. Validate resource   │
│  2. Create Media        │
│  3. Return 201 Created  │
└────────┬────────────────┘
         │ { id: '73ab84f...', ... }
         ▼
┌─────────────────────────┐
│ Medtech Evolution       │
│ (On-Premises)           │
│                         │
│  Image appears in:      │
│  - Inbox                │
│  - Daily Record         │
└─────────────────────────┘
```

### Step-by-Step Implementation

#### Step 1: Frontend - Capture & Prepare

```typescript
// In widget component
async function handleImageCommit(images: File[], patientId: string) {
  // 1. Compress images (target < 1MB each)
  const compressedImages = await Promise.all(
    images.map(img => compressImage(img, { maxSizeMB: 1 }))
  );
  
  // 2. Prepare payload
  const payload = {
    patientId,
    facilityId: 'F2N060-E',
    images: compressedImages.map(img => ({
      file: img,
      contentType: img.type,
      title: generateTitle(img),
      // Optional metadata (if captured)
      laterality: selectedLaterality,
      bodySite: selectedBodySite,
    })),
  };
  
  // 3. Call BFF
  const response = await fetch('/api/medtech/attachments/commit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  // 4. Handle response
  if (response.ok) {
    const result = await response.json();
    showSuccess(`${result.mediaIds.length} images uploaded`);
  } else {
    handleError(response);
  }
}
```

#### Step 2: BFF - Convert & POST

```typescript
// In /app/api/(integration)/medtech/attachments/commit/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patientId, facilityId, images } = body;
  
  // 1. Get OAuth token (cached)
  const token = await oauthTokenService.getAccessToken();
  
  // 2. Process each image
  const mediaResources = await Promise.all(
    images.map(async (img) => {
      // Convert image to base64
      const base64 = await fileToBase64(img.file);
      
      // Generate unique identifier
      const imageId = crypto.randomUUID();
      
      // Build FHIR Media resource
      return {
        resourceType: 'Media',
        identifier: [
          {
            system: 'https://clinicpro.co.nz/image-id',
            value: imageId,
          },
        ],
        status: 'completed',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/media-type',
              code: 'image',
              display: 'Image',
            },
          ],
        },
        subject: {
          reference: `Patient/${patientId}`,
        },
        createdDateTime: new Date().toISOString(),
        content: {
          contentType: img.contentType,
          data: base64,
          title: img.title,
        },
      };
    })
  );
  
  // 3. POST to ALEX API
  const results = await Promise.all(
    mediaResources.map(async (media) => {
      try {
        const response = await alexApiClient.post('/Media', media, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/fhir+json',
            'mt-facilityid': facilityId,
          },
        });
        
        return {
          success: true,
          mediaId: response.data.id,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    })
  );
  
  // 4. Return results
  return NextResponse.json({
    success: results.every(r => r.success),
    mediaIds: results.filter(r => r.success).map(r => r.mediaId),
    errors: results.filter(r => !r.success).map(r => r.error),
  });
}
```

---

## 4. Image Processing Requirements

### Compression

**Target**: < 1MB per image (recommended)

**Reasons**:
- Faster upload times
- Reduced bandwidth costs
- Better performance for mobile handoff

**Implementation**:
```typescript
import imageCompression from 'browser-image-compression';

async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  
  return await imageCompression(file, options);
}
```

### Base64 Conversion

```typescript
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix (data:image/png;base64,)
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

### Supported Formats

| Format | MIME Type | Tested | Notes |
|--------|-----------|--------|-------|
| PNG | `image/png` | ✅ Yes | Lossless, larger files |
| JPEG | `image/jpeg` | ⏳ Pending | Lossy, smaller files |
| HEIC | `image/heic` | ⏳ Pending | iOS default, needs conversion |

**Recommendation**: Convert HEIC to JPEG before upload.

---

## 5. Error Handling

### Expected Errors

| Error | Status | Cause | Handling |
|-------|--------|-------|----------|
| Missing identifier | 400 | Identifier field not included | Ensure identifier is always added |
| Invalid patient reference | 400/404 | Patient ID doesn't exist | Validate patient ID before upload |
| Token expired | 401 | OAuth token expired | Refresh token via BFF |
| Facility not found | 403 | Facility ID incorrect | Verify facility ID configuration |
| Service unavailable | 503 | Medtech service down | Retry after delay (exponential backoff) |

### Error Handling Code

```typescript
async function handleUploadError(error: any) {
  const status = error.statusCode || error.status;
  
  switch (status) {
    case 400:
      // Validation error
      showError('Invalid image data. Please check the image and try again.');
      logError('Validation failed', error.diagnostics);
      break;
      
    case 401:
      // Token expired
      showError('Session expired. Refreshing...');
      await refreshToken();
      retryUpload();
      break;
      
    case 403:
      // Permission denied
      showError('Access denied. Please contact support.');
      logError('Permission denied', error);
      break;
      
    case 503:
      // Service unavailable
      showError('Medtech service temporarily unavailable. Retrying in 5 seconds...');
      setTimeout(() => retryUpload(), 5000);
      break;
      
    default:
      showError('Upload failed. Please try again.');
      logError('Unknown error', error);
  }
}
```

---

## 6. Testing Requirements

### Unit Tests

- [ ] Base64 conversion works correctly
- [ ] UUID generation is unique
- [ ] Media resource builder includes all required fields
- [ ] Identifier format is correct

### Integration Tests

- [ ] BFF can POST to ALEX API
- [ ] OAuth token is cached correctly
- [ ] Multiple images can be uploaded in sequence
- [ ] Partial failures are handled (some images succeed, some fail)

### End-to-End Tests

- [ ] Image uploaded from widget appears in Medtech Evolution
- [ ] Image appears in correct patient's record
- [ ] Image appears in daily record
- [ ] Image accessible in Medtech Inbox
- [ ] Multiple images uploaded together appear correctly

---

## 7. Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Image compression | < 1s per image | Using web worker |
| Base64 conversion | < 500ms per image | In-browser |
| API call (POST Media) | < 2s | From BFF to ALEX |
| Total upload time (1 image) | < 5s | End-to-end |
| Total upload time (5 images) | < 15s | Parallel uploads |

---

## 8. Security Considerations

### Data in Transit

- All API calls over HTTPS
- OAuth Bearer token in Authorization header
- Base64-encoded images (not encrypted, but encoded)

### Data at Rest

- Images stored in Medtech database (secured by Medtech)
- No image storage in widget (temporary only)
- BFF does not store images (proxy only)

### Access Control

- Widget requires patient context (cannot browse)
- OAuth token includes `patient.media.write` permission
- Facility ID scopes access to specific practice

---

## 9. Configuration

### Environment Variables (BFF)

```bash
# Medtech ALEX API
MEDTECH_CLIENT_ID=7685ade3-f1ae-4e86-a398-fe7809c0fed1
MEDTECH_CLIENT_SECRET=[secret]
MEDTECH_TENANT_ID=8a024e99-aba3-4b25-b875-28b0c0ca6096
MEDTECH_API_BASE_URL=https://alexapiuat.medtechglobal.com/FHIR
MEDTECH_FACILITY_ID=F2N060-E  # For testing; use practice-specific in production

# Application
CLINICPRO_IMAGE_ID_SYSTEM=https://clinicpro.co.nz/image-id
```

### Environment Variables (Frontend)

```bash
# API Endpoints
NEXT_PUBLIC_BFF_URL=https://api.clinicpro.co.nz
NEXT_PUBLIC_MEDTECH_USE_MOCK=false  # Set to true for development without BFF

# Feature Flags
NEXT_PUBLIC_ENABLE_IMAGE_EDITOR=false  # Not yet implemented
NEXT_PUBLIC_MAX_IMAGES=10
NEXT_PUBLIC_MAX_IMAGE_SIZE_MB=5
```

---

## 10. Next Steps (Implementation)

### Priority 1: Core Upload Flow

1. **Update BFF commit endpoint** (`/app/api/(integration)/medtech/attachments/commit/route.ts`)
   - Add identifier generation (UUID)
   - Add base64 conversion
   - Build FHIR Media resource
   - POST to ALEX API
   - Handle 201 Created response
   - Return Media IDs

2. **Test with real images**
   - Test JPEG upload
   - Test PNG upload
   - Test multiple images
   - Verify in Medtech Evolution

### Priority 2: Error Handling

3. **Implement error handling**
   - Handle 400 Bad Request (validation)
   - Handle 401 Unauthorized (token refresh)
   - Handle 503 Service Unavailable (retry)
   - Display user-friendly error messages

4. **Add retry logic**
   - Exponential backoff for 503 errors
   - Token refresh for 401 errors
   - Max 3 retries per image

### Priority 3: Production Readiness

5. **Hybrid Connection Manager setup**
   - Install on local Medtech Evolution
   - Configure for facility F99669-C
   - Test full E2E flow

6. **Widget launch mechanism**
   - Determine launch method (iFrame, new tab, etc.)
   - Implement context passing
   - Configure in Medtech Evolution

---

## Document Version

**Version**: 1.0  
**Date**: 2025-11-11  
**Status**: Ready for Implementation  
**Based on**: FHIR API Test Results (201 Created validated)

---

**END OF DOCUMENT**
