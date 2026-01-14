---
project_name: Medtech ALEX Integration
project_stage: Build
owner: Development Team
last_updated: "2026-01-14"
version: "2.0.0"
tags:
  - integration
  - medtech
  - healthcare
  - fhir
  - api
summary: "Clinical images widget integration with Medtech Evolution/Medtech32 via ALEX API. Enables GPs to capture/upload photos from within Medtech, saved back to patient encounters via FHIR API."
quick_reference:
  current_phase: "Phase 1D"
  status: "Phase 1C ✅ complete; Phase 1D ⚠️ in progress (launch handoff implemented; legacy-compatible image write-back implemented via DocumentReference); waiting on Medtech for exact Inbox Scan DocumentReference requirements"
  next_action: "Email Medtech for a known-good POST /FHIR/DocumentReference (Inbox Scan) payload and required fields; then validate end-to-end in F99669-C (Evolution UI + legacy DOM referral access) using the new DocumentReference verification endpoint."
  key_blockers:
    - "Medtech confirmed JPEGs posted as Media will always be a View link (external viewer) and images will not appear in Inbox Attachment tab; for legacy referral compatibility we must use Inbox Scan via POST DocumentReference (TIFF/PDF only)"
    - "Exact required DocumentReference fields and any Medtech-specific routing requirements for Inbox Scan are still unconfirmed; waiting on Medtech to provide a known-good example payload/response"
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
- **Commit to ALEX (via widget)**: widget calls Vercel route `POST /api/medtech/attachments/commit`, which proxies to BFF.
- **Commit to ALEX (direct BFF, for smoke tests)**: `POST https://api.clinicpro.co.nz/api/medtech/session/commit`
- **Media verification (via BFF)**: `GET https://api.clinicpro.co.nz/api/medtech/media?nhi=<NHI>&facilityId=<FACILITY>&count=<N>`
- **DocumentReference verification (via BFF)**: `GET https://api.clinicpro.co.nz/api/medtech/document-reference/<id>?facilityId=<FACILITY>`
- **DocumentReference verification (via Vercel proxy)**: `GET https://www.clinicpro.co.nz/api/medtech/document-reference/<id>?facilityId=<FACILITY>`

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
- **Phase 1C complete**: end-to-end commit pipeline works (widget → Vercel → BFF → ALEX) with facilityId propagation and correlation IDs.
- **Phase 1D in progress**: legacy-compatible clinical image write-back implemented:
  - Vercel converts images to **TIFF under 1 MB** (PDF pass-through) before sending to BFF
  - BFF writes **FHIR `DocumentReference`** (TIFF/PDF only) via `POST /FHIR/DocumentReference` so legacy DOM referrals can access Inbox Scan
  - Awaiting Medtech confirmation of required DocumentReference fields for Inbox Scan routing

## Next Session: Pick Up Here

### Launch setup (Medtech Evolution)
1. Create or choose a toolbar icon for ClinicPro Images; load it via MT Icon Loader.
2. Configure ALEX Apps Configuration launch URL:
   - `https://www.clinicpro.co.nz/medtech-images/launch?context={context}&signature={signature}`
3. Ensure Vercel has `MEDTECH_LAUNCH_COOKIE_SECRET` set (required for the encrypted launch cookie).
4. Test end-to-end launch from Medtech into `/medtech-images`:
   - Confirm no identifiers are present in the browser URL after redirect.
   - Confirm expected UX copy:
     - No launch: **"Launch from Medtech Evolution"**
     - No patient selected: **"No patient selected"**

### UI integration validation (blocked by Medtech support guidance)
5. Validate Inbox Scan behaviour (TIFF/PDF) in `F99669-C`:
  - Confirm it appears where expected in Evolution UI
  - Confirm legacy DOM referral forms can access the Scan folder artefact
6. Await Medtech support reply on the exact `POST /FHIR/DocumentReference` (Inbox Scan) required fields and a known-good sample payload/response.

Detailed implementation plan: `LAUNCH_MECHANISM_PLAN.md`

---

## For full project history

See `LOG.md` for chronological entries with evidence and decisions.
