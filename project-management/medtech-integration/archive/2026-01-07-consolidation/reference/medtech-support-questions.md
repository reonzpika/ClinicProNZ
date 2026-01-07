# Questions for Medtech Partner Support

**Purpose**: Clarify Medtech Evolution widget integration details for Clinical Images feature  
**Date Created**: 2025-12-09  
**Status**: Ready to send  
**Priority**: Medium (can proceed with implementation while waiting for answers)

---

## Contact Information

**Email**: support@medtechglobal.com  
**Alternative**: Medtech partner portal (if we have access)  
**Subject Line**: "Clinical Images Widget Integration - ALEX Apps Launch Configuration"

---

## Context to Provide

```
We are building a clinical images capture widget that integrates with Medtech Evolution 
via ALEX Apps. The widget allows GPs to capture clinical images on desktop or mobile, 
add metadata, and commit them to patient records via ALEX FHIR API (POST Media).

We have reviewed the ALEX API documentation and understand the FHIR endpoints. We need 
clarification on how our app will be launched from Medtech Evolution and how patient 
context will be passed.
```

---

## Questions

### 1. Launch URL Format

**Question**: What is the launch URL format when a GP clicks our app in the ALEX Apps menu?

**Example we expect**:
```
https://app.clinicpro.co.nz/medtech-images?
  token=<launch-token>
  &patient=<patient-id>
  &facility=<facility-id>
  &provider=<provider-id>
```

**What we need to know**:
- Exact URL format with all parameters
- Are parameters in query string, POST body, or both?
- Is there a launch token or session identifier?

---

### 2. Patient Context Fields

**Question**: What fields are passed at launch to identify the patient and encounter?

**Fields we need**:
- Patient ID (EHR internal key)
- Patient NHI (national identifier)
- Patient name (for immediate display)
- Patient DOB (optional)
- Encounter ID (current encounter, if applicable)
- Facility ID (practice/location)
- Provider ID (GP launching the app)
- Provider name (optional)

**What we need to know**:
- Which of the above are guaranteed vs optional?
- What format are they in? (strings, UUIDs, etc.)
- Are they URL-encoded?

---

### 3. Launch Token Validation

**Question**: If a launch token is provided, how do we validate it?

**What we need to know**:
- Is there a token validation endpoint?
- What is the token format? (JWT, opaque token, UUID)
- What is the token lifetime? (seconds, minutes)
- Can the token be used multiple times or is it single-use?
- What endpoint do we call to exchange token for session?

---

### 4. ALEX Apps Registration

**Question**: How do we register our app to appear in the ALEX Apps menu?

**What we need to know**:
- Is there a registration form or API?
- What information do we need to provide?
  - App name and description
  - Launch URL
  - Logo/icon (size and format requirements)
  - OAuth client credentials
- How long does registration approval take?
- Can we test in UAT environment first?

---

### 5. Embedding Method

**Question**: How is our app displayed when launched?

**Options we're aware of**:
- A) New browser window
- B) New browser tab
- C) iFrame embedded in Medtech Evolution
- D) In-app browser panel

**What we need to know**:
- Which method does ALEX Apps use?
- Can we configure this, or is it fixed?
- If iFrame, what are the dimensions?
- Are there any cross-origin restrictions we should know about?

---

### 6. Lifecycle Events (Unsaved Changes)

**Question**: Is there any mechanism for our app to be notified when the GP is about to switch patients or close Medtech Evolution?

**What we've observed**:
- Medtech Evolution's built-in referral forms show warnings when switching patients with unsaved data
- We want to provide similar UX for uncommitted images

**What we need to know**:
- Is there a PostMessage API or JavaScript event we can listen to?
- Is there a callback URL we can register for lifecycle events?
- Or should we rely only on standard browser `beforeunload` event?
- How do the built-in forms (referrals, MMH) implement this behavior?

---

### 7. Example Integration Documentation

**Question**: Do you have example integration documentation or reference implementations we can review?

**What would help**:
- Code examples for ALEX Apps launch flow
- Sample launch URLs with parameters
- Example of token validation
- Documentation of any partner apps we can reference (DermEngine, Hauora Plan, etc.)
- Integration guide PDF or wiki

---

## Non-Blocking Questions

These are nice-to-have but not blocking implementation:

### 8. Session Persistence

**Question**: If the GP refreshes the browser or accidentally closes our app, can they re-open it for the same patient/encounter without losing context?

**What we need to know**:
- Can we request the same launch with same token?
- Or will a new launch generate a new token?
- Should we maintain session state in our backend?

---

### 9. Widget Placement Options

**Question**: Can we configure where our app appears in the Evolution UI?

**Options we're interested in**:
- ALEX Apps toolbar (current assumption)
- Context menu (right-click on patient)
- Left pane widget
- Dashboard tile
- Ribbon button

**What we need to know**:
- Are multiple placements possible?
- Is this configured during registration?

---

### 10. Testing Environment

**Question**: How can we test the ALEX Apps launch integration in UAT?

**What we need**:
- Access to UAT Medtech Evolution instance
- Test patient data
- Ability to configure our app in UAT ALEX Apps menu
- Documentation for UAT testing workflow

---

## Additional Context

### Our Current Architecture

- **Frontend**: React/Next.js hosted on Vercel
- **Backend**: Node.js BFF hosted on AWS Lightsail (static IP: 13.236.58.12)
- **FHIR Integration**: Already tested POST Media to ALEX API (working)
- **OAuth**: Already configured with Azure AD (working)
- **Session Storage**: Redis + S3 for temporary images (1-hour TTL)

### What We've Already Tested

✅ OAuth token acquisition from Azure AD  
✅ POST Media to ALEX API (201 Created)  
✅ GET Patient, Practitioner, Location (all working)  
✅ IP allow-listing (already approved by Medtech)

### What We're Building

**Desktop**: 
- Image capture from webcam/files
- QR code for mobile handoff
- Metadata entry (body site, laterality, view, type)
- Commit to Medtech via ALEX FHIR

**Mobile**:
- Image capture from phone camera
- Basic metadata entry
- Upload to session (desktop review)
- Optional direct commit to Medtech

---

## Expected Timeline

**When we need answers**:
- Questions 1-5: Before production deployment (can proceed with implementation using assumptions)
- Question 6: Nice to have, not blocking
- Questions 7-10: Helpful for smoother integration

**Our implementation timeline**:
- Phase 1: Mobile + Desktop UI (1-2 weeks)
- Phase 2: Backend integration with ALEX API (1 week)
- Phase 3: ALEX Apps launch integration (1 week) ← These questions most relevant here
- Phase 4: Testing + deployment (1 week)

---

## How to Send

**Option A - Email**:
```
To: support@medtechglobal.com
Subject: Clinical Images Widget Integration - ALEX Apps Launch Configuration

[Paste "Context to Provide" section]

[Paste all 10 questions]

[Paste "Additional Context" section]

Thank you for your help!
```

**Option B - Partner Portal**:
- Create new support ticket
- Category: "ALEX API Integration"
- Attach this document

---

## Follow-Up Plan

1. **Send questions** to Medtech support
2. **Continue implementation** using assumptions:
   - Assume launch URL format: `?token=xxx&patient=xxx&facility=xxx`
   - Assume token validation needed
   - Assume new browser window/tab (not iFrame)
   - Implement session-per-patient approach
   - Use standard `beforeunload` for unsaved changes
3. **Adjust implementation** when answers received
4. **Schedule call** with Medtech if needed for clarification

---

**Last Updated**: 2025-12-09  
**Status**: Ready to send  
**Next Action**: Send to support@medtechglobal.com when ready to engage with Medtech
