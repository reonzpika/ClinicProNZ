# Medtech ALEX Integration: Architecture & Testing Guide

**Version**: 1.0  
**Last Updated**: 2025-11-10  
**Audience**: Developers new to Medtech ALEX API integration

---

## Table of Contents
1. [Understanding the Architecture](#understanding-the-architecture)
2. [The Two Facility IDs Explained](#the-two-facility-ids-explained)
3. [Testing Approaches](#testing-approaches)
4. [Development Workflow](#development-workflow)

---

## Understanding the Architecture

### The Complete System

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLOUD COMPONENTS                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      │
│  │   Vercel     │      │  Lightsail   │      │  ALEX API    │      │
│  │  (Web App)   │─────▶│     BFF      │─────▶│    (UAT)     │      │
│  │              │      │  Static IP   │      │              │      │
│  │ - Widget UI  │      │ - OAuth      │      │ - FHIR R4    │      │
│  │ - Frontend   │      │ - API calls  │      │ - Medtech    │      │
│  └──────────────┘      └──────────────┘      └──────┬───────┘      │
│                                                       │              │
└───────────────────────────────────────────────────────┼──────────────┘
                                                        │
                                                        ▼
                                            ┌───────────────────┐
                                            │   Azure Relay     │
                                            │  (Hybrid Bridge)  │
                                            └─────────┬─────────┘
                                                      │
┌─────────────────────────────────────────────────────┼──────────────┐
│                    ON-PREMISES (GP CLINIC)          │              │
├─────────────────────────────────────────────────────┼──────────────┤
│                                                      ▼              │
│  ┌────────────────────────────┐    ┌────────────────────────────┐ │
│  │  Hybrid Connection Manager │◀───│   Medtech Evolution        │ │
│  │  (Windows Service)         │    │   (Local Database)         │ │
│  │                            │    │                            │ │
│  │  - Listens to Azure Relay  │    │  - Patient records         │ │
│  │  - Proxies TCP requests    │    │  - Encounters              │ │
│  │  - Enables cloud→local     │    │  - Clinical data           │ │
│  └────────────────────────────┘    └────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Explanations

#### 1. **Vercel (Your Main Web App)**
- **What it hosts**: Your React/Next.js frontend
- **What it does**: 
  - Displays the images widget UI
  - Handles user interactions (capture, edit, commit)
  - Makes API calls to Lightsail BFF
- **IP Address**: Dynamic (changes with each deployment)
- **Does NOT call ALEX API directly** (would fail due to IP whitelist)

#### 2. **Lightsail BFF (Backend for Frontend)**
- **What it hosts**: API proxy layer
- **What it does**:
  - Manages OAuth tokens for ALEX API
  - Makes FHIR API calls to ALEX API
  - Injects required headers (`mt-facilityid`, etc.)
  - Translates responses for frontend
- **IP Address**: Static (13.236.58.12) — whitelisted by Medtech
- **Critical**: This is the ONLY component that can call ALEX API

#### 3. **ALEX API (Medtech's Cloud Service)**
- **What it is**: Medtech's FHIR R4 API gateway
- **Environments**:
  - **UAT**: `https://alexapiuat.medtechglobal.com/FHIR` (testing)
  - **Production**: `https://alexapi.medtechglobal.com/FHIR` (live GPs)
- **What it does**:
  - Authenticates via Azure AD (OAuth 2.0)
  - Routes FHIR requests to appropriate facilities
  - Uses Azure Relay to reach on-premises databases

#### 4. **Azure Relay (The Bridge)**
- **What it is**: Microsoft's hybrid connection service
- **What it does**: 
  - Enables cloud services to reach on-premises systems
  - Maintains secure outbound-only connection
  - No inbound firewall rules needed on GP clinic side
- **How it works**: 
  - Hybrid Connection Manager (on-premises) connects TO Azure Relay
  - ALEX API sends requests TO Azure Relay
  - Azure Relay forwards TO Hybrid Connection Manager
  - Hybrid Connection Manager queries local Medtech database

#### 5. **Hybrid Connection Manager (On-Premises Gateway)**
- **What it is**: Windows service installed alongside Medtech Evolution
- **Where it runs**: On the same computer as Medtech Evolution
- **What it does**:
  - Listens to Azure Relay for incoming requests
  - Proxies TCP requests to local Medtech Evolution database
  - Returns data back through Azure Relay to ALEX API
- **Critical**: Without this running, ALEX API cannot reach on-premises data

#### 6. **Medtech Evolution (On-Premises EMR)**
- **What it is**: Electronic Medical Record system (desktop software)
- **Where it runs**: GP clinic computers (or your personal computer for testing)
- **What it contains**: 
  - Patient records
  - Encounters
  - Clinical images
  - All practice data
- **Database**: Local SQL Server database

---

## The Two Facility IDs Explained

You have access to TWO facility IDs. Understanding when to use each is critical.

### Facility ID: `F2N060-E` (Medtech's Test Facility)

**Type**: Cloud-hosted test facility

**Location**: Medtech's own data center (their infrastructure)

**Hybrid Connection**: Managed by Medtech (always available)

**Use When**:
- ✅ Testing API calls from Postman
- ✅ Verifying OAuth tokens work
- ✅ Developing/debugging your BFF code
- ✅ Quick validation that API endpoints respond correctly
- ✅ You don't have Hybrid Connection Manager set up yet

**Limitations**:
- ❌ Cannot test widget launching from YOUR Medtech Evolution
- ❌ Cannot test full end-to-end flow with YOUR local database
- ❌ Patient data is Medtech's test data (not your own test patients)

**Status**: Always available (Medtech manages the infrastructure)

**Example Use Case**: "I want to verify that my Lightsail BFF can successfully call ALEX API and retrieve patient data"

---

### Facility ID: `F99669-C` (Your Local Test Facility)

**Type**: On-premises test facility

**Location**: YOUR personal computer (Medtech Evolution installation)

**Hybrid Connection**: Requires Hybrid Connection Manager running on YOUR computer

**Use When**:
- ✅ Testing widget launch from YOUR Medtech Evolution
- ✅ Testing full end-to-end flow (capture → save → verify in Medtech)
- ✅ Creating YOUR own test patients and encounters
- ✅ Simulating real GP clinic environment
- ✅ Final UAT before production deployment

**Limitations**:
- ❌ Requires Hybrid Connection Manager service running on your PC
- ❌ Requires Medtech Evolution running on your PC
- ❌ More complex setup (Azure Relay configuration)

**Status**: Requires setup (Hybrid Connection Manager installation)

**Current Issue**: Hybrid Connection Manager service is stopped/not installed
- Medtech's email (2025-11-10) identified "severed connection"
- Fix: Restart "Hybrid Connection Manager Service" in Windows services

**Example Use Case**: "I want to launch the widget from my local Medtech Evolution, capture an image, and see it appear in my local Medtech database"

---

### Quick Decision Guide

**If you need to...**

| Goal | Use Facility | Requires Hybrid Connection Manager? |
|------|-------------|-------------------------------------|
| Test API calls from Postman | `F2N060-E` | ❌ No |
| Verify OAuth tokens work | `F2N060-E` | ❌ No |
| Test BFF → ALEX connectivity | `F2N060-E` | ❌ No |
| Develop API integration code | `F2N060-E` | ❌ No |
| Launch widget from Medtech Evolution | `F99669-C` | ✅ Yes |
| Test full end-to-end flow | `F99669-C` | ✅ Yes |
| Create custom test scenarios | `F99669-C` | ✅ Yes |
| Production-like testing | `F99669-C` | ✅ Yes |

---

## Testing Approaches

### Approach 1: Postman (Quick API Validation)

**Purpose**: Verify ALEX API connectivity and response formats

**What You're Testing**:
- OAuth token acquisition works
- FHIR endpoints respond correctly
- Facility ID is recognized
- Response data structure matches expectations

**Setup Requirements**:
- ✅ Postman installed
- ✅ OAuth credentials (Client ID, Tenant ID, Secret)
- ✅ Facility ID: `F2N060-E` (recommended for this approach)
- ❌ No code deployment needed
- ❌ No Hybrid Connection Manager needed

**What to Test**:
1. **OAuth Token Acquisition**
   - Endpoint: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`
   - Method: POST
   - Body: `client_id`, `client_secret`, `scope`, `grant_type`
   - Expected: 200 OK with `access_token`

2. **Get Location (Facility Info)**
   - Endpoint: `{{Base URL}}/FHIR/Location`
   - Method: GET
   - Headers: `Authorization: Bearer {token}`, `mt-facilityid: F2N060-E`
   - Expected: 200 OK with FHIR Bundle containing Location resources

3. **Get Patient**
   - Endpoint: `{{Base URL}}/FHIR/Patient?identifier=ZZZ0016`
   - Method: GET
   - Headers: `Authorization: Bearer {token}`, `mt-facilityid: F2N060-E`
   - Expected: 200 OK with FHIR Bundle containing Patient resource

4. **Get Encounter**
   - Endpoint: `{{Base URL}}/FHIR/Encounter?patient={patient-id}`
   - Method: GET
   - Headers: `Authorization: Bearer {token}`, `mt-facilityid: F2N060-E`
   - Expected: 200 OK with FHIR Bundle containing Encounter resources

**Pros**:
- ✅ Fast feedback loop
- ✅ No deployment needed
- ✅ Can share collections with team
- ✅ Good for debugging API responses
- ✅ Works immediately (no setup)

**Cons**:
- ❌ Doesn't test your application code
- ❌ Manual token management (no caching)
- ❌ Doesn't test BFF integration
- ❌ Doesn't test widget UI

**When to Use**: First step in testing, API exploration, debugging

---

### Approach 2: Lightsail BFF (Real Application Testing)

**Purpose**: Test your actual application code end-to-end

**What You're Testing**:
- Your BFF OAuth token service works
- Your BFF API client correctly calls ALEX API
- Your frontend can communicate with BFF
- Full application flow (as GP would use it)

**Setup Requirements**:
- ✅ Code deployed to Lightsail BFF
- ✅ Environment variables configured on Lightsail
- ✅ Facility ID: `F2N060-E` (for initial testing without Hybrid Connection Manager)
- ❌ No Hybrid Connection Manager needed (if using `F2N060-E`)

**Test Endpoints**:

1. **BFF Test Endpoint** (Quick Validation)
   ```bash
   curl "https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016"
   ```
   - Tests: OAuth + FHIR Patient query
   - Expected: 200 OK with patient data
   - What it validates:
     - BFF can acquire OAuth token
     - BFF can call ALEX API
     - ALEX API recognizes facility ID
     - Response is correctly formatted

2. **Token Info Endpoint** (Monitoring)
   ```bash
   curl "https://api.clinicpro.co.nz/api/medtech/token-info"
   ```
   - Shows: Current token cache status
   - Expected: Token details (expiry, cached, age)
   - What it validates:
     - OAuth token caching works
     - Token hasn't expired

3. **Capabilities Endpoint** (Feature Flags)
   ```bash
   curl "https://api.clinicpro.co.nz/api/medtech/capabilities"
   ```
   - Returns: Coded value lists, feature flags
   - Expected: 200 OK with capabilities object
   - What it validates:
     - BFF responds correctly
     - Frontend can fetch configuration

4. **Widget Flow Testing** (Full End-to-End)
   - Open widget UI: `https://your-vercel-app.vercel.app/medtech-images`
   - Capture/upload image
   - Add metadata
   - Commit to encounter
   - Verify API calls to BFF succeed
   - Check response handling

**Pros**:
- ✅ Tests real application code
- ✅ Tests BFF integration
- ✅ Tests frontend ↔ BFF communication
- ✅ Validates OAuth token caching
- ✅ Simulates real user flow

**Cons**:
- ❌ Requires code deployment
- ❌ Requires environment variable configuration
- ❌ Slower feedback loop (deploy → test → fix → redeploy)

**When to Use**: After Postman validation, before production deployment

---

### Approach 3: Full Widget Testing (End-to-End with Medtech Evolution)

**Purpose**: Test complete GP workflow from Medtech Evolution

**What You're Testing**:
- Widget launches correctly from Medtech Evolution
- Encounter context passes correctly
- Images save to YOUR local Medtech database
- Images appear in Medtech Evolution inbox/daily record
- Full user experience as GP would see it

**Setup Requirements**:
- ✅ Code deployed to Vercel (widget UI) and Lightsail (BFF)
- ✅ Hybrid Connection Manager installed and running on your PC
- ✅ Medtech Evolution running on your PC
- ✅ Facility ID: `F99669-C` (your local facility)

**Test Flow**:
1. Open Medtech Evolution on your PC
2. Open a patient encounter
3. Launch widget (mechanism TBD — iFrame, new tab, etc.)
4. Capture/upload image in widget
5. Add metadata
6. Commit to encounter
7. Verify image appears in Medtech Evolution inbox
8. Verify image appears in patient's daily record

**Pros**:
- ✅ Complete end-to-end validation
- ✅ Tests real GP workflow
- ✅ Uses YOUR test data
- ✅ Validates Hybrid Connection Manager setup
- ✅ Production-ready validation

**Cons**:
- ❌ Most complex setup (Hybrid Connection Manager required)
- ❌ Requires Medtech Evolution running
- ❌ Requires your PC to be on/available
- ❌ Slower feedback loop

**When to Use**: Final validation before production launch

**Status**: Deferred (Hybrid Connection Manager not set up yet)

---

## Development Workflow

### Current Setup

```
Code Changes (Cursor AI)
    ↓
Commit to GitHub
    ↓
Deploy to Vercel (automatic)
    ↓
Widget UI available at: https://your-vercel-app.vercel.app
```

### Lightsail BFF Deployment

**Question**: How is code deployed to Lightsail?

**Possible Scenarios**:

**Scenario A**: Manual deployment
- You SSH into Lightsail
- Pull code from GitHub
- Restart BFF service
- Update environment variables manually

**Scenario B**: Automated deployment (GitHub Actions, etc.)
- Code push triggers deployment script
- Lightsail automatically pulls and restarts

**Scenario C**: Lightsail only hosts static files
- No application code
- Only OAuth service running

**To Check**:
```bash
# SSH into Lightsail
ssh -i your-key.pem ubuntu@13.236.58.12

# Check what's running
systemctl status clinicpro-bff

# Check code location
ls -la /opt/clinicpro-bff/  # or wherever code is deployed

# Check what code is there
cat /opt/clinicpro-bff/package.json  # see dependencies
```

---

## Testing Priority Order (Recommended)

### Phase 1: Validate Setup (Today)
1. ✅ Test OAuth via Postman with `F2N060-E`
2. ✅ Test BFF via curl/Postman with `F2N060-E`
3. ✅ Verify BFF code location on Lightsail

**Success Criteria**: API calls return 200 OK (not 403 or 503)

### Phase 2: Widget Integration (Next Session)
1. Test widget UI calling BFF endpoints
2. Test full commit flow (mock or real)
3. Verify error handling

**Success Criteria**: Widget can commit images successfully

### Phase 3: Full End-to-End (Future)
1. Set up Hybrid Connection Manager
2. Test with facility `F99669-C`
3. Launch widget from Medtech Evolution
4. Verify images in Medtech database

**Success Criteria**: Images appear in Medtech Evolution inbox

---

## Quick Reference

### Environment Variables (Lightsail BFF)
```bash
MEDTECH_CLIENT_ID=7685ade3-f1ae-4e86-a398-fe7809c0fed1
MEDTECH_CLIENT_SECRET=[your-secret]
MEDTECH_TENANT_ID=8a024e99-aba3-4b25-b875-28b0c0ca6096
MEDTECH_FACILITY_ID=F2N060-E  # or F99669-C
MEDTECH_API_BASE_URL=https://alexapiuat.medtechglobal.com/FHIR
```

### Key URLs
- **ALEX API UAT**: `https://alexapiuat.medtechglobal.com/FHIR`
- **ALEX API Docs**: `https://alexapidoc.medtechglobal.com/`
- **Your Lightsail BFF**: `https://api.clinicpro.co.nz`
- **Static IP**: `13.236.58.12` (whitelisted)

### Facility IDs
- **`F2N060-E`**: Medtech's test facility (no Hybrid Connection Manager needed)
- **`F99669-C`**: Your local facility (requires Hybrid Connection Manager)

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-10  
**Next Review**: After Phase 1 testing complete
