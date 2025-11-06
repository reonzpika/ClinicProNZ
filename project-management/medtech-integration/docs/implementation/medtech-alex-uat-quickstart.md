## Medtech ALEX UAT — Quickstart (OTP → Client Secret → Access Token)

> **⚠️ IMPORTANT**: This quickstart is based on the official [ALEX API Documentation](https://alexapidoc.medtechglobal.com/), which is the **source of truth**. Always refer to the ALEX docs for authoritative information on endpoints, headers, and schemas.

- **TL;DR**: Wait for OTP → POST with `Password: <OTP>` to get client secret → use client ID + secret to get access token → call ALEX UAT with `Authorization: Bearer <token>` (+ `mt-facilityid: F2N060-E` required). Run from your Terminal or Postman; Lightsail SSH not needed.

---

### 1) Overview
- **Goal**: Enable ClinicPro to call ALEX UAT APIs.
- **Flow**:
  1. Get **OTP** from Medtech (Defne).
  2. Use OTP to retrieve your **client secret** (one‑off).
  3. Use **client ID + client secret** to obtain an **access token** (repeat; expires ~1h).
  4. Call ALEX UAT with the **Bearer token**; include **facility** `F2N060-E`.
- **Run location**: Your laptop Terminal or Postman. No Lightsail SSH required for these steps.

---

### 2) Prerequisites
- **OTP**: Sent directly by Medtech. You cannot self‑generate it.
- **Tools**: Either Terminal (`curl`) or Postman (desktop or web + Desktop Agent).
- **Security**: Treat the client secret as highly sensitive. Store only in server‑side env vars.
- **IP Allow-listing**: ✅ Your static IP must be pre-configured by Medtech (required for API access).
- **Documentation**: Review [ALEX API Documentation](https://alexapidoc.medtechglobal.com/) for full endpoint details.

---

### 3) Retrieve your client secret (one‑off)
- Wait for the OTP from Medtech.
- In Terminal (macOS/Linux/WSL):

```bash
OTP='PASTE_OTP_HERE'
curl -sS -X POST \
  'https://prod-25.australiaeast.logic.azure.com:443/workflows/4da52cb1411e441ab90604e99f57baae/triggers/manual/paths/invoke?api-version=2018-07-01-preview&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=LWXUnuARXIy8D1-xT4AJsHXf5-8mbHpGmEbK79bXGtE' \
  -H "Password: ${OTP}"
```

- In Postman:
  - Request: **POST**
  - URL: the long Azure Logic App URL above
  - Headers: `Password: PASTE_OTP_HERE`
  - Send → copy the returned **client secret**.

Notes:
- No request body required.
- Response is your **client secret** (plaintext or JSON). Copy immediately and store securely.

---

### 4) Obtain an access token (repeat/automate)
- Token endpoint (Azure AD): `https://login.microsoftonline.com/8a024e99-aba3-4b25-b875-28b0c0ca6096/oauth2/v2.0/token`
- Required fields:
  - `client_id`: `7685ade3-f1ae-4e86-a398-fe7809c0fed1`
  - `client_secret`: `<the client secret you retrieved>`
  - `grant_type`: `client_credentials`
  - `scope`: `api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default`

- Terminal example:
```bash
CLIENT_SECRET='PASTE_SECRET_HERE'
curl -sS -X POST \
  'https://login.microsoftonline.com/8a024e99-aba3-4b25-b875-28b0c0ca6096/oauth2/v2.0/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'client_id=7685ade3-f1ae-4e86-a398-fe7809c0fed1' \
  --data-urlencode "client_secret=${CLIENT_SECRET}" \
  --data-urlencode 'grant_type=client_credentials' \
  --data-urlencode 'scope=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default'
```

- Expected response: JSON with `access_token` (JWT), `expires_in` (~3600 seconds / 1 hour).
- Optional: decode the JWT (e.g., jwt.io) and confirm `aud = api://bf7945a6-e812-4121-898a-76fea7c13f4d`.
- **Token caching**: Cache the token server-side and refresh at 55 minutes (before 60-minute expiry).

---

### 5) Call an ALEX UAT API

**Base URLs**:
- **UAT Sandbox**: `https://alexapiuat.medtechglobal.com/FHIR`
- **Production**: `https://alexapi.medtechglobal.com/FHIR`

**Required Headers** (all FHIR API requests):

| Header | Value | Notes |
|--------|-------|-------|
| `Authorization` | `Bearer <access_token>` | OAuth token from Azure AD |
| `Content-Type` | `application/fhir+json` | FHIR-specific content type |
| `mt-facilityid` | `F2N060-E` | UAT facility ID (production differs) |

**Optional Headers** (recommended for observability):

| Header | Value | Purpose |
|--------|-------|---------|
| `mt-correlationid` | UUID (e.g., `550e8400-e29b-...`) | Request tracing across systems |
| `mt-appid` | `clinicpro-images-widget` | Application identifier for audit logs |

**Example** (GET Patient):
```bash
TOKEN='PASTE_ACCESS_TOKEN_HERE'
CORRELATION_ID=$(uuidgen) # or use any UUID generator

curl -sS -X GET \
  'https://alexapiuat.medtechglobal.com/FHIR/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|ZZZ0016' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/fhir+json' \
  -H 'mt-facilityid: F2N060-E' \
  -H "mt-correlationid: ${CORRELATION_ID}" \
  -H 'mt-appid: clinicpro-images-widget'
```

**Example** (POST Media with image — see ALEX docs for schema):
```bash
TOKEN='PASTE_ACCESS_TOKEN_HERE'
CORRELATION_ID=$(uuidgen)

curl -sS -X POST \
  'https://alexapiuat.medtechglobal.com/FHIR/Media' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/fhir+json' \
  -H 'mt-facilityid: F2N060-E' \
  -H "mt-correlationid: ${CORRELATION_ID}" \
  -H 'mt-appid: clinicpro-images-widget' \
  -d @media-payload.json
```

- For exact endpoint schemas and examples, refer to [ALEX API Documentation](https://alexapidoc.medtechglobal.com/):
  - **Authentication & Authorization**: OAuth flow, token requests
  - **API Resource Catalogue**: 200+ endpoints across 24 categories
  - **Examples**: cURL commands and JSON payloads
  - **Custom Fields & Extensions**: FHIR extensions for clinical metadata
  - **Error Handling**: Error codes and troubleshooting

---

### 6) Environment variables (recommended)
- Local (not committed): `.env.local`
```bash
# OAuth 2.0 Configuration (Azure AD)
MEDTECH_CLIENT_ID=7685ade3-f1ae-4e86-a398-fe7809c0fed1
MEDTECH_CLIENT_SECRET=<paste from step 3>
MEDTECH_TENANT_ID=8a024e99-aba3-4b25-b875-28b0c0ca6096
MEDTECH_API_SCOPE=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default

# ALEX API Configuration
MEDTECH_API_BASE_URL_UAT=https://alexapiuat.medtechglobal.com/FHIR
MEDTECH_API_BASE_URL_PROD=https://alexapi.medtechglobal.com/FHIR
MEDTECH_FACILITY_ID=F2N060-E  # UAT facility; production will differ

# Application Configuration
MEDTECH_APP_ID=clinicpro-images-widget
```

- Production hosting:
  - Set the same keys in your platform's secret manager (Vercel Project Settings or Lightsail env). Do not log them.
  - Update `MEDTECH_API_BASE_URL` to production endpoint
  - Update `MEDTECH_FACILITY_ID` to production facility ID

---

### 7) Security notes
- **Do not** put `client_secret` in frontend code or commit to git.
- Rotate the secret if it's ever exposed.
- Access tokens are short‑lived (1 hour); implement token caching:
  - Cache token on server with 55-minute TTL
  - Refresh token before 60-minute expiry
  - Retry once on 401 Unauthorized
- **Never expose tokens to browser**: All ALEX API calls must be server-side.

---

### 8) Postman vs Terminal (quick guide)
- **Postman**: Easier for repeated testing, environments, sharing collections. Heavier app.
- **Terminal**: Fast for one‑offs and scripting. Manual header/body handling.
- Either works for this onboarding. Terminal is fine to start.

---

### 9) Troubleshooting

**Authentication Errors**:
- `401/invalid_token`: Token expired; fetch a new token (refresh at 55 min).
- `401/invalid_client`: Check `client_id`/`client_secret` values and URL encoding.
- `400/invalid_scope`: Ensure scope is exactly `api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default`.
- OTP POST fails: Confirm header name is exactly `Password` and OTP is valid.

**API Request Errors**:
- `403/forbidden`: Confirm correct facility header (`mt-facilityid`) and permissions.
- `400/bad_request`: Check FHIR resource structure; ensure `Content-Type: application/fhir+json`.
- `404/not_found`: Invalid resource ID or patient not in facility.
- `429/too_many_requests`: Rate limit exceeded; implement exponential backoff.

**Header Issues**:
- If API returns header errors, verify:
  - `Content-Type: application/fhir+json` (NOT `application/json`)
  - `mt-facilityid: F2N060-E` (NOT `Facility-Id`)
  - Both spellings appear in some ALEX doc examples; `mt-facilityid` is correct

**For detailed error codes**, see ALEX API Documentation Error Handling section.

---

### 10) Next steps (handoff to engineering / AI agent)
- Implement a **server token service**:
  - Client‑credentials flow; cache the token (55-min TTL); refresh before 60-min expiry; retry once on 401.
  - Generate correlation ID (UUID) per request for tracing.
- Implement an **Integration Gateway** (ALEX API wrapper):
  - Inject required headers: `Authorization: Bearer <token>`, `Content-Type: application/fhir+json`, `mt-facilityid: ${MEDTECH_FACILITY_ID}`, `mt-correlationid: <uuid>`, `mt-appid: clinicpro-images-widget`
  - Translate FHIR responses to simplified REST API for frontend (as per Images Widget PRD).
  - Map FHIR error codes to user-friendly messages.
- Add environment variables in hosting; never expose secrets to the browser.
- Create a small **runbook** for secret rotation and operational checks.

---

### 11) Reference
- **ALEX API Documentation**: https://alexapidoc.medtechglobal.com/ (source of truth)
- **Authentication & Authorization**: OAuth flow, token management
- **API Resource Catalogue**: 200+ endpoints across 24 categories
- **Examples**: cURL commands and JSON payloads
- **Custom Fields & Extensions**: FHIR extensions for clinical metadata
- **Error Handling**: Error codes and troubleshooting
- **Reference Tables**: Gender mapping, country codes, etc.

---
