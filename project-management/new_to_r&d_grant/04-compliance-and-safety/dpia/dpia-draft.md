# Data Protection Impact Assessment (DPIA)
## Submission-Ready Draft

---

## Project Overview

### Project Name
**ClinicPro NZ GP clinical LLM (assist-only)** ? inbox management, clinical coding, referral quality, and care gap monitoring

### Organisation
**NexWave Solutions Ltd (ClinicPro)**

### Stage and Scope
- **Year-1 R&D** with Medtech-first sandbox; development uses synthetic/de-identified data only
- Any pilot is **assist-only**, **clinician-in-the-loop**, and requires clinic agreement and notices

### Hosting and Data Residency Stance
- Inference may occur in **Australia** with **no persistent PHI outside New Zealand**
- All PHI at rest remains in **NZ** with **NZ-held encryption keys**
- Cross-border disclosure complies with **Privacy Act 2020 IPP 12** via contractual and technical safeguards

---

## Roles and Contacts

### Controller (Pilot Context)
Participating clinic(s) using the service

### Processor
NexWave Solutions Ltd (ClinicPro)

### Sub-Processors (to be confirmed prior to pilot)
- AU cloud compute provider and region for transient inference
- NZ storage provider for PHI at rest
- ASR provider if used (approved regions, DPA in place)

### Contacts
- **Clinic Privacy Officer:** [insert]
- **NexWave Privacy Lead:** [insert]
- **NexWave Security Lead:** [insert]
- **NexWave Director:** [insert]

---

## Purpose and Lawful Basis

### Purpose
Improve GP work efficiency and documentation quality via assist-only scribing, inbox summarisation/triage support, and clinical history summaries

### Lawful Basis (Pilot Context)
- Provision of health technology services to the clinic under contract
- Patient consent or clear notice for recording/scribing where applicable
- Data minimisation and necessity proportional to the stated service

### Development Basis
- Synthetic/de-identified data used for R&D; no model training on production PHI

---

## Data Subjects and Categories

### Data Subjects
- Patients
- Clinicians
- Practice staff (limited metadata)

### Personal Data/Health Information Potentially Processed in a Pilot
- Audio and transcript segments for scribing (transient)
- Inbox content (e.g., labs, letters, referrals, clinical messages) and necessary metadata
- Limited prior clinical context for history summaries (scoped retrieval)
- User prompts and assist-only outputs
- Operational telemetry without PHI payloads

### Special Category
Health information governed by the **Health Information Privacy Code (HIPC) 2020**

---

## Data Minimisation and Separation

### Development
- Synthetic/de-identified datasets only
- Synthetic Generation and De-identification SOP in place

### Pilot
- Least-privilege scopes in Medtech; only necessary fields accessed
- No PHI in application logs; ephemeral caches with short TTL

### Training Data Separation
- No training on production PHI
- Knowledge engine is lookup-only and clinician-triggered

---

## Data Flows and Storage

### NZ at Rest
PHI stored only in NZ storage controlled by the clinic and/or NexWave per DPA, if storage is required

### AU Compute (Option B)
- Transient encrypted requests over TLS to AU region for inference
- No persistent PHI outside NZ; encryption keys are held in NZ KMS/HSM

### Return Path
Encrypted response returned to NZ systems; no automatic write-back to Medtech

### Sub-Processor Transparency
Regions and sub-processors listed on the transparency page and in clinic DPA

---

## Cross-Border Compliance (IPP 12 Controls)

### Contractual Safeguards
- Processor DPA with the clinic and sub-processor DPAs with AU provider(s) that ensure comparable safeguards to NZ law
- Cross-border annex describing data types, regions, retention (none outside NZ), security, and breach duties

### Technical Safeguards
- TLS in transit; AES-256 at rest; NZ-held keys
- No persistent PHI outside NZ; logging excludes PHI

### Organisational Safeguards
- Staff training on privacy and security
- Access on least-privilege basis; regular access reviews

### Transparency
Publish regions, sub-processors, and data flows; provide notices to clinics and patients

---

## Security Controls (HISO 10029 and NZISM-Aligned)

### Governance
- Security policy; roles and responsibilities
- Joiner/mover/leaver processes; periodic risk reviews

### Access and Identity
- MFA; role-based access; quarterly access recertification
- Admin activity auditing

### Encryption
- TLS 1.2+; NZ KMS/HSM-held keys; key rotation
- Envelope encryption for backups (NZ only)

### Network and Platform
- Private networking; firewall rules; rate limiting
- WAF where applicable; vulnerability and patch management

### Application Safety
- Input/output filters; PHI/PII classifiers; refusal scaffolds
- Prompt hardening; change control gates

### Operations
- SIEM monitoring; backup/restore tested
- DR plan with documented RTO/RPO for NZ-hosted storage

---

## Safety and Clinical-Use Restrictions (NAIAEAG Aligned)

### Assist-Only
- No diagnostic or therapeutic directives
- Outputs labelled; "use with clinical judgement"

### Refusal Behaviour
- Refuse when uncertain, out-of-scope, or insufficient context
- Provide safe next steps (e.g., consult guidance)

### Human Oversight
- Clinician reviews all outputs
- No automatic note insertion or automated inbox actions

### Safety Monitoring
Monthly safety regression packs:
- Prohibited-claim rate ? 0.5%
- Refusal appropriateness ? 95%

---

## Retention, Deletion and Logs

### Development
Synthetic data retained per R&D governance; no PHI

### Pilot
- Default no-store for PHI
- If storage is required by a clinic, store only in NZ, encrypted, with agreed retention (e.g., ? 30 days) and automatic deletion

### Logs
- Operational logs exclude PHI
- Stored in NZ with retention (e.g., 90 days) for security and audit

### Deletion
- Documented secure deletion process
- Honour clinic and patient requests in line with law

---

## Transparency and Notices

### Transparency Page
- Sources used
- Model versions
- Regions and sub-processors
- Last updated; change log

### Clinic-Facing Notice
- Purpose; cross-border inference; no persistent PHI outside NZ
- No training on PHI; access/correction routes; contact details

### Patient Consent/Notice for Scribing (Example Text)
> "Your clinician may use AI assistance to help manage their workflow (inbox, coding, referrals, care gaps). The AI does not make medical decisions. Information may be processed on secure servers in Australia but is not stored there; your records remain in New Zealand."

---

## M?ori Data and Tikanga Considerations

### Commitment
- Respect M?ori data sovereignty
- Avoid training on PHI; publish data lineage and updates

### Engagement
- For expanded uses involving M?ori data, consult appropriate M?ori advisors
- Reflect tikanga in consent, notices, and governance

### Language
- Be clear about te reo M?ori support limitations and avoid misrepresentation

---

## Data Subject Rights

### Access and Correction
- Routes via clinic (controller)
- NexWave to assist within SLA

### Objection/Withdrawal
- Patient may decline scribing
- Clinic can disable features; document opt-out processes

### Portability and Deletion
- Via clinic
- Processor supports secure export and deletion on request

---

## Risk Assessment and Mitigations

### Cross-Border Leakage of PHI
- **Risk:** PHI persists outside NZ or keys compromised
- **Mitigations:** No persistent PHI outside NZ; encryption; NZ-held keys; contractual clauses; monitoring

### Re-Identification from De-Identified Data
- **Risk:** De-identified data linked back to individuals
- **Mitigations:** Synthetic preference; de-identification SOP; periodic risk review

### Unsafe Model Output (Hallucination; Clinical Advice)
- **Risk:** Model provides incorrect or harmful clinical guidance
- **Mitigations:** Assist-only policy; safety classifiers; refusal scaffolds; clinician in loop; safety regressions

### Over-Reliance by Clinicians
- **Risk:** Clinicians trust outputs without sufficient review
- **Mitigations:** Clear messaging; training; disable auto-insert; periodic reminders in UI

### Scope Creep/Misconfiguration
- **Risk:** Excessive data access or unintended uses
- **Mitigations:** Least-privilege scopes; automated tests; change control; quarterly reviews

### Vendor/Sub-Processor Breach
- **Risk:** Sub-processor security failure exposes PHI
- **Mitigations:** Due diligence; breach notification clauses; key revocation; isolation and rollback

### Model Drift/Safety Degradation
- **Risk:** Model behaviour changes over time without detection
- **Mitigations:** Version pinning; pre-release test gates; rollback plan; monthly safety packs

### Residual Risk
Acceptable with controls; reviewed quarterly; escalate on material change

---

## Incident Response and Breach Notification

### Detect
SIEM, anomaly detection, alerting on unusual access or data flow

### Contain
- Revoke keys; isolate AU inference; disable features
- Engage sub-processor SOC

### Notify
- Immediate notification to clinic
- OPC and affected individuals where required

### Learn
- Post-incident review; control updates
- Transparency page summary where appropriate

---

## Change Management and Testing

### Release Gates
- Security checks; safety regression results; latency benchmarks
- Approvals by Privacy and Safety leads

### Rollback
- Versioned deployments; documented revert steps
- Clinic communications

### Test Data
- Synthetic/de-identified only
- No production PHI in test suites

---

## Third Parties and Sub-Processors

*To list on transparency page and in DPAs:*

- AU cloud compute region for transient inference [insert provider and region]
- NZ storage provider for PHI at rest [insert provider]
- ASR provider (if used) with approved region and DPA [insert]
- Monitoring/logging providers with no PHI content or NZ residency [insert]

---

## DPAs and Legal Artefacts

### Controller?Processor DPA with Clinics
- Purpose limitation; security controls
- Sub-processing and audit rights; cross-border annex
- Deletion on termination; incident notification timelines

### Sub-Processor DPAs
- Comparable safeguards; region lock
- No persistent PHI outside NZ; breach duties; audit rights

### IPP 12 Annex
- Description of protections; key management; retention
- Incident process; contact points

---

## DPIA Approvals and Review

### Summary
With controls above, residual risk is acceptable and compliant with Privacy Act 2020, HIPC 2020 and HISO 10029 guidance

### Conditions to Proceed
- Finalise sub-processor list and regions
- Publish transparency page v1
- Complete staff privacy/safety training
- Sign DPAs

### Approvals
- **Clinic Privacy Officer:** [name/date]
- **Clinic Governance:** [name/date]
- **NexWave Privacy Lead:** [name/date]
- **NexWave Director:** [name/date]

### Review Cycle
Quarterly; earlier on material change (new regions, new sub-processors, new data uses)

---

## Attachments Checklist

- [ ] Data flow diagram (simple schematic NZ storage ? AU transient inference ? NZ client)
- [ ] IPP 12 control checklist
- [ ] HISO 10029 mapping table (selected controls)
- [ ] Controller?Processor DPA template and sub-processor DPAs
- [ ] Transparency page draft/SOP (sources, regions, sub-processors, update log)
- [ ] Consent/notice text samples (clinician and patient)
- [ ] Synthetic/De-identification SOP
- [ ] Staff training records for privacy and safety

---

---

# IPP 12 Cross-Border Disclosure ? Control Checklist
## Option B: AU inference; no persistent PHI outside NZ

### Lawful Basis and Scope
- [ ] Identify personal/health information categories, purposes, and minimal fields disclosed cross-border
- [ ] Confirm disclosure is necessary for the stated service (assist-only inbox, coding, referrals, care gaps)

### Comparable Safeguards (Contractual)
- [ ] Controller?Processor DPA in place with clinic
- [ ] Sub-processor DPA with AU cloud provider
- [ ] Cross-border annex stating: regions, data types, no persistent PHI outside NZ, onward-transfer limits, deletion/return
- [ ] Audit rights for Controller and, where required, the OPC
- [ ] Breach notification timelines and cooperation duties

### Technical and Organisational Controls
- [ ] Encryption in transit (TLS 1.2+) and at rest (AES-256)
- [ ] NZ-held keys (KMS/HSM); key rotation
- [ ] Region lock to nominated AU regions; hard ban on other regions; no data residency auto-migrate
- [ ] No PHI in logs; log minimisation; masking where needed
- [ ] Access control: MFA, least privilege, quarterly access review
- [ ] Supplier due diligence; security posture review; right to audit

### Data Minimisation and Transparency
- [ ] Limit fields disclosed to only what is required for the task
- [ ] Publish transparency page (regions, sub-processors, update log)
- [ ] Provide clinic notices and patient consent/notice text for scribing

### Data Retention and Deletion
- [ ] No persistent PHI outside NZ; ephemeral caches with short TTL only
- [ ] NZ storage only for any at-rest PHI; defined retention; secure deletion on request or termination

### Data Subject Rights Support
- [ ] Processor assists Controller with access, correction, objection, and deletion requests

### Ongoing Assurance
- [ ] DPIA completed and reviewed quarterly
- [ ] Change control for any new sub-processor/region; re-run DPIA if material change
- [ ] Continuous monitoring, incident drills, and annual supplier reassessment

---

---

# HISO 10029 Control Mapping ? Short Alignment Guide

### Governance and Policy
- Security and privacy policies approved by management; roles defined (Privacy Lead, Security Lead)
- Risk management cadence; DPIA and change management gates

### Asset and Data Management
- Data inventory and classification; PHI tagged
- Synthetic/de-identified data SOPs

### Access Control and Identity
- Role-based access; least privilege; MFA
- Quarterly access recertification; admin actions audited

### Cryptography and Key Management
- TLS 1.2+; AES-256 at rest
- NZ-resident KMS/HSM; key rotation and segregation of duties

### Operations Security
- Secure build pipelines; dependency scanning
- Vulnerability and patch management; change control with rollback plans

### Logging and Monitoring
- Centralised logging without PHI; SIEM alerts
- Retention in NZ; tamper-evident audit trails

### Application and Data Protection
- Input/output validation; PII/PHI classifiers; refusal scaffolds
- Prompt hardening; model safety regressions

### Network Security
- Private networking; firewalls; WAF where applicable
- Rate limiting; DDoS controls per provider capability

### Supplier and Sub-Processor Management
- Due diligence; DPAs with flow-down obligations; region locks
- Annual reassessment; right to audit

### Incident Response and Business Continuity
- Incident runbooks; 24/7 escalation; breach notice within contract timelines
- NZ-only backups; tested restore; RTO/RPO targets defined

### Privacy Management
- Privacy training; IPP 12 controls; HIPC 2020 awareness
- Consent/notice text; transparency page; records of processing

### Clinical Safety and Human Oversight
- Assist-only use; no auto-insert; clinician review
- Safety KPIs tracked (refusal appropriateness, prohibited-claim rate)

---

---

# Controller?Processor DPA ? Key Clauses to Include

### Parties and Roles
- Clinic as Controller
- NexWave (ClinicPro) as Processor
- Named sub-processors listed in annex

### Purpose Limitation and Instructions
- Processing solely to deliver assist-only inbox management, clinical coding, referral quality checking, and care gap monitoring
- Follow documented Controller instructions
- Notify if instructions conflict with law

### Categories of Data and Subjects
- Health information (patients), limited staff/user metadata
- Specific categories enumerated

### Confidentiality and Personnel
- Staff bound by confidentiality; trained in privacy and security
- Access on least-privilege basis

### Security Measures
- Specific technical and organisational controls (as per HISO mapping)
- Encryption in transit/at rest; NZ-held keys
- Log minimisation; access reviews

### Data Location and Cross-Border Transfers (IPP 12)
- PHI at rest in NZ; AU inference only
- No persistent PHI outside NZ; region locks
- No onward transfers without consent; IPP 12 annex attached

### Sub-Processing
- Prior authorisation for named sub-processors; flow-down of obligations
- Advance notice for changes (e.g., 15 business days) with Controller right to object

### Data Subject Rights Assistance
- Processor assists Controller with access, correction, objection, portability, and deletion within agreed SLAs

### Breach Notification and Incident Response
- Notify Controller without undue delay and within 24 hours of confirmed personal data breach
- Provide details and ongoing updates
- Cooperate with OPC and remediation

### Audit and Compliance
- Maintain records of processing
- Provide security summaries and attestations
- Allow Controller audits or third-party assessments with reasonable notice (e.g., 10 business days)

### Retention, Deletion, and Return
- On termination or request, securely delete or return PHI within defined timeframe (e.g., 30 days)
- Certify deletion; NZ-only backups destroyed per schedule

### Transparency and Notices
- Maintain and publish transparency page (regions, sub-processors, updates)
- Notify Controller of material changes

### Assistance with DPIA and Consultations
- Provide necessary information to support DPIA, privacy risk assessments, and consultations with OPC if required

### Liability and Indemnity
- Processor liable for breaches of its obligations and for sub-processor failings
- Appropriate caps and exclusions agreed; no cap for wilful misconduct or fraud

### Insurance
- Maintain appropriate professional indemnity and cyber insurance
- Provide certificates on request

### Term, Termination and Survival
- Term aligned to service agreement
- Termination on material breach
- Survival of confidentiality, security, deletion and audit clauses

### Governing Law and Jurisdiction
- New Zealand law
- NZ courts' non-exclusive jurisdiction

### Order of Precedence
If conflict between DPA and main agreement, DPA prevails for privacy/security matters

---

**END OF DPIA DOCUMENT**
