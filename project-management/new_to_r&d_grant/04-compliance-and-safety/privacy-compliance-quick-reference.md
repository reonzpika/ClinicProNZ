# Privacy Compliance Quick Reference
## IPP 12, HISO 10029, DPA, Consent Notices

**Last Updated:** 2025-11-01  
**Version:** 1.0  
**Extracted From:** `dpia-draft.md` (v1.0)

---

## Purpose

This document consolidates privacy compliance artefacts for **quick LLM lookup** without reading the full 560-line DPIA.

**Contents:**
1. IPP 12 Cross-Border Control Checklist (tickbox)
2. HISO 10029 Control Mapping Summary
3. DPA Key Clauses (Controller-Processor, Sub-processor)
4. Consent and Notice Text (clinician, patient, cross-border)

**For full context**, see: `04-compliance-and-safety/dpia-draft.md`

---

---

# 1. IPP 12 Cross-Border Control Checklist
## Option B: AU Inference; No Persistent PHI Outside NZ

### Lawful Basis and Scope
- [ ] **Identify personal/health information categories** disclosed cross-border:
  - Audio/transcript segments for scribing (transient)
  - Inbox content (labs, letters, referrals, metadata)
  - Limited clinical context for history summaries
  - User prompts and assist-only outputs
- [ ] **Confirm disclosure is necessary** for the stated service:
  - Assist-only scribe, inbox triage, history summaries
  - Cannot be delivered with NZ-only infrastructure at target latency/cost
- [ ] **Minimal fields disclosed**:
  - Only data required for the specific task (least privilege)
  - No full patient records sent; scoped retrieval only

---

### Comparable Safeguards (Contractual)
- [ ] **Controller?Processor DPA** in place with clinic:
  - Purpose limitation (scribe, inbox, summaries only)
  - Security controls specified (encryption, access controls, audit)
  - Sub-processing and audit rights
  - Cross-border annex (regions, data types, no persistent PHI outside NZ)
  - Deletion on termination
- [ ] **Sub-processor DPA** with AU cloud provider:
  - Comparable safeguards to NZ law
  - Region lock (nominated AU regions only)
  - No persistent PHI outside NZ; ephemeral only
  - Onward-transfer limits (no further disclosure without consent)
  - Breach notification (24hr timeline; cooperation with OPC)
- [ ] **Audit rights** for Controller and OPC where required
- [ ] **Breach notification timelines** contractually agreed (24hr notification to clinic)

---

### Technical and Organisational Controls
- [ ] **Encryption in transit:** TLS 1.2+ for all cross-border transfers
- [ ] **Encryption at rest:** AES-256 for any temporary storage (NZ keys)
- [ ] **NZ-held keys (KMS/HSM):**
  - Encryption keys stored in NZ only
  - Key rotation schedule (e.g., 90 days)
  - Revocation capability (immediate lockout on breach)
- [ ] **Region lock:** Nominated AU regions only (hard ban on other regions; no auto-migrate)
- [ ] **No PHI in logs:** Operational logs exclude PHI; masking where needed
- [ ] **Access control:**
  - MFA required for admin access
  - Least privilege (role-based access)
  - Quarterly access recertification
- [ ] **Supplier due diligence:**
  - Security posture review (certifications, audit reports)
  - Right to audit sub-processors

---

### Data Minimisation and Transparency
- [ ] **Limit fields disclosed** to only what is required for the task:
  - Scribe: audio/transcript only (no full patient history)
  - Inbox: message content + minimal metadata (no excess clinical data)
  - History: scoped retrieval (date ranges, relevant conditions only)
- [ ] **Publish transparency page:**
  - Data sources used
  - Regions and sub-processors
  - Update log (last updated, change history)
- [ ] **Provide clinic notices:**
  - Purpose, cross-border inference, no persistent PHI outside NZ
  - No training on PHI
  - Access/correction routes; contact details
- [ ] **Provide patient consent/notice** for scribing:
  - Consent obtained before recording
  - Clear notice: "AI scribe may process on AU servers; not stored there; records remain in NZ"
  - Opt-out process documented

---

### Data Retention and Deletion
- [ ] **No persistent PHI outside NZ:**
  - AU inference uses ephemeral caches only (short TTL, e.g., < 60 seconds)
  - No storage, backup, or archival of PHI in AU
- [ ] **NZ storage only** for any at-rest PHI:
  - Encrypted with NZ-held keys
  - Defined retention period (e.g., ? 30 days if clinic requires storage)
  - Automatic deletion on expiry or on request
- [ ] **Secure deletion process** documented:
  - Cryptographic erasure (key deletion)
  - Certify deletion to Controller on request or termination

---

### Data Subject Rights Support
- [ ] **Processor assists Controller** with:
  - Access requests (provide PHI within SLA)
  - Correction requests (update records)
  - Objection/withdrawal (patient declines scribing; clinic disables features)
  - Deletion requests (secure deletion on request)
- [ ] **SLAs defined** for data subject rights responses (e.g., 10 business days)

---

### Ongoing Assurance
- [ ] **DPIA completed** and approved (v1.0 signed by NexWave Director)
- [ ] **Quarterly DPIA review:** Update on material change (new sub-processor, region, data use)
- [ ] **Change control** for new sub-processors/regions:
  - Privacy Lead approval required
  - Re-run DPIA if material change
  - Update transparency page
- [ ] **Continuous monitoring:**
  - SIEM alerts for unusual data flows (PHI egress to non-AU regions)
  - Audit logs reviewed monthly
- [ ] **Incident drills:** Test breach notification process annually
- [ ] **Annual supplier reassessment:** Security posture, compliance, audit rights exercised

---

**IPP 12 Compliance Status:**  
? **Option B controls in place** (AU inference, no persistent PHI outside NZ, NZ-held keys, contractual safeguards)

---

---

# 2. HISO 10029 Control Mapping Summary

## Purpose
Align project security with **HISO 10029:2015** (Health Information Security Framework) and **NZISM** (NZ Information Security Manual).

**Full mapping:** See `dpia-draft.md` sections on Security Controls

---

## Control Domains (12 Key Areas)

### 1. Governance and Policy
- **Controls:**
  - Security and privacy policies approved by NexWave Director
  - Roles defined: Privacy Lead, Security Lead, NexWave Director
  - Risk management cadence (quarterly reviews)
  - DPIA and change management gates (no new data uses without approval)
- **Evidence:** `risk-and-change-management.md`; DPIA sign-offs

---

### 2. Asset and Data Management
- **Controls:**
  - Data inventory and classification (PHI tagged as "sensitive health information")
  - Synthetic/de-identified data SOPs (see `safety-and-transparency-framework.md`)
  - Source register (data lineage transparency)
- **Evidence:** Transparency page; source register; DVC tags

---

### 3. Access Control and Identity
- **Controls:**
  - Role-based access (least privilege)
  - MFA required for admin and developer access
  - Quarterly access recertification (review users, roles, permissions)
  - Admin actions audited (centralized logging)
- **Evidence:** Access control policies; quarterly access reviews; audit logs

---

### 4. Cryptography and Key Management
- **Controls:**
  - TLS 1.2+ for data in transit
  - AES-256 for data at rest
  - NZ-resident KMS/HSM (key storage and rotation)
  - Key rotation schedule (e.g., 90 days)
  - Segregation of duties (key creation/use/revocation)
- **Evidence:** Encryption configuration; KMS/HSM policies; key rotation logs

---

### 5. Operations Security
- **Controls:**
  - Secure build pipelines (CI/CD with security gates)
  - Dependency scanning (automated vulnerability checks)
  - Vulnerability and patch management (monthly scans; critical patches within 7 days)
  - Change control with rollback plans (pre-release checklist; tested rollback)
- **Evidence:** CI/CD logs; vulnerability scan reports; change log; release checklist

---

### 6. Logging and Monitoring
- **Controls:**
  - Centralized logging (SIEM) without PHI in log payloads
  - SIEM alerts for security events (unusual access, data egress, failed auth)
  - Log retention in NZ (e.g., 90 days for security/audit)
  - Tamper-evident audit trails (integrity checks)
- **Evidence:** SIEM configuration; alert rules; log retention policies

---

### 7. Application and Data Protection
- **Controls:**
  - Input/output validation (sanitize user prompts; validate model outputs)
  - PII/PHI classifiers (detect and mask sensitive data in logs/outputs)
  - Refusal scaffolds (refuse unsafe requests; no diagnostic/treatment directives)
  - Prompt hardening (prevent injection attacks)
  - Model safety regressions (monthly testing of prohibited-claim rate, refusal appropriateness)
- **Evidence:** Safety regression packs; red-team test results; safety dashboard

---

### 8. Network Security
- **Controls:**
  - Private networking (VPC/VNET isolation)
  - Firewall rules (allow-list only; block public internet where not needed)
  - WAF (web application firewall) where applicable
  - Rate limiting (protect against DDoS; excessive requests)
  - DDoS controls per cloud provider capability
- **Evidence:** Network diagrams; firewall rules; WAF logs

---

### 9. Supplier and Sub-Processor Management
- **Controls:**
  - Due diligence (security posture review; certifications; audit reports)
  - DPAs with flow-down obligations (sub-processors must meet comparable safeguards)
  - Region locks (contractual and technical controls)
  - Annual reassessment (review security posture; exercise audit rights)
  - Right to audit sub-processors (contractual clause)
- **Evidence:** Sub-processor due diligence records; DPAs; audit reports; annual reviews

---

### 10. Incident Response and Business Continuity
- **Controls:**
  - Incident runbooks (breach notification, containment, recovery)
  - 24/7 escalation path (Privacy Lead, Security Lead, Director)
  - Breach notice within 24 hours to Controller (contractual timeline)
  - NZ-only backups (PHI never backed up outside NZ)
  - Tested restore (DR drills; RTO/RPO targets defined)
- **Evidence:** Incident runbook (see `safety-and-transparency-framework.md`); DR test logs

---

### 11. Privacy Management
- **Controls:**
  - Privacy training for staff (OPC Privacy Act 2020; OPC HIPC; Ko Awatea)
  - IPP 12 controls (see Section 1 above)
  - HIPC 2020 awareness (special category health data)
  - Consent/notice text (clinician and patient; see Section 4 below)
  - Transparency page (public-facing; updated quarterly)
  - Records of processing (DPA annexes; data flow diagrams)
- **Evidence:** Training certificates; DPIA; transparency page; DPAs

---

### 12. Clinical Safety and Human Oversight
- **Controls:**
  - Assist-only use (no diagnostic or treatment directives)
  - No auto-insert (manual clinician review required)
  - Clinician review of all outputs (human-in-the-loop)
  - Safety KPIs tracked monthly:
    - Prohibited-claim rate ? 0.5%
    - Refusal appropriateness ? 95%
    - Zero PHI leakage in tests
  - NAIAEAG alignment (see `safety-and-transparency-framework.md`)
- **Evidence:** Safety regression packs; safety dashboard; NAIAEAG alignment note

---

**HISO 10029 Compliance Status:**  
? **12 control domains addressed** (policies, technical controls, and evidence artefacts in place)

---

---

# 3. DPA Key Clauses Summary

## A. Controller?Processor DPA (Clinic ? NexWave)

### Parties and Roles
- **Controller:** Participating clinic(s) using ClinicPro service
- **Processor:** NexWave Solutions Ltd (ClinicPro)
- **Sub-processors:** Listed in Annex A (AU cloud, NZ storage, ASR if used)

---

### Purpose Limitation and Instructions
- **Purpose:** Deliver assist-only scribe, inbox triage, and history summaries
- **Instructions:** Processor follows documented Controller instructions; notify if instructions conflict with law
- **No secondary uses:** No marketing, analytics, or training on production PHI without explicit consent

---

### Categories of Data and Subjects
- **Data subjects:** Patients; clinicians; practice staff (limited metadata)
- **Personal data:**
  - Health information (clinical notes, labs, letters, referrals, audio/transcripts)
  - User prompts and model outputs
  - Operational telemetry (no PHI payloads)
- **Special category:** Health information governed by HIPC 2020

---

### Confidentiality and Personnel
- **Staff confidentiality:** All NexWave staff bound by confidentiality obligations
- **Training:** Staff trained in privacy and security (OPC Privacy Act, HIPC, Ko Awatea)
- **Access:** Least-privilege basis; quarterly access reviews

---

### Security Measures (Technical and Organisational)
- **Encryption:** TLS 1.2+ in transit; AES-256 at rest; NZ-held keys (KMS/HSM)
- **Access controls:** MFA; role-based access; quarterly recertification
- **Logging:** Centralized logs (no PHI); SIEM monitoring
- **Audit:** Annual security reviews; right to audit by Controller or third party
- **Full specification:** See HISO 10029 mapping (Section 2 above)

---

### Data Location and Cross-Border Transfers (IPP 12)
- **PHI at rest:** NZ only (encrypted with NZ-held keys)
- **AU inference:** Transient only (ephemeral caches; no persistent storage outside NZ)
- **Region locks:** Nominated AU regions only (hard ban on other regions)
- **No onward transfers:** No further disclosure without Controller consent
- **IPP 12 annex attached:** Cross-border safeguards detailed in Annex B

---

### Sub-Processing
- **Prior authorisation:** Named sub-processors listed in Annex A
- **Flow-down obligations:** Sub-processors must meet comparable safeguards
- **Change notice:** Processor provides 15 business days' advance notice for new sub-processors; Controller may object
- **Liability:** Processor liable for sub-processor failings

---

### Data Subject Rights Assistance
- **Processor assists Controller** with:
  - Access requests (provide PHI within 10 business days)
  - Correction requests (update records within 10 business days)
  - Objection/withdrawal (disable features; delete data)
  - Portability (export in standard format)
  - Deletion (secure deletion within 30 days of request or termination)

---

### Breach Notification and Incident Response
- **Notification timeline:** Without undue delay and within 24 hours of confirmed personal data breach
- **Details provided:** Nature of breach; data categories affected; likely consequences; measures taken/proposed
- **Ongoing updates:** Processor provides updates as investigation progresses
- **Cooperation:** Processor cooperates with OPC notifications and remediation

---

### Audit and Compliance
- **Records of processing:** Processor maintains records (purpose, categories, sub-processors, retention, security)
- **Attestations:** Processor provides security summaries and certifications on request
- **Audit rights:** Controller (or third-party auditor) may audit Processor with 10 business days' notice

---

### Retention, Deletion, and Return
- **On termination or request:**
  - Securely delete or return all PHI within 30 days
  - Certify deletion in writing
  - NZ-only backups destroyed per schedule
- **Exceptions:** Processor may retain PHI if required by law (notify Controller)

---

### Transparency and Notices
- **Transparency page:** Processor maintains public page (sources, regions, sub-processors, update log)
- **Material changes:** Processor notifies Controller of new sub-processors, regions, or data uses

---

### Assistance with DPIA and Consultations
- Processor provides information to support Controller's DPIA, privacy risk assessments, and OPC consultations

---

### Liability and Indemnity
- **Processor liable** for breaches of obligations and sub-processor failings
- **Caps and exclusions:** Agreed in main service agreement
- **No cap:** Wilful misconduct or fraud

---

### Insurance
- Processor maintains professional indemnity and cyber insurance; provides certificates on request

---

### Term, Termination, and Survival
- **Term:** Aligned to service agreement
- **Termination:** On material breach (30 days' cure; immediate for critical breach)
- **Survival:** Confidentiality, security, deletion, audit clauses survive termination

---

### Governing Law and Jurisdiction
- **Law:** New Zealand law
- **Jurisdiction:** NZ courts (non-exclusive)

---

### Order of Precedence
- If conflict between DPA and main service agreement, **DPA prevails** for privacy/security matters

---

## B. Sub-Processor DPA (NexWave ? AU Cloud / NZ Storage / ASR)

### Key Clauses (Summary)
- **Comparable safeguards:** Sub-processor must meet safeguards equivalent to NZ law
- **Region lock:** Contractual and technical controls (nominated regions only; no auto-migrate)
- **No persistent PHI outside NZ:** Ephemeral caches only; no storage/backup/archival in AU
- **Breach duties:** 24hr notification to NexWave; cooperation with investigation and OPC notifications
- **Audit rights:** NexWave may audit; Controller may audit via NexWave or directly
- **Flow-down:** Sub-processor DPA mirrors Controller-Processor DPA obligations
- **Liability:** Sub-processor liable to NexWave; NexWave liable to Controller

---

**DPA Status:**  
?? **Templates ready** (legal review recommended before signing)

---

---

# 4. Consent and Notice Text

## A. Clinician-Facing Notice (Clinic Agreement / Staff Handbook)

**Title:** ClinicPro AI Scribe and Inbox Management ? Privacy Notice for Clinicians

**Purpose:**  
ClinicPro uses an AI assistant to help you draft clinical notes (scribe), manage inbox items (triage), and summarize patient histories. This notice explains how patient information is handled.

**What ClinicPro does:**
- **Scribe:** Drafts SOAP notes from consultation audio/notes (you review and edit before saving)
- **Inbox:** Classifies, summarises, and suggests actions for inbox items (labs, letters, referrals)
- **History summaries:** Provides concise overviews of patient context for your review

**Assist-only:**  
ClinicPro never provides diagnostic or treatment advice. All outputs are assist-only and require your clinical judgement and review.

**Data handling:**
- **Where processed:** AI inference may occur on secure servers in Australia; patient information is not stored there. All patient records remain in New Zealand.
- **Encryption:** Data is encrypted in transit (TLS) and at rest (AES-256) with NZ-held keys.
- **Training:** ClinicPro does not train its AI on your patients' data. Development uses synthetic and de-identified data only.

**Your responsibilities:**
- **Consent:** Obtain patient consent before using the AI scribe for consultations (see patient notice below).
- **Review:** Always review AI-generated outputs for accuracy and appropriateness before accepting.
- **Opt-out:** Patients may decline AI scribing; you can disable features for specific patients or consultations.

**Access and correction:**  
Patients may request access to or correction of their information via your clinic's usual processes. ClinicPro will assist as needed.

**Questions or concerns:**  
Contact [NexWave Privacy Lead email] or [Clinic Privacy Officer].

**Transparency:**  
For details on data sources, regions, and sub-processors, see: [ClinicPro Transparency Page URL]

---

## B. Patient Consent/Notice for Scribing (Consultation Room / Consent Form)

**Title:** AI Scribe Consent Notice

**What is the AI scribe?**  
With your consent, your clinician may use an AI assistant (ClinicPro) to help draft notes during your consultation. The AI listens to the conversation and suggests a draft for your clinician to review and edit.

**Important:**
- The AI **does not make medical decisions**. Your clinician reviews all AI-generated notes and uses their clinical judgement.
- Your consultation **may be processed on secure servers in Australia**, but the recording and notes **are not stored there**. Your medical records remain in New Zealand.
- The AI **does not train on your information**. Your consultation is used only to create your notes.

**Your choice:**
- You can **say no** to AI scribing at any time, and your care will not be affected.
- If you prefer, your clinician will take notes manually.

**Questions?**  
Ask your clinician or contact [Clinic Privacy Officer] at [email/phone].

**Consent:**  
? I consent to the use of AI scribing for this consultation.  
? I do not consent; please take notes manually.

Signature: ___________________ Date: ___________

---

## C. Cross-Border Disclosure Notice (Transparency Page / Privacy Policy)

**Title:** Cross-Border Data Processing

**ClinicPro processes some patient information in Australia for AI inference.**

**What does this mean?**
- To provide fast, accurate AI assistance, we send encrypted requests to secure servers in Australia.
- **No patient information is stored in Australia.** Processing is transient only (typically < 60 seconds).
- All patient records remain in New Zealand, encrypted with keys held in New Zealand.

**Safeguards:**
- **Encryption:** All data is encrypted in transit (TLS 1.2+) and at rest (AES-256).
- **Region locks:** We use specific Australian regions only; no data auto-migrates to other regions.
- **Contracts:** Our Australian sub-processor is bound by contracts that ensure protections comparable to New Zealand law, including the Privacy Act 2020.
- **Audit rights:** We and participating clinics have the right to audit our sub-processors.

**Compliance:**
- This cross-border processing complies with **Privacy Act 2020 IPP 12** (cross-border disclosure of personal information).
- We have completed a **Data Protection Impact Assessment (DPIA)** and obtained legal advice to ensure compliance.

**Your rights:**
- You have the right to access, correct, or delete your information via your clinic.
- You may object to cross-border processing (your clinic can disable ClinicPro for your records).

**Questions?**  
Contact [NexWave Privacy Lead] at [email] or [Clinic Privacy Officer].

**Transparency:**  
For details on sub-processors, regions, and updates, see: [ClinicPro Transparency Page URL]

---

**Consent/Notice Status:**  
?? **Draft text ready** (legal and plain-language review recommended)

---

**END OF PRIVACY COMPLIANCE QUICK REFERENCE**
