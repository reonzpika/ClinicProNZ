# Task Completion Checker Feature

**Last Updated**: 2026-01-06  
**Status**: Concept Validated, API Testing Pending  
**Phase**: Discovery / Validation

---

## Quick Reference for Next AI Session

### What We Decided
- **Feature**: AI-powered tool to extract tasks from consultation notes and flag incomplete ones
- **Approach**: Option D (Hybrid) - AI extracts tasks, GP confirms, tool cross-references with ALEX data
- **Scope**: Focus on 3 task types: Labs, Prescriptions, Referrals
- **Note Format**: SOAP structure, Plan section contains tasks, free text

### Current Blocker
- **BFF needs deployment** with new test endpoints before API validation can run
- New endpoints added to `/workspace/lightsail-bff/index.js` (not yet deployed)

### Immediate Next Steps
1. ✅ Merge BFF changes to main (triggers auto-deploy)
2. Run validation script: `npx tsx scripts/validate-task-checker-via-bff.ts`
3. Confirm DocumentReference returns note TEXT content
4. If feasible, proceed to AI prompt design

### Key Files Created
- `/workspace/scripts/validate-task-checker-via-bff.ts` - API validation script
- `/workspace/scripts/validate-task-checker-api.ts` - Alternative local validation (needs credentials)
- `/workspace/lightsail-bff/index.js` - Added new test endpoints

---

## Feature Purpose

**Problem**: GPs plan to do tasks after consultations (order bloods, write referrals, prescribe medications) but sometimes forget to complete them during breaks or at end of day.

**Solution**: AI tool that:
1. Reviews today's consultation notes (SOAP format)
2. Extracts tasks from the Plan section using AI
3. GP quickly confirms extracted tasks (30 seconds)
4. Cross-references with ALEX data to check completion
5. Flags incomplete tasks at end of day

**Key Value**: Prevents forgotten clinical tasks, improves patient safety, reduces GP cognitive load.

---

## Workflow Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    END OF DAY WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. GP clicks "Check Today's Tasks"                             │
│     └── Fetch today's consultation notes (DocumentReference)   │
│     └── Filter by: provider=GP, date=today                      │
│                                                                 │
│  2. AI extracts tasks from each note's Plan section             │
│     └── "Order FBC and HbA1c"                                   │
│     └── "Write referral to dermatologist"                       │
│     └── "Start on metformin 500mg BD"                           │
│                                                                 │
│  3. GP reviews and confirms extracted tasks (quick scan)        │
│     └── Remove false positives                                  │
│     └── Add missed tasks if needed                              │
│                                                                 │
│  4. Tool cross-references with ALEX data                        │
│     └── Lab: GET DiagnosticReport (was FBC ordered?)            │
│     └── Rx: GET MedicationRequest (was metformin prescribed?)   │
│     └── Referral: Check Outbox/Communication (was it sent?)     │
│                                                                 │
│  5. Show results                                                │
│     └── ❌ Dermatology referral not sent                        │
│     └── ❌ Follow-up not booked                                 │
│     └── ✅ Metformin prescribed                                 │
│     └── ✅ FBC ordered                                          │
│                                                                 │
│  6. GP completes outstanding tasks (in Medtech)                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Feasibility

### ALEX API Endpoints Needed

| Data | ALEX Endpoint | Purpose | Status |
|------|---------------|---------|--------|
| Consultation Notes | `GET /DocumentReference` | Get note text for AI extraction | ⏳ Testing |
| Lab Orders | `GET /DiagnosticReport` | Verify labs were ordered | ⏳ Testing |
| Prescriptions | `GET /MedicationRequest` | Verify scripts were written | ⏳ Testing |
| Referrals | `GET /Communication` or Outbox | Verify referrals were sent | ⏳ Testing |
| Tasks (optional) | `GET/POST /Task` | Read/create follow-up tasks | ⏳ Testing |

### Critical Question: Can We Access Note TEXT?

**This is the blocker.** DocumentReference in FHIR may contain:
- Inline base64 content (`content.attachment.data`) ✅ Best case
- URL reference to Binary resource (`content.attachment.url`) - Need extra fetch
- Just metadata with no content ❌ Blocker

**Validation script will confirm this.**

### BFF Test Endpoints Added

New endpoints in `/workspace/lightsail-bff/index.js`:

| Endpoint | Purpose |
|----------|---------|
| `GET /api/medtech/documents?nhi=XXX` | Fetch DocumentReference (notes) |
| `GET /api/medtech/labs?nhi=XXX` | Fetch DiagnosticReport |
| `GET /api/medtech/prescriptions?nhi=XXX` | Fetch MedicationRequest |
| `GET /api/medtech/communications?nhi=XXX` | Fetch Communication/referrals |
| `GET /api/medtech/tasks?nhi=XXX` | Fetch Task resources |

---

## Key Decisions

### Approach: Hybrid (Option D)
- **Decision**: AI extracts tasks, GP confirms, tool tracks
- **Rationale**: Balances automation with reliability; GP catches AI errors in quick review
- **Alternative rejected**: Pure AI extraction (too error-prone), structured markers (unnatural)

### Task Types for MVP
- **Decision**: Focus on Labs, Prescriptions, Referrals only
- **Rationale**: These are verifiable via ALEX API and most commonly forgotten
- **Deferred**: Appointments (booking might be done by reception), follow-up reminders (not checkable)

### Note Format
- **Confirmed**: SOAP structure, Plan section at end
- **Confirmed**: Free text (not structured)
- **Implication**: AI prompt needs to parse natural language in Plan section

### Timing Window
- **Decision**: End-of-day review (default)
- **Optional**: After each session, on-demand
- **Rationale**: End-of-day catches everything without interrupting workflow

---

## Task Extraction Complexity

| Task Type | Easy to Extract? | Easy to Verify? |
|-----------|-----------------|-----------------|
| Order bloods | ✅ Clear language | ✅ Check DiagnosticReport |
| Prescribe medication | ✅ Clear language | ✅ Check MedicationRequest |
| Write referral | ✅ Clear language | ⚠️ Check Outbox (structure TBD) |
| Book follow-up | ⚠️ Various phrasing | ⚠️ Check Appointment |
| "Review next visit" | ❌ Ambiguous | ❌ Not checkable until next visit |
| "Discuss with patient" | ❌ Not a task | ❌ N/A |

---

## AI Prompt Design (Draft)

```
Extract actionable clinical tasks from this consultation note's Plan section.

Focus on tasks the GP needs to complete AFTER the consultation:
- Lab orders (blood tests, pathology)
- Prescriptions (new medications)
- Referrals (specialist letters)
- Follow-up appointments

Return JSON format:
{
  "tasks": [
    {
      "type": "lab" | "prescription" | "referral" | "appointment" | "other",
      "description": "what needs to be done",
      "details": "specific items mentioned (e.g., FBC, HbA1c)"
    }
  ]
}

Ignore:
- Patient education/advice given during consultation
- Things already done during the consultation
- General observations or assessments

Example Input:
"Plan: Order FBC and HbA1c. Start metformin 500mg BD. Refer to dermatologist for mole check. Review in 2 weeks."

Example Output:
{
  "tasks": [
    {"type": "lab", "description": "Order blood tests", "details": "FBC, HbA1c"},
    {"type": "prescription", "description": "Start new medication", "details": "metformin 500mg BD"},
    {"type": "referral", "description": "Refer to specialist", "details": "dermatologist for mole check"},
    {"type": "appointment", "description": "Book follow-up", "details": "2 weeks"}
  ]
}
```

---

## Verification Logic (Draft)

### Lab Orders
```typescript
// After extracting: "Order FBC and HbA1c"
const labReports = await alexApi.getDiagnosticReports(patientId, { date: today });

// Check if FBC and HbA1c appear in today's lab orders
const fbcOrdered = labReports.some(r => 
  r.code?.coding?.some(c => c.display?.toLowerCase().includes('fbc') || 
                            c.display?.toLowerCase().includes('full blood count'))
);
```

### Prescriptions
```typescript
// After extracting: "Start metformin 500mg BD"
const prescriptions = await alexApi.getMedicationRequests(patientId, { date: today });

// Check if metformin was prescribed today
const metforminPrescribed = prescriptions.some(rx =>
  rx.medicationCodeableConcept?.coding?.some(c => 
    c.display?.toLowerCase().includes('metformin')
  )
);
```

### Referrals
```typescript
// After extracting: "Refer to dermatologist"
const communications = await alexApi.getCommunications(patientId, { date: today });

// Check Outbox for referral letter
// (Need to confirm structure from API test)
const dermatologyReferralSent = communications.some(c =>
  c.category?.some(cat => cat.coding?.some(cod => cod.code === 'referral')) &&
  c.payload?.some(p => p.contentString?.toLowerCase().includes('dermatolog'))
);
```

---

## Open Questions

### For API Validation
1. **Note content format**: Plain text, HTML, RTF, or PDF?
2. **DocumentReference date filtering**: Can we filter by `date` and `author` (provider)?
3. **DiagnosticReport structure**: Does it show ORDERS or just completed RESULTS?
4. **Communication/Outbox**: How are referrals structured? What fields identify a referral?

### For UX Design
1. **When to run**: End of day only, or also after each session?
2. **False positive handling**: How easy to dismiss incorrect task extractions?
3. **Action on incomplete**: Just show list, or provide quick links to complete in Medtech?

### For Future Scope
1. **Auto-create reminders**: If task incomplete, auto-create Task in Medtech?
2. **Historical tracking**: Show tasks from previous days still incomplete?
3. **Team features**: See incomplete tasks for other GPs (clinic-wide view)?

---

## Development Phases (Proposed)

### Phase 0: API Validation (Current)
**Time**: 1-2 hours  
**Status**: In Progress

- [x] Create BFF test endpoints for FHIR resources
- [x] Create validation script
- [ ] Deploy BFF with new endpoints
- [ ] Run validation script
- [ ] Confirm DocumentReference returns note text
- [ ] Document API response structures

### Phase 1: MVP Prototype
**Time**: 4-6 hours  
**Status**: Not Started

- [ ] Build simple UI: "Check Today's Tasks" button
- [ ] Implement DocumentReference fetch (today's notes for GP)
- [ ] Implement AI task extraction (GPT-4)
- [ ] Build task confirmation UI
- [ ] Implement verification for Labs and Prescriptions
- [ ] Display results (complete/incomplete list)

### Phase 2: Referral Verification
**Time**: 2-3 hours  
**Status**: Not Started

- [ ] Understand Outbox/Communication structure
- [ ] Implement referral verification logic
- [ ] Add referral to results display

### Phase 3: Polish & Testing
**Time**: 2-3 hours  
**Status**: Not Started

- [ ] Error handling and edge cases
- [ ] Test with real consultation notes (your own)
- [ ] Refine AI prompt based on real data
- [ ] UX improvements based on usage

**Total Estimated Time**: 10-15 hours

---

## Files & Locations

### Validation Scripts (Created)
- `/workspace/scripts/validate-task-checker-via-bff.ts` - Uses BFF endpoints
- `/workspace/scripts/validate-task-checker-api.ts` - Direct ALEX API (needs local creds)

### BFF Changes (Created)
- `/workspace/lightsail-bff/index.js` - Added 5 new endpoints

### Future Feature Code (To Be Created)
- `/app/(medtech)/task-checker/page.tsx` - Main UI
- `/src/medtech/task-checker/` - Components and hooks
- `/app/api/(integration)/medtech/task-checker/` - API routes

---

## Related Documentation

- **ALEX API Reference**: `/project-management/medtech-integration/reference/alex-api.md`
- **BFF Setup**: `/project-management/medtech-integration/infrastructure/bff-setup.md`
- **OAuth Config**: `/project-management/medtech-integration/infrastructure/oauth-and-config.md`

---

## Validation Checklist

After deploying BFF, run this checklist:

```bash
# Run validation script
npx tsx scripts/validate-task-checker-via-bff.ts
```

**Check these results:**

| Test | Expected | If Fails |
|------|----------|----------|
| DocumentReference returns data | ✅ Documents found | Check patient has notes in UAT |
| Note content is accessible | ✅ Inline base64 data | May need Binary fetch |
| Content is readable text | ✅ Plain text or HTML | May need parsing |
| DiagnosticReport works | ✅ Lab data found | Check UAT test data |
| MedicationRequest works | ✅ Prescription data found | Check UAT test data |
| Communication works | ✅ Data found (or empty) | May need different endpoint |

**If TEST 1 (DocumentReference) shows readable note text → Feature is FEASIBLE 🎉**

---

*This is a living document. Update after API validation is complete.*
