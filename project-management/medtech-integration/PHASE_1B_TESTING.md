# Phase 1B Testing Guide

**Created**: 2026-01-02  
**Status**: Implementation Complete - Ready for Testing  
**Estimated Test Time**: 1-2 hours

---

## What Was Built

### Infrastructure ✅
- **Redis Session Service** (`/src/lib/services/session-storage/redis-client.ts`)
  - Per-encounter session storage
  - 2-hour TTL with auto-refresh
  - Session token generation (10-minute expiry)

- **S3 Image Service** (`/src/lib/services/session-storage/s3-client.ts`)
  - Presigned URL generation (upload/download)
  - Auto-retry (3 attempts, exponential backoff)
  - 1-hour lifecycle policy

### API Endpoints ✅
1. `POST /api/medtech/session/create` - Create session + QR token
2. `GET /api/medtech/session/token/[token]` - Validate QR token
3. `POST /api/medtech/session/presigned-url` - Get S3 upload URL
4. `POST /api/medtech/session/images` - Add image + publish Ably event
5. `GET /api/medtech/session/images/[encounterId]` - Get all session images

### Mobile Page ✅
- **Full 7-screen flow** (`/app/(medtech)/medtech-images/mobile/page.tsx`)
  - Token validation
  - Camera/Gallery capture
  - Image review with delete
  - Per-image metadata entry (laterality + body site)
  - Upload progress with compression
  - Success screen
  - Error handling
- **Features:**
  - Client-side image compression (<1MB target)
  - Auto-retry (3 attempts) for all network calls
  - 20-image session limit

### Desktop Integration ✅
- **Ably Real-Time Sync** (`/src/medtech/images-widget/hooks/useAblySessionSync.ts`)
  - Subscribes to `session:{encounterId}` channel
  - Eager fetch on initial load
  - Eager fetch on `image-uploaded` events
  - Adds images to store with presigned download URLs

---

## Prerequisites

### Environment Variables (Vercel Dashboard)

**Verify these are set:**
```bash
# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://unique-stallion-12716.upstash.io
UPSTASH_REDIS_REST_TOKEN=<your-token>

# AWS S3
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
S3_BUCKET_NAME=clinicpro-medtech-sessions

# Ably
NEXT_PUBLIC_ABLY_API_KEY=<your-key>

# Base URL
NEXT_PUBLIC_BASE_URL=https://clinicpro.co.nz
```

### AWS S3 Bucket Setup

**Create bucket if not exists:**
```bash
aws s3 mb s3://clinicpro-medtech-sessions --region ap-southeast-2
```

**Set lifecycle policy (1-day retention):**
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket clinicpro-medtech-sessions \
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "delete-after-1-day",
      "Status": "Enabled",
      "Filter": { "Prefix": "sessions/" },
      "Expiration": { "Days": 1 }
    }]
  }'
```

**Set CORS policy:**
```bash
aws s3api put-bucket-cors \
  --bucket clinicpro-medtech-sessions \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedOrigins": ["https://clinicpro.co.nz", "http://localhost:3000"],
      "AllowedMethods": ["GET", "PUT"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }]
  }'
```

---

## Test Plan

### Test 1: Session Creation (Desktop) ⏱️ 5 minutes

**URL:** `https://clinicpro.co.nz/medtech-images?encounterId=test-enc-001&patientId=test-pat-001&facilityId=F2N060-E`

**Steps:**
1. Open desktop widget URL
2. Click "Mobile Upload" button (QR panel should open)
3. Verify QR code displayed
4. Copy mobile URL from console logs

**Expected:**
- ✅ QR panel opens
- ✅ QR code visible
- ✅ Mobile URL in format: `https://clinicpro.co.nz/medtech-images/mobile?t={uuid}`
- ✅ Console logs: `[Session Create] Session created successfully`

**Verify Backend:**
```bash
# Check Redis session exists
redis-cli -u $UPSTASH_REDIS_REST_URL GET encounter:test-enc-001
# Should return JSON with encounterId, patientId, images: []
```

---

### Test 2: Mobile Token Validation ⏱️ 2 minutes

**URL:** Copy mobile URL from Test 1

**Steps:**
1. Open mobile URL on phone (or desktop browser)
2. Wait for validation

**Expected:**
- ✅ "Validating session..." spinner shows briefly
- ✅ Redirects to "Capture Images" screen
- ✅ Console logs: `[Mobile] Token validation successful`

**Failure Test:**
```
# Try invalid token
https://clinicpro.co.nz/medtech-images/mobile?t=invalid-token
```
- ✅ Shows error: "Token expired or invalid"

---

### Test 3: Mobile Image Capture ⏱️ 5 minutes

**Steps:**
1. Click "Open Camera" (or "Choose from Gallery" on desktop)
2. Select 2-3 images
3. Verify review screen shows thumbnails
4. Click X button on one image (test delete)
5. Click "Continue"

**Expected:**
- ✅ Images appear in 2-column grid
- ✅ Delete button works (image removed)
- ✅ Counter shows correct count: "Review Images (2)"
- ✅ Proceeds to metadata screen

---

### Test 4: Mobile Metadata Entry ⏱️ 3 minutes

**Steps:**
1. On metadata screen, select laterality: "Left"
2. Select body site: "Left Ear"
3. Click "Next"
4. For second image, select laterality: "Right", body site: "Right Ear"
5. Click "Upload All" (last image button)

**Expected:**
- ✅ Navigation shows "Image 1 of 2"
- ✅ Dropdowns work (laterality + body site)
- ✅ "Next" button advances to image 2
- ✅ Final button says "Upload All" (with upload icon)
- ✅ Proceeds to upload screen

**Skip Test:**
- Click "Skip remaining" on first image
- ✅ Should proceed directly to upload

---

### Test 5: Mobile Image Upload with Compression ⏱️ 3 minutes

**Steps:**
1. Watch upload progress
2. Monitor console logs for compression

**Expected:**
- ✅ "Uploading Images" screen shows
- ✅ Progress bar animates: "0/2" → "1/2" → "2/2"
- ✅ Text: "Compressing and uploading..."
- ✅ Console logs show:
  - `[Mobile] Compressing image...`
  - `[Mobile] Getting presigned URL...`
  - `[Mobile] Uploading to S3...`
  - `[Mobile] Notifying backend...`
- ✅ Success screen appears: "2 images uploaded successfully"

**Verify Backend:**
```bash
# Check Redis session updated
redis-cli -u $UPSTASH_REDIS_REST_URL GET encounter:test-enc-001
# Should show images: [{ s3Key: "sessions/...", metadata: {...}, uploadedAt: ... }]

# Check S3 objects exist
aws s3 ls s3://clinicpro-medtech-sessions/sessions/test-enc-001/
# Should show 2 .jpg files
```

**Verify Image Compression:**
- Original images: ~3-5MB (phone camera)
- Compressed: <1MB each
- Check S3 object sizes: `aws s3 ls s3://... --human-readable`

---

### Test 6: Desktop Real-Time Sync (Ably) ⏱️ 5 minutes

**Setup:**
- Keep desktop widget open (from Test 1)
- Mobile uploads images (Test 5)

**Expected (Desktop):**
- ✅ Console logs: `[Ably Sync] Image uploaded event received`
- ✅ Console logs: `[Ably Sync] Fetching existing session images`
- ✅ Images appear in thumbnail strip (bottom of desktop)
- ✅ No toast notification (silent sync as per spec)
- ✅ Images show metadata badges (laterality, body site)

**Verify Image URLs:**
- Open browser dev tools → Network tab
- Check images loaded from S3 presigned URLs
- URLs should match format: `https://clinicpro-medtech-sessions.s3.ap-southeast-2.amazonaws.com/sessions/...?X-Amz-Algorithm=...`

---

### Test 7: Desktop Image Review ⏱️ 3 minutes

**Steps:**
1. Click thumbnail in strip
2. Verify image loads in preview panel
3. Check metadata displayed
4. Click "Commit" button

**Expected:**
- ✅ Image loads in main preview area
- ✅ Metadata panel shows:
  - Laterality: "Left" (or selected value)
  - Body Site: "Left Ear" (or selected value)
- ✅ Commit button enabled (if metadata complete)
- ✅ Commit proceeds (existing BFF integration)

---

### Test 8: Error Handling - Network Failure ⏱️ 5 minutes

**Setup:**
- Open mobile page
- Capture image
- Enter metadata
- **Before upload**, enable "Offline" mode in browser dev tools (Network tab)

**Steps:**
1. Click "Upload All"
2. Watch retry attempts

**Expected:**
- ✅ Console logs show retry attempts:
  - `[S3] Retry: Attempt 1 failed, retrying...`
  - `[S3] Retry: Attempt 2 failed, retrying...`
  - `[S3] Retry: Attempt 3 failed, retrying...`
- ✅ After 3 attempts, error screen shows:
  - "Error: Upload failed"
  - "Try Again" button
- ✅ Click "Try Again" → page reloads

**Recovery Test:**
- Turn "Offline" mode off
- Retry upload
- ✅ Should succeed

---

### Test 9: Session Expiry ⏱️ 2 minutes

**Test Token Expiry (10 minutes):**
```bash
# Get mobile URL from Test 1
# Wait 10+ minutes
# Try accessing mobile URL again
```

**Expected:**
- ✅ Error: "Token expired or invalid"

**Test Session Expiry (2 hours):**
```bash
# Check Redis TTL
redis-cli -u $UPSTASH_REDIS_REST_URL TTL encounter:test-enc-001
# Should return ~7200 (2 hours in seconds)

# After 2 hours, session should auto-delete
```

---

### Test 10: Multi-Image Limits ⏱️ 3 minutes

**Steps:**
1. Capture 20 images on mobile
2. Try to capture 21st image

**Expected:**
- ✅ After 20 images uploaded, 21st upload fails with:
  - Error: "Image limit reached"
  - Message: "Maximum 20 images per session"

---

### Test 11: URL Expiry & Refresh (1 Hour) ⏱️ 5 minutes

**Setup:**
- Complete Test 6 (images in desktop store)
- Wait 1 hour (presigned URLs expire)
- Refresh desktop page

**Expected:**
- ✅ On refresh, `useAblySessionSync` re-fetches session
- ✅ New presigned URLs generated
- ✅ Images load successfully with new URLs
- ✅ Console logs: `[Ably Sync] Fetched session images` (on mount)

---

## Common Issues & Debugging

### Issue: "UPSTASH_REDIS_REST_URL is not defined"

**Cause:** Environment variables not set in Vercel

**Fix:**
1. Go to Vercel dashboard → Project → Settings → Environment Variables
2. Add missing variables
3. Redeploy

---

### Issue: "Failed to generate presigned URL"

**Cause:** AWS credentials invalid or bucket doesn't exist

**Fix:**
```bash
# Test AWS credentials
aws s3 ls s3://clinicpro-medtech-sessions

# Create bucket if missing (see Prerequisites)
aws s3 mb s3://clinicpro-medtech-sessions --region ap-southeast-2
```

---

### Issue: "S3 upload failed: CORS error"

**Cause:** CORS policy not set on S3 bucket

**Fix:** Apply CORS policy (see Prerequisites section)

---

### Issue: "Ably event not received on desktop"

**Cause:** Ably API key invalid or channel name mismatch

**Debug:**
```javascript
// Check Ably connection
console.log('[Ably] Connection state:', ably.connection.state);
// Should be "connected"

// Check channel name matches
console.log('[Ably] Channel:', `session:${encounterId}`);
// Desktop and mobile must use same encounterId
```

---

### Issue: "Images not appearing on desktop"

**Possible causes:**
1. Ably event not firing → Check API logs
2. Desktop using different encounterId → Check URL params match
3. Presigned URLs expired → Check `expiresAt` timestamp

**Debug:**
```javascript
// Check store state
console.log('[Store] Images:', useImageWidgetStore.getState().sessionImages);

// Check API response
fetch('/api/medtech/session/images/test-enc-001')
  .then(r => r.json())
  .then(console.log);
```

---

## Performance Benchmarks

**Expected Performance:**

| Operation | Target | Actual |
|-----------|--------|--------|
| Token validation | <500ms | ___ ms |
| Session creation | <1s | ___ ms |
| Image compression (3MB → <1MB) | <2s | ___ ms |
| S3 upload (1MB image) | <3s | ___ ms |
| Ably notification | <1s | ___ ms |
| Desktop image load | <2s | ___ ms |
| **Total mobile → desktop** | **<10s** | **___ s** |

---

## Success Criteria

### Phase 1B Complete When:
- ✅ All 11 tests pass
- ✅ Mobile → Desktop sync works reliably
- ✅ Images compressed <1MB
- ✅ Auto-retry handles network failures
- ✅ Sessions expire correctly (token 10min, session 2hr)
- ✅ Desktop widget shows images with metadata
- ✅ End-to-end flow <10 seconds (mobile upload → desktop display)

---

## Next Steps After Testing

1. **Deploy to Production**
   - Merge to main branch
   - Vercel auto-deploys frontend
   - BFF auto-deploys via GitHub Actions

2. **Update PROJECT_SUMMARY.md**
   - Mark Phase 1B complete
   - Update status to "Phase 2 Ready"

3. **Begin Phase 2** (Backend Integration)
   - Update BFF commit endpoint to fetch from S3
   - POST FHIR Media resources to ALEX API
   - Test with real Medtech ALEX API

---

**Testing Started:** ___________  
**Testing Completed:** ___________  
**Issues Found:** ___________  
**Status:** [ ] Pass [ ] Fail [ ] Needs Revision
