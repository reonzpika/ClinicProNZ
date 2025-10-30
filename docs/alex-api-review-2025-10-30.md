# ALEX API Documentation Review
**Date**: 2025-10-30  
**Source**: https://alexapidoc.medtechglobal.com/  
**Format**: Postman Collection Documentation

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

## Authentication & Headers

### OAuth 2.0 Client Credentials Flow

**Token Endpoint (UAT)**:
```
https://login.microsoftonline.com/8a024e99-aba3-4b25-b875-28b0c0ca6096/oauth2/v2.0/token
```

**Required Parameters**:
- `client_id`: UAT example `24b3d0e8-9096-4763-a1e5-4a4b13257a7a`
- `client_secret`: (sensitive; different per environment)
- `grant_type`: `client_credentials`
- `scope`: `api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default`

### Standard Request Headers

**All FHIR API requests require**:
1. `Authorization: Bearer <access_token>`
2. `Content-Type: application/fhir+json`
3. `mt-facilityid: F2N060-E` (UAT facility; prod will differ)

**Alternative header name**: Documentation also shows `Facility-Id` in some examples (verify which is canonical).

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

**Note**: Different `client_id` values suggest multiple UAT app registrations. Confirm which is canonical for ClinicPro.

### ✅ **Headers Match**
- `Authorization: Bearer <token>` ✅
- `Content-Type: application/fhir+json` ✅
- `mt-facilityid` vs `Facility-Id` — inconsistency (doc uses both)

### ⚠️ **Header Name Inconsistency**
- Quickstart: `Facility-Id`
- API Doc: `mt-facilityid`
- **Action**: Test both; update quickstart if `mt-facilityid` is required

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

1. **Confirm Client ID discrepancy**
   - Quickstart: `7685ade3-...`
   - API Doc: `24b3d0e8-...`
   - May be different test vs prod app registrations

2. **Header name standardisation**
   - Test `Facility-Id` vs `mt-facilityid`
   - Update quickstart doc to match

3. **Request Medtech examples**
   - Full POST Media request with image (base64 or binary?)
   - Clinical metadata extension schemas
   - DocumentReference creation workflow for images

4. **Validate PRD mapping**
   - Our `/attachments/upload-initiate` → Azure Blob signed URL
   - ALEX may not provide signed URLs; direct POST to FHIR endpoint?
   - Adjust PRD API contracts if needed

### **Documentation Updates**

**Quickstart Doc**:
- ✅ OAuth flow correct
- ⚠️ Clarify client ID (may be env-specific)
- ⚠️ Header `Authorization` vs `Authorisation` (keep US spelling per HTTP spec)
- ⚠️ Add note: Facility ID header name may be `mt-facilityid`

**Images PRD**:
- ✅ Core concepts (DocumentReference, Binary, Media) align with ALEX
- ⚠️ API contracts section: revise to match FHIR endpoint patterns (not REST-style `/attachments/...`)
- ⚠️ Signed upload URLs: likely not provided by ALEX; direct POST instead
- ⚠️ Capabilities endpoint: ALEX doesn't expose server capabilities API; use fixed config

---

## Key Takeaways

### **Strengths of ALEX API**
1. **Comprehensive FHIR R4 coverage**: 24 resource categories, well-structured
2. **Versioning discipline**: V2 endpoints co-exist with V1; clear changelog
3. **Clinical metadata support**: Confidential flags, long-term markers, date filtering
4. **Media support added Aug 2024** — recent but production-ready
5. **Task and Inbox write back** — supports desktop workflow actions

### **Weaknesses / Gaps**
1. **Documentation format**: Postman-based; no OpenAPI/Swagger spec
2. **Example payloads missing**: Need to click through Postman collection for full schemas
3. **Extension documentation sparse**: Custom FHIR extensions not detailed
4. **No capabilities negotiation**: Client must know available features upfront
5. **Realtime sync unclear**: No mention of subscriptions or webhooks

### **Risk Mitigation**
- **Integration Gateway layer** (as per PRD) is essential to:
  - Abstract ALEX-specific quirks (header names, extensions)
  - Provide simplified REST API to widget frontend
  - Handle token refresh, error mapping, retry logic
  - Bridge signed upload URLs (if Azure Blob used for staging) to ALEX FHIR POST

---

## Next Steps

1. **Hands-on testing** (after OTP → client secret → token obtained):
   - POST Media with image (test base64 inline vs Binary ref)
   - GET Media by ID
   - Verify headers (`mt-facilityid` vs `Facility-Id`)
   - Test clinical metadata extensions

2. **Medtech support ticket**:
   - Request: Full Media POST example with clinical metadata
   - Clarify: DocumentReference auto-creation when Media posted?
   - Confirm: Extension URLs for body site, laterality, view, type
   - Ask: File size limits, supported MIME types

3. **Update PRD API contracts**:
   - Revise `/attachments/*` endpoints to reflect FHIR patterns
   - Or keep as Gateway abstraction (preferred; cleaner for frontend)

4. **Prototype Integration Gateway**:
   - Implement `/capabilities` by returning fixed ALEX feature set
   - Implement `/attachments/commit` → POST Media to ALEX
   - Map PRD metadata schema to FHIR extensions

---

**Review Status**: ✅ Complete  
**Confidence**: High on structure/flow; Medium on Media specifics (need Postman examples)  
**Blocking Issue**: None; can proceed with Gateway design assuming standard FHIR patterns
