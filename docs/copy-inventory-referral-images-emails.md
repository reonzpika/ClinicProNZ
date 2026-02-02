# Copy inventory – Referral Images email flow (Resend)

All transactional and lifecycle emails for referral-images signup and usage. Sent via Resend from `src/lib/services/referral-images/email-service.ts`.

**From:** `ClinicPro <notifications@clinicpro.co.nz>`  
**Variables used:** `name` (or "there"), `email`, `userId`, `desktopLink`, `mobileLink`, `APP_URL`, `imageCount`, `timeSaved`, `daysUntilReset`.

Use the **Review** column: **Keep** or your replacement text.

---

## Email 1: Welcome (Day 0 – immediate after signup/setup)

**Trigger:** Signup (`/api/referral-images/signup`) or first-time setup (`/api/referral-images/setup`).

| Location | Copy | Review |
|----------|------|--------|
| Subject | Your GP Referral Images links are ready 📸 | |
| Greeting | Hi {name}, (or "Hi there,") | |
| Intro | Your referral photo tool is set up and ready. | |
| Section heading | 🖥️ Desktop Link (bookmark this on your computer): | |
| Section heading | 📱 Mobile Link (save to your phone's home screen): | |
| Section heading | 💡 Quick Start: | |
| Step 1 | Bookmark the desktop link on your computer | |
| Step 2 | Save the mobile link to your phone's home screen | |
| Step 3 | Open the mobile page when you need referral photos | |
| Step 4 | Photos appear on desktop instantly | |
| Line | These are YOUR permanent links. Same links work every time. | |
| Line | No credit card required. Free to use. | |
| Sign-off | Cheers, ClinicPro Team | |
| Footer | Need help? Reply to this email or visit clinicpro.app/support | |

*(Note: Footer URL is `clinicpro.app/support` – confirm if this should be clinicpro.co.nz.)*

---

## Email 2: Usage Tip (Day 3 – if 1+ image captured)

**Trigger:** Scheduled / automation when user has captured at least one image (Day 3).

| Location | Copy | Review |
|----------|------|--------|
| Subject | Quick tip: Use GP Referral Images for these 3 things | |
| Greeting | Hi {name}, (or "Hi there,") | |
| Intro | You've started using GP Referral Images - nice! | |
| Section heading | Here's what other GPs use it for: | |
| Item 1 heading | 1. 📋 Specialist Referral Photos | |
| Item 1 body | → Saves 10+ min per referral / Auto-sized for email (<500KB, no rejections) | |
| Item 2 heading | 2. 📸 Wound Progress Documentation | |
| Item 2 body | → Before/after tracking for clinical notes | |
| Item 3 heading | 3. 🏥 Pre-Procedure Records | |
| Item 3 body | → Insurance claims documentation | |
| Closing | Keep capturing. It gets easier every time. | |

---

## Email 3: Value Reinforcement (Day 7 – if 3+ images)

**Trigger:** Scheduled when user has captured 3+ images (Day 7).

| Location | Copy | Review |
|----------|------|--------|
| Subject | You've saved {timeSaved} minutes with GP Referral Images | |
| Greeting | Hi {name}, (or "Hi there,") | |
| Intro | You've captured {imageCount} images with GP Referral Images. | |
| Section heading | 📊 Your Time Savings: | |
| Bullet 1 | Images captured: {imageCount} | |
| Bullet 2 | Average time saved per image: 5 minutes | |
| Bullet 3 | Total time saved: {timeSaved} minutes | |
| Line | That's {X hours and Y minutes / Y minutes} back in your day. 💪 | |
| Section heading | Share the love: | |
| Body | Know a colleague who emails referral photos to themselves? Send them this: [APP_URL/referral-images] | |

---

## Email 4: Limit Hit (when 10 images reached this month)

**Trigger:** When user hits monthly limit (10 images).

| Location | Copy | Review |
|----------|------|--------|
| Subject | Help keep GP Referral Images running? | |
| Greeting | Hi {name}, (or "Hi there,") | |
| Intro | You've used GP Referral Images 10 times this month - great! | |
| Context heading | Quick context: | |
| Context body | I built this as a GP frustrated with existing tools. No venture capital, no corporate owners. | |
| Section heading | Your support keeps this project alive: | |
| Bullet 1 | ✓ $50 one-time (not a subscription) | |
| Bullet 2 | ✓ Unlimited images forever | |
| Bullet 3 | ✓ All future updates included | |
| Bullet 4 | ✓ Early access to our upcoming Inbox AI tool | |
| CTA button text | Support GP Referral Images - $50 | |
| Closing | Thanks for trying what I built. | |
| Sign-off | Dr. Ryo, GP | |
| P.S. | P.S. If now's not the right time, I've given you 10 more free images to keep using the tool. | |

---

## Email 5: Follow-up (24h after limit, no upgrade)

**Trigger:** 24 hours after limit hit, if user has not upgraded. Variable: `daysUntilReset`.

| Location | Copy | Review |
|----------|------|--------|
| Subject | Still need more images this month? | |
| Greeting | Hi {name}, (or "Hi there,") | |
| Intro | Quick reminder: You've used your 10 free images this month. | |
| Section heading | Options: | |
| Option 1 | Wait {daysUntilReset} days for 10 more free images | |
| Option 2 | Upgrade to unlimited now ($50 one-time) → Never hit limits again | |
| CTA button text | Upgrade Now - $50 | |
| Closing | No pressure - free tier resets next month. | |

---

## Email 6: Month Reset (month boundary, didn’t upgrade)

**Trigger:** At start of new month when limit resets (user did not upgrade).

| Location | Copy | Review |
|----------|------|--------|
| Subject | Your 10 free images are back 🎉 | |
| Greeting | Hi {name}, (or "Hi there,") | |
| Intro | Good news - your monthly limit has reset. | |
| Line | You have 10 more free images this month. | |
| Line | Or upgrade to unlimited and never think about limits again: | |
| Bullet 1 | ✓ $50 one-time | |
| Bullet 2 | ✓ All future features included | |
| CTA button text | Upgrade to Unlimited - $50 | |

---

## Email 7: Premium Confirmation (after $50 payment)

**Trigger:** Stripe webhook after successful one-time payment (`/api/referral-images/upgrade/webhook`).

| Location | Copy | Review |
|----------|------|--------|
| Subject | Thank you for supporting GP Referral Images! 🎉 | |
| Greeting | Hi {name}, (or "Hi there,") | |
| Intro | Your support means everything. | |
| Section heading | You now have: | |
| Bullet 1 | ✅ Unlimited referral images forever | |
| Bullet 2 | ✅ All future features automatically | |
| Bullet 3 | ✅ Priority early access to our upcoming Inbox AI tool | |
| Bullet 4 | ✅ Our deepest gratitude | |
| Line | No more limits. No more prompts. Just capture as many images as you need. | |
| Line | Thank you for supporting GP-built tools. | |
| Sign-off | Dr. Ryo, GP | |
| P.S. | P.S. Keep an eye out for Inbox AI launch emails. You'll be among the first to get early access. | |

---

## Consistency notes (for review)

- **Sign-off:** Welcome uses "ClinicPro Team"; Limit Hit, Premium use "Dr. Ryo, GP". Consider standardising if you want one voice.
- **Support URL:** Welcome footer says `clinicpro.app/support`; app uses `NEXT_PUBLIC_APP_URL` (e.g. clinicpro.co.nz). Confirm correct domain.
- **Inbox AI vs Inbox Intelligence:** Emails say "Inbox AI"; site copy uses "Inbox Intelligence Engine". Align if intentional.
- **$50 one-time:** Phrasing is consistent; "not a subscription" appears in Limit Hit only – consider adding elsewhere if you want to stress it.

---

*End of email copy inventory. Edits go in `src/lib/services/referral-images/email-service.ts`.*
