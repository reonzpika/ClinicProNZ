# Medtech Real API Setup Guide

## ✅ What's Already Done

1. ✅ **Code Fix Applied** - Fixed OAuth service to read tenant ID correctly
2. ✅ **IP Allow-listing** - You mentioned this is already done by Medtech
3. ✅ **Azure AD App Registration** - Client ID and Tenant ID are configured
4. ✅ **Environment File** - `.env.local` exists with most variables set

## ❌ What You Need To Do

### **Get the Real Azure AD Client Secret**

Your `.env.local` file currently has a placeholder:
```bash
MEDTECH_CLIENT_SECRET=your_client_secret_here
```

**Action Required:**
1. Go to Azure Portal: https://portal.azure.com
2. Navigate to: **Azure Active Directory** → **App registrations**
3. Find the app: `clinicpro-images-widget` (or the app with Client ID: `7685ade3-f1ae-4e86-a398-fe7809c0fed1`)
4. Go to: **Certificates & secrets** → **Client secrets**
5. Either:
   - Copy an existing secret (if one exists and you have access)
   - OR Create a new client secret and copy it
6. Update `.env.local` line 15 with the real secret:
   ```bash
   MEDTECH_CLIENT_SECRET=<paste-real-secret-here>
   ```

**Important:** Client secrets are only shown once when created. If you don't have the existing secret, you'll need to create a new one.

---

## Testing After Update

Once you've updated the client secret:

### 1. Test OAuth Token Acquisition
```bash
npx tsx test-medtech-integration.ts
```

This should now successfully acquire an OAuth token from Azure AD.

### 2. Test Real API Connectivity
```bash
# Update .env.local to disable mock mode
# Change line 8 to:
NEXT_PUBLIC_MEDTECH_USE_MOCK=false

# Then test the API
pnpm dev

# In another terminal:
curl http://localhost:3000/api/medtech/test?nhi=ZZZ0016
```

Expected successful response:
```json
{
  "success": true,
  "correlationId": "...",
  "duration": 500,
  "tokenInfo": {
    "isCached": true,
    "expiresIn": 3300
  },
  "fhirResult": {
    "resourceType": "Bundle",
    "type": "searchset",
    "total": 1,
    "patientCount": 1,
    "firstPatient": {
      "id": "...",
      "name": { ... },
      "gender": "...",
      "birthDate": "..."
    }
  }
}
```

### 3. Test Desktop Widget
```bash
# Start dev server
pnpm dev

# Visit:
http://localhost:3000/medtech-images?encounterId=test&patientId=test
```

The widget should now:
- ✅ Successfully connect to ALEX API
- ✅ Acquire OAuth tokens automatically
- ✅ Upload and commit images to real FHIR server

---

## Current Configuration

Your `.env.local` is currently set to:

```bash
# Mode
NEXT_PUBLIC_MEDTECH_USE_MOCK=true  # ← Change to false for real API

# OAuth 2.0 Credentials
MEDTECH_CLIENT_ID=7685ade3-f1ae-4e86-a398-fe7809c0fed1  # ✅ Set
MEDTECH_CLIENT_SECRET=your_client_secret_here            # ❌ NEEDS UPDATE
MEDTECH_TENANT_ID=8a024e99-aba3-4b25-b875-28b0c0ca6096   # ✅ Set
MEDTECH_API_SCOPE=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default  # ✅ Set

# ALEX API
MEDTECH_API_BASE_URL=https://alexapiuat.medtechglobal.com/FHIR  # ✅ Set
MEDTECH_FACILITY_ID=F99669-C  # ✅ Set (UAT facility)
```

---

## Troubleshooting

### Error: "invalid_request" or "invalid_client"
- **Cause:** Client secret is wrong or expired
- **Fix:** Get a new client secret from Azure Portal

### Error: 403 Forbidden
- **Cause:** IP not allow-listed by Medtech
- **Fix:** Contact Medtech support to add your IP to the allow-list

### Error: 401 Unauthorized
- **Cause:** OAuth token expired or invalid
- **Fix:** The service auto-refreshes tokens. If persists, check client credentials.

### Error: "Specified tenant identifier 'undefined'"
- **Cause:** Environment variables not loaded (this was the bug I fixed)
- **Fix:** Already fixed in the code! ✅

---

## Summary

**To switch from mock mode to real API:**

1. ✅ IP allow-listing - Already done
2. ✅ Azure AD app registration - Already configured
3. ✅ Code bug fix - Just fixed!
4. ❌ **Get real client secret** - **This is the ONLY thing you need to do**
5. ❌ Update `MEDTECH_CLIENT_SECRET` in `.env.local`
6. ❌ Change `NEXT_PUBLIC_MEDTECH_USE_MOCK=false` in `.env.local`
7. ✅ Test the integration

**Where to get the client secret:**
- Azure Portal → Azure Active Directory → App registrations → Your app → Certificates & secrets

**Who can get it:**
- Azure AD admin or owner of the app registration
- If you don't have access, ask your Azure admin or the person who set up the app registration

---

Need help? The Azure AD app is registered with:
- **Client ID:** `7685ade3-f1ae-4e86-a398-fe7809c0fed1`
- **Tenant ID:** `8a024e99-aba3-4b25-b875-28b0c0ca6096`
- **Tenant Domain:** Should be something like `yourdomain.onmicrosoft.com`
