# Technical Configuration Reference

**Last Updated**: 2025-11-12

---

## OAuth Configuration

### Credentials

- **Client ID**: `7685ade3-f1ae-4e86-a398-fe7809c0fed1`
- **Tenant ID**: `8a024e99-aba3-4b25-b875-28b0c0ca6096`
- **API Scope**: `api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default`
- **Client Secret**: Retrieved via OTP from Medtech (stored in environment variables)

### Facility IDs

- **Facility ID (UAT)**: `F2N060-E` (Medtech's test facility — use for API testing)
- **Facility ID (Local)**: `F99669-C` (requires Hybrid Connection Manager — use for E2E testing)

### Token Management

- **Token Expiry**: 3599 seconds (~60 minutes)
- **Cache TTL**: 55 minutes (auto-refresh before expiry)
- **Refresh Strategy**: Refresh token at 55-minute mark to avoid expiry

**OAuth Setup**: See implementation guide for OAuth setup details

---

## API Endpoints

### ALEX API Endpoints

- **UAT**: `https://alexapiuat.medtechglobal.com/FHIR`
- **Production**: `https://alexapi.medtechglobal.com/FHIR`

### BFF Endpoint

- **BFF**: `https://api.clinicpro.co.nz` (Static IP: 13.236.58.12)

**BFF Setup**: See Lightsail BFF setup guide for server configuration details

---

## Key Services (Infrastructure)

### OAuth Token Service

**Location**: `/src/lib/services/medtech/oauth-token-service.ts`

**Features**:
- 55-minute token cache with auto-refresh
- Thread-safe for concurrent requests
- Automatic retry on 401 errors
- Token info endpoint for monitoring

**Usage**:
```typescript
import { oauthTokenService } from '@/src/lib/services/medtech'

// Get access token (cached or fresh)
const token = await oauthTokenService.getAccessToken()

// Force refresh (e.g., after 401 error)
const newToken = await oauthTokenService.forceRefresh()

// Get token info (for monitoring)
const info = oauthTokenService.getTokenInfo()
```

**Implementation**: See gateway implementation guide for service details

### ALEX API Client

**Location**: `/src/lib/services/medtech/alex-api-client.ts`

**Features**:
- Auto-injects required headers (`mt-facilityid`, `Authorization`, `Content-Type`) - per Medtech support, only mt-facilityid is needed
- OAuth token management integration
- FHIR OperationOutcome error mapping
- Retry logic for transient failures (401, 429, 503)

**Usage**:
```typescript
import { alexApiClient, AlexApiError } from '@/src/lib/services/medtech'

// GET request
const patientBundle = await alexApiClient.get('/Patient?identifier=...')

// POST request
const mediaResource = await alexApiClient.post('/Media', { ... })
```

**Implementation**: See gateway implementation guide for service details

### Correlation ID Generator

**Location**: `/src/lib/services/medtech/correlation-id.ts`

**Features**:
- UUID v4 generation
- Header extraction support

**Usage**:
```typescript
import { generateCorrelationId, getOrGenerateCorrelationId } from '@/src/lib/services/medtech'

// Generate new correlation ID
const correlationId = generateCorrelationId()

// In Next.js API route: get or generate from request
const correlationId = getOrGenerateCorrelationId(request.headers)
```

### FHIR Types

**Location**: `/src/lib/services/medtech/types.ts`

**Available Types**:
- `FhirBundle<T>` - FHIR Bundle (search results, transactions)
- `FhirPatient` - Patient resource
- `FhirMedia` - Media resource (clinical images)
- `FhirTask` - Task resource
- `FhirOperationOutcome` - Error responses
- `FhirCodeableConcept` - Coded concepts (body site, laterality, etc.)
- `FhirReference` - Resource references
- `FhirIdentifier` - Resource identifiers

---

## API Endpoints (Next.js Routes)

### Test & Monitoring

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/medtech/test?nhi=ZZZ0016` | GET | Test FHIR connectivity (uses real ALEX API client) | ✅ Working |
| `/api/medtech/token-info` | GET | OAuth token cache status (monitoring) | ✅ Working |

### Widget API

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/medtech/capabilities` | GET | Feature flags and coded value lists | ⚠️ Mock |
| `/api/medtech/mobile/initiate` | POST | Generate QR code for mobile handoff | ⚠️ Mock |
| `/api/medtech/attachments/upload-initiate` | POST | Prepare file metadata | ⚠️ Mock |
| `/api/medtech/attachments/commit` | POST | Commit images to encounter | ⚠️ Mock (ready for real ALEX integration) |

**Note**: Mock endpoints are controlled by `NEXT_PUBLIC_MEDTECH_USE_MOCK` environment variable.

---

## Frontend Widget Components

**Location**: `/src/medtech/images-widget/`

### Desktop Components

| Component | File | Purpose |
|-----------|------|---------|
| CapturePanel | `CapturePanel.tsx` | File upload and drag & drop |
| ThumbnailStrip | `ThumbnailStrip.tsx` | Horizontal thumbnail navigation with badges |
| ImagePreview | `ImagePreview.tsx` | Image display with zoom controls |
| MetadataForm | `MetadataForm.tsx` | Metadata entry form |
| MetadataChips | `MetadataChips.tsx` | Laterality, body site, view, type chips |
| ApplyMetadataModal | `ApplyMetadataModal.tsx` | Bulk metadata application modal |
| CommitDialog | `CommitDialog.tsx` | Commit confirmation with inbox/task options |
| QRPanel | `QRPanel.tsx` | QR code generation for mobile handoff |
| ErrorModal | `ErrorModal.tsx` | Error display and retry |
| PartialFailureDialog | `PartialFailureDialog.tsx` | Partial commit failure handling |
| ImageEditModal | `ImageEditModal.tsx` | Image editing (planned) |

### Mobile Components

| Component | File | Purpose |
|-----------|------|---------|
| Mobile Page | `/app/(medtech)/medtech-images/mobile/page.tsx` | Mobile capture interface |

### Hooks

| Hook | File | Purpose |
|------|------|---------|
| useCapabilities | `useCapabilities.ts` | Fetch feature flags |
| useCommit | `useCommit.ts` | Commit images to encounter |
| useImageCompression | `useImageCompression.ts` | Compress images <1MB |
| useQRSession | `useQRSession.ts` | QR session management |

### Services

| Service | File | Purpose |
|---------|------|---------|
| compression | `compression.ts` | Image compression (HEIC→JPEG, EXIF stripping) |
| mock-medtech-api | `mock-medtech-api.ts` | Mock API client (for development) |

### State Management

| Store | File | Purpose |
|-------|------|---------|
| imageWidgetStore | `imageWidgetStore.ts` | Zustand store for widget state |

---

## Technical Conventions

### Folder Structure

- **Widget Code**: `src/medtech/images-widget/` for widget components
- **Infrastructure**: `src/lib/services/medtech/` for infrastructure services

### Route Groups

- **Pages**: `app/(medtech)/` - Route groups don't appear in URLs
- **API Routes**: `app/api/(integration)/medtech/` - Route groups don't appear in URLs

### Import Paths

- **Widget Components**: Use `@/src/medtech/...` for widget components
- **Infrastructure**: Use `@/src/lib/services/medtech/...` for infrastructure

### Environment Variables

**Required Variables**:
```bash
# OAuth Configuration
MEDTECH_CLIENT_ID=7685ade3-f1ae-4e86-a398-fe7809c0fed1
MEDTECH_CLIENT_SECRET=<from Medtech>
MEDTECH_TENANT_ID=8a024e99-aba3-4b25-b875-28b0c0ca6096
MEDTECH_API_SCOPE=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default

# ALEX API Configuration
MEDTECH_API_BASE_URL=https://alexapiuat.medtechglobal.com/FHIR
MEDTECH_FACILITY_ID=F2N060-E

# Feature Flags
NEXT_PUBLIC_MEDTECH_USE_MOCK=true  # Set to false when ready for real API
```

**Environment Variables**: See environment variables guide for setup instructions

---

## Code Structure Reference

### Infrastructure Services

```
src/lib/services/medtech/
├── oauth-token-service.ts    # OAuth token management
├── alex-api-client.ts        # ALEX API client
├── correlation-id.ts         # Correlation ID generation
└── types.ts                  # FHIR type definitions
```

### Widget Components

```
src/medtech/images-widget/
├── components/               # React components
│   ├── CapturePanel.tsx
│   ├── ThumbnailStrip.tsx
│   ├── ImagePreview.tsx
│   ├── MetadataForm.tsx
│   ├── MetadataChips.tsx
│   ├── ApplyMetadataModal.tsx
│   ├── CommitDialog.tsx
│   ├── QRPanel.tsx
│   ├── ErrorModal.tsx
│   ├── PartialFailureDialog.tsx
│   └── ImageEditModal.tsx
├── hooks/                    # React hooks
│   ├── useCapabilities.ts
│   ├── useCommit.ts
│   ├── useImageCompression.ts
│   └── useQRSession.ts
├── services/                 # Services
│   ├── compression.ts
│   └── mock-medtech-api.ts
└── stores/                   # State management
    └── imageWidgetStore.ts
```

### API Routes

```
app/api/(integration)/medtech/
├── test/route.ts             # Test endpoint
├── token-info/route.ts      # Token info endpoint
├── capabilities/route.ts    # Capabilities endpoint
├── mobile/
│   └── initiate/route.ts    # Mobile QR initiation
└── attachments/
    ├── upload-initiate/route.ts
    └── commit/route.ts      # Commit images
```

### Pages

```
app/(medtech)/medtech-images/
├── page.tsx                  # Desktop widget page
└── mobile/
    └── page.tsx              # Mobile capture page
```

---

## External Documentation

- **ALEX API Documentation**: https://alexapidoc.medtechglobal.com/ (Source of Truth)
- **Medtech Evolution User Guide**: https://insight.medtechglobal.com/download/user-guide-medtech-evolution-layout/ (Widget placement reference)
- **FHIR R4 Spec**: https://hl7.org/fhir/R4/

---

*This document provides technical configuration reference.*

