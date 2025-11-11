# Testing Guide: Postman & Lightsail BFF

**Version**: 1.0  
**Last Updated**: 2025-11-10  
**Prerequisites**: ARCHITECTURE_AND_TESTING_GUIDE.md (read first)

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

**Purpose**: Validate ALEX API connectivity without deploying code

**Facility to Use**: `F2N060-E` (Medtech's test facility)

**Why Postman First**: Proves that API calls work before testing your code

---

### Step 1: Get OAuth Token

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

### Postman Success Criteria

✅ **All 4 requests return 200 OK**
- OAuth token acquired
- Location retrieved
- Patient retrieved
- Encounter retrieved

**If all pass**: ALEX API is working correctly. Your setup is good.

**Next**: Test via your Lightsail BFF code

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

**Document Version**: 1.0  
**Last Updated**: 2025-11-10  
**Status**: Ready for testing
