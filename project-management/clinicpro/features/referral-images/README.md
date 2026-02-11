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

## Manual / E2E test checklist (onboarding and mobile gallery)

Use this checklist when verifying first-time onboarding and "my images on mobile" behaviour (added 2026-02-11).

1. **Setup-complete on mobile:** Sign up or complete setup on a mobile viewport (or DevTools device emulation). Confirm the tip "Photos you take on your phone are sent to your desktop page. Open the desktop link on your computer to view and download." appears below "How it works". On desktop viewport, the tip must not show.

2. **Capture first-time banner:** Open the capture page on mobile with a fresh userId (or clear `referral-images-hasSeenDesktopTip-{userId}` in localStorage). Confirm the amber banner appears with "Photos are sent to your desktop…" and "Got it". Dismiss; refresh and confirm the banner does not reappear.

3. **My images on mobile:** On the capture page, click "View & download my images on this device". With 0 images, confirm empty state: "No images yet. They'll appear here after you upload." Upload a photo (camera or gallery), complete flow; return to capture, expand "View & download my images on this device" again. Confirm the new image appears. Click Download and confirm the file downloads (or can be saved on device).

4. **Desktop first-time hint:** Open the desktop page with no images and with `referral-images-desktop-first-time-hint-{userId}` not set in localStorage. Confirm the green hint banner: "Photos you take on your phone will appear here. Download and attach to your referral." Dismiss (×); refresh and confirm the hint does not reappear.

## Archived docs

Working and strategy docs are in **archive/**:

- Strategy & Implementation Plan (pre-build)
- E2E Testing Results (post-build evidence)

This README is the current source of truth for feature overview and navigation.
