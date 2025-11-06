# ALEX API Documentation Review
**Date**: 2025-10-30  
**Source**: https://alexapidoc.medtechglobal.com/  
**Format**: Postman Collection Documentation  
**Version**: Current (v2.9, Sept 2025)

---

## Executive Summary

### What is ALEX?
**ALEX® (API for Linking External Solutions)** is Medtech's FHIR R4-compliant API gateway that provides secure, real-time access to clinical data in Medtech Evolution and Medtech32 practice management systems.

### Architecture
- **10-component Azure solution**: Gateway, Azure AD OAuth, API Gateway, FHIR Server, Middleware, Azure Relay (on-prem PMS bridge), Event Hub, Data Lake, Table Storage, DevOps Agent
- **Hybrid connectivity**: Uses Azure Relay for secure communication with on-premises PMS installations
- **Dual environments**: UAT Sandbox (`alexapiuat`) and Production (`alexapi`)

### Key Capabilities for Images Widget
✅ **POST Media with image files** (v2.2, Aug 2024)  
✅ **DocumentReference enhancements** with location extensions (v2.8, June 2025)  
✅ **Task write back** for desktop workflow actions (July 2023)  
✅ **Binary/Blobkey retrieval** for attachments  
⚠️ **Clinical metadata extensions** (body site, laterality) — request examples from Medtech support  
⚠️ **Inbox routing** — needs clarification on recipient specification

### Critical Requirements
1. ✅ **IP allow-listing**: Already configured and allowed by Medtech
2. **Azure AD app registration**: OTP-gated client secret retrieval
3. **Correct headers**: `mt-facilityid`, `mt-correlationid`, `mt-appid`, `application/fhir+json`
4. **Token management**: 1-hour expiry; cache and refresh at 55 min

---

## Table of Contents (24 Resource Categories)

### 1. **Authentication**
- POST Get Token - UAT

### 2. **Patient** (Patient, PractitionerRole)
- 14 endpoints covering GET (NHI, demographics, enrolment) and POST operations
- Supports Bundle creation

### 3. **Patient V2** (Enhanced)
- **Update Patient** subfolder (15 PUT operations for granular updates)
- All V1 GET operations
- Notable: Account Group updates, NOK contact management

### 4. **Provider** (Practitioner)
- 7 endpoints: HPI CPN, Medical Council ID, filtering by facility/name

### 5. **Provider V2** (Enhanced)
- Added: Nursing Council ID, HPI Facility/Person ID filtering

### 6. **Practice** (Location)
- GET Location Details
- **ALEX Online Form Configuration Retrieval** (relevant for enrolment forms)

### 7. **Medication** (MedicationRequest)
- 13 endpoints: retrieve Rx, long-term/confidential/inactive flags
- **POST/PUT Approved Prescriptions Write Back**

### 8. **Immunisation** (Immunization)
- 6 endpoints: retrieve by NHI, ID, resource, with date filtering

### 9. **Medical Warning** (AllergyIntolerance)
- **V2 subfolder** (7 endpoints)
- V1 endpoints (7 endpoints)
- Support for inactive records retrieval

### 10. **Screening** (Observation)
- **V2 subfolder** (9 endpoints including **POST Observation write back**)
- GET screening terms from setup
- Confidential flag support

### 11. **Classification** (Condition)
- 14 endpoints: long-term, inactive, confidential flags
- **POST Direct condition write back**
- **POST Condition approved write back**

### 12. **Appointments** (Slot, Appointment)
- **SLOT Retrieval** (6 endpoints: free slots, provider-based, time ranges)
- **Retrieve Booked Appointment** (7 endpoints)
- **Appointment Book** (2 POST endpoints)
- **Appointment Arrive** (1 PUT endpoint)
- **Appointment Cancel** (1 PUT endpoint)

### 13. **Lab Results** (DiagnosticReport)
- **V2 subfolder** (7 endpoints)
- V1 endpoints (7 endpoints)
- Confidential flag, date filtering

### 14. **Consultation** (DocumentReference)
- 8 endpoints: retrieve by NHI, ID, resource
- **POST Consultation Note Write Back**
- Confidential flag support

### 15. **Patient Summary**
- **V2 subfolder**: GET using NHI
- V1 endpoint

### 16. **RSD** (DocumentReference, Binary) ⭐
- **V2 subfolder** (9 endpoints)
- **GET Retrieve the Attachment data using the Blobkey** (critical for images)
- Confidential flag, date filtering

### 17. **Inbox Write Back** (Communication/Media) ⭐⭐⭐
- **V2 subfolder**:
  - **POST Inbox Write Back - Media** (IMAGE HANDLING!)
  - **POST Inbox Write Back - Document Reference**
  - **POST Inbox Write Back - General Communication Message**
- V1 endpoints (4 POST operations including prescriptions)

### 18. **Outbox** (Communication)
- 4 endpoints: POST write back, GET web form records

### 19. **Invoice**
- 6 endpoints: POST with services/subsidies, GET by resource ID

### 20. **ChargeItem**
- 4 endpoints: retrieve service details by practice/location

### 21. **Task** ⭐
- **POST Staff/Patient task write back** (relevant for desktop "Create Task" action)
- 6 GET endpoints: by NHI, patient ID, provider ID/HPI

### 22. **Accident Details** (ExplanationOfBenefit)
- 4 endpoints: GET by NHI, patient ID, resource ID

### 23. **Account Balance** (Account)
- 4 endpoints: GET by NHI, patient ID, resource ID

### 24. **Inbox Retrieval** (Communication/Media)
- **V2 subfolder** (17 endpoints)
  - Media records retrieval (7 endpoints)
  - Communication resource retrieval (10 endpoints including **attachment data via Blobkey**)
- V1 endpoints (mirror V2 structure)

---

## Solution Architecture

### Components
1. **Gateway** — API entry point and routing
2. **Azure AD** — OAuth 2.0 authentication provider
3. **API Gateway** — Request validation and throttling
4. **FHIR Server** — Core FHIR R4 resource store
5. **Middleware** — Business logic and transformation layer
6. **Azure Relay** — Secure hybrid connectivity to on-premises PMS
7. **Event Hub** — Async event streaming
8. **Data Lake** — Analytics and audit storage
9. **Table Storage** — Metadata and configuration
10. **DevOps Agent** — CI/CD pipeline

### Environments

| Environment | Base URL | Purpose |
|-------------|----------|---------|
| **UAT Sandbox** | `https://alexapiuat.medtechglobal.com/FHIR` | Integration testing |
| **Production** | `https://alexapi.medtechglobal.com/FHIR` | Live clinical data |

**Note**: All endpoints append resource paths to base URL (e.g., `/Patient`, `/Media`, `/DocumentReference`)

---

## Getting Started Workflow

### UAT Testing
1. **Request Azure AD account** from Medtech
2. **Obtain app registration** (client ID + scope)
3. **Wait for OTP** (one-time password for client secret retrieval)
4. **Retrieve client secret** via OTP POST (see quickstart doc)
5. **IP allow-listing**: Provide vendor IP addresses to Medtech
6. **Test token acquisition** from Azure AD
7. **Make test FHIR calls** to UAT sandbox

### Production Workflow
1. **Repeat Azure AD setup** for production tenant (different client ID/secret)
2. **Confirm IP allow-listing** for production
3. **Deploy with prod credentials** (never reuse UAT secrets)
4. **Monitor via correlation IDs** and audit logs

---

## Connectivity Requirements

### 1. Azure AD Account Setup
- Medtech provisions **app registration** in their Azure AD tenant
- You receive: `client_id`, `tenant_id`, `scope`
- Client secret obtained via **OTP-gated endpoint** (one-off setup)

### 2. API Scopes and Permissions
- **Scope format**: `api://<resource-id>/.default`
- **UAT scope**: `api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default`
- **Production scope**: (different resource ID; provided by Medtech)
- **Permissions**: Granted at app registration level; no user consent required

### 3. App ID and Token Setup
- **Token lifetime**: ~3600 seconds (1 hour)
- **Refresh strategy**: Client credentials flow has no refresh token; re-authenticate before expiry
- **Caching**: Server-side only; never expose tokens to browser

### 4. IP Allow-listing
- **Requirement**: Medtech firewall restricts API access by source IP
- **Provide**: Static IPs for all environments (dev, staging, prod)
- **NAT Gateway**: If using cloud hosting, ensure consistent outbound IP
- **Turnaround**: Allow 2-5 business days for IP provisioning

---

## Authentication & Authorization

### Flow Overview
1. **Request access token** from Azure AD OAuth 2.0 endpoint
2. **Include token** in all FHIR API requests as `Authorization: Bearer <token>`
3. **Use correct environment** base URL (UAT vs Production)
4. **Refresh token** before expiry (fetch new token at ~3300s / 55 min)

### OAuth 2.0 Token Endpoint

**UAT/Production** (same tenant for both):
```
https://login.microsoftonline.com/8a024e99-aba3-4b25-b875-28b0c0ca6096/oauth2/v2.0/token
```

**POST Body** (x-www-form-urlencoded):
- `client_id`: `<your-app-client-id>`
- `client_secret`: `<retrieved-via-otp>`
- `grant_type`: `client_credentials`
- `scope`: `api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default`

**Response**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3599
}
```

---

## Request Headers (Complete Set)

### Required Headers (All Requests)

| Header | Example Value | Description |
|--------|---------------|-------------|
| `Authorization` | `Bearer eyJ0eXAi...` | OAuth 2.0 access token from Azure AD |
| `Content-Type` | `application/fhir+json` | FHIR JSON format (required for POST/PUT) |
| `mt-facilityid` | `F2N060-E` | Facility/location identifier (UAT example) |

### Optional/Contextual Headers

| Header | Example Value | Description |
|--------|---------------|-------------|
| `mt-correlationid` | `550e8400-e29b-41d4-a716-446655440000` | UUID for request tracing across systems |
| `mt-appid` | `clinicpro-images-widget` | Application identifier for audit logs |
| `mt-roles` | `gp,admin` | User roles (if applicable; may be derived from token) |
| `mt-env` | `uat` or `prod` | Environment indicator (redundant; URL implies env) |

**Note**: Previous examples showed `Facility-Id` — correct header is **`mt-facilityid`** (Medtech namespace prefix).

---

## Documentation Structure

The ALEX API documentation includes:

| Topic | Content | Critical For |
|-------|---------|--------------|
| **Introduction** | Quick overview | ALEX and FHIR® API purpose |
| **Changelog & Release Notes** | Version history | Breaking changes, new features |
| **Solution Design** | Architecture | 10-component Azure solution |
| **Environments** | Base URLs | UAT and Production endpoints |
| **Getting Started** | Workflows | UAT testing, Production deployment |
| **Connectivity Requirements** | Prerequisites | Azure AD, API scopes, IP allow-listing |
| **Authentication & Authorization** ⭐ | OAuth flow | Token requests, headers |
| **API Resource Catalogue** ⭐ | Endpoints | 24 resource categories, 200+ endpoints |
| **Examples** ⭐ | Sample code | cURL commands, JSON payloads |
| **Custom Fields & Extensions** ⭐⭐⭐ | Extensions | FHIR extensions for clinical metadata |
| **Error Handling** ⭐ | Errors | 401 errors, invalid payload errors |
| **Reference Tables** | Mappings | Coded value mappings |

### Examples (cURL & JSON Samples)

Available examples include:
- **Token request**: cURL for Azure AD OAuth flow
- **Resource retrieval**: GET Patient, GET Medication, etc.
- **A/C Holder**: JSON payload with account holder extension
- **WINZ No**: JSON payload with welfare number extension
- **Gender/Sex at Birth**: JSON payload with gender mapping
- **Country & Visa**: JSON payload with ISO 3166 codes
- **PDF Diagnostic Report**: DocumentReference with PDF attachment

### Custom Fields, Extensions & Mapping ⭐⭐⭐

**Critical for Images Widget** — contains extension schemas for:

1. **A/C Holder Extension**
   - URL: `http://alexapi.medtechglobal.com/fhir/StructureDefinition/acholder`
   - Type: `valueBoolean` (true if patient is account holder)

2. **Account Held By Extension**
   - URL: `http://alexapi.medtechglobal.com/fhir/StructureDefinition/acheldby`
   - Type: `valueReference` (patient reference if A/C holder is someone else)

3. **WINZ No Extension**
   - URL: `http://alexapi.medtechglobal.com/fhir/StructureDefinition/winzno`
   - Type: `valueString` (Work and Income NZ number)

4. **Country Extension** (ISO 3166)
   - For patient nationality/citizenship
   - Uses ISO 3166-1 alpha-2 codes

5. **Visa Extensions**
   - Visa type and status codes
   - Expiry dates

6. **Sex at Birth & Gender Mapping**
   - Extension URL: `http://hl7.org.nz/fhir/StructureDefinition/sex-at-birth`
   - Type: `valueCodeableConcept` with `http://hl7.org/fhir/administrative-gender` system
   - Mapping table for Medtech PMS ↔ FHIR

**For Images Widget**: Need extension URLs for:
- Body site (SNOMED CT)
- Laterality (SNOMED CT)
- View type (internal codes)
- Image type (internal codes)
- Provenance (`relatesTo`)

**Action Required**: Request complete POST Media examples with clinical metadata from Medtech support.

### Error Handling

Common error scenarios:

1. **401 Unauthorized**
   - Token expired (refresh after 55 min)
   - Invalid client credentials
   - Incorrect scope

2. **400 Bad Request**
   - Invalid payload field errors
   - Missing required fields
   - Invalid FHIR resource structure
   - Invalid extension URLs

3. **403 Forbidden**
   - Incorrect facility ID
   - Insufficient permissions
   - Resource access denied

4. **404 Not Found**
   - Invalid resource ID
   - Patient not found in facility

5. **429 Too Many Requests**
   - Rate limit exceeded
   - Implement exponential backoff

### Reference Tables

**Sex at Birth / Gender Mapping**

| Medtech PMS Assigned Sex | FHIR "sex-at-birth" | Medtech PMS Gender | FHIR "gender" |
|-------------------------|---------------------|--------------------|--------------| 
| Male (M) | Male | Male | male |
| Female (F) | Female | Female | female |
| Indeterminate (I) | Other | Another Gender | other |
| Unknown (U) | Unknown | Don't Know | unknown |

**Country Codes** (ISO 3166-1 alpha-2)
- NZ: New Zealand
- AU: Australia
- GB: United Kingdom
- US: United States
- (Full list in Section 12)

**Visa Types/Status**
- Available in Section 12 with code mappings

---

### Navigation Tips
- **Setting up new connection?** → Authentication & Authorization section
- **Looking for specific endpoint?** → API Resource Catalogue
- **Need cURL examples?** → Examples section
- **Need body site/laterality extensions?** → Custom Fields & Extensions OR contact Medtech support ⭐⭐⭐
- **API errors?** → Error Handling section
- **Coded value mappings?** → Reference Tables section

---

## Version History (Latest → Oldest)

### v2.9 (3 Sept 2025) — Current
- Inactive consultation note status
- Casual vs Registered patient differentiation
- GET Patient: no-contact/no-SMS flags extension
- Bug fixes: SMS reminders, inactive observations

### v2.8 (18 June 2025)
- Inactive AllergyIntolerance retrieval by EHR key
- PUT Patient: Account Group update
- GET/POST Condition: asserter field, recorder mapping fix
- **DocumentReference: location type extensions (V2 only)** ⭐

### v2.7 (14 May 2025)
- Practitioner status correction
- Enhanced privacy: "Do not upload to MMH" flag
- Standardised empty resources (V2)
- Patient contact validation

### v2.6 (4 March 2025)
- GET Practitioner: facility ID header check ignored for specific cases
- **Added GET Provider by NZNC (nursing-council-id)**

### v2.2 (15 Aug 2024) ⭐⭐⭐
- **Added GET Media and GET Communication**
- **Added image file support for POST Media operation** (critical for Images Widget!)

### v2.1 (6 June 2024)
- **Added POST Observation operation**

### v2.0 (24 Apr 2024)
- Non-long-term Conditions and MedicationRequest (past 6 months) now in Patient Summary

### Older Versions (2023)
- Nov 2023: POST Condition
- Oct 2023: GET Account
- Jul 2023: GET/POST Task, Accident Details
- May 2023: Invoice Write Back, A/C Holder extensions, WINZ No
- Apr 2023: Approved Repeat Prescriptions Write Back, Level 4 Ethnicity
- Mar 2023: POST Patient Bundle, Online Enrolment Form routing, ALEX Online Form config
- Nov 2022: Gender and sex-at-birth for POST Patient

---

## Critical Findings for Images Widget PRD

### ✅ **Media Resource Support** (v2.2, Aug 2024)
- **POST Media operation supports image files**
- Routing: Inbox Write Back → Media resource
- GET Media retrieval available
- Attachment data retrieval via Blobkey

### ✅ **DocumentReference Enhancements** (v2.8, June 2025)
- **Location type extensions (V2 only)** — may support body site metadata
- Confidential flag support
- Date/time filtering

### ✅ **Task Write Back** (July 2023)
- Desktop action "Create Task" is directly supported
- POST Staff/Patient task with assignee

### ⚠️ **Inbox Routing**
- "Send to Inbox" requires recipient ID
- Current doc shows Communication resource for general messages
- Media for images; unclear if Media can specify inbox recipient directly

### ⚠️ **Body Site / Laterality Extensions**
- Not explicitly documented in Media/DocumentReference sections
- May require FHIR extensions (SNOMED CT codes as per PRD)
- **Action**: Confirm with Medtech if custom extensions allowed for clinical metadata on Media/DocumentReference

### ⚠️ **Compression/Size Limits**
- No explicit file size limits documented
- PRD specifies <1 MB client-side compression
- **Action**: Confirm server-side hard limits with Medtech

### ⚠️ **Duplicate Detection**
- No hash-based idempotency documented
- **Action**: Check if FHIR `identifier` field can be used for deduplication

---

## Alignment with Our Quickstart Doc

### ✅ **OAuth Flow Matches**
| Our Quickstart | ALEX API Doc |
|----------------|--------------|
| Tenant ID: `8a024e99-aba3-4b25-b875-28b0c0ca6096` | ✅ Matches |
| Client ID: `7685ade3-f1ae-4e86-a398-fe7809c0fed1` | ⚠️ Doc shows different UAT ID (`24b3d0e8-...`) |
| Scope: `api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default` | ✅ Matches |
| Facility ID: `F2N060-E` | ✅ UAT facility matches |
| Base URL (UAT): Not in quickstart | ❌ Add: `https://alexapiuat.medtechglobal.com/FHIR` |

**Note**: Different `client_id` values suggest multiple UAT app registrations. Confirm which is canonical for ClinicPro.

### ⚠️ **Headers — Quickstart Needs Update**
| Header | Quickstart | ALEX API Doc | Action |
|--------|------------|--------------|--------|
| Authorization | `Authorization` ✅ | `Authorization` | No change |
| Content-Type | `application/json` | `application/fhir+json` | ⚠️ **Update to FHIR-specific** |
| Facility ID | `Facility-Id` | `mt-facilityid` | ⚠️ **Update to Medtech namespace** |
| Correlation ID | Not mentioned | `mt-correlationid` (optional) | ➕ **Add for tracing** |
| App ID | Not mentioned | `mt-appid` (optional) | ➕ **Add for audit logs** |

### ❌ **Missing in Quickstart**
1. **Base URLs**: UAT vs Production endpoints
2. **IP allow-listing requirement**: Critical for connectivity
3. **Additional headers**: `mt-correlationid`, `mt-appid` for observability
4. **Token refresh timing**: Suggest 55-min cache (before 60-min expiry)

---

## Gaps & Questions for Medtech

### 1. **Media POST Schema**
- Request body structure not visible in extracted data
- Need: Full FHIR Media resource example with:
  - Image binary upload (base64 inline? Separate Binary POST?)
  - Clinical metadata extensions (body site, laterality, view, type)
  - Encounter context linkage
  - Filename, content type, hash

### 2. **DocumentReference vs Media for Images**
- PRD maps to: DocumentReference (primary) + Binary + Media (optional)
- ALEX doc shows separate endpoints for each
- **Question**: Should we POST Media AND DocumentReference, or is Media sufficient and auto-creates DocumentReference?

### 3. **Inbox Recipient Specification**
- Task write back supports assignee
- Does Media POST support inbox recipient parameter?
- Or separate Communication POST required?

### 4. **Extensions for Clinical Metadata**
- PRD uses SNOMED CT for body site/laterality (coded)
- Internal codes for view/type
- **Question**: What FHIR extension URLs to use? Custom Medtech namespace?

### 5. **Provenance for Edited Images**
- PRD: edited images link to original via `derivedFromDocumentReferenceId` and `DocumentReference.relatesTo`
- **Question**: Is `relatesTo` with `code = transforms` supported in ALEX?

### 6. **Binary Upload Flow**
- Separate POST to /Binary endpoint?
- Or embedded in Media/DocumentReference?
- Signed upload URLs (as per PRD `/attachments/upload-initiate`)?

### 7. **Realtime Notifications**
- Desktop live updates when mobile uploads
- Does ALEX provide webhooks or subscription mechanism?
- Or client-side polling required?

---

## Recommendations

### **Immediate Actions**

1. **Update Quickstart Doc** (Priority: High)
   - ✅ OAuth flow and tenant ID are correct
   - ❌ Add base URLs: UAT `https://alexapiuat.medtechglobal.com/FHIR` and Production `https://alexapi.medtechglobal.com/FHIR`
   - ❌ Update `Content-Type` header: `application/json` → `application/fhir+json`
   - ❌ Update facility header: `Facility-Id` → `mt-facilityid`
   - ➕ Add optional headers: `mt-correlationid` (UUID for tracing), `mt-appid` (app identifier)
   - ➕ Add IP allow-listing requirement and turnaround time (2-5 business days)
   - ➕ Add token caching guidance: refresh at 55 min (before 60 min expiry)
   - ⚠️ Clarify client ID discrepancy (`7685ade3-...` vs `24b3d0e8-...`)

2. **Request from Medtech** (Priority: High)
   - **✅ EMAIL SENT 2025-10-31** — Requested complete examples for:
     - Body site / laterality SNOMED CT extension URLs
     - View / type internal code extension schemas
     - Provenance (`relatesTo`) support for edited images
     - Full POST Media schema with all optional fields
   - Full POST Media example with:
     - Image upload mechanism (base64 inline? Binary reference? Multipart?)
     - Clinical metadata extension structure
     - Encounter context linkage
   - File size limits and accepted MIME types
   - Confirm: Does POST Media auto-create DocumentReference?

3. **Validate PRD Mapping** (Priority: Medium)
   - Our `/attachments/upload-initiate` → likely direct FHIR POST, not signed URLs
   - ALEX architecture uses **Azure Relay** for on-prem PMS communication (async)
   - Revise PRD API contracts to reflect FHIR patterns OR keep as Gateway abstraction (recommended)
   - Integration Gateway should handle:
     - Token refresh (55-min cache)
     - Correlation ID generation
     - App ID injection (`clinicpro-images-widget`)
     - FHIR → REST translation for frontend
     - Error mapping (FHIR error codes → user-friendly messages)

4. **IP Allow-listing** (Priority: High — Blocking)
   - Gather static IPs for:
     - Development environment
     - Staging environment
     - Production environment
   - If using Vercel/cloud hosting, configure NAT Gateway for consistent outbound IP
   - Submit to Medtech ASAP (2-5 business day turnaround)
   - Test connectivity after provisioning

### **Documentation Updates**

**Quickstart Doc** (`medtech-alex-uat-quickstart.md`):
- ✅ OAuth flow fundamentals correct
- ✅ Headers table updated with correct names (`mt-*` namespace)
- ✅ `Content-Type` updated to `application/fhir+json`
- ✅ Base URLs added (UAT and Production)
- ✅ IP allow-listing requirement documented
- ✅ Token caching guidance added (55-min refresh)

**Images PRD** (`images-widget-prd.md`):
- ✅ Core FHIR concepts (DocumentReference, Binary, Media) align with ALEX v2.2+
- ⚠️ **API contracts section** → Revise `/attachments/*` endpoints:
  - Option A: Keep as Gateway abstraction (cleaner for frontend; recommended)
  - Option B: Expose FHIR endpoints directly (more transparent; less flexible)
- ⚠️ **Authentication section** → Update to match ALEX requirements:
  - Add `mt-facilityid`, `mt-correlationid`, `mt-appid` headers
  - Reference ALEX API docs for auth flow
- ⚠️ **Signed upload URLs** → ALEX likely uses direct FHIR POST; revise or abstract in Gateway
- ➕ **Capabilities endpoint** → Hardcode ALEX feature flags (no dynamic negotiation available)
- ➕ **Realtime sync** → Document polling strategy (ALEX doesn't provide webhooks per current docs)

---

## Key Takeaways

### **Strengths of ALEX API**
1. **Enterprise-grade architecture**: 10-component Azure solution with hybrid connectivity via Azure Relay
2. **Comprehensive FHIR R4 coverage**: 24 resource categories, 200+ endpoints, well-structured
3. **Versioning discipline**: V2 endpoints co-exist with V1; clear changelog (v2.9 current)
4. **Clinical metadata support**: Confidential flags, long-term markers, date filtering, custom extensions
5. **Media support added Aug 2024** — production-ready; supports image files
6. **Task and Inbox write back** — full support for desktop workflow actions
7. **Clear authentication flow**: OAuth 2.0 client credentials with Azure AD
8. **Dual environments**: Separate UAT and Production with clear base URLs
9. **Observability built-in**: Correlation IDs, app IDs, Event Hub logging

### **Weaknesses / Gaps**
1. **Documentation format**: Postman-based; no OpenAPI/Swagger spec for automated tooling
2. **Custom FHIR extensions**: Clinical metadata schema not fully documented; examples needed
3. **Example payloads sparse**: Postman collection download recommended for full schemas
4. **No capabilities negotiation**: Client must hardcode feature flags; no dynamic discovery endpoint
5. **Realtime sync unclear**: No webhooks or FHIR subscriptions documented; likely polling required
6. **IP allow-listing required**: Static IPs must be pre-configured (✅ resolved for this project)
7. **Header namespace inconsistency**: Some examples show `Facility-Id`, others `mt-facilityid`

### **Critical Path Items (Remaining)**
1. ✅ **IP allow-listing** — Already configured and allowed by Medtech
2. ✅ **Email sent to Medtech support** (2025-10-31) — Awaiting response on clinical metadata schema
3. **POST Media schema** — Waiting for complete examples with body site, laterality, view, type extensions
4. **Client ID clarification** — Resolve discrepancy between quickstart (`7685ade3-...`) and API doc (`24b3d0e8-...`)

**No Blocking Issues Remaining** — can proceed with integration development

### **Risk Mitigation**
- **Integration Gateway layer** (as per PRD) is **essential** to:
  - Abstract ALEX-specific quirks (header names, `mt-*` namespace, extensions)
  - Provide simplified REST API to widget frontend (maintain PRD `/attachments/*` contracts)
  - Handle token refresh (55-min cache), correlation ID generation, app ID injection
  - Map FHIR error codes to user-friendly messages
  - Bridge direct FHIR POST to PRD's signed-URL pattern (or revise PRD to match ALEX)
  - Provide hardcoded capabilities response (no dynamic negotiation from ALEX)
  - Implement polling for realtime updates (no ALEX webhooks available)

---

## About the Postman Collection

**What is it?**  
The ALEX API documentation at https://alexapidoc.medtechglobal.com/ is built using Postman's documentation platform. The actual API definitions, request examples, and response schemas are stored in a **Postman Collection** (JSON file).

**Why download it?**  
- **Full request/response examples**: Web view may truncate long JSON payloads
- **Import into Postman app**: Test API calls directly with pre-configured requests
- **Environment variables**: Collection includes UAT/Production environment configs
- **Automated testing**: Can use collection for integration test suites
- **Offline reference**: Access API specs without internet

**How to get it?**  
1. Visit https://alexapidoc.medtechglobal.com/
2. Look for "Run in Postman" button (top-right or in documentation)
3. Click → opens Postman app or downloads `.json` file
4. Import into Postman Desktop app
5. Configure environment variables (client_id, client_secret, facility_id)
6. Start making authenticated requests

**Alternative**: If "Run in Postman" button not visible, request the `.postman_collection.json` file directly from Medtech support.

---

## Next Steps

### ✅ **Week 1: COMPLETED**

1. **✅ Review Full ALEX Documentation**
   - [x] IP allow-listing (Already configured ✅)
   - [x] Documented ALEX API structure in review
   - [x] Identified Examples, Custom Extensions, Error Handling, and Reference Tables content
   - [x] Created comprehensive reference guide in `alex-api-review-2025-10-30.md`

2. **✅ Medtech Clarifications Documented**
   - [x] Documented client ID discrepancy (to be clarified with Medtech)
   - [x] Identified need for POST Media examples (requested from Medtech support)
   - [x] Documented questions for Medtech in review doc

3. **✅ Update Quickstart Doc**
   - [x] Added base URLs: UAT `alexapiuat.medtechglobal.com/FHIR` and Production `alexapi.medtechglobal.com/FHIR`
   - [x] Updated `Content-Type`: `application/json` → `application/fhir+json`
   - [x] Updated facility header: `Facility-Id` → `mt-facilityid`
   - [x] Added optional headers table: `mt-correlationid`, `mt-appid`
   - [x] Added IP allow-listing note (already configured)
   - [x] Added token refresh timing: cache 55 min, refresh before 60 min expiry
   - [x] Added reference to ALEX docs Sections 7-12
   - [x] **Added prominent disclaimer**: ALEX API docs are source of truth

4. **✅ Update Images PRD**
   - [x] Added prominent disclaimer at top: ALEX API docs are authoritative source of truth
   - [x] Clarified API contracts section: Gateway abstraction layer (not direct FHIR exposure)
   - [x] Documented what PRD provides vs what ALEX docs provide
   - [x] Noted implementation requirements (FHIR → REST translation)

**Week 1 Summary**: ✅ All documentation updated to reflect ALEX API as source of truth. No blockers remaining.

### **Week 2: Medtech Clarifications** (Assign to: Integration Engineer)
5. **POST Media Deep Dive**
   - [ ] Request full POST Media example with image attachment
   - [ ] Clarify: base64 inline? Binary reference? Multipart form-data?
   - [ ] Confirm: Does POST Media auto-create DocumentReference?
   - [ ] Request: Extension URLs for body site, laterality, view, type
   - [ ] Ask: File size limits (confirm <1MB client-side compression is sufficient)
   - [ ] Ask: Accepted MIME types (JPEG, PNG, PDF confirmed?)

6. **Inbox & Task Routing**
   - [ ] Clarify: Can POST Media specify inbox recipient directly?
   - [ ] Or: Separate POST Communication required for inbox routing?
   - [ ] Confirm: Task write back supports assignee selection (appears yes from docs)

7. **Provenance & Edited Images**
   - [ ] Confirm: `DocumentReference.relatesTo` with `code = transforms` supported?
   - [ ] Ask: Best practice for linking edited image to original

### **Week 2-3: Prototype Integration Gateway** (Assign to: Backend Engineer)
8. **Core Gateway Services**
   - [ ] Implement OAuth client credentials flow with 55-min token cache
   - [ ] Implement correlation ID generation (UUID v4 per request)
   - [ ] Implement app ID injection (`clinicpro-images-widget`)
   - [ ] Implement FHIR → REST translation layer

9. **Gateway API Endpoints** (as per PRD or revised)
   - [ ] `GET /capabilities` → return hardcoded ALEX feature set
   - [ ] `POST /attachments/mobile/initiate` → generate QR token (ClinicPro-managed)
   - [ ] `POST /attachments/upload-initiate` → return signed URLs or prepare for direct POST
   - [ ] `POST /attachments/commit` → POST Media to ALEX with extensions

10. **Error Handling & Observability**
    - [ ] Map FHIR error codes to user-friendly messages
    - [ ] Implement request/response logging with correlation IDs
    - [ ] Implement retry logic for transient failures (e.g., 429, 503)
    - [ ] Alerting: token refresh failures, ALEX downtime, quota exceeded

### **Week 3-4: Hands-on Testing** (Assign to: QA/Integration Engineer)
11. **UAT Environment Testing** (after IP allow-listed and OTP obtained)
    - [ ] Verify base URL: `https://alexapiuat.medtechglobal.com/FHIR`
    - [ ] Test token acquisition with correct scope
    - [ ] Test headers: confirm `mt-facilityid` works (not `Facility-Id`)
    - [ ] POST Media with sample image (JPEG, <1MB)
    - [ ] GET Media by resource ID
    - [ ] Verify clinical metadata extensions in response
    - [ ] POST Task with assignee
    - [ ] Test correlation ID tracing in ALEX logs (if accessible)

12. **Integration Test Scenarios**
    - [ ] Desktop: capture image, add metadata, commit to encounter
    - [ ] Mobile: QR handoff, upload batch, verify desktop live update (polling)
    - [ ] Desktop: edit image (crop/rotate), save as new, commit both
    - [ ] Desktop: send image to inbox with recipient
    - [ ] Desktop: create task for image with assignee and due date

---

**Review Status**: ✅ Complete (Enhanced with full API details)  
**Confidence**: High on architecture and requirements; Medium-High on Media specifics (awaiting Medtech response)  
**Blocking Issues**: ✅ None (IP allow-listing already resolved)  
**Remaining Clarifications**:
1. ✅ Email sent to Medtech (2025-10-31) requesting clinical metadata schema
2. POST Media example with clinical metadata (awaiting response)
3. Client ID discrepancy resolution

**Can Proceed**: Yes — full integration development can begin immediately

---

## Critical Gap Analysis: Media API & Clinical Metadata

**Date**: 2025-10-30  
**Status**: ⚠️ **Clinical metadata schema undocumented**

### **✅ What ALEX Documentation Provides**

**POST Media Endpoint**: `POST https://alexapiuat.medtechglobal.com/FHIR/Media`  
**Added**: v2.2 (August 2024) - "Added image file support for POST Media operation"

**Basic Example from ALEX Docs**:
```json
{
  "resourceType": "Media",
  "status": "completed",
  "identifier": [{"value": "Media Image Document no 678999"}],
  "subject": {"reference": "Patient/..."},
  "createdDateTime": "2021-11-30T17:09:32+13:00",
  "operator": {"reference": "Practitioner/..."},
  "content": {
    "contentType": "application/pdf",
    "data": "<base64-encoded-binary-data>"
  }
}
```

**Confirmed**:
- ✅ POST Media exists and supports images
- ✅ Base64 inline data format
- ✅ Patient and operator references
- ✅ Content type specification

### **❌ What's Missing from Documentation**

**Clinical Metadata NOT Documented**:
1. ❌ **Body Site** — No extension URL or field shown
2. ❌ **Laterality** — No extension URL or field shown
3. ❌ **View Type** (Close-up, Dermoscopy, Other) — Not shown
4. ❌ **Image Type** (Lesion, Rash, Wound, Infection) — Not shown
5. ❌ **Clinical Date/Time Override** — Not shown
6. ❌ **Provenance / DocumentReference.relatesTo** — Not shown
7. ❌ **Encounter Linkage** — Mechanism not documented

**Custom Extensions Documented** (NOT image-related):
- ✅ A/C Holder Extension (Patient resource only)
- ✅ WINZ No Extension (Patient resource only)
- ✅ Sex at Birth Extension (Patient resource only)
- ✅ Country/Visa Extensions (Patient resource only)

**Conclusion**: All documented custom extensions are for **Patient resource**, not Media/DocumentReference.

### **💡 Key Insight: Standard FHIR R4 Fields**

FHIR R4 Media resource specification (https://hl7.org/fhir/R4/media.html) includes **standard fields** that may work:

```json
{
  "resourceType": "Media",
  "bodySite": {  // ⬅️ STANDARD FHIR FIELD (0..1)
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "40983000",
      "display": "Forearm"
    }]
  },
  "view": {  // ⬅️ STANDARD FHIR FIELD (0..1)
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "...",
      "display": "Close-up"
    }]
  },
  "modality": {  // Could use for image type?
    "coding": [{
      "system": "...",
      "code": "...",
      "display": "..."
    }]
  }
}
```

**Theory**: ALEX likely accepts **standard FHIR R4 fields** (`bodySite`, `view`, `modality`), not custom extensions. The Postman documentation just shows a minimal example.

**Laterality**: Typically encoded within `bodySite` using SNOMED CT post-coordination (e.g., "Left forearm") or as HL7 NZ standard extension.

### **🤔 Two Scenarios**

**Scenario A: Standard FHIR Fields Work** (Most Likely ✅)
- Use `Media.bodySite` (standard field)
- Use `Media.view` (standard field)
- Laterality: encode in bodySite coding or use HL7 NZ extension
- Image type: use `Media.modality` or `Media.type`
- **No custom extensions needed**

**Scenario B: ALEX Requires Custom Extensions** (Less Likely ❌)
- Medtech has custom extensions like Patient resource (`http://alexapi.medtechglobal.com/fhir/StructureDefinition/...`)
- Need extension URLs from Medtech support
- **Why unlikely**: Standard FHIR fields should suffice; custom extensions typically for PMS-specific data

### **📋 Critical Questions for Medtech Support**

**Must ask before implementing** (included in support ticket):

1. **Body Site**:
   > Does POST Media accept the standard FHIR R4 `bodySite` field (CodeableConcept with SNOMED CT codes)? Or custom extension? If custom, provide extension URL.

2. **Laterality**:
   > How to specify laterality (Right, Left, Bilateral, N/A)?
   > - SNOMED CT qualifier within bodySite (e.g., 'Left forearm')?
   > - Separate laterality field/extension?
   > - HL7 NZ laterality extension?
   > Please provide example JSON.

3. **View Type**:
   > Can we use standard FHIR `Media.view` field for clinical views (close-up, dermoscopy)? If so, what code system? If not, provide custom extension URL.

4. **Image Classification**:
   > How to categorize image types (Lesion, Rash, Wound, Infection)?
   > - `Media.modality` field?
   > - `Media.type` field (currently photo/video/audio)?
   > - Custom extension (provide URL and code system)?

5. **Full POST Media Schema**:
   > Provide complete example showing all supported optional fields:
   > - Body site with laterality
   > - Image type/classification
   > - View type
   > - Clinical date/time override
   > - Encounter linkage mechanism

6. **DocumentReference Auto-Creation**:
   > When we POST Media, does ALEX auto-create a linked DocumentReference, or must we POST both separately?

7. **Encounter Linkage**:
   > How to link Media to active encounter? (Media.encounter field, extension, or implied from context?)

### **🚀 Recommended Approach**

**While waiting for Medtech response** (3-5 business days):

**Option 1: Test Standard FHIR Fields** (Low Risk)
Try POST Media with standard `bodySite` to UAT:
```json
{
  "resourceType": "Media",
  "status": "completed",
  "type": "photo",
  "bodySite": {
    "coding": [{
      "system": "http://snomed.info/sct",
      "code": "40983000",
      "display": "Forearm"
    }],
    "text": "Left forearm"
  },
  "subject": {"reference": "Patient/<test-id>"},
  "content": {
    "contentType": "image/jpeg",
    "data": "<small-test-image-base64>"
  }
}
```

**Expected Outcomes**:
- ✅ **201 Created**: Standard fields accepted → proceed with implementation
- ❌ **400 Bad Request**: Field not supported → check error, await Medtech guidance
- ❌ **422 Unprocessable**: Validation error → may need custom approach

**Option 2: Parallel Development** (Recommended)
- ✅ Build OAuth token service (not blocked)
- ✅ Build frontend UI with mock backend (not blocked)
- ✅ Design metadata capture UX (not blocked)
- ❌ Wait for Medtech response before finalizing FHIR mapping

### **📊 Impact Assessment**

**Not a Blocker for**:
- Integration Gateway OAuth service
- Frontend development
- UX design for metadata chips
- Image compression implementation
- Token caching and correlation ID generation

**Blocks**:
- Final FHIR metadata mapping
- POST Media implementation with clinical metadata
- End-to-end testing with real images
- Production deployment

**Timeline Impact**: +3-5 days wait time for Medtech response (already factored into plan)

### **✅ Action Items**

1. **Send support ticket** with 7 questions (email draft ready: `email-draft-uat-testing-access.md`)
2. **Optional**: Test standard FHIR fields in UAT after token setup
3. **Continue**: OAuth service and frontend development in parallel
4. **Wait**: For Medtech response before finalizing Gateway metadata mapping
5. **Update**: PRD API contracts after Medtech confirms schema

---

**Conclusion**: ALEX supports POST Media for images (confirmed), but clinical metadata schema is undocumented. Standard FHIR R4 fields likely work. Medtech support ticket ready to send for confirmation.
