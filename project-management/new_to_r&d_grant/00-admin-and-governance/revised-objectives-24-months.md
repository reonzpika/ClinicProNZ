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

## Objective 2: Reactive Clinical Intelligence - Inbox & Lab Automation

**Timeline:** Months 6-14 (Jun 2026 - Feb 2027)

**Status:** To be drafted

### **Core R&D Uncertainty**

> [To be defined]

### **Features to Build**

**From comprehensive AI tools list:**
1. Inbox Management & Triage
2. Lab Result Interpretation (Lipid/CVDRA, HbA1c/Diabetes, Renal/CKD)
3. Normal Screening Auto-Filing & Recall
4. Referral & Letter Management

### **Measurable Deliverables**

[To be defined]

### **Success Criteria**

[To be defined]

### **Budget Allocation**

[To be defined]

---

---

## Objective 3: Proactive Clinical Support - Care Gaps, Screening & Prescriptions

**Timeline:** Months 12-20 (Dec 2026 - Aug 2027)

**Status:** To be drafted

### **Core R&D Uncertainty**

> [To be defined]

### **Features to Build**

**From comprehensive AI tools list:**
1. Care Gap Monitoring (chronic disease, PHO indicators)
2. National Screening Programme Management (cervical, bowel, breast)
3. Prescription & Medication Intelligence (dosing, quantity, missing details)
4. ACC & Injury Management
5. Clinical Guideline Assistant

### **Measurable Deliverables**

[To be defined]

### **Success Criteria**

[To be defined]

### **Budget Allocation**

[To be defined]

---

---

## Objective 4: Intelligent Prioritization, Patient Communication & Pilot Readiness

**Timeline:** Months 18-24 (Jun 2027 - Dec 2027)

**Status:** To be drafted

### **Core R&D Uncertainty**

> [To be defined]

### **Features to Build**

**From comprehensive AI tools list:**
1. Intelligent alert prioritization (risk weighting, time-sensitivity)
2. Adaptive learning (reduce dismissed alerts based on GP patterns)
3. Patient Communication Tools (patient-friendly explanations, after-visit summaries)
4. Cognitive load optimization (batch vs real-time alerts)
5. Pilot launch (10-50 consenting GPs)

### **Measurable Deliverables**

[To be defined]

### **Success Criteria**

[To be defined]

### **Budget Allocation**

[To be defined]

---

---

## Programme-Wide Summary

### **Timeline Visual**

```
Year 1 (2026):
├─ Q1 (Jan-Mar): O1 Phase 1-2 (Architecture research + PoC start)
├─ Q2 (Apr-Jun): O1 Phase 2-4 (PoC complete, evaluate, harden) + O2 starts
├─ Q3 (Jul-Sep): O2 (Inbox + Lab tools development)
└─ Q4 (Oct-Dec): O2 continues + O3 starts (Care gaps)

Year 2 (2027):
├─ Q1 (Jan-Mar): O2 complete, O3 continues (Screening + Prescriptions)
├─ Q2 (Apr-Jun): O3 continues + O4 starts (Dashboard + Patient comms)
├─ Q3 (Jul-Sep): O3 complete, O4 continues (Pilot prep)
└─ Q4 (Oct-Dec): O4 complete, Pilot launched
```

### **Budget Summary (All 4 Objectives)**

**To be calculated after all objectives drafted**

| Category | Amount (NZD excl. GST) |
|----------|------------------------|
| **Founder R&D Labour** | TBD hours @ $96/hr |
| **Developer R&D Labour** | TBD hours @ $72/hr |
| **Capability Development** | TBD hours @ $96/hr (must be ≥5% of grant) |
| **Materials & Consumables** | $200/month × 24 months |
| **Professional Services (IP)** | $6,000 - $10,000 |
| **Conference Travel** | $3,200 - $5,000 |
| **Hardware & Depreciation** | $2,600 - $5,000 |
| **Total Eligible Costs** | **~$200,000 (target)** |
| | |
| **Grant (40%)** | **~$80,000** |
| **Co-Funding (60%)** | **~$120,000** |

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
