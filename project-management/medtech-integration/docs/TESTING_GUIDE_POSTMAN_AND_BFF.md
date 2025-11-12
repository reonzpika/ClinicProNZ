# Testing Guide: Postman & Lightsail BFF

**Version**: 1.0  
**Last Updated**: 2025-11-10  
**Prerequisites**: Review architecture guide before testing

---

## Your Current Setup Confirmed

### ✅ What You Have

1. **GitHub** → Stores code
2. **Vercel** → Hosts widget UI (auto-deploy from GitHub)
   - URL: Your Vercel app URL
   - Deployment: Automatic on git push
   - IP: Dynamic (changes with deployments)
   
3. **Lightsail BFF** → Makes API calls to ALEX
   - URL: `https://api.clinicpro.co.nz`
   - IP: `13.236.58.12` (static, whitelisted by Medtech)
   - Deployment: Manual (SSH into server, pull code, restart service)
   - Location: `/opt/clinicpro-bff/` on Lightsail instance
   - Service: `clinicpro-bff.service` (systemd)
   - **Contains**: Same Next.js codebase as Vercel, but runs on static IP

4. **Medtech Evolution** → Installed on your personal computer
   - Purpose: For full end-to-end testing (Phase 3)
   - Status: Installed, not being used yet
   - Requires: Hybrid Connection Manager (not set up yet)

### What Gets Deployed Where

| Component | Vercel | Lightsail BFF |
|-----------|--------|---------------|
| Widget UI | ✅ Yes | ✅ Yes (same code) |
| API Routes | ✅ Yes (unused) | ✅ Yes (used) |
| OAuth Service | ✅ Yes (unused) | ✅ Yes (used) |
| Static IP | ❌ No (dynamic) | ✅ Yes (13.236.58.12) |
| Purpose | User-facing UI | ALEX API calls |

**Key Point**: You have the SAME codebase deployed to TWO places:
- **Vercel**: For the widget UI (users see this)
- **Lightsail**: For API calls to ALEX (has whitelisted static IP)

Your frontend on Vercel calls your API on Lightsail, which then calls ALEX API.

---

## Deployment Workflow

### Current State

```
1. You make code changes via Cursor AI
2. Code commits to GitHub
3. Vercel auto-deploys (widget UI available)
4. Lightsail BFF is SEPARATE (doesn't auto-deploy)
5. You must MANUALLY deploy to Lightsail BFF
```

### To Deploy to Lightsail BFF

```bash
# 1. SSH into Lightsail
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12

# 2. Navigate to BFF directory
cd /opt/clinicpro-bff

# 3. Pull latest code
git pull origin main  # or your branch name

# 4. Install dependencies (if package.json changed)
npm install

# 5. Build (if needed)
npm run build

# 6. Restart service
sudo systemctl restart clinicpro-bff

# 7. Check status
sudo systemctl status clinicpro-bff

# 8. Check logs
journalctl -u clinicpro-bff -f
```

**Important**: Lightsail BFF won't have your latest code changes unless you deploy manually.

---

## Phase 1: Testing via Postman

⚠️ **IMPORTANT: IP Whitelisting Limitation**

**Postman will NOT work from your personal computer** because only your Lightsail BFF IP (13.236.58.12) is whitelisted by Medtech.

**What happens**:
- ✅ OAuth token acquisition works (Azure AD doesn't require IP whitelisting)
- ❌ FHIR API calls timeout (ALEX API requires whitelisted IP)

**Two options for Postman testing**:
1. **Skip to Phase 2** (Recommended) - Test via BFF endpoints instead
2. **SSH into Lightsail and use curl** (See Option B below) - Same effect as Postman but from whitelisted IP

---

**Purpose**: Validate ALEX API connectivity without deploying code

**Facility to Use**: `F2N060-E` (Medtech's test facility)

**Why Test from Lightsail**: Only IP 13.236.58.12 is whitelisted by Medtech

---

### Option A: Skip Postman Testing (Recommended)

**Why**: Your personal computer's IP isn't whitelisted, so FHIR API calls will timeout.

**Solution**: Go directly to [Phase 2: Testing via Lightsail BFF](#phase-2-testing-via-lightsail-bff)

---

### Option B: Test from Lightsail Server via curl

**Why**: Lightsail server has whitelisted IP, so API calls work.

**Steps**: See Testing from Lightsail Server section below.

---

### Option C: Postman from Personal Computer (Will Not Work)

⚠️ **This will timeout on FHIR API calls** (OAuth token will work though)

Only documented for reference. Skip to Phase 2 for actual testing.

#### Setup Collection Variable

1. Open Postman
2. Create new collection: "Medtech ALEX API"
3. Add collection variables:
   - `tenant_id`: `8a024e99-aba3-4b25-b875-28b0c0ca6096`
   - `client_id`: `7685ade3-f1ae-4e86-a398-fe7809c0fed1`
   - `client_secret`: [your secret — get from Vercel/Lightsail env vars]
   - `base_url`: `https://alexapiuat.medtechglobal.com/FHIR`
   - `facility_id`: `F2N060-E`

#### Request: Get Access Token

**Method**: POST

**URL**: `https://login.microsoftonline.com/{{tenant_id}}/oauth2/v2.0/token`

**Headers**:
```
Content-Type: application/x-www-form-urlencoded
```

**Body** (x-www-form-urlencoded):
```
grant_type: client_credentials
client_id: {{client_id}}
client_secret: {{client_secret}}
scope: api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default
```

**Expected Response** (200 OK):
```json
{
  "token_type": "Bearer",
  "expires_in": 3599,
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Action**: Save `access_token` to collection variable `access_token`

**Postman Test Script** (add to Tests tab):
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.collectionVariables.set("access_token", jsonData.access_token);
    console.log("Token saved:", jsonData.access_token.substring(0, 20) + "...");
}
```

---

### Step 2: Test Get Location

**Purpose**: Verify facility ID is recognized

**Method**: GET

**URL**: `{{base_url}}/Location`

**Headers**:
```
Authorization: Bearer {{access_token}}
Content-Type: application/fhir+json
mt-facilityid: {{facility_id}}
```

**Expected Response** (200 OK):
```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 1,
  "entry": [
    {
      "resource": {
        "resourceType": "Location",
        "id": "...",
        "name": "Practice Name"
      }
    }
  ]
}
```

**If you get 503**: Medtech confirmed `F2N060-E` is working. Try again (was transient error).

**If you get 403**: Check facility ID spelling/case

**If you get 401**: Token expired or invalid, re-run Step 1

---

### Step 3: Test Get Patient

**Purpose**: Verify FHIR API query works

**Method**: GET

**URL**: `{{base_url}}/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|ZZZ0016`

**Headers**:
```
Authorization: Bearer {{access_token}}
Content-Type: application/fhir+json
mt-facilityid: {{facility_id}}
```

**Expected Response** (200 OK):
```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 1,
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "...",
        "name": [
          {
            "text": "UNRELATED STRING TESTING",
            "family": "TESTING",
            "given": ["UNRELATED", "STRING"]
          }
        ],
        "gender": "male",
        "birthDate": "1990-01-01"
      }
    }
  ]
}
```

**Note**: NHI `ZZZ0016` is a test patient in Medtech's UAT environment

⚠️ **This request will timeout from your personal computer** - IP not whitelisted

---

### Testing from Lightsail Server (curl)

**Why this works**: Lightsail server IP (13.236.58.12) is whitelisted.

```bash
# 1. SSH into Lightsail
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12

# 2. Get OAuth token and save to variable
TOKEN=$(curl -s -X POST \
  "https://login.microsoftonline.com/8a024e99-aba3-4b25-b875-28b0c0ca6096/oauth2/v2.0/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=7685ade3-f1ae-4e86-a398-fe7809c0fed1" \
  -d "client_secret=YOUR_SECRET_HERE" \
  -d "scope=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default" \
  | jq -r '.access_token')

echo "Token acquired: ${TOKEN:0:20}..."

# 3. Test Get Location
curl "https://alexapiuat.medtechglobal.com/FHIR/Location" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/fhir+json" \
  -H "mt-facilityid: F2N060-E"

# 4. Test Get Patient
curl "https://alexapiuat.medtechglobal.com/FHIR/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|ZZZ0016" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/fhir+json" \
  -H "mt-facilityid: F2N060-E"
```

**Expected**: All requests return 200 OK with FHIR Bundle responses.

---

### Step 4: Test Get Encounter

**Purpose**: Verify encounter queries work

**Method**: GET

**URL**: `{{base_url}}/Encounter?patient={{patient_id}}`

**Note**: Get `patient_id` from Step 3 response (`entry[0].resource.id`)

**Headers**:
```
Authorization: Bearer {{access_token}}
Content-Type: application/fhir+json
mt-facilityid: {{facility_id}}
```

**Expected Response** (200 OK):
```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 5,
  "entry": [
    {
      "resource": {
        "resourceType": "Encounter",
        "id": "...",
        "status": "finished",
        "class": {...},
        "subject": {
          "reference": "Patient/..."
        }
      }
    }
  ]
}
```

---

### Phase 1 Success Criteria

✅ **Testing from Lightsail server (curl)**:
- OAuth token acquired
- Location retrieved (200 OK)
- Patient retrieved (200 OK)
- Encounter retrieved (200 OK)

**If all pass**: ALEX API connectivity confirmed from whitelisted IP.

**Next**: Test via your Lightsail BFF code (Phase 2)

---

## Phase 2: Testing via Lightsail BFF

**Purpose**: Test your actual application code

**Prerequisites**: 
- ✅ Postman tests passed
- ✅ Latest code deployed to Lightsail BFF
- ✅ Environment variables configured on Lightsail

---

### Step 1: Check Lightsail BFF Status

```bash
# SSH into Lightsail
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12

# Check if service is running
sudo systemctl status clinicpro-bff

# Expected output:
# ● clinicpro-bff.service - ClinicPro Backend for Frontend
#    Loaded: loaded (/etc/systemd/system/clinicpro-bff.service; enabled)
#    Active: active (running) since ...
```

**If not running**:
```bash
sudo systemctl start clinicpro-bff
sudo systemctl enable clinicpro-bff  # auto-start on boot
```

---

### Step 2: Check Environment Variables

```bash
# Check .env file
cat /opt/clinicpro-bff/.env

# Should contain:
# MEDTECH_CLIENT_ID=7685ade3-f1ae-4e86-a398-fe7809c0fed1
# MEDTECH_CLIENT_SECRET=[your-secret]
# MEDTECH_TENANT_ID=8a024e99-aba3-4b25-b875-28b0c0ca6096
# MEDTECH_FACILITY_ID=F2N060-E
# MEDTECH_API_BASE_URL=https://alexapiuat.medtechglobal.com/FHIR
```

**If facility ID is wrong** (should be `F2N060-E` for now):
```bash
sudo nano /opt/clinicpro-bff/.env
# Change MEDTECH_FACILITY_ID to F2N060-E
# Save and exit (Ctrl+X, Y, Enter)

sudo systemctl restart clinicpro-bff
```

---

### Step 3: Test BFF `/test` Endpoint

This endpoint tests OAuth + FHIR Patient query in one call.

#### Via curl (from your computer)

```bash
curl "https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016"
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "correlationId": "uuid-here",
  "duration": 4000,
  "environment": {
    "baseUrl": "https://alexapiuat.medtechglobal.com/FHIR",
    "facilityId": "F2N060-E",
    "hasClientId": true,
    "hasClientSecret": true
  },
  "tokenInfo": {
    "isCached": false,
    "expiresIn": 3599
  },
  "fhirResult": {
    "resourceType": "Bundle",
    "type": "searchset",
    "total": 1,
    "patientCount": 1,
    "firstPatient": {
      "id": "14e52e16edb7a435bfa05e307afd008b",
      "name": {
        "text": "UNRELATED STRING TESTING",
        "family": "TESTING",
        "given": ["UNRELATED", "STRING"]
      },
      "gender": "male",
      "birthDate": "1990-01-01"
    }
  }
}
```

**If you get 503**: Check Medtech's email — try again (they said `F2N060-E` is working)

**If you get 500**: Check Lightsail logs:
```bash
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12
journalctl -u clinicpro-bff -n 50  # last 50 lines
journalctl -u clinicpro-bff -f     # follow (live tail)
```

#### Via Postman

**Method**: GET

**URL**: `https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016`

**Headers**: None (endpoint handles everything internally)

**Expected**: Same as curl response above

---

### Step 4: Test BFF `/token-info` Endpoint

This shows your OAuth token cache status.

```bash
curl "https://api.clinicpro.co.nz/api/medtech/token-info"
```

**Expected Response**:
```json
{
  "isCached": true,
  "expiresIn": 3299,
  "expiresAt": 1699999999999
}
```

**What it means**:
- `isCached: true` — Token is cached (not fetching new one every request)
- `expiresIn: 3299` — Token expires in 3299 seconds (~55 minutes)

---

### Step 5: Test BFF `/capabilities` Endpoint

This returns feature flags and coded value lists for the widget.

```bash
curl "https://api.clinicpro.co.nz/api/medtech/capabilities"
```

**Expected Response** (200 OK):
```json
{
  "features": {
    "mobileQRHandoff": true,
    "multiImageCommit": true,
    "imageEditing": false
  },
  "codedValues": {
    "laterality": [...],
    "bodySite": [...],
    "viewType": [...],
    "imageClassification": [...]
  }
}
```

---

### BFF Testing Success Criteria

✅ **All endpoints return expected responses**:
- `/test` — Returns 200 OK with patient data
- `/token-info` — Shows cached token
- `/capabilities` — Returns feature flags

**If all pass**: Your BFF code is working correctly.

---

## Troubleshooting

### Issue: 503 Service Unavailable

**Cause**: Medtech's Hybrid Connection down (for `F99669-C`) OR transient error (for `F2N060-E`)

**Solution**:
- If using `F2N060-E`: Retry (Medtech confirmed it's working)
- If using `F99669-C`: Need to set up Hybrid Connection Manager (deferred for now)

---

### Issue: 403 Forbidden

**Cause**: Facility ID not recognized

**Solution**:
- Verify facility ID is `F2N060-E` (not `F99669-C`)
- Check spelling/case (case-sensitive)
- Verify environment variable on Lightsail

---

### Issue: 401 Unauthorized

**Cause**: OAuth token invalid or expired

**Solution**:
- Check client secret is correct
- Verify tenant ID is correct
- Check OAuth token endpoint URL
- Review Lightsail logs for OAuth errors

---

### Issue: 500 Internal Server Error

**Cause**: BFF code error

**Solution**:
```bash
# Check Lightsail logs
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12
journalctl -u clinicpro-bff -n 100

# Look for error stack traces
# Common issues:
# - Missing environment variables
# - TypeScript compilation errors
# - Missing dependencies
```

---

### Issue: Connection Refused

**Cause**: BFF service not running

**Solution**:
```bash
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12
sudo systemctl start clinicpro-bff
sudo systemctl status clinicpro-bff
```

---

### Issue: "Token expired" every request

**Cause**: Token caching not working

**Solution**:
- Check `/token-info` endpoint shows `isCached: true`
- Verify token cache TTL (55 minutes)
- Check logs for token refresh attempts

---

## Testing Checklist

### ✅ Phase 1: Postman (No Code Deployment)

- [ ] OAuth token acquired (200 OK)
- [ ] Location retrieved (200 OK)
- [ ] Patient retrieved (200 OK)
- [ ] Encounter retrieved (200 OK)

### ✅ Phase 2: Lightsail BFF (Your Code)

- [ ] BFF service running
- [ ] Environment variables configured
- [ ] `/test` endpoint returns 200 OK
- [ ] `/token-info` shows cached token
- [ ] `/capabilities` returns feature flags

### 🔄 Phase 3: Full Widget (Deferred)

- [ ] Hybrid Connection Manager set up
- [ ] Widget launches from Medtech Evolution
- [ ] Images save to local Medtech database
- [ ] Images appear in Medtech inbox

---

## Next Steps

**After Phase 1 & 2 pass**:
1. Test widget UI calling BFF endpoints
2. Test full commit flow (capture → metadata → commit)
3. Verify error handling
4. Plan Phase 3 (Hybrid Connection Manager setup)

---

## Quick Commands Reference

### SSH into Lightsail
```bash
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12
```

### Check BFF Status
```bash
sudo systemctl status clinicpro-bff
```

### View Logs
```bash
journalctl -u clinicpro-bff -n 50  # last 50 lines
journalctl -u clinicpro-bff -f     # follow (live)
```

### Restart BFF
```bash
sudo systemctl restart clinicpro-bff
```

### Test from Command Line
```bash
# Test endpoint
curl "https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016"

# Token info
curl "https://api.clinicpro.co.nz/api/medtech/token-info"

# Capabilities
curl "https://api.clinicpro.co.nz/api/medtech/capabilities"
```

---

## OAuth Token Testing (Script-Based)

This section covers testing OAuth token acquisition using the provided test scripts. For Postman-based testing, see Phase 1: Testing via Postman above.

### Overview

Two test scripts have been created to verify ALEX API connectivity:

1. **`test-oauth.sh`** - Acquires OAuth access token from Azure AD
2. **`test-fhir-call.sh`** - Tests FHIR API call to ALEX UAT

**Location**: `testing/test-oauth.sh` and `testing/test-fhir-call.sh`

### Prerequisites

#### 1. Client Secret Required

You need the **client secret** from Medtech. If you haven't retrieved it yet:

1. Wait for OTP from Medtech (one-time password)
2. Use OTP to retrieve client secret (see OAuth Setup section in implementation guide)
3. Store securely; never commit to git

#### 2. Tools

- `curl` (pre-installed)
- `jq` (optional, for JSON formatting)
- `uuidgen` (optional, for correlation IDs)

### Usage

#### Step 1: Test OAuth Token Acquisition

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

#### Step 2: Test FHIR API Call

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

### What Gets Tested

#### OAuth Token Acquisition (`test-oauth.sh`)

✅ **Validates**:
- Client credentials flow with Azure AD
- Correct tenant ID (`8a024e99-aba3-4b25-b875-28b0c0ca6096`)
- Correct client ID (`7685ade3-f1ae-4e86-a398-fe7809c0fed1`)
- Correct scope (`api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default`)
- Token expiry (should be ~3600 seconds / 1 hour)

#### FHIR API Call (`test-fhir-call.sh`)

✅ **Validates**:
- Token authorization works
- IP allow-listing configured correctly
- Base URL correct (`alexapiuat.medtechglobal.com`)
- Required headers accepted (per Medtech support, only mt-facilityid is needed):
  - `Authorization: Bearer <token>`
  - `Content-Type: application/fhir+json`
  - `mt-facilityid: F2N060-E`
- FHIR Bundle response format

### Token Management

#### Token Lifecycle

1. **Acquire** - OAuth token from Azure AD (~1 minute)
2. **Cache** - Store token server-side (55 minutes recommended)
3. **Use** - Include in all FHIR API calls (Authorization header)
4. **Refresh** - Acquire new token before expiry (at 55 min mark)
5. **Expire** - Token invalid after ~60 minutes

#### Token Storage

**For Testing** (Current):
- Token saved to `/tmp/alex_access_token.txt` (temporary)
- Automatically cleaned on reboot

**For Production** (Future):
- Server-side in-memory cache (e.g., Node.js Map, Redis)
- NEVER store in frontend / browser
- NEVER commit to git
- Rotate if exposed

### OAuth Testing Troubleshooting

#### "Could not acquire access token"

1. **Check client secret** - Verify correct secret from Medtech
2. **Check network** - Ensure outbound HTTPS allowed
3. **Check credentials** - Verify client ID matches quickstart doc
4. **Check scope** - Must be exact: `api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default`

#### "Unauthorized (401)"

1. **Token expired** - Tokens last ~60 minutes; run `./test-oauth.sh` again
2. **Invalid token** - Check token was copied correctly
3. **Wrong credentials** - Verify client ID/secret

#### "Forbidden (403)"

1. **IP not allow-listed** - Verify your IP with Medtech (should be done ✅)
2. **Wrong facility ID** - Must be `F2N060-E` for UAT
3. **Permissions** - Contact Medtech if app registration lacks permissions

#### "Patient not found (404)"

- Normal! Test patient `ZZZ0016` may not exist in UAT database
- Try different NHI if you have access to test patients
- 404 actually confirms API is working (authenticated successfully)

### Security Reminders

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

### Next Steps After Successful OAuth Testing

1. ✅ **Token acquisition works** - OAuth flow validated
2. ✅ **FHIR API accessible** - IP allow-listing confirmed
3. ✅ **Headers correct** - `mt-*` namespace validated

**Ready for**:
- Implement OAuth token service in Gateway (55-min cache)
- Implement ALEX API client with auto header injection
- Test POST Media endpoint

---

**Document Version**: 2.0  
**Last Updated**: 2025-11-12  
**Status**: Ready for testing  
**Note**: Consolidated with OAuth testing guide (TEST_OAUTH_README.md)
