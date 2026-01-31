# Referral Images Feature

## Summary

GP Referral Images is a standalone referral photo workflow: phone to desktop in seconds. Freemium model: Month 1 unlimited; Month 2+ 10 images per month, up to 2 grace unlocks of 10 more; $50 one-time premium for unlimited. Target: GPs; non-clinical record. Images: 24-hour storage, auto-resize under 500KB, JPEG conversion.

## Status

Implemented; E2E testing complete (2026-01-31). All seven phases passed: signup, desktop page, mobile upload, desktop display, freemium limits, Stripe checkout, premium verification.

## User-facing URLs

- **Marketing**: `(marketing)/referral-images` — landing and signup
- **Clinical**: `(clinical)/referral-images/desktop?u={userId}`, `(clinical)/referral-images/capture?u={userId}`, `(clinical)/referral-images/setup-complete`, `(clinical)/referral-images/success`

Base URL: clinicpro.app (or app paths as above).

## API routes

Under `app/api/(clinical)/referral-images/`:

- `signup` — Account creation
- `status/[userId]` — Usage status and images list
- `upload` — Image upload and processing
- `unlock-grace` — Grace unlock (10 more images)
- `download/[imageId]` — Single image download
- `upgrade/checkout` — Stripe checkout session
- `upgrade/webhook` — Stripe webhook handler

## Code locations

- **Pages**: `app/(marketing)/referral-images/`, `app/(clinical)/referral-images/` (capture, desktop, setup-complete, success)
- **APIs**: `app/api/(clinical)/referral-images/`
- **Services**: `src/lib/services/referral-images/` (email-service, s3-service)

## Archived docs

Working and strategy docs are in **archive/**:

- Strategy & Implementation Plan (pre-build)
- E2E Testing Results (post-build evidence)

This README is the current source of truth for feature overview and navigation.
