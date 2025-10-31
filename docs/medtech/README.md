# Medtech ALEX Integration Documentation

**Status**: Week 1 Complete ✅ | Ready for UAT Testing  
**Last Updated**: 2025-10-30

---

## 📁 Core Documentation (5 Files + 1 Temp)

| File | Purpose | Read When |
|------|---------|-----------|
| **[README.md](./README.md)** | Overview, architecture, dev flow | First time, onboarding |
| **[NEXT_STEPS.md](./NEXT_STEPS.md)** | Current status, immediate actions | Daily, planning |
| **[medtech-alex-uat-quickstart.md](./medtech-alex-uat-quickstart.md)** | OAuth setup, headers, API calls | Setting up connection |
| **[alex-api-review-2025-10-30.md](./alex-api-review-2025-10-30.md)** | Complete API reference + Media findings | Technical reference |
| **[images-widget-prd.md](./images-widget-prd.md)** | Product requirements | Product planning |
| `email-draft-uat-testing-access.md` | Support ticket template (temp) | Before contacting Medtech |

**Total**: ~2,500 lines consolidated (down from 10 files)

---

## 🔗 Key Links

- **ALEX API Documentation** (Source of Truth): https://alexapidoc.medtechglobal.com/
- **UAT Sandbox**: `https://alexapiuat.medtechglobal.com/FHIR`
- **Production**: `https://alexapi.medtechglobal.com/FHIR`

---

## 🚀 Quick Start

**New to this project?** Read in this order:
1. **This README** (10 min) — Big picture and development flow
2. **[NEXT_STEPS.md](./NEXT_STEPS.md)** (5 min) — Current status and immediate actions
3. **[medtech-alex-uat-quickstart.md](./medtech-alex-uat-quickstart.md)** (15 min) — Connect to ALEX UAT
4. **[alex-api-review-2025-10-30.md](./alex-api-review-2025-10-30.md)** (reference) — Deep dive when needed

---

## 📝 Current Status

### ✅ **Completed**
- Non-commercial agreement signed with Medtech
- IP allow-listing configured by Medtech (production Vercel environment)
- OAuth credentials configured in Vercel env vars (Oct 26)
- OAuth token acquisition tested and validated (Oct 31)
- ALEX API documentation reviewed
- POST Media endpoint confirmed (supports images)
- Documentation consolidated

### 🔄 **In Progress**
- ✅ **Integration Gateway OAuth Service Complete** (Oct 31)
  - OAuth token service with 55-min cache
  - ALEX API client with header injection
  - Correlation ID generation
  - Test endpoints for connectivity validation
- **Deploying to Lightsail BFF** (Oct 31 - Current)
  - BFF infrastructure: `api.clinicpro.co.nz` (Static IP: 13.236.58.12)
  - Using allow-listed IP to call ALEX API
  - Vercel → BFF → ALEX architecture
- Awaiting Medtech response (email sent Oct 31) on:
  - UAT testing environment access
  - Widget launch mechanism
  - Clinical metadata schema (body site, laterality, view, type)
  - Full POST Media example
- Expected response: 3-5 business days

### 📋 **Next**
- Deploy OAuth service to Lightsail BFF (uses allow-listed IP)
- Test from BFF: `https://api.clinicpro.co.nz/api/medtech/test`
- Update Vercel to call BFF instead of ALEX directly
- Build frontend UI with mock backend (not blocked)
- Implement POST Media endpoint (blocked until Medtech response)

---

## 🎯 What We're Building

**Goal**: A clinical images widget that GPs launch from within Medtech Evolution/Medtech32 to capture/upload photos, which are then saved back to the patient's encounter in Medtech via ALEX API.

**Key Features**:
- Desktop: Capture, edit, annotate, commit images to encounter
- Mobile: QR handoff for phone camera capture
- Clinical metadata: Body site, laterality, view type, image classification
- Integration: Images instantly available for HealthLink/ALEX referrals

---

## 🏗️ Architecture (3 Main Components)

```
┌─────────────────────────────────────────────────────┐
│   Medtech Evolution (GP's Desktop — On-Premises)    │
│   - Launches widget (iFrame or new tab)             │
│   - Passes encounter context to widget              │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────┐
│   ClinicPro Images Widget (Your App — Cloud)        │
│   - Frontend: React/Next.js                         │
│   - Desktop: Capture, edit, review, commit          │
│   - Mobile: QR handoff for phone camera             │
└──────────────────┬──────────────────────────────────┘
                   │ API calls
                   ↓
┌─────────────────────────────────────────────────────┐
│   Integration Gateway (Your Backend — Cloud)        │
│   - OAuth token management (55-min cache)           │
│   - FHIR ↔ REST translation                         │
│   - Header injection (mt-facilityid, mt-*)          │
│   - Clinical metadata mapping                       │
└──────────────────┬──────────────────────────────────┘
                   │ FHIR API (HTTPS)
                   ↓
┌─────────────────────────────────────────────────────┐
│   Medtech ALEX® API Gateway (Medtech Cloud)         │
│   - OAuth 2.0 authentication (Azure AD)             │
│   - FHIR R4 API (200+ endpoints)                    │
│   - Hybrid connector via Azure Relay                │
└──────────────────┬──────────────────────────────────┘
                   │ Azure Relay (secure tunnel)
                   ↓
┌─────────────────────────────────────────────────────┐
│   Medtech Database (On-Premises at GP Practice)     │
│   - Patient records, encounters, images stored      │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Development Flow (4 Stages)

### **Stage 1: Build Standalone** (2-3 weeks)

**What**: Build widget frontend + backend with mock ALEX API

**Components**:
- Frontend: Desktop UI (capture, edit, metadata chips, gallery)
- Frontend: Mobile UI (QR scan, camera, batch upload)
- Backend: Integration Gateway with mock ALEX responses
- Backend: OAuth token service (55-min cache)

**Testing**:
- Widget UI works standalone (no Medtech)
- All frontend ↔ backend API contracts work
- Token caching, correlation ID generation works

**Can Start Now**: ✅ Not blocked

---

### **Stage 2: Connect to ALEX UAT** (1-2 weeks)

**What**: Replace mock API with real ALEX UAT calls

**Endpoint**: `https://alexapiuat.medtechglobal.com/FHIR`

**Testing**:
- OAuth token acquisition from Azure AD
- GET Patient (verify connectivity)
- POST Media with test image (verify 201 response)
- GET Media by ID (verify image retrieval)

**Limitation**: Can verify API responses, but probably can't see images in Medtech UI (need to ask Medtech about demo instance access)

**Status**: 🔄 Waiting for Medtech response on clinical metadata schema

---

### **Stage 3: Medtech Virtual Environment?** (1 week if available)

**What**: Test full workflow including Medtech UI verification

**Unknown**: ALEX docs don't mention if Medtech provides demo Evolution instance for testing

**Need from Medtech**:
- Demo Medtech instance connected to UAT?
- How to visually verify images in Medtech UI during testing?
- Widget launch mechanism details?

**Testing** (if environment provided):
- Launch widget from Medtech button
- Capture and commit images
- Verify images appear in Medtech encounter view
- Verify images are selectable in HealthLink/ALEX referrals

**Status**: 🔄 Awaiting Medtech response on UAT environment access

---

### **Stage 4: Production Pilot** (2-4 weeks)

**What**: Deploy to production with real GP practice

**Endpoint**: `https://alexapi.medtechglobal.com/FHIR`

**Process**:
1. Medtech provides production credentials (different from UAT)
2. Deploy widget to production hosting
3. Medtech enables widget for pilot practice
4. 1-2 GPs test in real consultations
5. Monitor, iterate, expand rollout

**Testing**: Real-world usage with actual patients (first time seeing images in production Medtech UI)

---

## 📊 Testing Summary: Where Can You Test What?

| Stage | Environment | API Testing | Medtech UI Verification |
|-------|-------------|-------------|-------------------------|
| **1. Standalone** | Local dev | ❌ Mock only | ❌ Mock only |
| **2. ALEX UAT** | `alexapiuat` | ✅ Yes | ⚠️ Unknown (ask Medtech) |
| **3. Virtual Env** | Medtech test? | ✅ Yes | ✅ If provided |
| **4. Production** | Real practice | ✅ Yes | ✅ Yes |

**Key Gap**: ALEX docs focus on API testing. For full UI testing, need Medtech support to clarify.

---

## ⚠️ Critical Findings

### ✅ **What Works**
- POST Media endpoint exists (v2.2, Aug 2024)
- Image file support confirmed
- Base64 inline data format supported
- OAuth 2.0 client credentials flow documented

### ❌ **What's Missing**
- Clinical metadata schema NOT documented (body site, laterality, view, type)
- Widget launch mechanism NOT documented
- Demo/virtual environment NOT mentioned
- Full POST Media example missing

### 💡 **Key Insight**
FHIR R4 Media resource has **standard fields** for body site and view:
- `Media.bodySite` (CodeableConcept with SNOMED CT)
- `Media.view` (CodeableConcept)

**Theory**: ALEX probably accepts standard FHIR fields, not custom extensions. Postman docs just show minimal example.

**Action**: Ask Medtech to confirm (email draft ready)

---

## 🚨 Blocking vs Non-Blocking

### **✅ Can Proceed NOW** (Not Blocked)
- Build Integration Gateway OAuth service
- Build frontend UI with mock backend
- Design UX for metadata capture
- Implement client-side image compression
- Test OAuth token acquisition

### **❌ Must Wait for Medtech Response**
- Final FHIR metadata mapping (body site → FHIR field/extension)
- POST Media implementation with clinical metadata
- End-to-end image commit testing
- Widget launch integration

**Expected Wait**: 3-5 business days for Medtech support response

---

## 📋 Immediate Actions

1. **Send email to Medtech** (15 min) — Use `email-draft-uat-testing-access.md`
2. **Test OAuth token acquisition** (30 min) — Follow quickstart guide
3. **Start Gateway OAuth service** (2-3 days) — Implement 55-min token cache
4. **Design frontend mockups** (1-2 days) — Metadata chips, gallery UI
5. **Read full documentation** (as needed) — Reference `alex-api-review-2025-10-30.md`

---

## 📚 Documentation Guide

### **When to Use Each Doc**

**README** (this file):
- First-time overview
- Understanding the architecture
- Development flow and stages

**NEXT_STEPS.md**:
- Current status and blockers
- Week-by-week action plan
- Immediate tasks

**medtech-alex-uat-quickstart.md**:
- Setting up OAuth connection
- First API calls
- Headers and environment variables

**alex-api-review-2025-10-30.md**:
- Complete ALEX API reference
- POST Media findings
- Custom headers and extensions
- Error handling

**images-widget-prd.md**:
- Product requirements
- Success metrics
- UI/UX specifications
- Gateway API contracts (aspirational)

---

## 💡 Key Takeaways

1. **ALEX supports images** — POST Media endpoint exists (v2.2, Aug 2024)
2. **Metadata schema unclear** — Not documented; likely uses standard FHIR fields
3. **Not a blocker** — Frontend and Gateway OAuth can proceed in parallel
4. **Ask Medtech** — Email draft ready with 7 critical questions
5. **UAT is API-focused** — Full UI testing may require production pilot

---

## 🎯 Success Criteria

**Week 2-3**: OAuth service working, frontend mockups complete  
**Week 4**: POST Media to UAT successful (pending Medtech response)  
**Week 5-6**: Full integration testing (UAT or production pilot)  
**Week 7+**: Production rollout to GP practices

---

**Questions?** Check **[NEXT_STEPS.md](./NEXT_STEPS.md)** for current action plan or **[alex-api-review-2025-10-30.md](./alex-api-review-2025-10-30.md)** for technical details.
