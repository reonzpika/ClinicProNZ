# Update Environment Variables - Step by Step Guide

**Last Updated**: 2025-11-12  
**For Facility ID Guidance**: See ARCHITECTURE_AND_TESTING_GUIDE.md - "The Two Facility IDs Explained" section

---

## Facility ID Overview

**Current Working Configuration**: `F2N060-E` (Medtech's test facility)

**Two Facility IDs Available**:
- **`F2N060-E`**: Medtech's test facility (no Hybrid Connection Manager needed) ✅ **Use for API testing**
- **`F99669-C`**: Your local facility (requires Hybrid Connection Manager) ⚠️ **Use for full E2E testing** (deferred)

**Current Recommendation**: Use `F2N060-E` for all current testing. Switch to `F99669-C` only when Hybrid Connection Manager is set up for full end-to-end testing with your local Medtech Evolution instance.

**For detailed guidance on when to use which facility ID**, see ARCHITECTURE_AND_TESTING_GUIDE.md section "The Two Facility IDs Explained".

---

## What Needs to Change

**Variable to Update**:
- `MEDTECH_FACILITY_ID`: Should be set to `F2N060-E` for current API testing

**Note**: This guide shows how to update the variable. The actual value depends on your testing needs (see Facility ID Overview above).

---

## Step 1: Update Vercel Environment Variables

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com/dashboard
   - Sign in if needed

2. **Select Your Project**:
   - Click on **ClinicPro** project (or your project name)

3. **Navigate to Settings**:
   - Click **Settings** tab (top navigation)
   - Click **Environment Variables** in left sidebar

4. **Find the Variable**:
   - Look for `MEDTECH_FACILITY_ID` in the list
   - If you have multiple environments (Production, Preview, Development), check each one

5. **Update the Value**:
   - Click the **pencil/edit icon** next to `MEDTECH_FACILITY_ID`
   - Set value to `F2N060-E` (for API testing) or `F99669-C` (for E2E testing with Hybrid Connection Manager)
   - Click **Save**

6. **Redeploy** (if needed):
   - Vercel should auto-redeploy, but if not:
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Update environment variable for production
vercel env rm MEDTECH_FACILITY_ID production
vercel env add MEDTECH_FACILITY_ID production
# When prompted, enter: F2N060-E (or F99669-C if Hybrid Connection Manager is set up)

# Update for preview (optional)
vercel env rm MEDTECH_FACILITY_ID preview
vercel env add MEDTECH_FACILITY_ID preview
# When prompted, enter: F2N060-E (or F99669-C if Hybrid Connection Manager is set up)

# Update for development (optional)
vercel env rm MEDTECH_FACILITY_ID development
vercel env add MEDTECH_FACILITY_ID development
# When prompted, enter: F2N060-E (or F99669-C if Hybrid Connection Manager is set up)

# Redeploy
vercel --prod
```

---

## Step 2: Update Lightsail BFF Environment Variables

The BFF (Backend-for-Frontend) runs on AWS Lightsail at `api.clinicpro.co.nz`.

### Option A: If Using .env File

1. **SSH into Lightsail Instance**:
   ```bash
   ssh -i /path/to/your-key.pem ubuntu@13.236.58.12
   # Or use your Lightsail SSH connection method
   ```

2. **Navigate to BFF Directory**:
   ```bash
   cd /home/deployer/app
   # BFF location on Lightsail
   ```

3. **Edit .env File**:
   ```bash
   sudo nano .env
   # Or use your preferred editor
   ```

4. **Update the Variable**:
   - Find line: `MEDTECH_FACILITY_ID=...`
   - Set to: `MEDTECH_FACILITY_ID=F2N060-E` (for API testing) or `F99669-C` (for E2E testing)
   - Save and exit (Ctrl+X, then Y, then Enter for nano)

5. **Restart the Service**:
   ```bash
   sudo systemctl restart clinicpro-bff
   ```

6. **Verify Service is Running**:
   ```bash
   sudo systemctl status clinicpro-bff
   ```

### Option B: If Using Systemd Environment File

1. **SSH into Lightsail Instance**:
   ```bash
   ssh -i /path/to/your-key.pem ubuntu@13.236.58.12
   ```

2. **Find Systemd Service File**:
   ```bash
   sudo systemctl edit clinicpro-bff
   # Or edit directly:
   sudo nano /etc/systemd/system/clinicpro-bff.service
   ```

3. **Update Environment Variable**:
   - Find `Environment="MEDTECH_FACILITY_ID=..."`
   - Set to: `Environment="MEDTECH_FACILITY_ID=F2N060-E"` (for API testing) or `F99669-C` (for E2E testing)
   - Save and exit

4. **Reload Systemd and Restart**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart clinicpro-bff
   ```

5. **Verify**:
   ```bash
   sudo systemctl status clinicpro-bff
   ```

### Option C: Via AWS Lightsail Console

1. **Go to AWS Lightsail Console**:
   - Visit: https://lightsail.aws.amazon.com/
   - Sign in to AWS

2. **Select Your Instance**:
   - Find the instance running `api.clinicpro.co.nz`
   - Click on it

3. **Connect via Browser SSH**:
   - Click **Connect using SSH** button
   - This opens a browser-based terminal

4. **Follow Steps from Option A** (edit .env file and restart service)

---

## Step 3: Update Local Development (Optional)

If you're testing locally:

1. **Edit `.env.local` file** (in project root):
   ```bash
   nano .env.local
   # Or use your preferred editor
   ```

2. **Update the Variable**:
   - Find: `MEDTECH_FACILITY_ID=...`
   - Set to: `MEDTECH_FACILITY_ID=F2N060-E` (for API testing) or `F99669-C` (for E2E testing)
   - Save

3. **Restart Dev Server** (if running):
   ```bash
   # Stop current server (Ctrl+C)
   # Restart
   npm run dev
   ```

---

## Step 4: Verify the Change

### Test Vercel Deployment

1. **Check Environment Variable** (via API):
   ```bash
   # Call test endpoint (should show new facility ID)
   curl "https://clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016"
   # Or visit in browser
   ```

2. **Check Response**:
   ```json
   {
     "success": true,
     "environment": {
       "facilityId": "F2N060-E"  // Should match your configured value
     }
   }
   ```

### Test Lightsail BFF

1. **Check BFF Health**:
   ```bash
   curl https://api.clinicpro.co.nz/
   ```

2. **Check BFF Test Endpoint**:
   ```bash
   curl "https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016"
   ```

3. **Check Logs** (if needed):
   ```bash
   # SSH into Lightsail
   sudo journalctl -u clinicpro-bff -f
   # Look for facility ID in logs
   ```

---

## Troubleshooting

### Variable Not Updating in Vercel

**Problem**: Changed variable but still seeing old value

**Solutions**:
1. **Clear Vercel Cache**: Redeploy the project
2. **Check Environment Scope**: Make sure you updated the correct environment (Production vs Preview)
3. **Wait a Few Minutes**: Vercel can take 1-2 minutes to propagate changes

### Variable Not Updating in Lightsail

**Problem**: Changed .env file but service still using old value

**Solutions**:
1. **Restart Service**: `sudo systemctl restart clinicpro-bff`
2. **Check Service Status**: `sudo systemctl status clinicpro-bff`
3. **Check Logs**: `sudo journalctl -u clinicpro-bff -n 50`
4. **Verify .env File**: `cat /home/deployer/app/.env | grep MEDTECH_FACILITY_ID`

### Test Endpoint Failing

**Problem**: `/api/medtech/test` returns error

**Check**:
1. **OAuth Credentials**: Verify `MEDTECH_CLIENT_ID`, `MEDTECH_CLIENT_SECRET` are correct
2. **Facility ID**: Verify it's `F2N060-E` (for API testing) or `F99669-C` (for E2E testing with Hybrid Connection Manager)
3. **API Base URL**: Should be `https://alexapiuat.medtechglobal.com/FHIR`
4. **IP Allow-listing**: Should be resolved (Azure network security group added)
5. **If using F99669-C**: Ensure Hybrid Connection Manager is running on your local Medtech Evolution machine

---

## Quick Reference

### All Medtech Environment Variables (for reference)

```bash
# OAuth Credentials
MEDTECH_CLIENT_ID=7685ade3-f1ae-4e86-a398-fe7809c0fed1
MEDTECH_CLIENT_SECRET=<your-secret>  # Keep secret!
MEDTECH_TENANT_ID=8a024e99-aba3-4b25-b875-28b0c0ca6096
MEDTECH_API_SCOPE=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default

# API Configuration
MEDTECH_API_BASE_URL=https://alexapiuat.medtechglobal.com/FHIR
MEDTECH_FACILITY_ID=F2N060-E  # Use F2N060-E for API testing, F99669-C for E2E (requires Hybrid Connection Manager)
MEDTECH_APP_ID=clinicpro-images-widget

# Mock Mode (for development)
NEXT_PUBLIC_MEDTECH_USE_MOCK=true  # Set to false for production
```

---

## Summary Checklist

- [ ] Updated `MEDTECH_FACILITY_ID` in Vercel (Production)
- [ ] Updated `MEDTECH_FACILITY_ID` in Vercel (Preview) - if applicable
- [ ] Updated `MEDTECH_FACILITY_ID` in Lightsail BFF
- [ ] Restarted Lightsail BFF service
- [ ] Verified Vercel deployment (test endpoint works)
- [ ] Verified Lightsail BFF (test endpoint works)
- [ ] Updated local `.env.local` (if testing locally)

---

**Once complete**: Test connectivity with `/api/medtech/test?nhi=ZZZ0016` endpoint.

**Next Step**: After environment variables updated, proceed with testing and file upload flow implementation.
