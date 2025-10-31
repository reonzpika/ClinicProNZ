# ALEX Media API — Critical Findings

**Date**: 2025-10-30  
**Source**: ALEX API Documentation (Postman collection analysis)  
**Status**: ⚠️ **Major Gap Identified**

---

## 🔍 What I Found

### ✅ **POST Media Endpoint EXISTS**

**Endpoint**: `POST https://alexapiuat.medtechglobal.com/FHIR/Media`

**Added**: v2.2 (August 2024) - "Added image file support for POST Media operation"

**Example from ALEX Docs**:
```json
{
  "resourceType": "Media",
  "status": "completed",
  "identifier": [
    {
      "value": "Media Image Document no 678999"
    }
  ],
  "subject": {
    "reference": "https://alexapitest.medtechglobal.com/fhir/Patient/14e52e16edb7a435bfa05e307afd008b"
  },
  "createdDateTime": "2021-11-30T17:09:32+13:00",
  "operator": {
    "reference": "https://alexapitest.medtechglobal.com/fhir/Practitioner/9a724aeb8da0552d6a48a864b7bf62f3"
  },
  "content": {
    "contentType": "application/pdf",
    "data": "<base64-encoded-binary-data>"
  }
}
```

---

## ❌ **Clinical Metadata NOT Documented**

### **Missing from ALEX Documentation**:

1. ❌ **Body Site** — No extension URL or field documented
2. ❌ **Laterality** — No extension URL or field documented  
3. ❌ **View Type** (Close-up, Dermoscopy, Other) — Not documented
4. ❌ **Image Type** (Lesion, Rash, Wound, Infection) — Not documented
5. ❌ **Clinical Date/Time Override** — Not documented
6. ❌ **Provenance / DocumentReference.relatesTo** — Not documented

### **Custom Fields/Extensions Documented** (NOT image-related):
- ✅ A/C Holder Extension (Patient resource)
- ✅ WINZ No Extension (Patient resource)
- ✅ Sex at Birth Extension (Patient resource)
- ✅ Country Extensions (Patient resource)
- ✅ Visa Extensions (Patient resource)

**Conclusion**: All documented custom extensions are for **Patient resource only**, not Media or DocumentReference.

---

## 🎯 Key Question: Standard FHIR vs Custom Extensions?

### **FHIR R4 Media Resource Standard Fields**:

According to FHIR R4 specification (https://hl7.org/fhir/R4/media.html):

```json
{
  "resourceType": "Media",
  "bodySite": {  // ⬅️ STANDARD FHIR FIELD (0..1)
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "40983000",
        "display": "Forearm"
      }
    ]
  },
  "modality": {  // ⬅️ Could use for "view type"?
    "coding": [
      {
        "system": "http://dicom.nema.org/resources/ontology/DCM",
        "code": "...",
        "display": "..."
      }
    ]
  },
  "view": {  // ⬅️ STANDARD FHIR FIELD (0..1)
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "...",
        "display": "..."
      }
    ]
  }
}
```

**Critical Discovery**: FHIR R4 Media resource HAS standard fields for:
- ✅ **`bodySite`** (CodeableConcept) — "Observed body part"
- ✅ **`view`** (CodeableConcept) — "Imaging view"
- ✅ **`modality`** (CodeableConcept) — "The type of acquisition equipment/process"

**Laterality**: Typically encoded within `bodySite` using SNOMED CT post-coordination (e.g., "Left forearm" = code with laterality qualifier)

---

## 🤔 Two Possible Scenarios

### **Scenario A: ALEX Supports Standard FHIR Fields (Most Likely)**

ALEX accepts POST Media with standard FHIR R4 fields:

```json
{
  "resourceType": "Media",
  "status": "completed",
  "bodySite": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "40983000",
        "display": "Forearm"
      }
    ]
  },
  "subject": { "reference": "Patient/..." },
  "createdDateTime": "2025-10-30T12:00:00Z",
  "operator": { "reference": "Practitioner/..." },
  "content": {
    "contentType": "image/jpeg",
    "data": "<base64>"
  }
}
```

**Laterality**: Can be included in `bodySite` coding or as a separate laterality extension (HL7 NZ may have standard)

**View/Type**: Use standard `view` and `modality` fields with appropriate code systems

**Why docs don't show it**: Example is minimal; full schema not documented

---

### **Scenario B: ALEX Requires Custom Extensions (Less Likely)**

ALEX might require Medtech-specific extensions like:

```json
{
  "resourceType": "Media",
  "extension": [
    {
      "url": "http://alexapi.medtechglobal.com/fhir/StructureDefinition/bodySite",
      "valueCodeableConcept": { ... }
    },
    {
      "url": "http://alexapi.medtechglobal.com/fhir/StructureDefinition/laterality",
      "valueCodeableConcept": { ... }
    }
  ],
  ...
}
```

**Why unlikely**: Standard FHIR fields should be sufficient; custom extensions typically for PMS-specific data

---

## 📋 What We Need from Medtech Support

### **Critical Questions** (add to support ticket):

1. **Body Site Support**:
   > "Does POST Media accept the standard FHIR R4 `bodySite` field (CodeableConcept with SNOMED CT codes)? Or does ALEX require a custom extension? If custom, what is the extension URL?"

2. **Laterality Support**:
   > "How should we specify laterality (Right, Left, Bilateral, N/A)? Options:
   > - SNOMED CT qualifier within bodySite (e.g., 'Left forearm')
   > - Separate laterality field/extension
   > - HL7 NZ laterality extension
   > 
   > Please provide example JSON."

3. **View Type**:
   > "Can we use the standard FHIR Media.view field for clinical image views (e.g., 'close-up', 'dermoscopy')? If so, what code system should we use? If not, is there a custom extension?"

4. **Image Type** (Lesion, Rash, Wound, etc.):
   > "How should we categorize clinical image types? Options:
   > - Media.modality field
   > - Media.type field (currently only supports photo/video/audio)
   > - Custom extension
   > 
   > Please provide extension URL and code system if custom."

5. **Full POST Media Schema**:
   > "The Postman documentation shows a minimal Media example. Can you provide a complete example showing:
   > - Body site with laterality
   > - Image type/classification
   > - View type
   > - Clinical date/time (if different from createdDateTime)
   > - All supported optional fields"

6. **DocumentReference Auto-Creation**:
   > "When we POST Media, does ALEX automatically create a linked DocumentReference resource, or must we POST both separately?"

7. **Encounter Linkage**:
   > "How do we link the Media resource to the active encounter? Is it:
   > - Media.encounter (standard FHIR field - not in R4 Media, but exists in other resources)
   > - Media.context (deprecated in R4)
   > - Extension
   > - Implied from patient/operator context?"

---

## 🚀 Recommended Immediate Actions

### **1. Test Standard FHIR Fields First** (Low Risk)

Try POST Media with standard `bodySite` field to UAT:

```bash
POST https://alexapiuat.medtechglobal.com/FHIR/Media

{
  "resourceType": "Media",
  "status": "completed",
  "type": "photo",
  "bodySite": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "40983000",
        "display": "Forearm"
      }
    ],
    "text": "Left forearm"
  },
  "subject": {
    "reference": "Patient/<test-patient-id>"
  },
  "createdDateTime": "2025-10-30T12:00:00+13:00",
  "operator": {
    "reference": "Practitioner/<test-practitioner-id>"
  },
  "content": {
    "contentType": "image/jpeg",
    "data": "<small-base64-test-image>"
  }
}
```

**Expected Outcomes**:
- ✅ **201 Created**: Standard fields accepted; proceed with implementation
- ❌ **400 Bad Request**: Field not supported; check error message for guidance
- ❌ **422 Unprocessable Entity**: Validation error; may need custom approach

---

### **2. Update Email to Medtech** (High Priority)

Add the 7 questions above to your support ticket draft (`email-draft-uat-testing-access.md`)

---

### **3. Revise PRD API Contracts** (After Medtech Response)

Current PRD assumes custom ClinicPro Gateway API. Reality:
- Gateway will translate PRD metadata → FHIR Media fields/extensions
- Mapping depends on Medtech's answers

**Example Mapping** (if standard FHIR fields work):

| PRD Field | FHIR Media Field | Code System |
|-----------|------------------|-------------|
| bodySite | `bodySite.coding` | SNOMED CT |
| laterality | `bodySite.text` or separate coding | SNOMED CT |
| view | `view.coding` | TBD (SNOMED CT? Custom?) |
| type | `modality.coding` or extension | TBD |

---

### **4. Don't Block Development**

While waiting for Medtech response:

**Can Proceed**:
- ✅ Build Integration Gateway OAuth service
- ✅ Build frontend UI with mock backend
- ✅ Design metadata capture UX
- ✅ Implement client-side image compression

**Must Wait**:
- ❌ Final FHIR mapping (body site, laterality, view, type)
- ❌ POST Media implementation
- ❌ End-to-end testing

**Timeline**: Aim for Medtech response within 5 business days; parallel frontend work can continue.

---

## 📊 Revised Assessment

### **What ALEX Documentation Provides**:
- ✅ POST Media endpoint exists (v2.2, Aug 2024)
- ✅ Image file support confirmed
- ✅ Basic Media resource structure shown
- ✅ Base64 inline data format confirmed

### **What ALEX Documentation LACKS**:
- ❌ Body site/laterality field/extension documentation
- ❌ Clinical metadata (view, type) guidance
- ❌ Full Media resource schema with all supported fields
- ❌ Encounter linkage mechanism
- ❌ Provenance/edited image linking

### **What We Must Ask Medtech**:
- ❓ Standard FHIR fields vs custom extensions?
- ❓ SNOMED CT code systems supported?
- ❓ Encounter linkage approach?
- ❓ Full POST Media example with clinical metadata?

---

## ✅ Next Steps (Updated)

1. **Delete** `alex-section-10-review-guide.md` (not relevant; no image extensions documented)
2. **Update** `email-draft-uat-testing-access.md` with 7 critical questions
3. **Send** email to Medtech support
4. **Optional**: Test standard FHIR fields in UAT (after token setup)
5. **Wait** for Medtech response (3-5 business days)
6. **Continue** frontend/Gateway OAuth development in parallel

---

**Conclusion**: ALEX supports POST Media for images, but clinical metadata schema is **undocumented**. We must ask Medtech whether to use standard FHIR fields (likely) or custom extensions (unlikely). This is a **blocking question** for final implementation but **not for early development**.
