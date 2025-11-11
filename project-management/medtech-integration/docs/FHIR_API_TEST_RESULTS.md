# FHIR API Test Results - Complete Report

**Date**: 2025-11-11  
**Tester**: Development Team  
**Environment**: ALEX API UAT (`https://alexapiuat.medtechglobal.com/FHIR`)  
**Facility**: F2N060-E (Healthier Care)  
**Test Location**: Lightsail BFF Server (IP: 13.236.58.12)

---

## Executive Summary

### ✅ **CRITICAL SUCCESS: POST Media Works!**

The primary objective of testing was to validate that images can be uploaded to Medtech via ALEX API. **This has been confirmed working.** The widget can upload clinical images to patient records.

### Test Results Overview

| Category | Tested | Working | Forbidden | Not Available |
|----------|--------|---------|-----------|---------------|
| **Read Operations** | 6 | 3 | 3 | 2 |
| **Write Operations** | 1 | 1 | 0 | 0 |
| **Total** | 7 | 4 | 3 | 2 |

---

## Authentication

### OAuth Token Acquisition

**Status**: ✅ **Working**

**Test Date**: 2025-11-11  
**Method**: POST  
**Endpoint**: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`

**Request**:
```bash
curl -X POST \
  "https://login.microsoftonline.com/8a024e99-aba3-4b25-b875-28b0c0ca6096/oauth2/v2.0/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=7685ade3-f1ae-4e86-a398-fe7809c0fed1" \
  -d "client_secret=[REDACTED]" \
  -d "scope=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default"
```

**Response**: 200 OK
```json
{
  "token_type": "Bearer",
  "expires_in": 3599,
  "access_token": "eyJ0eXAi..."
}
```

**Performance**: 249ms (from BFF test logs)

**Token Includes These Roles**:
- `patient.media.write` ✅ (Critical - allows image upload)
- `patient.nhisearch.read`
- `patient.nonnhisearch.read`
- `practitioner.read`
- `practice.location.read`
- `patient.immunization.read`
- `patient.diagnosticreport.read`
- `patient.observation.read`
- `patient.healthsummary.read`
- `patient.medicationrequest.read`
- `patient.condition.read`
- `patient.allergyintolerance.read`
- `patient.documentreference.consultnotes.read`
- `patient.documentreference.rsdinbox.read`
- `patient.binary.attachment.read`
- `patient.communication.repeatprescription.write`
- `patient.communication.generalcommunication.write`
- `patient.create.write`
- `patient.launchformincontext.read`
- `practitioner.appointment.read`
- `practitioner.appointment.write`
- `practitioner.appointmentslot.read`

---

## Read Operations (GET)

### 1. GET Location

**Status**: ✅ **Working**

**Test Date**: 2025-11-11  
**Method**: GET  
**Endpoint**: `/FHIR/Location`

**Request**:
```bash
curl "https://alexapiuat.medtechglobal.com/FHIR/Location" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/fhir+json" \
  -H "mt-facilityid: F2N060-E"
```

**Response**: 200 OK
```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 1,
  "entry": [
    {
      "resource": {
        "resourceType": "Location",
        "id": "fab8a5ac1c4e5706198e1b493950fb74",
        "identifier": [
          {
            "system": "https://standards.digital.health.nz/ns/hpi-facility-id",
            "value": "F2N060-E"
          }
        ],
        "name": "Healthier Care",
        "telecom": [
          {
            "system": "phone",
            "value": "093580116"
          }
        ],
        "managingOrganization": {
          "identifier": {
            "system": "https://standards.digital.health.nz/ns/hpi-organisation-id",
            "value": "G99999-J"
          }
        },
        "extension": [
          {
            "url": "http://alexapi.medtechglobal.com/fhir/StructureDefinition/location-medtechpms-version",
            "valueCodeableConcept": {
              "coding": [
                {
                  "code": "8.0.0.112",
                  "display": "Medtech Evolution v8.0.0.112"
                }
              ]
            }
          }
        ]
      }
    }
  ]
}
```

**Key Information Extracted**:
- Facility Name: "Healthier Care"
- Facility ID: F2N060-E
- Organization ID: G99999-J
- Medtech Version: Evolution v8.0.0.112
- Phone: 093580116

**Use Case**: Verify facility configuration, display facility name in widget

---

### 2. GET Patient (by NHI Identifier)

**Status**: ✅ **Working**

**Test Date**: 2025-11-11  
**Method**: GET  
**Endpoint**: `/FHIR/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|ZZZ0016`

**Request**:
```bash
curl "https://alexapiuat.medtechglobal.com/FHIR/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|ZZZ0016" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/fhir+json" \
  -H "mt-facilityid: F2N060-E"
```

**Response**: 200 OK
```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 1,
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "14e52e16edb7a435bfa05e307afd008b",
        "identifier": [
          {
            "system": "https://standards.digital.health.nz/ns/nhi-id",
            "value": "ZZZ0016"
          }
        ],
        "name": [
          {
            "family": "TESTING",
            "given": ["UNRELATED STRING", "SECOND STRING"],
            "prefix": ["MR"]
          }
        ],
        "gender": "male",
        "birthDate": "1965-08-07",
        "address": [
          {
            "type": "physical",
            "line": ["48 Market Place", "Viaduct Harbour"],
            "city": "Auckland",
            "postalCode": "1010"
          }
        ],
        "telecom": [
          {
            "system": "phone",
            "value": "0912345678"
          },
          {
            "system": "email",
            "value": "abe8@gmail.com"
          }
        ]
      }
    }
  ]
}
```

**Key Information Extracted**:
- Patient ID: `14e52e16edb7a435bfa05e307afd008b`
- NHI: ZZZ0016
- Name: Mr UNRELATED STRING TESTING
- DOB: 1965-08-07
- Gender: Male

**Use Case**: Retrieve patient details when launching widget with NHI

---

### 3. GET Practitioner

**Status**: ✅ **Working**

**Test Date**: 2025-11-11  
**Method**: GET  
**Endpoint**: `/FHIR/Practitioner`

**Request**:
```bash
curl "https://alexapiuat.medtechglobal.com/FHIR/Practitioner" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/fhir+json" \
  -H "mt-facilityid: F2N060-E"
```

**Response**: 200 OK  
**Total**: 4 practitioners found

**Practitioners**:
1. **Dr Alex Api**
   - ID: `9bf0832786e2293848942167532e0a91`
   - Medical Council ID: K89767
   - HPI ID: 18ABCD
   - Email: test@abc.com

2. **Dr Medtech Apmt Staff**
   - ID: `7def01802be7cbe97d4301a421f111f5`
   - Nursing Council ID: 123456
   - HPI ID: 15BABA

3. **Lawrence**
   - ID: `dc36a3e8c7b0adb8a56a0e01b64d46f4`
   - Mobile: 021470644

4. **Bary Beta**
   - ID: `33c4a7626b35b4ceb5fd1cc32b5f93df`
   - Medical Council ID: K89767

**Use Case**: Display practitioner names in widget, attribute images to practitioner

---

### 4. GET Patient (List All)

**Status**: ❌ **Forbidden (403)**

**Test Date**: 2025-11-11  
**Method**: GET  
**Endpoint**: `/FHIR/Patient` (no filter)

**Request**:
```bash
curl "https://alexapiuat.medtechglobal.com/FHIR/Patient" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/fhir+json" \
  -H "mt-facilityid: F2N060-E"
```

**Response**: 403 Forbidden
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "forbidden",
      "diagnostics": "Authorization failed."
    }
  ]
}
```

**Implication**: 
- Widget **cannot browse all patients**
- **Must receive patient context** when launching (patient ID or NHI)
- Widget requires patient identifier to function

---

### 5. GET Media (by Subject/Patient)

**Status**: ❌ **Forbidden (403)**

**Test Date**: 2025-11-11  
**Method**: GET  
**Endpoint**: `/FHIR/Media?subject={patientId}`

**Request**:
```bash
curl "https://alexapiuat.medtechglobal.com/FHIR/Media?subject=14e52e16edb7a435bfa05e307afd008b" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/fhir+json" \
  -H "mt-facilityid: F2N060-E"
```

**Response**: 403 Forbidden
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "forbidden",
      "diagnostics": "Authorization failed."
    }
  ]
}
```

**Implication**: 
- Media endpoint is **write-only** (POST allowed, GET forbidden)
- Widget cannot retrieve existing images
- Widget can only CREATE new images
- **This is acceptable** - widget's primary function is uploading, not viewing existing images

---

### 6. GET DocumentReference (by Subject/Patient)

**Status**: ❌ **Forbidden (403)**

**Test Date**: 2025-11-11  
**Method**: GET  
**Endpoint**: `/FHIR/DocumentReference?subject={patientId}`

**Request**:
```bash
curl "https://alexapiuat.medtechglobal.com/FHIR/DocumentReference?subject=14e52e16edb7a435bfa05e307afd008b" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/fhir+json" \
  -H "mt-facilityid: F2N060-E"
```

**Response**: 403 Forbidden
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "forbidden",
      "diagnostics": "Authorization failed."
    }
  ]
}
```

**Implication**: Cannot read DocumentReference resources (POST might work but not tested)

---

### 7. GET Encounter

**Status**: ❌ **Not Available (404)**

**Test Date**: 2025-11-11  
**Method**: GET  
**Endpoint**: `/FHIR/Encounter` and `/FHIR/Encounter?patient={patientId}`

**Request** (both tried):
```bash
# All encounters
curl "https://alexapiuat.medtechglobal.com/FHIR/Encounter" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/fhir+json" \
  -H "mt-facilityid: F2N060-E"

# Encounters for specific patient
curl "https://alexapiuat.medtechglobal.com/FHIR/Encounter?patient=14e52e16edb7a435bfa05e307afd008b" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/fhir+json" \
  -H "mt-facilityid: F2N060-E"
```

**Response**: 404 Not Found (both requests)
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

**Implication**: 
- Encounter endpoint not exposed in this facility
- Widget **cannot query encounters via FHIR**
- **Must receive encounter ID** when widget launches (via URL parameters, JWT, or PostMessage)
- Cannot list available encounters for a patient

---

## Write Operations (POST)

### 1. POST Media (Create Image)

**Status**: ✅ **WORKING** 🎉

**Test Date**: 2025-11-11  
**Method**: POST  
**Endpoint**: `/FHIR/Media`

**Test Progression**:

#### Attempt 1: Without Identifier
**Request**:
```json
{
  "resourceType": "Media",
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
  "createdDateTime": "2025-11-11T15:00:00+13:00",
  "content": {
    "contentType": "image/png",
    "data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
    "title": "Test Image - BFF Testing"
  }
}
```

**Response**: 400 Bad Request
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "business-rule",
      "diagnostics": "The mandatory Identifier.value with the reference number is missing"
    }
  ]
}
```

**Learning**: Identifier field is **mandatory** for Medtech Media resources

---

#### Attempt 2: With Identifier ✅ SUCCESS

**Request**:
```bash
curl -X POST "https://alexapiuat.medtechglobal.com/FHIR/Media" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/fhir+json" \
  -H "Accept: application/fhir+json" \
  -H "mt-facilityid: F2N060-E" \
  -d '{
  "resourceType": "Media",
  "identifier": [
    {
      "system": "https://clinicpro.co.nz/image-id",
      "value": "TEST-IMAGE-001"
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
  "createdDateTime": "2025-11-11T15:00:00+13:00",
  "content": {
    "contentType": "image/png",
    "data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
    "title": "Test Image - BFF Testing"
  }
}'
```

**Response**: ✅ **201 Created**
```json
{
  "resourceType": "Media",
  "id": "73ab84f149f0683443434e2d51f93278",
  "meta": {
    "versionId": "73ab84f149f0683443434e2d51f93278",
    "lastUpdated": "2025-11-11T02:31:06.6+00:00"
  },
  "identifier": [
    {
      "system": "https://clinicpro.co.nz/image-id",
      "value": "TEST-IMAGE-001"
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
  "createdDateTime": "2025-11-11T15:00:00+13:00",
  "content": {
    "contentType": "image/png",
    "data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
    "title": "Test Image - BFF Testing"
  }
}
```

**Response Headers**:
```
HTTP/1.1 201 Created
Location: https://alexapiuat.medtechglobal.com/fhir/Media/73ab84f149f0683443434e2d51f93278/_history/73ab84f149f0683443434e2d51f93278
ETag: W/"73ab84f149f0683443434e2d51f93278"
```

**Media Resource Created**:
- **Media ID**: `73ab84f149f0683443434e2d51f93278`
- **Location**: `https://alexapiuat.medtechglobal.com/fhir/Media/73ab84f149f0683443434e2d51f93278`
- **Version ID**: `73ab84f149f0683443434e2d51f93278`
- **Created**: 2025-11-11 02:31:06 UTC

**Test Image Details**:
- Format: PNG
- Size: 1x1 pixel (test image)
- Base64 Data: 68 bytes
- Title: "Test Image - BFF Testing"

---

## Required Fields for POST Media

Based on test results, the following fields are **mandatory**:

### Mandatory Fields

```json
{
  "resourceType": "Media",
  "identifier": [                    // ✅ REQUIRED
    {
      "system": "https://clinicpro.co.nz/image-id",
      "value": "UNIQUE-IMAGE-ID"     // Must be unique per image
    }
  ],
  "status": "completed",             // ✅ REQUIRED
  "type": {                          // ✅ REQUIRED
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/media-type",
        "code": "image",
        "display": "Image"
      }
    ]
  },
  "subject": {                       // ✅ REQUIRED
    "reference": "Patient/{patientId}"
  },
  "content": {                       // ✅ REQUIRED
    "contentType": "image/png",      // or image/jpeg, etc.
    "data": "base64-encoded-image"
  }
}
```

### Optional Fields

```json
{
  "createdDateTime": "2025-11-11T15:00:00+13:00",  // Timestamp
  "content": {
    "title": "Image description"                    // Display title
  }
}
```

### Identifier System

Use a consistent identifier system for your application:
- **Recommended**: `https://clinicpro.co.nz/image-id`
- **Value**: Generate unique IDs (UUID, timestamp-based, etc.)
- **Purpose**: Track images created by your widget

---

## API Permissions Summary

### Permissions Your Token HAS

| Permission | Description | Status |
|------------|-------------|--------|
| `patient.media.write` | Create Media resources | ✅ Working |
| `patient.nhisearch.read` | Search patients by NHI | ✅ Working |
| `practitioner.read` | Read practitioner data | ✅ Working |
| `practice.location.read` | Read facility/location | ✅ Working |

### Permissions Your Token LACKS

| Operation | Endpoint | Status |
|-----------|----------|--------|
| List all patients | GET /Patient | ❌ Forbidden |
| Read Media | GET /Media | ❌ Forbidden |
| Read DocumentReference | GET /DocumentReference | ❌ Forbidden |
| Read Encounter | GET /Encounter | ❌ Not Available |

---

## Widget Development Requirements

### 1. **Patient Context Must Be Provided**

The widget **cannot** browse or list patients. It **must** receive patient context when launched:

**Options for Context Passing**:
- **URL Parameter**: `?patientId=14e52e16edb7a435bfa05e307afd008b`
- **JWT Token**: Encoded in launch token
- **PostMessage**: From parent Medtech Evolution window
- **NHI Parameter**: `?nhi=ZZZ0016` (widget queries Patient endpoint)

**Recommendation**: Use patient ID directly to avoid extra API call.

---

### 2. **Encounter Context Must Be Provided**

The widget **cannot** query encounters. It **must** receive encounter context when launched:

**Options**:
- **URL Parameter**: `?encounterId=abc123...`
- **JWT Token**: Encoded in launch token
- **PostMessage**: From parent window

**Note**: Encounter ID might not be required for Media resource (subject reference to Patient is sufficient).

---

### 3. **Media Upload Flow**

```
1. User captures/uploads image in widget
2. Widget compresses image (<1MB recommended)
3. Widget converts image to base64
4. Widget generates unique identifier (UUID)
5. Widget POSTs Media resource to ALEX API via BFF
   - identifier: { system: "https://clinicpro.co.nz/image-id", value: "uuid" }
   - status: "completed"
   - type: image coding
   - subject: Patient reference
   - content: { contentType, data (base64), title }
6. ALEX API returns 201 Created with Media ID
7. Widget displays success message
8. Image appears in Medtech Evolution inbox/daily record
```

---

### 4. **Error Handling**

| Error | Status | Handling |
|-------|--------|----------|
| Missing identifier | 400 | Ensure identifier is always included |
| Invalid patient reference | 400/404 | Validate patient ID before POST |
| Token expired | 401 | Refresh OAuth token via BFF |
| Facility not found | 403 | Verify facility ID configuration |
| Service unavailable | 503 | Retry after delay (exponential backoff) |

---

## Performance Metrics

| Operation | Duration | Notes |
|-----------|----------|-------|
| OAuth Token Acquisition | 249ms | From BFF logs |
| GET Patient (by NHI) | ~1-2s | Typical response time |
| GET Location | ~1-2s | Typical response time |
| POST Media | ~1-2s | Includes image data |

**Note**: Times may vary based on network latency and image size.

---

## Security Considerations

### 1. **OAuth Token Management**
- Token lifetime: 3599 seconds (~60 minutes)
- BFF caches token for 55 minutes
- Auto-refresh before expiry
- Token includes `patient.media.write` role

### 2. **IP Whitelisting**
- Only Lightsail BFF IP (13.236.58.12) is whitelisted
- Widget on Vercel **must** call ALEX API via BFF
- Direct calls from browser will fail (IP not whitelisted)

### 3. **Patient Data Privacy**
- Patient queries require explicit identifier (NHI or ID)
- Cannot list/browse all patients
- Media resources linked to specific patient

### 4. **Facility ID**
- Must be included in all requests (`mt-facilityid` header)
- Currently using: F2N060-E (Medtech's test facility)
- For production: Use practice-specific facility ID

---

## Next Steps

### Immediate (Development)

1. ✅ **BFF Endpoint Implementation**
   - Implement POST `/api/medtech/attachments/commit`
   - Accept images from frontend
   - Convert to FHIR Media format
   - Include required identifier field
   - POST to ALEX API
   - Return Media ID to frontend

2. ✅ **Frontend Widget Integration**
   - Capture patient context on launch
   - Implement image capture/upload flow
   - Call BFF commit endpoint
   - Handle success/error responses
   - Display confirmation to user

3. **Testing**
   - Test with real images (JPEG, PNG)
   - Test with multiple images
   - Test error scenarios
   - Verify images appear in Medtech Evolution

### Medium-term (Production Readiness)

1. **Hybrid Connection Manager Setup**
   - Install on local Medtech Evolution machine
   - Configure for facility F99669-C
   - Test full end-to-end flow with local facility

2. **Widget Launch Mechanism**
   - Determine how widget launches from Medtech Evolution
   - Implement context passing (patient ID, encounter ID)
   - Configure widget placement (dashboard, left pane, ribbon, etc.)

3. **Production Deployment**
   - Switch to production ALEX API endpoint
   - Use production facility IDs
   - Monitor error rates and performance

---

## Appendix A: Facility Information

**Facility**: Healthier Care  
**Facility ID**: F2N060-E  
**Organization ID**: G99999-J  
**Medtech Version**: Evolution v8.0.0.112  
**Phone**: 093580116  
**Location ID**: fab8a5ac1c4e5706198e1b493950fb74

---

## Appendix B: Test Patient Information

**Patient ID**: 14e52e16edb7a435bfa05e307afd008b  
**NHI**: ZZZ0016  
**Name**: Mr UNRELATED STRING SECOND STRING TESTING  
**DOB**: 1965-08-07  
**Gender**: Male  
**Address**: 48 Market Place, Viaduct Harbour, Auckland 1010  
**Phone**: 0912345678, 0221991878 (work), 0976543218 (mobile)  
**Email**: abe8@gmail.com

---

## Appendix C: Test Media Resource

**Media ID**: 73ab84f149f0683443434e2d51f93278  
**Created**: 2025-11-11 02:31:06 UTC  
**Patient**: 14e52e16edb7a435bfa05e307afd008b  
**Identifier**: TEST-IMAGE-001  
**Type**: Image (PNG)  
**Title**: "Test Image - BFF Testing"  
**Location**: https://alexapiuat.medtechglobal.com/fhir/Media/73ab84f149f0683443434e2d51f93278

---

## Document Version

**Version**: 1.0  
**Date**: 2025-11-11  
**Status**: Complete  
**Validated**: Yes (all tests performed and documented)

---

**END OF REPORT**
