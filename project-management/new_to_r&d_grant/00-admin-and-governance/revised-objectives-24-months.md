# Revised R&D Objectives (24 Months)

**Document Status:** Draft for review (23 Nov 2025)  
**Purpose:** Define 4 SMART objectives spanning 24-month R&D programme  
**Incorporating:** Paula's mentor meeting feedback (extend to 2 years, reduce to 4 objectives, maximize grant request)

---

## Programme Overview

**Project Duration:** 27 Jan 2026 - 26 Jan 2028 (24 months)  
**Total Eligible Costs:** TBD (targeting ~$200k to maximize grant request)  
**Grant Request (40%):** TBD  
**Co-Funding (60%):** From GP clinical work income

**Core R&D Question:**
> Can we build a NZ-sovereign, cost-effective ($5-10k/month), multi-task clinical AI system that achieves 70-80% of GPT-4 quality for 50+ NZ-specific GP workflow tools?

---

## Objective 1: Technical Feasibility & Architecture Establishment

**Timeline:** Months 1-8 (Jan 2026 - Aug 2026)

### **Core R&D Uncertainty**

> What is the optimal technical architecture to deliver 50+ AI clinical tools for NZ general practice under strict cost ($5-10k/month), privacy (NZ data sovereignty), and safety (assist-only healthcare) constraints?

**Why this is genuine R&D:**
- No published solution achieves all three simultaneously (cost-effective + NZ sovereign + multi-task clinical safety)
- Unknown: Can small, locally-hosted AI match GPT-4 quality for NZ-specific clinical tasks?
- Unknown: Will Hybrid MoE + Rules architecture achieve targets in practice?

---

### **Approach: Research-Based Architecture Selection & Validation**

#### **Phase 1: Deep Literature Review & Architecture Decision (Months 1-2)**

**Systematic evaluation of technical approaches:**

Review and compare **5 architecture approaches** based on 2024-2025 healthcare AI research:

1. **Single Small LLM** (7B-13B params)
2. **Hybrid (LLM + Rules)**
3. **Hybrid MoE + Rules** ⭐
4. **Agentic Workflows**
5. **RAG + Commercial LLM**

**Evaluation criteria:**
- Cost at scale (250k requests/day)
- Safety/reliability in healthcare
- Maintenance burden
- Development timeline
- Multi-task capability
- NZ customization feasibility
- Real-world healthcare examples
- Academic evidence (2023-2025 research)

**Preliminary Finding (based on research):**
- **Hybrid MoE + Rules** is leading candidate
- Recommended by: McKinsey (2025), BIT Research, healthcare AI architecture papers
- Proven: Mixtral 8x7B (MoE) approaching GPT-4 on domain tasks
- Benefits: Cost-efficient, scalable, safety (route critical tasks to rules), specialization

**Deliverables:**
- ✓ Literature review document (20-30 pages with citations)
- ✓ Architecture comparison matrix (5 approaches × 6 evaluation criteria)
- ✓ Architecture decision document (justified selection: why Hybrid MoE + Rules)
- ✓ Risk assessment (what if chosen approach fails? Fallback: Hybrid LLM + Rules)

**Fallback Strategy:**
If Hybrid MoE + Rules proves too complex or doesn't meet targets, pivot to **Hybrid LLM + Rules** (simpler, proven in NHS/Mayo Clinic).

---

#### **Phase 2: Proof-of-Concept Development (Months 3-5)**

**Build ONE comprehensive PoC (Hybrid MoE + Rules) tested across 3 representative use cases:**

**PoC Architecture:**
```
Data Layer: Medtech FHIR → Normalization → Input Schema
AI Layer: MoE (5 initial experts: Inbox, Lab, Care Gap, Rx, Comms)
Rules Layer: CVDRA calc, Dose calc, Screening eligibility, Pharmac rules
Safety Layer: Prohibited-claim classifier, Refusal scaffolds
Output Layer: Medtech widget (display results)
```

**Test Use Cases:**

1. **Inbox Triage & Classification**
   - 1,000 synthetic NZ inbox items (labs, letters, referrals, scripts, admin)
   - Regional variations (LabTests Auckland, SCL, Medlab formats)
   - Target: ≥90% classification accuracy, P95 latency <3.0s

2. **Lab Interpretation + CVDRA Calculation**
   - 500 synthetic lipid panels with patient context (age, sex, ethnicity, smoking, BP)
   - Auto-calculate CVDRA using NZ CVD Risk Calculator (rule-based)
   - LLM interprets clinical context, recommends statin per BPAC guidelines
   - Target: ≥95% CVDRA accuracy, ≥85% treatment recommendation accuracy

3. **Care Gap Detection**
   - 200 synthetic patient records (diabetes, CVD, CKD)
   - Identify overdue monitoring per NZ guidelines (BPAC, NZGG)
   - Handle temporal logic (HbA1c every 3 months IF poor control)
   - Target: ≥85% gap detection accuracy vs manual GP audit

**Concurrent Activities:**

**NZ Clinical Corpus Curation (Months 3-4):**
- Collect 10,000+ NZ clinical documents
- Sources: BPAC, NZGG, Pharmac formulary, ACC codes, regional lab report formats, DHB letter templates
- Version in DVC (data version control)

**Synthetic Dataset Generation (Months 3-5):**
- Generate 5,000+ synthetic examples:
  - Inbox items (40%): Labs, letters, referrals, scripts, admin
  - Patient records (30%): Chronic diseases, medications, monitoring history
  - Lab results (20%): Lipids, HbA1c, renal with regional format variations
  - Edge cases (10%): Ambiguous scenarios, safety-critical tests
- Clinical realism validated by GP review
- Version in DVC

**Medtech Integration Foundation (Months 3-5):**
- Medtech FHIR API connection (OAuth, read inbox/patient/observations)
- Data normalization layer (handle regional lab format variations)
- Real-time data ingestion pipeline
- Basic widget UI shell (display PoC outputs in Medtech sandbox)

---

#### **Phase 3: Evaluation Against Targets (Month 6)**

**Comprehensive PoC evaluation:**

| Dimension | Metric | Target | Measurement |
|-----------|--------|--------|-------------|
| **Accuracy** | % correct on 3 use cases | ≥85% average | Test on 1,000 holdout examples per use case |
| **Cost** | $ per 1,000 requests | ≤$0.05 | Load test: 10,000 requests, measure GPU compute cost |
| **Latency** | P95 response time | ≤5.0s | Load test: 100 concurrent requests |
| **Safety** | Prohibited-claim rate | ≤0.5% | Red-team: 1,000 adversarial prompts |
| **Safety** | Refusal appropriateness | ≥95% | Test: 500 should-refuse + 500 should-accept scenarios |
| **NZ-Specific** | Regional lab format handling | 100% coverage | Test: LabTests, SCL, Medlab formats all parse correctly |

**Decision Criteria:**
- **Must meet:** All safety targets (hard requirement)
- **Must meet:** Cost and latency targets
- **Should meet:** Accuracy targets (≥85% average)

**Outcomes:**

**If all targets met:** ✅ Proceed to Phase 4 (refine and harden)

**If accuracy low but safety/cost met:** Iterate on model (more training data, better prompts)

**If fundamental issues (cost/safety fails):** Pivot to fallback architecture (Hybrid LLM + Rules, simpler)

**Deliverables:**
- ✓ Evaluation report (all metrics measured, targets met/not met documented)
- ✓ Benchmark vs GPT-4 (run same tests, compare: "Achieved 88% vs GPT-4 92% = 4pp gap")
- ✓ Go/No-Go decision document (proceed to Phase 4 or pivot to fallback)

---

#### **Phase 4: Refinement, Optimization & Hardening (Months 6-8)**

**Assuming Phase 3 targets met, focus on production-readiness:**

**Model Refinement:**
- Fine-tune experts on expanded NZ corpus
- Improve low-performing areas (e.g., if care gaps at 82%, add more training data)
- Optimize prompts and safety scaffolds
- Version control (Model v1.0, v1.1, v1.2)

**Performance Optimization:**
- Model quantization (reduce size without accuracy loss)
- Inference optimization (reduce latency from 4.5s → <3.0s)
- Load balancing (prepare for Objective 2 scale)
- Cost optimization (target $0.03/request, not just ≤$0.05)

**Safety Hardening:**
- Expand safety test suite (1,000 → 3,000 scenarios)
- Monthly safety regression framework (automated)
- Hard stop mechanism (halt releases if metrics fail)
- Incident runbook (what to do if prohibited claim detected in production)

**Integration Completion:**
- Widget UI polished (not just basic shell)
- Error handling (what if Medtech API down?)
- Monitoring and logging (SIEM for security, dashboards for performance)
- Deployment automation (CI/CD pipeline)

**Foundation System Deployment:**
- Deploy on NZ/AU GPU infrastructure (self-hosted, production-grade)
- Model registry and versioning established
- Evaluation framework operational (automated tests run on every model update)
- Documentation (architecture diagrams, API specs, runbooks)

**Deliverables:**
- ✓ Foundation system v1.0 deployed (production-ready, not just PoC)
- ✓ Performance optimized (cost ≤$0.04/request, latency P95 <3.0s)
- ✓ Safety framework operational (monthly regression suite, hard stops, incident runbook)
- ✓ Medtech integration functional (widget deployed to sandbox, can read/display data)
- ✓ All documentation complete (architecture, API, runbooks)

---

### **Measurable Deliverables (End of Month 8)**

**Research & Decision:**
- ✓ Literature review (20-30 pages, 10+ academic citations)
- ✓ Architecture decision document (justified selection with fallback strategy)

**Foundation System:**
- ✓ Hybrid MoE + Rules deployed on NZ/AU GPU infrastructure
- ✓ 5 initial experts operational (Inbox, Lab, Care Gap, Prescription, Communication)
- ✓ Rules engine integrated (CVDRA, dose calculations, screening eligibility)
- ✓ Can process 100+ concurrent requests (load tested)

**Datasets & Knowledge:**
- ✓ NZ clinical corpus: ≥10,000 documents (BPAC, NZGG, Pharmac, ACC) - versioned in DVC
- ✓ Synthetic datasets: ≥5,000 examples (inbox, labs, patient records) - versioned in DVC

**Performance:**
- ✓ Baseline metrics: Inbox ≥90%, Lab ≥85%, Care gaps ≥85% accuracy
- ✓ GPT-4 benchmark comparison (quality gap documented)
- ✓ Cost per 1,000 requests: ≤$0.05 (ideally ≤$0.04 after optimization)
- ✓ Latency P95: ≤5.0s (ideally <3.0s after optimization)

**Safety:**
- ✓ Prohibited-claim rate: ≤0.5% (tested on 1,000+ adversarial prompts)
- ✓ Refusal appropriateness: ≥95% (tested on 1,000 scenarios)
- ✓ Monthly safety regression suite operational (3,000 test cases)
- ✓ Hard stop mechanism tested and documented

**Integration:**
- ✓ Medtech FHIR API connected (OAuth working, can read inbox/patient/observations)
- ✓ Data normalization layer operational (handles LabTests, SCL, Medlab formats)
- ✓ Widget UI deployed to Medtech sandbox (GPs can view AI outputs)
- ✓ Real-time data ingestion pipeline functional

---

### **Success Criteria**

**Objective 1 is successful if:**

1. ✅ Architecture selected based on systematic literature review (evidence-based decision)
2. ✅ Foundation system (Hybrid MoE + Rules) deployed and operational
3. ✅ **All safety targets met** (prohibited-claim ≤0.5%, refusal ≥95%) - *Hard requirement, no exceptions*
4. ✅ Cost and latency targets met (≤$0.05/request, P95 ≤5.0s)
5. ✅ Baseline accuracy established (≥85% average across 3 use cases)
6. ✅ Medtech integration functional (can read data, normalize, display results)
7. ✅ Ready to build Objective 2 features (infrastructure in place)

**Stage-Gate to Objective 2:**
- All safety targets must be met (hard stop if not)
- Foundation system stable and production-ready
- Medtech sandbox integration working
- NZ corpus and synthetic datasets ready for feature development

---

### **Budget Allocation (Preliminary)**

**Total Objective 1 Budget:** ~$41,920 (excl. GST)

**Labour (Founder):**
- Phase 1 (Literature review): 80 hours @ $96/hr = $7,680
- Phase 2 (PoC development): 120 hours @ $96/hr = $11,520
- Phase 2 (Corpus/data curation): 80 hours @ $96/hr = $7,680
- Phase 3 (Evaluation): 40 hours @ $96/hr = $3,840
- Phase 4 (Refinement): 80 hours @ $96/hr = $7,680
- Medtech integration (concurrent): 20 hours @ $96/hr = $1,920
- **Total labour: 420 hours = $40,320**

**Materials & Consumables:**
- Months 1-8: 8 × $200/month = $1,600

**GPU Infrastructure:**
- Included in project-wide hardware budget (Year 1 depreciation)

---

### **Risk Mitigation**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Hybrid MoE + Rules doesn't meet targets** | Low | High | Phase 1 research de-risks; Fallback: Pivot to Hybrid LLM + Rules (simpler, proven in NHS) |
| **NZ data corpus insufficient** | Medium | Medium | Supplement with synthetic data; partner with NZ medical publishers if needed |
| **Medtech FHIR API limitations** | Medium | High | Early integration (Month 3) catches issues; escalate to Medtech partnership |
| **Cost exceeds target** | Low | Medium | MoE parameter-efficiency designed for cost control; can reduce model size (13B→7B) |
| **Safety targets not met** | Medium | Critical | Invest more in rule-based validation; reduce AI autonomy, increase human review; hard stop until fixed |
| **Phase 3 evaluation fails multiple targets** | Low | High | Phase 1 literature review reduces risk; if happens, pivot to fallback architecture |

---

---

## Objective 2: Admin Automation (Low Complexity / Low Risk)

**Timeline:** Months 6-14 (Jun 2026 - Feb 2027)

**Rationale:** Start with high-value, low-risk features to prove AI system works on simple tasks before tackling safety-critical clinical features. Build confidence and momentum.

---

### **Core R&D Uncertainty**

> Can AI accurately classify and process heterogeneous NZ administrative data (inbox items, hospital letters, normal results) with sufficient reliability for autonomous filing and triage?

**Why this is R&D:**
- Regional variations in data formats (LabTests Auckland ≠ SCL ≠ Medlab)
- Unstructured text from 20+ DHBs with different letter templates
- Unknown: What confidence threshold is safe for auto-filing vs GP review?
- Unknown: Can AI handle NZ-specific admin workflows (ACC forms, HealthPathways referrals)?

---

### **Approach: Build, Integrate, Validate**

#### **Phase 1: Feature Development (Months 6-12)**

**Build 4 low-risk admin automation tools:**

**1. Inbox Management & Triage**
- Classify inbox items by type (labs, letters, referrals, scripts, admin, patient messages)
- Urgency flagging (critical/urgent/routine)
- Action identification (urgent review/follow-up/file/no action)
- Smart routing to appropriate GP
- Batch processing capability (summarize 50 items at once)

**2. Normal Screening Auto-Filing & Recall**
- Identify normal results within reference ranges + clinical context
- Auto-file with templated comments ("HbA1c 38 - normal, continue lifestyle")
- Intelligent recall scheduling:
  - Lipids: 5 years (low risk) vs annual (CVD patients)
  - HbA1c: 3/6/12 months based on control
  - Thyroid: Annual for stable hypothyroid
- Patient notification generation ("Your results are normal")

**3. Referral & Letter Management**
- Hospital discharge summary processing:
  - Extract key findings, new medications, follow-up actions
  - Flag "GP to arrange X" action items
  - Auto-file if "no action required" stated
- Specialist letter interpretation:
  - Extract recommendations and action items
  - Medication change detection
  - Follow-up interval extraction

**4. Referral Letter Generation (Outgoing)**
- Auto-generate specialist referrals from consultation context
- Include relevant history, medications, recent results
- Format per specialist preferences
- Template library for common referrals (cardiology, ortho, dermatology)

**Target Metrics:**
- Inbox classification accuracy: ≥90% (tested on 2,000 real NZ inbox items)
- Auto-filing safety: Zero inappropriate auto-files (tested on 1,000 edge cases)
- Letter extraction accuracy: ≥85% (action items correctly identified)
- Regional format coverage: 100% (LabTests, SCL, Medlab all handled)

---

#### **Phase 2: Medtech Integration (Months 10-14, concurrent with dev)**

**Build Medtech Widget v1.0:**

**Month 10-11: Core Integration**
- Integrate O2 features into Medtech widget UI
- Display inbox triage results (urgency flags, classifications)
- Display auto-filing decisions (with manual override)
- Display letter extractions (key findings, action items)

**Month 12-13: Workflow Integration**
- Inbox workflow: GPs see AI classifications in Medtech inbox view
- One-click filing: GP approves AI auto-file decision with single click
- Letter viewer: AI extracts displayed alongside original letter
- Referral generator: GP initiates from Medtech, AI drafts, GP reviews/edits

**Month 14: Polish & Error Handling**
- Error handling (what if Medtech API down? Show cached results)
- Offline mode (basic functionality without real-time API)
- Loading states, progress indicators
- GP preferences (can disable specific features)

---

#### **Phase 3: Sandbox Validation (Month 14)**

**Comprehensive testing in Medtech sandbox:**

**Test 1: Inbox Processing (1,000 synthetic inbox items)**
- Accuracy: ≥90% classification
- Speed: P95 latency <3.0s per item
- Batch processing: 50 items in <30s
- Zero critical errors (crashes, data loss)

**Test 2: Auto-Filing Safety (500 edge cases)**
- Zero inappropriate auto-files (all edge cases flagged for GP review)
- Normal results correctly filed: ≥95%
- Recall dates correctly calculated: 100%

**Test 3: Letter Extraction (200 real DHB letter templates)**
- Action items extracted: ≥85% accuracy
- Key findings identified: ≥80% accuracy
- Regional variation handling: 100% (all DHB formats parse correctly)

**Test 4: Referral Generation (100 specialist referrals)**
- Completeness (all required fields): 100%
- Clinical accuracy (relevant history included): ≥90%
- GP satisfaction: ≥80% ("would use this referral with minor edits")

**Deliverables:**
- ✓ Validation report (all tests passed/failed documented)
- ✓ Failure case analysis (what didn't work? Why?)
- ✓ Medtech widget v1.0 deployed to sandbox
- ✓ All O2 features functional in sandbox environment

---

### **Measurable Deliverables (End of Month 14)**

**Features Delivered:**
- ✓ 4 admin automation tools operational
- ✓ All tools achieving target accuracy (inbox ≥90%, auto-filing 100% safe, letters ≥85%)

**Integration Delivered:**
- ✓ Medtech widget v1.0 deployed to sandbox
- ✓ All O2 features integrated and working in Medtech UI
- ✓ Workflow integration tested (GPs can use features in natural workflow)

**Performance:**
- ✓ Latency: P95 <3.0s per request
- ✓ Cost: ≤$0.04 per 1,000 requests
- ✓ Reliability: Zero data loss, <0.1% error rate

**Documentation:**
- ✓ User guide for O2 features (how GPs use in Medtech)
- ✓ Technical documentation (API specs, data flows)

---

### **Success Criteria**

**Objective 2 is successful if:**

1. ✅ All 4 admin automation tools built and achieving target accuracy
2. ✅ **Medtech widget v1.0 functional** - O2 features working in sandbox
3. ✅ Inbox time savings ≥30% (measured in sandbox with synthetic workflows)
4. ✅ Zero safety violations (no inappropriate auto-filing in 1,000 edge case tests)
5. ✅ Regional format coverage 100% (all major NZ labs handled)
6. ✅ GP satisfaction ≥80% (sandbox usability testing with 5 GPs)

**Stage-Gate to Objective 3:**
- All O2 features proven in Medtech sandbox
- Safety validated (zero inappropriate actions)
- Ready to add medium-complexity clinical features

---

### **Budget Allocation (Preliminary)**

**Total Objective 2 Budget:** ~$52,000 (excl. GST)

**Labour:**
- Founder: 320 hours @ $96/hr = $30,720
  - Feature development: 180 hours
  - Integration & testing: 100 hours
  - Sandbox validation: 40 hours
- Developer: 240 hours @ $72/hr = $17,280 (starts Month 4, ramps up in O2)
  - Widget development: 120 hours
  - Integration work: 80 hours
  - Testing infrastructure: 40 hours

**Materials & Consumables:**
- Months 6-14: 9 × $200/month = $1,800

**Synthetic Data Generation:**
- 2,000 additional inbox items (beyond O1 dataset)
- 500 edge case scenarios
- 200 DHB letter templates
- Included in labour hours above

---

### **Risk Mitigation**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Regional lab formats more varied than expected** | Medium | Medium | O1 already covers 3 major labs; expand dataset if needed; fallback to manual review for unknown formats |
| **Auto-filing confidence threshold unclear** | Medium | High | Start conservative (high confidence required); iteratively lower threshold as safety proven |
| **Medtech API limitations discovered** | Low | High | Early integration (Month 10) catches issues; Medtech partnership for support |
| **GP sandbox feedback reveals workflow mismatch** | Medium | Medium | Iterative testing with 5 GPs throughout development; adjust UI based on feedback |

---

---

## Objective 3: Clinical Intelligence (Medium Complexity / Medium Risk)

**Timeline:** Months 12-20 (Dec 2026 - Aug 2027)

**Rationale:** Build on O2 foundation to add clinical interpretation, calculations, and temporal logic. Medium risk - wrong answer misses opportunities (care gaps, screening) but GP remains clinically responsible.

---

### **Core R&D Uncertainty**

> Can AI safely interpret NZ lab results, calculate clinical risk scores (CVDRA), and track complex temporal logic (care gaps, screening intervals) with sufficient accuracy for clinical decision support?

**Why this is R&D:**
- Lab interpretation requires clinical context (HbA1c 50 is different in diabetic vs pre-diabetic)
- CVDRA calculation from unstructured clinical data (not just clean inputs)
- Temporal logic complexity (HbA1c every 3 months IF poor control, 6 months IF stable)
- Multi-condition interactions (diabetes + CKD = different monitoring than diabetes alone)
- Unknown: Can small model handle NZ-specific clinical guidelines with 85%+ accuracy?

---

### **Approach: Build, Integrate, Validate**

#### **Phase 1: Feature Development (Months 12-18)**

**Build 3 clinical intelligence tools:**

**1. Lab Result Interpretation (High-Yield Labs)**

**1A: Lipid Panel Intelligence**
- Abnormal lipid detection and classification (total cholesterol, LDL, HDL, triglycerides)
- CVDRA auto-calculation (NZ CVD Risk Calculator: age, sex, ethnicity, smoking, diabetes, BP, lipids)
- Statin indication assessment per BPAC guidelines:
  - CVDRA >15%: "Consider statin therapy"
  - CVDRA 10-15%: "Discuss lifestyle + consider statin"
  - CVDRA <10%: "Lifestyle advice, recheck 5 years"
- Lipid target achievement monitoring (for patients on statins)
- Specialist referral triggers (familial hyperlipidaemia: LDL >5.0 + family history)

**1B: HbA1c & Diabetes Monitoring**
- HbA1c trend analysis (improving/stable/worsening over time)
- Diabetes control classification:
  - Good control: <53 mmol/mol
  - Moderate: 53-64 mmol/mol
  - Poor: >64 mmol/mol
- Medication review triggers (HbA1c elevated despite treatment)
- Pre-diabetes identification (41-49 mmol/mol) and follow-up intervals
- Diabetes complication screening reminders (retinopathy, nephropathy, foot checks)

**1C: Renal Function Intelligence**
- eGFR trend tracking and rate of decline calculation
- CKD stage classification (Stage 1-5 per NZ renal guidelines)
- Nephrotoxic medication identification (NSAIDs, ACE inhibitors in CKD)
- Nephrology referral triggers:
  - eGFR <30 ml/min/1.73m²
  - Rapid decline (>5 ml/min/year)
  - ACR >30 mg/mmol with declining eGFR
- Dose adjustment recommendations (medication dosing in renal impairment)
- ACR (albumin-creatinine ratio) interpretation

**Target Metrics:**
- Lab interpretation accuracy: ≥85% (validated against GP consensus on 1,000 cases)
- CVDRA calculation accuracy: ≥95% (tested on 500 cases with known CVDRA)
- Treatment recommendation accuracy: ≥85% (matches BPAC guidelines)
- Temporal trend accuracy: ≥90% (correctly identifies improving/worsening)

**2. Care Gap Monitoring (Proactive)**

**Chronic Disease Monitoring:**
- **Diabetes:** HbA1c, lipids, ACR, BP, retinopathy screening, foot checks, flu vaccine
- **CVD Risk:** BP monitoring, lipids, CVDRA updates, smoking status
- **CKD:** eGFR, ACR, electrolytes, BP, medication review
- **COPD:** Spirometry, inhaler technique, flu/pneumococcal vaccine, smoking cessation
- **Hypertension:** BP monitoring frequency per control level

**PHO Quality Indicator Tracking:**
- Identify patients contributing to PHO performance metrics
- Flag opportunities to improve PHO scores (= funding increase for practice)
- Examples: Diabetes HbA1c <64, CVD patients on appropriate meds, immunizations

**Care Gap Prioritisation:**
- Risk-based prioritization (diabetes + CVD = higher priority)
- Time-sensitive gaps (HbA1c >6 months overdue vs 1 month overdue)
- Pre-consultation alerts (show care gaps before GP sees patient)
- Batch reports for practice nurses (care gap lists for recall campaigns)

**Target Metrics:**
- Care gap detection accuracy: ≥85% (validated against manual GP audit of 200 patients)
- Temporal logic accuracy: 100% (recall intervals per NZ guidelines)
- PHO indicator tracking: ≥95% (correctly identifies patients meeting/not meeting criteria)
- Prioritization relevance: ≥80% GP agreement ("top 3 gaps shown are most important")

**3. National Screening Programme Management**

**Three National Programmes:**

**3A: Cervical Screening**
- Eligibility: Women 25-69 years, 3-yearly
- Overdue screening identification
- Automatic recall letter generation
- HPV test result interpretation (refer if positive)

**3B: Bowel Screening**
- Eligibility: People 60-74 years, 2-yearly FIT (faecal immunochemical test)
- Overdue screening identification
- Result interpretation:
  - Positive FIT → Generate colonoscopy referral
  - Negative FIT → Schedule next FIT in 2 years

**3C: Breast Screening**
- Eligibility: Women 45-69 years, 2-yearly mammogram
- Overdue screening identification
- BreastScreen Aotearoa referral generation
- Track attendance and follow-up

**Target Metrics:**
- Eligibility tracking: ≥95% accuracy (correctly identifies who needs screening)
- Overdue identification: 100% accuracy (no missed overdue patients)
- Recall letter quality: ≥85% GP satisfaction ("would send without edits")

---

#### **Phase 2: Medtech Integration (Months 16-20, concurrent with dev)**

**Build Medtech Widget v2.0:**

**Month 16-17: Lab Dashboard**
- Display lab interpretations alongside raw results
- CVDRA calculation visible in patient summary
- Trend charts (HbA1c over time, eGFR decline)
- Treatment recommendation cards (statin indication, medication review triggers)

**Month 18-19: Care Gap Dashboard**
- Pre-consultation care gap alerts (show before GP opens patient file)
- Patient-level care gap view (all gaps for one patient)
- Practice-level care gap reports (batch list for nurses)
- PHO quality indicator dashboard (practice performance tracking)

**Month 19-20: Screening Tracker**
- Screening due dates displayed in patient summary
- Batch recall lists (all patients overdue for cervical screening)
- Automatic recall letter generation (one-click send)

---

#### **Phase 3: Sandbox Validation (Month 20)**

**Comprehensive testing in Medtech sandbox:**

**Test 1: Lab Interpretation (1,000 real NZ lab results)**
- Lipid + CVDRA: ≥95% calculation accuracy, ≥85% recommendation accuracy
- HbA1c: ≥85% trend interpretation accuracy
- Renal: ≥85% CKD staging accuracy, 100% referral trigger accuracy

**Test 2: Care Gap Detection (200 synthetic patient records)**
- Gap detection: ≥85% accuracy (vs manual GP audit)
- Temporal logic: 100% correct recall intervals
- Prioritization: ≥80% GP agreement on top 3 gaps

**Test 3: Screening Tracking (500 patients)**
- Eligibility: ≥95% accuracy
- Overdue identification: 100% accuracy
- Recall letter quality: ≥85% GP satisfaction

**Test 4: Integration Testing**
- Widget v2.0 performance: P95 latency <4.0s for full care gap analysis
- No crashes under load (100 concurrent patient views)
- Data accuracy: 100% (AI outputs match patient data in Medtech)

**Deliverables:**
- ✓ Validation report (all tests passed/failed)
- ✓ Medtech widget v2.0 deployed to sandbox
- ✓ All O2 + O3 features functional

---

### **Measurable Deliverables (End of Month 20)**

**Features Delivered:**
- ✓ 3 clinical intelligence tools operational (labs, care gaps, screening)
- ✓ All tools achieving target accuracy (≥85% average)

**Integration Delivered:**
- ✓ Medtech widget v2.0 deployed
- ✓ O2 + O3 features integrated
- ✓ Lab dashboard, care gap dashboard, screening tracker functional

**Performance:**
- ✓ Care gap monitoring completion rate: ≥80% (tested in sandbox workflows)
- ✓ PHO quality indicator improvement: ≥10% (simulated in sandbox)
- ✓ Screening recall efficiency: 50% reduction in manual work (simulated)

---

### **Success Criteria**

**Objective 3 is successful if:**

1. ✅ All 3 clinical intelligence tools achieving target accuracy
2. ✅ **Medtech widget v2.0 functional** - O2+O3 features working together
3. ✅ CVDRA calculation: ≥95% accuracy
4. ✅ Care gap detection: ≥85% accuracy vs manual audit
5. ✅ Screening tracking: ≥95% eligibility accuracy
6. ✅ GP satisfaction: ≥75% ("AI suggestions are clinically useful")

**Stage-Gate to Objective 4:**
- All O3 features proven in sandbox
- Clinical accuracy validated
- Ready to add high-risk features (prescriptions, guidelines)

---

### **Budget Allocation (Preliminary)**

**Total Objective 3 Budget:** ~$58,000 (excl. GST)

**Labour:**
- Founder: 360 hours @ $96/hr = $34,560
  - Lab interpretation: 120 hours
  - Care gap logic: 100 hours
  - Screening tracking: 60 hours
  - Integration & validation: 80 hours
- Developer: 280 hours @ $72/hr = $20,160
  - Widget v2.0 development: 160 hours
  - Dashboard UI: 80 hours
  - Testing: 40 hours

**Materials & Consumables:**
- Months 12-20: 9 × $200/month = $1,800

---

### **Risk Mitigation**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Clinical accuracy below target** | Medium | High | Iterative refinement; expand training data; add rule-based validation for critical calculations (CVDRA) |
| **Temporal logic too complex** | Medium | Medium | Start with simple intervals; add complexity incrementally; use rule engine for date calculations |
| **Multi-condition interactions missed** | Medium | Medium | Systematic testing of condition combinations; GP review of edge cases |
| **CVDRA calculation from unstructured data fails** | Low | High | Fallback: Prompt GP to enter CVDRA manually; AI extracts from structured fields first |

---

---

## Objective 4: Clinical Decision Support + System Validation (High Complexity / High Risk)

**Timeline:** Months 18-24 (Jun 2027 - Dec 2027)

**Rationale:** Add highest-risk clinical decision support features (prescriptions, guidelines), complete system integration, validate entire system with real GPs in pilot, and prepare for production deployment.

---

### **Core R&D Uncertainty**

> Can AI provide safe, accurate clinical decision support for high-stakes tasks (prescription validation, drug dosing, guideline recommendations) while preventing alert fatigue through intelligent prioritization? And does the integrated system perform safely and effectively in real-world GP workflows?

**Why this is R&D:**
- Prescription errors are safety-critical (dosing mistakes = patient harm)
- Unknown: Can AI catch 95%+ prescription errors before pharmacy submission?
- Unknown: How to present 50+ AI tools without causing alert fatigue?
- Unknown: Will real GPs use AI suggestions, or ignore them?
- Unknown: What is optimal balance between AI autonomy vs human oversight?

---

### **Approach: Build, Integrate, Validate, Pilot**

#### **Phase 1: High-Risk Feature Development (Months 18-22)**

**Build 4 high-complexity tools:**

**1. Prescription & Medication Intelligence**

**1A: Prescription Safety & Accuracy** (addresses 1,257 weekly errors per RNZ report)

- **Dosing error detection:**
  - Age-inappropriate dosing (paediatric, elderly)
  - Weight-based dosing errors
  - Renal function dose adjustment (CKD patients - use O3 eGFR data)
  - Hepatic dose adjustment
  - Maximum dose checking
- **Quantity errors:**
  - Mismatched quantity vs duration ("30 tablets for take twice daily for 1 month" = should be 60)
  - Unusual quantities flagged (prescribed 10, meant 100?)
- **Missing prescription details:**
  - Route missing (oral, topical, IV?)
  - Frequency missing (OD, BD, TDS?)
  - Duration missing (7 days, ongoing, PRN?)
  - Indication missing (required for certain medications)
- **Dangerous abbreviation detection:**
  - Flag unclear abbreviations (U for units, IU, etc.)
  - Suggest safer alternatives
- **Pre-submission validation:**
  - AI checks prescription BEFORE sending to pharmacy
  - "This prescription is missing frequency - please add"
  - Hard stop for critical errors (contraindicated drug)

**1B: Clinical Intelligence**
- Pharmac formulary compliance checking (funded vs non-funded)
- Drug interaction detection (major interactions flagged)
- Dosing guidance (NZ-specific per BPAC/NZGG)
- Special authority criteria checking (does patient meet criteria?)
- Medication reconciliation (discharge letters vs current medications - use O2 letter extraction)
- Duplicate therapy detection (two statins, two NSAIDs)

**Target Metrics:**
- Prescription error detection: ≥95% sensitivity (tested on 1,257 known errors from RNZ report)
- False positive rate: ≤5% (don't flag correct prescriptions)
- Critical error detection: 100% (contraindications, dangerous dose errors)
- Dosing recommendation accuracy: ≥90% (matches BPAC/NZGG guidelines)

**2. Clinical Guideline Assistant**

- **Context-aware guideline surfacing:**
  - Relevant BPAC/NZGG guidelines during consultation
  - HealthPathways integration (local treatment pathways)
  - Condition-specific guidelines (diabetes, hypertension, COPD management)
- **Treatment pathway recommendations:**
  - Step-wise treatment algorithms (e.g., hypertension: lifestyle → one drug → two drugs → specialist)
  - When to refer (red flag criteria)
- **Vaccine schedule reminders:**
  - Flu vaccine (annual for at-risk groups)
  - COVID boosters (per current guidelines)
  - Childhood immunizations (8 months, 2 years, 5 years)
- **Antibiotic prescribing guidelines:**
  - First-line antibiotics per BPAC
  - Duration recommendations
  - Resistance patterns (local antibiograms if available)

**Target Metrics:**
- Guideline relevance: ≥80% GP agreement ("shown guidelines are relevant to this consultation")
- Guideline accuracy: 100% (guidelines are current, NZ-specific)
- Treatment recommendation appropriateness: ≥85% (matches BPAC/NZGG)

**3. Patient Communication Tools**

- **Patient-friendly result explanations:**
  - Translate medical jargon to plain language
  - Literacy-appropriate (Flesch-Kincaid grade ≤8)
  - Culturally appropriate (NZ context, Māori/Pacific considerations)
- **After-visit summary generation:**
  - Summarize consultation for patient
  - What was discussed, what was decided, next steps
  - Include relevant education materials
- **Medication instruction sheets:**
  - How to take medication (with food? time of day?)
  - What to expect (common side effects)
  - When to seek help (red flag symptoms)
- **Follow-up instruction generation:**
  - "Return if X happens" (specific symptoms)
  - When to book next appointment

**Target Metrics:**
- Health literacy validation: Flesch-Kincaid grade ≤8
- Patient comprehension: ≥85% (tested with patient focus groups)
- GP satisfaction: ≥80% ("would give this to patient without major edits")

**4. Intelligent Alert Prioritization & Dashboard**

**4A: Alert Prioritization Algorithm**
- Clinical risk weighting (urgent vs important)
  - Critical lab result > care gap > screening due
  - Time-sensitive prioritization (HbA1c 6 months overdue > 1 month overdue)
- Patient context awareness:
  - Upcoming appointment? Show care gaps now
  - Recent hospital admission? Prioritize medication reconciliation
  - No appointment? Batch non-urgent alerts

**4B: Adaptive Learning**
- Learn from GP dismissal patterns:
  - If GP always dismisses "flu vaccine due" alerts → reduce frequency
  - If GP always acts on "prescription error" alerts → keep priority high
- Personalized to individual GP preferences
- Weekly digest of dismissed alerts (in case GP wants to review)

**4C: Cognitive Load Optimization**
- How much information without overwhelming?
  - Summary view (top 3 alerts) vs detailed view (all alerts)
  - Progressive disclosure (show more on click)
- Batch vs real-time alerts:
  - Critical: Real-time interrupt
  - Important: Show during consultation
  - Routine: Batch at end of day
- Snooze functionality (remind me later)

**Target Metrics:**
- Alert prioritization accuracy: ≥90% (GP agrees top 3 alerts are most important)
- Alert fatigue score: ≤3/10 (measured via GP survey)
- Adaptive learning effectiveness: ≥30% reduction in dismissed alerts after 4 weeks
- Dashboard engagement: ≥70% daily use by GPs

---

#### **Phase 2: Medtech Integration (Months 20-22, concurrent with dev)**

**Build Medtech Widget v3.0 (Complete System):**

**Month 20-21: High-Risk Feature Integration**
- Prescription validation integrated into Medtech prescribing workflow
  - AI checks run BEFORE prescription sent to pharmacy
  - Hard stop for critical errors (GP must acknowledge override)
- Clinical guidelines displayed contextually
  - Linked to conditions in patient file
  - One-click access from consultation screen
- Patient communication tools:
  - Generate after-visit summary with one click
  - Pre-filled patient education materials

**Month 22: Dashboard & Prioritization**
- Intelligent dashboard showing prioritized alerts
- Adaptive learning dashboard preferences
- Summary cards for each patient (top 3 alerts visible)
- Detail view (all O2+O3+O4 features accessible)

---

#### **Phase 3: Sandbox Validation (Month 22)**

**Full system testing:**

**Test 1: Prescription Validation (1,257 known errors + 500 correct prescriptions)**
- Error detection: ≥95% sensitivity
- False positives: ≤5%
- Critical errors: 100% detection

**Test 2: Guideline Recommendations (200 consultation scenarios)**
- Relevance: ≥80% GP agreement
- Accuracy: 100% (guidelines current and correct)

**Test 3: Patient Communications (100 samples)**
- Literacy level: Flesch-Kincaid ≤8
- Accuracy: 100% (no clinical errors)
- Patient satisfaction: ≥85% (tested with focus group)

**Test 4: Alert Prioritization (50 complex patients with 10+ potential alerts each)**
- Prioritization accuracy: ≥90% (GP agrees with top 3)
- Alert fatigue: ≤3/10

**Test 5: Full System Integration**
- All O2+O3+O4 features working together
- No conflicts between features
- Performance: P95 latency <5.0s for full patient analysis
- Stability: Zero crashes during 8-hour simulated GP day

**Deliverables:**
- ✓ Medtech widget v3.0 deployed to sandbox
- ✓ All 50+ AI tools integrated and functional
- ✓ Full system validation passed

---

#### **Phase 4: Real-World Pilot (Months 22-24)**

**Pilot Objectives:**
1. **Validate R&D outcomes** - Do accuracy targets hold in real-world messy data?
2. **Iterative refinement** - Collect failure cases, improve model
3. **Safety validation** - Catch any safety violations before wider rollout
4. **Usability validation** - Do GPs actually use features? What improvements needed?

**Pilot Design:**

**Participants:** 10-20 consenting GPs (Medtech users, mix of practice sizes/locations)

**Duration:** 2-3 months (Months 22-24)

**Scope:** All O2+O3+O4 features enabled

**Data Collection (Systematic):**
- **Accuracy tracking:**
  - Log all AI suggestions vs GP final decisions
  - Identify false positives (AI wrong, GP correct)
  - Identify false negatives (AI missed something GP caught)
- **Usage analytics:**
  - Which features used most/least?
  - Dismissal rates per feature
  - Time spent per feature
- **Safety monitoring:**
  - Log any prohibited claims detected
  - Log any safety violations
  - Weekly safety reviews (manual review of random sample)
- **GP feedback:**
  - Weekly survey (5 questions: accuracy, usefulness, alert fatigue, safety concerns, suggestions)
  - End-of-pilot interview (30 min per GP)
- **Performance metrics:**
  - Inbox time savings (before/after measurement)
  - Care gap completion rates
  - Prescription error rate
  - Time per consultation (does AI save or add time?)

**Iterative Refinement:**
- **Weekly model updates** based on pilot data:
  - Retrain on failure cases
  - Adjust confidence thresholds (if too many/few alerts)
  - Fix bugs discovered
- **Monthly feature adjustments:**
  - Disable features with <20% usage (unless safety-critical)
  - Enhance features with >80% usage
  - Adjust alert prioritization based on dismissal patterns

**Safety Protocols:**
- **Hard stops remain in place** (prohibited-claim rate must stay ≤0.5%)
- **Weekly safety audit** (manual review of 50 random AI outputs)
- **Incident reporting** (GPs can flag concerning AI outputs instantly)
- **Halt criteria:** If 3+ safety violations detected, pause pilot for investigation

**Success Criteria for Pilot:**
- ✓ Accuracy targets met in real-world data (≥85% average across all features)
- ✓ Safety targets met (prohibited-claim ≤0.5%, zero serious safety violations)
- ✓ GP satisfaction ≥75% ("I would continue using this after pilot")
- ✓ Inbox time savings ≥30% (measured)
- ✓ Care gap completion ≥80% (measured)
- ✓ Alert fatigue ≤3/10 (measured)
- ✓ GP retention ≥80% (GPs stay in pilot for full duration)

**Deliverables:**
- ✓ Pilot completion report (all metrics measured)
- ✓ Model v2.0 (refined based on pilot data)
- ✓ GP feedback synthesis (qualitative + quantitative)
- ✓ Safety audit results (zero serious violations)
- ✓ Recommendations for post-grant wider rollout

---

#### **Phase 5: Production-Readiness (Months 22-24, concurrent with pilot)**

**Technical R&D for production deployment:**

**1. NZ-Sovereign Deployment Architecture**
- Challenge: Maintain <5s latency + $0.05/request at production scale
- Solution: Multi-region deployment (NZ + AU), auto-scaling, load balancing
- Testing: Load test with 500 concurrent GPs (simulated national scale)

**2. Safety Monitoring Systems**
- Challenge: Real-time detection of prohibited claims across 50+ tools
- Solution: SIEM integration, real-time safety dashboards, automated alerts
- Testing: Simulate 100k requests with 0.5% prohibited claims injected - all detected

**3. Zero-Downtime Update Deployment**
- Challenge: Healthcare requires 24/7 availability
- Solution: Blue-green deployment, canary releases, rollback automation
- Testing: Deploy 10 updates during pilot, zero downtime

**4. Incident Response Automation**
- Challenge: Rapid response to safety violations
- Solution: Automated incident detection → notification → model rollback within 15 minutes
- Testing: Simulate safety violation, verify response time <15 min

**5. Medtech Integration Optimization**
- Challenge: Minimize Medtech API load (avoid rate limiting)
- Solution: Intelligent caching, batched requests, predictive prefetching
- Testing: Measure API calls per GP per day, optimize to <500 calls/GP/day

**Deliverables:**
- ✓ Production deployment infrastructure operational (NZ-sovereign)
- ✓ Safety monitoring systems live (real-time dashboards)
- ✓ Zero-downtime deployment tested and validated
- ✓ Incident response playbooks automated and tested
- ✓ Medtech integration optimized (within API rate limits)

---

### **Measurable Deliverables (End of Month 24)**

**Features Delivered:**
- ✓ 4 high-complexity tools operational (prescriptions, guidelines, patient comms, dashboard)
- ✓ All 50+ AI tools integrated into Medtech widget v3.0

**Pilot Completed:**
- ✓ 10-20 GPs participated for 2-3 months
- ✓ All accuracy targets validated in real-world data
- ✓ All safety targets met (zero serious violations)
- ✓ GP satisfaction ≥75%, retention ≥80%
- ✓ Inbox time savings ≥30%, care gap completion ≥80%
- ✓ Model v2.0 refined based on pilot learnings

**Production-Ready:**
- ✓ NZ-sovereign deployment architecture operational
- ✓ Safety monitoring systems live
- ✓ Zero-downtime deployment capability proven
- ✓ Incident response automation tested
- ✓ Medtech integration optimized

**Documentation:**
- ✓ Final R&D report (all objectives, outcomes, learnings)
- ✓ Pilot results report (comprehensive analysis)
- ✓ Production deployment guide
- ✓ GP training materials
- ✓ Technical runbooks (operations, incident response)

---

### **Success Criteria**

**Objective 4 is successful if:**

1. ✅ All high-risk features achieving target accuracy (≥85% average)
2. ✅ **Pilot completed successfully:**
   - 10-20 GPs, 2-3 months
   - Accuracy targets met in real world
   - Safety targets met (≤0.5% prohibited claims, zero serious violations)
   - GP satisfaction ≥75%, retention ≥80%
3. ✅ Prescription error detection: ≥95% sensitivity
4. ✅ Alert fatigue: ≤3/10
5. ✅ **Production-ready infrastructure deployed and tested**
6. ✅ Entire system (O2+O3+O4) validated and functional

**Programme Completion Criteria:**
- All 4 objectives successfully completed
- All 50+ AI tools operational in Medtech
- Pilot validated entire system with real GPs
- Production deployment infrastructure ready
- Ready for post-grant wider rollout

---

### **Budget Allocation (Preliminary)**

**Total Objective 4 Budget:** ~$62,000 (excl. GST)

**Labour:**
- Founder: 380 hours @ $96/hr = $36,480
  - Prescription validation: 100 hours
  - Guidelines + patient comms: 80 hours
  - Dashboard + prioritization: 60 hours
  - Pilot management: 80 hours
  - Production-readiness: 60 hours
- Developer: 300 hours @ $72/hr = $21,600
  - Widget v3.0: 120 hours
  - Dashboard UI: 80 hours
  - Production deployment: 60 hours
  - Pilot support: 40 hours

**Materials & Consumables:**
- Months 18-24: 7 × $200/month = $1,400

**Pilot Costs:**
- GP stipends (20 GPs × $200 each) = $4,000 (for participation time)
- (Or: Included in conference/CapDev budget)

---

### **Risk Mitigation**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Prescription validation accuracy below 95%** | Medium | Critical | Start with hard stops only (critical errors); expand gradually; add rule-based validation for known error patterns |
| **Alert fatigue in pilot** | Medium | High | Adaptive learning from Day 1; weekly GP feedback; aggressive threshold tuning; can disable features if causing fatigue |
| **Pilot GPs drop out** | Low | Medium | GP stipends; weekly check-ins; responsive to feedback; keep pilot short (2-3 months) |
| **Safety violation in pilot** | Low | Critical | Hard stops remain; weekly safety audits; incident response <15 min; can halt pilot immediately |
| **Production deployment infrastructure fails** | Low | High | Thorough testing during pilot; staged rollout post-grant; fallback to sandbox environment |

---

---

---

## Programme-Wide Summary

### **Timeline Visual**

```
Year 1 (2026):
├─ Q1 (Jan-Mar): O1 Architecture Research + PoC Development
│   └─ Months 1-2: Literature review → Month 3-5: PoC build → Month 6: Evaluate
│
├─ Q2 (Apr-Jun): O1 Refinement + O2 Starts
│   ├─ Month 4-6: O1 refine & harden foundation
│   └─ Month 6: O2 feature development begins (Inbox + Auto-filing)
│
├─ Q3 (Jul-Sep): O2 Development + Integration
│   ├─ Months 6-12: O2 features (Inbox, filing, letters)
│   └─ Months 10-14: O2 Medtech integration (Widget v1.0)
│
└─ Q4 (Oct-Dec): O2 Validation + O3 Starts
    ├─ Month 14: O2 sandbox validation complete
    └─ Month 12: O3 feature development begins (Labs, care gaps)

Year 2 (2027):
├─ Q1 (Jan-Mar): O3 Development + Integration
│   ├─ Months 12-18: O3 features (Labs, CVDRA, care gaps, screening)
│   └─ Months 16-20: O3 Medtech integration (Widget v2.0)
│
├─ Q2 (Apr-Jun): O3 Validation + O4 Starts
│   ├─ Month 20: O3 sandbox validation complete
│   └─ Month 18: O4 feature development begins (Prescriptions, guidelines)
│
├─ Q3 (Jul-Sep): O4 Development + Integration
│   ├─ Months 18-22: O4 features (Rx, guidelines, patient comms, dashboard)
│   ├─ Months 20-22: O4 Medtech integration (Widget v3.0)
│   └─ Month 22: O4 sandbox validation + Production infrastructure
│
└─ Q4 (Oct-Dec): PILOT + Production-Readiness
    ├─ Months 22-24: Real-world pilot (10-20 GPs, entire system)
    ├─ Iterative refinement based on pilot data
    └─ Production infrastructure deployment & testing
```

**Key Overlaps:**
- O1 + O2: Months 6-8
- O2 + O3: Months 12-14
- O3 + O4: Months 18-20
- All integration phases overlap with feature development (continuous validation)

---

### **Budget Summary (All 4 Objectives)**

**Preliminary Budget Calculation:**

| Category | Amount (NZD excl. GST) |
|----------|------------------------|
| **O1: Foundation** | $41,920 |
| **O2: Admin Automation** | $52,000 |
| **O3: Clinical Intelligence** | $58,000 |
| **O4: Clinical Decision Support + Pilot** | $62,000 |
| **Subtotal R&D Labour + Materials** | **$213,920** |
| | |
| **Capability Development Labour** | $6,000 (estimate, ≥5% of grant = $4,213 minimum) |
| **Professional Services (IP)** | $8,000 |
| **Conference Travel** | $4,000 |
| **Hardware & Depreciation (Year 1-2)** | $4,000 |
| | |
| **Total Eligible Costs** | **$235,920** |
| | |
| **Grant (40%)** | **$94,368** |
| **Co-Funding (60%)** | **$141,552** |

**⚠️ OVER TARGET - Need to reduce to ~$200k total eligible costs**

**Options to reduce:**
1. Reduce labour hours (currently 1,480 founder + 1,120 developer = 2,600 total hours)
2. Reduce developer hours (fewer hours per objective)
3. Reduce pilot costs (smaller pilot, no GP stipends)
4. Adjust hourly rates
5. Move some work post-grant

**Next Step:** Review budget allocations per objective and adjust to hit $200k target while maximizing grant request.

---

### **Labour Summary**

| Role | Hours | Rate | Cost |
|------|-------|------|------|
| **Founder R&D Labour** | 1,480 hours | $96/hr | $142,080 |
| **Developer R&D Labour** | 1,120 hours | $72/hr | $80,640 |
| **Total R&D Labour** | 2,600 hours | | $222,720 |
| | | | |
| **Capability Development Labour** | ~60 hours (estimate) | $96/hr | $5,760 |
| **Total Labour** | 2,660 hours | | **$228,480** |

**Labour Breakdown by Objective:**
- O1: 420 founder hrs (no developer until Month 4)
- O2: 320 founder hrs + 240 developer hrs
- O3: 360 founder hrs + 280 developer hrs
- O4: 380 founder hrs + 300 developer hrs + 300 developer hrs

**Average hours per week over 24 months:**
- Founder: 1,480 hrs ÷ 104 weeks = **14.2 hrs/week** (part-time, allows clinical work for co-funding)
- Developer: 1,120 hrs ÷ 88 weeks (starts Month 4) = **12.7 hrs/week** (contractor, part-time)

---

### **Materials & Consumables**

- $200/month × 24 months = **$4,800**
- Covers: Cloud services, API costs, data storage, testing tools, software licenses

---

## Next Steps

1. ✅ Objective 1 drafted and finalized
2. ⏳ Draft Objective 2 (Reactive Intelligence)
3. ⏳ Draft Objective 3 (Proactive Support)
4. ⏳ Draft Objective 4 (Intelligent Presentation & Pilot)
5. ⏳ Calculate 24-month budget (maximize to $200k)
6. ⏳ Review all 4 objectives holistically
7. ⏳ Adjust as needed based on full picture
8. ⏳ Update all existing proposal documents

---

**Document Version:** 1.0 (Draft)  
**Last Updated:** 23 Nov 2025  
**Status:** Objective 1 finalized, Objectives 2-4 to be drafted
