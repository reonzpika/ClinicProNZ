# Referral Images Email Series

All email content for the GP Referral Images onboarding and lifecycle sequence.  
Source: `src/lib/services/referral-images/email-service.ts`

**From:** ClinicPro \<ryo@clinicpro.co.nz\>  
**App URL:** `https://clinicpro.co.nz` (or `NEXT_PUBLIC_APP_URL`)

---

## Email 1: Welcome

**Trigger:** Day 0, immediate after signup  
**Subject:** Your Referral Images links - ready to use

**Content:**

Hi {{name}},

You're all set. Here are your permanent links:

---

**Desktop link (bookmark this):**  
{{desktopLink}}

**Mobile link (save to home screen):**  
{{mobileLink}}

---

**How to use it:**

1. Bookmark the desktop link on your computer  
2. Save the mobile link to your phone's home screen  
3. Take photo on mobile during consult  
4. Photo appears on desktop instantly – download JPEG and attach to referral  

---

These links are permanent. Bookmark them and you're done.

No credit card required. Free to use.

Cheers,  
Dr. Ryo  

---

Questions? Just reply to this email. - Ryo

---

## Email 2: Usage Tip

**Trigger:** Day 3, if 1+ image captured  
**Subject:** What other GPs use Referral Images for

**Content:**

Hi {{name}},

You've captured your first image. Here's what other GPs use it for:

**Specialist referrals (dermatology, plastics, etc.)**  
Always JPEG, auto-sized, under 500KB. Dermatologists won't reject them.

**Wound progress tracking**  
Before/after photos for clinical notes

**Insurance/ACC documentation**  
Pre-procedure records, claims

That's it. Keep using it – saves you >10 minutes every time.

---

## Email 3: Value Reinforcement

**Trigger:** Day 7, if 3+ images  
**Subject:** You've saved {{timeSaved}} minutes this week  
*(e.g. 30 minutes for 3 images)*

**Content:**

Hi {{name}},

You've captured {{imageCount}} referral images so far.

**Time you've saved:**

- Images captured: {{imageCount}}  
- Average time saved per referral: 10 minutes  
- Total time saved: {{timeSaved}} minutes  

That's time you're not staying late or doing during breaks.

**Know a colleague still emailing photos to themselves?**  
Send them this: https://clinicpro.co.nz/referral-images

---

## Email 4: Limit Hit

**Trigger:** Month 2+, when 10 images reached  
**Subject:** You've hit your 10 free images this month

**Content:**

Hi {{name}},

You've captured 10 images this month. The tool's clearly helping you.

**A bit of context:**  
I'm a fellow GP who built this after hours because I was tired of emailing photos to myself. No investors, no big company. Just me. Your support keeps me going.

**$50 one-time gets you:**

- Unlimited images forever  
- Early access to Inbox Intelligence and AI Scribe  

**[Support This Project - $50]** → {{upgradeUrl}}

**Notes:** Grace images (10 more) are granted automatically when this email sends.

No pressure. Thanks for trying it.

Dr. Ryo, GP

*P.S. If now's not the right time, I've given you 10 more free images to keep using the tool.*

---

## Email 5: Share Encourage

**Trigger:** 5 days after limit hit, if user has NOT upgraded  
**Subject:** Know someone who'd find this useful?

**Content:**

Hi {{name}},

Quick note - you've been using Referral Images for a bit now.

If it's saving you time, chances are it'll help your colleagues too.

Share this link with GPs in your practice who still email photos to themselves:  
https://clinicpro.co.nz/referral-images

That's all. Thanks for using it.

Cheers,  
Dr. Ryo

**Notes:** NO upgrade ask. Hard-coded URL.

---

## Email 6: Month Reset

**Trigger:** If didn't upgrade, at month boundary  
**Subject:** Your 10 free images have reset

**Content:**

Hi {{name}},

Your monthly limit has reset. You have 10 more free images.

Or upgrade to unlimited and stop thinking about limits:

- $50 one-time (not a subscription)  
- Never hit this wall again  


**[Support This Project - $50]** → {{upgradeUrl}}

Chhers, Dr. Ryo

---

## Email 7: Premium Confirmation

**Trigger:** After $50 payment  
**Subject:** Thank you for supporting this project

**Content:**

Hi {{name}},

Thank you. Your support means everything.

**You now have:**

- Unlimited images forever  
- All future features  
- Early access to Inbox Intelligence  

No more limits. Just use it.

Thanks for supporting GP-built tools.

Cheers,  
Dr. Ryo  

*P.S. I'll email you when Inbox Intelligence launches. You'll get early access.*

---

## Summary

| # | Name | Trigger | Subject |
|---|------|---------|---------|
| 1 | Welcome | Immediate (signup) | Your Referral Images links - ready to use |
| 2 | Usage Tip | Day 3, 1+ image | What other GPs use Referral Images for |
| 3 | Value Reinforcement | Day 7, 3+ images | You've saved X minutes this week |
| 4 | Limit Hit | 10th image (Month 2+) | You've hit your 10 free images this month |
| 5 | Share Encourage | 5 days after limit hit | Know someone who'd find this useful? |
| 6 | Month Reset | Month boundary (no upgrade) | Your 10 free images have reset |
| 7 | Premium Confirmation | After $50 payment | Thank you for supporting this project |
