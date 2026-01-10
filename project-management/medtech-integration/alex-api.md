# ALEX API (canonical docs + local gotchas)

## Canonical docs (source of truth)
- `https://alexapidoc.medtechglobal.com/#high-level-design-for-medtech-fhir-api-alex`

This file is intentionally short. If you need endpoint lists, schemas, or examples; use the canonical docs above.

## Local runbook
- Operational “how we run tests” lives in `PROJECT_SUMMARY.md`.

## Base URLs
- **UAT**: `https://alexapiuat.medtechglobal.com/FHIR`
- **Production**: `https://alexapi.medtechglobal.com/FHIR`

## Required headers (ALEX)
- `Authorization: Bearer <token>`
- `mt-facilityid: <FACILITY>`
- `Content-Type: application/fhir+json` (required for writes; safe for reads)

## The Defne lesson (Jan 2026)
If you see `403 Authorization failed` on reads/search; it can be **URL/query shape**, not permissions.

Known working patterns in UAT:
- Patient search by identifier:
  - `GET /FHIR/Patient?identifier=<system>|<value>`
- Media search by patient identifier (ALEX support example):
  - `GET /FHIR/Media?patient.identifier=<system>|<value>`

Known failing patterns we hit (returned 403 in UAT even with correct roles):
- `GET /FHIR/Media?patient=<patientId>`
- `GET /FHIR/Media?subject=Patient/<patientId>`

## “Known good” identifier system for NZ NHI
- `https://standards.digital.health.nz/ns/nhi-id`

Example (note URL encoding for `|` as `%7C`):

```bash
curl -sS \
  -H "Authorization: Bearer $TOKEN" \
  -H "mt-facilityid: F2N060-E" \
  -H "Accept: application/fhir+json" \
  "https://alexapiuat.medtechglobal.com/FHIR/Media?patient.identifier=https%3A%2F%2Fstandards.digital.health.nz%2Fns%2Fnhi-id%7CZZZ0016"
```

## Practical constraints for clinical images (our implementation)
- Image payload must be `< 1MB` (enforced in BFF).
- `Media.identifier` is mandatory on POST.
- Only the **Lightsail BFF** calls ALEX (static IP allow-listed); Vercel must not.
