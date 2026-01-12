---
project_name: Medtech ALEX Integration
project_stage: Build
owner: Development Team
last_updated: "2026-01-12"
version: "2.0.0"
tags:
  - integration
  - medtech
  - healthcare
  - fhir
  - api
summary: "Clinical images widget integration with Medtech Evolution/Medtech32 via ALEX API. Enables GPs to capture/upload photos from within Medtech, saved back to patient encounters via FHIR API."
quick_reference:
  current_phase: "Phase 1D (DEVELOPMENT_ROADMAP.md) + Launch Mechanism Phase 4 (LAUNCH_MECHANISM_PLAN.md)"
  status: "DEVELOPMENT_ROADMAP Phase 1C ✅ complete; Phase 1D ⚠️ tested (images reach Medtech but UI integration incomplete); LAUNCH_MECHANISM_PLAN Phase 1 ✅ complete (icon setup); Phase 2 ✅ complete (BFF launch decode endpoint); Phase 3 ✅ complete (frontend launch support + Vercel proxy)"
  next_action: "LAUNCH_MECHANISM_PLAN Phase 4: Load icon into F99669-C via MT Icon Loader, configure ALEX Apps Configuration, test end-to-end launch mechanism, and re-test UI integration to see if proper launch fixes Inbox/Daily Record display issues."
  key_blockers:
    - "Images appear in Inbox as broken links (not inline preview); do not appear in Daily Record at all; may be resolved by implementing proper launch mechanism"
    - "ALEX UAT reads/search are sensitive to URL/query shape; Media verify should use `patient.identifier`; other resources may still return 403 depending on query parameters; keep validating with ALEX support examples"
    - "Waiting on Medtech commercial terms (revenue share/fees/billing route/payment terms) and competitor QuickShot pricing (Intellimed) to finalise pricing strategy"
  facility_id: "F2N060-E (hosted UAT API testing) + F99669-C (local Medtech Evolution UI validation)"
key_docs:
  project_rules: ".cursor/rules/project-medtech-integration.mdc"
  roadmap: "DEVELOPMENT_ROADMAP.md"
  changelog: "LOG.md"
  alex_api: "alex-api.md"
---

## Read order (for humans and AI)
- `.cursor/rules/project-medtech-integration.mdc` (hard constraints, ALEX/FHIR rules, debugging)
- `PROJECT_SUMMARY.md` (this file; operational runbook)
- `DEVELOPMENT_ROADMAP.md` (Phase plans; Phase 1D testing details live here)
- `LOG.md` (project history and log)

---

## Operational runbook (single source of truth)

### Architecture (why there is a BFF)
- **Vercel (Next.js)**: hosts the widget UI and non-ALEX endpoints (dynamic IP).
- **Lightsail BFF** `api.clinicpro.co.nz`: the only component that calls **ALEX** (static IP allow-listed by Medtech).

### Environments and facility IDs (critical)
- **`F2N060-E`**: Medtech hosted UAT facility. Use for API-only checks. This will not appear inside your local Medtech Evolution UI.
- **`F99669-C`**: your local Medtech Evolution facility. Use for UI validation (Inbox and Daily Record).
  - **Login**: Staff code `ADM`, blank password
  - **Important**: `F99669-C` relies on **Azure Hybrid Connection Manager** running on your Windows machine (Hybrid Connection tunnel). If that PC is asleep/standby/off, local facility connectivity can appear "offline".

### OAuth permissions (Medtech-managed)
Medtech grants permissions at app registration/user profile level. Current known required permissions:
- **Confirmed by ALEX Support (2026-01-08)**: permissions are assigned at a **profile level**; permissions stay the same no matter the **location/facility** (for example `F2N060-E` and `F99669-C` should have the same permissions if they are using the same profile).
- `patient.media.write` (required for commit; already verified working)
- `patient.media.read` (added by Medtech; helps with retrieval/verification flows if enabled)
- `patient.task.read` (added by Medtech; supports task-related workflows)
- `patient.communication.generalcommunication.read` (added by Medtech; supports inbox/outbox retrieval where applicable)
- `patient.communication.outboxwebform.read` (added by Medtech; supports outbox web form retrieval)

### Hybrid Connection Manager (local facility `F99669-C`)
**Context**: Medtech support asked whether "Azure Hybrid Connection Manager" was stopped. In our setup, it is installed on the founder's **personal desktop** for testing only.

**Implications**:
- If the desktop goes to **sleep/standby** or is **powered off**, the hybrid connection tunnel drops and `F99669-C` can stop working until the desktop is awake again.
- This is expected for a test-only setup; plan test windows accordingly.

**Quick checks on Windows**:
- Ensure the PC is **awake**.
- Open **Services** (`services.msc`) and confirm **Microsoft Azure Hybrid Connection Manager** is **Running**; restart if needed.
- If it keeps dropping; disable sleep/standby (at least while plugged in) during test windows.

### Canonical endpoints
- **BFF health**: `GET https://api.clinicpro.co.nz/health`
- **ALEX connectivity test (via BFF)**: `GET https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016&facilityId=<FACILITY>`
- **Launch decode (via BFF)**: `GET https://api.clinicpro.co.nz/api/medtech/launch/decode?context=<base64>&signature=<hmac>`
- **Commit to ALEX (via widget)**: widget calls Vercel route `POST /api/medtech/attachments/commit`, which proxies to BFF.
- **Commit to ALEX (direct BFF, for smoke tests)**: `POST https://api.clinicpro.co.nz/api/medtech/session/commit`
- **Media verification (via BFF)**: `GET https://api.clinicpro.co.nz/api/medtech/media?nhi=<NHI>&facilityId=<FACILITY>&count=<N>`

### Logs and tracing
- **Vercel logs**: commit route logs correlationId and returned mediaIds.
- **Lightsail logs**: `sudo journalctl -u clinicpro-bff -f`
- **Correlation IDs**:
  - Commit generates a `correlationId`.
  - BFF forwards it to ALEX as `mt-correlationid`.

### Phase 1D UI validation (where to look)
- **The detailed test steps live in** `DEVELOPMENT_ROADMAP.md` under Phase 1D.
- **Key point**: for UI validation you must commit into `F99669-C`.

### How to resolve the local patientId for `ZZZ0016` in `F99669-C`
- Call:
  - `GET https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016&facilityId=F99669-C`
- If the response does not include a patientId, update the BFF test endpoint to include it (Lightsail BFF `index.js` can return `patientBundle.entry[0].resource.id`) and redeploy, then re-run the call above.

### Known ALEX limitations that affect debugging
- **`Media.identifier` is mandatory** on POST Media.
- **Images must be < 1MB**.
- **ALEX UAT reads/search are sensitive to the exact URL and query shape**:
  - Patient search by identifier is known-working: `GET /FHIR/Patient?identifier=<system>|<value>`
  - ALEX support (Defne) demonstrated Media search by patient.identifier works:
    - `GET /FHIR/Media?patient.identifier=<system>|<value>`
  - Our earlier Media reads using `patient=<patientId>` and `subject=Patient/<patientId>` returned `403 Authorization failed` in UAT even when token roles looked correct.
  - Takeaway: if you see 403s on "reads", first verify the **base URL** and **search parameter format** matches the ALEX docs and ALEX support examples.

---

## Current status (kept short)
- **DEVELOPMENT_ROADMAP Phase 1C complete**: commit creates FHIR `Media` in ALEX via Lightsail BFF (static IP).
- **DEVELOPMENT_ROADMAP Phase 1D tested**: commit into local facility `F99669-C` works, but UI integration incomplete (broken links in Inbox, missing from Daily Record).
- **LAUNCH_MECHANISM_PLAN Phase 1 complete**: Icon created and ready for Medtech Evolution setup.
- **LAUNCH_MECHANISM_PLAN Phase 2 complete**: BFF launch decode endpoint implemented (`GET /api/medtech/launch/decode`).
- **LAUNCH_MECHANISM_PLAN Phase 3 complete**: Frontend launch support implemented (page updated + Vercel proxy endpoint created).

## Next Session: Pick Up Here

Continue ALEX Vendor Forms launch mechanism implementation (from `LAUNCH_MECHANISM_PLAN.md`):
1. ✅ Create icon for ClinicPro Images widget (LAUNCH_MECHANISM_PLAN Phase 1 complete)
2. ✅ Implement BFF launch decode endpoint (`/api/medtech/launch/decode`) (LAUNCH_MECHANISM_PLAN Phase 2 complete)
3. ✅ Implement frontend launch support and Vercel proxy endpoint (LAUNCH_MECHANISM_PLAN Phase 3 complete)
4. **LAUNCH_MECHANISM_PLAN Phase 4**: Load icon into F99669-C via MT Icon Loader and configure ALEX Apps Configuration
5. **LAUNCH_MECHANISM_PLAN Phase 4**: Test launch mechanism with F99669-C
6. **LAUNCH_MECHANISM_PLAN Phase 4**: Re-test UI integration to see if proper launch fixes Inbox/Daily Record display issues

Note: `DEVELOPMENT_ROADMAP.md` Phase 1D includes "launch mechanism" as a task, but detailed implementation is tracked in separate `LAUNCH_MECHANISM_PLAN.md` with its own phase numbering.

---

## For full project history

See `LOG.md` for chronological entries with evidence and decisions.
