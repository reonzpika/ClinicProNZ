# Campaign Batch Sending - Validation Scenarios

## Scenario 1: Normal Flow (36 emails, no issues)

**Steps:**
1. User clicks "Send Campaign"
2. Request 1 (Phase 1):
   - Campaign status: 'draft'
   - No existing emails
   - Creates 36 email records (status='pending')
   - Creates tracking links
   - Sets campaign status='sending'
   - Returns immediately (doesn't process batch yet)
3. Request 2 (Phase 2, Batch 1):
   - Atomically claims 8 pending emails → status='processing'
   - Sends 8 emails
   - Updates to status='sent'
   - Counts: 8 sent
   - Returns {sent: 8, total: 36, continue: true}
4. Requests 3-5: Same as #3, processing emails 9-16, 17-24, 25-32
5. Request 6 (Final batch):
   - Claims 4 remaining emails (33-36)
   - Sends them
   - Counts: 36 sent
   - No more pending emails
   - Marks campaign status='sent'
   - Returns {sent: 36, total: 36, continue: false}

**Result:** ✅ All 36 emails sent exactly once

---

## Scenario 2: Timeout During Batch Processing

**Steps:**
1-3. Same as Scenario 1
4. Request 4 (Batch 3, timeout at 10s):
   - Claims 8 emails (17-24)
   - Sends emails 17-21 (5 sent)
   - **TIMEOUT occurs** (Vercel kills function)
   - Emails 17-21: status='sent' ✅
   - Emails 22-24: status='processing' ❌ (stuck)
5. Frontend detects timeout (15s client timeout)
6. Frontend retries after 2s delay
7. Request 5 (Retry):
   - Tries to claim pending emails
   - Gets emails 25-32 (emails 22-24 are 'processing', not 'pending')
   - Sends emails 25-32
   - Counts: 21 sent (17-21 + 25-32, missing 22-24)
   
**Problem:** Emails 22-24 are stuck in 'processing' state!

**Solution Needed:** Add cleanup for stuck 'processing' emails

---

## Scenario 3: Race Condition (Two Simultaneous Requests)

**Steps:**
1-2. Same as Scenario 1
3. User opens two tabs, clicks Send in both
4. Request A (Batch 1):
   ```sql
   UPDATE openmailer_emails 
   SET status = 'processing'
   WHERE id IN (
     SELECT id WHERE status = 'pending' LIMIT 8 FOR UPDATE SKIP LOCKED
   )
   ```
   - Locks emails 1-8
   - Updates to 'processing'
   - Returns IDs 1-8
5. Request B (Batch 1, simultaneous):
   ```sql
   -- Same query
   ```
   - Tries to lock emails 1-8
   - **SKIP LOCKED skips them** (already locked by Request A)
   - Gets emails 9-16 instead
   - Updates to 'processing'
   - Returns IDs 9-16
6. Both requests send their respective batches

**Result:** ✅ No duplicates! Each request gets different emails

---

## Scenario 4: Initialization Timeout

**Steps:**
1. Request 1 (Phase 1 init):
   - Creates 20 email records
   - **TIMEOUT** before finishing all 36
   - Campaign status still 'draft'
2. Frontend retries
3. Request 2:
   - Campaign status: 'draft'
   - Checks existing emails: count=20 (alreadyInitialized=true)
   - Skips creating emails
   - Just updates campaign status='sending', totalRecipients=20
4. Proceeds to send 20 emails (not 36!)

**Problem:** Only partial list gets emails!

**Solution Needed:** Need transaction or better detection

---

## Scenario 5: User Refreshes Page Mid-Send

**Steps:**
1-4. Normal sending, 16 emails sent so far
5. User refreshes page
6. Page reloads, button shows again
7. Campaign status is 'sending' (not 'draft')
8. User clicks Send again
9. Request:
   - Phase 1 skipped (status != 'draft')
   - Phase 2: Claims next 8 pending emails
   - Continues from where it left off

**Result:** ✅ Resumes correctly!

---

## Issues Found

### Critical
1. **Stuck 'processing' emails after timeout** - emails remain in processing state forever
2. **Partial initialization** - if Phase 1 times out, some subscribers never get emails

### Medium
3. **No recovery for stuck campaigns** - if all requests fail, campaign stuck in 'sending'

### Low
4. Division by zero in progress bar - **FIXED**
5. Frontend delay logic - **FIXED**
