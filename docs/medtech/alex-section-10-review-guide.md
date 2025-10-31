# ALEX API Section 10 Review Guide

**Your Task**: Review Section 10 (Custom Fields, Extensions, and Mapping) of the ALEX API Documentation to extract FHIR extension URLs and code systems needed for the Images Widget.

---

## 🎯 What You're Looking For

### **Critical for Images Widget** (Priority 1):

1. **Body Site Extension**
   - Extension URL (e.g., `http://alexapi.medtechglobal.com/fhir/StructureDefinition/bodySite` or similar)
   - SNOMED CT code system used
   - List of common body site codes (Face, Scalp, Trunk, Arm, Forearm, Hand, Thigh, Leg, Foot)
   - Example JSON showing usage in Media or DocumentReference

2. **Laterality Extension**
   - Extension URL
   - SNOMED CT code system
   - Codes for: Right, Left, Bilateral, Not Applicable
   - Example JSON

3. **View Type** (if documented)
   - Extension URL (likely internal Medtech namespace)
   - Codes for: Close-up, Dermoscopy, Other
   - Example JSON

4. **Image Type** (if documented)
   - Extension URL (likely internal Medtech namespace)
   - Codes for: Lesion, Rash, Wound, Infection, Other
   - Example JSON

### **Nice to Have** (Priority 2):

5. **Provenance / Derived From**
   - How to link edited images to originals
   - `DocumentReference.relatesTo` usage
   - `code = transforms` support

6. **Clinical Date/Time Override**
   - Extension for backdating images
   - Audit logging requirements

---

## 📋 How to Review Section 10

### **Step 1: Navigate to Section 10**

1. Open https://alexapidoc.medtechglobal.com/
2. Scroll down or use navigation to find **"Section 10: Custom Fields, Extensions, and Mapping"**
3. This section likely appears after Section 9 (Examples) and before Section 11 (Error Handling)

### **Step 2: Scan for Image-Related Extensions**

Look for subsections or examples mentioning:
- "Media" resource
- "DocumentReference" resource
- "Body site" or "bodySite"
- "Laterality"
- "Clinical photography" or "images"
- "Location" (in clinical context, not facility)

### **Step 3: Document Known Extensions**

Section 10 definitely includes these (from changelog):

**Already Documented**:
- ✅ A/C Holder Extension: `http://alexapi.medtechglobal.com/fhir/StructureDefinition/acholder`
- ✅ Account Held By: `http://alexapi.medtechglobal.com/fhir/StructureDefinition/acheldby`
- ✅ WINZ No: `http://alexapi.medtechglobal.com/fhir/StructureDefinition/winzno`
- ✅ Sex at Birth: `http://hl7.org.nz/fhir/StructureDefinition/sex-at-birth`
- ✅ Country Extension (ISO 3166)
- ✅ Visa Extensions

**What We Need** (image-specific):
- ❓ Body site extension URL
- ❓ Laterality extension URL
- ❓ View type extension URL
- ❓ Image type extension URL

### **Step 4: Look for Code Systems**

For each extension, note:
- **System URL** (e.g., `http://snomed.info/sct` for SNOMED CT)
- **Code examples** with display names
- **ValueSet** or **CodeSystem** references

### **Step 5: Find Example Payloads**

Look for JSON examples showing:
- POST Media with extensions
- POST DocumentReference with extensions
- How extensions are nested in the FHIR resource structure

---

## 📝 Template: Fill This In

Copy this template and fill it in as you review. Save as `alex-fhir-extensions-findings.md` when done.

```markdown
# ALEX API Section 10 — FHIR Extensions Findings

**Date**: 2025-10-30  
**Reviewer**: [Your Name]  
**Source**: https://alexapidoc.medtechglobal.com/ Section 10

---

## 1. Body Site Extension

**Extension URL**:
```
[Copy exact URL here, e.g., http://alexapi.medtechglobal.com/fhir/StructureDefinition/bodySite]
```

**Code System**:
```
[e.g., http://snomed.info/sct]
```

**Common Body Site Codes** (from PRD requirements):

| Body Site | SNOMED CT Code | Display Name | Found in Docs? |
|-----------|----------------|--------------|----------------|
| Face      | 89545001       | Face         | ☐ Yes / ☐ No  |
| Scalp     | 43799004       | Scalp        | ☐ Yes / ☐ No  |
| Trunk     | 22943007       | Trunk        | ☐ Yes / ☐ No  |
| Arm       | ?              | ?            | ☐ Yes / ☐ No  |
| Forearm   | 40983000       | Forearm      | ☐ Yes / ☐ No  |
| Hand      | 53120007       | Hand         | ☐ Yes / ☐ No  |
| Thigh     | ?              | ?            | ☐ Yes / ☐ No  |
| Leg       | 22335008       | Leg          | ☐ Yes / ☐ No  |
| Foot      | 56459004       | Foot         | ☐ Yes / ☐ No  |

**Notes**:
- [Any special instructions, validation rules, or caveats]

**Example JSON** (if provided):
```json
[Paste example from docs]
```

---

## 2. Laterality Extension

**Extension URL**:
```
[Copy exact URL here]
```

**Code System**:
```
[e.g., http://snomed.info/sct]
```

**Laterality Codes** (from PRD requirements):

| Laterality      | SNOMED CT Code | Display Name    | Found in Docs? |
|-----------------|----------------|-----------------|----------------|
| Right           | 24028007       | Right           | ☐ Yes / ☐ No  |
| Left            | 7771000        | Left            | ☐ Yes / ☐ No  |
| Bilateral       | 51440002       | Bilateral       | ☐ Yes / ☐ No  |
| Not Applicable  | 373067005      | Not applicable  | ☐ Yes / ☐ No  |

**Notes**:
- [Any special instructions]

**Example JSON** (if provided):
```json
[Paste example from docs]
```

---

## 3. View Type Extension

**Extension URL**:
```
[Copy exact URL here, or write "NOT DOCUMENTED" if not found]
```

**Code System**:
```
[e.g., http://alexapi.medtechglobal.com/fhir/view-type or similar]
```

**View Type Codes** (from PRD requirements):

| View       | Code       | Display Name | Found in Docs? |
|------------|------------|--------------|----------------|
| Close-up   | close-up   | Close-up     | ☐ Yes / ☐ No  |
| Dermoscopy | dermoscopy | Dermoscopy   | ☐ Yes / ☐ No  |
| Other      | other      | Other        | ☐ Yes / ☐ No  |

**Notes**:
- If not documented: [Note whether to use SNOMED CT, internal codes, or free text]

**Example JSON** (if provided):
```json
[Paste example from docs]
```

---

## 4. Image Type Extension

**Extension URL**:
```
[Copy exact URL here, or write "NOT DOCUMENTED" if not found]
```

**Code System**:
```
[e.g., http://alexapi.medtechglobal.com/fhir/image-type or similar]
```

**Image Type Codes** (from PRD requirements):

| Type       | Code      | Display Name | Found in Docs? |
|------------|-----------|--------------|----------------|
| Lesion     | lesion    | Lesion       | ☐ Yes / ☐ No  |
| Rash       | rash      | Rash         | ☐ Yes / ☐ No  |
| Wound      | wound     | Wound        | ☐ Yes / ☐ No  |
| Infection  | infection | Infection    | ☐ Yes / ☐ No  |
| Other      | other     | Other        | ☐ Yes / ☐ No  |

**Notes**:
- If not documented: [Note whether to use SNOMED CT, internal codes, or free text]

**Example JSON** (if provided):
```json
[Paste example from docs]
```

---

## 5. Provenance / Derived From (for Edited Images)

**DocumentReference.relatesTo Support**:
- ☐ Yes, documented
- ☐ Not mentioned

**If documented, details**:
```
[How to link edited image to original using DocumentReference.relatesTo]
```

**Code for "transforms" relationship**:
```
[e.g., code = "transforms" from http://hl7.org/fhir/ValueSet/document-relationship-type]
```

**Example JSON** (if provided):
```json
[Paste example from docs]
```

---

## 6. Clinical Date/Time Override

**Extension URL** (if exists):
```
[For backdating images]
```

**Validation Rules**:
- Can backdate? ☐ Yes / ☐ No
- Cannot future date? ☐ Confirmed / ☐ Not mentioned
- Audit logged? ☐ Yes / ☐ Not mentioned

**Notes**:
- [Any special requirements]

---

## 7. Media Resource Examples

**POST Media Example Found?**
- ☐ Yes (paste below)
- ☐ No (not in Section 10, check Section 9)

**If found, paste full example**:
```json
[Full POST Media example with extensions]
```

**Key observations**:
- Binary data format: ☐ Base64 inline / ☐ Separate Binary POST / ☐ Not clear
- Encounter linkage: [How is encounter context specified?]
- Patient reference: [How is patient specified?]

---

## 8. DocumentReference Resource Examples

**POST DocumentReference Example Found?**
- ☐ Yes (paste below)
- ☐ No

**If found, paste example**:
```json
[Full POST DocumentReference example]
```

**Key observations**:
- Category code for clinical photos: [e.g., "clinical-photo"]
- Content.attachment structure: [contentType, size, hash, etc.]
- Extensions placement: [Where in the resource structure?]

---

## 9. Section 10 Structure

**Subsections found** (list all):
1. [e.g., "A/C Holder Extension"]
2. [e.g., "WINZ No Extension"]
3. [e.g., "Gender and Sex at Birth Mapping"]
4. [etc.]

**Image-specific subsection?**
- ☐ Yes, titled: [Title]
- ☐ No dedicated subsection

---

## 10. Missing Information

**What's NOT documented that we need**:
- [ ] [List anything from priorities 1-2 that's not found]

**Questions to ask Medtech support**:
1. [List specific questions based on gaps]

---

## 11. Additional Findings

**Unexpected discoveries**:
- [Anything useful you found that wasn't in the priorities list]

**References to other sections**:
- [e.g., "See Section 9 for Media examples"]

---

## Summary

**Completeness**: ☐ All critical info found / ☐ Some gaps / ☐ Major gaps

**Ready to implement?**: ☐ Yes / ☐ Need clarifications from Medtech

**Next steps**:
1. [Based on what you found]
2. [What questions remain]

---

**Reviewed by**: [Your Name]  
**Date**: [Date]  
**Time spent**: [How long it took]
```

---

## ⏱️ Estimated Time

- **Quick scan**: 15-20 minutes
- **Thorough review**: 30-45 minutes
- **Documenting findings**: 20-30 minutes

**Total**: ~1 hour

---

## 🚨 If You Get Stuck

### **Can't find Section 10?**
- Try searching the page for "extension"
- Try searching for "custom field"
- Check the table of contents or navigation menu

### **Section 10 exists but doesn't mention images?**
- Check Section 9 (Examples) for POST Media examples
- Check Section 8 (API Reference) under "Media" or "DocumentReference"
- Note what's missing and prepare to ask Medtech

### **Not sure if something is relevant?**
- Document it anyway (better too much info than too little)
- Look for keywords: bodySite, laterality, location, photo, image, clinical

### **Extension URLs use different format than expected?**
- Copy the EXACT URL (don't modify it)
- Note the pattern (Medtech's custom namespace vs HL7 standard)

---

## ✅ When You're Done

1. **Save your findings** as `docs/medtech/alex-fhir-extensions-findings.md`
2. **Review the "Missing Information" section** — this becomes your list of questions for Medtech
3. **Update NEXT_STEPS.md** to mark this task complete
4. **Prepare to implement** or **draft questions for Medtech support**

---

## 🎯 What This Enables

Once you have this information, you can:

1. **Map PRD metadata to FHIR extensions**:
   ```
   PRD: bodySite = "Forearm"
   →
   FHIR: extension[bodySite] = {
     "url": "http://alexapi.../bodySite",
     "valueCodeableConcept": {
       "coding": [{
         "system": "http://snomed.info/sct",
         "code": "40983000",
         "display": "Forearm"
       }]
     }
   }
   ```

2. **Implement Integration Gateway** metadata mapping service
3. **Build frontend chips** with correct coded values
4. **Test POST Media** with real extensions
5. **Verify metadata** appears correctly in Medtech

---

**Ready?** Open https://alexapidoc.medtechglobal.com/ and navigate to Section 10!

Let me know what you find, or if you have questions as you review.
