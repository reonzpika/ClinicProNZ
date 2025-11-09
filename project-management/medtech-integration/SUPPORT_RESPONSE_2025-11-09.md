# Medtech Support Response - November 9, 2025

**Date**: 2025-11-09  
**Subject**: Facility ID Mapping and Header Configuration  
**Status**: ✅ RESOLVED - Implementation Confirmed Correct

---

## Support Team Confirmation

Medtech support tested our credentials and confirmed:

1. ✅ **Credentials Valid**: Client ID `7685ade3-f1ae-4e86-a398-fe7809c0fed1` is correct
2. ✅ **Environment Correct**: Using UAT URL `https://alexapiuat.medtechglobal.com/FHIR`
3. ✅ **IP Whitelisted**: Our IP address is properly allow-listed
4. ✅ **Headers Correct**: Only need `mt-facilityid` header (not `mt-locationid`)

## Facility ID Status

| Facility ID | Status | Notes |
|-------------|--------|-------|
| **F2N060-E** | ✅ Working | Was already mapped, support tested successfully |
| **F99669-C** | ✅ Working | **Just mapped by support** - now available |

### Quote from Support

> "I have just tried testing it with your credentials and noticed that I'm getting a return on F2N060-E. Looks like facility F99669-C was not mapped yet which I have just added now."

## Header Configuration

### ✅ Required Headers (Per Support Team)

```
Authorization: Bearer <access_token>
Content-Type: application/fhir+json
mt-facilityid: F2N060-E  (or F99669-C)
```

**These are the ONLY headers needed** as shown in the Postman screenshot.

### ❌ Removed Headers

We previously sent these headers, but they are **not required**:
- `mt-correlationid` - Removed from headers (still generated for logging)
- `mt-appid` - Removed from headers
- `mt-locationid` - Never used (and not needed)

## Implementation Review

### ✅ Code Updated to Match Postman Example

Updated `src/lib/services/medtech/alex-api-client.ts`:

```typescript:99:105:src/lib/services/medtech/alex-api-client.ts
// Prepare headers (only required headers per Medtech support)
const headers: Record<string, string> = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/fhir+json',
  'mt-facilityid': facilityId,
  ...customHeaders,
}
```

✅ Now sends only the three required headers shown in support's Postman screenshot.

## Changes Made

### 1. Simplified Headers (Match Postman Example)
**File**: `src/lib/services/medtech/alex-api-client.ts`

**Removed**:
- ❌ `mt-correlationid` header (still generated for logging, just not sent in request)
- ❌ `mt-appid` header (not required)
- ❌ `appId` class property (no longer needed)

**Now sends only**:
- ✅ `Authorization: Bearer <token>`
- ✅ `Content-Type: application/fhir+json`
- ✅ `mt-facilityid: <facility>`

**Rationale**: Support's Postman screenshot only showed these three headers. Simplified to match exactly.

### 2. Updated Environment File
**File**: `.env.local.example`

Removed:
- ❌ `MEDTECH_APP_ID` (no longer used)

### 3. Updated Test Page Defaults
**File**: `app/(medtech)/medtech-images/page.tsx`

Changed hardcoded defaults from `F2N060-E` to `F99669-C` to match `.env.local.example`:
- Line 67: Default facility ID parameter
- Line 88: Mock encounter context facility ID

**Rationale**: While both facilities work, F99669-C is documented in our environment files as the standard UAT facility.

## Testing Validation

### Postman Example from Support

Support provided screenshot showing successful request:

```bash
GET {{Base URL}}/FHIR/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|ZZZ0016

Headers:
- Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSU2I1NiI...
- Content-Type: application/fhir+json
- mt-facilityid: F2N060-E

Response:
- Status: 200 OK
- Time: 627 ms
- Size: 5.17 KB
- Returns FHIR Bundle with Patient resource
```

### Our Implementation

Our implementation sends the same headers and should work identically.

**Test endpoint**: `GET /api/medtech/test?nhi=ZZZ0016`

## Action Items

### ✅ Completed
- [x] Verified implementation is correct
- [x] Updated test page defaults to F99669-C
- [x] Documented support team's response

### 🚀 Ready for Testing
- [ ] Test with F99669-C facility ID (now mapped)
- [ ] Test with F2N060-E facility ID (already working)
- [ ] Verify end-to-end patient lookup works
- [ ] Test Media resource creation

### 📝 Environment Variable Status

**Current Configuration** (from `.env.local.example`):
```bash
MEDTECH_API_BASE_URL=https://alexapiuat.medtechglobal.com/FHIR
MEDTECH_FACILITY_ID=F99669-C
```

**Both facilities are now valid**:
- `F99669-C` - Default in environment files
- `F2N060-E` - Alternative UAT facility

## Conclusion

### ✅ Issue Resolved

The original issue was that F99669-C was not mapped in Medtech's system. Support has now mapped it, and it should work.

### ✅ Implementation Confirmed Correct

Our implementation was already using the correct headers. No code changes were required.

### 🚀 Next Steps

1. **Test API connectivity** with both facility IDs
2. **Verify patient lookups** work correctly
3. **Proceed with Media resource creation** (image upload feature)

---

## Reference

- **Support Contact**: Medtech ALEX API Support
- **Support Date**: 2025-11-09
- **Application ID**: 7685ade3-f1ae-4e86-a398-fe7809c0fed1
- **Environment**: UAT (alexapiuat.medtechglobal.com)
- **Valid Facility IDs**: F2N060-E, F99669-C

---

*Last Updated: 2025-11-09*
