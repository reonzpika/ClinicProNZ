# Medtech Integration - Testing Checklist

**Created**: 2025-11-13  
**Last Updated**: 2025-11-13  
**Status**: Ready for Testing  
**Phase**: Phase 1 - Mobile Upload & Dataflow Review

---

## Prerequisites

Before testing, ensure:

- [ ] **Environment Variables Set**:
  - `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
  - `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST Token
  - `NEXT_PUBLIC_MEDTECH_USE_MOCK` - Set to `"true"` for testing (or use real API)

- [ ] **Test Environment Ready**:
  - Desktop browser (Chrome/Firefox recommended)
  - Mobile device or mobile browser emulator
  - Network connection (test both online and offline scenarios)

---

## 1. Bug Fix Verification Tests

### 1.1 Memory Leak Tests

#### Mobile Page Preview URL Memory Leak
- [ ] **Test**: Open mobile page, capture/select multiple images
- [ ] **Verify**: Check browser DevTools Memory profiler - blob URLs should be revoked when:
  - Component unmounts (navigate away from mobile page)
  - User clicks "Finish" and images are cleared
- [ ] **Expected**: No accumulation of blob URLs in memory over time
- [ ] **How to verify**: 
  - Open Chrome DevTools → Memory tab
  - Take heap snapshot before and after operations
  - Check for `blob:` URLs in memory

#### Desktop Widget Blob URL Memory Leak
- [ ] **Test**: Add multiple images to desktop widget (via upload or mobile)
- [ ] **Verify**: Remove images one by one
- [ ] **Expected**: Blob URLs revoked in store (`removeImage`, `clearAllImages`, `clearCommittedImages`)
- [ ] **How to verify**: Check browser console for any memory warnings

### 1.2 Async Unload Handler Test

#### Desktop Widget Session Cleanup
- [ ] **Test**: Open desktop widget, generate QR code, then close/refresh the page
- [ ] **Verify**: Check browser Network tab - DELETE request to `/api/medtech/mobile/session/{token}` should complete
- [ ] **Expected**: Session deleted in Redis (no orphaned sessions)
- [ ] **How to verify**:
  - Open DevTools → Network tab
  - Filter by "session"
  - Close/refresh page
  - Verify DELETE request shows status 200 (not cancelled)
  - Check Redis to confirm session is deleted

### 1.3 SSE Race Condition Test

#### Poll Interval After Session Expiration
- [ ] **Test**: 
  1. Open desktop widget and connect to mobile session
  2. Manually expire session in Redis (or wait for TTL)
  3. Observe SSE connection behavior
- [ ] **Verify**: 
  - Poll interval stops immediately when session expires
  - No errors in console about sending to closed stream
  - `isPolling` flag prevents concurrent polls
- [ ] **Expected**: Clean shutdown, no race conditions
- [ ] **How to verify**: Check browser console for errors

### 1.4 WebSocket Reconnect Timeout Leak Test

#### Duplicate Connection Prevention
- [ ] **Test**: 
  1. Open desktop widget
  2. Simulate connection failure (disable network briefly)
  3. Re-enable network and let it reconnect
  4. Repeat multiple times
- [ ] **Verify**: Only one EventSource connection exists at a time
- [ ] **Expected**: No duplicate connections, pending timeouts cleared on success
- [ ] **How to verify**: 
  - Check DevTools → Network tab → Filter by "ws" or "event-stream"
  - Should see only one active SSE connection
  - Check console for connection logs

---

## 2. Core Functionality Tests

### 2.1 QR Code Generation

- [ ] **Test**: Open desktop widget (`/medtech-images?encounterId=test&patientId=test`)
- [ ] **Verify**: 
  - QR code displays correctly
  - QR code contains valid session token
  - QR code URL format: `/medtech-images/mobile?t={token}`
- [ ] **Expected**: QR code is scannable and leads to mobile page

### 2.2 Mobile Page Access

- [ ] **Test**: Scan QR code or navigate to `/medtech-images/mobile?t={token}`
- [ ] **Verify**: 
  - Mobile page loads correctly
  - Token is extracted from URL
  - Page shows capture options (camera, gallery)
- [ ] **Expected**: Mobile page accessible with valid token

### 2.3 Image Capture Flow

#### Camera Capture
- [ ] **Test**: Click "Take Photo" → Capture image with camera
- [ ] **Verify**: 
  - Camera opens (on mobile device)
  - Image is captured
  - User is taken to review screen
  - Image preview displays correctly
- [ ] **Expected**: Smooth capture → review flow

#### Gallery Selection
- [ ] **Test**: Click "Upload from Device" → Select image(s) from gallery
- [ ] **Verify**: 
  - File picker opens
  - Multiple images can be selected
  - Images are compressed
  - All selected images appear in review
- [ ] **Expected**: Multiple images can be selected and processed

### 2.4 Image Review & Metadata

- [ ] **Test**: After capturing/selecting image, review it
- [ ] **Verify**: 
  - Image preview displays
  - Metadata form is available (collapsible)
  - Quick-select chips work (laterality, body site, view, type)
  - Expanded metadata form works
  - Metadata is optional (can skip)
- [ ] **Expected**: User can add metadata or skip

### 2.5 Upload Flow

#### "Take More" Flow
- [ ] **Test**: After reviewing image, click "Take More"
- [ ] **Verify**: 
  - Current image uploads in background
  - Camera/capture screen returns
  - Previous image shows "uploading" then "uploaded" status
  - Can capture more images
- [ ] **Expected**: Background upload works, user can continue capturing

#### "Finish" Flow
- [ ] **Test**: After reviewing image(s), click "Finish"
- [ ] **Verify**: 
  - All pending images upload
  - Upload progress shown for each image
  - UI resets to capture screen after upload completes
  - Images appear on desktop widget
- [ ] **Expected**: All images upload and sync to desktop

### 2.6 Real-Time Desktop Sync

- [ ] **Test**: Upload image from mobile while desktop widget is open
- [ ] **Verify**: 
  - Image appears on desktop automatically (no refresh needed)
  - Image appears in thumbnail strip
  - Image preview is correct
  - Metadata is preserved
- [ ] **Expected**: Real-time sync via SSE works

#### Multiple Images Sync
- [ ] **Test**: Upload multiple images rapidly from mobile
- [ ] **Verify**: 
  - All images appear on desktop
  - No duplicates
  - Images appear in correct order
  - No race conditions
- [ ] **Expected**: All images sync correctly

---

## 3. Error Handling & Edge Cases

### 3.1 Network Errors

#### Mobile Upload Failure
- [ ] **Test**: Disconnect network, try to upload image
- [ ] **Verify**: 
  - Upload fails gracefully
  - Image saved to offline queue (localStorage)
  - Error message shown to user
  - Image shows "error" status
- [ ] **Expected**: Offline queue works, user can retry later

#### SSE Connection Failure
- [ ] **Test**: Disconnect network while desktop widget is open
- [ ] **Verify**: 
  - SSE connection attempts to reconnect
  - Exponential backoff works (delays increase: 2s, 4s, 8s, 16s, 32s)
  - Reconnects when network returns
  - Images sync after reconnection
- [ ] **Expected**: Auto-reconnect with exponential backoff

### 3.2 Session Management

#### Invalid Token
- [ ] **Test**: Navigate to `/medtech-images/mobile?t=invalid-token`
- [ ] **Verify**: 
  - Error message shown
  - User prompted to scan QR code again
- [ ] **Expected**: Graceful error handling

#### Expired Session
- [ ] **Test**: 
  1. Generate QR code
  2. Wait for session to expire (or manually expire in Redis)
  3. Try to upload from mobile
- [ ] **Verify**: 
  - Error message shown
  - User prompted to reconnect
- [ ] **Expected**: Session expiration handled gracefully

#### Desktop Widget Closed
- [ ] **Test**: 
  1. Generate QR code on desktop
  2. Close desktop widget (close tab/refresh)
  3. Try to upload from mobile
- [ ] **Verify**: 
  - Session deleted (DELETE request sent)
  - Mobile shows session expired error
  - User can scan new QR code
- [ ] **Expected**: Session cleanup works

### 3.3 Image Processing

#### Large Images
- [ ] **Test**: Upload very large image (>10MB)
- [ ] **Verify**: 
  - Image is compressed
  - Upload succeeds
  - Image quality is acceptable
- [ ] **Expected**: Compression works for large images

#### Multiple Images at Once
- [ ] **Test**: Select 10+ images from gallery
- [ ] **Verify**: 
  - All images process correctly
  - Compression doesn't block UI
  - All images upload successfully
- [ ] **Expected**: Batch processing works

#### Invalid Image Format
- [ ] **Test**: Try to upload non-image file (if file picker allows)
- [ ] **Verify**: 
  - Error handling
  - User-friendly error message
- [ ] **Expected**: Invalid files rejected gracefully

---

## 4. Integration Tests

### 4.1 End-to-End Flow

- [ ] **Test**: Complete flow from desktop → mobile → desktop
  1. Open desktop widget
  2. Generate QR code
  3. Scan QR code on mobile
  4. Capture image
  5. Add metadata (optional)
  6. Upload image
  7. Verify image appears on desktop
  8. Add more metadata on desktop (if needed)
  9. Commit image to Medtech
- [ ] **Verify**: Entire flow works smoothly
- [ ] **Expected**: Seamless handoff between desktop and mobile

### 4.2 Multiple Mobile Devices

- [ ] **Test**: 
  1. Generate QR code on desktop
  2. Scan QR code on Device A
  3. Scan same QR code on Device B
  4. Upload images from both devices
- [ ] **Verify**: 
  - Both devices can upload to same session
  - All images appear on desktop
  - No conflicts or errors
- [ ] **Expected**: Multiple devices can use same session

### 4.3 Concurrent Operations

- [ ] **Test**: 
  1. Upload image from mobile
  2. Simultaneously upload image from desktop
  3. Both operations complete successfully
- [ ] **Verify**: 
  - No race conditions
  - Both images appear correctly
  - No data loss
- [ ] **Expected**: Concurrent operations work correctly

---

## 5. Performance Tests

### 5.1 Memory Usage

- [ ] **Test**: Upload 20+ images in a session
- [ ] **Verify**: 
  - Memory usage doesn't grow unbounded
  - Blob URLs are revoked properly
  - No memory leaks
- [ ] **Expected**: Memory usage stays reasonable

### 5.2 Upload Speed

- [ ] **Test**: Upload multiple images
- [ ] **Verify**: 
  - Compression doesn't take too long
  - Upload completes in reasonable time
  - Progress indicators work
- [ ] **Expected**: Good performance (<5s per image for compression + upload)

### 5.3 SSE Connection Stability

- [ ] **Test**: Keep desktop widget open for 30+ minutes
- [ ] **Verify**: 
  - SSE connection stays alive
  - Heartbeat works
  - No disconnections
  - Images still sync
- [ ] **Expected**: Long-lived connections work

---

## 6. Browser Compatibility

### 6.1 Desktop Browsers

- [ ] **Chrome** (latest): All features work
- [ ] **Firefox** (latest): All features work
- [ ] **Safari** (latest): All features work
- [ ] **Edge** (latest): All features work

### 6.2 Mobile Browsers

- [ ] **Chrome Mobile**: Camera, gallery, upload work
- [ ] **Safari Mobile**: Camera, gallery, upload work
- [ ] **Firefox Mobile**: Camera, gallery, upload work

---

## 7. Security Tests

### 7.1 Token Security

- [ ] **Test**: Try to access session with invalid token
- [ ] **Verify**: Access denied
- [ ] **Expected**: Tokens are validated

### 7.2 Session Isolation

- [ ] **Test**: Generate two QR codes, try to use token from one in the other
- [ ] **Verify**: Sessions are isolated
- [ ] **Expected**: No cross-session access

---

## 8. Regression Tests

### 8.1 Desktop Widget Features

- [ ] **Test**: All existing desktop features still work
  - Image capture from desktop
  - Image editing
  - Metadata form
  - Commit to Medtech
  - Error handling
- [ ] **Verify**: No regressions
- [ ] **Expected**: All existing features work

---

## Testing Notes

### How to Test Memory Leaks

1. **Chrome DevTools Memory Profiler**:
   - Open DevTools → Memory tab
   - Take heap snapshot before operation
   - Perform operation (upload images, remove images, etc.)
   - Take heap snapshot after operation
   - Compare snapshots - look for `blob:` URLs that weren't cleaned up

2. **Monitor Console**:
   - Watch for memory warnings
   - Check for errors related to blob URLs

### How to Test SSE Connection

1. **Chrome DevTools Network Tab**:
   - Filter by "event-stream" or "ws"
   - Watch for SSE connection
   - Check connection status (should be "pending" then "200")
   - Monitor for reconnections

2. **Console Logs**:
   - Check for `[WebSocket]` or `[SSE]` logs
   - Verify connection lifecycle

### How to Test Session Cleanup

1. **Redis Inspection**:
   - Connect to Upstash Redis
   - Check for session keys: `medtech:mobile-session:{token}`
   - Verify sessions are deleted after widget closes

2. **Network Tab**:
   - Watch for DELETE request to `/api/medtech/mobile/session/{token}`
   - Verify request completes (not cancelled)

---

## Test Results Template

```
Date: [DATE]
Tester: [NAME]
Environment: [LOCAL/STAGING/PRODUCTION]

### Bug Fixes
- [ ] Memory leaks: PASS/FAIL
- [ ] Async unload: PASS/FAIL
- [ ] SSE race condition: PASS/FAIL
- [ ] Reconnect timeout leak: PASS/FAIL

### Core Functionality
- [ ] QR code generation: PASS/FAIL
- [ ] Mobile upload: PASS/FAIL
- [ ] Desktop sync: PASS/FAIL
- [ ] Metadata form: PASS/FAIL

### Issues Found
[List any issues found during testing]

### Notes
[Any additional notes]
```

---

## Next Steps After Testing

1. **Document Issues**: Log any bugs or issues found
2. **Fix Critical Issues**: Address any blocking bugs
3. **Update Documentation**: Update PROJECT_SUMMARY.md with test results
4. **Proceed to Phase 1.3**: Dataflow review (Desktop/Mobile → Medtech)

---

**Last Updated**: 2025-11-13
