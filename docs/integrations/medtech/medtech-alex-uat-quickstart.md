## Medtech ALEX UAT — Quickstart (OTP → Client Secret → Access Token)

- **TL;DR**: Wait for OTP → POST with `Password: <OTP>` to get client secret → use client ID + secret to get access token → call ALEX UAT with `Authorization: Bearer <token>` (+ `Facility-Id: F2N060-E` if required). Run from your Terminal or Postman; Lightsail SSH not needed.

---

### 1) Overview
- **Goal**: Enable ClinicPro to call ALEX UAT APIs.
- **Flow**:
  1. Get **OTP** from Medtech (Defne).
  2. Use OTP to retrieve your **client secret** (one‑off).
  3. Use **client ID + client secret** to obtain an **access token** (repeat; expires ~1h).
  4. Call ALEX UAT with the **Bearer token**; include **facility** `F2N060-E` where required.
- **Run location**: Your laptop Terminal or Postman. No Lightsail SSH required for these steps.

---

### 2) Prerequisites
- **OTP**: Sent directly by Medtech. You cannot self‑generate it.
- **Tools**: Either Terminal (`curl`) or Postman (desktop or web + Desktop Agent).
- **Security**: Treat the client secret as highly sensitive. Store only in server‑side env vars.

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

- Expected response: JSON with `access_token` (JWT), `expires_in` (~3600 seconds).
- Optional: decode the JWT (e.g., jwt.io) and confirm `aud = api://bf7945a6-e812-4121-898a-76fea7c13f4d`.

---

### 5) Call an ALEX UAT API
- Include the token in the **Authorisation** header and the facility when required.
- Pattern (example):
```bash
TOKEN='PASTE_ACCESS_TOKEN_HERE'
curl -sS -X GET \
  'https://<ALEX_UAT_ENDPOINT>' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -H 'Facility-Id: F2N060-E' # only if the endpoint requires it
```

- For exact endpoints and headers, use the Medtech ALEX® Postman documentation link shared by Medtech.

---

### 6) Environment variables (recommended)
- Local (not committed): `.env.local`
```
MEDTECH_CLIENT_ID=7685ade3-f1ae-4e86-a398-fe7809c0fed1
MEDTECH_CLIENT_SECRET=<paste from step 3>
MEDTECH_TENANT_ID=8a024e99-aba3-4b25-b875-28b0c0ca6096
MEDTECH_API_SCOPE=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default
MEDTECH_FACILITY_ID=F2N060-E
```

- Production hosting:
  - Set the same keys in your platform’s secret manager (Vercel Project Settings or Lightsail env). Do not log them.

---

### 7) Security notes
- **Do not** put `client_secret` in frontend code or commit to git.
- Rotate the secret if it’s ever exposed.
- Access tokens are short‑lived; fetch fresh tokens when expired. Cache server‑side.

---

### 8) Postman vs Terminal (quick guide)
- **Postman**: Easier for repeated testing, environments, sharing collections. Heavier app.
- **Terminal**: Fast for one‑offs and scripting. Manual header/body handling.
- Either works for this onboarding. Terminal is fine to start.

---

### 9) Troubleshooting
- `401/invalid_token`: Token expired; fetch a new token.
- `401/invalid_client`: Check `client_id`/`client_secret` values and URL encoding.
- `400/invalid_scope`: Ensure scope is exactly `api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default`.
- `403/forbidden`: Confirm correct facility header and permissions.
- OTP POST fails: Confirm header name is exactly `Password` and OTP is valid.

---

### 10) Next steps (handoff to engineering / AI agent)
- Implement a **server token service**:
  - Client‑credentials flow; cache the token; refresh before expiry; retry once on 401.
- Implement a minimal **ALEX API wrapper**:
  - Inject `Authorization: Bearer <token>` and `Facility-Id: ${MEDTECH_FACILITY_ID}` where required.
- Add environment variables in hosting; never expose secrets to the browser.
- Create a small **runbook** for secret rotation and operational checks.

---

### 11) Code map (where things live)
- Server libs
  - `src/lib/integrations/medtech/alex/env.ts` — load/validate `MEDTECH_*`
  - `src/lib/integrations/medtech/alex/token-service.ts` — client‑credentials + caching
  - `src/lib/integrations/medtech/alex/client.ts` — thin ALEX HTTP wrapper
- API routes
  - `app/api/(integration)/medtech/capabilities/route.ts`
  - `app/api/(integration)/medtech/attachments/mobile/initiate/route.ts`
  - `app/api/(integration)/medtech/attachments/upload-initiate/route.ts`
  - `app/api/(integration)/medtech/attachments/commit/route.ts`
  - `app/api/(integration)/medtech/alex/smoke/route.ts` (temporary, for verification)

Once you have the OTP and client secret set, visit the smoke route to validate configuration end‑to‑end.

---

### 12) Operator checklist (deployed) — step‑by‑step

1) Retrieve client secret (PowerShell on your laptop)
```powershell
$OTP = 'PASTE_OTP_HERE'
$resp = Invoke-RestMethod -Method POST -Uri 'https://prod-25.australiaeast.logic.azure.com:443/workflows/4da52cb1411e441ab90604e99f57baae/triggers/manual/paths/invoke?api-version=2018-07-01-preview&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=LWXUnuARXIy8D1-xT4AJsHXf5-8mbHpGmEbK79bXGtE' -Headers @{ Password = $OTP }
$resp
```
Copy the returned value as your `MEDTECH_CLIENT_SECRET`.

2) Set server environment variables (hosting secrets)
- `MEDTECH_CLIENT_ID = 7685ade3-f1ae-4e86-a398-fe7809c0fed1`
- `MEDTECH_CLIENT_SECRET = <from step 1>`
- `MEDTECH_TENANT_ID = 8a024e99-aba3-4b25-b875-28b0c0ca6096`
- `MEDTECH_API_SCOPE = api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default`
- `MEDTECH_FACILITY_ID = F2N060-E`

3) Redeploy/restart the app

4) Verify token works (smoke test)
```bash
curl -sS https://YOUR_DOMAIN/api/medtech/alex/smoke
```
Expected: `{ "ok": true, "tokenSample": "..." }`

5) Optional: add ALEX base URL when available (Postman)
- `MEDTECH_ALEX_BASE_URL = https://<from Medtech Postman>`
- `MEDTECH_ALEX_PING_PATH = /metadata` (or a benign GET path from Postman)
- Redeploy, then re-run the smoke test to hit ALEX directly.

6) Tell engineering “Smoke OK” → gateway endpoints will be enabled next:
- `GET /api/(integration)/medtech/capabilities`
- `POST /api/(integration)/medtech/attachments/mobile/initiate`
- `POST /api/(integration)/medtech/attachments/upload-initiate`
- `POST /api/(integration)/medtech/attachments/commit`

---


