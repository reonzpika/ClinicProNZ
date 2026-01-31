# GP Referral Images - Comprehensive Strategy & Implementation Plan

**Document Date:** January 29, 2026  
**Product:** GP Referral Images (ClinicPro)  
**Strategic Phase:** Phase 0 - Email Acquisition & Brand Building  
**Primary Goal:** Build warm GP audience for Inbox AI launch  
**Timeline:** ASAP - 48-hour build, immediate public launch  
**Status:** Ready for Implementation

---

## 1. EXECUTIVE SUMMARY

### Strategic Context

GP Referral Images is a **standalone clinical photo workflow tool** designed as Phase 0 customer acquisition for the broader ClinicPro platform. While the long-term vision centers on Inbox AI (6-12 months to MVP), this tool serves immediate strategic objectives:

1. **Email List Building**: Target 500+ GP emails in 6 months
2. **Brand Credibility**: Establish ClinicPro as "GP problem solver" 
3. **Market Presence**: Visible product while Inbox AI matures
4. **Channel Learning**: Test GP acquisition tactics
5. **Modest Revenue**: $3,500-6,400 to fund development

### Why This Tool Now

**Inbox AI Gap**: Core product needs 6-12 months → Need market presence today  
**Code Reuse**: 70-80% built from existing `/medtech-images` codebase → Minimal new development  
**Validated Demand**: GP Facebook threads confirm widespread pain with existing tools (MedImage, QuickShot, Indici)  
**Low Risk**: If fails, email list still valuable; if succeeds, strong Inbox AI launch funnel

### What Success Looks Like (1 Month)

- **50 signups** (demand validation)
- **5 premium conversions** ($250 revenue, 10% conversion rate)
- **Positive GP testimonials** (social proof for scaling)
- **Organic word-of-mouth** (GPs recommending to colleagues)

### Long-Term Path

```
Phase 0 (Now - Month 6): GP Referral Images
├─ Build email list (500+ GPs)
├─ Establish brand credibility
└─ Generate $3-6K revenue

Phase 1 (Month 6-18): Inbox AI Launch
├─ Email premium converters with early access
├─ Convert high-engagement free users
└─ Deprecate standalone referral tool → integrate into Inbox AI

Phase 2-5 (Year 2-10): Full Platform Evolution
└─ Clinical Intelligence → Care Orchestration → System Intelligence
```

---

## 2. PRODUCT OVERVIEW

### Product Definition

**Name:** GP Referral Images  
**Tagline:** "Referral photos from phone to desktop in 30 seconds"  
**URL:** clinicpro.app/referral-images  
**Category:** Clinical workflow tool (administrative, non-clinical record)

### Core Value Proposition

**For GPs who:** Waste 15-30 minutes per referral emailing photos to themselves, resizing files, dealing with format rejections

**GP Referral Images provides:**
- ✅ **Speed**: Phone to desktop in 30 seconds (vs 5-15 minutes)
- ✅ **Ease**: Direct clickable link, no QR scanning required
- ✅ **Auto-resize**: <500KB, specialist-ready (no more rejections)
- ✅ **Security**: 24-hour encrypted storage, auto-delete
- ✅ **Free**: No credit card, no installation, no hassle

**Unlike** MedImage, QuickShot, Indici:
- Built by a GP who lives the problem (peer credibility)
- Free tier generous enough for most GPs (competitive advantage)
- Simple, transparent pricing ($50 one-time, not subscription)
- Personal community support model (not corporate)

### Target Audience

**Primary:** General Practitioners (GPs) globally
- Pain point: Referral photo workflow inefficiency
- Frequency: 10-20 referrals with photos per month (average)
- Willingness to pay: $50-100 range (validated from competitor pricing)
- Decision style: Individual adoption first, practice-wide later

**Secondary (Future):** Practice Managers
- For optional Medtech integration (separate tier, price TBD)
- Not part of MVP strategy

### Key Differentiators

| Aspect | GP Referral Images | Competitors (MedImage, QuickShot) |
|--------|-------------------|----------------------------------|
| **Pricing** | Free → $50 one-time | Subscription or unclear pricing |
| **Builder** | Fellow GP (peer credibility) | Corporate healthcare tech |
| **Messaging** | "Support this project" | Corporate feature marketing |
| **Integration** | Standalone (optional Medtech add-on) | PMS-locked or unclear |
| **Access** | Permanent personal link | QR-dependent or app-based |
| **File output** | Auto-sized JPEG (<500KB) | Variable or PDF-only |

---

## 3. BUSINESS MODEL & MONETIZATION

### Revenue Model: Freemium with Personal Support Framing

**NOT**: Traditional SaaS freemium with feature gates  
**ACTUALLY**: Community-supported tool with "help keep this alive" model

### Pricing Tiers

#### **Free Tier**
- **Month 1:** Unlimited images (silent, no limits mentioned)
- **Month 2+:** 10 images per month
- **Included:**
  - Direct capture link (desktop + mobile)
  - Auto-resize to <500KB, 1920px max
  - JPEG conversion from HEIC/PNG
  - 24-hour secure storage
  - Email signup (email + optional name)

**Purpose:**
- Viral acquisition (GPs recommend free tool)
- Email list building (primary strategic goal)
- Usage validation (who actually uses it?)
- Create habit before friction appears

**Psychology:**
- Month 1 unlimited = zero-friction habituation
- No upfront limit mention = positive first impression
- 10/month in Month 2 = below average GP needs (10-20/month) = creates real urgency

---

#### **Premium Tier** 
**Price:** $50 one-time payment (NOT subscription)

**Included:**
- ✅ Unlimited images forever
- ✅ All future features included (annotation tools, PDF output, etc.)
- ✅ Priority email support
- ✅ **Bonus:** Early access to Inbox AI when it launches

**Purpose:**
- Generate development revenue ($3,500-6,400 target)
- Identify highest-value users (proven willingness to pay)
- Create premium segment for Inbox AI priority access

**Not Included at Launch:**
- ❌ Annotation tools (arrows, text, redaction) - Future
- ❌ PDF export - Future
- ❌ Medtech integration - Separate tier

**Positioning:**
- NOT "unlock premium features"
- ACTUALLY "support a fellow GP's project"
- Frame: Peer solidarity, not corporate upsell

---

#### **Optional: Medtech Integration Tier (Not MVP)**
**Status:** Available on request, not actively promoted  
**Price:** TBD (likely $299-999 one-time setup fee)  
**Revenue Share:** Medtech takes 30% of one-time payment  
**Purpose:** High-value enterprise sales for practices wanting PMS integration

**Note:** This is NOT the main monetization path. Only pursue if GPs request it organically.

---

### Conversion Funnel

#### **Trigger Point:** User captures 11th image in Month 2+

**First Modal (Version A - Personal Framing):**
```
┌─────────────────────────────────────────────────┐
│ 🎉 You've captured 10 images this month -       │
│    this tool is clearly helping you!            │
│                                                 │
│ I'm a fellow GP who built this to solve our    │
│ shared workflow pain. No VC funding, no         │
│ corporate backing.                              │
│                                                 │
│ Help keep this project alive:                   │
│                                                 │
│ $50 one-time gets you:                          │
│ ✓ Unlimited images forever                      │
│ ✓ All future features (annotation, PDF, etc.)   │
│ ✓ Early access to our upcoming Inbox AI tool    │
│ ✓ Support GP-built healthcare solutions         │
│                                                 │
│ [Support This Project - $50]                    │
│                                                 │
│ Or I'll give you 10 more free images right now  │
│ to keep going.                                  │
│                                                 │
│ [Give Me 10 More Free Images]                   │
└─────────────────────────────────────────────────┘
```

**User clicks "Give Me 10 More":**
- Immediately unlocks 10 more images (same month)
- Continue using
- When they hit 21st image → Same modal appears again

**Repeat Cycle:** 2 times maximum
- 1st limit (10 images): Offer 10 more
- 2nd limit (20 images): Offer 10 more
- 3rd limit (30 images): Hard cap → "Wait until [Date] for monthly reset OR upgrade now"

**Why 2 repeats:**
- Generous enough to not feel restrictive
- Creates 3 conversion opportunities
- Heavy users (30+ images/month) are high-value → should convert

---

#### **Email Follow-up (Same Day as Limit Hit):**

```
Subject: Help keep GP Referral Images running?

Hi [Name],

You've used GP Referral Images 10 times this month - that's great to see!

Quick context: I built this as a GP frustrated with existing tools. 
No venture capital, no corporate owners - just trying to solve our 
shared workflow problems.

Your support keeps this project alive:
• $50 one-time (not a subscription)
• Unlimited images forever
• All future updates included
• Early access to our upcoming Inbox AI tool
• Help other GPs access this tool

[Support GP Referral Images - $50]

Thanks for trying what I built.

Dr. [Your Name], GP
[Your Location]

P.S. If now's not the right time, I've given you 10 more free images 
to keep using the tool.
```

**Tone:** Vulnerable, authentic, peer-to-peer (not corporate sales)

---

### Email Marketing Sequence

**Email 1 - Welcome (Day 0, immediately after signup):**
```
Subject: Your GP Referral Images links are ready 📸

Hi [Name],

Your referral photo tool is set up and ready.

Desktop link (bookmark this):
[Desktop Link with userId]

Mobile capture link (save to your phone's home screen):
[Mobile Link with userId]

💡 Pro tip: Save the mobile link to your home screen for 
instant access anytime - works like an app.

No installation. No credit card. Just works.

- ClinicPro Team

P.S. These are YOUR permanent links. Same links work every time.
```

---

**Email 2 - Usage Tip (Day 3, only if 1+ image captured):**
```
Subject: Quick tip: Use GP Referral Images for these 3 things

Hi [Name],

You've started using GP Referral Images - nice!

Here's what other GPs use it for:

1. Specialist referral photos
   (saves 10+ min per referral, auto-sized for email)

2. Wound progress documentation
   (before/after tracking for notes)

3. Pre-procedure records
   (insurance claims, medico-legal documentation)

Keep capturing. It gets easier every time.

- ClinicPro Team
```

---

**Email 3 - Value Reinforcement (Day 7, only if 3+ images captured):**
```
Subject: You've saved [X] minutes with GP Referral Images

Hi [Name],

You've captured [X] images with GP Referral Images.

Average time saved per image: 5 minutes
Your total time saved: [X×5] minutes

That's time back in your day. 💪

- ClinicPro Team

P.S. Share GP Referral Images with colleagues who need 
referral photos. They'll thank you.
```

---

**Email 4 - Limit Hit (triggered when user hits 10 images Month 2+):**
[Same as "Email Follow-up" above]

---

**Email 5 - Follow-up (24hrs after limit, if no upgrade):**
```
Subject: Still need more images this month?

Hi [Name],

Quick reminder: You've used your 10 free images this month.

Options:
• Wait [X] days for 10 more free images
• Upgrade to unlimited now ($50 one-time)

Upgrading = never hit limits again + early access to 
our upcoming Inbox AI tool.

[Upgrade Now]

- ClinicPro Team
```

---

**Email 6 - Month Reset (if didn't upgrade, at month boundary):**
```
Subject: Your 10 free images are back 🎉

Hi [Name],

Good news - your monthly limit has reset.

You have 10 more free images this month.

(Or upgrade to unlimited and never think about limits 
again: $50 one-time)

[Upgrade to Unlimited]

- ClinicPro Team
```

**Email Cadence Principles:**
- No spam (max 6 emails ever if never upgrade)
- Value-first (only sell when limit hit)
- Personal tone throughout
- Clear unsubscribe option in every email

---

### Long-Term Monetization Strategy

#### **2026 (Now - Month 6): Email List Building**
**Goal:** 500+ GP emails, $3,500-6,400 revenue  
**Tactic:** Free tool with personal support conversion  
**Outcome:** Warm audience for Inbox AI

#### **2027 (Month 6-18): Inbox AI Launch**
**Goal:** Convert referral images users to Inbox AI  
**Tactic:** Priority access to premium converters, targeted offers to high-engagement free users  
**Pricing:** TBD (likely $60-120/month subscription)

**Email campaign example:**
```
Subject: You asked for it: ClinicPro Inbox AI is here

Hi [Name],

You've been using our referral images tool for [X] months.

Now we're launching something bigger:

ClinicPro Inbox AI - your clinical inbox, automated:
• Auto-triage messages by urgency
• Draft responses to common queries  
• Flag abnormal results automatically
• Suggest next actions based on context

Because you supported GP Referral Images, you get:
→ 30-day free trial (no credit card)
→ 20% off first year if you subscribe

[Get Early Access]

P.S. Your referral images will integrate seamlessly.
```

#### **2027-2028: Deprecate Standalone Tool**
**Action:** Integrate referral images into Inbox AI as native feature  
**Redirect:** `/referral-images` → Inbox AI landing page with "Referral Images now part of Inbox AI"  
**Offer:** Free Inbox AI trial to existing standalone users

**This completes the acquisition funnel.**

---

## 4. USER EXPERIENCE & FLOW

### Overview: Permanent Link Model

**Key UX Decision:** Each GP gets ONE set of permanent links at signup
- Desktop link: `clinicpro.app/referral-images/desktop?u={userId}`
- Mobile link: `clinicpro.app/referral-images/capture?u={userId}`

**Why permanent links:**
- ✅ No session management complexity
- ✅ Bookmark once, use forever
- ✅ Share easily (email, WhatsApp, SMS)
- ✅ Works like a personal tool (not ephemeral)

**Security consideration:** Anyone with link can upload to that GP's account
- **Mitigation:** Links are long, unguessable UUIDs (128-bit entropy)
- **Acceptable risk:** These are temporary clinical photos (24h auto-delete), not patient records
- **GP control:** If link compromised, can regenerate via settings (future feature)

---

### User Journey Map

```
┌─────────────────────────────────────────────────────────────┐
│ DISCOVERY → SIGNUP → SETUP → CAPTURE → LIMIT → CONVERT      │
└─────────────────────────────────────────────────────────────┘

DISCOVERY (GP Facebook, colleague referral, email)
│
├─ Sees post: "Free tool for referral photos - built by a GP"
└─ Clicks: clinicpro.app/referral-images

SIGNUP (Landing page)
│
├─ Sees value proposition (speed, ease, auto-resize, security)
├─ "Get Started Free - No Credit Card Required"
├─ Enters email + optional name
├─ Accepts disclaimers (patient consent, not clinical record, 24h storage)
└─ Submits

SETUP (Welcome email received immediately)
│
├─ Email contains TWO permanent links
│   ├─ Desktop link: "Bookmark this on your computer"
│   └─ Mobile link: "Save to your phone's home screen"
│
├─ GP opens desktop link on computer
│   └─ Bookmarks it (browser bookmark bar or favorites)
│
└─ GP sends mobile link to phone
    ├─ Via email button (pre-filled email to self)
    ├─ Via WhatsApp share (pre-filled message)
    ├─ Via copy/paste (manual)
    └─ Or via optional QR code (scan with phone)

CAPTURE (When GP needs referral photo)
│
├─ Desktop: Opens bookmarked desktop link
│   ├─ Shows instructions: "Open your mobile link to start capturing"
│   ├─ Shows email/WhatsApp/copy/QR options to send mobile link
│   └─ Displays uploaded images in real-time as GP captures on phone
│
└─ Mobile: Opens saved mobile link from home screen
    ├─ Camera interface appears (native phone camera)
    ├─ Capture multiple photos
    ├─ Each photo auto-uploads, compresses, converts to JPEG
    ├─ "Done" button when finished
    └─ Confirmation: "Photos ready on your desktop"

DOWNLOAD (Back to desktop)
│
├─ Uploaded images appear in gallery
├─ Click individual image to download JPEG
├─ Or click "Download All as ZIP" for batch download
└─ Use images in referral portal (drag-and-drop into e-referral system)

LIMIT (Month 2, after 10 images captured)
│
├─ Modal appears on 11th capture attempt
├─ "You've captured 10 images this month - this tool is clearly helping!"
├─ Personal support message (fellow GP framing)
├─ Options:
│   ├─ [Support Project - $50] → Stripe checkout
│   └─ [Give Me 10 More Free] → Unlock 10 more immediately
└─ Email sent same day with same offer

CONVERT (If GP pays $50)
│
├─ Stripe checkout: $50 one-time payment
├─ Webhook updates account: tier = 'premium'
├─ Confirmation email: "Thank you for supporting GP-built tools!"
├─ Immediate effect: Unlimited images, no more prompts
└─ Future: Annotation tools, PDF export added automatically
```

---

### Detailed Page Specifications

#### **Landing Page: `/referral-images`**

**Hero Section:**
```
┌────────────────────────────────────────────────┐
│  [ClinicPro Logo]                              │
│                                                │
│  GP Referral Images                            │
│  ════════════════════════════                  │
│                                                │
│  Referral photos from phone to desktop         │
│  in 30 seconds                                 │
│                                                │
│  ✓ No more emailing yourself                   │
│  ✓ Auto-resized for specialists (<500KB)       │
│  ✓ Secure 24-hour storage                      │
│  ✓ Free - No credit card required              │
│                                                │
│  [Get Started Free]                            │
│                                                │
│  Built by a GP, for GPs                        │
└────────────────────────────────────────────────┘
```

**How It Works Section:**
```
3 Simple Steps:

1. 📧 Sign up - Get your personal links (emailed to you)

2. 📱 Capture - Open mobile link, take photos with your phone

3. 💻 Download - Photos appear on desktop, auto-sized for referrals


No installation. No QR scanning required. Just works.
```

**What's Included Section:**
```
What You Get (Free):

✓ Personal desktop + mobile links (yours forever)
✓ Automatic JPEG conversion (from HEIC, PNG, etc.)
✓ Auto-resize to <500KB (no more email rejections)
✓ Secure encrypted storage (24-hour auto-delete)
✓ Unlimited images in first month
✓ No credit card, no subscriptions, no hassle

Built by Dr. [Your Name], GP at [Your Practice]
Sick of emailing referral photos to myself.
```

**Testimonials Section (after soft launch):**
```
What GPs Are Saying:

"Saves me 10 minutes per referral. Game changer."
- Dr. [Name], [Practice]

"Finally, no more 'file too large' rejections."
- Dr. [Name], [Practice]
```

**CTA Section:**
```
Ready to stop emailing yourself?

[Get Started Free]

No credit card required • 30-second setup
```

**Footer:**
- Terms of Service
- Privacy Policy
- Contact: support@clinicpro.app

---

#### **Signup Modal/Page:**

```
┌────────────────────────────────────────────────┐
│  Get Your Free GP Referral Images Links        │
│                                                │
│  Email: [___________________]                  │
│  Name (optional): [___________________]        │
│                                                │
│  □ I confirm:                                  │
│    • I will obtain patient consent before      │
│      taking clinical photos                    │
│    • I understand this is NOT a clinical       │
│      record system                             │
│    • Images are stored securely for 24 hours   │
│      then automatically deleted                │
│                                                │
│  [Get My Links]                                │
│                                                │
│  Your permanent links will be emailed to you   │
│  immediately.                                  │
└────────────────────────────────────────────────┘
```

---

#### **Desktop Page: `/referral-images/desktop?u={userId}`**

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ [ClinicPro Logo]    GP Referral Images    [Settings]       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Send Mobile Link to Your Phone:                           │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ https://clinicpro.app/referral-images/capture?u=... │  │
│  │ [Copy] [Email] [WhatsApp] [Show QR Code ▼]         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  💡 Tip: Save the mobile link to your phone's home screen  │
│     for instant access anytime.                            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Your Referral Images (Auto-refreshes):                    │
│                                                            │
│  ┌────────┐ ┌────────┐ ┌────────┐                         │
│  │ Image1 │ │ Image2 │ │ Image3 │                         │
│  │ 2.3 MB │ │ 1.8 MB │ │ 2.1 MB │                         │
│  │ ↓ JPEG │ │ ↓ JPEG │ │ ↓ JPEG │                         │
│  └────────┘ └────────┘ └────────┘                         │
│                                                            │
│  [Download All as ZIP]                                     │
│                                                            │
│  Images automatically deleted after 24 hours               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Buttons Behavior:**
- **Copy:** Copies mobile link to clipboard
- **Email:** Opens mailto with pre-filled subject "My GP Referral Images Link" and body containing mobile link
- **WhatsApp:** Opens WhatsApp Web with pre-filled message containing mobile link
- **Show QR Code:** Expands to show QR code (optional, for those who prefer QR scanning)

**Auto-refresh:** Desktop polls server every 3 seconds for new images (simple HTTP polling, no WebSocket needed)

---

#### **Mobile Capture Page: `/referral-images/capture?u={userId}`**

**First Visit:**
```
┌────────────────────────────────┐
│  GP Referral Images            │
│                                │
│  📸                            │
│                                │
│  Ready to capture referral     │
│  photos?                       │
│                                │
│  [Start Camera]                │
│                                │
│  💡 Save this page to your     │
│  home screen for instant       │
│  access next time.             │
│                                │
│  [Show Me How]                 │
└────────────────────────────────┘
```

**After Clicking "Start Camera":**
```
┌────────────────────────────────┐
│  📷 Camera Active              │
│                                │
│  [Live camera viewfinder]      │
│                                │
│  [⚪ Capture Photo]            │
│                                │
│  Captured (3):                 │
│  [thumb] [thumb] [thumb]       │
│                                │
│  [✓ Done - View on Desktop]   │
└────────────────────────────────┘
```

**Capture Flow:**
1. Click "Capture Photo" → Takes photo using native camera
2. Photo automatically:
   - Compresses to <500KB
   - Converts to JPEG (if HEIC/PNG)
   - Uploads to S3 tagged with userId
   - Thumbnail appears in "Captured" section
3. Repeat for multiple photos
4. Click "Done" → Confirmation message: "✓ Photos ready on your desktop"

**Usage Counter (Month 2+):**
```
┌────────────────────────────────┐
│  Images this month: 7/10       │
│  (3 remaining)                 │
└────────────────────────────────┘
```

Shows at top of capture page, only visible Month 2+

---

#### **Limit Hit Modal (Mobile):**

When GP tries to capture 11th image in Month 2:

```
┌────────────────────────────────────────┐
│  🎉 You've captured 10 images this     │
│     month - this tool is clearly       │
│     helping you!                       │
│                                        │
│  I'm a fellow GP who built this to     │
│  solve our shared workflow pain.       │
│  No VC funding, no corporate backing.  │
│                                        │
│  Help keep this project alive:         │
│                                        │
│  $50 one-time gets you:                │
│  ✓ Unlimited images forever            │
│  ✓ All future features                 │
│  ✓ Early access to Inbox AI            │
│  ✓ Support GP-built tools              │
│                                        │
│  [Support This Project - $50]          │
│                                        │
│  Or I'll give you 10 more free images  │
│  right now to keep going.              │
│                                        │
│  [Give Me 10 More Free Images]         │
└────────────────────────────────────────┘
```

**After "Give Me 10 More" clicked (1st or 2nd time):**
```
✓ Done! You have 10 more free images.

Keep capturing. I'll ask again when you 
hit the next limit.

[Continue]
```

**After 3rd limit (30 images total):**
```
You've used 30 free images this month!

To continue:
• Upgrade to unlimited ($50 one-time)
• Or wait until [Feb 1] for 10 more free

[Upgrade Now]

Your images are waiting on your desktop.
```

---

### Save to Home Screen Instructions

**iOS (Safari):**
```
Save This Page to Your Home Screen:

1. Tap the Share button (□↑) at bottom of Safari
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" in top-right corner

Now you have instant access - works like an app!
```

**Android (Chrome):**
```
Save This Page to Your Home Screen:

1. Tap the menu (⋮) in top-right corner
2. Tap "Add to Home screen"
3. Tap "Add"

Now you have instant access - works like an app!
```

---

## 5. TECHNICAL ARCHITECTURE

### Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript (strict mode)
- Tailwind CSS (existing ClinicPro design system)
- Mobile-first responsive design

**Backend:**
- Next.js API routes
- Neon PostgreSQL database (existing)
- Drizzle ORM
- Clerk authentication (existing, reuse for account management)

**Storage:**
- AWS S3 (ap-southeast-2 for NZ proximity)
- 24-hour lifecycle policy (auto-delete)

**Payments:**
- Stripe (existing ClinicPro integration)
- One-time $50 payment product
- Webhook for conversion tracking

**Email:**
- Resend (or existing email service)
- Automated drip campaigns
- Transactional emails (welcome, limit notifications)

**Hosting:**
- Vercel (existing ClinicPro deployment)
- Edge functions for API routes

---

### Data Model

#### **Database Schema:**

```sql
-- Users table (extend existing Clerk users)
-- Assuming users table already exists from ClinicPro platform

-- New table: referral_images_usage
CREATE TABLE referral_images_usage (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,  -- Clerk userId
  month VARCHAR(7) NOT NULL,      -- Format: YYYY-MM
  image_count INTEGER DEFAULT 0,
  grace_unlocks_used INTEGER DEFAULT 0,  -- Track "give me 10 more" clicks (max 2)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month),
  INDEX idx_user_month (user_id, month)
);

-- New table: referral_images_uploads
CREATE TABLE referral_images_uploads (
  image_id VARCHAR(255) PRIMARY KEY,     -- UUID
  user_id VARCHAR(255) NOT NULL,         -- Clerk userId
  s3_key VARCHAR(500) NOT NULL,          -- S3 path
  original_filename VARCHAR(500),
  file_size INTEGER,                     -- bytes
  format VARCHAR(10),                    -- JPEG, HEIC, PNG, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_expires (expires_at)
);

-- New table: referral_images_accounts
CREATE TABLE referral_images_accounts (
  user_id VARCHAR(255) PRIMARY KEY,      -- Clerk userId
  tier VARCHAR(20) DEFAULT 'free',       -- 'free' | 'premium'
  email VARCHAR(500) NOT NULL,
  name VARCHAR(500),                     -- Optional
  desktop_link VARCHAR(500) NOT NULL,    -- Permanent desktop link
  mobile_link VARCHAR(500) NOT NULL,     -- Permanent mobile link
  stripe_payment_id VARCHAR(500),        -- If premium tier
  upgraded_at TIMESTAMP,                 -- When they paid
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_tier (tier)
);

-- Cleanup job (run daily via cron)
DELETE FROM referral_images_uploads 
WHERE expires_at < CURRENT_TIMESTAMP;
```

---

### S3 Configuration

**Bucket Structure:**
```
s3://clinicpro-referral-images/
  └─ {userId}/
      ├─ {timestamp}-{imageId}.jpg
      ├─ {timestamp}-{imageId}.jpg
      └─ ...
```

**Lifecycle Policy:**
```json
{
  "Rules": [
    {
      "Id": "Delete after 24 hours",
      "Status": "Enabled",
      "Prefix": "",
      "Expiration": {
        "Days": 1
      }
    }
  ]
}
```

**Security:**
- Presigned URLs for uploads (expire in 1 hour)
- Presigned URLs for downloads (expire in 24 hours)
- No public bucket access
- CORS configured for clinicpro.app domain only
- Server-side encryption (AES-256)

---

### API Routes

#### **1. POST `/api/referral-images/signup`**
**Purpose:** Create new GP account and generate permanent links

**Request:**
```typescript
{
  email: string;
  name?: string;  // optional
}
```

**Response:**
```typescript
{
  userId: string;
  desktopLink: string;  // https://clinicpro.app/referral-images/desktop?u={userId}
  mobileLink: string;   // https://clinicpro.app/referral-images/capture?u={userId}
  tier: 'free';
}
```

**Logic:**
1. Validate email format
2. Check if email already exists (prevent duplicates)
3. Create Clerk user (if not exists)
4. Generate permanent links with userId
5. Insert into `referral_images_accounts` table
6. Send welcome email with links
7. Return links

---

#### **2. GET `/api/referral-images/status/{userId}`**
**Purpose:** Get current usage status and uploaded images

**Response:**
```typescript
{
  userId: string;
  tier: 'free' | 'premium';
  currentMonth: string;  // YYYY-MM
  imageCount: number;    // Images used this month
  limit: number;         // 10 for free (Month 2+), 999999 for Month 1 or premium
  limitReached: boolean;
  graceUnlocksUsed: number;  // 0, 1, or 2
  graceUnlocksRemaining: number;  // 2, 1, or 0
  daysUntilReset: number;
  images: Array<{
    imageId: string;
    presignedUrl: string;  // For download
    filename: string;
    fileSize: number;
    createdAt: string;
  }>;
}
```

**Logic:**
1. Query `referral_images_accounts` for tier
2. Query `referral_images_usage` for current month count
3. Determine limit based on:
   - If premium tier → limit = unlimited (999999)
   - If free tier + Month 1 → limit = unlimited
   - If free tier + Month 2+ → limit = 10 + (graceUnlocksUsed × 10)
4. Query `referral_images_uploads` for images from last 24h
5. Generate presigned download URLs for each image
6. Return status

**Used by:**
- Desktop page (polls every 3 seconds for new images)
- Mobile capture page (shows usage counter)

---

#### **3. POST `/api/referral-images/upload`**
**Purpose:** Upload and process referral image from mobile

**Request:**
```typescript
{
  userId: string;
  imageData: string;  // Base64-encoded image
  filename: string;
  format: string;  // HEIC, JPEG, PNG, etc.
}
```

**Response:**
```typescript
{
  success: boolean;
  imageId: string;
  presignedUrl: string;  // For immediate viewing
  limitReached: boolean;
  showUpgradeModal: boolean;
  graceUnlocksRemaining: number;
}
```

**Logic:**
1. Check current month usage and tier
2. **If limit reached:**
   - If premium tier → Allow upload
   - If free tier + Month 1 → Allow upload
   - If free tier + Month 2+ and under limit → Allow upload
   - If free tier + over limit → Return `limitReached: true`, `showUpgradeModal: true`
3. **Process image:**
   - Decode base64
   - Convert to JPEG (if HEIC/PNG) using Sharp
   - Compress to <500KB, max 1920px, 85% quality
   - Generate UUID for imageId
4. **Upload to S3:**
   - Path: `{userId}/{timestamp}-{imageId}.jpg`
   - Set 24h expiry metadata
5. **Update database:**
   - Insert into `referral_images_uploads`
   - Increment `image_count` in `referral_images_usage`
6. Generate presigned download URL
7. Return response

---

#### **4. POST `/api/referral-images/unlock-grace`**
**Purpose:** Grant 10 more free images (grace unlock)

**Request:**
```typescript
{
  userId: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  graceUnlocksUsed: number;  // 1 or 2
  graceUnlocksRemaining: number;  // 1 or 0
  newLimit: number;  // 20 or 30
}
```

**Logic:**
1. Query `referral_images_usage` for current month
2. Check `grace_unlocks_used` (must be <2)
3. If <2:
   - Increment `grace_unlocks_used` by 1
   - Update database
   - Return new limit (10 + graceUnlocksUsed × 10)
4. If ≥2:
   - Return error: "Maximum grace unlocks reached"

---

#### **5. POST `/api/referral-images/upgrade/checkout`**
**Purpose:** Create Stripe checkout session for $50 upgrade

**Request:**
```typescript
{
  userId: string;
  email: string;
}
```

**Response:**
```typescript
{
  checkoutUrl: string;  // Stripe checkout page URL
}
```

**Logic:**
1. Create Stripe checkout session:
   - Product: "GP Referral Images - Unlimited"
   - Price: $50 one-time
   - Success URL: `/referral-images/success?session_id={CHECKOUT_SESSION_ID}`
   - Cancel URL: `/referral-images/desktop?u={userId}`
   - Metadata: `{ userId, email }`
2. Return checkout URL

---

#### **6. POST `/api/referral-images/upgrade/webhook`**
**Purpose:** Stripe webhook handler for successful payments

**Request:** Stripe webhook event (checkout.session.completed)

**Logic:**
1. Verify Stripe webhook signature
2. Extract `userId` from metadata
3. Update `referral_images_accounts`:
   - Set `tier = 'premium'`
   - Set `upgraded_at = CURRENT_TIMESTAMP`
   - Set `stripe_payment_id = {paymentIntentId}`
4. Send confirmation email:
   ```
   Subject: Thank you for supporting GP Referral Images!
   
   Hi [Name],
   
   Your support means everything. You now have:
   
   ✓ Unlimited referral images forever
   ✓ All future features automatically (annotation, PDF, etc.)
   ✓ Priority early access to our Inbox AI tool
   
   Thank you for supporting GP-built healthcare solutions.
   
   Dr. [Your Name]
   ```

---

#### **7. GET `/api/referral-images/download/{imageId}`**
**Purpose:** Download single image as JPEG

**Response:** JPEG file with proper filename

**Logic:**
1. Query `referral_images_uploads` for imageId
2. Verify image belongs to requesting user (userId validation)
3. Generate presigned S3 download URL
4. Redirect to presigned URL with proper Content-Disposition header

---

#### **8. GET `/api/referral-images/download-zip/{userId}`**
**Purpose:** Download all current images as ZIP

**Response:** ZIP file containing all images

**Logic:**
1. Query `referral_images_uploads` for all images from last 24h for userId
2. Download images from S3
3. Create ZIP archive using JSZip
4. Stream ZIP to client with filename: `referral-images-{date}.zip`

---

### Image Processing Pipeline

**Mobile Capture → S3 Upload Flow:**

```typescript
// Mobile client (camera capture)
async function captureImage() {
  const imageFile = await navigator.mediaDevices.getUserMedia({video: true});
  const canvas = createCanvasFromVideo(imageFile);
  const base64Image = canvas.toDataURL('image/jpeg', 0.9);
  
  // Upload to API
  const response = await fetch('/api/referral-images/upload', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      imageData: base64Image,
      filename: 'capture.jpg',
      format: 'JPEG'
    })
  });
  
  if (response.limitReached) {
    showUpgradeModal();
  }
}
```

**Server-side processing (API route):**

```typescript
import sharp from 'sharp';

async function processImage(base64Image: string) {
  // Decode base64
  const buffer = Buffer.from(base64Image.split(',')[1], 'base64');
  
  // Process with Sharp
  const processed = await sharp(buffer)
    .rotate() // Auto-rotate based on EXIF
    .resize(1920, 1920, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({
      quality: 85,
      progressive: true
    })
    .toBuffer();
  
  // Verify size <500KB
  if (processed.length > 500 * 1024) {
    // Reduce quality further if needed
    processed = await sharp(buffer)
      .resize(1920, 1920, { fit: 'inside' })
      .jpeg({ quality: 70 })
      .toBuffer();
  }
  
  return processed;
}
```

**S3 Upload:**

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

async function uploadToS3(imageBuffer: Buffer, userId: string, imageId: string) {
  const s3Key = `${userId}/${Date.now()}-${imageId}.jpg`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: 'clinicpro-referral-images',
    Key: s3Key,
    Body: imageBuffer,
    ContentType: 'image/jpeg',
    ServerSideEncryption: 'AES256',
    Metadata: {
      userId,
      imageId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  }));
  
  return s3Key;
}
```

---

### Desktop Real-Time Sync

**Polling mechanism (simple, no WebSocket needed):**

```typescript
// Desktop page
function useImagePolling(userId: string) {
  const [images, setImages] = useState([]);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch(`/api/referral-images/status/${userId}`);
      const data = await response.json();
      setImages(data.images);
    }, 3000); // Poll every 3 seconds
    
    return () => clearInterval(interval);
  }, [userId]);
  
  return images;
}
```

**Why polling instead of WebSocket:**
- ✅ Simpler implementation (no WebSocket infrastructure)
- ✅ Sufficient for use case (not real-time chat, just image display)
- ✅ Works reliably across all browsers/networks
- ✅ No WebSocket connection management complexity
- ⚠️ Slightly more server load (acceptable at <1000 users scale)

---

### Code Reuse from `/medtech-images`

**Existing code to copy (~70-80% reuse):**

```
FROM /medtech-images → TO /referral-images

✓ QR code generation component → Optional QR display
✓ Mobile camera capture UI → Capture page
✓ Image upload logic → API route
✓ S3 integration code → Storage layer
✓ Image compression (Sharp) → Processing pipeline
✓ Real-time sync (polling) → Desktop updates
✓ Image gallery display → Desktop gallery
```

**Existing code to REMOVE:**
```
❌ Medtech ALEX API integration
❌ FHIR DocumentReference creation
❌ Launch context handling (encounterId, patientId, facilityId)
❌ PMS-specific authentication
❌ Redis session management (using permanent links instead)
```

**New code to BUILD:**
```
✅ Freemium usage tracking
✅ Limit enforcement logic
✅ Grace unlock system
✅ Stripe payment integration
✅ Email automation (welcome, limits, conversion)
✅ Landing page + signup flow
✅ Permanent link generation
✅ Premium tier management
```

---

### Libraries & Dependencies

**Required (install):**
```json
{
  "dependencies": {
    "sharp": "^0.33.0",           // Image processing
    "jszip": "^3.10.1",           // ZIP creation
    "@stripe/stripe-js": "^2.2.0", // Stripe checkout
    "stripe": "^14.7.0",          // Stripe backend
    "html5-qrcode": "^2.3.8",     // QR scanning (optional feature)
    "qrcode.react": "^3.1.0"      // QR generation (optional)
  }
}
```

**Already in repo (reuse):**
```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "@clerk/nextjs": "^5.x",      // User authentication
    "@aws-sdk/client-s3": "^3.x", // S3 integration
    "drizzle-orm": "^0.x",        // Database ORM
    "tailwindcss": "^3.x"         // Styling
  }
}
```

---

## 6. FEATURE SCOPE

### MVP (Launch - Week 1)

**Core Features (Must Have):**
- ✅ Email signup (email + optional name)
- ✅ Permanent desktop + mobile links generation
- ✅ Welcome email with links
- ✅ Mobile camera capture (native phone camera)
- ✅ Image processing: HEIC/PNG → JPEG, <500KB, 1920px, 85% quality
- ✅ S3 upload with 24h auto-delete
- ✅ Desktop real-time image gallery (3-second polling)
- ✅ Individual image download (JPEG)
- ✅ ZIP download (all images)
- ✅ Usage tracking (images per month)
- ✅ Freemium limits: Month 1 unlimited, Month 2+ 10 images
- ✅ Grace unlock system (2× "give me 10 more")
- ✅ Upgrade modal (personal support framing)
- ✅ Stripe $50 one-time checkout
- ✅ Premium tier unlock (unlimited forever)
- ✅ Email sequence (welcome, tips, limit notifications)
- ✅ Legal disclaimers at signup (patient consent, not clinical record, 24h storage)
- ✅ Landing page with value proposition
- ✅ Email/WhatsApp/Copy link sharing from desktop
- ✅ Save to home screen prompt (mobile)

**Cut from MVP (Future V1/V2):**
- ❌ QR code display (optional, not required for MVP)
- ❌ In-browser QR scanner
- ❌ Annotation tools (arrows, text, redaction)
- ❌ PDF export
- ❌ Image editing (crop, rotate, brightness)
- ❌ Individual image delete/reorder
- ❌ Advanced compression options (quality slider)
- ❌ Share links with expiry
- ❌ Session resume via email link
- ❌ Medtech integration tier
- ❌ Batch upload
- ❌ Extended storage beyond 24h

---

### V1 Features (Post-Launch, Month 2-3)

**Priority 1 (High demand expected):**
- Annotation tools: Arrows, circles, text, redaction (premium feature)
- PDF export (premium feature)
- QR code display as alternative to link sharing

**Priority 2 (Nice to have):**
- Individual image management (delete, reorder)
- Advanced compression options (quality slider)
- Image editing (crop, rotate, brightness adjust)

**Priority 3 (If demand exists):**
- Share links with 7-day expiry (for sending to colleagues)
- Extended storage options (7-day retention for premium users)
- Batch upload from desktop

---

### V2/Future Features

**Medtech Integration Tier (if requested):**
- Direct commit to Medtech Evolution via ALEX FHIR API
- Practice-wide deployment
- Practice manager dashboard
- Pricing: TBD (likely $299-999 one-time setup, 30% to Medtech)

**Inbox AI Integration (2027):**
- Deprecate standalone referral images tool
- Integrate referral images as native Inbox AI feature
- Link images to patient context from inbox messages
- Outcome tracking: Image → GP decision → Patient outcome

**Other Future Ideas:**
- Templates (common referral types: skin lesion, wound, rash, etc.)
- Voice notes attached to images
- Multi-language support
- Mobile app (instead of web app)
- Desktop app (Electron)

---

## 7. LAUNCH STRATEGY

### Timeline: Immediate Launch (ASAP)

**48-Hour Build:**
- Day 1 (8 hours): Copy `/medtech-images` code, remove Medtech dependencies, test basic flow
- Day 2 (8 hours): Build freemium logic, Stripe integration, email automation, landing page

**7-Day Launch Cycle:**
- Day 3: Deploy to production, internal testing
- Day 4: Soft launch to 5-10 GP friends (private links)
- Day 5: Iterate based on feedback, fix bugs
- Day 6-7: Public launch to GP Facebook groups, PHOs, colleges

**No Extended Beta Period:**
- Launch publicly immediately after soft validation
- Iterate based on live feedback
- Speed > perfection (it's a simple tool)

---

### Launch Channels

#### **Primary Channel: GP Facebook Groups**

**Target Groups:**
- GPs for GPs (New Zealand)
- RNZCGP online community
- Other NZ GP communities

**Post Template:**
```
Free tool for referral photos - built by a fellow GP

After seeing complaints about MedImage/QuickShot, I built a free alternative:

✓ Phone to desktop in 30 seconds
✓ Auto-resized for e-referrals (<500KB, no more rejections)
✓ No installation, no credit card

Try it: clinicpro.app/referral-images

Built by Dr. [Your Name], GP at [Your Practice]. 
Sick of emailing myself referral photos.

Feedback welcome 👍

#NZGPs #ReferralWorkflow #BuiltByAGP
```

**Posting Strategy:**
- Post in 2-3 GP groups on Day 6 (Saturday morning when GPs check Facebook)
- Respond to comments quickly
- Engage authentically (not corporate marketing tone)
- Share user testimonials in comments as they come in

**Expected Response:**
- 100-200 post views per group
- 10-15% click-through (10-30 signups per group)
- Target: 50 signups in first week

---

#### **Secondary Channel: Direct GP Outreach**

**Email to GP Colleagues (10-20 contacts):**
```
Subject: I built a quick tool for referral photos

Hey [Name],

I got sick of the clunky workflow for referral photos 
(email to yourself, save, resize, upload...) so I built 
something simpler.

Try it: clinicpro.app/referral-images

Let me know if it's useful or if I've missed something 
obvious. Honest feedback wanted.

Cheers,
[Your Name]
```

**Timing:** Day 4 (soft launch phase)

**Expected Response:**
- 50-70% will try it (5-14 signups)
- High-quality feedback (these are trusted colleagues)
- Testimonials for public launch

---

#### **Tertiary Channel: PHOs (Primary Health Organisations)**

**Email to PHO Contacts:**
```
Subject: Free referral photo tool for your GPs

Hi [Name],

I've built a free clinical photo tool for GPs to streamline 
referral workflows:

• Phone to desktop in 30 seconds
• Auto-resized for e-referrals (<500KB)
• Secure 24-hour storage
• No installation required

clinicpro.app/referral-images

Would you be open to sharing this with your GP network? 
Happy to provide more details or demo if helpful.

Cheers,
Dr. [Your Name]
[Your Practice]
```

**Timing:** Day 6-7 (public launch phase)

**Expected Response:**
- 1-2 PHOs may share in their newsletters
- Potential 20-50 signups if featured
- Establishes credibility with healthcare organizations

---

#### **Quaternary Channel: GP Colleges**

**Email to College Contacts (RNZCGP, etc.):**
```
Subject: GP workflow tool - feedback welcome

Hi [Name],

I'm a GP who's built a free tool to streamline the referral 
photo workflow (email to self → download → resize → upload).

clinicpro.app/referral-images

I'd value feedback from the college perspective - happy to 
discuss further if there's interest.

Cheers,
Dr. [Your Name]
```

**Timing:** Week 2 (after initial launch validation)

**Expected Response:**
- Lower response rate (institutions move slowly)
- Potential long-term partnership opportunities
- Credibility boost if endorsed

---

### Launch Messaging Framework

#### **Core Messages (All Channels):**

**Message 1: Speed**
"Phone to desktop in 30 seconds" (vs 5-15 minutes currently)

**Message 2: Pain Relief**
"Stop emailing yourself referral photos"

**Message 3: Quality**
"Auto-resized for e-referrals (<500KB) - no more rejections"

**Message 4: Security**
"Secure 24-hour storage, then auto-deleted"

**Message 5: Peer Credibility**
"Built by a GP, for GPs" / "I was sick of the workflow"

**Message 6: No Friction**
"Free, no credit card, no installation"

---

#### **Positioning vs Competitors:**

**MedImage:**
- "MedImage works, but costs money from day one. This is free."
- "Built by a GP who uses it daily, not a corporate tool."

**QuickShot:**
- "QuickShot is good if your practice already has it. This works for individual GPs too."
- "No practice manager approval needed - just sign up and use it."

**Indici:**
- "Indici is powerful but expensive. This solves one problem simply."

**General Alternative:**
- "If you're happy with your current workflow, stick with it. But if you're emailing photos to yourself, there's a better way."

---

### Success Metrics (Week 1)

**Acquisition:**
- ✅ 50 signups (10/day average)
- ✅ 70%+ activation (35+ capture 1+ image)
- ✅ 30%+ source from GP Facebook (organic social proof)

**Engagement:**
- ✅ 10+ images captured per active user (validates it solves real problem)
- ✅ 60%+ of users capture images in first 24 hours (low friction)
- ✅ 5+ users capture 10+ images in Week 1 (power users who will hit limits soon)

**Quality:**
- ✅ 3-5 positive testimonials ("This saved me so much time!")
- ✅ <5 bug reports
- ✅ Image upload success rate >95%

**Conversion (Aspirational for Week 1):**
- ✅ 1-2 premium conversions ($50-100 revenue)
- ✅ 0 complaints about pricing

**Referral:**
- ✅ 3-5 users refer colleagues (organic word-of-mouth starting)

---

### Growth Tactics (Week 2-4)

#### **Week 2: Optimize & Testimonials**
- Fix any bugs from Week 1
- Collect and share testimonials in GP groups
- Post update: "50+ GPs using GP Referral Images - thank you!"
- Identify power users, ask for detailed feedback

#### **Week 3: Referral Program (Optional)**
- Consider incentive: "Refer 3 GPs, get premium free"
- Create shareable referral links
- Email existing users asking for referrals

#### **Week 4: Content Marketing**
- Write blog post: "How GPs waste 10 hours/month on referral photos"
- Share in GP communities
- Include demo video/screenshots
- SEO optimization for "GP referral photos NZ"

#### **Month 2-6: Sustained Growth**
- Monthly posts in GP Facebook groups
- Case studies from high-usage practices
- Potential small Facebook ad budget ($200-500 test)
- PHO newsletter features
- GP conference mentions (if applicable)

---

## 8. SUCCESS METRICS & KPIs

### Primary Metrics (Track Weekly)

#### **Acquisition Metrics**
| Metric | Week 1 Target | Month 1 Target | Month 6 Target |
|--------|---------------|----------------|----------------|
| New signups | 50 | 100 | 500 |
| Signup sources | 30% FB, 40% Direct, 30% Other | 40% FB, 30% Direct, 30% Referral | 50% Referral, 30% FB, 20% Other |
| Landing page conversion | 30%+ | 35%+ | 40%+ |

#### **Activation Metrics**
| Metric | Week 1 Target | Month 1 Target | Month 6 Target |
|--------|---------------|----------------|----------------|
| % users capture 1+ image | 70% | 75% | 80% |
| % users capture 5+ images | 40% | 50% | 60% |
| Time to first capture | <24h (80%) | <24h (85%) | <24h (90%) |

#### **Engagement Metrics**
| Metric | Week 1 Target | Month 1 Target | Month 6 Target |
|--------|---------------|----------------|----------------|
| Avg images per active user | 8-10 | 10-12 | 12-15 |
| % users active in Month 2 | N/A | 60% | 70% |
| Days between captures | <7 days | <5 days | <4 days |

#### **Conversion Metrics**
| Metric | Week 1 Target | Month 1 Target | Month 6 Target |
|--------|---------------|----------------|----------------|
| % users hit limit Month 2+ | N/A | 70% | 75% |
| Limit → Premium conversion | N/A | 30% | 35-40% |
| Premium users | 1-2 | 5 | 70 |
| Revenue | $50-100 | $250 | $3,500 |

---

### Secondary Metrics

#### **Product Quality**
- Image upload success rate: >95%
- Average upload time: <10 seconds
- Bug reports per week: <5
- User-reported issues resolution time: <48 hours

#### **Email Engagement**
- Email open rate: 40%+
- Email click-through rate: 15%+
- Unsubscribe rate: <2%

#### **Referral/Viral**
- % users who refer others: 20%+
- Viral coefficient: >1.1 (each user brings 1.1 more)
- Word-of-mouth mentions in GP groups: 5+ posts

---

### Red Flags (Pivot Indicators)

**If at Month 3:**

❌ **<100 total signups** → Weak demand, poor product-market fit  
**Action:** User interviews, identify root cause, consider pivot

❌ **<50% activation rate** → Product doesn't solve problem  
**Action:** UX review, onboarding improvements, feature validation

❌ **<20% conversion rate** → Pricing/value mismatch  
**Action:** A/B test pricing ($30 vs $50), adjust limit (5 vs 10), survey non-converters

❌ **>50% churn Month 2** → Product not sticky  
**Action:** Identify why users stop (workflow doesn't fit, too complex, competitor better?)

❌ **No organic growth** → No word-of-mouth  
**Action:** Referral incentives, testimonials, improve social sharing

---

### Decision Point: Month 3 Review

#### **Continue Investing If:**
- ✅ 200+ signups
- ✅ 30%+ conversion rate
- ✅ Organic growth happening (referrals, GP group mentions)
- ✅ Positive feedback ("This saves me time!")
- ✅ Revenue covering costs + funding Inbox AI

**Action:** Double down on growth, add V1 features (annotation, PDF), prepare for Inbox AI integration

---

#### **Pivot to Inbox AI If:**
- ❌ <100 signups
- ❌ <20% conversion
- ❌ High churn (users stop after Month 1)
- ❌ No organic traction
- ❌ Lukewarm feedback ("It's okay, but...")

**Action:** Archive project, focus 100% on Inbox AI, use learnings from this experiment (email automation, GP messaging, Stripe integration)

---

### Financial Projections

#### **Conservative Scenario (6 Months)**
- 500 total signups
- 350 active users (70%)
- 250 regular users (50% - capture 5+ images/month)
- 200 hit 10/month limit (80% of regular users, Month 2+)
- 70 convert to premium (35% conversion rate)

**Revenue:** 70 × $50 = **$3,500**

---

#### **Optimistic Scenario (6 Months)**
- 800 total signups (strong word-of-mouth)
- 560 active users (70%)
- 400 regular users (50%)
- 320 hit limit (80%)
- 128 convert (40% conversion rate)

**Revenue:** 128 × $50 = **$6,400**

---

#### **Cost Structure (Year 1)**
- Hosting/infrastructure: $300/year (AWS S3, database, Vercel)
- Domain/SSL: $50/year
- Email service: $200/year (Resend or equivalent)
- Stripe fees: 2.9% + $0.30 per transaction (~$150 on $5K revenue)

**Total costs Year 1:** ~$700

**Net revenue (6 months, conservative):** $3,500 - $350 = **$3,150**

---

#### **Use of Revenue**
1. $500 → Cover infrastructure costs
2. $1,000 → GP acquisition (Facebook ads, referral incentives if needed)
3. $1,500 → Inbox AI development fund
4. $150 → Buffer/contingency

**Do NOT:**
- Pay founder salary (reinvest entirely)
- Hire employees (too early, solo operation)
- Over-invest in this tool (it's a stepping stone)

---

## 9. IMPLEMENTATION CHECKLIST

### Phase 1: Foundation Setup (Day 0 - Before Build)

**Technical Prerequisites:**
- [ ] Verify access to existing `/medtech-images` codebase
- [ ] Confirm AWS S3 bucket access (or create new bucket: `clinicpro-referral-images`)
- [ ] Set up S3 lifecycle policy (24-hour auto-delete)
- [ ] Verify Clerk authentication working (existing ClinicPro)
- [ ] Confirm Stripe account active
- [ ] Create Stripe product: "GP Referral Images - Unlimited" ($50 one-time)
- [ ] Set up Stripe webhook endpoint for `checkout.session.completed`
- [ ] Verify email service configured (Resend or existing)
- [ ] Confirm database access (Neon PostgreSQL)
- [ ] Verify Vercel deployment pipeline working

**Content Preparation:**
- [ ] Write landing page copy (headline, features, CTA)
- [ ] Draft welcome email template
- [ ] Draft email sequence (5 emails: welcome, tips, value, limit, reset)
- [ ] Write upgrade modal copy (personal support framing)
- [ ] Create legal disclaimers (patient consent, not clinical record, 24h storage)
- [ ] Prepare soft launch email to GP colleagues
- [ ] Draft GP Facebook post
- [ ] Write support FAQ (initial version)

**Design Assets:**
- [ ] Landing page mockup (Figma or sketch)
- [ ] Desktop page layout (link sharing, image gallery)
- [ ] Mobile capture page UI (camera, thumbnails, done button)
- [ ] Upgrade modal design
- [ ] Email templates HTML (branded)

---

### Phase 2: Database & Backend (Day 1, Hours 1-4)

**Database Schema:**
- [ ] Create `referral_images_usage` table
- [ ] Create `referral_images_uploads` table
- [ ] Create `referral_images_accounts` table
- [ ] Set up indexes (user_id, month, expires_at)
- [ ] Create S3 cleanup cron job (daily, delete expired images)
- [ ] Test database inserts/queries

**API Routes - Core:**
- [ ] `POST /api/referral-images/signup` - Account creation
- [ ] `GET /api/referral-images/status/{userId}` - Usage status + images
- [ ] `POST /api/referral-images/upload` - Image upload + processing
- [ ] `POST /api/referral-images/unlock-grace` - Grace unlock (10 more images)
- [ ] `GET /api/referral-images/download/{imageId}` - Single image download
- [ ] `GET /api/referral-images/download-zip/{userId}` - ZIP download

**API Routes - Premium:**
- [ ] `POST /api/referral-images/upgrade/checkout` - Stripe checkout session
- [ ] `POST /api/referral-images/upgrade/webhook` - Stripe webhook handler

**Image Processing:**
- [ ] Set up Sharp image processing pipeline
- [ ] Implement HEIC → JPEG conversion
- [ ] Implement compression (<500KB, 1920px, 85% quality)
- [ ] Implement auto-rotation (EXIF-based)
- [ ] Test with various formats (HEIC, PNG, JPEG, large files)

**S3 Integration:**
- [ ] Implement presigned URL generation (upload + download)
- [ ] Implement S3 upload with metadata (userId, imageId, expiresAt)
- [ ] Test 24-hour lifecycle deletion
- [ ] Verify CORS configuration

---

### Phase 3: Frontend - Landing & Signup (Day 1, Hours 5-8)

**Landing Page (`/referral-images`):**
- [ ] Hero section (headline, value props, CTA)
- [ ] How it works (3-step explanation)
- [ ] What's included (features list, emphasize free)
- [ ] Testimonials section (placeholder for post-launch)
- [ ] CTA section ("Get Started Free")
- [ ] Footer (links, contact)
- [ ] Mobile responsive design
- [ ] SEO meta tags (title, description)

**Signup Modal/Page:**
- [ ] Email input (required)
- [ ] Name input (optional)
- [ ] Disclaimers checkboxes (patient consent, not clinical record, 24h storage)
- [ ] Submit button → Call `/api/referral-images/signup`
- [ ] Success state → "Check your email for links!"
- [ ] Error handling (email already exists, invalid email, etc.)
- [ ] Loading state

**Welcome Email Automation:**
- [ ] Trigger welcome email immediately after signup
- [ ] Include desktop link (bookmark instruction)
- [ ] Include mobile link (save to home screen instruction)
- [ ] Include "How to use" quick guide
- [ ] Test email delivery

---

### Phase 4: Frontend - Desktop Page (Day 2, Hours 1-3)

**Desktop Page (`/referral-images/desktop?u={userId}`):**
- [ ] Validate userId (check if exists in database)
- [ ] Display mobile link (large, copyable)
- [ ] Copy button (copy to clipboard)
- [ ] Email button (pre-filled mailto link)
- [ ] WhatsApp button (pre-filled WhatsApp link)
- [ ] Optional QR code display (toggle to show/hide)
- [ ] "Save to home screen" instructions (collapsible)
- [ ] Image gallery (grid layout, auto-refreshing)
- [ ] Real-time polling (fetch `/api/referral-images/status/{userId}` every 3 seconds)
- [ ] Individual image download (click image → download JPEG)
- [ ] "Download All as ZIP" button
- [ ] Usage counter display (only Month 2+, shows X/10 or unlimited if premium)
- [ ] Settings icon (link to account settings - future feature)
- [ ] Mobile responsive (in case GP opens on mobile)

**Image Gallery Component:**
- [ ] Display thumbnails with filename, size, timestamp
- [ ] Clickable to download or view full-size
- [ ] Loading skeleton while polling
- [ ] Empty state ("No images yet - capture on your phone")
- [ ] Error state (if upload fails)

**Real-Time Sync:**
- [ ] Poll every 3 seconds (useEffect interval)
- [ ] Update image gallery when new images detected
- [ ] Show "New image captured!" toast notification
- [ ] Stop polling if page inactive (visibility API)

---

### Phase 5: Frontend - Mobile Capture (Day 2, Hours 4-6)

**Mobile Capture Page (`/referral-images/capture?u={userId}`):**
- [ ] Validate userId (check if exists)
- [ ] Check usage limit on page load (fetch status)
- [ ] Display usage counter (X/10 or unlimited)
- [ ] "Start Camera" button (first-time users)
- [ ] Camera interface (native `<input type="file" accept="image/*" capture="environment">`)
- [ ] Capture photo → Show thumbnail immediately
- [ ] Upload photo → Call `/api/referral-images/upload`
- [ ] Show upload progress (spinner, percentage)
- [ ] Display captured images (thumbnail gallery below camera)
- [ ] "Done" button → Confirmation message → Link to desktop
- [ ] Error handling (upload failed, limit reached, camera permission denied)

**Save to Home Screen Prompt:**
- [ ] Detect first visit (localStorage flag)
- [ ] Show "Save to Home Screen" instructions after first capture
- [ ] Platform-specific instructions (iOS Safari vs Android Chrome)
- [ ] Dismissible (don't annoy repeat users)

**Limit Hit Flow:**
- [ ] Detect limit reached (from API response)
- [ ] Show upgrade modal (personal support framing)
- [ ] "Support Project - $50" button → Stripe checkout
- [ ] "Give Me 10 More Free" button → Call `/api/referral-images/unlock-grace`
- [ ] Update UI immediately after grace unlock (show new limit: 20 or 30)
- [ ] Hard cap after 2 grace unlocks → "Wait until [date] or upgrade"

---

### Phase 6: Stripe Integration (Day 2, Hours 7-8)

**Checkout Flow:**
- [ ] Create Stripe checkout session (API route)
- [ ] Include userId + email in metadata
- [ ] Set success URL: `/referral-images/success?session_id={CHECKOUT_SESSION_ID}`
- [ ] Set cancel URL: `/referral-images/desktop?u={userId}`
- [ ] Test checkout in Stripe test mode
- [ ] Verify webhook receives `checkout.session.completed` event

**Webhook Handler:**
- [ ] Verify Stripe webhook signature
- [ ] Extract userId from metadata
- [ ] Update database: `tier = 'premium'`, `upgraded_at = now()`, `stripe_payment_id`
- [ ] Send confirmation email (thank you + benefits)
- [ ] Test webhook with Stripe CLI

**Success Page:**
- [ ] Display "Thank you for supporting GP Referral Images!"
- [ ] Confirm benefits (unlimited images, future features, Inbox AI early access)
- [ ] Link back to desktop page
- [ ] Update desktop UI to show "Premium" badge

---

### Phase 7: Email Automation (Day 2, Remaining Time)

**Email Sequences (Set Up in Resend/SendGrid):**
- [ ] Email 1: Welcome (trigger: signup, immediate)
- [ ] Email 2: Usage tip (trigger: 1+ image captured, delay: 3 days)
- [ ] Email 3: Value reinforcement (trigger: 3+ images captured, delay: 7 days)
- [ ] Email 4: Limit hit (trigger: 10 images in Month 2+, immediate)
- [ ] Email 5: Follow-up (trigger: limit hit + no upgrade, delay: 24 hours)
- [ ] Email 6: Month reset (trigger: new month + free tier, immediate)

**Email Templates (HTML):**
- [ ] Create branded email templates (ClinicPro design)
- [ ] Test on multiple email clients (Gmail, Outlook, Apple Mail)
- [ ] Include unsubscribe link in every email
- [ ] Test personalization variables (name, imageCount, etc.)

**Automation Logic:**
- [ ] Set up conditional triggers (only send if user meets criteria)
- [ ] Prevent duplicate emails (e.g., don't send tip email if already upgraded)
- [ ] Test entire sequence manually
- [ ] Set up email analytics (open rate, click rate)

---

### Phase 8: Testing & QA (Day 3)

**Functional Testing:**
- [ ] End-to-end signup → capture → download flow (desktop + mobile)
- [ ] Test all email sequences trigger correctly
- [ ] Test limit enforcement (10 images → modal → grace unlock → repeat → hard cap)
- [ ] Test Stripe checkout → webhook → premium unlock
- [ ] Test image processing (HEIC, PNG, large files, rotation)
- [ ] Test ZIP download (single image, multiple images, 20+ images)
- [ ] Test link sharing (email, WhatsApp, copy, QR)
- [ ] Test save to home screen (iOS + Android)

**Cross-Device Testing:**
- [ ] iOS Safari (iPhone)
- [ ] Android Chrome (Samsung/Google)
- [ ] Desktop Chrome
- [ ] Desktop Safari
- [ ] Desktop Firefox
- [ ] Desktop Edge

**Performance Testing:**
- [ ] Image upload speed (<10 seconds for 5MB photo)
- [ ] Desktop polling latency (images appear within 5 seconds of capture)
- [ ] Landing page load time (<2 seconds)
- [ ] ZIP download speed (20 images in <30 seconds)

**Security Testing:**
- [ ] Verify userId cannot be guessed (128-bit UUID)
- [ ] Test S3 presigned URLs expire correctly
- [ ] Verify images auto-delete after 24 hours
- [ ] Test rate limiting (prevent abuse)
- [ ] Verify Stripe webhook signature validation
- [ ] Test SQL injection prevention (parameterized queries)

**Edge Cases:**
- [ ] What happens if user signs up with same email twice? (prevent duplicates)
- [ ] What if image upload fails? (show error, retry option)
- [ ] What if Stripe webhook fails? (manual verification process)
- [ ] What if grace unlock API fails? (show error, contact support)
- [ ] What if user captures 50+ images in one session? (handle large ZIP)

---

### Phase 9: Deployment (Day 3)

**Production Deployment:**
- [ ] Deploy to Vercel (production environment)
- [ ] Set environment variables (AWS keys, Stripe keys, database URL, email API key)
- [ ] Verify custom domain: `clinicpro.app/referral-images`
- [ ] Test SSL certificate
- [ ] Enable Vercel analytics
- [ ] Set up error tracking (Sentry or similar)

**Database Migration:**
- [ ] Run production database migrations
- [ ] Verify tables created correctly
- [ ] Test database connection from API routes
- [ ] Set up automated backups

**S3 Production Setup:**
- [ ] Create production S3 bucket (if separate from staging)
- [ ] Configure lifecycle policy (24-hour delete)
- [ ] Set up CORS for production domain
- [ ] Verify IAM permissions

**Monitoring Setup:**
- [ ] Set up uptime monitoring (UptimeRobot or similar)
- [ ] Configure error alerts (email on critical errors)
- [ ] Set up log aggregation (Vercel logs or CloudWatch)
- [ ] Create dashboard for key metrics (signups, uploads, conversions)

---

### Phase 10: Soft Launch (Day 4-5)

**Internal Testing:**
- [ ] Use the tool yourself for real referral workflow
- [ ] Capture 10+ images across multiple days
- [ ] Test limit flow yourself (hit limit, unlock grace, upgrade)
- [ ] Verify all emails received correctly

**Friend Testing:**
- [ ] Email 5-10 GP colleagues with soft launch request
- [ ] Provide testing instructions (signup → capture → feedback)
- [ ] Ask specific questions:
  - Was signup easy?
  - Was mobile link easy to access?
  - Was image quality acceptable?
  - Would you pay $50 for unlimited?
  - What's confusing or frustrating?
- [ ] Collect feedback via Google Form or email
- [ ] Monitor usage (how many images do they capture?)

**Feedback Implementation:**
- [ ] Fix critical bugs (anything preventing core workflow)
- [ ] Iterate on confusing UX (if multiple testers mention same issue)
- [ ] Adjust messaging if value prop unclear
- [ ] **Don't** add new features (resist scope creep)

**Collect Testimonials:**
- [ ] Ask happy testers: "Can I quote your feedback?"
- [ ] Screenshot positive comments for landing page
- [ ] Prepare 2-3 testimonials for public launch

---

### Phase 11: Public Launch (Day 6-7)

**Pre-Launch Checklist:**
- [ ] All critical bugs fixed
- [ ] Testimonials added to landing page
- [ ] Support email monitored (support@clinicpro.app)
- [ ] Analytics tracking verified
- [ ] Payment processing tested (Stripe live mode)
- [ ] Email sequences tested end-to-end

**Launch Day Tasks:**
- [ ] Post in GP Facebook groups (2-3 groups, morning NZ time)
- [ ] Email GP colleagues (broader list, 20-30 contacts)
- [ ] Email PHO contacts (3-5 organizations)
- [ ] Post on LinkedIn (personal profile)
- [ ] Monitor signups real-time (first few hours critical)

**First 24 Hours:**
- [ ] Respond to all comments/questions within 1 hour
- [ ] Monitor error logs for unexpected issues
- [ ] Track signup sources (where are people coming from?)
- [ ] Engage with early users (thank them, ask for feedback)
- [ ] Share early wins ("10 GPs using in first hour!")

**First Week:**
- [ ] Daily signup count tracking
- [ ] Daily usage monitoring (how many images captured?)
- [ ] Collect testimonials from early users
- [ ] Iterate on messaging based on feedback
- [ ] Fix non-critical bugs
- [ ] Plan Week 2 growth tactics

---

## 10. OPEN QUESTIONS & RISKS

### Strategic Open Questions

**Question 1: Medtech Relationship**
- Should you proactively inform Alex/Medtech team about this standalone tool?
- **Risk:** They might view it as competitive with their ecosystem
- **Opportunity:** Could strengthen relationship ("Look, we're building audience for future Medtech integration")
- **Current decision:** Don't mention unless asked (Option B from clarifications)

**Question 2: Geographic Expansion**
- Current: Open to any GP globally
- **Risk:** Legal/compliance varies by country (GDPR, HIPAA, etc.)
- **Opportunity:** Larger market if it works internationally
- **Mitigation:** Start NZ-focused, expand if demand exists elsewhere

**Question 3: Inbox AI Mention Timing**
- Current: Brief mention in $50 upgrade modal
- **Risk:** Might confuse users ("What's Inbox AI? I thought this was referral images?")
- **Opportunity:** Creates curiosity and forward momentum
- **Mitigation:** Keep it very brief, don't over-explain

---

### Technical Risks

**Risk 1: S3 Costs Exceed Budget**
- **Likelihood:** Low (24h auto-delete limits accumulation)
- **Impact:** Medium (could eat into revenue)
- **Mitigation:** 
  - Monitor S3 usage weekly
  - Set billing alerts ($50, $100, $200)
  - Reduce storage window to 12h if costs spike
  - Implement more aggressive compression if needed

**Risk 2: Image Compression Quality Complaints**
- **Likelihood:** Medium (some GPs may want higher quality)
- **Impact:** Low (can adjust compression settings)
- **Mitigation:**
  - Start at 85% quality, 1920px, <500KB
  - Monitor feedback for "image quality too low" complaints
  - If <5% complain → keep current settings
  - If >10% complain → adjust to 90% quality or allow quality toggle

**Risk 3: Mobile Camera Access Issues**
- **Likelihood:** Medium (iOS/Android permissions can be finicky)
- **Impact:** High (blocks core workflow)
- **Mitigation:**
  - Clear permission request messaging
  - Fallback to file upload (`<input type="file">` without `capture` attribute)
  - Troubleshooting guide in FAQ
  - Support email for edge cases

**Risk 4: Polling Performance at Scale**
- **Likelihood:** Low (polling every 3 seconds, <1000 users unlikely in first 6 months)
- **Impact:** Medium (server load, costs)
- **Mitigation:**
  - Start with polling, it's simple and works
  - If >500 concurrent users → consider WebSocket
  - Implement backoff (increase interval to 5s if no new images for 1 min)

---

### Business Risks

**Risk 1: Low Signup Numbers (<100 in 3 months)**
- **Root causes:** Weak demand, poor messaging, limited reach
- **Likelihood:** Medium (new product, unknown brand)
- **Mitigation:**
  - Soft launch feedback to validate messaging
  - A/B test headlines on landing page
  - Increase marketing spend (Facebook ads $200-500)
  - Ask non-signups: "Why didn't you try it?"
- **Pivot trigger:** <50 signups by Month 2

**Risk 2: High Signup but Low Activation (<50% capture images)**
- **Root causes:** UX friction, unclear value prop, technical issues
- **Likelihood:** Medium
- **Mitigation:**
  - Improve onboarding (welcome email clarity, instructions)
  - Simplify mobile link access (better email, WhatsApp share)
  - User interviews to identify friction
  - Track where users drop off (signup → email → mobile → capture)
- **Pivot trigger:** <40% activation by Month 2

**Risk 3: Low Conversion Rate (<20%)**
- **Root causes:** Pricing too high, limit too generous, messaging ineffective
- **Likelihood:** Medium (conversion is hardest part)
- **Mitigation:**
  - A/B test pricing: $30 vs $40 vs $50
  - A/B test limit: 5 vs 10 images/month
  - Survey non-converters: "Why didn't you upgrade?"
  - Adjust personal support messaging
  - Add more value to premium (e.g., annotation tools sooner)
- **Pivot trigger:** <15% conversion by Month 3

**Risk 4: Competitor Launches Similar Free Tool**
- **Likelihood:** Medium (market gap exists, others will notice)
- **Impact:** High (erodes differentiation)
- **Mitigation:**
  - Speed to market (launch ASAP before competitors)
  - "Built by a GP" differentiation (they can't copy authenticity)
  - Community building (personal relationships > corporate tools)
  - Rapid iteration (stay ahead on features)
  - Transition to Inbox AI before competition saturates
- **Response:** Double down on personal brand, community, Inbox AI integration

**Risk 5: Medtech Becomes Hostile**
- **Likelihood:** Low (complementary tool, not competitive with PMS)
- **Impact:** High (could block ALEX API access for future Medtech integration)
- **Mitigation:**
  - Don't actively position against Medtech
  - If asked, frame as "building audience for future Medtech integration"
  - Standalone tool doesn't require Medtech API (no technical dependency)
  - Worst case: Abandon Medtech integration tier, keep standalone viable
- **Response:** Pivot to multi-PMS strategy (support multiple NZ PMS systems)

---

### Execution Risks

**Risk 1: Scope Creep (Adding Features Beyond MVP)**
- **Likelihood:** High (founder enthusiasm, user requests)
- **Impact:** Medium (delays Inbox AI, distracts from core)
- **Mitigation:**
  - Strict feature freeze post-launch
  - User requests go to "V2 backlog"
  - Every feature request evaluated: "Does this increase email list growth?"
  - Time-box: Max 4 hours/week on referral images post-launch
  - Reminder: This is a stepping stone, not the main product

**Risk 2: Customer Support Overwhelms Founder Time**
- **Likelihood:** Medium (especially if bugs or UX confusing)
- **Impact:** High (takes time away from Inbox AI + GP clinical work)
- **Mitigation:**
  - Comprehensive FAQ from Day 1
  - Email automation for common questions
  - Self-service design (clear instructions, tooltips)
  - Track support volume: If >10 emails/week → create canned responses
  - If >20 emails/week → consider hiring VA (virtual assistant)
- **Threshold:** If support requires >5 hours/week → action needed

**Risk 3: Distraction from Inbox AI Development**
- **Likelihood:** High (referral images is tangible, Inbox AI is hard)
- **Impact:** Critical (Inbox AI is the real business)
- **Mitigation:**
  - Time-box referral images work: 2 days build, 2 hours/week maintenance
  - Calendar blocking: Inbox AI development = protected time
  - Track time spent weekly (referral images vs Inbox AI)
  - Reminder: Referral images success = email list, not revenue
  - If Inbox AI slips > 2 months → consider archiving referral images

**Risk 4: Stripe/Payment Integration Issues**
- **Likelihood:** Low (Stripe is reliable, tested platform)
- **Impact:** High (blocks revenue, frustrates users)
- **Mitigation:**
  - Thorough testing in Stripe test mode
  - Monitor webhook failures (set up alerts)
  - Stripe support available (use if needed)
  - Manual verification process for failed webhooks
  - Backup: Refund + re-process if webhook fails

---

### Legal & Compliance Risks

**Risk 1: Patient Privacy Violation**
- **Likelihood:** Low (no PHI stored, 24h auto-delete, disclaimers)
- **Impact:** Critical (legal liability, NZPB complaint)
- **Mitigation:**
  - Clear disclaimers at signup (GP must obtain patient consent)
  - Terms state: "Not a clinical record system"
  - No patient identifiers collected (not even initials)
  - Encrypted storage (S3 SSE-AES256)
  - Auto-delete after 24h (no long-term storage)
  - Privacy Policy clearly states data handling
- **Legal review:** Consider quick legal review ($500-1000) if budget allows

**Risk 2: Medical Device Classification**
- **Likelihood:** Low (administrative tool, not clinical decision support)
- **Impact:** Medium (could require regulatory approval)
- **Mitigation:**
  - Position as workflow tool, not diagnostic device
  - No clinical claims ("improves diagnosis," "reduces errors")
  - Only claims: "Saves time," "simplifies workflow"
  - Check NZMA (NZ Medicines Act) classification criteria
  - If uncertain, consult regulatory expert ($500-1000 consultation)

**Risk 3: Copyright/IP Issues**
- **Likelihood:** Very Low
- **Impact:** Low
- **Mitigation:**
  - All code original or open-source licensed
  - Image processing (Sharp) is open-source MIT license
  - No proprietary algorithms copied
  - "GP Referral Images" name unlikely to conflict (descriptive)

---

### Contingency Plans

**If Signups Very Low (<20 in Week 1):**
1. Emergency Facebook ad campaign ($200 budget, targeted to NZ GPs)
2. Direct outreach to 50+ GP contacts (email + LinkedIn)
3. Post in additional GP communities (Australia, UK if applicable)
4. Offer early adopter incentive ("First 50 users get premium free for 1 year")

**If Technical Issues Block Launch:**
1. Soft launch only (email to 10 friends, don't post publicly)
2. Fix critical bugs in 48 hours
3. Public launch delayed by 3-5 days (not critical, better to launch working product)

**If Conversion Rate Very Low (<10% by Month 2):**
1. A/B test pricing: Try $30 instead of $50
2. Survey non-converters: "What would make you upgrade?"
3. Reduce limit to 5 images/month (force decision sooner)
4. Add more value to premium (e.g., launch annotation tools early)

**If Competition Launches Similar Tool:**
1. Accelerate V1 features (annotation, PDF export)
2. Double down on personal brand ("Built by Dr. [Name], GP")
3. Create content: Blog post comparing tools (honest, not FUD)
4. Offer premium discount: "First 100 users get $20 off"
5. Transition to Inbox AI faster (6 months instead of 12)

---

## APPENDIX A: Email Templates (Full Text)

### Email 1: Welcome Email
```
Subject: Your GP Referral Images links are ready 📸

Hi [Name],

Your referral photo tool is set up and ready.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🖥️ Desktop Link (bookmark this):
https://clinicpro.app/referral-images/desktop?u=[userId]

📱 Mobile Capture Link (save to phone's home screen):
https://clinicpro.app/referral-images/capture?u=[userId]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Quick Start:

1. Open the desktop link on your computer (bookmark it)
2. Send the mobile link to your phone (via email/WhatsApp/copy)
3. Save the mobile link to your home screen for instant access
4. Open it when you need referral photos - works like an app

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These are YOUR permanent links. Same links work every time.

No installation. No credit card. Just works.

Cheers,
ClinicPro Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need help? Reply to this email or visit clinicpro.app/support

[Unsubscribe]
```

---

### Email 2: Usage Tip Email
```
Subject: Quick tip: Use GP Referral Images for these 3 things

Hi [Name],

You've started using GP Referral Images - nice!

Here's what other GPs use it for:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 📋 Specialist Referral Photos
   → Saves 10+ min per referral
   → Auto-sized for email (<500KB, no rejections)
   → Perfect for derm, wound care, ENT, etc.

2. 📸 Wound Progress Documentation
   → Before/after tracking for clinical notes
   → No more digging through phone camera roll
   → Ready for medico-legal if needed

3. 🏥 Pre-Procedure Records
   → Insurance claims documentation
   → Pre/post comparison photos
   → Audit trail (24h retention, then auto-deleted)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep capturing. It gets easier every time.

Cheers,
ClinicPro Team

P.S. Your mobile link: https://clinicpro.app/referral-images/capture?u=[userId]
Save it to your home screen for instant access.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Unsubscribe]
```

---

### Email 3: Value Reinforcement Email
```
Subject: You've saved [X] minutes with GP Referral Images

Hi [Name],

You've captured [X] images with GP Referral Images.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Your Time Savings:

• Images captured: [X]
• Average time saved per image: 5 minutes
• Total time saved: [X × 5] minutes

That's [X × 5 ÷ 60] hours back in your day. 💪

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Share the love:

Know a colleague who emails referral photos to themselves?
Send them this: clinicpro.app/referral-images

They'll thank you.

Cheers,
ClinicPro Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Unsubscribe]
```

---

### Email 4: Limit Hit Email
```
Subject: Help keep GP Referral Images running?

Hi [Name],

You've used GP Referral Images 10 times this month - that's great to see!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quick context:

I built this as a GP frustrated with existing tools. No venture 
capital, no corporate owners - just trying to solve our shared 
workflow problems.

Your support keeps this project alive:

✓ $50 one-time (not a subscription)
✓ Unlimited images forever
✓ All future updates included (annotation, PDF export, etc.)
✓ Early access to our upcoming Inbox AI tool
✓ Help other GPs access this tool

[Support GP Referral Images - $50]
→ https://clinicpro.app/referral-images/upgrade?u=[userId]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thanks for trying what I built.

Dr. [Your Name], GP
[Your Location]

P.S. If now's not the right time, I've given you 10 more free 
images to keep using the tool. I'll check in again if you hit 
the next limit.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Unsubscribe]
```

---

### Email 5: Follow-up Email
```
Subject: Still need more images this month?

Hi [Name],

Quick reminder: You've used your 10 free images this month.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your options:

1️⃣ Wait [X] days for 10 more free images (monthly reset)

2️⃣ Upgrade to unlimited now ($50 one-time)
   → Never hit limits again
   → All future features included
   → Early access to our upcoming Inbox AI tool

[Upgrade Now - $50]
→ https://clinicpro.app/referral-images/upgrade?u=[userId]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

No pressure - the free tier will reset at the start of next month.

Cheers,
ClinicPro Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Unsubscribe]
```

---

### Email 6: Month Reset Email
```
Subject: Your 10 free images are back 🎉

Hi [Name],

Good news - your monthly limit has reset.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You have 10 more free images this month.

Your mobile link: https://clinicpro.app/referral-images/capture?u=[userId]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Or upgrade to unlimited and never think about limits again:

✓ $50 one-time (not a subscription)
✓ Unlimited images forever
✓ All future features included
✓ Early access to Inbox AI

[Upgrade to Unlimited - $50]
→ https://clinicpro.app/referral-images/upgrade?u=[userId]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cheers,
ClinicPro Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Unsubscribe]
```

---

### Email 7: Premium Confirmation Email
```
Subject: Thank you for supporting GP Referral Images! 🎉

Hi [Name],

Your support means everything.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You now have:

✅ Unlimited referral images forever
✅ All future features automatically (annotation, PDF export, etc.)
✅ Priority early access to our upcoming Inbox AI tool
✅ Our deepest gratitude for supporting GP-built healthcare solutions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

No more limits. No more prompts. Just capture as many 
images as you need.

Your mobile link (same as before):
https://clinicpro.app/referral-images/capture?u=[userId]

Your desktop link (same as before):
https://clinicpro.app/referral-images/desktop?u=[userId]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for supporting GP-built tools.

Dr. [Your Name], GP
[Your Location]

P.S. Keep an eye out for Inbox AI launch emails. You'll be 
among the first to get early access.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Receipt: $50.00 charged to [card ending in XXXX]
Transaction ID: [Stripe transaction ID]

Need help? Reply to this email.

[Manage subscription settings] (future: account dashboard)
```

---

## APPENDIX B: Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Product Name** | GP Referral Images | Emphasizes primary use case (referrals) |
| **URL Structure** | `/referral-images` | Clean, descriptive, SEO-friendly |
| **Free Tier Limit** | Month 1 unlimited → Month 2+ 10/month | Habituation before friction, forces decision |
| **Premium Price** | $50 one-time | GP psychology prefers "buy once" vs subscription |
| **Grace Unlocks** | 2× "give me 10 more" | Generous but finite, 3 conversion opportunities |
| **Conversion Messaging** | Personal support framing | "Support fellow GP project" > corporate upsell |
| **Access Method** | Permanent personal links (desktop + mobile) | Simplest UX, bookmark once use forever |
| **Link Sharing** | Email/WhatsApp/Copy primary, QR optional | Reliability > novelty |
| **Image Specs** | <500KB, 1920px, JPEG, 85% quality | Balances quality vs file size for e-referrals |
| **Storage Duration** | 24 hours auto-delete | Privacy + cost optimization |
| **Premium Features (Launch)** | Unlimited images only | Simplicity, other features (annotation, PDF) later |
| **Inbox AI Mention** | Brief in $50 modal + premium confirmation | Creates curiosity without confusion |
| **Launch Strategy** | Public immediately (no extended beta) | Speed > perfection |
| **Medtech Integration** | Optional tier, not actively promoted | Available on demand, not main strategy |
| **Legal Disclaimers** | Show at signup | Patient consent, not clinical record, 24h storage |
| **Email Collection** | Email + optional name | Minimal friction, enough for segmentation |
| **Geographic Scope** | Open to any GP globally | Larger market, NZ-focused initially |

---

## APPENDIX C: Success Story Template

**When this works, here's the narrative:**

> "In January 2026, I launched GP Referral Images as a free tool for GPs frustrated with referral photo workflows. 
> 
> Within 6 months:
> • 500 GPs signed up
> • 70 converted to $50 premium (35% conversion rate)
> • $3,500 revenue generated
> • Email list of 500 warm leads built
> 
> But the real success wasn't the revenue - it was the **email list**.
> 
> When we launched Inbox AI in late 2026, we had:
> • 500 warm GP contacts (not cold leads)
> • 70 proven buyers (willing to pay for GP-built tools)
> • Brand credibility ('ClinicPro solves real problems')
> • Channel validation (GP Facebook groups, word-of-mouth work)
> 
> GP Referral Images converted to Inbox AI at 30% (150 signups), with premium converters at 60% (42 signups).
> 
> That email list - built for $3,500 investment - became the foundation for a $100K+ ARR business.
> 
> Lesson: Loss-leader acquisition products work when you know your long-term monetization path."

---

**END OF COMPREHENSIVE STRATEGY DOCUMENT**

**Next Steps:**
1. Confirm all clarifications addressed
2. Begin implementation (Phase 1: Foundation Setup)
3. Target launch: Within 7 days of starting build

**Questions for Implementation AI Agent:**
- Any technical architecture concerns?
- Recommendations for faster build (any shortcuts)?
- Additional edge cases to test?
- Deployment optimizations?

---

**Document Status:** ✅ Complete and Ready for Implementation  
**Last Updated:** January 29, 2026  
**Prepared For:** Implementation AI Agent  
**Approver:** Dr. Ryotaro Eguchi (Founder)