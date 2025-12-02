---
project_name: ClinicPro AI - Inbox Helper + Care Gap Finder (NZ-Sovereign Clinical LLM)
project_stage: Validation
owner: NexWave Solutions Ltd
last_updated: "2025-11-28"
version: "3.0"
tags:
  - r&d-grant
  - healthcare-ai
  - nz-sovereign
  - clinical-llm
  - callaghan-innovation
  - gp-workflow
summary: R&D grant proposal for building a NZ-sovereign clinical LLM to assist NZ GPs with inbox management (Inbox Helper) and care gap monitoring (Care Gap Finder), integrated across both Medtech and Indici PMSs. 24-month project with lean MVPs released to early adopters, plus Years 3-5 roadmap for HealthHub NZ patient-facing app. Team: Founder + Ting R&D Operations Lead + Developer. Includes architecture validation R&D, NZ-LLM training, equity-focused algorithms, and multi-PMS generalisation. Cashflow positive throughout.
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
  - role: Partner
    name: Indici (growing NZ PMS provider)
  - role: Mentor
    name: Paula (meeting completed 13 Nov 2025, emailed update 27 Nov 2025)
  - role: Callaghan Innovation Contact
    name: Paul (meeting completed 13 Nov 2025)
milestones:
  - date: "2025-11-13"
    name: Mentor meeting with Paula (feedback received)
    status: completed
  - date: "2025-11-25"
    name: Updated to 24-month structure
    status: completed
  - date: "2025-11-27"
    name: Emailed Paula with progress update on changes since meeting
    status: completed
  - date: "2025-11-28"
    name: Major objectives revision - focused on Inbox Helper + Care Gap Finder with dual PMS integration (Medtech + Indici) and HealthHub NZ roadmap
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
**Total Eligible Costs:** $695,976 (NZD excl. GST)  
**Grant Request:** $278,305 (40%)  
**Co-Funding:** $417,671 (60% from GP clinical work income)

**Status:** Final budget and team structure confirmed (26 Nov 2025). Cashflow positive throughout 24 months.

---

## Executive Summary

This project proposes building a New Zealand-sovereign clinical AI assistant to address critical workload and burnout issues facing NZ general practitioners. The system focuses on two core tools:

1. **Inbox Helper (Reactive)** - Triage, classify, and auto-file inbox items (labs, letters, referrals). Compare labs with previous results, flag urgent issues, generate patient messages. Saves 1-2 hours/day per GP.

2. **Care Gap Finder (Proactive)** - Scan patient records to identify overdue chronic disease checks (diabetes, CVD, COPD, CHF, asthma). Generate recall lists, prioritise high-risk and Māori/Pacific patients. Supports PHO quality indicators.

**Key Features:**
- ✓ **Dual PMS integration:** Works in both Medtech and Indici from day one
- ✓ **Lean MVP approach:** Early releases to paid adopters as safety thresholds are met
- ✓ **Architecture validation R&D:** Test which AI approach (simple classifiers, hybrid rules+LLM, NZ-trained LLM) works best for each risk level
- ✓ **Multi-PMS generalisation:** Research how to maintain performance across different PMSs, practices, and populations
- ✓ **Equity focus:** Algorithms designed to prioritise high-need groups without bias

**Long-Term Vision (Years 3-5):**
- **HealthHub NZ:** Extend validated NZ-LLM and safety frameworks to patient-facing web app
- **Advanced R&D:** Multimodal models, continual learning, te reo Māori support, real-world outcome trials
- **Broader ecosystem:** National FHIR API integration, plug-in architecture for more PMSs

**Core R&D Questions:**
- Which AI architecture works best for different clinical risk levels?
- Can NZ-trained LLM understand local clinical language better than generic models?
- How to design one system that works across multiple PMSs without major rework?
- How to tune alerts to avoid fatigue while maintaining safety?

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
- `cashflow-24-month.md` - Monthly cashflow forecast showing positive cash throughout ($100k opening → $39k closing)
- `cost-template/cost-template.md` - Detailed cost breakdown by category (Labour + CapDev + M&C + Hardware)

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

**Core Focus:** Build Inbox Helper and Care Gap Finder integrated across both Medtech and Indici PMSs, with lean MVPs released early and ongoing R&D through month 24.

### Objective 1: Build the Smart Foundation and Early Prototypes (Months 1-6)

**Plain-English Aim:** Create a flexible, safe AI backbone that can plug into Medtech and Indici, test different AI "recipes" on synthetic NZ healthcare data.

**Key R&D Questions:**
- Which AI approach works best for each task: simple classifier, generic LLM, hybrid rules+LLM, or NZ-trained LLM?
- Can a NZ-trained LLM understand local clinical language better than generic models?
- How to design one architecture supporting both Medtech and Indici without major rework?

**Deliverables:**
- Foundation system v1.0 deployed, connected to both Medtech and Indici sandboxes
- ≥90% triage accuracy, ≥95% CVDRA accuracy on synthetic test sets
- Architecture recommendations documented for Objectives 2 & 3
- Early sandbox prototypes for inbox and care gaps

---

### Objective 2: Inbox Helper – Admin Automation and Early Clinical Overlays (Months 4-12)

**Plain-English Aim:** Turn Inbox prototype into practical tool that reduces GP inbox workload safely in both Medtech and Indici. **Lean MVP released to early adopters as soon as safety thresholds met.**

**Key R&D Questions:**
- Can lightweight models safely handle messy, real NZ inbox data?
- What confidence level is safe enough for auto-filing normal results?
- How should AI suggestions appear in each PMS so GPs trust them?

**Features:**
- Triage and classify inbox items (labs, letters, referrals, admin, patient messages)
- Auto-file normal screening results with recalls
- Compare labs with previous results, flag trends
- Rule-based clinical overlays (non-prescribing)
- Patient communication message generation

**Deliverables:**
- Inbox Helper functional in both Medtech and Indici sandboxes
- ≥90% classification accuracy on ≥2,000 real inbox items
- Zero unsafe auto-filing in edge-case test suite
- ~30% time saving in simulated GP workflows
- Usability feedback from ≥5 GPs incorporated

---

### Objective 3: Care Gap Finder – Chronic Disease Intelligence (Months 7-16)

**Plain-English Aim:** Build tool that scans patient records to find overdue chronic disease checks (diabetes, CVD, COPD, CHF, asthma). **Lean MVP (diabetes + CVD) released early, then expanded.**

**Key R&D Questions:**
- Can NZ-trained AI reliably extract details from messy free-text notes?
- How to handle multiple conditions without overwhelming GPs with alerts?
- How to prioritise so Māori/Pacific patients aren't left behind?

**Features:**
- Data extraction and analysis for 5 chronic conditions
- Care gap detection with multi-condition logic
- Patient communication message generation
- GP/practice dashboards with equity filters
- Integration into both Medtech and Indici

**Deliverables:**
- Care Gap Finder operational in both PMSs
- ≥95% CVDRA accuracy
- ≥85% care gap detection vs GP audit
- Demonstrated ability to prioritise high-risk and Māori/Pacific patients appropriately

---

### Objective 4: Advanced Refinement, Safety, Equity and Generalisation (Months 16-24)

**Plain-English Aim:** Use real-world feedback to do "hard" R&D work: refine NZ-LLM, tune alerts, prove system generalises across practices and both PMSs. **This is systematic R&D on generalisation and safety, not routine maintenance.**

**Key R&D Questions:**
- How much does performance change across different practices, populations, workflows?
- How to tune alerts to minimise noise while catching all important issues?
- How to support equitable performance across regions and populations?

**Activities:**
- Analyse model errors from early adopters, retrain NZ-LLM
- Collect alert statistics, adjust thresholds to avoid fatigue
- Run structured pilots across multiple practices (both PMSs)
- Investigate performance gaps by region/population, fix via model/rule changes
- Expand safety testing to thousands of scenarios

**Deliverables:**
- Refined NZ-LLM with documented accuracy across multiple practices and both PMSs
- Alert configuration tuned based on real usage metrics
- Final pilot report: time savings, care gaps closed, equity metrics, safety incidents
- Clear roadmap for broader rollout (including Years 3-5 HealthHub NZ vision)

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
- Minimum 10 hrs/week × 21 months (starts Month 4) = 903 hours @ $72/hr
- Can scale 10-40 hrs/week based on R&D workload
- **Total (minimum):** $65,016

**Total R&D Labour (minimum):** 8,175 hours = $655,176

**Note:** Leaner 3-person team structure provides strong R&D capacity with flexibility to scale developer hours based on project needs.

---

## Capability Development (4 Categories - Third-Party Services Only)

**Confirmed by Paula (29 Nov 2025):** CapDev must be ≥5% of total eligible costs. Only third-party costs eligible (no internal labour).

### CDP-2: Intellectual Property ($7,500)
**Months 2-6**

- **IP Audit & Freedom-to-Operate Analysis:** $2,000
  - Prior art search, IP landscape, patentability assessment
  
- **Provisional Patent Filing:** $4,500
  - File with IPONZ covering clinical LLM architecture, workflows, integration methods
  - Secure priority date for 12-month full filing window
  
- **NDAs, Contracts & Trademark:** $1,000
  - Mutual NDA templates, collaboration agreements, trademark search/filing

**Deliverables:** FTO report, provisional patent (filed), NDA/contract templates, trademark protection

---

### CDP-3: Regulatory & Compliance ($15,000)
**Months 2-18**

- **Comprehensive Regulatory Gap Analysis:** $3,500
  - Privacy Act 2020, HIPC, IPP 12, clinical safety, AI ethics compliance audit
  
- **Comprehensive DPIA (Data Privacy Impact Assessment):** $4,000
  - Cross-border data handling risk assessment (AU inference, NZ keys)
  
- **Clinical Safety Advisory (3 sessions):** $3,500
  - Medical device software context, safety system validation
  - Months 4, 8, 12
  
- **Ongoing Regulatory Adviser (6 sessions):** $3,000
  - Expert guidance through MVP, sandbox, pilot, scale-up phases
  - Months 4, 6, 9, 12, 15, 18
  
- **Compliance Roadmap & Documentation:** $1,000
  - Governance framework, DPA templates, incident response

**Deliverables:** Gap analysis, DPIA, 3 clinical safety reports, 6 adviser session reports, governance framework, compliance templates

---

### CDP-6: R&D Information Management ($8,500)
**Months 2-6**

- **Experiment Tracking & Model Registry System Setup:** $3,500
  - Centralised experiment tracking, model versioning, dataset lineage
  - Research dashboard, training for founder + Ting
  
- **LLM Training & Fine-Tuning Technical Advisory:** $5,000
  - Training pipeline setup, evaluation framework (4-6 advisory sessions)
  - Knowledge transfer on NZ-LLM fine-tuning approaches

**Deliverables:** Configured experiment tracking system, model registry, LLM training pipeline, evaluation framework, advisory session reports

---

### CDP-5: Project Management ($5,000)
**Months 2-15**

**R&D Project Management Training & Coaching for Ting + System Setup**

**Phase 1 - Intensive Training & Setup (Months 2-4): ~$2,500**
- **Training sessions specifically for Ting:**
  - How to plan and manage R&D projects (vs traditional business projects)
  - Creating realistic timelines when outcomes are uncertain
  - Budget tracking and resource allocation for R&D
  - How to identify and manage R&D risks
  - Documentation best practices for knowledge capture
  - How to manage third-party service providers and consultants
  - Communication management with stakeholders

- **Systems setup (with Ting leading):**
  - Agile R&D workflow system (Kanban boards)
  - Roadmap templates for 24-month project
  - Budget tracking spreadsheets
  - Risk register templates
  - Vendor/contractor management workflows
  - Meeting templates and decision logs

- **Ting's capability development:**
  - Learn how to break down R&D objectives into manageable tasks
  - Create timelines with contingency planning
  - Identify when to bring in third-party expertise
  - Manage CapDev procurement process itself (finding vendors, scoping work, managing contracts)

**Phase 2 - Ongoing Coaching (Months 5-15): ~$2,500**
- **6 monthly coaching sessions with Ting** ($400-500 each)
- Month 5: Review of initial systems, troubleshoot issues
- Month 7: Managing Objective 2 (Inbox Helper) timeline and resources
- Month 9: Mid-project review, adjust plans based on learnings
- Month 11: Managing transition to Objective 3 (Care Gap Finder)
- Month 13: Pilot preparation and risk management
- Month 15: Final phase planning and knowledge capture

**Why this is smart:**
- Builds long-term capability - Ting learns how to manage R&D (not just admin work)
- Ting manages the CapDev procurement for other CDP services (regulatory, IP, R&D info systems)
- This is meta-capability development - using CapDev budget to train Ting on how to manage CapDev activities
- Demonstrates "growth intention" (Paula's feedback about having Ting full-time)
- After 24 months, Ting will have skills to manage future R&D projects

**Deliverables:** R&D project management training materials, configured PM system with Kanban boards and roadmap framework, 6 coaching session reports, Ting-maintained 24-month roadmap, budget tracking spreadsheet, risk register, vendor management records for all CDP procurement, meeting notes and decision logs, monthly progress reports

---

### Free Training (Supplementary, Not Counted in CapDev Budget)
- **Privacy:** OPC Privacy Act 2020, OPC Health 101 HIPC
- **AI in Healthcare:** Collaborative Aotearoa AI in Primary Care modules
- **IP Knowledge:** IPONZ patent basics and resources

**Total CapDev:** $36,000 (third-party professional services only)

**CapDev Requirement Check:**
- Required: ≥5% of total eligible costs = $35,846 (for $716,926 total)
- Actual: $36,000
- **Percentage: 5.02% ✓** (meets requirement)

---

## Financial Summary (24 Months)

| Category | Amount (NZD excl. GST) |
|----------|------------------------|
| **R&D Labour - Founder** (3,120 hours @ $96/hr) | $299,520 |
| **R&D Labour - Ting** (4,152 hours @ $70/hr) | $290,640 |
| **R&D Labour - Developer** (903 hours @ $72/hr, minimum) | $65,016 |
| **Capability Development** (third-party services only) | $36,000 |
| **Materials & Consumables** (includes hardware) | $25,750 |
| **Total R&D Eligible Costs** | **$716,926** |
| | |
| **Grant (40%)** | **$286,770** |
| **Co-Funding (60%)** | **$430,156** |

---

### Business Income (24 Months)

| Item | Amount (NZD excl. GST) |
|------|------------------------|
| GP clinical revenue (24 months) | $266,800 |
| **Monthly GP income** | **$11,117** |

**GP Work Schedule:**
- 20 hrs/week @ $145/hour (excl. GST)
- 46 working weeks per year (6 weeks annual leave)
- Total work commitment: 50 hrs/week (20 hrs GP + 30 hrs R&D)

---

### Cashflow & Funding Structure

**Shareholder Funds (Two-Account Structure):**
- **Business account opening cash:** $100,000 NZD
- **Ting's reserve account:** $100,000 NZD (separate account, drawn strategically)
- **Total shareholder contributions:** $200,000 NZD
- **Source:** Founder + Ting shareholder funds

**Co-Funding Requirement:** $430,156 (60% of total R&D costs)

**Co-Funding Sources:**
| Source | Amount | Notes |
|--------|--------|-------|
| Business opening cash | $100,000 | Available Day 1 |
| Ting's reserve | $100,000 | Drawn in 4 installments (Months 9, 12, 15, 18) |
| GP clinical income | $266,800 | $11,117/month over 24 months |
| **Total available** | **$466,800** | **Surplus: $36,644** ✓ |

**Strategic Drawdown Schedule from Ting's Reserve:**
| Month | Amount | Purpose | Timing Logic |
|-------|--------|---------|--------------|
| Month 9 | $30,000 | Cover gap before Q3 grant (Month 10) | Draws before cashflow drops below $15k |
| Month 12 | $30,000 | Cover gap before Q4 grant (Month 13) | Heavy CapDev spending this quarter |
| Month 15 | $25,000 | Cover gap before Q5 grant (Month 16) | Mid-Year 2 buffer |
| Month 18 | $15,000 | Cover gap before Q6 grant (Month 19) | Final drawdown |
| **Total** | **$100,000** | All reserve utilized by Month 18 | Months 19-24 run on GP + grants only |

**Why This Structure Works:**
- **Two separate accounts** demonstrate financial planning and discipline
- **Strategic timing:** Draws coordinate with grant payment lag (claim Month X, receive Month X+1)
- **Gradual deployment:** Not all cash upfront, shows financial management capability
- **Risk mitigation:** If grant delayed, Ting's reserve provides buffer
- **Efficient capital use:** All $200k shareholder funds fully deployed by Month 18

**Monthly GP Income:** 
- Revenue: $11,117/month (from 20 hrs/week @ $145/hr excl. GST)
- Work schedule: 46 weeks/year (6 weeks annual leave)
- Total work commitment: 50 hrs/week (20 hrs GP + 30 hrs R&D) - sustainable

**Cashflow Position:** 
- Managed throughout 24 months with strategic reserve draws
- **Lowest point:** $1,968 (Month 24, just before final grant arrives)
- **Final balance:** $36,391 ✓
- Never goes negative due to strategic drawdown timing

**Total Income Over 24 Months:**
| Source | Amount |
|--------|--------|
| Business opening cash | $100,000 |
| Ting's reserve (drawn) | $100,000 |
| GP income | $266,800 |
| R&D grants (8 quarters) | $286,609 |
| **Total inflows** | **$753,409** |

**Total R&D Costs:** $716,926

**Final Surplus:** $36,483 ✓

**Grant Payment Schedule (8 quarters over 24 months):**
| Period | Quarters | Total Grants |
|--------|----------|--------------|
| Year 1 | Q1-Q4 | ~$148,117 |
| Year 2 | Q5-Q8 | ~$138,492 |
| **Total** | **Q1-Q8** | **$286,609** |

**Note:** Grants paid 1 month after quarterly claim submission. This 1-month lag is why strategic draws from Ting's reserve are needed.

**Detailed Documentation:** `02-financials/cashflow-24-month.md` contains full monthly breakdown with all 24 positions calculated

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

## Current Status [2025-11-28]

**Status:** Major objectives revision completed. Focused scope on Inbox Helper + Care Gap Finder with dual PMS integration (Medtech + Indici) and clear Years 3-5 roadmap for HealthHub NZ.

### Recent Updates (Nov 28, 2025)
- ✅ **MAJOR REVISION:** Objectives completely refocused on 2 core tools (Inbox Helper + Care Gap Finder) instead of 50+ tools
- ✅ **Dual PMS integration:** Both Medtech AND Indici supported from Objective 1 onwards
- ✅ **Lean MVP approach:** Early releases to paid adopters with ongoing R&D through month 24
- ✅ **HealthHub NZ roadmap:** Clear Years 3-5 vision for patient-facing app reusing validated NZ-LLM and safety frameworks
- ✅ **Advanced R&D streams:** Multimodal models, continual learning, te reo support, equity-focused algorithms, outcome trials
- ✅ **Objective 4 clarified:** Explicit R&D on generalisation and safety, not routine maintenance
- ✅ **Removed high-risk features:** No prescription validation or high-complexity clinical decision support in 24-month scope

### Financial Structure Updates (Dec 1, 2025)
- ✅ **Two-account structure finalized:** $100k business account + $100k Ting's reserve
- ✅ **Strategic drawdown plan:** Ting's $100k drawn in 4 installments (Months 9, 12, 15, 18)
- ✅ **GP work hours optimized:** Reduced to 20 hrs/week (from 30 hrs/week) for believable R&D commitment
- ✅ **GP revenue:** $266,800 over 24 months ($11,117/month from 20 hrs/week @ $145/hr)
- ✅ **Total work commitment:** 50 hrs/week (20 GP + 30 R&D) - sustainable workload
- ✅ **Cashflow managed:** Strategic draws coordinate with grant payment lag, lowest point $1,968 (Month 24)
- ✅ **Final surplus:** $36,391 after all costs ✓
- ✅ **Co-funding capacity:** $466,800 available vs $430,156 required (surplus $36,644) ✓

### Previous Updates (Nov 29, 2025)
- ✅ **Final team structure:** 3 people (Founder + Ting + Developer) - leaner, more focused
- ✅ **CapDev expanded:** $36,000 total (IP $7.5k + Regulatory $15k + R&D Info Mgmt $8.5k + PM $5k)
- ✅ **Hardware strategy finalized:** $1,750 immediate expenses, cloud GPU only (no workstation)
- ✅ **M&C consolidated:** $25,750 total (includes hardware) - detailed cloud infrastructure costs
- ✅ **Final budget:** $716,926 total eligible costs, $286,770 grant request
- ✅ **CapDev:** 5.02% of total costs (meets requirement per Paula's confirmation) ✓

### Previous Updates (Nov 13-27, 2025)
- ✅ **Paula meeting 13 Nov:** Received key feedback (extend to 24 months, reduce to 4 objectives, show long-term vision, add competitor analysis)
- ✅ Extended project from 12 to 24 months (Paula's recommendation)
- ✅ Consolidated from 5 to 4 objectives (Paula's feedback)
- ✅ Added Ting as full-time R&D Operations Lead (40 hrs/week @ $70/hr)
- ✅ Increased founder hours (25→30 hrs/week)
- ✅ Confirmed shareholder funds structure ($200k total capacity)
- ✅ **Emailed Paula 27 Nov:** Sent progress update on all changes implemented since meeting

### Strengths
- ✓ Strong technical R&D justification
- ✓ Extended to 24 months showing long-term R&D commitment (Paula's key feedback)
- ✓ **Strategic cashflow management:** Two-account structure with planned drawdowns, lowest point $1,968, final surplus $36,391 ✓
- ✓ **Strong co-funding capacity:** $466,800 available ($200k shareholder + $266.8k GP) vs $430,156 required ✓
- ✓ **Sustainable workload:** 50 hrs/week total (20 GP + 30 R&D) - believable and achievable
- ✓ **Lean team structure:** 3 people (Founder + Ting + Developer) with flexible developer hours
- ✓ **CapDev compliance:** 5.02% meets requirement, all third-party services, 4 categories ✓
- ✓ **Financial discipline:** Demonstrates strategic planning via timed drawdowns from reserve
- ✓ Comprehensive risk analysis (8 risks with mitigations)
- ✓ Clear success criteria and measurable targets
- ✓ Strong founder profile (GP + technical + commercial expertise)
- ✓ Dedicated R&D Project Manager (Ting) demonstrating growth intention

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
- **`cashflow-24-month.md`** - 24-month forecast with positive cashflow
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

### [2025-11-26] Final Budget and Team Structure Confirmed

**Major Update:** Finalized all financial documents with leaner team structure and positive cashflow.

**Key Changes:**
1. **Team Structure:** Reduced from 4 to 3 people (removed Developer 2)
   - Founder: 30 hrs/week (3,120 hrs @ $96/hr = $299,520)
   - Ting: 40 hrs/week (4,152 hrs @ $70/hr = $290,640)
   - Developer: 10-40 hrs/week flexible (903 hrs minimum @ $72/hr = $65,016)
   - More focused, cost-effective team

2. **Capability Development:** Restructured per Paula's feedback
   - $15,000 third-party professional services only (no internal labour)
   - IP: $7,500 (FTO analysis, provisional patent, NDAs/contracts)
   - Regulatory: $7,500 (gap analysis, ongoing adviser 6 sessions, compliance docs)
   - 5.39% of grant ✓ (exceeds 5% requirement)

3. **Hardware Strategy:** Cloud-first approach
   - $1,800 immediate expenses only (RAM, monitor, arms, iPhone)
   - GPU workstation ($11k) deferred - using cloud GPU infrastructure
   - Better grant coverage: 40% for cloud vs 26.7% for depreciation
   - M&C: $1,000/month ($24k total) - detailed cloud costs

4. **Financial Position:**
   - Total eligible costs: $695,976
   - Grant (40%): $278,305
   - Co-funding (60%): $417,671
   - GP revenue: $375,652 over 24 months ($15,652/month average)
   - **Cashflow positive throughout** ✓
   - Opening: $100k → Closing: $39k surplus
   - **AU reserve not needed** ✓

**Documents Updated:**
- Cost template finalized ($695,976 total)
- Cashflow 24-month finalized (positive throughout)
- PROJECT_SUMMARY.md updated with final numbers
- Deleted 12-month cashflow (obsolete)

**Status:** Budget and team structure ready for submission. Focus now on partnership letters and market validation.

---

### [2025-11-27] Progress Update Sent to Paula

**Email Update:** Sent comprehensive update to Paula summarizing all changes implemented since 13 Nov meeting:
- Extended to 24 months with 4 objectives
- Final budget: $695,976 ($278,305 grant, $417,586 co-funding)
- Team: Founder + Ting + Developer (3 people, leaner structure)
- CapDev: $15,000 third-party services (5.39% of grant ✓)
- Cashflow: Positive throughout, AU reserve not needed ✓
- Still working on: Final objectives narrative, Year 3-5 vision, competitor analysis

---

### [2025-11-13] Paula Mentor Meeting Feedback - Major Revision Required

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

**Last Updated:** 2025-12-01  
**Version:** 3.2  
**Status:** Validation - Financial structure finalized with two-account strategy; ready for submission mid-December 2025

**Version 3.2 Changes (1 Dec 2025):**
- **Financial structure optimized:** Two-account structure ($100k business + $100k Ting's reserve)
- **GP work reduced:** 20 hrs/week (was 30 hrs/week) for believable 30 hrs/week R&D commitment
- **GP income adjusted:** $266,800 over 24 months ($11,117/month) from 20 hrs/week @ $145/hr
- **Strategic drawdown plan:** Ting's $100k drawn in 4 installments (Months 9, 12, 15, 18) to manage grant payment lag
- **Total work commitment:** 50 hrs/week (20 GP + 30 R&D) - sustainable and believable
- **Co-funding capacity:** $466,800 available vs $430,156 required (surplus $36,644)
- **Cashflow managed strategically:** Lowest point $1,968 (Month 24), final surplus $36,391
- **All financial documents updated:** cashflow-24-month.md, cost-template.md, forge-application-narrative.md, PROJECT_SUMMARY.md now consistent

**Version 3.1 Changes (29 Nov 2025):**
- Updated CapDev from $15k to $36k (5.02% of total eligible costs)
- Added 4 CapDev categories: IP ($7.5k), Regulatory ($15k), R&D Info Management ($8.5k), Project Management ($5k)
- Updated total eligible costs to $716,926
- Updated grant to $286,770 and co-funding to $430,156
- Confirmed 5% rule applies to total costs, not grant amount (per Paula)
