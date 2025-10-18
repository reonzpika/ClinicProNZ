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
