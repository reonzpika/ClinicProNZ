# Medtech Integration - Immediate Action Plan

**Created**: 2025-11-07  
**Priority**: HIGH - Clear revenue path once complete  
**Status**: Ready for end-to-end testing

---

## Current Status

✅ **Infrastructure Complete**:
- OAuth service implemented and tested
- BFF deployed to Lightsail (api.clinicpro.co.nz)
- IP allow-listing resolved (Azure network security group added)
- ALEX API client ready
- Frontend widget Phase 1 complete

⏳ **Remaining Work**:
- Update Facility ID in environment variables
- Test BFF → ALEX API connectivity
- Implement POST Media endpoint (replace mock)
- End-to-end testing

---

## Step 1: Update Facility ID (5 minutes)

**Action**: Update `MEDTECH_FACILITY_ID` from `F2N060-E` to `F99669-C` in:

1. **Vercel Environment Variables** (Production):
   - Go to Vercel dashboard → ClinicPro project → Settings → Environment Variables
   - Update `MEDTECH_FACILITY_ID` = `F99669-C`
   - Redeploy if needed

2. **Lightsail BFF Environment** (if using .env file):
   - SSH into Lightsail instance
   - Update `/opt/clinicpro-bff/.env` or systemd environment
   - Restart service: `sudo systemctl restart clinicpro-bff`

3. **Local Development** (`.env.local`):
   - Update `MEDTECH_FACILITY_ID=F99669-C`

**Files that reference old ID** (documentation only - no code changes needed):
- `src/lib/services/medtech/alex-api-client.ts` (comment only)
- Test scripts in `project-management/medtech-integration/testing/`
- Documentation files

**Note**: The code reads from environment variables, so updating env vars is sufficient.

---

## Step 2: Test BFF → ALEX API Connectivity (10 minutes)

**Test Endpoint**: `GET /api/medtech/test?nhi=ZZZ0016`

**How to Test**:

1. **Via Browser/curl**:
   ```bash
   curl "https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016"
   ```

2. **Expected Success Response**:
   ```json
   {
     "success": true,
     "correlationId": "...",
     "duration": 1234,
     "environment": {
       "baseUrl": "https://alexapiuat.medtechglobal.com/FHIR",
       "facilityId": "F99669-C",
       "hasClientId": true,
       "hasClientSecret": true
     },
     "tokenInfo": {
       "isCached": false,
       "expiresIn": 3599
     },
     "fhirResult": {
       "resourceType": "Bundle",
       "type": "searchset",
       "total": 1,
       "patientCount": 1,
       "firstPatient": {
         "id": "...",
         "name": {...},
         "gender": "...",
         "birthDate": "..."
       }
     }
   }
   ```

3. **If 401/403 Error**:
   - Check OAuth credentials are correct
   - Verify IP allow-listing (should be resolved)
   - Check facility ID matches Medtech Evolution test instance

4. **If 500 Error**:
   - Check BFF logs: `sudo journalctl -u clinicpro-bff -f`
   - Verify environment variables are set correctly
   - Check OAuth token service is working

**Success Criteria**: 
- ✅ Returns 200 status
- ✅ `fhirResult.patientCount > 0`
- ✅ Token acquired successfully

---

## Step 3: Implement POST Media Endpoint (2-4 hours)

**Current Status**: Mock implementation in `app/api/(integration)/medtech/attachments/commit/route.ts`

**Action**: Replace mock with real ALEX API integration

### Implementation Steps:

1. **Review FHIR Media Resource Structure**:
   - Reference: `src/lib/services/medtech/types.ts` (Media type)
   - Reference: ALEX API docs (https://alexapidoc.medtechglobal.com/)
   - Each image = 1 Media resource
   - Media automatically creates Daily Record entry

2. **Update Commit Route**:
   ```typescript
   // Replace mock with:
   import { alexApiClient } from '@/src/lib/services/medtech/alex-api-client'
   import type { FhirMedia } from '@/src/lib/services/medtech/types'
   
   // For each file in body.files:
   // 1. Create Media resource
   // 2. POST to /Media endpoint
   // 3. Handle success/errors
   ```

3. **Media Resource Structure** (per image):
   ```typescript
   {
     resourceType: 'Media',
     status: 'completed',
     type: {
       coding: [{
         system: 'http://terminology.hl7.org/CodeSystem/media-type',
         code: 'photo',
         display: 'Photo'
       }]
     },
     subject: {
       reference: `Patient/${patientId}`
     },
     encounter: {
       reference: `Encounter/${encounterId}`
     },
     content: {
       contentType: 'image/jpeg',
       url: `https://s3-url-to-image`
     },
     // Note: Optional metadata (body site, laterality, etc.) 
     // cannot be mapped to Medtech Inbox fields
     // Can embed in image EXIF or use for internal tracking only
   }
   ```

4. **Error Handling**:
   - Handle partial failures (some images succeed, some fail)
   - Return per-file status in response
   - Log errors with correlation IDs

5. **Testing**:
   - Test with 1 image
   - Test with multiple images
   - Test error scenarios (invalid encounter, missing patient, etc.)

**Reference Implementation**: See `src/lib/services/medtech/alex-api-client.ts` for request pattern

**Success Criteria**:
- ✅ Images appear in Medtech Evolution Inbox
- ✅ Images appear in Daily Record
- ✅ Partial failures handled gracefully
- ✅ Error messages are user-friendly

---

## Step 4: End-to-End Testing (1-2 hours)

**Test Flow**:
1. Launch widget from Medtech Evolution (or test page)
2. Upload 1-2 test images
3. Add metadata (body site, laterality, etc.)
4. Commit images
5. Verify in Medtech Evolution:
   - Check Inbox for new messages
   - Check Daily Record for Media entries
   - Verify images are accessible

**Test Scenarios**:
- ✅ Single image commit
- ✅ Multiple images commit
- ✅ Metadata capture (even if not stored in Medtech)
- ✅ Error handling (network failure, invalid encounter)
- ✅ Mobile QR handoff flow (if applicable)

**Success Criteria**:
- ✅ Images successfully saved to Medtech
- ✅ No errors in console/logs
- ✅ User sees success feedback
- ✅ Ready to demo to Medtech customers

---

## Step 5: Prepare Customer Pitch Materials (1-2 hours)

**Once testing is complete**:

1. **Demo Script**:
   - 2-minute walkthrough
   - Key benefits (capture from Medtech, instant availability)
   - Mobile QR handoff demo

2. **1-Pager**:
   - What it does
   - How it works
   - Benefits for GPs
   - Pricing (if determined)

3. **Technical Specs**:
   - Requirements (Medtech Evolution/Medtech32)
   - Installation process
   - Support contact

**Target**: Medtech's existing customer base (3,000+ GPs)

---

## Timeline Estimate

- **Step 1** (Update Facility ID): 5 minutes
- **Step 2** (Test Connectivity): 10 minutes
- **Step 3** (Implement POST Media): 2-4 hours
- **Step 4** (End-to-End Testing): 1-2 hours
- **Step 5** (Pitch Materials): 1-2 hours

**Total**: 4-8 hours of focused work

**Target Completion**: This week (Nov 11-17)

---

## Next Actions (After Completion)

1. **Demo to Medtech** (if needed for approval)
2. **Pitch to Medtech Customers**:
   - Email campaign to Medtech customer base
   - Demo requests
   - Pilot sign-ups
3. **Revenue Generation**:
   - Convert pilots to paid customers
   - Scale to more practices
   - Build next modular feature

---

## Notes

- **Revenue Path**: Clear - Medtech's existing customers = immediate revenue opportunity
- **Competitive Advantage**: Integrated into Medtech (not standalone like ClinicPro)
- **Modular Approach**: Images widget is first module; can add more features later
- **Solo Founder Context**: Technical work aligns with skills; high ROI activity

---

*Focus: Complete Steps 1-4 this week. Revenue opportunity awaits.*
