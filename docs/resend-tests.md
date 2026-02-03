# Resend API test suite

Tests for Resend email (ClinicPro SaaS): welcome series, open/click tracking webhooks, domain auth, and production checks.

## Environment variables

- **RESEND_API_KEY** – Resend API key (required for sending; optional for unit tests, which mock the API).
- **RESEND_WEBHOOK_SECRET** – Resend webhook signing secret (Svix format, e.g. `whsec_...`). Required for `/api/webhooks/resend` to verify incoming webhooks.

Unit tests run without `RESEND_API_KEY`. Integration tests (real send to `delivered@resend.dev`) run only when `RESEND_API_KEY` is set.

## Running tests

```bash
# All Resend tests (unit + integration when key set)
pnpm test:resend

# Or via vitest
pnpm test src/lib/services/referral-images/__tests__/resend-api.test.ts
```

## Domain and test addresses

- **Domain**: clinicpro.co.nz (verified in Resend, Tokyo region).
- **From**: ryo@clinicpro.co.nz.
- **Resend test addresses**: `delivered@resend.dev`, `bounced@resend.dev`, `complained@resend.dev`.

Open tracking must be enabled at domain level in the Resend dashboard (or via `resend.domains.update({ openTracking: true })`) for open/click webhook events to be sent.
