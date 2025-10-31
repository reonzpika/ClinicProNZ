# Next Steps — Medtech ALEX Integration

**Date**: 2025-10-30  
**Status**: Week 1 Complete ✅  
**Next Phase**: Week 2 — ALEX API Deep Dive & Gateway Prototype

---

## ✅ Week 1 Complete

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
   - Comprehensive 12-section documentation structure
   - Architecture details, headers, environments
   - Error handling, reference tables, navigation guide
   - Identified image-specific needs in Section 10

4. **✅ IP Allow-listing** — Already configured by Medtech

---

## 📋 Week 2: ALEX API Deep Dive (Current Phase)

### Priority 1: Review ALEX Documentation Sections 9-10

**Objective**: Extract technical details needed for Integration Gateway implementation.

**Tasks**:

1. **Section 9: Examples** — Look for:
   - [ ] POST Media request example with image
   - [ ] cURL command for Media upload
   - [ ] Sample JSON payloads for clinical metadata
   - [ ] Base64 encoding examples or Binary reference pattern

2. **Section 10: Custom Fields & Extensions** — Extract:
   - [ ] **Body site extension URL** (e.g., `http://alexapi.medtechglobal.com/fhir/StructureDefinition/bodySite`)
   - [ ] **Laterality extension URL** and SNOMED CT codes
   - [ ] **View type extension URL** and internal codes
   - [ ] **Image type extension URL** and internal codes
   - [ ] **Provenance extension** (`DocumentReference.relatesTo`) support for edited images

3. **Section 11: Error Handling** — Document:
   - [ ] All error codes and descriptions
   - [ ] Create mapping table: FHIR error code → user-friendly message
   - [ ] Retry strategies for transient errors (429, 503)

4. **Section 12: Reference Tables** — Check for:
   - [ ] Body site SNOMED CT codes list
   - [ ] Laterality SNOMED CT codes list
   - [ ] Any image-related coded value lists

**Deliverable**: Create `alex-fhir-extensions-reference.md` with all extension URLs and code systems.

---

### Priority 2: Medtech Support Request

**Objective**: Clarify ambiguities in ALEX documentation.

**Questions to Submit** (via Medtech support ticket):

1. **Client ID Clarification**:
   - Quickstart uses: `7685ade3-f1ae-4e86-a398-fe7809c0fed1`
   - API Doc examples show: `24b3d0e8-9096-4763-a1e5-4a4b13257a7a`
   - **Question**: Are these different app registrations (test vs prod)? Which should ClinicPro use?

2. **POST Media Schema** (if not in Section 9):
   - **Request**: Full POST Media example with:
     - Image binary (base64 inline? Separate Binary POST? Multipart?)
     - Clinical metadata extensions (body site, laterality, view, type)
     - Encounter context linkage
     - Expected response structure

3. **DocumentReference Auto-creation**:
   - **Question**: Does POST Media automatically create a DocumentReference, or must we POST both separately?

4. **File Size Limits**:
   - **Question**: What is the server-side hard limit for Media/Binary? (PRD assumes <1MB; confirm sufficient)

5. **Accepted MIME Types**:
   - **Question**: Confirm accepted types: `image/jpeg`, `image/png`, `application/pdf`? Any others?

6. **Inbox Routing**:
   - **Question**: Can POST Media specify inbox recipient directly, or must we POST a separate Communication resource?

7. **Provenance**:
   - **Question**: Does ALEX support `DocumentReference.relatesTo` with `code = transforms` for linking edited images to originals?

**Timeline**: Submit support ticket by end of Week 2, Day 2. Allow 3-5 business days for response.

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
- Return laterality, body site, view, type coded value lists from Section 10/12

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
- Map PRD metadata to FHIR extensions (use URLs from Section 10)
- POST to `https://alexapiuat.medtechglobal.com/FHIR/Media` with:
  - Binary content (base64 inline or Binary reference — determined from Section 9)
  - Clinical metadata extensions (body site, laterality, view, type)
  - Encounter context
- If inbox routing requested: POST separate Communication resource (or include in Media if supported)
- If task requested: POST Task resource
- Return committed resource IDs (documentReferenceId, mediaId, inboxMessageId, taskId)

**5. Error Mapping Middleware**

File: `src/middleware/fhir-error-mapper.ts`

Requirements:
- Catch FHIR OperationOutcome responses
- Map to user-friendly messages using Section 11 reference
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

**Phase 3: FHIR Integration (Week 3, Days 4-5)**
- [ ] Map PRD metadata schema to FHIR extensions (using Section 10 URLs)
- [ ] Implement POST /attachments/commit → POST /FHIR/Media
- [ ] Test with sample JPEG (<1MB, EXIF stripped)
- [ ] Verify image appears in Medtech encounter

**Phase 4: Advanced Workflows (Week 4)**
- [ ] Implement inbox routing (POST Communication if needed)
- [ ] Implement task creation (POST Task)
- [ ] Implement error mapping middleware (Section 11 → user messages)
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

### 1. Review ALEX Docs Section 10

**Action**: Open your ALEX API documentation and navigate to Section 10 (Custom Fields & Extensions).

**Look for**:
- Extension URLs for clinical metadata (body site, laterality, view, type)
- Example payloads showing extension usage
- SNOMED CT code lists for body site and laterality

**Document findings** in: `docs/alex-fhir-extensions-reference.md`

### 2. Test Token Acquisition

**Action**: Use updated quickstart doc to acquire access token.

```bash
# From medtech-alex-uat-quickstart.md Section 4
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

### 3. Test Simple FHIR Call

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

### 4. Submit Medtech Support Ticket

**Action**: Prepare and submit support ticket with 7 questions (see Priority 2 above).

**Include**:
- Reference to ClinicPro Images Widget integration
- Your client ID and facility ID
- Specific questions about POST Media, extensions, and inbox routing

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

1. **Review Section 10** of ALEX API docs — extract extension URLs
2. **Test token acquisition** — verify connectivity with updated headers
3. **Submit Medtech support ticket** — clarify POST Media schema and extensions
4. **Decide on Gateway tech stack** — Node.js/Express? Next.js API routes? Separate service?
5. **Set up OAuth token service** — implement 55-min cache with auto-refresh

---

**Questions?** Review `alex-api-review-2025-10-30.md` for detailed ALEX API structure and navigation guide.

**Stuck?** Refer to ALEX API Documentation (https://alexapidoc.medtechglobal.com/) Sections 7-11 as source of truth.

**Need to contact Medtech?** Use `email-draft-uat-testing-access.md` as a template.
