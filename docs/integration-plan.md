# Modular Medtech Integration Plan (High-Level)

## Objectives
- Modular rollout per tenant/user; enable only needed features
- Security-first: zero secrets in browser; privacy by design
- Image feature first; Scribe after privacy controls are proven

## Information Architecture
- Hybrid: `/dashboard` for discovery/toggles; dedicated routes for depth
- Routes: `/dashboard`, `/image`, `/scribe`, `/acc-lookup`, plus patient-context (e.g., `/patients/:id/image`)

## System Architecture
- Frontend (SPA)
  - Feature flags (tenant/role), capability checks (ALEX version)
  - Background job UI for uploads
- Backend for Frontend (BFF)
  - OAuth2 (Azure AD) client_credentials; token cache/rotation
  - Inject required headers (`mt-facilityid`), retries, backoff, idempotency
  - Auditing, structured logs, PII redaction; upload streaming
- ALEX SDK (server-side)
  - Typed FHIR client (ALEX profiles), env routing (UAT/Prod)
  - Correlation propagation, error taxonomy
- Config/Tenancy
  - Per-tenant feature toggles, facility mapping, scopes, environment

## Project Structure (Monorepo)
```
/apps/web                # SPA (dashboard + routes)
/apps/bff                # BFF (auth, headers, audit, proxy)
/packages/alex-sdk       # Typed ALEX/FHIR client, env routing, errors
/packages/feature-image  # Image UI + BFF handlers (DocumentReference/Binary/Media)
/packages/feature-scribe # Scribe UI + BFF (consent, privacy guard, commit)
/packages/feature-acc    # ACC employer lookup UI + BFF
/packages/shared         # UI kit, telemetry, feature flags
/infrastructure          # IaC, CI/CD, secrets, envs
```

## Phase I UI/UX — Image Module (Wireframe Notes)

### Overview
- Goal: ultra‑simple mobile capture → desktop review/annotate/classify → save to Medtech (ALEX).
- Patient is always preselected; no unassigned uploads; no mobile annotation.

### Flow summary
1) Desktop (patient page): GP clicks “Mobile capture” icon → QR modal opens.
2) Mobile (capture): GP scans QR → capture page → take photos → quick keep/retake → upload to session (auto‑compressed).
3) Desktop (confirm): Thumbnails arrive live → review, optional desktop annotations → auto doc type (small LLM) → save to Medtech.

### Wireframe notes by screen
- Desktop — Patient page (QR modal)
  - Left: large one‑time QR code.
  - Right: patient card (name, DOB, NHI), facility badge, short instructions, “Copy link”.
  - Footer: live status “Waiting for photos…”; incoming thumbnails appear as chips.
- Mobile — Capture (no annotation)
  - Full‑screen camera; back camera default; large shutter; flash toggle; gallery import.
  - After each shot: small preview with Retake/Keep; multi‑photo queue allowed.
  - Banner: “Images are not stored on device and will be sent securely.”
  - Primary CTA: “Upload to desktop”; per‑photo progress; success message: “Sent to desktop for confirmation.”
- Desktop — Review & annotate & classify
  - Layout: two columns.
    - Left: large viewer with thumbnail rail; zoom; rotate.
    - Top toolbar (desktop annotation): Pen, Arrow, Text, Redact box, Crop, Rotate, Undo/Reset.
  - Right panel (details):
    - Patient: preselected (read‑only).
    - Document type: auto‑suggest via small LLM (confidence chip); dropdown override.
    - Title (optional), Encounter date/time (default now), Confidentiality (Normal/Restricted), Notes.
  - Primary action: “Save to Medtech”.
- Desktop — Save to Medtech
  - Progress modal: per‑image bars + overall %, correlation ID shown on success.
  - Success: DocumentReference ID surfaced; buttons: “Copy correlation ID”, “Upload another set”.

### Annotation (desktop)
- Tools: Pen, Arrow, Text, Redact box, Crop, Rotate; Undo/Reset until save.
- Redaction is destructive to pixels; applied before upload.

### Compression & file handling
- Mobile pre‑upload: downscale to ~1024 px long‑edge, JPEG/WebP quality ~0.8, strip EXIF, HEIC→JPEG; skip if already small.
- Desktop pre‑save (if needed): apply same pipeline for consistency.
- Safeguards: text‑heavy images use slightly higher quality; hard cap (e.g., ≤2 MB/image) with smart quality ramp.

### Behaviour & rules
- Patient context always enforced via QR session; no “Unassigned”.
- LLM document type suggestion (server micro‑model + OCR); clinician can override.
- Images handled in memory/ephemeral storage; purged after save/cancel.
- Reliability: resumable uploads; idempotency per image; surface correlation ID post‑save.

### Edge cases
- QR expired: show “Expired” and a “Generate new QR” button.
- Offline mobile: allow capture; queue upload when online if session valid.
- Large batches: show per‑image progress; configurable session image cap; chunked upload.

## Security & Privacy
- Secrets/tokens server-side only; browser never calls ALEX
- Ephemeral storage with strict retention for images
- RBAC (e.g., `image.upload`, `scribe.publish`); consent logging for Scribe
- Observability: expose `mt-correlationid`, structured logs, immutable audit

## Rollout
- Phase 1: Image enabled; others "Coming soon"
- Phase 2: ACC employer lookup standalone
- Phase 3: AI Scribe behind explicit consent + privacy controls
