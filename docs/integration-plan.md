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

## Risks, Mitigations, and Contingencies

- Auth/headers ambiguity
  - Mitigation: BFF-only OAuth; sample `curl` in docs; strict header schema (`mt-facilityid`, `mt-correlationid`).
  - Control: Contract tests against UAT; alerts on 401/403 spikes; header presence SLO.
  - Contingency: Per-tenant kill switch; secret rotation; fallback to UAT sandbox.

- Upload reliability (images → DocumentReference + Binary)
  - Mitigation: Client compress; resumable to BFF; server streams to ALEX; `Idempotency-Key` and SHA-256 checksum.
  - Control: SLOs for success rate and p95; dead-letter queue; checksum alerts.
  - Contingency: Retry queue; operator re-submit; surface `mt-correlationid` to clinicians.

- QR/session security (mobile capture)
  - Mitigation: Short-TTL signed token scoped to patient/facility; single-use; rate-limited.
  - Control: Audit create/use/revoke; anomaly detection on reuse.
  - Contingency: Immediate revoke endpoint; regenerate flow.

- Live updates channel
  - Mitigation: SSE with heartbeat and auto-reconnect.
  - Control: Monitor disconnect rate; reconnection backoff metrics.
  - Contingency: ETag-based polling fallback.

- Capability differences (Evolution vs 32)
  - Mitigation: Gate features via `CapabilityStatement` checks; cache per facility.
  - Control: Healthcheck validates required resources/interactions.
  - Contingency: Disable affected feature; read-only UX.

- Error taxonomy and retries
  - Mitigation: Map ALEX errors to typed BFF errors; bounded retries for 429/5xx; propagate `mt-correlationid`.
  - Control: Error budget dashboard; top-N error monitoring.
  - Contingency: Circuit breaker; "save later" queue.

- Privacy and audit
  - Mitigation: Ephemeral storage TTL ≤ 24h; end-to-end TLS; encryption at rest; structured immutable audit; PII redaction.
  - Control: Purge job metrics; audit coverage.
  - Contingency: Manual purge tool; incident runbook.

- Rate limits and timeouts
  - Mitigation: Client token bucket; request timeouts; jittered retries.
  - Control: Track 429 rate; saturation alerts.
  - Contingency: Queue uploads; user-friendly backoff messages.

## Sessions & QR (Image Capture)

- Session token: signed, short-TTL (e.g., 5–10 min), scoped to patient, facility, and minimal permissions; no PHI in token.
- One-time use: invalidate on first successful mobile upload or expiry; allow desktop to regenerate.
- Anti-replay: bind to IP/device fingerprint where feasible; strict rate limiting.
- Revocation: explicit revoke endpoint; admin purge.
- Payload example (server-generated, not exposed to client verbatim):
```json
{
  "sessionId": "c6c4e2d4-1c6b-4d0a-bba8-1b2c0a7e3a20",
  "patientId": "<FHIR Patient.id>",
  "facilityId": "<facility-id>",
  "exp": 1734567890
}
```

## Live Updates (Desktop Thumbnails)

- Transport: Server-Sent Events (SSE).
- Events: `thumbnail.added`, `upload.progress`, `upload.completed`, `session.expired`.
- Reconnect: exponential backoff (max 30s), heartbeat every 15s.
- Fallback: polling with ETag/If-None-Match.

## SLOs (initial)

- Image upload success rate: ≥ 99.5% over 7 days.
- p95 time to first thumbnail on desktop: ≤ 3s.
- p95 end-to-end save-to-ALEX (single image): ≤ 8s UAT, ≤ 5s Prod.
- Auth error rate (401/403) per tenant: ≤ 0.5% of requests.
- Purge compliance for ephemeral images: 100% within 24h.

## Acceptance Checkpoints

- Before UAT: Auth/header contract tests pass; e2e patient read + image save ≥ 99%.
- Before pilot: Session security pen test; purge job verified; rollback tested.
- Before GA: Error budgets set; dashboards/alerts live; kill switch verified.
