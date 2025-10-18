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

## Image Feature (Phase 1)
- Acquire: Scan/Camera/Upload; multi‑page
- Review: reorder, rotate/crop; basic redact
- Classify: patient/encounter, practitioner, category/type, confidentiality, notes
- Save: server streams to ALEX (DocumentReference + Binary; Media where apt), progress, retry, link; audit trail

## Security & Privacy
- Secrets/tokens server-side only; browser never calls ALEX
- Ephemeral storage with strict retention for images
- RBAC (e.g., `image.upload`, `scribe.publish`); consent logging for Scribe
- Observability: expose `mt-correlationid`, structured logs, immutable audit

## Rollout
- Phase 1: Image enabled; others "Coming soon"
- Phase 2: ACC employer lookup standalone
- Phase 3: AI Scribe behind explicit consent + privacy controls
