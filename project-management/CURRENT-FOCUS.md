---
week: "Week 2, 2026"
dates: "Jan 6-12, 2026"
last_updated: "2026-01-08"
---

# Current Focus - Week 2, 2026

## This Week's ONE Big Win

**Validate the new Medtech read permissions in local facility `F99669-C` and complete Phase 1D Medtech Evolution UI validation (Inbox + Daily Record).**

---

## Quarter Goal (Q1 2026)

Launch Image feature by Jan 31 + Get grant decision + Get 5-10 paying clinics by end March

---

## Blocker (Current)

- `F99669-C` is offline if the Windows desktop sleeps (Azure Hybrid Connection Manager tunnel drops).
- Plan: configure the desktop to stay awake (always on) before resuming tests.
- Note: while away from home desktop, shift to customer-side launch prep (below).
- Additional blocker (confirmed via hosted facility `F2N060-E`): ALEX UAT returns `403` for FHIR search on non-Patient resources (Task, Communication, Media, DocumentReference, DiagnosticReport, MedicationRequest) even though the OAuth token contains the expected app roles; emailed Medtech support for clarification on search permissions/policy.

---

## Active Projects This Week (Max 2)

### 1. Medtech Integration (PRIMARY)
**This week's goal**: Phase 1D validation and hardening.

**Next testing session (when home; `F99669-C` online)**:
- Connectivity: `GET https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016&facilityId=F99669-C`
- Read tests:
  - Tasks: `GET https://api.clinicpro.co.nz/api/medtech/tasks?nhi=ZZZ0016&count=5&facilityId=F99669-C`
  - Communications: `GET https://api.clinicpro.co.nz/api/medtech/communications?nhi=ZZZ0016&count=5&facilityId=F99669-C`
  - Media: `GET https://api.clinicpro.co.nz/api/medtech/media?nhi=ZZZ0016&count=5&_sort=-created&facilityId=F99669-C`
- UI validation: commit 1 image to `F99669-C`, then confirm it appears in Medtech Evolution (Inbox + Daily Record).
- Evidence to capture: `facilityId`, HTTP status, correlationId (if present), and first resourceType on success.

### 2. PM AI SaaS (SECONDARY)
**This week's goal**: Maintenance only.

---

## Today's Priority

**Updated daily**: The ONE thing to do today.

**Jan 8**: Customer-side launch prep for Medtech Images (while not home). Then when home: get `F99669-C` online (Windows desktop always-on), run local read tests, and capture Phase 1D evidence.

**Customer-side actions completed (Jan 8)**:
- Emailed Medtech requesting **commercial terms** (revenue share, fees, billing route, payment terms).
- Emailed Intellimed requesting **QuickShot pricing + inclusions**.
- Posted in NZ GP Facebook group asking how clinicians handle clinical photos (personal vs practice phone), QuickShot alternatives, workflow steps, cost, and file-size/resizing pain points; invited DMs.

**Waiting on**:
- Medtech commercial terms reply (expected within a few business days).
- Intellimed/QuickShot pricing reply (expected within a few business days).

---

## Customer Outreach This Week

**Target**: 5 contacts (30% of time = customer/business work)

**This week's focus**: Tester follow-up once Phase 1D UI validation is confirmed.

**This week's targets**:
- [x] Ask GP community how they currently handle clinical photos (FB post; request DMs for pricing/workflow)
- [ ] 1-2 messages to GP testers (post Phase 1D confirmation)
- [ ] 5 short outreach touches total this week (texts/calls count)
- [ ] Coordinate with Ting: one post when Phase 1D is confirmed

---

## Quick Metrics (Updated Every Friday)

- **Paying Clinics**: 0 | Target: 5 by end Q1, 20 by end 2026
- **MRR**: $0 | Target: $500 by end Q1, $8k by end 2026
- **Features Launched**: 0/5 | Target: 1 by Jan 31, 5 by end 2026
- **Customer Contacts This Week**: 1/5
