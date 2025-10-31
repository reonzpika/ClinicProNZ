# OAuth Token Testing Guide

## Overview

Two test scripts have been created to verify ALEX API connectivity:

1. **`test-oauth.sh`** - Acquires OAuth access token from Azure AD
2. **`test-fhir-call.sh`** - Tests FHIR API call to ALEX UAT

---

## Prerequisites

### 1. Client Secret Required

You need the **client secret** from Medtech. If you haven't retrieved it yet:

1. Wait for OTP from Medtech (one-time password)
2. Use OTP to retrieve client secret (see quickstart guide)
3. Store securely; never commit to git

### 2. Tools

- `curl` (pre-installed)
- `jq` (optional, for JSON formatting)
- `uuidgen` (optional, for correlation IDs)

---

## Usage

### Step 1: Test OAuth Token Acquisition

```bash
./test-oauth.sh <CLIENT_SECRET>
```

**Example**:
```bash
./test-oauth.sh "your-client-secret-here"
```

**Expected Output** (Success):
```
✅ SUCCESS: Access token acquired

Token Type: Bearer
Expires In: 3599s (~59 minutes)

Access Token (first 50 chars): eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6...

💾 Token saved to: /tmp/alex_access_token.txt

🎯 Next Step: Test a simple FHIR API call
   Run: ./test-fhir-call.sh
```

**Common Errors**:

| Error | Cause | Solution |
|-------|-------|----------|
| `invalid_client` | Wrong client ID or secret | Verify credentials |
| `invalid_scope` | Wrong scope format | Check scope URL |
| `unauthorized_client` | App not registered | Contact Medtech |

---

### Step 2: Test FHIR API Call

After successfully acquiring token:

```bash
./test-fhir-call.sh
```

The script automatically uses the token saved from Step 1.

**OR** provide token manually:
```bash
./test-fhir-call.sh "your-access-token"
```

**Expected Output** (Success):
```
✅ SUCCESS: Patient data retrieved

Response (formatted):
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 1,
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "...",
        "identifier": [...],
        "name": [...],
        ...
      }
    }
  ]
}
```

**Common Errors**:

| HTTP Status | Cause | Solution |
|-------------|-------|----------|
| `401` | Token expired or invalid | Run `./test-oauth.sh` again |
| `403` | Forbidden (IP or facility) | Check IP allow-listing; verify facility ID |
| `404` | Patient not found | Normal if test patient doesn't exist |
| `429` | Rate limit exceeded | Wait and retry |

---

## What Gets Tested

### OAuth Token Acquisition (`test-oauth.sh`)

✅ **Validates**:
- Client credentials flow with Azure AD
- Correct tenant ID (`8a024e99-aba3-4b25-b875-28b0c0ca6096`)
- Correct client ID (`7685ade3-f1ae-4e86-a398-fe7809c0fed1`)
- Correct scope (`api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default`)
- Token expiry (should be ~3600 seconds / 1 hour)

### FHIR API Call (`test-fhir-call.sh`)

✅ **Validates**:
- Token authorization works
- IP allow-listing configured correctly
- Base URL correct (`alexapiuat.medtechglobal.com`)
- Required headers accepted:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/fhir+json`
  - `mt-facilityid: F2N060-E`
  - `mt-correlationid: <uuid>`
  - `mt-appid: clinicpro-images-widget`
- FHIR Bundle response format

---

## Token Management

### Token Lifecycle

1. **Acquire** - OAuth token from Azure AD (~1 minute)
2. **Cache** - Store token server-side (55 minutes recommended)
3. **Use** - Include in all FHIR API calls (Authorization header)
4. **Refresh** - Acquire new token before expiry (at 55 min mark)
5. **Expire** - Token invalid after ~60 minutes

### Token Storage

**For Testing** (Current):
- Token saved to `/tmp/alex_access_token.txt` (temporary)
- Automatically cleaned on reboot

**For Production** (Future):
- Server-side in-memory cache (e.g., Node.js Map, Redis)
- NEVER store in frontend / browser
- NEVER commit to git
- Rotate if exposed

---

## Troubleshooting

### "Could not acquire access token"

1. **Check client secret** - Verify correct secret from Medtech
2. **Check network** - Ensure outbound HTTPS allowed
3. **Check credentials** - Verify client ID matches quickstart doc
4. **Check scope** - Must be exact: `api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default`

### "Unauthorized (401)"

1. **Token expired** - Tokens last ~60 minutes; run `./test-oauth.sh` again
2. **Invalid token** - Check token was copied correctly
3. **Wrong credentials** - Verify client ID/secret

### "Forbidden (403)"

1. **IP not allow-listed** - Verify your IP with Medtech (should be done ✅)
2. **Wrong facility ID** - Must be `F2N060-E` for UAT
3. **Permissions** - Contact Medtech if app registration lacks permissions

### "Patient not found (404)"

- Normal! Test patient `ZZZ0016` may not exist in UAT database
- Try different NHI if you have access to test patients
- 404 actually confirms API is working (authenticated successfully)

---

## Next Steps After Successful Testing

1. ✅ **Token acquisition works** - OAuth flow validated
2. ✅ **FHIR API accessible** - IP allow-listing confirmed
3. ✅ **Headers correct** - `mt-*` namespace validated

**Ready for**:
- Implement OAuth token service in Gateway (55-min cache)
- Implement ALEX API client with auto header injection
- Test POST Media endpoint (awaiting Medtech response on schema)

---

## Security Reminders

⚠️ **Never**:
- Commit client secret to git
- Expose token to browser/frontend
- Log full tokens (log first 10 chars only)
- Store in plaintext files (except /tmp for testing)

✅ **Always**:
- Rotate secret if exposed
- Use HTTPS only
- Implement token caching (55-min refresh)
- Include correlation IDs for tracing

---

## Reference

- **Quickstart Guide**: `docs/medtech/medtech-alex-uat-quickstart.md`
- **ALEX API Docs**: https://alexapidoc.medtechglobal.com/
- **Support**: Contact Medtech via email (template in `docs/medtech/email-draft-uat-testing-access.md`)
