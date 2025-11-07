# Risk and Change Management
## Living Governance Document

**Last Updated:** 2025-11-01  
**Version:** 1.0  
**Review Cadence:** Quarterly (or on material change)

---

## Purpose

This document tracks:
1. **Risk Register** ? Project risks, mitigations, owners, status
2. **Change Log** ? Version history for all project documents
3. **Stage-Gates** ? O1?O5 entry/exit criteria and safety gates
4. **Release Checklist** ? Pre-release security, safety, and approval checks
5. **Review and Escalation Procedures**

---

---

# 1. Risk Register

## Risk Categories
- **Privacy & Compliance** ? IPP 12, DPIA, DPA, breach
- **Safety & Clinical** ? Hallucinations, over-reliance, prohibited claims
- **Technical** ? Latency, model drift, integration
- **Financial** ? Co-funding, cashflow, eligibility
- **Operational** ? Scope creep, resource constraints, sub-processor failure

---

## Active Risks (Initial Assessment)

### R01: Cross-Border Leakage of PHI
- **Category:** Privacy & Compliance
- **Description:** PHI persists outside NZ or encryption keys compromised in AU inference
- **Likelihood:** Low (with controls)
- **Impact:** Critical (regulatory breach, OPC notification, reputational damage)
- **Mitigations:**
  - No persistent PHI outside NZ (ephemeral caches only with short TTL)
  - Encryption: TLS in transit; AES-256 at rest
  - NZ-held keys (KMS/HSM); key rotation
  - Contractual clauses in sub-processor DPAs (region locks, audit rights)
  - SIEM monitoring for unusual data flows
- **Owner:** Privacy Lead
- **Status:** Mitigated (controls in place)
- **Review:** Quarterly

---

### R02: Re-Identification from De-Identified Data
- **Category:** Privacy & Compliance
- **Description:** De-identified development data could be linked back to individuals
- **Likelihood:** Low (with SOPs)
- **Impact:** High (privacy breach, loss of trust)
- **Mitigations:**
  - Synthetic data preference wherever possible
  - De-identification SOP with periodic risk review
  - No production PHI used for model training
  - Access controls on development datasets (least privilege)
- **Owner:** Privacy Lead
- **Status:** Mitigated
- **Review:** Quarterly

---

### R03: Unsafe Model Output (Hallucination; Clinical Advice)
- **Category:** Safety & Clinical
- **Description:** Model provides incorrect or harmful clinical guidance (diagnostic/treatment directives)
- **Likelihood:** Medium (emergent LLM behaviour)
- **Impact:** Critical (patient safety, regulatory breach, liability)
- **Mitigations:**
  - Assist-only policy (no diagnostic/treatment directives)
  - Safety classifiers (claim/PII detection)
  - Refusal scaffolds (refuse when uncertain, out-of-scope, insufficient context)
  - Clinician-in-the-loop (human review of all outputs)
  - Monthly safety regressions (prohibited-claim rate ?0.5%; refusal appropriateness ?95%)
  - Pre-release test gates (red-team tests for prohibited claims)
- **Owner:** Security Lead
- **Status:** Mitigated (ongoing monitoring required)
- **Review:** Monthly safety packs

---

### R04: Over-Reliance by Clinicians
- **Category:** Safety & Clinical
- **Description:** Clinicians trust model outputs without sufficient review or clinical judgement
- **Likelihood:** Medium (human factors)
- **Impact:** High (patient safety, liability)
- **Mitigations:**
  - Clear messaging: "Use with clinical judgement" label on all outputs
  - No automatic note insertion (manual review required)
  - Disable auto-insert features in pilot
  - Periodic reminders in UI ("Review for accuracy")
  - Training materials for pilot clinics (expectations, limitations)
- **Owner:** NexWave Director
- **Status:** Design phase (controls to be built)
- **Review:** Pre-pilot; quarterly during pilot

---

### R05: Scope Creep / Misconfiguration
- **Category:** Operational
- **Description:** Excessive data access or unintended uses (beyond inbox, coding, referrals, care gaps)
- **Likelihood:** Medium (complex integration)
- **Impact:** Medium (privacy breach, wasted effort)
- **Mitigations:**
  - Least-privilege scopes in Medtech integration
  - Automated tests for scope boundaries
  - Change control gates (no new data access without Privacy Lead approval)
  - Quarterly reviews of actual vs intended data access
- **Owner:** Security Lead
- **Status:** Design phase
- **Review:** Quarterly

---

### R06: Vendor / Sub-Processor Breach
- **Category:** Privacy & Compliance
- **Description:** Sub-processor (AU cloud, NZ storage, ASR provider) security failure exposes PHI
- **Likelihood:** Low (with due diligence)
- **Impact:** Critical (regulatory breach, OPC notification)
- **Mitigations:**
  - Due diligence on sub-processor selection (security posture, certifications)
  - DPAs with breach notification clauses (24hr timeline)
  - NZ-held key revocation capability (immediate lockout)
  - Isolation and rollback plan (disable AU inference; revert to local-only)
  - Annual supplier reassessment
- **Owner:** Privacy Lead
- **Status:** Pre-contract (DPAs to be signed before pilot)
- **Review:** Annually; immediately on breach notification

---

### R07: Model Drift / Safety Degradation
- **Category:** Safety & Clinical
- **Description:** Model behaviour changes over time without detection (safety metrics decline)
- **Likelihood:** Medium (continuous learning systems)
- **Impact:** High (patient safety, regulatory breach)
- **Mitigations:**
  - Version pinning (no auto-updates in production)
  - Pre-release test gates (safety regression must pass before deploy)
  - Rollback plan (documented revert steps; tested)
  - Monthly safety packs (track prohibited-claim rate, refusal appropriateness over time)
  - No training on production PHI (no drift from patient data)
- **Owner:** Security Lead
- **Status:** Mitigated (controls in design)
- **Review:** Monthly safety packs

---

### R08: CapDev < 5% of Grant
- **Category:** Financial
- **Description:** Capability Development falls below 5% of grant due to scope changes
- **Likelihood:** Low (with planning)
- **Impact:** Medium (claim rejection, grant reduction)
- **Mitigations:**
  - 30 hours CapDev labour locked ($2,880 = 6.7% of grant ?)
  - Adjust up slightly before Q1 claim if total costs change
  - Quarterly review of CapDev % in cost template
- **Owner:** NexWave Director
- **Status:** Mitigated
- **Review:** Before each claim

---

### R09: Cashflow Shortfall (Co-Funding)
- **Category:** Financial
- **Description:** GP clinical work income insufficient to fund 60% co-funding or working capital float
- **Likelihood:** Low (with forecast)
- **Impact:** High (project pause, grant breach)
- **Mitigations:**
  - $11,000/month GP clinical work income demonstrated in cashflow forecast
  - Positive cash position throughout (minimum $8,216; closes at $73,461)
  - Quarterly review of actual vs forecast cashflow
  - Contingency: reduce R&D hours if revenue drops
- **Owner:** NexWave Director
- **Status:** Mitigated (cashflow positive)
- **Review:** Monthly cashflow actuals vs forecast

---

## Risk Review Cadence

| Frequency | Action | Owner |
|-----------|--------|-------|
| **Monthly** | Review safety regressions (R03, R07) | Security Lead |
| **Quarterly** | Review full risk register; update mitigations | Privacy Lead + NexWave Director |
| **On material change** | Re-assess risks (e.g., new sub-processor, new data use) | Privacy Lead |
| **Annually** | Sub-processor reassessment (R06) | Privacy Lead |

---

---

# 2. Change Log

## Document Version History

### `forge-application-narrative.md`
| Version | Date | Status | Changes | Approved By |
|---------|------|--------|---------|-------------|
| v1.0 | 2025-11-01 | Draft | Initial draft for Forge submission | [Pending] |

### `cost-template.md`
| Version | Date | Status | Changes | Approved By |
|---------|------|--------|---------|-------------|
| v1.0 | 2025-11-01 | Draft | Initial cost breakdown (O1?O5, CD-A/B/C) | [Pending] |

### `cashflow-12-month.md`
| Version | Date | Status | Changes | Approved By |
|---------|------|--------|---------|-------------|
| v1.0 | 2025-11-01 | Draft | 12-month forecast with grant timing | [Pending] |

### `capability-development-evidence-pack.md`
| Version | Date | Status | Changes | Approved By |
|---------|------|--------|---------|-------------|
| v1.0 | 2025-11-01 | Draft | CapDev courses, setups, evidence requirements | [Pending] |

### `dpia-draft.md`
| Version | Date | Status | Changes | Approved By |
|---------|------|--------|---------|-------------|
| v1.0 | 2025-11-01 | Draft | Complete DPIA (Option B, IPP 12, HISO, DPA) | [Pending NexWave Director] |

### `claims-toolkit.md`
| Version | Date | Status | Changes | Approved By |
|---------|------|--------|---------|-------------|
| v1.0 | 2025-11-01 | Draft | Timesheets, GST invoices, claim checklists | [Pending] |

### `project-master-index.md`
| Version | Date | Status | Changes | Approved By |
|---------|------|--------|---------|-------------|
| v1.1 | 2025-11-01 | Active | Added "For LLM Agents" section with task-based guidance (A-F) and common workflows | NexWave Director |
| v1.0 | 2025-11-01 | Active | Navigation hub and project overview | NexWave Director |

### `risk-and-change-management.md`
| Version | Date | Status | Changes | Approved By |
|---------|------|--------|---------|-------------|
| v1.0 | 2025-11-01 | Active | Initial risk register, change log, stage-gates | NexWave Director |

### `privacy-compliance-quick-reference.md`
| Version | Date | Status | Changes | Approved By |
|---------|------|--------|---------|-------------|
| v1.0 | 2025-11-01 | Draft | IPP 12, HISO, DPA, consent notices (extracted from DPIA) | [Pending] |

### `safety-and-transparency-framework.md`
| Version | Date | Status | Changes | Approved By |
|---------|------|--------|---------|-------------|
| v1.0 | 2025-11-01 | Draft | NAIAEAG, safety regression, incident runbook, transparency | [Pending] |

---

## Change Request Template

When a material change is needed:

1. **Describe change:** [What needs to change and why]
2. **Impact assessment:** [Which documents affected; risk implications; cost/timeline impact]
3. **Approval required:** [Privacy Lead / Security Lead / Director]
4. **DPIA re-run needed?** [Yes/No ? trigger: new sub-processor, new region, new data use]
5. **Document updates:** [List files to update with new version numbers]

---

---

# 3. Stage-Gates (O1?O5)

## Purpose
Each Objective has entry/exit criteria and safety gates to ensure quality and compliance before proceeding.

---

## O1: Baseline and Dataset Curation (27 Jan ? 31 Mar 2026)

### Entry Criteria
- [ ] CapDev courses (OPC Privacy Act, OPC HIPC, Ko Awatea) completed
- [ ] DPIA v1.0 approved by NexWave Director
- [ ] Synthetic/de-identification SOP drafted
- [ ] Risk register initialized

### Exit Criteria
- [ ] NZ public corpus curated (with source register)
- [ ] Synthetic/de-identified datasets created and tagged in DVC
- [ ] Eval harness built (inbox classification, coding accuracy, referral completeness, care gap detection, latency)
- [ ] Baseline model selected and quantized
- [ ] Baseline metrics measured: latency P95, inbox classification accuracy, coding accuracy baseline

### Safety Gates
- [ ] No production PHI used in datasets
- [ ] Source register published (data lineage transparent)
- [ ] De-identification SOP followed (if any real data used)

---

## O2: NZ GP Domain Adaptation (10 Feb ? 30 May 2026)

### Entry Criteria
- [ ] O1 exit criteria met (baseline established)
- [ ] Synthetic datasets available in DVC

### Exit Criteria
- [ ] Continual pretraining on NZ public sources completed
- [ ] Instruction tuning for 4 use cases (inbox, coding, referrals, care gaps) completed
- [ ] Model v0.1 released
- [ ] ? 70% inbox classification accuracy (baseline); ? 60% coding accuracy (baseline)
- [ ] Template conformity ? 90%

### Safety Gates
- [ ] No training on production PHI
- [ ] MLflow tracking shows experiment lineage
- [ ] Pre-release safety regression passed (prohibited-claim rate checked)

---

## O3: Safety and Assist-Only Enforcement (01 Mar ? 30 Jul 2026)

### Entry Criteria
- [ ] Model v0.1 available (O2 complete)
- [ ] Safety dashboard configured

### Exit Criteria
- [ ] Policy engine implemented (assist-only enforcement)
- [ ] Claim/PII classifiers built and tested
- [ ] Refusal scaffolds deployed
- [ ] Audit logs configured (no PHI in logs)
- [ ] Monthly safety regression pack defined and first pack completed
- [ ] Prohibited-claim rate ? 0.5%
- [ ] Refusal appropriateness ? 95%
- [ ] Zero PHI leakage in red-team tests

### Safety Gates (Critical)
- [ ] Red-team tests passed (no diagnostic/treatment directives)
- [ ] Refusal behaviour stable across test scenarios
- [ ] PHI masking tested (no PHI in logs or outputs where not intended)
- [ ] Incident runbook tested (breach notification process)

---

## O4: Medtech Sandbox and Synthetic Inbox Workloads (01 Mar ? 30 Sep 2026)

### Entry Criteria
- [ ] Safety controls deployed (O3 complete)
- [ ] DPA templates ready for sub-processor sign-off

### Exit Criteria
- [ ] Medtech sandbox connection established (least-privilege scopes)
- [ ] Synthetic inbox generators created
- [ ] Latency/throughput tests completed
- [ ] Transparency page v1 published (sources, regions, sub-processors)
- [ ] Inbox response P95 ? 5.0 s
- [ ] Stable throughput demonstrated
- [ ] No persistent PHI outside NZ confirmed (ephemeral only)

### Safety Gates
- [ ] Least-privilege scopes verified (no excess data access)
- [ ] Synthetic workloads only (no production PHI in sandbox)
- [ ] Transparency page peer-reviewed (accurate sources, regions, sub-processors)

---

## O5: Pilot-Readiness and Evaluation (01 Oct 2026 ? 26 Jan 2027)

### Entry Criteria
- [ ] O1?O4 complete (all deliverables and safety gates passed)
- [ ] DPAs signed with sub-processors
- [ ] Clinic agreement for pilot secured

### Exit Criteria
- [ ] Telemetry and monitoring operational (SIEM, dashboards)
- [ ] Incident playbooks tested (breach notification, rollback)
- [ ] Clinician evaluation framework ready
- [ ] Pre-pilot checklist complete:
  - [ ] DPIA signed by clinic Privacy Officer
  - [ ] Consent/notice text approved
  - [ ] Transparency page live
  - [ ] Safety regressions up-to-date (last 3 months)
  - [ ] Rollback plan tested
- [ ] Utility targets met: ?30% inbox triage time reduction; ?85% coding accuracy; ?80% usefulness (all 4 use cases)
- [ ] Safety targets met: prohibited-claim ?0.5%; refusal ?95%; zero PHI leakage

### Safety Gates (Pre-Pilot)
- [ ] Final DPIA review by Privacy Lead and Director
- [ ] Clinic governance sign-off
- [ ] Transparency page published and accessible to patients/clinicians
- [ ] No outstanding critical risks in risk register

---

---

# 4. Release Checklist

## Pre-Release Checklist (Model Updates, Feature Releases)

### Security Checks
- [ ] Dependency scan completed (no critical vulnerabilities)
- [ ] Code review completed (security-focused)
- [ ] Access controls verified (least privilege; MFA)
- [ ] Secrets/keys rotated (if scheduled)
- [ ] Encryption confirmed (TLS in transit; AES-256 at rest; NZ-held keys)

### Safety Checks (Critical)
- [ ] Safety regression pack passed:
  - [ ] Prohibited-claim rate ? 0.5%
  - [ ] Refusal appropriateness ? 95%
  - [ ] Zero PHI leakage in test suite
- [ ] Red-team tests passed (no diagnostic/treatment directives)
- [ ] Latency benchmarks met (Response time P95 ? 5.0s for all use cases)
- [ ] Monthly safety pack generated and reviewed

### Compliance Checks
- [ ] DPIA up-to-date (no new data uses, regions, or sub-processors without review)
- [ ] Transparency page updated (sources, model version, regions, sub-processors, change log)
- [ ] IPP 12 controls verified (region locks, no persistent PHI outside NZ)
- [ ] Audit logs tested (no PHI in logs)

### Approvals
- [ ] Privacy Lead sign-off (if privacy-impacting change)
- [ ] Security Lead sign-off (always required)
- [ ] NexWave Director sign-off (for major releases or pilot launch)

### Rollback Plan
- [ ] Previous version pinned and accessible
- [ ] Rollback steps documented and tested
- [ ] Clinic communication drafted (if pilot active)

### Documentation
- [ ] Change log updated (version, date, changes)
- [ ] Release notes drafted (internal and clinic-facing if applicable)
- [ ] Transparency page change log updated

---

---

# 5. Review and Escalation Procedures

## Quarterly Review Process

**When:** End of Months 3, 6, 9, 12 (align with claims)

**Attendees:** Privacy Lead, Security Lead, NexWave Director

**Agenda:**
1. Review risk register (update likelihood, impact, mitigations, status)
2. Review change log (document versions, approvals)
3. Review safety regressions (trends: prohibited-claim rate, refusal appropriateness)
4. Review transparency page (accuracy, completeness)
5. Review DPIA (any material changes requiring update?)
6. Review cashflow actuals vs forecast
7. Escalate any issues requiring immediate action

**Outputs:**
- Updated risk register
- Updated change log
- Action items (with owners and deadlines)
- DPIA update flag (if needed)

---

## Escalation Triggers (Immediate Review Required)

| Trigger | Action | Owner |
|---------|--------|-------|
| **Prohibited-claim rate > 0.5%** | Halt releases; investigate root cause; re-run safety regression | Security Lead |
| **PHI leakage detected** (logs, outputs, external) | Activate incident runbook; notify clinic; assess OPC notification | Privacy Lead |
| **Sub-processor breach notification** | Activate incident runbook; assess impact; key revocation if needed | Privacy Lead |
| **New sub-processor or region** | Re-run DPIA; update DPAs; update transparency page | Privacy Lead |
| **Cashflow negative** | Review co-funding; reduce hours; escalate to Callaghan if needed | NexWave Director |
| **Claim rejection** | Review rejection reason; correct; resubmit; escalate if eligibility issue | NexWave Director |
| **Scope creep detected** (excess data access) | Disable feature; review scopes; update change control | Security Lead |

---

## Contact Escalation Path

1. **Privacy Lead** ? Privacy/compliance issues, DPIA updates, DPA negotiations
2. **Security Lead** ? Safety regressions, technical security, incident response
3. **NexWave Director** ? Financial, strategic, Callaghan relationship, final approvals
4. **External advisors:**
   - Privacy lawyer (DPA review, OPC consultation)
   - Security auditor (penetration testing, HISO compliance)
   - Clinical advisor (NAIAEAG alignment, patient safety)

---

**END OF RISK AND CHANGE MANAGEMENT DOCUMENT**
