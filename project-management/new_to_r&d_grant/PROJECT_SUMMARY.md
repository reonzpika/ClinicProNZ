---
project_name: ClinicPro AI - Inbox Helper + Care Gap Finder (NZ-Sovereign Clinical LLM)
project_stage: Validation
owner: NexWave Solutions Ltd
last_updated: "2025-12-02"
version: "4.1"
tags:
  - r&d-grant
  - healthcare-ai
  - nz-sovereign
  - clinical-llm
  - callaghan-innovation
  - gp-workflow
summary: R&D grant proposal for building a NZ-sovereign clinical LLM to assist NZ GPs with inbox management (Inbox Helper) and care gap monitoring (Care Gap Finder), integrated across both Medtech and Indici PMSs. 24-month project with lean MVPs released to early adopters, plus Years 3-5 roadmap for HealthHub NZ patient-facing app. Team: Founder + Ting R&D Operations Lead + Developer. Includes architecture validation R&D, NZ-LLM training, equity-focused algorithms, and multi-PMS generalisation. Co-funding from $200k shareholder funds (two-account structure) plus GP income. Cashflow strategically managed with planned drawdowns.
links:
  - name: Changelog (All Updates)
    path: CHANGELOG.md
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
  - date: "2025-11-29"
    name: CapDev expanded to $36k (4 categories) - 5.02% of total costs
    status: completed
  - date: "2025-12-01"
    name: Financial structure finalized - two-account strategy ($100k business + $100k Ting's reserve), 20 hrs/week GP work, strategic drawdown plan
    status: completed
  - date: "2025-12-02"
    name: R&D Activities section complete - all 6 questions (Activities, Uncertainty, Challenge, Knowledge, Newness, Why Better) revised with research emphasis, architectural flexibility, competitor analysis
    status: completed
  - date: "2025-12-02"
    name: Objectives document complete rewrite (v4.0) - transformed from product-focused to research-focused, aligned with R&D Activities, removed GPT-4 benchmarking, added architectural flexibility
    status: completed
  - date: "2025-12-02"
    name: Objective 3 aggressive trim (v4.1) - 52% reduction (2,060 → 1,055 words), R&D Q3 strengthened from "alert overload" to "reasoning complexity"
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
**Total Eligible Costs:** $716,926 (NZD excl. GST)  
**Grant Request:** $286,770 (40%)  
**Co-Funding:** $430,156 (60% from shareholder funds + GP clinical work income)

**Status:** Financial structure finalized (1 Dec 2025). Two-account strategy with strategic drawdowns. Cashflow managed throughout 24 months.

---

## Executive Summary

This project proposes building a New Zealand-sovereign clinical AI assistant to address critical workload and burnout issues facing NZ general practitioners. The system focuses on two core tools:

1. **Inbox Helper (Reactive)** - Triage, classify, and auto-file inbox items (labs, letters, referrals). Compare labs with previous results, flag urgent issues, generate patient messages. Saves 1-2 hours/day per GP.

2. **Care Gap Finder (Proactive)** - Scan patient records to identify overdue chronic disease checks (diabetes, CVD, COPD, CHF, asthma). Generate recall lists, prioritise high-risk and Māori/Pacific patients. Supports PHO quality indicators.

**Key Features:**
- ✓ **Dual PMS integration:** Works in both Medtech and Indici from day one
- ✓ **Lean MVP approach:** Early releases to paid adopters as safety thresholds are met
- ✓ **Architecture validation R&D:** Systematically investigate architectural paradigms (classifiers → hybrid → LLMs → agentic AI → RAG) to discover optimal approaches for each clinical task
- ✓ **Multi-PMS generalisation:** Research how to maintain performance across different PMSs, practices, and populations
- ✓ **Equity focus:** Algorithms designed to prioritise high-need groups without bias

**Long-Term Vision (Years 3-5):**
- **HealthHub NZ:** Extend validated NZ-LLM and safety frameworks to patient-facing web app
- **Advanced R&D:** Multimodal models, continual learning, te reo Māori support, real-world outcome trials
- **Broader ecosystem:** National FHIR API integration, plug-in architecture for more PMSs

**Core R&D Questions:**
- Which architectural paradigm (from simple classifiers to agentic AI systems) achieves clinical safety, NZ-contextual accuracy, and cost-effectiveness across combined constraints?
- Can domain adaptation techniques suffice for NZ clinical language characteristics, or do linguistic properties (Māori code-switching, bilingual terminology) require architectural modifications?
- Will architectural approaches achieving performance in one PMS (Medtech) maintain performance in another (Indici), or will generalisation patterns need to be discovered?
- How do safety mechanisms interact with different architectural paradigms, and what failure modes emerge?
- Which architectural characteristics translate to clinical value versus laboratory performance metrics?

---

## Project Structure

The project is organized into 7 main directories:

### Root Level
- `CHANGELOG.md` - Complete version history and all project updates (single source of truth for changes)
- `PROJECT_SUMMARY.md` - This document - comprehensive project overview

### 00-admin-and-governance/
- `revised-objectives-24-months.md` - Complete 4-objective structure spanning 24 months with detailed deliverables
- `risk-and-change-management.md` - Risk register, change log, stage-gates, release checklist
- `archive/` - Archived documents:
  - `MENTOR-PROPOSAL.md` - Original 12-month proposal sent to mentor (archived)
  - `proposal-status-and-next-steps.md` - Historical status assessment
  - `section-1-3-updates-summary.md` - Historical update summaries
  - `medtech-partnership-letter-guidance.md` - Partnership letter guidance
  - `comprehensive-care-pho-approach.md` - PHO partnership strategy
  - `submission-timeline.md` - Original timeline planning
  - `feature-grouping-decisions.md` - Historical feature decisions

### 01-application-narrative/
- `forge-application-narrative.md` - Complete Forge portal submission narrative with all required sections (co-funding evidence, team structure, objectives, CapDev, success metrics)

### 02-financials/
- `cashflow-24-month.md` - Monthly cashflow forecast with strategic drawdown plan (Two-account structure: $100k business opening + $100k Ting's reserve drawn in 4 installments at Months 9, 12, 15, 18. Final balance: $36,391)
- `cost-template/cost-template.md` - Detailed cost breakdown by category (Labour $655k + CapDev $36k + M&C $26k = $717k total)

### 03-capability-development/
- `capability-development-evidence-pack.md` - Complete CapDev plan with 4 categories: IP ($7.5k), Regulatory ($15k), R&D Info Management ($8.5k), Project Management ($5k). Total: $36k (5.02% of total costs)

### 04-compliance-and-safety/
- `dpia/dpia-draft.md` - Complete Data Protection Impact Assessment (AU inference with NZ-held keys strategy)
- `privacy-compliance-quick-reference.md` - IPP 12, HISO 10029, DPA clauses, consent notices
- `safety-and-transparency-framework.md` - Safety procedures, incident runbook, transparency requirements, monthly safety gates

### 05-claims-and-tracking/
- `templates/claims-toolkit.md` - Quarterly claim templates, timesheets, GST invoices, evidence checklists for 8 quarterly claims

### 06-market-validation/
- `clinicpro-operational-evidence.md` - Evidence document showing ClinicPro is operational with active GP users (market validation)

---

## R&D Objectives (4 Objectives - 24 Months)

**Core Focus:** Build Inbox Helper and Care Gap Finder integrated across both Medtech and Indici PMSs, with lean MVPs released early and ongoing R&D through month 24.

### Objective 1: Build the Smart Foundation and Early Prototypes (Months 1-6)

**Plain-English Aim:** Create a flexible, safe AI backbone that can plug into Medtech and Indici, test different AI "recipes" on synthetic NZ healthcare data.

**Key R&D Questions:**
- Which architectural paradigm works best for each task across the spectrum from simple pattern recognition to sophisticated reasoning systems?
- Can domain adaptation achieve clinical-grade accuracy on NZ clinical language under sovereignty constraints?
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
- Which architectural approach safely handles routine clinical tasks while maintaining accuracy and cost-effectiveness?
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
- Which paradigm achieves clinical calculation accuracy while maintaining equity without algorithmic bias?
- Can architectural paradigms perform multi-condition reasoning about competing care needs (matching GP clinical judgment ≥85%)?
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
- **Business account opening cash:** $130,000 NZD
- **Ting's reserve account:** $100,000 NZD (separate account, drawn strategically)
- **Total shareholder contributions:** $230,000 NZD
- **Source:** Founder + Ting shareholder funds

**Co-Funding Requirement:** $430,156 (60% of total R&D costs)

**Co-Funding Sources:**
| Source | Amount | Notes |
|--------|--------|-------|
| Business opening cash | $130,000 | Available Day 1 |
| Ting's reserve | $85,000 | Drawn in 3 installments (Months 12, 15, 18) |
| Emergency buffer | $15,000 | Retained in Ting's account |
| GP clinical income | $266,800 | $11,117/month over 24 months |
| **Total deployed** | **$481,800** | **Surplus: $51,644** ✓ |

**Strategic Drawdown Schedule from Ting's Reserve (Optimized):**
| Month | Amount | Purpose | Timing Logic |
|-------|--------|---------|--------------|
| Month 12 | $35,000 | Cover gap before Q4 grant (Month 13) | First draw delayed thanks to $130k opening |
| Month 15 | $30,000 | Cover gap before Q5 grant (Month 16) | Mid-Year 2 buffer |
| Month 18 | $20,000 | Cover gap before Q6 grant (Month 19) | Final drawdown |
| **Total** | **$85,000** | Drawn by Month 18 | **$15k emergency buffer retained** |
| **Retained** | **$15,000** | Emergency buffer in Ting's account | Available if grant delayed or unexpected costs |

**Why This Structure Works:**
- **Two separate accounts** demonstrate financial planning and discipline
- **Optimized timing:** First draw delayed to Month 12 (from Month 9) thanks to higher opening cash
- **Strategic draws:** Coordinate with grant payment lag (claim Month X, receive Month X+1)
- **Disciplined deployment:** Only draw $85k (not full $100k), retaining $15k emergency buffer
- **Risk mitigation:** $15k emergency buffer available if grant delayed or unexpected costs
- **Efficient capital use:** $215k deployed, $15k retained as prudent reserve

**Monthly GP Income:** 
- Revenue: $11,117/month (from 20 hrs/week @ $145/hr excl. GST)
- Work schedule: 46 weeks/year (6 weeks annual leave)
- Total work commitment: 50 hrs/week (20 hrs GP + 30 hrs R&D) - sustainable

**Cashflow Position:** 
- Managed throughout 24 months with strategic reserve draws
- **Lowest point:** $16,968 (Month 24, just before final grant arrives)
- **Final balance:** $51,391 ✓
- **Plus emergency buffer:** $15,000 (retained in Ting's account)
- **Total shareholder protection:** $66,391 ✓
- Never goes negative due to strategic drawdown timing

**Total Income Over 24 Months:**
| Source | Amount |
|--------|--------|
| Business opening cash | $130,000 |
| Ting's reserve (drawn) | $85,000 |
| GP income | $266,800 |
| R&D grants (8 quarters) | $286,609 |
| **Total inflows** | **$768,409** |

**Total R&D Costs:** $716,926

**Final Surplus:** $51,483 ✓
**Plus emergency buffer:** $15,000 (in Ting's account)

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
Success = achieving clinical-grade accuracy (≥90% for triage, ≥95% for clinical calculations) at sustainable cost (<$0.01/request at scale) under NZ sovereignty constraints.

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

## Additional Funding: R&D Tax Incentives

**Available Government Incentives (Additional to Grant):**

1. **R&D Tax Credit:** 15% tax credit on eligible R&D costs
   - Applies to total eligible costs ($716,926)
   - Potential additional benefit: ~$107,539
   
2. **Loss Tax Credit Cashout:** Option to cash out tax losses
   - Available if company is in loss position during R&D
   
**Application Deadline:** June 30, 2026 (first financial year)

**Action Required:** Apply for R&D tax incentives alongside grant to maximize total funding benefit.

---

## Lessons Learned: Third-Party Engagement

### Critical Question Framework

**Problem identified during accountant review (Dec 2025):** We asked general tax questions but missed the most critical question: **"How much more money am I actually making by utilizing the grant after all taxes and costs?"**

**Lesson:** When engaging third-party advisers (accountants, lawyers, consultants), **define critical questions FIRST** before seeking general advice.

**Framework for future adviser engagement:**

1. **Before contacting adviser, write down:**
   - The 1-3 critical questions you MUST have answered
   - Why each question matters to your decision-making
   - What you'll do differently based on the answer

2. **Lead with critical questions:**
   - State them upfront in email/meeting
   - Don't bury them in general context
   - Ask for specific, actionable answers

3. **Examples of critical vs general questions:**

| General (Low Value) | Critical (High Value) |
|---------------------|----------------------|
| "What's the tax treatment?" | "How much more money do I actually keep after all taxes if I take the grant vs not taking it?" |
| "Is this deductible?" | "What's my total tax liability across all entities for the next 3 years under this structure?" |
| "How does GST work?" | "Will this GST treatment create cashflow problems? When?" |

**Applied to Helen's review:**
- ❌ What we asked: General tax treatment questions (PAYE, GST, deductibility)
- ✅ What we should have asked: "Calculate my net personal income for 24 months: (A) With grant, (B) Without grant. What's the real financial benefit after all taxes?"

**Going forward:** Apply this framework to all adviser engagements (regulatory, IP, clinical safety, etc.)

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

4. **Additional Funding:**
   - Apply for R&D tax incentives (15% tax credit + loss cashout) by June 30, 2026

5. **Financial Impact Analysis:**
   - Emailed Helen (accountant) with critical question: "What's our household net cash position at end of 24 months: With grant vs Without grant?"
   - Awaiting response to determine if grant is financially worthwhile

6. **Final Review:**
   - Proofread for NZ spelling
   - Verify all sections align
   - Prepare Forge portal submission

---

**Last Updated:** 2025-12-02 (v4.0 - Objectives complete rewrite: research-focused, architecturally flexible, aligned with R&D Activities)
