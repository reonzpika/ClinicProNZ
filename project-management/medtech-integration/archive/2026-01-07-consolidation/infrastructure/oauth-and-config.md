# OAuth Configuration & Environment Setup

**Last Updated**: 2025-12-09  
**Consolidated from**: TECHNICAL_CONFIG.md + UPDATE_ENV_VARIABLES.md

---

## OAuth Configuration

### Credentials

- **Client ID**: `7685ade3-f1ae-4e86-a398-fe7809c0fed1`
- **Tenant ID**: `8a024e99-aba3-4b25-b875-28b0c0ca6096`
- **API Scope**: `api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default`
- **Client Secret**: Retrieved via OTP from Medtech (stored in environment variables)

### Facility IDs

- **Facility ID (UAT)**: `F2N060-E` (Medtech's test facility — use for API testing) ✅
- **Facility ID (Local)**: `F99669-C` (requires Hybrid Connection Manager — use for E2E testing)

**Current Recommendation**: Use `F2N060-E` for all current testing. Switch to `F99669-C` only when Hybrid Connection Manager is set up.

**For detailed guidance**: See [architecture.md](./architecture.md) section "The Two Facility IDs Explained"

### Token Management

- **Token Expiry**: 3599 seconds (~60 minutes)
- **Cache TTL**: 55 minutes (auto-refresh before expiry)
- **Refresh Strategy**: Refresh token at 55-minute mark to avoid expiry

---

## API Endpoints

### ALEX API Endpoints

- **UAT**: `https://alexapiuat.medtechglobal.com/FHIR`
- **Production**: `https://alexapi.medtechglobal.com/FHIR`

### BFF Endpoint

- **BFF**: `https://api.clinicpro.co.nz` (Static IP: 13.236.58.12)

**BFF Setup**: See [bff-setup.md](./bff-setup.md) for server configuration details

---

## Environment Variables Setup

### Required Environment Variables

| Variable | Value | Location | Notes |
|----------|-------|----------|-------|
| `MEDTECH_CLIENT_ID` | `7685ade3-f1ae-4e86-a398-fe7809c0fed1` | Vercel + BFF | OAuth client ID |
| `MEDTECH_CLIENT_SECRET` | `[OTP from Medtech]` | Vercel + BFF | OAuth secret |
| `MEDTECH_TENANT_ID` | `8a024e99-aba3-4b25-b875-28b0c0ca6096` | Vercel + BFF | OAuth tenant |
| `MEDTECH_FACILITY_ID` | `F2N060-E` | Vercel + BFF | Current: test facility |
| `MEDTECH_API_SCOPE` | `api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default` | Vercel + BFF | OAuth scope |

---

## Step-by-Step: Update Environment Variables

### Step 1: Update Vercel Environment Variables

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select Your Project**: Click on **ClinicPro** project
3. **Navigate to Settings**: Click **Settings** → **Environment Variables**
4. **Find the Variable**: Look for `MEDTECH_FACILITY_ID`
5. **Update the Value**: Click **edit icon** → Set value to `F2N060-E` → **Save**
6. **Redeploy**: Go to **Deployments** → Click **⋯** → **Redeploy**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Update environment variable for production
vercel env rm MEDTECH_FACILITY_ID production
vercel env add MEDTECH_FACILITY_ID production
# When prompted, enter: F2N060-E

# Redeploy
vercel --prod
```

---

### Step 2: Update Lightsail BFF Environment Variables

The BFF runs on AWS Lightsail at `api.clinicpro.co.nz`.

#### Option A: If Using .env File

1. **SSH into Lightsail Instance**:
   ```bash
   ssh -i /path/to/your-key.pem ubuntu@13.236.58.12
   ```

2. **Navigate to App Directory**:
   ```bash
   cd /home/deployer/app
   ```

3. **Edit .env File**:
   ```bash
   nano .env
   # or
   vim .env
   ```

4. **Update the Variable**:
   ```bash
   MEDTECH_FACILITY_ID=F2N060-E
   ```

5. **Save and Exit**: `Ctrl+X` → `Y` → `Enter`

6. **Restart the BFF Service**:
   ```bash
   sudo systemctl restart clinicpro-bff
   ```

7. **Verify the Service is Running**:
   ```bash
   sudo systemctl status clinicpro-bff
   ```

#### Option B: If Using systemd Environment File

1. **SSH into Lightsail Instance** (same as above)

2. **Edit systemd environment file**:
   ```bash
   sudo nano /etc/systemd/system/clinicpro-bff.service.d/environment.conf
   # or check the main service file
   sudo nano /etc/systemd/system/clinicpro-bff.service
   ```

3. **Update Environment Variable**:
   ```bash
   Environment="MEDTECH_FACILITY_ID=F2N060-E"
   ```

4. **Reload systemd and Restart**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart clinicpro-bff
   sudo systemctl status clinicpro-bff
   ```

---

### Step 3: Update Local Development (.env.local)

1. **Open .env.local** in your project root:
   ```bash
   nano .env.local
   ```

2. **Update the Variable**:
   ```bash
   MEDTECH_FACILITY_ID=F2N060-E
   ```

3. **Save and Exit**

4. **Restart your dev server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

---

## Verification Steps

### 1. Verify Vercel Environment Variable

```bash
# Using Vercel CLI
vercel env ls
```

Look for `MEDTECH_FACILITY_ID` and confirm value is `F2N060-E`

### 2. Verify BFF Environment Variable

```bash
# SSH into BFF
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12

# Check environment variable in running process
sudo systemctl show clinicpro-bff --property=Environment | grep MEDTECH_FACILITY_ID

# Or check logs for facility ID usage
sudo journalctl -u clinicpro-bff -n 50 | grep -i facility
```

### 3. Test API Call

```bash
# From your local machine or BFF
curl https://api.clinicpro.co.nz/api/medtech/test
```

Should return success with facility ID `F2N060-E`

---

## Key Services (Code Locations)

### OAuth Token Service

**Location**: `/src/lib/services/medtech/oauth-token-service.ts`

**Functions**:
- `getAccessToken()` - Gets cached or fresh token
- Token caching with 55-minute TTL
- Auto-refresh before expiry

**Usage**:
```typescript
import { getAccessToken } from '@/src/lib/services/medtech/oauth-token-service';

const token = await getAccessToken();
```

### ALEX API Client

**Location**: `/src/lib/services/medtech/alex-api-client.ts`

**Functions**:
- `get(endpoint)` - GET request with auth
- `post(endpoint, data)` - POST request with auth
- Automatic facility ID header injection
- Correlation ID tracking

**Usage**:
```typescript
import { alexApiClient } from '@/src/lib/services/medtech/alex-api-client';

const patient = await alexApiClient.get(`/Patient/${patientId}`);
```

### Correlation ID Service

**Location**: `/src/lib/services/medtech/correlation-id.ts`

**Functions**:
- `generateCorrelationId()` - UUID v4 generation
- Used for request tracking across BFF → ALEX API

---

## Troubleshooting

### Issue: OAuth Token Fails

**Symptoms**: 401 Unauthorized errors

**Check**:
1. Verify `MEDTECH_CLIENT_SECRET` is correct
2. Check token hasn't expired (should auto-refresh at 55 min)
3. Verify facility ID matches OAuth scope

**Solution**:
```bash
# Test token acquisition
curl https://api.clinicpro.co.nz/api/medtech/token-info
```

### Issue: 403 Forbidden (Facility ID)

**Symptoms**: 403 errors when calling ALEX API

**Check**:
1. Verify `MEDTECH_FACILITY_ID` is set to `F2N060-E`
2. Check BFF is using correct facility ID in headers

**Solution**:
```bash
# Check BFF logs for facility ID
sudo journalctl -u clinicpro-bff -n 100 | grep facility
```

### Issue: Changes Not Reflected

**Symptoms**: Updated env vars but still using old values

**Solution**:
1. Vercel: Trigger new deployment after env var change
2. BFF: Restart service after .env change
3. Local: Restart dev server after .env.local change

---

## Additional Resources

- **BFF Setup Guide**: [bff-setup.md](./bff-setup.md)
- **Architecture Guide**: [architecture.md](./architecture.md)
- **Testing Guide**: [../testing/testing-guide.md](../testing/testing-guide.md)
- **ALEX API Reference**: [../reference/alex-api.md](../reference/alex-api.md)

---

*Last Updated: 2025-12-09 - Consolidated environment setup and OAuth configuration*
