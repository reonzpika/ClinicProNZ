---
project_name: NZ-Sovereign Clinical LLM for GP Workflow (ClinicPro)
project_stage: Validation
owner: TBD
last_updated: "2025-11-07"
version: "1.3"
tags:
  - r&d-grant
  - healthcare-ai
  - nz-sovereign
  - clinical-llm
  - callaghan-innovation
  - gp-workflow
summary: R&D grant proposal for building a NZ-sovereign clinical LLM to assist NZ GPs with inbox management and care gap monitoring. 12-month project seeking $70,026 grant (40%) with $105,039 co-funding. Team: Founder (1,329 hrs) + Developer (390 hrs, starts Month 4). Includes IP protection, conference attendance, hardware.
links:
  - name: Master Proposal
    path: MENTOR-PROPOSAL.md
  - name: Project Master Index
    path: 00-admin-and-governance/project-master-index.md
  - name: Proposal Status
    path: 00-admin-and-governance/proposal-status-and-next-steps.md
stakeholders:
  - role: Applicant
    name: NexWave Solutions Ltd
  - role: Partner
    name: Medtech (NZ's largest PMS, ~60% market share)
  - role: Mentor
    name: TBD (meeting scheduled 12 Nov 2025, 8:30am)
  - role: Callaghan Innovation Contact
    name: Paul (meeting scheduled 13 Nov 2025, 2:00pm)
milestones:
  - date: "2025-11-01"
    name: Mentor review ready
    status: completed
  - date: "2025-11-06"
    name: Mentor proposal sent
    status: completed
  - date: "2025-11-12"
    name: Mentor meeting (8:30am)
    status: pending
  - date: "2025-11-13"
    name: Callaghan Innovation meeting with Paul (2:00pm)
    status: pending
  - date: "2026-01-27"
    name: Project start
    status: pending
  - date: "2027-01-26"
    name: Project end
    status: pending
risks:
  - name: Market validation gaps
    severity: high
    status: identified
  - name: Commercialization strategy missing
    severity: high
    status: identified
---

# Project Overview: NZ-Sovereign Clinical LLM for GP Workflow

**Project Name:** ClinicPro: NZ-Sovereign Clinical LLM (assist-only)  
**Organisation:** NexWave Solutions Ltd  
**Grant Type:** Callaghan Innovation - New to R&D Grant  
**Project Duration:** 27 Jan 2026 - 26 Jan 2028 (24 months - up to 2 years)  
**Total Eligible Costs:** TBD (targeting ~$200k opening cash capacity)  
**Grant Request:** TBD (40%)  
**Co-Funding:** TBD (60% from GP clinical work income)

**Status:** Under revision following mentor meeting with Paula (23 Nov 2025)

---

## Executive Summary

This project proposes building a New Zealand-sovereign clinical LLM to address critical workload and burnout issues facing NZ general practitioners. The AI system will assist GPs with two high-impact workflows:

1. **Inbox Management (Reactive)** - Triage, classify, and summarise hundreds of daily items (hospital letters, lab results, referrals, discharge summaries). Saves 1-2 hours/day per GP.

2. **Care Gap Monitoring (Proactive)** - Proactively identify and alert overdue chronic disease monitoring per NZ clinical guidelines (HbA1c, BP checks, lipids, medication reviews). Supports PHO quality indicators.

**Key Differentiators:**
- ✓ NZ data sovereignty (self-hosted in NZ/AU, NZ-held keys)
- ✓ Cost-effective at scale (20-50x cheaper than Azure OpenAI: $5-10k/month vs $140-170k/month)
- ✓ NZ-tuned (Pharmac, ACC, HealthPathways, regional variations)
- ✓ Medtech partnership (NZ's largest PMS = real-world testing + 3,000+ GP access)
- ✓ Privacy-first (no training on production PHI; synthetic/de-identified only)

**R&D Uncertainty:** Can a small model (7B-13B parameters) achieve 70-80% of GPT-4/5 quality for NZ-specific clinical tasks under strict cost, privacy, and latency constraints?

---

## Project Structure

The project is organized into 6 main directories:

### 00-admin-and-governance/
- `project-master-index.md` - Navigation hub and project overview
- `proposal-status-and-next-steps.md` - Current status (6.9/10), strengths, weaknesses, priority actions
- `risk-and-change-management.md` - Risk register, change log, stage-gates, release checklist
- `section-1-3-updates-summary.md` - Summary of updates to proposal sections 1-3

### 01-application-narrative/
- `forge-application-narrative.md` - Complete Forge portal submission narrative with all required sections
- `commercialization-and-market-strategy.md` - Pricing model, GTM, adoption, competitive positioning

### 02-financials/
- `cashflow-12-month.md` - Monthly cashflow forecast showing positive cash throughout ($5k opening → $32k closing)
- `cost-template/cost-template.md` - Detailed cost breakdown by Objective (R&D + CapDev + IP + Conferences + Hardware)

### 03-capability-development/
- `capability-development-evidence-pack.md` - CapDev courses, one-off setups, evidence requirements

### 04-compliance-and-safety/
- `dpia/dpia-draft.md` - Complete Data Protection Impact Assessment (Option B: AU inference, NZ keys)
- `privacy-compliance-quick-reference.md` - IPP 12, HISO 10029, DPA clauses, consent notices
- `safety-and-transparency-framework.md` - Safety procedures, incident runbook, transparency requirements

### 05-claims-and-tracking/
- `templates/claims-toolkit.md` - Quarterly claim templates, timesheets, GST invoices, checklists

### 06-market-validation/
- `clinicpro-operational-evidence.md` - Evidence document showing ClinicPro is operational with active GP users, validating market demand

---

## R&D Objectives (5 Objectives)

### O1: Baseline and Dataset Curation (27 Jan - 31 Mar 2026)
- Curate NZ public corpus (BPAC, NZGG, Pharmac)
- Generate synthetic/de-identified datasets
- Build evaluation harness
- Select and quantize base model (7B-13B params)
- **Deliverables:** Baseline metrics, datasets versioned in DVC
- **Hours:** 180 | **Cost:** $17,280

### O2: NZ GP Domain Adaptation (10 Feb - 30 May 2026)
- Continual pretraining on NZ public clinical sources (Pharmac, BPAC, local guidelines)
- Instruction tuning for 2 use cases (inbox management, care gap monitoring)
- **Deliverables:** Model v0.1
- **Targets:** Inbox classification ≥70%, Care gap detection ≥70%
- **Hours:** 290 | **Cost:** $27,840

### O3: Safety and Assist-Only Enforcement (01 Mar - 30 Jul 2026)
- Implement policy engine (refusal scaffolds)
- Build claim/PII classifiers
- Create audit logs
- Run monthly safety regressions
- **Deliverables:** Safety pack template, monthly test results
- **Targets:** Prohibited-claim rate ≤0.5%, Refusal appropriateness ≥95%
- **Hours:** 300 | **Cost:** $28,800

### O4: Medtech Sandbox and Synthetic Workloads (01 Mar - 30 Sep 2026)
- Connect to Medtech sandbox (least-privilege scopes)
- Generate synthetic inbox data and patient records for care gap testing
- Run latency/throughput tests
- Publish transparency page v1
- **Deliverables:** Sandbox integration, transparency page live
- **Targets:** Response P95 ≤5.0s, Stable throughput
- **Hours:** 170 | **Cost:** $16,320

### O5: Pilot-Readiness and Evaluation (01 Oct 2026 - 26 Jan 2027)
- Build telemetry and monitoring
- Create incident playbooks
- Develop clinician evaluation framework
- Complete pre-pilot checklist
- **Deliverables:** Pilot-ready system, evaluation framework
- **Targets:** All success criteria met (see Success Criteria section)
- **Hours:** 122 | **Cost:** $11,712

**Founder R&D Hours:** 1,329 @ $96/hr | **Cost:** $127,584  
**Developer R&D Hours:** 390 @ $72/hr (starts Month 4) | **Cost:** $28,080  
**Total R&D Hours:** 1,719 | **Total R&D Cost:** $155,664

---

## Capability Development (4 Streams)

### CD-A: Regulatory & Compliance (27 Jan - 31 Mar 2026)
- 3 privacy certificate courses (OPC Privacy Act, OPC HIPC, Ko Awatea)
- Complete DPIA (Option B: AU inference, NZ keys, IPP 12 safeguards)
- Create IPP 12 checklist, HISO mapping, DPA templates
- **Hours:** 12 | **Cost:** $1,152

### CD-B: R&D Information Management (27 Jan - 30 Apr 2026)
- Set up MLflow (experiment tracking), DVC (dataset versioning)
- Build safety dashboard
- Draft transparency SOP and page v1
- **Hours:** 10 | **Cost:** $960

### CD-C: Project Management Set-up (27 Jan - 29 Feb 2026)
- Define stage-gates (O1-O5 entry/exit criteria)
- Create risk register, change log, release checklist
- **Hours:** 8 | **Cost:** $768

### CD-D: Conference Attendance & Knowledge Acquisition (Months 5-7)
- HealthTech Week Auckland (Month 5): 8 hours attendance/networking
- HIC 2026 Melbourne (Month 7): 16 hours attendance/presentations
- **Hours:** 24 | **Labour Cost:** $2,304

**Total CapDev Hours:** 54 | **Total CapDev Labour:** $5,184 (7.4% of grant ✓)

**Note:** Conference travel costs ($3,200) and IP services ($6,000) are separate budget lines, NOT part of CapDev labour.

---

## Financial Summary

| Category | Amount (NZD excl. GST) |
|----------|------------------------|
|| **R&D Labour - Founder** (1,329 hours @ $96/hr) | $127,584 |
|| **R&D Labour - Developer** (390 hours @ $72/hr) | $28,080 |
|| **Capability Development Labour** (54 hours @ $96/hr) | $5,184 |
| **Materials & Consumables** ($200/month × 12) | $2,400 |
|| **Professional Services (IP)** | $6,000 |
|| **Conference Travel** (HIC + HealthTech Week) | $3,200 |
|| **Hardware** (Year 1 depreciation + immediate) | $2,617 |
|| **Total Eligible Costs** | **$175,065** |
| | |
|| **Grant (40%)** | **$70,026** |
|| **Co-Funding (60%)** | **$105,039** |

**Cashflow:** Positive throughout project
- Opening cash: $5,000
- Minimum cash position: $1,879 (Month 6)
- Closing cash: $32,213 (Month 13)
- Monthly co-funding: ~$8,753 average
- Co-funding source: GP clinical work income ($11k/month)

**Quarterly Grant Receipts:**
- Q1 claim (Month 3) → Grant received Month 4: $16,973
- Q2 claim (Month 6) → Grant received Month 7: $16,858
- Q3 claim (Month 9) → Grant received Month 10: $18,298
- Q4 claim (Month 12) → Grant received Month 13: $17,898

---

## Success Criteria

### Utility Targets
- Inbox triage time savings: ≥30% reduction (saves 1-2 hours/day per GP)
- Care gap monitoring completion: ≥80%
- PHO quality indicator improvement: ≥10%
- Clinician usefulness rating: ≥80% for both use cases

### Safety Targets
- Prohibited-claim rate: ≤0.5%
- Refusal appropriateness: ≥95%
- PHI leakage: Zero

**Hard stop:** If any safety metric fails, halt all releases until fixed.

### Performance Targets
- Response time (P95): ≤5.0s
- Throughput stability: No crashes under load
- Unit economics: Stable cost per 1,000 requests

### R&D Success Threshold
**We DO NOT need to match GPT-4/5 100%.** Success = achieving **70-80% of GPT-4/5 quality at 20-50x lower cost**.

---

## Key Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **PHI Leakage (Cross-Border)** | Low | Critical | No persistent PHI outside NZ; NZ-held keys; SIEM monitoring |
| **Unsafe Model Outputs** | Medium | Critical | Assist-only policy engine; monthly safety regressions (hard stop if >0.5%) |
| **Small Model Quality Insufficient** | Medium | High | Systematic experimentation; baseline GPT-4/5 comparison; iterative tuning |
| **Cashflow Shortfall** | Low | High | Income from GP clinical work funds co-contribution; cash always positive |
| **Over-Reliance by Clinicians** | Medium | High | Clear labeling; no auto-insert; training materials; periodic UI reminders |
| **Scope Creep / Misconfiguration** | Medium | Medium | Least-privilege Medtech scopes; change control gates |
| **Vendor/Sub-Processor Breach** | Low | Critical | Due diligence; DPA with breach notification; NZ-held key revocation |
| **Model Drift / Safety Degradation** | Medium | High | Version pinning; pre-release safety gates; monthly regressions |

---

## Current Status [2025-11-06]

**Overall Score:** 6.9/10 (Mentor Review Ready)

### Strengths
- ✓ Strong technical R&D justification
- ✓ Detailed project planning (12-month roadmap, 5 objectives, clear milestones)
- ✓ Comprehensive risk analysis (8 risks with mitigations)
- ✓ Clear success criteria and measurable targets
- ✓ Strong founder profile (GP + technical + commercial expertise)

### Critical Gaps (Must Fix Before Submission)
1. **Market Validation (4/10)** - Missing:
   - No letters of interest from GPs
   - No Medtech partnership letter/MOU
   - No proof ClinicPro is operational (revenue, user count)
   - Weak competitor analysis

2. **Commercialization Strategy (5/10)** - Missing:
   - No pricing model
   - No revenue projections (Year 2-3)
   - No adoption timeline
   - No go-to-market plan
   - No exit strategy

3. **Why Grant Funding is Essential** - Not explicit enough

4. **Community & Broader Impact** - Limited discussion of patient outcomes, health equity, NZ tech ecosystem

### Priority Actions
**Critical (Must Have):**
- [x] Get Medtech partnership letter/MOU (emailed Alex; response received - expects delivery ~20 Nov)
- [ ] **Get Comprehensive Care PHO letter of support** (email scheduled for Monday 11 Nov)
- [x] Create ClinicPro operational evidence document
- [ ] Complete ClinicPro evidence document (add screenshots, fill metrics)
- [ ] Get 2-3 letters of interest from GPs (optional - see assessment)
- [x] Create Section: "Commercialization & Market Strategy"
- [ ] Add paragraph: "Why Grant Funding is Essential"
- [x] Establish submission timeline (mid-December 2025 target set)

**Important (Strengthens Proposal):**
- [ ] Expand Section 9: Long-Term Vision (Year 2-5)
- [ ] Add: Community & Broader Impact
- [ ] Create Competitor Analysis Table

---

## Key Documents

### Main Proposal
- **`MENTOR-PROPOSAL.md`** - Complete 10-section proposal (25-30 pages) ready for mentor review

### Supporting Documents
- **`forge-application-narrative.md`** - Forge portal submission text
- **`cost-template.md`** - Financial breakdown by objective
- **`cashflow-12-month.md`** - 12-month forecast
- **`dpia-draft.md`** - Data Protection Impact Assessment
- **`privacy-compliance-quick-reference.md`** - IPP 12, HISO, DPA clauses
- **`safety-and-transparency-framework.md`** - Safety procedures
- **`claims-toolkit.md`** - Quarterly claim templates
- **`capability-development-evidence-pack.md`** - CapDev plan
- **`project-master-index.md`** - Navigation hub
- **`risk-and-change-management.md`** - Risk register, stage-gates
- **`clinicpro-operational-evidence.md`** - Market validation evidence (ClinicPro operational proof)

---

## Why This Project Will Succeed

### Unique Founder Profile
- **Clinical Expertise:** Practicing GP who experiences the problem firsthand
- **Technical Expertise:** Full-stack developer with AI/ML expertise; built ClinicPro (operational product)
- **Market Access:** Medtech partnership = real-world testing + 3,000+ GP scale potential

### Commercial Validation
- ClinicPro is already operational (AI scribe using third-party LLM)
- Proven demand for AI assistance in NZ general practice
- This R&D makes it better, cheaper, safer, and expands capabilities

### De-Risking Strategy
1. **Synthetic-First Development** (Months 1-3) - No real patients
2. **Medtech Sandbox Testing** (Months 4-9) - Fake patient data only
3. **Monthly Safety Gates** - Hard stop if metrics fail
4. **Staged Pilot** (Month 10+) - Only after all gates passed

### Clear Constraints
- ✓ No diagnostic or treatment advice (assist-only)
- ✓ No training on production PHI (synthetic/de-identified only)
- ✓ No persistent PHI outside NZ (ephemeral AU inference only)
- ✓ No third-party commercial LLM APIs (self-hosted, NZ-controlled)
- ✓ No pilot until safety gates passed

---

## Updates

### [2025-11-23] Paula Mentor Meeting Feedback - Major Revision Required

**Meeting with Paula:** Proposal received positive feedback ("really good, good chance of getting approved") but requires improvements:

**Paula's Key Feedback:**
1. **Long-term R&D vision (2 years):** Grant can be up to 2 years. Need to show both immediate goals AND long-term R&D goals. Callaghan is looking for long-term R&D performers.
2. **Company growth intention:** Need to mention intention to hire more people down the track (demonstrates growth mindset and commitment).
3. **Competitor mention:** Briefly mention competitors (reviewers want to know) - not in detail, just acknowledge landscape.
4. **Objectives:** Max 4 objectives (currently have 5). Need to consolidate and span over 2 years.
5. **Conference specificity:** Can't be generic conference attendance. Must be specific workshops/sessions directly linked to R&D activities.
6. **Maximise grant request:** Request as much as possible at beginning - can't change this later. Use full opening cash capacity (~$200k).

**Decisions Made:**
1. **Expand AI features:** Not limiting to just inbox management and care gap monitoring. Will build broader AI capabilities over 2-year R&D programme.
2. **Reduce to 4 objectives** spanning 24 months (not 5 objectives over 12 months).
3. **Increase total eligible costs** to maximise grant (have $200k NZD opening cash capacity).
4. **Position as long-term R&D performer:** Show this is the start of sustained R&D capability, not a one-off project.
5. **Include hiring plan:** Developer hiring timeline to demonstrate growth intention.

**Next Steps:**
- [x] Document Paula's feedback in PROJECT_SUMMARY.md
- [ ] Brainstorm full AI feature set for 2-year R&D programme
- [ ] Restructure to 4 objectives over 24 months
- [ ] Calculate new budget targeting ~$200k total eligible costs
- [ ] Add competitor landscape section (brief)
- [ ] Identify specific conference workshops (not generic attendance)
- [ ] Add long-term R&D vision (Year 3-5)
- [ ] Include hiring plan and growth intentions

### [2025-11-07] Partnership Development & Submission Timeline
- **Medtech Partnership Letter Update:** Alex Cauble-Chantrenne responded positively - will draft letter and get approval, expects to deliver "next week" (~20 Nov 2025)
- **Comprehensive Care PHO Approach:** Email scheduled for Monday 11 Nov to request letter of support from Comprehensive Care (PHO with 42+ practices, 400+ GPs, 200,000+ patients)
- **Submission Timeline Established:** Target submission mid-December 2025 (allows 6-8 weeks for Callaghan review before 27 Jan 2026 project start)
- **Supporting Documents Created:**
  - `medtech-partnership-letter-guidance.md` - Guidance for Alex including request to mention GP demand for AI inbox management
  - `comprehensive-care-pho-approach.md` - Strategy and draft email for PHO partnership
  - `submission-timeline.md` - Detailed week-by-week timeline to mid-December submission
- **Status:** Partnership development in progress; preparing for mentor/Callaghan meetings next week

### [2025-11-06] Meeting Schedule & Mentor Engagement
- **Mentor Proposal Sent:** Emailed `MENTOR-PROPOSAL.md` to mentor for review
- **Mentor Meeting Scheduled:** 12 November 2025, 8:30am - Discussion about grant application
- **Callaghan Innovation Meeting Scheduled:** 13 November 2025, 2:00pm - Meeting with Paul from Callaghan Innovation
- **Medtech Partnership Letter:** Emailed Medtech requesting partnership letter for grant application
- **ClinicPro Evidence Document:** Created `clinicpro-operational-evidence.md` with image placeholders for screenshots
- **Status:** Active engagement phase - seeking feedback and guidance from mentor and Callaghan Innovation

### [2025-11-01] Major Restructuring
- Focused on 2 high-impact use cases (inbox management, care gap monitoring) for deeper quality vs 4 features
- Updated cost comparison: "20-50x cheaper" (accurate Azure calculation)
- Updated Azure costs: $140-170k/month for 5,000 GPs
- Fixed HealthPathways: 10 regional Community HealthPathways sites
- Updated all "GPT-4" references to "GPT-4/5"
- Applied NZ spelling throughout
- Updated labour plan: ~20 hrs/week throughout
- Changed co-funding source: "GP clinical work income"

### [2025-11-06] PROJECT_SUMMARY.md Created
- Comprehensive project overview created based on full directory review
- Documented all 5 R&D objectives, 3 CapDev streams, financials, risks, status
- Identified critical gaps for final submission

---

## Next Steps

1. **Address Critical Gaps:**
   - Obtain GP letters of interest
   - Secure Medtech partnership letter/MOU
   - Create commercialization strategy section
   - Add grant funding justification paragraph

2. **Strengthen Proposal:**
   - Expand long-term vision
   - Add community impact section
   - Create competitor analysis table

3. **Prepare Financial Evidence:**
   - Bank statement (current balance, 3-month history)
   - YTD Balance Sheet and P&L (NexWave Solutions Ltd)

4. **Final Review:**
   - Proofread for NZ spelling
   - Verify all sections align
   - Prepare Forge portal submission

---

**Last Updated:** 2025-11-07  
**Version:** 1.2  
**Status:** Validation - Partnership development in progress; submission target mid-December 2025
