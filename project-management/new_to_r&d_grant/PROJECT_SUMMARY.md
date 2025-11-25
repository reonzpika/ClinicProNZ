---
project_name: NZ-Sovereign Clinical LLM for GP Workflow (ClinicPro)
project_stage: Validation
owner: NexWave Solutions Ltd
last_updated: "2025-11-25"
version: "2.0"
tags:
  - r&d-grant
  - healthcare-ai
  - nz-sovereign
  - clinical-llm
  - callaghan-innovation
  - gp-workflow
summary: R&D grant proposal for building a NZ-sovereign clinical LLM to assist NZ GPs with inbox management and care gap monitoring. 24-month project seeking $272,698 grant (40%) with $409,046 co-funding. Team: Founder (3,120 hrs, 30hrs/week) + Ting R&D Operations Lead (4,152 hrs, 40hrs/week) + Developer (903 hrs, 10hrs/week from Month 4). Includes IP protection, conference attendance, hardware.
links:
  - name: Revised Objectives (24 Months)
    path: 00-admin-and-governance/revised-objectives-24-months.md
  - name: Project Master Index
    path: 00-admin-and-governance/project-master-index.md
  - name: 24-Month Cashflow
    path: 02-financials/cashflow-24-month.md
  - name: Cost Template
    path: 02-financials/cost-template/cost-template.md
  - name: Archived Mentor Proposal (12-month version)
    path: 00-admin-and-governance/archive/MENTOR-PROPOSAL.md
stakeholders:
  - role: Applicant
    name: NexWave Solutions Ltd
  - role: Partner
    name: Medtech (NZ's largest PMS, ~60% market share)
  - role: Mentor
    name: Paula (meeting completed 23 Nov 2025)
  - role: Callaghan Innovation Contact
    name: Paul (meeting completed 13 Nov 2025)
milestones:
  - date: "2025-11-23"
    name: Mentor meeting with Paula (feedback received)
    status: completed
  - date: "2025-11-25"
    name: Updated to 24-month structure
    status: completed
  - date: "2025-12-15"
    name: Target submission date
    status: pending
  - date: "2026-01-27"
    name: Project start
    status: pending
  - date: "2028-01-26"
    name: Project end (24 months)
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
**Project Duration:** 27 Jan 2026 - 26 Jan 2028 (24 months)  
**Total Eligible Costs:** $681,744 (NZD excl. GST)  
**Grant Request:** $272,698 (40%)  
**Co-Funding:** $409,046 (60% from GP clinical work income + shareholder funds)

**Status:** Updated to 24-month structure following Paula's feedback (25 Nov 2025)

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

## R&D Objectives (4 Objectives - 24 Months)

**Note:** Following Paula's feedback, objectives have been consolidated from 5 (12-month) to 4 (24-month) to demonstrate long-term R&D commitment.

**Provisional Structure:**

### O1: Foundation & Architecture Validation (Months 1-8)
- Literature review and architecture framework design
- Range testing across multiple architectural approaches
- Flexible foundation supporting simple→complex features
- Medtech integration foundation
- **Deliverables:** Foundation system v1.0, architecture recommendations

### O2: Admin Automation + Lightweight Architecture (Months 6-14)
- 4 admin automation tools (inbox, auto-filing, letters, referrals)
- Medtech widget v1.0 integration
- Sandbox validation
- **Targets:** Inbox ≥90%, auto-filing 100% safe, letters ≥85%

### O3: Clinical Intelligence + Hybrid Architecture (Months 12-20)
- Lab interpretation, care gap monitoring, screening tracking
- Medtech widget v2.0
- **Targets:** CVDRA ≥95%, care gaps ≥85%, screening ≥95%

### O4: Clinical Decision Support + Pilot (Months 18-24)
- Prescription validation, guidelines, patient communications
- Medtech widget v3.0 (complete system)
- Real-world pilot with 10-20 GPs
- Production-ready infrastructure
- **Targets:** Prescription errors ≥95%, pilot satisfaction ≥75%

**Detailed objectives:** See `00-admin-and-governance/revised-objectives-24-months.md`

---

## Team Structure (24 Months)

**Founder (You):**
- 30 hrs/week × 24 months = 3,120 hours @ $96/hr
- **Total:** $299,520

**Ting (R&D Operations Lead - Full-time):**
- 40 hrs/week × 24 months = 4,152 hours @ $70/hr
- Role: R&D Project Manager + Research/Testing/Documentation + Quality Assurance
- **Total:** $290,640

**Developer (Contractor):**
- 10 hrs/week × 21 months (starts Month 4) = 903 hours @ $72/hr
- **Total:** $65,016

**Total R&D Labour:** 8,175 hours = $655,176

---

## Capability Development (4 Streams + Conferences)

### CD-A: Regulatory & Compliance (Months 1-3)
- 3 privacy certificate courses (OPC Privacy Act, OPC HIPC, Ko Awatea)
- Complete DPIA (Option B: AU inference, NZ keys, IPP 12 safeguards)
- Create IPP 12 checklist, HISO mapping, DPA templates
- **Hours:** 12 | **Cost:** $1,152

### CD-B: R&D Information Management (Months 1-4)
- Set up MLflow (experiment tracking), DVC (dataset versioning)
- Build safety dashboard
- Draft transparency SOP and page v1
- **Hours:** 10 | **Cost:** $960

### CD-C: Project Management Set-up (Months 1-2)
- Define stage-gates (O1-O4 entry/exit criteria)
- Create risk register, change log, release checklist
- **Hours:** 8 | **Cost:** $768

### CD-D: Conference Attendance & Knowledge Acquisition (Years 1 & 2)
- Year 1: HealthTech Week Auckland (Month 5) + HIC Melbourne (Month 7)
- Year 2: HealthTech Week Auckland (Month 17) + HIC Melbourne (Month 19)
- **Hours:** 48 total (24 per year) | **Labour Cost:** $4,608

**Total CapDev Hours:** 78 | **Total CapDev Labour:** $7,488

**Note:** Conference travel costs ($6,400) and IP services ($6,000) are separate budget lines, NOT part of CapDev labour.

**CapDev Requirement:** Must be ≥5% of grant ($13,635). Current structure:
- Labour: $7,488
- Conferences (can count): $6,400
- **Total: $13,888 (5.1% of grant) ✓**

---

## Financial Summary (24 Months)

| Category | Amount (NZD excl. GST) |
|----------|------------------------|
| **R&D Labour - Founder** (3,120 hours @ $96/hr) | $299,520 |
| **R&D Labour - Ting** (4,152 hours @ $70/hr) | $290,640 |
| **R&D Labour - Developer** (903 hours @ $72/hr) | $65,016 |
| **Capability Development Labour** (78 hours @ $96/hr) | $7,488 |
| **Materials & Consumables** ($200/month × 24) | $4,800 |
| **Professional Services (IP)** | $6,000 |
| **Conference Travel** (2 years, 4 conferences) | $6,400 |
| **Hardware** (2-year depreciation + immediate) | $4,184 |
| **Total Eligible Costs** | **$684,048** |
| | |
| **Grant (40%)** | **$273,619** |
| **Co-Funding (60%)** | **$410,429** |

**Note:** Target grant request ~$272,698. Minor variations due to rounding.

---

### Cashflow & Funding Structure

**Opening Cash Capacity:** $200,000 total
- $100,000 NZD (business account)
- $100,000 AUD (Ting's shareholder funds, accessible via shareholder loan)

**Monthly Income:** $11,000/month GP clinical work

**Cashflow Position:**
- With NZ account only ($100k): Goes negative from Month 9
- With total capacity ($200k NZ+AU): Positive throughout
- Shareholder loan structure confirmed acceptable with Paula

**Grant Schedule (8 quarters over 24 months):**
- Year 1 (Q1-Q4): ~$136k
- Year 2 (Q5-Q8): ~$137k
- **Total: $272,698**

Grants paid 1 month after quarterly claim submission.

**See:** `02-financials/cashflow-24-month.md` for detailed monthly breakdown

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

## Current Status [2025-11-25]

**Status:** Updated to 24-month structure following Paula's feedback

### Recent Updates (Nov 25, 2025)
- ✅ Extended project from 12 to 24 months (Paula's recommendation)
- ✅ Consolidated from 5 to 4 objectives (Paula's feedback)
- ✅ Added Ting as full-time R&D Operations Lead (40 hrs/week @ $70/hr)
- ✅ Increased founder hours (25→30 hrs/week)
- ✅ Updated budget: $681,744 total eligible costs, $272,698 grant request
- ✅ Confirmed shareholder funds structure ($200k total capacity)
- ✅ Updated all financial documents (cashflow, cost template)

### Strengths
- ✓ Strong technical R&D justification
- ✓ Extended to 24 months showing long-term R&D commitment (Paula's key feedback)
- ✓ Comprehensive risk analysis (8 risks with mitigations)
- ✓ Clear success criteria and measurable targets
- ✓ Strong founder profile (GP + technical + commercial expertise)
- ✓ Added dedicated R&D Project Manager (Ting) demonstrating growth intention

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
