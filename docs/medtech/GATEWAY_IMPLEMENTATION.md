# Integration Gateway Implementation

**Date**: 2025-10-31  
**Status**: ✅ OAuth Service Complete | Ready for Testing  
**Location**: `/src/lib/services/medtech/`

---

## Overview

Integration Gateway services for Medtech ALEX API integration:

1. **OAuth Token Service** - 55-min token cache with auto-refresh
2. **ALEX API Client** - Auto header injection, error handling, retry logic
3. **Correlation ID Generator** - UUID v4 for request tracing
4. **FHIR Types** - TypeScript definitions for FHIR R4 resources

---

## Services

### 1. OAuth Token Service

**Location**: `/src/lib/services/medtech/oauth-token-service.ts`

**Features**:
- ✅ Client credentials OAuth flow with Azure AD
- ✅ Token caching with 55-minute TTL (refreshes before 60-min expiry)
- ✅ Thread-safe for concurrent requests
- ✅ Automatic retry on 401 errors
- ✅ Force refresh capability

**Usage**:
```typescript
import { oauthTokenService } from '@/src/lib/services/medtech'

// Get access token (cached or fresh)
const token = await oauthTokenService.getAccessToken()

// Force refresh (e.g., after 401 error)
const newToken = await oauthTokenService.forceRefresh()

// Get token info (for monitoring)
const info = oauthTokenService.getTokenInfo()
console.log(info)
// {
//   isCached: true,
//   expiresIn: 3240000, // milliseconds
//   expiresAt: 1730390400000 // timestamp
// }
```

**Environment Variables Required**:
```bash
MEDTECH_CLIENT_ID=7685ade3-f1ae-4e86-a398-fe7809c0fed1
MEDTECH_CLIENT_SECRET=Zub8Q~oBMwpgCJzif6Nn2RpRlIbt6q6g1y3ZhcID
MEDTECH_TENANT_ID=8a024e99-aba3-4b25-b875-28b0c0ca6096
MEDTECH_API_SCOPE=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default
```

---

### 2. ALEX API Client

**Location**: `/src/lib/services/medtech/alex-api-client.ts`

**Features**:
- ✅ Auto-injects required headers (`Authorization`, `mt-facilityid`, `mt-correlationid`, `mt-appid`, `Content-Type`)
- ✅ OAuth token management (uses token service)
- ✅ Correlation ID generation and propagation
- ✅ FHIR OperationOutcome error mapping
- ✅ Automatic retry on 401 Unauthorized
- ✅ Structured error responses

**Usage**:
```typescript
import { alexApiClient, AlexApiError } from '@/src/lib/services/medtech'
import type { FhirBundle, FhirPatient } from '@/src/lib/services/medtech/types'

// GET request
try {
  const patientBundle = await alexApiClient.get<FhirBundle<FhirPatient>>(
    '/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|ZZZ0016'
  )
  console.log(patientBundle)
} catch (error) {
  if (error instanceof AlexApiError) {
    console.error('ALEX API Error:', {
      message: error.message,
      statusCode: error.statusCode,
      correlationId: error.correlationId,
      operationOutcome: error.operationOutcome
    })
  }
}

// POST request
const mediaResource = await alexApiClient.post('/Media', {
  resourceType: 'Media',
  status: 'completed',
  content: {
    contentType: 'image/jpeg',
    data: base64ImageData
  }
})

// With custom correlation ID
const customCorrelationId = 'my-correlation-id'
const result = await alexApiClient.get('/Patient/123', {
  correlationId: customCorrelationId
})
```

**Environment Variables Required**:
```bash
MEDTECH_API_BASE_URL=https://alexapiuat.medtechglobal.com/FHIR
MEDTECH_FACILITY_ID=F2N060-E
# Plus OAuth variables from above
```

---

### 3. Correlation ID Generator

**Location**: `/src/lib/services/medtech/correlation-id.ts`

**Features**:
- ✅ UUID v4 generation
- ✅ Extract from request headers (x-correlation-id, x-request-id, traceparent)
- ✅ Get or generate (reuse existing or create new)

**Usage**:
```typescript
import { generateCorrelationId, getOrGenerateCorrelationId } from '@/src/lib/services/medtech'

// Generate new correlation ID
const correlationId = generateCorrelationId()

// In Next.js API route: get or generate from request
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const correlationId = getOrGenerateCorrelationId(request.headers)
  // Use correlationId in logs and ALEX API calls
}
```

---

### 4. FHIR Types

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

**Usage**:
```typescript
import type { FhirMedia, FhirCodeableConcept } from '@/src/lib/services/medtech/types'

const bodySite: FhirCodeableConcept = {
  coding: [{
    system: 'http://snomed.info/sct',
    code: '40983000',
    display: 'Forearm'
  }]
}

const media: FhirMedia = {
  resourceType: 'Media',
  status: 'completed',
  bodySite,
  content: {
    contentType: 'image/jpeg',
    data: base64Data
  }
}
```

---

## Test Endpoints

### 1. Test Endpoint (FHIR API Connectivity)

**URL**: `GET /api/medtech/test?nhi=ZZZ0016`

**Purpose**: Test OAuth token acquisition and FHIR API connectivity

**Response** (Success):
```json
{
  "success": true,
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "duration": 1234,
  "environment": {
    "baseUrl": "https://alexapiuat.medtechglobal.com/FHIR",
    "facilityId": "F2N060-E",
    "hasClientId": true,
    "hasClientSecret": true
  },
  "tokenInfo": {
    "isCached": true,
    "expiresIn": 3240
  },
  "fhirResult": {
    "resourceType": "Bundle",
    "type": "searchset",
    "total": 1,
    "patientCount": 1,
    "firstPatient": {
      "id": "12345",
      "name": { "family": "Test", "given": ["Patient"] },
      "gender": "male",
      "birthDate": "1990-01-01"
    }
  }
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "ALEX API error: 403 Forbidden",
  "statusCode": 403,
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "duration": 1234
}
```

**How to Test**:
```bash
# From production (Vercel) - should work (IP allow-listed)
curl https://your-app.vercel.app/api/medtech/test

# With custom NHI
curl https://your-app.vercel.app/api/medtech/test?nhi=ABC1234
```

---

### 2. Token Info Endpoint (Monitoring)

**URL**: `GET /api/medtech/token-info`

**Purpose**: Check OAuth token cache status

**Response**:
```json
{
  "tokenCache": {
    "isCached": true,
    "expiresIn": {
      "seconds": 3240,
      "minutes": 54,
      "formatted": "54m 0s"
    },
    "expiresAt": "2025-10-31T12:00:00.000Z"
  },
  "environment": {
    "baseUrl": "https://alexapiuat.medtechglobal.com/FHIR",
    "facilityId": "F2N060-E",
    "tenantId": "8a024e99...",
    "hasClientId": true,
    "hasClientSecret": true
  }
}
```

**How to Test**:
```bash
# Check token status
curl https://your-app.vercel.app/api/medtech/token-info
```

**Security Note**: Consider restricting this endpoint to admin users in production.

---

## Error Handling

### AlexApiError

All ALEX API errors are wrapped in `AlexApiError`:

```typescript
class AlexApiError extends Error {
  statusCode: number        // HTTP status code
  correlationId: string     // Correlation ID for tracing
  operationOutcome?: FhirOperationOutcome // FHIR error details
}
```

### Common Error Codes

| Status | Meaning | Cause | Solution |
|--------|---------|-------|----------|
| 401 | Unauthorized | Token expired or invalid | Auto-retried once; check credentials if persists |
| 403 | Forbidden | IP not allow-listed or wrong facility | Verify IP with Medtech; check `MEDTECH_FACILITY_ID` |
| 404 | Not Found | Resource doesn't exist | Normal; verify resource ID |
| 429 | Too Many Requests | Rate limit exceeded | Implement exponential backoff |
| 500 | Internal Server Error | ALEX API error | Check `operationOutcome` for details |

### Error Handling Example

```typescript
import { alexApiClient, AlexApiError } from '@/lib/services/medtech'

try {
  const result = await alexApiClient.get('/Patient/123')
} catch (error) {
  if (error instanceof AlexApiError) {
    // ALEX API error
    console.error('ALEX API Error:', {
      status: error.statusCode,
      message: error.message,
      correlationId: error.correlationId
    })

    // Check for specific errors
    if (error.statusCode === 403) {
      // IP not allow-listed or wrong facility
      return { error: 'Access denied. Contact support.' }
    }

    if (error.statusCode === 404) {
      // Resource not found (normal)
      return { error: 'Patient not found' }
    }

    // Extract FHIR error details
    if (error.operationOutcome) {
      const errors = error.operationOutcome.issue
        .filter(i => i.severity === 'error')
        .map(i => i.diagnostics || i.code)
      console.error('FHIR errors:', errors)
    }
  } else {
    // Other error (network, etc.)
    console.error('Unexpected error:', error)
  }
}
```

---

## Logging

All services log to console with structured data:

**OAuth Token Service**:
```
[Medtech OAuth] Token acquired {
  tokenPrefix: 'eyJ0eXAiOi...',
  expiresIn: 3599,
  cacheTTL: 3300,
  duration: 234
}
```

**ALEX API Client**:
```
[ALEX API] Request {
  method: 'GET',
  endpoint: '/Patient?identifier=...',
  correlationId: '550e8400-e29b-41d4-a716-446655440000',
  facilityId: 'F2N060-E'
}

[ALEX API] Success {
  method: 'GET',
  endpoint: '/Patient?identifier=...',
  status: 200,
  correlationId: '550e8400-e29b-41d4-a716-446655440000',
  duration: 1234
}
```

**Errors**:
```
[ALEX API] Error response {
  statusCode: 403,
  correlationId: '550e8400-e29b-41d4-a716-446655440000',
  errorMessage: 'Access denied',
  operationOutcome: { ... },
  duration: 1234
}
```

---

## Testing from Production

Since IP allow-listing is configured for production (Vercel), test from deployed app:

### 1. Deploy to Vercel

```bash
# Push to main branch (auto-deploys to Vercel)
git add .
git commit -m "feat: add medtech integration gateway"
git push origin main
```

### 2. Test Endpoints

```bash
# Test OAuth and FHIR connectivity
curl https://your-app.vercel.app/api/medtech/test

# Check token cache status
curl https://your-app.vercel.app/api/medtech/token-info
```

### 3. Expected Results

**First Request** (token not cached):
- Duration: ~1-2 seconds (includes OAuth request)
- `tokenInfo.isCached`: false
- Subsequent requests: ~200-500ms (token cached)

**Success Indicators**:
- ✅ `success: true`
- ✅ `tokenInfo.isCached: true` (on 2nd+ request)
- ✅ `fhirResult.total` > 0 (if patient exists)
- ✅ `statusCode` not in response (no errors)

**Common Issues**:
- ❌ 401: Check credentials in Vercel env vars
- ❌ 403: IP not allow-listed (unlikely - already configured)
- ❌ 404: Patient not found (normal - try different NHI)
- ❌ Connection timeout: ALEX API down (check Medtech status)

---

## BFF Deployment (Lightsail)

### Architecture

**Problem**: Vercel serverless uses dynamic IPs (not allow-listed by Medtech)

**Solution**: BFF (Backend-for-Frontend) on Lightsail with static IP

```
Browser → Vercel (Frontend)
          ↓
          Lightsail BFF (13.236.58.12 - allow-listed) → ALEX API
```

### Current BFF Setup

**Location**: `/home/deployer/app` on Lightsail
**Domain**: `https://api.clinicpro.co.nz`
**Static IP**: `13.236.58.12` (allow-listed with Medtech)
**Stack**: Node.js + Express + Nginx reverse proxy

**Infrastructure**:
- ✅ Nginx: Proxies `api.clinicpro.co.nz:443` → `localhost:3000`
- ✅ SSL: Let's Encrypt certificate configured
- ✅ Node.js: Running on port 3000
- ⚠️ Currently: Placeholder app (needs Medtech integration)

### Deployment Files

Located in `/home/deployer/app/`:

**1. `.env`** - Environment variables:
```bash
MEDTECH_CLIENT_ID=7685ade3-f1ae-4e86-a398-fe7809c0fed1
MEDTECH_CLIENT_SECRET=Zub8Q~oBMwpgCJzif6Nn2RpRlIbt6q6g1y3ZhcID
MEDTECH_TENANT_ID=8a024e99-aba3-4b25-b875-28b0c0ca6096
MEDTECH_API_SCOPE=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default
MEDTECH_API_BASE_URL=https://alexapiuat.medtechglobal.com/FHIR
MEDTECH_FACILITY_ID=F2N060-E
PORT=3000
```

**2. `services/oauth-token-service.js`** - OAuth with 55-min cache

**3. `services/alex-api-client.js`** - ALEX API client with header injection

**4. `index.js`** - Express server with Medtech endpoints

**5. `package.json`** - Dependencies (express, dotenv)

### Available Endpoints

**Health**:
- `GET /health` - Health check

**Medtech**:
- `GET /api/medtech/token-info` - Token cache status
- `GET /api/medtech/test?nhi=ZZZ0016` - Test FHIR connectivity

### Deployment Process

**SSH to Lightsail**:
```bash
ssh ubuntu@13.236.58.12
sudo su - deployer
cd ~/app
```

**Update code** (create/update files as needed)

**Install & restart**:
```bash
npm install
sudo kill $(pgrep -f "node index.js")
nohup node index.js > server.log 2>&1 &
```

**Test**:
```bash
curl http://localhost:3000/health
curl "http://localhost:3000/api/medtech/test?nhi=ZZZ0016"
```

### Testing from BFF

**Internal** (from Lightsail):
```bash
curl http://localhost:3000/api/medtech/test
```

**External** (from anywhere):
```bash
curl https://api.clinicpro.co.nz/api/medtech/test
```

**Expected**: ✅ Success (uses allow-listed IP 13.236.58.12)

---

## Next Steps

### ✅ Completed
- OAuth Token Service with 55-min cache
- ALEX API Client with header injection
- Correlation ID generator
- FHIR type definitions
- Test endpoints (Vercel)
- BFF infrastructure identified (Lightsail)

### 📋 Next (Current)

1. **Deploy to Lightsail BFF** (Priority 1 - In Progress)
   - Add OAuth service to BFF
   - Configure environment variables
   - Test from BFF (uses allow-listed IP)
   - Verify GET Patient successful

2. **Update Vercel to Use BFF** (After BFF deployed)
   - Change `MEDTECH_API_BASE_URL` to `https://api.clinicpro.co.nz`
   - Vercel calls BFF, BFF calls ALEX

3. **Build Gateway API Endpoints** (Blocked until Medtech response)
   - `POST /api/medtech/media` - Commit images to ALEX
   - Awaiting clinical metadata schema from Medtech

4. **Frontend Integration**
   - Build frontend with mock backend (not blocked)
   - Replace mock with Gateway API when ready

---

## Security Notes

### ✅ Production Security

- Credentials stored in Vercel environment variables ✅
- Tokens cached server-side only (never exposed to browser) ✅
- Correlation IDs logged for audit trail ✅
- Token prefix logged (first 10 chars only) ✅

### ⚠️ Future Improvements

- [ ] Rate limiting on test endpoints (prevent abuse)
- [ ] Restrict token-info endpoint to admin users
- [ ] Implement request signing for additional security
- [ ] Add monitoring/alerting for token refresh failures

---

## References

- **ALEX API Documentation**: https://alexapidoc.medtechglobal.com/
- **FHIR R4 Spec**: https://hl7.org/fhir/R4/
- **OAuth Test Results**: `/docs/medtech/OAUTH_TEST_RESULTS.md`
- **Quickstart Guide**: `/docs/medtech/medtech-alex-uat-quickstart.md`
