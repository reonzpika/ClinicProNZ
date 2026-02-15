# Add to Home Screen – Testing

## Automated (PWA installability)

Run the manifest and icon checks:

```bash
pnpm run test -- --run "referral-images/manifest"
```

This verifies:

- Manifest GET returns 200 and `Content-Type: application/manifest+json`
- Manifest has `name` "ClinicPro Referral Images", `short_name` "Referrals"
- Manifest has `start_url`, `display: standalone`, and icons 192x192 and 512x512 with maskable purpose
- Icon files exist in `public/icons/` (referral-icon-192.png, 512.png, 180.png)

## Manual (Android and iOS)

Android and iOS behaviour cannot be fully automated. Use the **Add to Home Screen test plan** and run these yourself:

1. **Android (Chrome)**  
   Open `/referral-images/capture?u=<valid-user-id>` on device or emulator. Tap "Add to Home Screen for quick access". If installable: tap "Install app" and confirm system prompt, then check home screen icon "Referrals" and custom icon. If not: follow manual steps in the modal. Confirm "I've Saved It" and "Remind Me Later" close the modal.

2. **iOS (Safari)**  
   Open the same URL in Safari. Tap "Add to Home Screen for quick access". Confirm modal shows iOS steps (Share → Add to Home Screen → Add). Use Share → Add to Home Screen and confirm title "Referrals" and custom icon. Confirm "I've Saved It" and "Remind Me Later" close the modal.

3. **DevTools (optional)**  
   In Chrome, open the capture page → DevTools → Application → Manifest. Confirm manifest URL loads, name/short_name, icons, and installability criteria.

Full steps and pass criteria are in the plan: **Add to Home Screen Test Plan** (e.g. in `.cursor/plans/` or project docs).
