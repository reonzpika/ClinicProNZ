# Medtech ALEX Overview (Reference)

> Always consult `https://alexapidoc.medtechglobal.com/` for authoritative details. Use this summary for quick orientation.

## What ALEX Is
- FHIR-based API fronted by Azure API Management
- Microsoft OSS FHIR server (stateless), data via middleware + Azure Relay to on‑prem PMS

## Environments
- UAT: `alexapiuat.medtechglobal.com/FHIR`
- Production: `alexapi.medtechglobal.com/FHIR`

## Authentication
- OAuth2 client_credentials against Medtech Azure AD tenant
- Token TTL ~1 hour; include `Authorization: Bearer <token>` on all requests
- Onboarding: Medtech issues `client_id/secret`, scopes; IP allow‑listing; practice access approval

## Required Headers
- Vendor-supplied: `mt-facilityid` (target practice)
- APIM/FHIR-injected: `mt-correlationid` (GUID), `mt-appid`, `mt-roles`, `mt-env`
- Writes: `Content-Type: application/fhir+json`

## Core Domains & Operations
- Patient & IPS: demographics, enrolment bundle; identifiers; NZ extensions
- Clinical: `Condition` (GET/POST), `Observation` (POST), `AllergyIntolerance` (incl. inactive by EHR key), Medications/approvals
- Documents & Imaging: `DocumentReference` (+ `Binary` for PDFs/images), `DiagnosticReport` (PDF via `Binary`), `Media` (GET/POST)
- Messaging & Workflow: `Communication` (incl. Radiology category), `Task` (GET/POST)
- Billing & Accounts: invoice write‑back, `ChargeItem`, `Account`
- Directory/Config: `Practitioner`, Provider by NZNC, `Location` (online form config), `Accident Details`

## NZ-Specific Extensions (examples)
- Sex-at-birth (`hl7.org.nz`), country codes (ISO‑3166), visa type/expiry, A/C holder, WINZ No
- Used in `Patient` GET/POST, IPS, and bundles

## Testing & Connectivity (UAT)
- ALEX AAD account per service; scopes assigned; app ID approval
- Vendor IP allow‑listed; practice consent simulated in UAT

## Operational Notes
- Errors: 401 invalid/expired token; handle 4xx/5xx, safe retries
- Binaries: large files via `Binary` URLs; stream uploads server‑side
- Compatibility: Features gated by PMS/version (Medtech Evolution vs Medtech32)

## Quick Example (from docs)
```
GET https://alexapiuat.medtechglobal.com/FHIR/Patient/1
Authorization: Bearer <token>
```

## FHIR Version & Profiles
- ALEX exposes a FHIR R4-compatible API. Always consult the ALEX CapabilityStatement to confirm supported resources/interactions and any Medtech-specific profiles/extensions.
- Retrieve capabilities:
  - `GET https://alexapiuat.medtechglobal.com/FHIR/metadata`

## Authentication & Tokens (Azure AD)
- Flow: OAuth 2.0 `client_credentials` against Medtech’s Azure AD tenant. Client credentials and scopes are issued during onboarding.
- Token lifetime: typically ~1 hour. Refresh proactively (e.g., at ≤ 55 minutes) and cache tokens server-side only.
- Example token request (values provided by Medtech):
```
POST https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/token
Content-Type: application/x-www-form-urlencoded

client_id=<issued-client-id>&
client_secret=<issued-client-secret>&
grant_type=client_credentials&
scope=api://<alex-app-id>/.default
```

## Required Headers — Example
- Always send required headers from the server (never the browser):
```
GET https://alexapiuat.medtechglobal.com/FHIR/Patient/1
Authorization: Bearer <access_token>
mt-facilityid: <facility-id>
mt-correlationid: 8e2f7a2e-6d98-4c8b-9e4a-4f2b7b0b2f91
```
- Writes must include: `Content-Type: application/fhir+json`.
- Recommended: propagate `mt-correlationid` end-to-end for observability.

## Capability Checks (Feature Gating)
- Use the `CapabilityStatement` to determine support for resources/interactions (e.g., `DocumentReference` create, `Binary` create, `Task` operations).
- Cache capabilities per facility/environment; re-check on deployment or periodically.

## Error Taxonomy & Retries
- Typical categories:
  - AuthN/AuthZ: `401/403` → refresh token, verify headers, confirm facility access.
  - Validation/State: `400/409/422` → do not auto-retry; surface actionable error to user.
  - Not found/Gone: `404/410` → confirm identifiers; avoid blind retries.
  - Rate limiting: `429` → exponential backoff with jitter; honour `Retry-After` when present.
  - Transient server: `5xx` → bounded retries with full jitter and idempotency.
- Always include an idempotency guard on writes from your server (e.g., hash per image or request key) to prevent duplicates on retries.

## Documents & Imaging — Recommended Flow
1) Create `Binary` with the image content (stream upload server-side):
```
POST /FHIR/Binary
Content-Type: image/jpeg

<bytes>
```
→ Response includes `Binary.id` and a resolvable `Binary` URL.

2) Create `DocumentReference` that references the `Binary`:
```json
{
  "resourceType": "DocumentReference",
  "status": "current",
  "type": { "coding": [{ "system": "http://loinc.org", "code": "18748-4" }] },
  "subject": { "reference": "Patient/<patient-id>" },
  "content": [
    {
      "attachment": {
        "contentType": "image/jpeg",
        "url": "Binary/<binary-id>"
      }
    }
  ]
}
```
- Use `DiagnosticReport` when clinically appropriate (e.g., a radiology/report bundle) and reference the same `Binary`.

## Image Handling Guidance
- Client-side (mobile) compress to ~1024 px long-edge, JPEG/WebP quality ~0.8, strip EXIF; HEIC → JPEG.
- Enforce server-side size caps and type validation; reject unexpected formats early.
- For redactions/annotations performed on desktop, apply transformations before upload so that persisted images contain only intended pixels.

## Operational Notes (Recommended)
- Timeouts: set sensible upstream timeouts (connect/read) and expose meaningful errors to the user.
- Observability: log `mt-correlationid`, facility, request kind, and outcome; avoid PII in logs.
- Compatibility: certain interactions may vary by PMS/version (Medtech Evolution vs Medtech32); gate features via capabilities.
