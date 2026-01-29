---
name: ""
overview: ""
todos: []
isProject: false
---

# ClinicPro Image Freemium Implementation Guide

**Handoff Document for Implementation**

---

## Product Overview

**Product Name**: ClinicPro Photo Tool (Freemium Standalone App)

**Target Audience**: Individual GPs who need simple referral photo tool (not full scribe suite)

**Primary Use Case**: Specialist referral photos (skin lesions, injuries, etc.)

**Core Purpose**: Build email list through freemium model while solving GP pain points

**Validated Problem** (from GP Facebook thread):

- Clunky workflows (email → save → upload takes 30+ minutes)
- File size rejections from e-referral systems
- Format incompatibility issues
- Competitors: MedImage, QuickShot, Indici (paid tools)

---

## IMPORTANT: Reuse Existing Code

**⚠️ DO NOT BUILD FROM SCRATCH ⚠️**

We already have working image tools at `/medtech-images` that include:

- ✅ Desktop QR code generation and display
- ✅ Mobile camera capture
- ✅ Image upload to S3
- ✅ Image compression (<1MB)
- ✅ Real-time sync between desktop and mobile
- ✅ Basic image gallery/display

**What to do:**

1. **Copy/adapt** the existing `/medtech-images` code to `/image`
2. **Remove** Medtech-specific features (ALEX API integration, FHIR, launch context)
3. **Keep** all the core image capture, upload, and display functionality

**What you need to BUILD NEW:**

- ✅ **PDF export** (premium feature) - convert images to PDF format
- ✅ **Mobile annotation/editing tools** (premium feature) - arrows, circles, crop, markup on mobile
- ✅ **Freemium logic** - usage tracking (20 images/month for free tier)
- ✅ **Upgrade flow** - Stripe checkout for $50 one-time payment
- ✅ **Comparison table UI** - free vs premium feature table

**Existing code locations:**

- `/medtech-images/page.tsx` - Desktop QR and gallery page
- `/medtech-images/mobile/` - Mobile capture pages
- Check API routes under `/api/medtech/` for image upload/processing logic

**Estimated time saving:** 70-80% of work already done. Focus on the 3 new features above.

---

## Technical Specifications

### URL Structure

- Image landing page: /image
- **Desktop**: `/image/app`
- **Mobile capture**: `/image/mobile`
- **Base domain**: `clinicpro.co.nz`

### Authentication

- **System**: Clerk (unified with existing ClinicPro accounts); only needed on /image/app; no need to log in on /image/mobile to reduce friction
- **Free tier**: Requires account creation (email capture)
- **Purpose**: Build email list for marketing

### Storage

- **Type**: AWS S3 ephemeral storage
- **Lifecycle**: 24-hour auto-delete
- **Compression**: <1MB per image (use existing ClinicPro compression system)

---

## User Flow: Simplified Single Session Per User

### Key Insight: No QR Scanning Needed!

**One persistent session per user** (not a new session each time)

- GP gets a permanent link: `https://clinicpro.co.nz/image/mobile?userId={userId}`
- GP can text/email/WhatsApp this link to their phone once
- GP can save link to phone home screen for future use
- Images stay 24hrs, so GP can capture on mobile → view on desktop later
- **QR code becomes optional** (backup method only)

**Why this is better:**

- Simpler: No QR scanning step
- Faster: GP just opens saved link
- Persistent: Same link works forever
- Mobile-friendly: Can be bookmarked/home screen shortcut

### Step-by-Step Flow

#### 1. Desktop Landing (`/image/app`)

**What GP sees:**

- Large prominent link with copy/share buttons
- Heading: "Send this link to your phone"
- Link format: `clinicpro.co.nz/image/mobile?u={shortUserId}`
- Share buttons: SMS, Email, WhatsApp, Copy
- Usage counter (if logged in): "X/20 images used this month" or "Unlimited (Premium)"
- Small QR code below (optional backup method)
- Instruction: "Save this link on your phone for easy access"

**Technical requirements:**

- Use userId (not randomly generated sessionId)
- Link is permanent per user: `/image/mobile?u={shortUserId}` (shortened for easy sharing)
- Share buttons pre-populate message: "My clinical photo tool: [link]"
- QR code optional (for GPs who prefer scanning)

#### 2. Mobile Landing Page (`/image/mobile?u={userId}`)

**What GP sees:**

- Welcome message: "ClinicPro Photo Tool"
- Prominent "Add to Home Screen" button/instruction (PWA-style)
- "Start Capturing" button (goes directly to camera)
- Usage counter (if applicable): "X/20 images this month" or "Unlimited"
- Simple instruction: "Bookmark this page for easy access"

**Technical requirements:**

- Extract userId from URL parameter `?u={userId}`
- Check if user is authenticated (validate userId)
- If not authenticated: prompt login (but try to avoid this by pre-authenticating the link)
- Show "Add to Home Screen" prompt (for iOS/Android)
- Direct access to capture page (no extra steps)

**Key advantage:** GP can save this link once and reuse forever. No QR scanning needed each time.

#### 3. Mobile Capture Page

**What GP sees (Free Tier):**

- Default camera app. 
- Same user flow as /medtech-images/mobile

**What GP sees (Premium Tier):**

- Same as free, but:
- Format selector: JPEG | PDF (toggle)
- "Edit" button on thumbnails (opens annotation tools)

**Technical requirements:**

- Request camera permission (back-facing camera preferred)
- Capture image → compress to <1MB → store in session
- Display thumbnails in gallery strip
- Allow multiple captures before processing
- Use ably - refer to /medtech-images

#### 5. Processing & Download

**Free Tier:**

- Auto-compress to <1MB JPEG
- Upload to S3 (24hr lifecycle)
- Generate download link
- Show download link (on desktop)

**Premium Tier:**

- Choose format: JPEG or PDF
- Optional annotation (arrows, circles, crop, markup)
- Compress to <1MB
- Upload to S3 (24hr lifecycle)
- Generate download link
- Batch download option

#### 6. Upgrade Prompts

**Free tier prompts:**

- At 15/20 images: Gentle banner "5 images left this month. Upgrade for unlimited?"
- At 20/20 images: Modal "Monthly limit reached. Upgrade to Premium for $50 (one-time payment)"

**Premium upgrade flow:**

- Click "Upgrade" → /image`/upgrade`
- Stripe Checkout: $50 one-time payment
- Return to `/image` with premium access

---

## Freemium Model: Feature Matrix

| Feature | Free Tier | Premium Tier ($50 one-time) |

|---------|-----------|----------------------------|

| **Monthly limit** | 20 images/month | Unlimited |

| **Output format** | JPEG only | JPEG + PDF |

| **Compression** | <1MB auto-compress | <1MB optimized |

| **Annotation tools** | None | Full (arrows, circles, crop, markup) |

| **Batch upload** | ❌ | ✅ |

| **Batch download** | ❌ | ✅ (zip file) |

| **Storage** | 24hr auto-delete | 24hr auto-delete |

| **Support** | Email only | Priority email |

---

## User-Facing Comparison Table

**Implementation note**: Create this comparison table on the landing page (`/image`) and upgrade page (`/image/upgrade`) to help GPs understand the differences and encourage conversion.

### Comparison Table Design

Display this table prominently on:

- Landing page (above or below the main CTA)
- Upgrade page (when free users hit limit)
- Pricing section (if created)

**Table content:**

| Feature | Free | Premium |

|---------|------|---------|

| **Images per month** | 20 images | Unlimited |

| **Output formats** | JPEG only | JPEG + PDF |

| **Annotation tools** | ❌ | ✅ Arrows, circles, crop, markup |

| **Batch processing** | Single images | Multiple images at once |

| **File size** | <1MB guaranteed | <1MB guaranteed |

| **Storage** | 24 hours | 24 hours |

| **Support** | Email | Priority email |

| **Price** | **Free** | **$50 one-time** |

**Below the table, add subtle mention:**

---

*Looking for Medtech Evolution integration for your whole clinic? [Email us](mailto:contact@clinicpro.co.nz) to find out more about our clinic-wide solution.*

---

**Design notes:**

- Use checkmarks (✅) and crosses (❌) for visual clarity
- Highlight Premium column with subtle background color or border
- Make "Premium" CTA button prominent below Premium column
- Keep Medtech mention subtle (small text, not a button)
- Mobile-responsive: stack columns on small screens

---

## Technical Architecture

### Frontend Components Needed

#### Desktop Page (`/image/app`)

```typescript
// Components to build:
- QRCodeDisplay (generates QR from sessionId)
- ShareableLink (copyable link with sessionId)
- UsageCounter (shows X/20 for free, "Unlimited" for premium)
- ImageGallery (shows thumbnails as mobile captures)
- DownloadButton (appears after processing)
```

#### Mobile Pages

**Mobile Landing (`/image/mobile`)**

```typescript
// Components to build:
- ScanQRButton (opens in-browser QR scanner)
```

**QR Scanner (`/image/mobile/scan`)**

```typescript
// Use library: html5-qrcode or @zxing/browser
- QRScanner (in-browser camera viewfinder)
- On detect: extract sessionId → redirect to capture page
```

### Backend API Routes Needed

#### Session Management (Simplified)

**No session creation needed!** Just use userId.

```typescript
// GET /api/image/status/{userId}
// Polling endpoint for desktop to check for new images
// Returns: { imageCount: number, images: [], lastUpdated: timestamp }

// Note: One persistent "session" per user (not a new session each time)
// Mobile uploads are tied to userId
// Desktop polls userId to see new images
```

#### Image Processing

```typescript
// POST /api/image/upload
// Body: { userId, imageData: base64 }
// Action:
//   1. Check user tier (free vs premium)
//   2. Check usage limits (free: 20/month)
//   3. Compress to <1MB
//   4. Upload to S3 with 24hr lifecycle policy
//   5. Store metadata in database (userId, imageId, timestamp)
//   6. Return S3 presigned URL
// Returns: { imageId, presignedUrl, expiresAt }

// POST /api/image/images/process
// Body: { imageIds: [], format: 'jpeg' | 'pdf', userId }
// Action:
//   1. Check user tier (free: jpeg only, premium: both)
//   2. Convert format if needed (premium PDF)
//   3. Generate download link
// Returns: { downloadUrl, expiresAt }

// GET /api/image/images/download/{imageId}
// Proxy to S3 presigned URL
// Triggers download with proper filename
```

#### Usage Tracking

```typescript
// GET /api/image/usage/{userId}
// Returns: { imagesUsedThisMonth: number, limit: number | null, tier: 'free' | 'premium' }

// Database schema needed:
// Table: photo_tool_usage
// Columns: userId, month (YYYY-MM), imageCount, tier
// Index: (userId, month)
```

#### Premium Upgrade

```typescript
// POST /api/image/upgrade/checkout
// Body: { userId }
// Action:
//   1. Create Stripe Checkout session
//   2. Product: "Photo Tool Premium" ($50 one-time)
//   3. Success URL: /image?upgraded=true
//   4. Cancel URL: /image/upgrade
// Returns: { checkoutUrl }

// POST /api/image/upgrade/webhook (Stripe webhook)
// Action:
//   1. Verify Stripe signature
//   2. On checkout.session.completed:
//      - Update user tier to 'premium' in database
//      - Send confirmation email
```

### Database Schema

#### Users Table (extend existing)

```sql
ALTER TABLE users ADD COLUMN image_tier VARCHAR(20) DEFAULT 'free';
-- Values: 'free' | 'premium'
```

#### Usage Tracking Table (new)

```sql
CREATE TABLE image_usage (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  month VARCHAR(7) NOT NULL,  -- Format: YYYY-MM
  image_count INTEGER DEFAULT 0,
  tier VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month),
  INDEX idx_user_month (user_id, month)
);
```

#### Images Metadata Table (new)

**Track uploaded images for 24hr lifecycle and desktop sync**

```sql
CREATE TABLE image_uploads (
  image_id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_expires (expires_at)
);

-- Cleanup expired images (run daily)
DELETE FROM image_uploads WHERE expires_at < CURRENT_TIMESTAMP;
```

**Why this table:**

- Desktop can query "show me all images for userId in last 24hrs"
- Track when images were uploaded (for real-time sync)
- Auto-cleanup expired entries to match S3 lifecycle

### S3 Configuration

#### Bucket Lifecycle Policy

```json
{
  "Rules": [
    {
      "Id": "Delete after 24 hours",
      "Status": "Enabled",
      "Prefix": "photo-tool/",
      "Expiration": {
        "Days": 1
      }
    }
  ]
}
```

#### Upload Path Structure

```
s3://clinicpro-images/image/{userId}/{sessionId}/{timestamp}-{imageId}.jpg
```

---

## Image Processing Pipeline

### Compression ✅ (ALREADY EXISTS - Reuse from `/medtech-images`)

**Location:** `/medtech-images` already has working compression

**What it does:**

- JPEG compression with quality optimization
- Automatic resize to keep <1MB
- Handles mobile camera uploads

**Action:** Copy and reuse this code. No changes needed.

---

### PDF Generation ❌ (NEW FEATURE - Build This)

**Premium feature only**

**Library options:**

- `jsPDF` (recommended - lightweight, browser-friendly)
- `pdfkit` (alternative if more features needed)

**Requirements:**

- Input: One or more JPEG images (already compressed to <1MB each)
- Output: Single PDF with all images embedded, <1MB total if possible
- Layout: One image per page (portrait orientation)
- Metadata: Add title ("Clinical Photos"), author (GP name), date
- Available only to premium users

**Implementation notes:**

- Check if images need further compression when combining into PDF
- Progress indicator for multi-image PDF generation
- Download with filename: `clinical-photos-{date}.pdf`

---

### Mobile Annotation/Editing Tools ❌ (NEW FEATURE - Build This)

**Premium feature only**

**Library check:**

- Check if `konva` already exists in codebase (ClinicPro may already use it)
- If yes: reuse existing setup
- If no: install `react-konva` + `konva`

**Tools required:**

- **Arrow tool** (for pointing to lesions)
- **Circle tool** (for highlighting areas)
  - Circle tool (for highlighting areas)
  - Crop tool (trim edges)
  - Free draw (markup)
- Save annotated image as new JPEG

---

## Authentication & Email Capture Strategy

### Why Auth is Required for Free Tier

**Purpose**: Build email list for marketing

### Signup Flow

1. GP lands on `/image/app`
2. Not logged in → Show auth prompt: "Sign in to start capturing photos"
3. Clerk signup form:
  - Email (required)
  - Name (required)
  - Password or magic link
  - Checkbox: "I agree to receive product updates" (pre-checked)
4. After signup → Desktop shows QR code
5. Email captured ✅

---

## UI/UX Design Requirements

### Desktop Page Design

**Layout (Simplified - Link-First Approach):**

```
┌─────────────────────────────────────┐
│  ClinicPro Photo Tool               │
│                                     │
│  Send this link to your phone:     │
│  ┌─────────────────────────────┐   │
│  │ clinicpro.co.nz/image/...   │   │
│  │ [Copy] [SMS] [Email]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  💡 Tip: Save this link on your    │
│     phone for easy access          │
│                                     │
│  ──────── OR ────────              │
│  ┌──────┐  Scan QR (optional)     │
│  │ QR   │                          │
│  └──────┘  (small, less prominent) │
│                                     │
│  Usage: 5/20 images this month     │
│  [Upgrade to Premium]              │
│                                     │
│  ─────────────────────────────     │
│  Recent Images (updates live):     │
│  [thumb] [thumb] [thumb]           │
│  [Download All]                    │
└─────────────────────────────────────┘
```

**Key changes:**

- **Link-first design** (not QR-first)
- Large, copyable link with share buttons
- QR code de-emphasized (small, optional, "OR" separator)
- Tip about saving link on phone
- Images section shows "updates live" (polls for new images)

---

### How Desktop ↔ Mobile Sync Works (Simplified)

**The flow:**

1. GP logs in on desktop → Gets permanent link with their userId
2. GP shares link to phone (SMS/WhatsApp/Email) → Opens mobile page
3. GP captures images on mobile → Uploads to S3 (tagged with userId)
4. Desktop polls API every 2-3 seconds: "Any new images for this userId?"
5. When mobile uploads, desktop sees new images and displays thumbnails
6. Images persist for 24hrs (GP can capture now, view on desktop later)

**Technical implementation:**

- **Mobile uploads**: POST `/api/image/upload` with userId → S3 + database entry
- **Desktop polls**: GET `/api/image/status/{userId}` → Returns list of images uploaded in last 24hrs
- **Polling interval**: Every 2-3 seconds (simple HTTP polling, no WebSocket needed)
- **24hr lifecycle**: S3 auto-deletes + database cleanup job

**Why polling (not WebSocket):**

- Simpler implementation
- Sufficient for this use case (not real-time chat, just image upload notifications)
- Existing `/medtech-images` may already use polling - reuse that pattern
- Can upgrade to WebSocket/Ably later if needed

### Color Scheme

- Match existing ClinicPro branding
- Primary action button: High contrast (easy to tap on mobile)
- Usage counter: Subtle (not alarming until 15/20)

---



---

## Post-Launch Optimization

### A/B Testing Ideas

- Free tier limit: 20 vs 10 vs 30 images/month
- Premium price: $50 vs $75 vs $99
- Upgrade prompt timing: 15/20 vs 18/20 vs after every download

### Feature Additions (based on usage)

- Batch capture mode (capture 10 images rapidly)
- Image templates (dermatology, injuries, wounds)
- Integration with e-referral systems (direct upload)
- OCR text extraction from images (premium feature)

---

## Notes for Implementation Agent

### Existing Codebase Context

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Database**: Neon PostgreSQL, Drizzle ORM
- **Auth**: Clerk (already integrated)
- **Payments**: Stripe (already integrated)
- **Storage**: AWS S3 (already configured)
- **Deployment**: Vercel (frontend)

### Code Style Guidelines

- Use TypeScript strict mode
- Follow existing ClinicPro component patterns
- Use Tailwind CSS for styling (match existing design)
- Error handling: Try-catch with Sentry logging
- Mobile-first responsive design

### Key Implementation Notes

**🚨 CRITICAL: Start by Copying Existing Code 🚨**

**Step 0 (BEFORE building anything):**

1. Copy `/medtech-images/` folder to `/image/`
2. Examine existing components, API routes, and logic
3. Remove Medtech-specific code (ALEX API, FHIR, launch context)
4. Test that basic capture workflow still works
5. **THEN** proceed to build the 3 new features below

**New Features to Build (Priority Order):**

1. **Freemium logic** (highest priority):
  - Usage tracking: count images per user per month
  - Enforce 20 images/month limit for free tier
  - Display usage counter on desktop and mobile
  - Block uploads when limit reached (show upgrade prompt)
2. **PDF export** (premium feature):
  - Library: `jsPDF` or `pdfkit`
  - Convert captured images to PDF format
  - Single PDF with all images (one per page)
  - <1MB total file size
3. **Mobile annotation/editing** (premium feature):
  - Tools: arrows, circles, crop, free draw/markup
  - Library: Check if `konva` already exists in codebase (used elsewhere)
  - Mobile-optimized UI (large touch targets)
  - Save annotated image as new JPEG

**User-Facing Comparison Table:**

- Create the comparison table on landing page (`/image`) and upgrade page (`/image/upgrade`)
- See "User-Facing Comparison Table" section above for exact table content
- Include subtle mention of Medtech integration below table: "Looking for Medtech Evolution integration for your whole clinic? Email us to find out more about our clinic-wide solution."
- Make Premium column visually distinct (subtle background or border)
- Mobile-responsive design (stack columns on small screens)

### Testing Requirements

- Test on iOS Safari (primary target)
- Test on Android Chrome (secondary target)
- Manual testing required (camera access, QR scanning)
- E2E test critical path: Desktop → Mobile → Capture → Download

### Deployment Steps

1. Merge to `main` branch
2. Vercel auto-deploys
3. Test on production URL
4. Update DNS if needed (`/image` route should work)

---

## Questions for Clarification (if needed during implementation)

1. **Annotation tools**: Which library is already in ClinicPro? (Check if `konva` or `fabric.js` exists)
2. **Image compression**: Where is the current <1MB compression logic? (Reuse it)
3. **S3 bucket name**: What's the bucket name for storing images? (Use existing or create new?)
4. **Stripe product setup**: Should implementation agent create Stripe product, or is it already set up?
5. **Email marketing**: Which email service for automated emails? (Existing integration with Resend/SendGrid?)

---

**End of Implementation Guide**

---

## Implementation Starting Point

**🚨 STEP 0: Copy Existing Code FIRST (2-3 hours)**

Before building anything new:

1. **Copy** `/medtech-images/` → `/image/`
2. **Examine** existing code:
  - Desktop QR generation
  - Mobile camera capture
  - Image upload/compression
  - Real-time sync
3. **Remove** Medtech-specific features:
  - ALEX API integration
  - FHIR DocumentReference
  - Launch context handling
4. **Test** basic workflow: Desktop QR → Mobile capture → Upload → Display
5. **Verify** S3 upload and compression still works

**THEN proceed to build the 3 NEW features:**

1. **Freemium logic** (usage tracking, limits, upgrade prompts) - 1 day
2. **PDF export** (premium feature) - 4-6 hours
3. **Mobile annotation/editing** (premium feature) - 1-2 days

**Goal**: Functional freemium standalone app with free tier (20 images/month, JPEG only) and premium tier ($50 one-time, unlimited, JPEG+PDF, annotation tools).

**Timeline estimate**:

- **0.5 day**: Copy and clean existing code
- **1 day**: Freemium logic and upgrade flow
- **1-2 days**: PDF export + annotation tools
- **0.5 day**: Polish, testing, comparison table UI

**Total: 3-4 days** (vs 7-10 days if building from scratch)