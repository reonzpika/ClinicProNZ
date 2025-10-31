# Next Steps — Medtech ALEX Integration

**Date**: 2025-10-30  
**Status**: ✅ Documentation Complete | 📧 Ready to Contact Medtech  
**Next Phase**: Week 2 — Send Support Ticket & Start Gateway Development

---

## 📊 Current Status Summary

### ✅ **Completed (Week 1)**

All documentation has been updated to reflect **ALEX API Documentation as the source of truth**:

1. **✅ Quickstart Doc** (`medtech-alex-uat-quickstart.md`)
   - Corrected headers: `mt-facilityid`, `Content-Type: application/fhir+json`
   - Added base URLs: UAT and Production
   - Added token caching guidance (55-min refresh)
   - Added prominent disclaimer linking to ALEX docs

2. **✅ Images Widget PRD** (`images-widget-prd.md`)
   - Added source of truth disclaimer at top
   - Clarified API contracts as Gateway abstraction (not direct FHIR)
   - Documented FHIR → REST translation responsibility

3. **✅ ALEX API Review** (`alex-api-review-2025-10-30.md`)
   - Comprehensive documentation structure reviewed
   - Architecture details, headers, environments
   - Error handling, reference tables, navigation guide
   - Identified need for clinical metadata examples

4. **✅ IP Allow-listing** — Already configured by Medtech

---

## 📋 Week 2: Awaiting Medtech Response (Current Phase)

### Priority 1: ✅ Email Sent to Medtech Support (2025-10-31)

**Questions Submitted**:
1. **Medtech UI Access for Testing** — Demo Evolution instance for end-to-end testing
2. **Clinical Metadata Schema** — Complete POST Media examples with:
   - Body site field/extension (FHIR R4 `bodySite` or custom?)
   - Laterality specification (within bodySite or separate?)
   - View type field/extension
   - Image classification field/extension
   - DocumentReference auto-creation behaviour
   - Encounter linkage mechanism

**Expected Response**: 3-5 business days

**While Waiting**: Proceed with OAuth token service and Gateway foundation (see below)

---

### Priority 2: Test OAuth Token Acquisition

**Objective**: Verify connectivity with ALEX UAT.

**Tasks**:
1. [ ] Acquire access token using client credentials flow
2. [ ] Test simple GET Patient request
3. [ ] Verify correct headers (`mt-facilityid`, `Content-Type: application/fhir+json`)
4. [ ] Document token expiry and caching behaviour

---

## 🛠️ Week 2-3: Integration Gateway Prototype

### Architecture Decision

**Chosen Approach**: Integration Gateway abstraction layer (as documented in PRD).

**Rationale**:
- **Decouples frontend from FHIR complexity**: Frontend uses simple REST API (`/attachments/commit`)
- **Handles ALEX-specific quirks**: Header injection, token management, extension mapping
- **Enables provider flexibility**: If ClinicPro supports non-Medtech EMRs later, Gateway can adapt without frontend changes
- **Simplifies error handling**: FHIR OperationOutcome → user-friendly messages

---

### Gateway Core Services

**1. OAuth Token Service**

File: `src/services/medtech/oauth-token-service.ts`

Requirements:
- Client credentials flow with Azure AD
- Token cache with 55-minute TTL (in-memory or Redis)
- Auto-refresh before 60-minute expiry
- Retry once on 401 Unauthorized
- Thread-safe for concurrent requests

```typescript
interface TokenService {
  getAccessToken(): Promise<string>;
  clearCache(): void;
}
```

**2. Correlation ID Generator**

File: `src/services/medtech/correlation-id-service.ts`

Requirements:
- Generate UUID v4 per request
- Propagate through all downstream ALEX API calls
- Include in response headers for client-side tracing
- Log correlation ID with all server logs

**3. ALEX API Client**

File: `src/services/medtech/alex-api-client.ts`

Requirements:
- Base HTTP client for all ALEX FHIR requests
- Auto-inject headers:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/fhir+json`
  - `mt-facilityid: ${MEDTECH_FACILITY_ID}`
  - `mt-correlationid: <uuid>`
  - `mt-appid: clinicpro-images-widget`
- Handle FHIR OperationOutcome errors
- Implement retry logic (exponential backoff for 429, 503)
- Request/response logging with correlation IDs

---

### Gateway API Endpoints

**1. GET /api/integrations/medtech/capabilities**

Purpose: Return hardcoded ALEX feature flags and dictionaries (as per PRD).

Implementation:
- Read from config file (no dynamic ALEX API call; ALEX doesn't provide capabilities endpoint)
- Return laterality, body site, view, type coded value lists (pending Medtech response)

**2. POST /api/integrations/medtech/mobile/initiate**

Purpose: Generate QR code for mobile upload session (ClinicPro-managed, not ALEX).

Implementation:
- Generate one-time token (JWT with 10-min expiry)
- Store session in Redis with encounter ID
- Return QR code SVG and mobile URL

**3. POST /api/integrations/medtech/attachments/upload-initiate**

Purpose: Accept mobile file metadata; prepare for upload.

Implementation:
- Validate mobile token
- Store file metadata temporarily (in-memory or temp storage)
- Return file ID for commit phase
- **OR** if using Azure Blob staging: generate signed upload URLs

**4. POST /api/integrations/medtech/attachments/commit**

Purpose: Commit images to Medtech via ALEX FHIR API.

Implementation:
- Map PRD metadata to FHIR extensions (awaiting Medtech response for URLs)
- POST to `https://alexapiuat.medtechglobal.com/FHIR/Media` with:
  - Binary content (base64 inline or Binary reference — awaiting confirmation)
  - Clinical metadata extensions (body site, laterality, view, type)
  - Encounter context
- If inbox routing requested: POST separate Communication resource (or include in Media if supported)
- If task requested: POST Task resource
- Return committed resource IDs (documentReferenceId, mediaId, inboxMessageId, taskId)

**5. Error Mapping Middleware**

File: `src/middleware/fhir-error-mapper.ts`

Requirements:
- Catch FHIR OperationOutcome responses
- Map to user-friendly messages (create mapping table from ALEX docs)
- Include correlation ID in error response
- Log full FHIR error for debugging

---

### Development Phases

**Phase 1: Foundation (Week 2, Days 3-5)**
- [ ] Set up OAuth token service with 55-min cache
- [ ] Implement correlation ID generator
- [ ] Create ALEX API client with header injection
- [ ] Test token acquisition and simple GET Patient call

**Phase 2: Core Gateway (Week 3, Days 1-3)**
- [ ] Implement GET /capabilities (hardcoded config)
- [ ] Implement POST /mobile/initiate (QR generation)
- [ ] Implement POST /attachments/upload-initiate (file metadata handling)

**Phase 3: FHIR Integration (Week 3, Days 4-5)** — *Blocked until Medtech response*
- [ ] Map PRD metadata schema to FHIR extensions (awaiting Medtech response)
- [ ] Implement POST /attachments/commit → POST /FHIR/Media
- [ ] Test with sample JPEG (<1MB, EXIF stripped)
- [ ] Verify image appears in Medtech encounter (if demo instance available)

**Phase 4: Advanced Workflows (Week 4)**
- [ ] Implement inbox routing (POST Communication if needed)
- [ ] Implement task creation (POST Task)
- [ ] Implement error mapping middleware (FHIR errors → user messages)
- [ ] Add request/response logging with correlation IDs

---

## 📊 Success Criteria (End of Week 4)

- [ ] Token service caches token for 55 min; auto-refreshes before expiry
- [ ] All ALEX API requests include correct headers (`mt-*` namespace)
- [ ] POST Media successfully commits image to Medtech encounter
- [ ] Clinical metadata (body site, laterality) is preserved in FHIR extensions
- [ ] Committed image appears in Medtech UI (verify with Medtech support if possible)
- [ ] Error responses include correlation ID and user-friendly messages
- [ ] Integration Gateway provides PRD-compliant REST API to frontend

---

## 🚀 Quick Start (Right Now)

### 1. Test Token Acquisition

**Action**: Use updated quickstart doc to acquire access token.

```bash
# From medtech-alex-uat-quickstart.md
CLIENT_SECRET='<your-secret>'
curl -sS -X POST \
  'https://login.microsoftonline.com/8a024e99-aba3-4b25-b875-28b0c0ca6096/oauth2/v2.0/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_id=7685ade3-f1ae-4e86-a398-fe7809c0fed1' \
  --data-urlencode "client_secret=${CLIENT_SECRET}" \
  --data-urlencode 'grant_type=client_credentials' \
  --data-urlencode 'scope=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default'
```

**Verify**: Token returned with 3600-second expiry.

### 2. Test Simple FHIR Call

**Action**: GET Patient to confirm connectivity.

```bash
TOKEN='<your-access-token>'
curl -sS -X GET \
  'https://alexapiuat.medtechglobal.com/FHIR/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|ZZZ0016' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/fhir+json' \
  -H 'mt-facilityid: F2N060-E' \
  -H "mt-correlationid: $(uuidgen)" \
  -H 'mt-appid: clinicpro-images-widget'
```

**Verify**: Patient resource returned (FHIR Bundle with entry array).

### 3. ✅ Medtech Support Ticket Sent

**Status**: Email sent 2025-10-31
**Awaiting**: Response on clinical metadata schema (3-5 business days)

---

## 📁 Documentation Structure

Your docs folder now contains:

```
docs/
└── medtech/
    ├── README.md                                  # Overview and quick links
    ├── DEVELOPMENT_FLOW_OVERVIEW.md               # High-level development stages
    ├── NEXT_STEPS.md                              # This file (current action plan)
    ├── alex-api-review-2025-10-30.md              # Comprehensive ALEX API reference
    ├── medtech-alex-uat-quickstart.md             # Updated with correct headers, base URLs
    ├── images-widget-prd.md                       # PRD with ALEX source of truth disclaimer
    ├── alex-media-api-findings.md                 # ⭐ Critical gap analysis (NEW)
    ├── email-draft-uat-testing-access.md          # Email template (updated with 7 questions)
    └── ORGANIZATION_SUMMARY.md                    # Folder organization summary
```

---

## 🎯 Your Immediate Actions

1. ✅ **Medtech support ticket sent** (2025-10-31) — awaiting response
2. **Test token acquisition** — verify connectivity with updated headers
3. **Decide on Gateway tech stack** — Node.js/Express? Next.js API routes? Separate service?
4. **Set up OAuth token service** — implement 55-min cache with auto-refresh
5. **Build frontend with mock backend** — not blocked; can proceed in parallel

---

**Questions?** Review `alex-api-review-2025-10-30.md` for detailed ALEX API structure and navigation guide.

**Stuck?** Refer to ALEX API Documentation (https://alexapidoc.medtechglobal.com/) Sections 7-11 as source of truth.

**Need to contact Medtech?** Use `email-draft-uat-testing-access.md` as a template.
