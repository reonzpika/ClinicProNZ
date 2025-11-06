# Medtech Integration - Resources & References

**Date**: 2025-10-31  
**Purpose**: Permanent reference for Medtech documentation, tools, and resources

---

## 📚 Medtech Documentation

### **ALEX API Documentation**
- **URL**: https://alexapidoc.medtechglobal.com/
- **Type**: Postman Collection Documentation
- **Version**: v2.9 (Sept 2025)
- **Purpose**: API reference for FHIR R4 endpoints, authentication, extensions
- **Key Sections**:
  - Authentication & Authorization (OAuth 2.0)
  - API Resource Catalogue (200+ endpoints)
  - Custom Fields & Extensions
  - Error Handling
  - Reference Tables

### **Medtech Evolution User Guide - Layout**
- **URL**: https://insight.medtechglobal.com/download/user-guide-medtech-evolution-layout/?wpdmdl=2581&refresh=69056cdf83cfc1761963231
- **Date Added**: 2025-10-31
- **Purpose**: Interface structure and navigation guide for Medtech Evolution
- **Key Sections**:
  - Layout — Interface structure overview
  - Left Pane — Quick launch panel for navigation
  - Dashboards — Clinical, CBIT, Patient dashboards with customization
  - Workspace — Dual monitor support, workspace customization
  - Medtech Evolution Ribbon — Ribbon-based navigation, role-based access
  - Function/Shortcut Keys — Keyboard shortcuts
- **Relevance**: Understanding where/how to launch widget in Medtech UI

---

## 🔗 ALEX API Endpoints

### **UAT Sandbox**
- **Base URL**: `https://alexapiuat.medtechglobal.com/FHIR`
- **OAuth**: `https://login.microsoftonline.com/8a024e99-aba3-4b25-b875-28b0c0ca6096/oauth2/v2.0/token`
- **Facility ID**: `F2N060-E`

### **Production**
- **Base URL**: `https://alexapi.medtechglobal.com/FHIR`
- **OAuth**: Same tenant as UAT
- **Facility ID**: (different per practice - provided by Medtech)

---

## 🔑 OAuth Credentials (UAT)

| Variable | Value | Status |
|----------|-------|--------|
| `MEDTECH_CLIENT_ID` | `7685ade3-f1ae-4e86-a398-fe7809c0fed1` | ✅ Active |
| `MEDTECH_CLIENT_SECRET` | Configured in `.env` | ✅ Retrieved |
| `MEDTECH_TENANT_ID` | `8a024e99-aba3-4b25-b875-28b0c0ca6096` | ✅ Active |
| `MEDTECH_API_SCOPE` | `api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default` | ✅ Active |

**Token Expiry**: ~60 minutes (cache for 55 min, refresh before expiry)

---

## 🛠️ Infrastructure

### **Lightsail BFF (Backend-for-Frontend)**
- **Domain**: `https://api.clinicpro.co.nz`
- **Static IP**: `13.236.58.12`
- **Purpose**: Static IP for ALEX API access (Vercel uses dynamic IPs)
- **Status**: ✅ Deployed, OAuth working
- **Blocker**: ALEX API port 443 timeout (Medtech firewall - awaiting update)

### **Vercel (Frontend)**
- **Production**: (your Vercel domain)
- **Purpose**: Frontend hosting
- **IP Allow-listing**: ✅ Configured by Medtech (Oct 26)

---

## 📋 Key Questions for Medtech Support

### **Sent (2025-10-31)**
1. **UAT Testing Environment** — Demo Evolution instance access
2. **Clinical Metadata Schema** — Body site, laterality, view, type extensions
3. **POST Media Examples** — Complete JSON with all metadata fields
4. **Widget Launch Mechanism** — Registration, context passing, placement options

### **To Send (Widget Placement)**
1. **Registration** — How to register widget URL?
2. **Placement Options** — Dashboard? Left Pane? Ribbon? Direct module?
3. **Launch Mechanism** — iFrame? New tab? CSP requirements?
4. **Context Passing** — JWT? URL params? PostMessage? What data available?
5. **Dashboard Widget** — Persistent? Customizable size? Real-time updates?
6. **Left Pane Widget** — How to add? Icon customization? Auto-open?
7. **Dual Monitor Support** — Auto-open in secondary monitor? Workspace persistence?

**Expected Response**: 3-5 business days

---

## 📖 Related Documentation (Our Docs)

| File | Purpose |
|------|---------|
| `README.md` | Project overview, architecture, development flow |
| `NEXT_STEPS.md` | Current status, action plan, blockers |
| `GATEWAY_IMPLEMENTATION.md` | OAuth service, ALEX client, implementation details |
| `alex-api-review-2025-10-30.md` | Complete ALEX API reference, Media findings |
| `medtech-alex-uat-quickstart.md` | OAuth setup, headers, first API calls |
| `images-widget-prd.md` | Product requirements, UI/UX specs, API contracts |
| `FOLDER_STRUCTURE_CONVENTIONS.md` | Import paths, naming conventions |
| `WIDGET_BUILD_SUMMARY.md` | Build summary, testing guide |
| `OAUTH_TEST_RESULTS.md` | OAuth test results (2025-10-31) |
| `CONSOLIDATION_LOG.md` | Documentation consolidation history |

---

## 🔍 Useful ALEX API Sections

### **For Widget Development**
- **Section 7**: Authentication & Authorization
- **Section 8**: API Resource Catalogue
  - **17. Inbox Write Back** (V2: POST Inbox Write Back - Media)
  - **21. Task** (POST Staff/Patient task write back)
- **Section 9**: Examples (cURL, JSON payloads)
- **Section 10**: Custom Fields & Extensions
- **Section 11**: Error Handling
- **Section 12**: Reference Tables

### **Critical Endpoints**
- `POST /FHIR/Media` — Commit clinical images (v2.2, Aug 2024)
- `POST /FHIR/Communication` — Inbox routing (if separate from Media)
- `POST /FHIR/Task` — Create tasks for staff
- `GET /FHIR/Patient` — Test connectivity
- `GET /FHIR/DocumentReference` — Verify committed images

---

## 🎯 Standards & Code Systems

### **SNOMED CT (Body Site, Laterality)**
- **System**: `http://snomed.info/sct`
- **Examples**:
  - Right: `24028007`
  - Left: `7771000`
  - Bilateral: `51440002`
  - Forearm: `40983000`
  - Hand: `7569003`

### **HL7 NZ Extensions**
- **Sex at Birth**: `http://hl7.org.nz/fhir/StructureDefinition/sex-at-birth`
- **Laterality**: (may use HL7 NZ extension - awaiting Medtech confirmation)

### **Custom ClinicPro Codes**
- **System**: `clinicpro/view` (for view types)
- **System**: `clinicpro/type` (for image types)
- **Codes**: close-up, dermoscopy, lesion, rash, wound, infection, other

---

## 📞 Medtech Contacts

- **Defne** — Support Team (primary contact for technical questions)
- **ALEX Support** — support@medtechglobal.com (general API support)

---

## 🧪 Testing Resources

### **Test NHI Numbers (UAT)**
- `ZZZ0016` — Test patient (used in examples)
- (more test patients - request from Medtech if needed)

### **Test Facility ID (UAT)**
- `F2N060-E`

### **Mock Data (Our Widget)**
- Encounter ID: `mock-encounter-123`
- Patient ID: `mock-patient-456`
- Patient Name: `John Smith`
- Patient NHI: `ABC1234`

---

## 🔐 Security Notes

### **Never Commit**
- OAuth client secrets
- Access tokens
- Full patient data (use mock/redacted in examples)
- API keys

### **Best Practices**
- Store credentials in `.env` (ignored by git)
- Use environment variables for all secrets
- Rotate credentials if exposed
- Log only first 10 chars of tokens (never full token)
- Implement token caching (55-min TTL)

---

## 🚀 Quick Links

- **ALEX API Docs**: https://alexapidoc.medtechglobal.com/
- **Medtech Evolution Layout Guide**: https://insight.medtechglobal.com/download/user-guide-medtech-evolution-layout/?wpdmdl=2581&refresh=69056cdf83cfc1761963231
- **Our Widget (Local)**: http://localhost:3000/medtech-images
- **Our Widget (Production)**: (deploy URL TBD)
- **Lightsail BFF**: https://api.clinicpro.co.nz

---

**Last Updated**: 2025-10-31
