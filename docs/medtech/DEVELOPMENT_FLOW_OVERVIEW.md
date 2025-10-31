# Development Flow Overview — Medtech Images Widget

**Date**: 2025-10-30  
**Audience**: High-level understanding before diving into details

---

## 🎯 Big Picture: What We're Building

**Goal**: A clinical images widget that GPs launch from within Medtech Evolution/Medtech32 to capture/upload photos, which are then saved back to the patient's encounter in Medtech via ALEX API.

---

## 🏗️ Architecture (3 Main Components)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Medtech Evolution / Medtech32                 │
│                        (GP's Desktop — On-Premises)                  │
│                                                                       │
│  ┌────────────────┐                                                  │
│  │  Medtech UI    │  Launches →                                      │
│  │  (Active       │                                                  │
│  │   Patient)     │                                                  │
│  └────────────────┘                                                  │
│           │                                                           │
│           │ Opens iFrame or New Tab                                  │
│           ↓                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │           ClinicPro Images Widget (Your App)                     ││
│  │           Frontend: React/Next.js (Embedded in Medtech)          ││
│  │           - Desktop: Capture, Edit, Review, Commit               ││
│  │           - Mobile: QR handoff for phone camera capture          ││
│  └─────────────────────────────────────────────────────────────────┘│
│           │                                                           │
│           │ API Calls (to your backend)                              │
│           ↓                                                           │
└───────────────────────────────────────────────────────────────────────┘
            │
            │
            ↓
┌─────────────────────────────────────────────────────────────────────┐
│              ClinicPro Integration Gateway (Your Backend)            │
│              Node.js / Next.js API Routes (Cloud-Hosted)             │
│              - OAuth token management (55-min cache)                 │
│              - FHIR ↔ REST translation                               │
│              - Header injection (mt-facilityid, mt-correlationid)    │
│              - Clinical metadata mapping (PRD → FHIR extensions)     │
└─────────────────────────────────────────────────────────────────────┘
            │
            │ FHIR API Calls (HTTPS)
            │ Headers: Authorization, mt-facilityid, Content-Type, etc.
            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Medtech ALEX® API Gateway                         │
│                    (Medtech's Cloud — Azure)                         │
│                    - OAuth 2.0 authentication (Azure AD)             │
│                    - FHIR R4 API (200+ endpoints)                    │
│                    - Hybrid connector to on-prem PMS via Azure Relay │
└─────────────────────────────────────────────────────────────────────┘
            │
            │ Azure Relay (Secure tunnel)
            ↓
┌─────────────────────────────────────────────────────────────────────┐
│         Medtech Evolution / Medtech32 Database                       │
│         (On-Premises — GP Practice Server)                           │
│         - Patient records, encounters, images stored here            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Development Flow (4 Stages)

### **Stage 1: Build Widget Frontend + Backend (Standalone)**

**Where**: Your local development environment

**What You Build**:
1. **Frontend** (React/Next.js):
   - Desktop UI: image capture, editing, metadata chips, gallery
   - Mobile UI: QR scan, camera capture, batch upload
   - Mock API responses for development

2. **Backend** (Integration Gateway):
   - REST API endpoints (`/capabilities`, `/attachments/commit`, etc.)
   - OAuth token service (55-min cache)
   - FHIR metadata mapping logic
   - Initially: **mock the ALEX API** (fake responses)

**Testing at This Stage**:
- [ ] Widget UI works standalone (no Medtech yet)
- [ ] Desktop: capture, edit, commit flows work with mock data
- [ ] Mobile: QR generation, mobile upload works
- [ ] Backend: token caching, correlation ID generation works
- [ ] All frontend ↔ backend API contracts work

**Duration**: 2-3 weeks (parallel with ALEX deep dive)

---

### **Stage 2: Connect to ALEX UAT Sandbox**

**Where**: Your backend connects to `https://alexapiuat.medtechglobal.com/FHIR`

**What ALEX Documentation Says** (Section 5: Getting Started):

> **UAT Testing Overview**:
> - Use UAT Sandbox for all integration development and testing
> - Separate from production; uses test facility `F2N060-E`
> - Full FHIR API access with test patient data
> - No real patient data; safe for experimentation

**What You Do**:
1. **Replace mock API** in your Integration Gateway with real ALEX API calls
2. **Use test credentials**:
   - Client ID: `7685ade3-f1ae-4e86-a398-fe7809c0fed1` (from quickstart)
   - Facility ID: `F2N060-E` (UAT test facility)
   - Base URL: `https://alexapiuat.medtechglobal.com/FHIR`
3. **Test FHIR operations**:
   - GET Patient (verify connectivity)
   - POST Media with test image
   - Verify image appears in... (see below ⬇️)

**Key Question: How Do You Verify Images in UAT?**

**From ALEX Docs** (Section 5 doesn't explicitly state, but inferred):
- ALEX UAT is the **API gateway only** — it doesn't have its own UI
- Images are stored in the **on-premises Medtech PMS database**
- **Problem**: You likely **don't have access** to a Medtech Evolution instance connected to UAT

**Workaround for Stage 2**:
1. **Verify via API responses**: Check that POST Media returns `201 Created` with resource ID
2. **Verify via GET**: Fetch the Media resource by ID; confirm metadata is correct
3. **Ask Medtech support**: Can they provide a test Medtech instance or screenshots showing your uploaded images?

**Testing at This Stage**:
- [ ] OAuth token acquisition works (real Azure AD)
- [ ] GET Patient returns FHIR Bundle from ALEX UAT
- [ ] POST Media succeeds (201 response with resource ID)
- [ ] GET Media by ID returns your uploaded image
- [ ] Metadata extensions are present in response
- [ ] Correlation IDs appear in logs (if Medtech provides access)

**Duration**: 1-2 weeks

**⚠️ Limitation**: You can test the **API integration** but cannot visually verify images in Medtech UI unless Medtech provides access.

---

### **Stage 3: Test in Medtech Virtual Environment (If Available)**

**What ALEX Documentation Says**: 
- **Section 4** mentions "UAT Sandbox" but doesn't explicitly describe a "Medtech virtual environment" or "demo Medtech instance"
- **Section 5** describes UAT testing workflow but focuses on API testing, not Medtech UI testing

**Unclear from Documentation**:
- Does Medtech provide a **demo Medtech Evolution instance** for partners to test integrations?
- Is there a **Medtech cloud demo** or **VM-based test environment**?

**What You Should Ask Medtech Support**:

> "For integration testing, does Medtech provide:
> 1. A demo Medtech Evolution instance that connects to ALEX UAT?
> 2. Access to view uploaded images in the Medtech UI during UAT testing?
> 3. A virtual environment or test practice we can use for end-to-end testing?
> 
> Or is UAT testing limited to API-level verification only?"

**If Medtech Provides a Virtual Environment**:
- You'd launch your widget from within that test Medtech instance
- Upload images via your widget
- Switch back to Medtech UI and verify images appear in encounter
- Test full workflow: launch → capture → commit → view in Medtech

**If NOT (Most Likely Scenario)**:
- UAT testing is **API-only** (you verify responses, not UI)
- Full end-to-end testing happens in **Stage 4: Production Pilot**

**Testing at This Stage** (if environment available):
- [ ] Launch widget from Medtech button (iFrame or new tab)
- [ ] Medtech passes encounter context to widget
- [ ] Capture and commit images
- [ ] Images appear in Medtech encounter view
- [ ] Images are selectable in HealthLink/ALEX referral pickers

**Duration**: 1 week (if environment provided)

---

### **Stage 4: Production Pilot (Real GP Practice)**

**What ALEX Documentation Says** (Section 5: Production Workflow):

> **Production Deployment**:
> - Use production endpoint: `https://alexapi.medtechglobal.com/FHIR`
> - Different client ID, facility ID, and credentials from UAT
> - Production facility ID assigned by Medtech (not `F2N060-E`)
> - Real patient data; must comply with privacy and security requirements

**What You Do**:
1. **Medtech provides production credentials**:
   - Production client ID
   - Production facility ID
   - Production scope (same format, different resource ID)
2. **Deploy your widget** to production hosting (Vercel/AWS/etc.)
3. **Configure in Medtech**: Medtech support enables your widget for a pilot practice
4. **Pilot with 1-2 GP practices**:
   - GPs use the widget in real consultations
   - Monitor errors, performance, and user feedback
5. **Iterate and expand**: Fix issues, then roll out to more practices

**Testing at This Stage**:
- [ ] Real GPs launch widget during real patient consultations
- [ ] Images commit to real patient encounters
- [ ] Images appear in Medtech UI and are usable for referrals
- [ ] Performance meets SLA (≤20s capture→commit)
- [ ] Error rates ≤2% (as per PRD success metrics)

**Duration**: 2-4 weeks pilot + iterations

---

## 📊 Summary Table: Where Can You Test What?

| Stage | Environment | What You Test | Can See Medtech UI? | Duration |
|-------|-------------|---------------|---------------------|----------|
| **1. Standalone** | Local dev | Widget UI/UX, frontend↔backend API | ❌ No (mock data) | 2-3 weeks |
| **2. ALEX UAT** | `alexapiuat.medtechglobal.com` | API integration, FHIR responses | ⚠️ Unclear (ask Medtech) | 1-2 weeks |
| **3. Virtual Env** | Medtech test instance (if exists) | Full workflow, widget launch | ✅ Yes (if provided) | 1 week |
| **4. Production Pilot** | `alexapi.medtechglobal.com` | Real-world usage, performance | ✅ Yes (real practices) | 2-4 weeks |

---

## 🔍 What ALEX Documentation DOES NOT Clearly Explain

### ❓ **Medtech Virtual Environment / Demo Instance**

**Missing from Docs**:
- No mention of a "test Medtech Evolution instance" for partners
- No description of how to visually verify images during UAT testing
- Unclear if UAT is API-only or includes UI testing

**You Need to Ask Medtech**:
1. Is there a demo Medtech instance connected to UAT sandbox?
2. How do partners typically test the full integration (widget launch → image commit → UI verification)?
3. Can Medtech support provide screenshots of test images in UAT?

### ❓ **Widget Launch Mechanism**

**What PRD Says**:
> "Launch from Medtech button... embedded iFrame preferred; new-tab fallback"

**What ALEX Docs DON'T Say**:
- How does Medtech pass the encounter context to your widget?
- Is it a signed JWT? POST with form data? URL parameters?
- How does Medtech "know" your widget URL to launch?

**Likely Answer** (not in ALEX docs):
- Medtech Evolution has a **plugin/integration configuration** system
- You register your widget URL with Medtech support
- Medtech adds a button to the UI that launches your URL with context (e.g., `https://widget.clinicpro.com?encounter=xyz&token=signed-jwt`)

**You Need to Ask Medtech**:
1. How do we register our widget URL with Medtech?
2. What is the exact launch mechanism (iFrame src? window.open? POST form?)
3. How is the encounter context passed (JWT? Encrypted token?)
4. Is there documentation on the Medtech widget integration SDK?

---

## 🎓 Recommended Development Approach

### **Option A: API-First (Recommended)**

1. **Week 1-2**: Build Integration Gateway + OAuth token service
2. **Week 2-3**: Connect to ALEX UAT; test POST Media via cURL/Postman
3. **Week 3-4**: Build widget frontend with mock backend
4. **Week 4-5**: Connect frontend to real Gateway; test standalone
5. **Week 6**: Request Medtech virtual environment access (if exists) OR proceed to production pilot
6. **Week 7+**: Production pilot with real GP practice

**Pros**:
- De-risks ALEX API integration early
- Can test backend thoroughly before frontend is ready
- Parallel frontend/backend development

**Cons**:
- Can't visually verify images in Medtech UI until late in process

---

### **Option B: Frontend-First**

1. **Week 1-3**: Build widget frontend + mock backend (full UI)
2. **Week 4-5**: Build Integration Gateway
3. **Week 5-6**: Connect to ALEX UAT
4. **Week 6-7**: Request Medtech access for end-to-end testing
5. **Week 7+**: Production pilot

**Pros**:
- Faster UI/UX validation
- Can demo to stakeholders earlier

**Cons**:
- ALEX API integration risks discovered late
- May need to refactor frontend if backend assumptions are wrong

---

## 🚀 What ALEX Documentation DOES Provide for UAT Testing

**From Section 5 (Getting Started)**:

### **UAT Testing Workflow** (per ALEX docs):

1. **Request Azure AD account** from Medtech
2. **Receive test credentials**:
   - Client ID
   - Tenant ID
   - Scope
   - Facility ID: `F2N060-E`
3. **Obtain OTP** → retrieve client secret
4. **Test token acquisition** from Azure AD
5. **Make test API calls** to `https://alexapiuat.medtechglobal.com/FHIR`
6. **Verify responses** (FHIR Bundles, resource IDs, status codes)

**What They Provide**:
- ✅ Full FHIR API access in UAT
- ✅ Test facility with test patient data
- ✅ Same endpoints as production (safe for experimentation)
- ✅ Correlation ID tracing (if you request log access)

**What They DON'T Explicitly Provide** (ask Medtech):
- ❓ Demo Medtech Evolution instance for UI testing
- ❓ Widget launch mechanism documentation
- ❓ Screenshots/video of how images appear in Medtech
- ❓ Access to Medtech UI to verify uploaded images

---

## 📋 Key Questions to Ask Medtech Support (Next Steps)

### **1. UAT Testing Environment**
> "Does Medtech provide a demo Medtech Evolution instance connected to ALEX UAT Sandbox for partners to test widget integrations end-to-end? If yes, how do we request access?"

### **2. Widget Launch Mechanism**
> "How do we register our widget URL with Medtech? What is the technical mechanism for launching the widget from Medtech (iFrame, new tab, POST form) and how is the encounter context passed to our widget?"

### **3. Visual Verification in UAT**
> "During UAT API testing, how can we visually verify that images committed via POST Media appear correctly in the Medtech UI? Can Medtech support provide test screenshots or log access?"

### **4. Production Onboarding**
> "What is the onboarding process for production deployment? Who at Medtech handles widget registration, and what is the typical timeline from UAT completion to production pilot?"

---

## ✅ Your Path Forward (Recommended)

### **This Week (Week 2)**:
1. ✅ **Understand the flow** (you're doing this now!)
2. **Review ALEX Section 10** (FHIR extensions)
3. **Test connectivity** (GET Patient via UAT)
4. **Submit Medtech support ticket** with the 4 questions above

### **Next 2 Weeks (Weeks 3-4)**:
1. **Build Integration Gateway** (OAuth + FHIR client)
2. **Test POST Media** to ALEX UAT (cURL first, then code)
3. **Build widget frontend** (with mock backend initially)

### **Week 5-6**:
1. **Connect frontend to real Gateway**
2. **Request Medtech virtual environment access** (if exists)
3. **End-to-end testing** (or API-only if no virtual env)

### **Week 7+**:
1. **Production pilot** with 1-2 GP practices
2. **Monitor and iterate**

---

**Bottom Line**: ALEX docs focus on **API integration testing** (UAT Sandbox). For **full end-to-end testing** (widget launch → commit → view in Medtech UI), you need to **ask Medtech support** if they provide a demo/virtual environment or if that only happens in production pilot.

**Recommendation**: Start with **API-first approach** — get ALEX integration working in UAT, then worry about Medtech UI integration later.

**Need to email Medtech?** Use the template in `email-draft-uat-testing-access.md`
