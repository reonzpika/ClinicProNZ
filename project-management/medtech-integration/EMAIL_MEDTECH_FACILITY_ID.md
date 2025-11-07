# Email to Medtech Support - Facility ID Issue

**Subject**: Facility ID Configuration for ALEX API UAT - Application ID 7685ade3-f1ae-4e86-a398-fe7809c0fed1

---

**To**: [Medtech Support Email]  
**From**: [Your Email]  
**Date**: 2025-11-07

---

Hi Medtech Support,

I'm integrating with ALEX API UAT and encountering a "Practice Facility not found" error when making FHIR API calls.

**Details:**
- **Application ID**: `7685ade3-f1ae-4e86-a398-fe7809c0fed1`
- **Environment**: UAT (`alexapiuat.medtechglobal.com/FHIR`)
- **Error**: 403 Forbidden - "Practice Facility not found"
- **Facility IDs tested**: `F2N060-E` and `F99669-C` (both return same error)

**What's working:**
- ✅ OAuth token acquisition successful
- ✅ IP allow-listing configured (13.236.58.12)
- ✅ Headers correctly formatted (`mt-facilityid`, `mt-correlationid`, `mt-appid`)

**Question:**
Could you please confirm:
1. What facility ID should I use in the `mt-facilityid` header for my Application ID?
2. Is the facility ID format alphanumeric (e.g., `F2N060-E`) or numeric (e.g., `12345678`)?
3. Does the facility ID need to be approved/configured for my Application ID in your system?

**Note:** The error is "Practice Facility not found" (not "Patient not found"), which indicates the facility ID validation is failing before the patient query is processed. The test patient NHI (`ZZZ0016`) is just used for testing - the issue is specifically with facility ID recognition.

**Example request that's failing:**
```
GET https://alexapiuat.medtechglobal.com/FHIR/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|ZZZ0016
Headers:
- Authorization: Bearer [token]
- mt-facilityid: F2N060-E (or F99669-C)
- mt-correlationid: [uuid]
- mt-appid: clinicpro-images-widget
```

**Response:** 403 Forbidden - "Practice Facility not found"

Thank you for your assistance.

Best regards,  
[Your Name]  
[Your Company]  
[Contact Details]

---

**Alternative shorter version:**

---

Hi Medtech Support,

I'm getting "Practice Facility not found" (403) when calling ALEX API UAT.

**Application ID**: `7685ade3-f1ae-4e86-a398-fe7809c0fed1`  
**Facility IDs tested**: `F2N060-E`, `F99669-C` (both fail)

OAuth and IP allow-listing are working. Could you confirm:
1. What facility ID should I use for my Application ID?
2. Does it need to be approved/configured in your system?

**Note:** The error is "Practice Facility not found" (not "Patient not found"), indicating facility ID validation is failing. The test patient NHI (`ZZZ0016`) is just for testing - the issue is with facility ID recognition.

Thanks,  
[Your Name]
