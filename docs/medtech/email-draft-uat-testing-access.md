# Email Draft: UAT Testing Environment Access Request

---

**Subject**: ClinicPro Images Widget Integration — UAT Testing Environment Access

---

Hi [Medtech Contact Name / Defne],

I hope this email finds you well. I'm following up on our Medtech ALEX API integration for the ClinicPro Images Widget, for which we have a non-commercial agreement in place.

We've been reviewing the ALEX API Documentation (https://alexapidoc.medtechglobal.com/) and have successfully set up our OAuth client credentials and IP allow-listing. We're now planning our development and testing approach, and I have a few questions about how to test the full integration workflow, particularly the Medtech UI components.

---

## Questions About UAT Testing

### 1. Medtech UI Access for Testing
The ALEX API Documentation describes UAT Sandbox API testing (`alexapiuat.medtechglobal.com/FHIR`), but we'd like to verify the complete user experience, including:
- Launching our widget from within Medtech Evolution/Medtech32
- Verifying that images we commit via POST Media appear correctly in the Medtech UI
- Testing the widget in its embedded context (iFrame or new tab)

**Question**: Does Medtech provide a demo Medtech Evolution instance connected to ALEX UAT Sandbox for integration partners to test end-to-end workflows? If so, how do we request access under our non-commercial agreement?

---

### 2. Widget Launch Mechanism
Our widget needs to be launched from within Medtech and receive the active patient/encounter context.

**Questions**:
- How do we register our widget URL with Medtech?
- What is the technical mechanism for launching the widget (iFrame embedding, new tab with parameters, POST form, etc.)?
- How is the encounter context passed to our widget (JWT token, signed parameters, etc.)?
- Is there documentation or an SDK for the Medtech widget integration interface?

---

### 3. Visual Verification in UAT
During UAT API testing, we can verify that our POST Media requests return successful responses, but we'd like to confirm that:
- Images appear correctly in the encounter view
- Clinical metadata (body site, laterality) is displayed properly
- Images are selectable in HealthLink/ALEX referral workflows

**Question**: What is the recommended approach for visually verifying committed images during UAT testing? Can your team provide test screenshots, or is there another method you recommend?

---

### 4. Clinical Metadata for Media Resources
The ALEX Postman documentation shows a basic POST Media example, but we need to capture clinical metadata for images (body site, laterality, view type, image classification). We have questions about the schema:

**Q4.1 — Body Site**:
> Does POST Media accept the standard FHIR R4 `bodySite` field (CodeableConcept with SNOMED CT codes)? Or does ALEX require a custom extension? If custom, what is the extension URL?

**Q4.2 — Laterality**:
> How should we specify laterality (Right, Left, Bilateral, N/A)? Options:
> - SNOMED CT qualifier within bodySite (e.g., 'Left forearm')
> - Separate laterality field/extension
> - HL7 NZ laterality extension
> 
> Please provide example JSON.

**Q4.3 — View Type**:
> Can we use the standard FHIR `Media.view` field for clinical image views (e.g., 'close-up', 'dermoscopy')? If so, what code system should we use? If not, is there a custom extension?

**Q4.4 — Image Classification**:
> How should we categorize clinical image types (e.g., Lesion, Rash, Wound, Infection)? Should we use:
> - `Media.modality` field
> - `Media.type` field (currently only supports photo/video/audio)
> - Custom extension (if so, please provide extension URL and code system)

**Q4.5 — Full POST Media Schema**:
> Can you provide a complete POST Media example showing all supported optional fields, including:
> - Body site with laterality
> - Image type/classification
> - View type
> - Clinical date/time (if different from createdDateTime)
> - Encounter linkage

**Q4.6 — DocumentReference Auto-Creation**:
> When we POST Media, does ALEX automatically create a linked DocumentReference resource, or must we POST both separately?

**Q4.7 — Encounter Linkage**:
> How do we link the Media resource to the active encounter? (Media.encounter field, extension, or implied from patient/operator context?)

---

### 5. Production Onboarding Process
Looking ahead to production deployment:

**Questions**:
- What is the typical onboarding process from UAT completion to production pilot?
- Who is the point of contact for production widget registration and configuration?
- What is the expected timeline for production pilot setup?

---

## Our Current Status

✅ **Completed**:
- Non-commercial agreement signed
- IP allow-listing configured
- OAuth client credentials received
- ALEX API Documentation reviewed (all 12 sections)
- Integration Gateway architecture designed

📋 **In Progress**:
- Reviewing ALEX API Section 10 (Custom Fields & Extensions) for FHIR extension URLs
- Developing Integration Gateway (OAuth token service, FHIR client)

🎯 **Next Steps** (pending your guidance):
- Connect to ALEX UAT Sandbox for API testing
- Full end-to-end testing in Medtech environment (once access is clarified)
- Production pilot preparation

---

## Proposed Timeline

**Week 2-3**: ALEX UAT API testing (POST Media, metadata validation)  
**Week 4-5**: Widget frontend development  
**Week 6**: End-to-end testing in Medtech environment (subject to access)  
**Week 7+**: Production pilot with GP practice

We're keen to ensure our integration meets Medtech's standards and provides an excellent experience for GPs. Any guidance you can provide on the testing process would be greatly appreciated.

---

Please let me know if you need any additional information from our side, or if there's a better contact person for these technical integration questions.

Thank you for your support!

Best regards,  
[Your Name]  
[Your Title]  
ClinicPro  
[Your Email]  
[Your Phone]

---

## Alternative Version (More Concise)

---

**Subject**: UAT Testing Environment Access — ClinicPro Images Widget Integration

---

Hi [Medtech Contact],

We're developing the ClinicPro Images Widget integration with ALEX API (non-commercial agreement in place). We've completed our documentation review and are ready to begin testing.

**Key Questions**:

1. **Demo Medtech Instance**: Does Medtech provide a demo Evolution instance connected to ALEX UAT for partners to test widget launch and image commit workflows? How do we request access?

2. **Widget Launch Mechanism**: How do we register our widget URL, and how is the encounter context passed to our widget (JWT, parameters, etc.)? Is there integration SDK documentation?

3. **Visual Verification**: During UAT API testing, how can we verify that images appear correctly in the Medtech UI?

4. **Clinical Metadata Schema**: The Postman docs show basic POST Media. Can you provide examples with body site, laterality, view type, and image classification? Do we use standard FHIR R4 fields or custom extensions?

5. **Production Onboarding**: What's the process and timeline from UAT completion to production pilot?

**Our Status**:
- ✅ IP allow-listing configured, OAuth credentials received
- ✅ ALEX API docs reviewed, Gateway architecture designed
- 📋 Ready to connect to `alexapiuat.medtechglobal.com` for API testing

**Proposed Timeline**: UAT testing Weeks 2-3, end-to-end testing Week 6, production pilot Week 7+.

Any guidance on the testing process would be appreciated. Please let me know if there's a better contact for technical integration questions.

Thank you!

Best regards,  
[Your Name]  
ClinicPro

---

## Tips for Sending

### **Choose Version Based on Relationship**:
- **Detailed version** (first): If this is your first technical inquiry or if Medtech support prefers detailed requests
- **Concise version** (second): If you have ongoing communication and they prefer brevity

### **Attach if Helpful**:
- `DEVELOPMENT_FLOW_OVERVIEW.md` (shows you understand the integration)
- High-level architecture diagram (if you have one)

### **CC Considerations**:
- Your technical lead (shows team involvement)
- Your account manager (if applicable)

### **Follow-up**:
- If no response in 3-5 business days, send polite follow-up
- Reference your non-commercial agreement number (if applicable)

### **Be Prepared to Provide**:
- Your client ID
- Your widget's planned URL structure
- High-level use case description
- Estimated number of GP practices for pilot

---

## Expected Responses

### **Scenario A: Virtual Environment Available**
> "Yes, we provide a demo Medtech instance. Here's how to request access..."

**Your Action**: Request access, schedule test session

### **Scenario B: API-Only Testing**
> "UAT is for API testing only. Visual verification happens in production pilot..."

**Your Action**: Proceed with API testing, plan for production pilot earlier

### **Scenario C: Custom Arrangement**
> "We can arrange a screen-sharing session to show your committed images in our test instance..."

**Your Action**: Schedule session, prepare test cases

### **Scenario D: Documentation Provided**
> "Please see our Partner Integration Guide (attached) for widget launch details..."

**Your Action**: Review docs, implement based on specs

---

## Questions to Anticipate from Medtech

1. **"What is the use case for your widget?"**  
   → Clinical photo capture for GP consultations, saved to encounter, available for HealthLink/ALEX referrals

2. **"How many practices will use this?"**  
   → Starting with pilot (1-2 practices), then broader rollout

3. **"What patient data will you access?"**  
   → Encounter context only (patient ID, encounter ID); no PHI stored on our servers; images go directly to Medtech

4. **"What's your hosting setup?"**  
   → [Your hosting provider, e.g., Vercel, AWS]; IP allow-listing already configured

5. **"Have you reviewed our integration guidelines?"**  
   → Yes, reviewed all 12 sections of ALEX API docs; following FHIR R4 standards

---

**Good luck with your email!** Let me know if you need any adjustments to the tone or content.
