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
> Can we build a NZ-sovereign, cost-effective ($5-10k/month), multi-task clinical AI system that achieves 70-80% of GPT-4 quality for 50+ NZ-specific GP workflow tools with risk-appropriate architectures for different feature complexity levels?

**R&D Approach:** Systematic, iterative architecture validation across 4 objectives with increasing risk levels. Each objective validates architectural approaches appropriate for its risk level, building on learnings from previous objectives.

---

## Objective 1: Flexible Foundation & Initial Architecture Validation

**Timeline:** Months 1-8 (Jan 2026 - Aug 2026)

**Rationale:** Don't assume one architecture fits all use cases. Build flexible foundation that supports simple→complex approaches, then systematically validate what works for each risk level.

---

### **Core R&D Uncertainties**

**Primary Uncertainty:**
> What foundational capabilities and architectural flexibility do we need to support 50+ clinical tools ranging from simple classification (low-risk) to safety-critical decision support (high-risk)?

**Secondary Uncertainties:**
1. **Can simple classifiers suffice for low-risk admin tasks?** (vs expensive LLM overhead)
2. **Where is hybrid LLM+Rules required?** (vs pure LLM or pure rules)
3. **What safety mechanisms prevent clinical errors?** (deterministic validation, hard stops, multi-layer checking)
4. **Can small models achieve GPT-4 quality on NZ-specific tasks?** (or do we need larger models/commercial APIs?)

**Why this is genuine R&D:**
- No published solution for healthcare AI supporting simple→complex tasks in one system
- Unknown: Optimal architecture mix for different risk levels
- Unknown: Trade-offs between accuracy, cost, safety across approaches
- Unknown: Can we build unified system without one-size-fits-all architecture?

---

### **Hypothesis-Driven Approach**

**Primary Hypothesis:**
> "A flexible, modular architecture supporting simple classifiers (low-risk) through hybrid LLM+Rules (medium-risk) to multi-layer validation (high-risk) can achieve ≥85% average accuracy across all use cases while maintaining cost ≤$0.05/request."

**Secondary Hypotheses:**
- **H1:** Simple classifiers (BERT, DistilBERT) sufficient for admin tasks (≥90% accuracy, $0.002/request)
- **H2:** Hybrid LLM+Rules required for clinical calculations (≥95% CVDRA accuracy, prevents hallucination)
- **H3:** Multi-layer validation (Rules→LLM→Hard stops) required for prescription safety (≥95% error detection)
- **H4:** Small models (7B-13B) can achieve 70-80% of GPT-4 quality for NZ-specific tasks

**Tests in O1:**
- Test H1 on inbox triage (simple classifier vs LLM)
- Test H2 on CVDRA calculation (LLM-only vs rules-only vs hybrid)
- Test H3 on prescription validation (single layer vs multi-layer)
- Test H4 by benchmarking all approaches vs GPT-4

---

### **Approach: Build Flexible Foundation, Validate Range of Architectures**

#### **Phase 1: Literature Review & Architecture Framework Design (Months 1-2)**

**Systematic evaluation of 5 architectural approaches:**

| Approach | Best For | Cost | Safety | Complexity | NZ Healthcare Examples |
|----------|----------|------|--------|------------|------------------------|
| Simple Classifiers (BERT) | Admin tasks | $0.001/req | Medium | Low | None found |
| Small LLM (7B-13B) | Unstructured text | $0.02/req | Medium | Medium | DocOA (OA domain) |
| Hybrid (LLM+Rules) | Clinical + calculations | $0.015/req | High | Medium | NHS, Mayo Clinic |
| MoE (Multi-expert) | Multi-task systems | $0.03/req | High | High | Mixtral 8x7B |
| Commercial API (GPT-4) | Gold standard | $0.15/req ❌ | High | Low | Many pilots |

**Key Finding from Literature:**
- **No one-size-fits-all in healthcare AI**
- Different risk levels warrant different approaches
- Cost scales with complexity (simple tasks shouldn't use expensive models)
- Safety-critical features need deterministic validation layers

**Framework Design Decision:**
Build **modular foundation** supporting all approaches:
```
┌─────────────────────────────────────────────┐
│     Medtech FHIR Integration Layer          │
│  (Read inbox, patient data, observations)   │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│     Data Normalization & Routing Layer      │
│  (Handle regional variations, route tasks)  │
└──────┬──────────────────────────┬───────────┘
       │                          │
   ┌───▼────────┐          ┌──────▼─────────┐
   │ Simple     │          │ Complex        │
   │ Classifiers│          │ LLM+Rules      │
   │ (BERT)     │          │ (Hybrid/MoE)   │
   └───┬────────┘          └──────┬─────────┘
       │                          │
       └──────────┬───────────────┘
                  │
          ┌───────▼────────┐
          │  Safety Layer  │
          │ (Prohibited    │
          │  claim checks) │
          └───────┬────────┘
                  │
          ┌───────▼────────┐
          │ Medtech Widget │
          │ (GP Interface) │
          └────────────────┘
```

**Why Modular:**
- O2 can use simple classifiers for inbox (fast, cheap)
- O3 can use hybrid for clinical tasks (accurate, safe)
- O4 can add multi-layer validation (safety-critical)
- All share: Data layer, safety layer, UI layer

**Deliverables:**
- ✓ Literature review (20-30 pages, 10+ academic citations)
- ✓ Architecture comparison matrix (5 approaches evaluated)
- ✓ Modular framework design document
- ✓ Technical risk register (initial risks identified)

---

#### **Phase 2: Range Testing - Validate Architectural Hypotheses (Months 3-5)**

**Test 3 representative use cases with MULTIPLE architectural approaches to validate optimal fit:**

**Use Case 1: Inbox Triage (Low-Risk Admin Classification)**
- **Dataset:** 1,000 synthetic NZ inbox items (labs, letters, referrals, scripts, admin)
- **Regional variations:** LabTests Auckland, SCL, Medlab formats
- **Target:** ≥90% classification accuracy, P95 latency <3.0s, cost <$0.005/request

**Architecture Tests:**
| Approach | Week | Expected Accuracy | Expected Cost | Hypothesis |
|----------|------|-------------------|---------------|------------|
| BERT Classifier | 3-4 | 88-92% | $0.001/req | H1: Simple sufficient |
| Small LLM (7B) | 5-6 | 91-94% | $0.02/req | Better but expensive? |
| MoE | 7-8 | 93-95% | $0.03/req | Overkill for admin? |

**Evaluation Criteria:**
- **If BERT ≥90%:** Use for O2 (cost-effective)
- **If BERT <90%, LLM ≥90%:** Use LLM for O2 (accuracy worth cost)
- **If both <90%:** Need MoE or rethink approach

**Comparative Baseline:** GPT-4 on same dataset (gold standard)

---

**Use Case 2: CVDRA Calculation (Medium-Risk Clinical)**
- **Dataset:** 500 synthetic lipid panels with patient context (age, sex, ethnicity, smoking, BP, diabetes)
- **Target:** ≥95% CVDRA calculation accuracy (safety-critical), ≥85% treatment recommendation accuracy

**Architecture Tests:**
| Approach | Week | CVDRA Accuracy | Recommendation Accuracy | Safety |
|----------|------|----------------|-------------------------|--------|
| LLM-only | 3-4 | 75-85% ❌ | 80-85% | Hallucination risk |
| Rules-only | 5-6 | 100% ✅ (but brittle) | N/A | Safe but inflexible |
| Hybrid (LLM→Rules) | 7-8 | 95-98% ✅ | 85-90% ✅ | **Hypothesis H2** |

**Evaluation Criteria:**
- **If LLM-only <95%:** Confirms H2 (hybrid required)
- **If rules-only works:** Consider for O3 calculations
- **If hybrid ≥95%:** Use for O3 clinical features

**Safety Test:** Deliberately inject erroneous inputs (wrong ethnicity, extreme values) - does approach catch errors?

---

**Use Case 3: Prescription Validation (High-Risk Safety-Critical)**
- **Dataset:** 200 prescriptions (100 with known errors from RNZ report + 100 correct)
- **Target:** ≥95% error detection, ≤5% false positives, 100% critical error detection

**Architecture Tests:**
| Approach | Week | Known Errors | Novel Errors | False Positives | Critical Errors |
|----------|------|--------------|--------------|-----------------|-----------------|
| Rules-only | 3-4 | 85% | 20% ❌ | 2% ✅ | 100% ✅ |
| LLM-only | 5-6 | 70% ❌ | 85% | 15% ❌ | 95% ❌ |
| Multi-layer (Rules→LLM) | 7-8 | 95% ✅ | 90% ✅ | 5% ✅ | 100% ✅ |

**Evaluation Criteria:**
- **If rules-only ≥95%:** Simpler is better (use for O4)
- **If LLM catches novel errors rules miss:** Multi-layer needed (confirms H3)
- **If multi-layer ≥95% + 100% critical:** Use for O4 prescriptions

**Safety Gate:** If any approach allows critical error through, MUST use multi-layer for O4.

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

#### **Phase 3: Architecture Decision Based on Results (Month 6)**

**Analyze results from Phase 2 range testing:**

**Decision Matrix:**
| Use Case | Winning Approach | Accuracy | Cost | Learning for Next Objective |
|----------|------------------|----------|------|------------------------------|
| Inbox Triage | TBD (BERT/LLM/MoE) | TBD% | $TBD/req | Informs O2 starting point |
| CVDRA | TBD (LLM/Rules/Hybrid) | TBD% | $TBD/req | Informs O3 clinical features |
| Prescriptions | TBD (Rules/LLM/Multi) | TBD% | $TBD/req | Informs O4 safety approach |

**Expected Outcomes (Based on Literature + Initial Tests):**
- Inbox: BERT likely sufficient (90%+, $0.001/req) → **O2 starts with simple classifiers**
- CVDRA: Hybrid required (LLM-only hallucinates, rules-only brittle) → **O3 uses hybrid**
- Prescriptions: Multi-layer needed (catches 95%+ errors) → **O4 builds multi-layer**

**Key Learning Outputs:**
1. **Architecture Recommendations Document:**
   - Low-risk features: Use simple classifiers (cost-effective)
   - Medium-risk features: Use hybrid LLM+Rules (accuracy + safety)
   - High-risk features: Use multi-layer validation (safety-critical)

2. **Comparative Baselines Report:**
   - Our approaches vs GPT-4 (quality gap quantified)
   - Cost comparison (our approach vs Azure OpenAI at scale)
   - Latency comparison (our approach vs commercial APIs)

3. **Failure Mode Analysis:**
   - Where did each approach fail? (specific error types)
   - What improvements needed for O2/O3/O4?
   - Risk areas requiring extra validation

**Stage-Gate Decision:**
- ✅ **Proceed to Phase 4 if:** At least one approach meets targets for each use case
- ⚠️ **Pivot if:** None meet safety targets (re-evaluate architectural options)
- ❌ **Stop if:** Fundamental technical barriers (unlikely given literature evidence)

**Deliverables:**
- ✓ Evaluation report (all 9 architecture tests documented with results)
- ✓ Architecture recommendations for O2/O3/O4 (evidence-based)
- ✓ Technical risk register updated (new risks from testing identified)
- ✓ GPT-4 benchmark comparison (quality gap quantified: "Small model 88% vs GPT-4 92% = 4pp")

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

### **Learnings Feed Forward to O2/O3/O4**

**O1 → O2 (Admin Automation):**
- **Architecture:** If BERT ≥90% for inbox → O2 starts with lightweight classifiers (not LLM)
- **Context window:** If >512 tokens doesn't improve accuracy → O2 designs for shorter contexts
- **Cost benchmark:** O1 establishes acceptable cost per request → O2 targets same or lower
- **Regional formats:** O1 identifies which lab formats are problematic → O2 prioritizes those

**O1 → O3 (Clinical Intelligence):**
- **Hybrid approach:** If LLM-only hallucinates on CVDRA → O3 must use hybrid LLM+Rules for all calculations
- **Temporal logic:** If rules 100% accurate for date calculations → O3 uses rule engine for recalls, not LLM
- **Multi-condition:** If single model struggles with interactions → O3 builds separate logic layer

**O1 → O4 (Clinical Decision Support):**
- **Multi-layer validation:** If single-layer misses errors → O4 starts with multi-layer architecture
- **Deterministic-first:** If rules catch 85% of known patterns → O4 uses rules as first line, LLM as backup
- **Hard stops:** If critical errors detected in O1 → O4 implements mandatory hard stops for safety

**What We DON'T Know (O1 Unknowns Inform Later Objectives):**
1. Real-world accuracy degradation (O1 uses synthetic data → O2/O3 sandbox → O4 pilot reveals drop)
2. GP acceptance of AI suggestions (O1 technical only → O4 pilot measures actual usage)
3. Alert fatigue threshold (O1 can't test → O4 pilot discovers "3 alerts/patient max")
4. Edge cases not in synthetic data (O1 limited → O2/O3 sandbox → O4 pilot finds real failures)

---

### **Measurable Deliverables (End of Month 8)**

**Research & Decision:**
- ✓ Literature review (20-30 pages, 10+ academic citations)
- ✓ Modular architecture framework design document
- ✓ Architecture recommendations for O2/O3/O4 (evidence-based from range testing)
- ✓ Comparative baseline report (vs GPT-4, Azure OpenAI costs, latency)

**Foundation System:**
- ✓ Modular foundation deployed supporting simple→complex architectures
- ✓ Tested 9 architectural approaches (3 use cases × 3 approaches each)
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

1. ✅ **Range testing completed:** 9 architectural approaches tested (3 use cases × 3 approaches)
2. ✅ **Evidence-based recommendations:** Architecture recommendations for O2/O3/O4 documented with data
3. ✅ **Flexible foundation deployed:** Modular system supporting simple→complex architectures operational
4. ✅ **Safety targets met:** Prohibited-claim ≤0.5%, refusal ≥95% (baseline safety framework)
5. ✅ **Hypotheses validated:** H1-H4 tested, results documented (accept/reject each hypothesis)
6. ✅ **Comparative baselines established:** Quality gap vs GPT-4 quantified, cost comparison vs Azure OpenAI
7. ✅ **Learnings documented:** Clear feed-forward learnings for O2/O3/O4 (what worked, what didn't)
8. ✅ **Medtech integration functional:** Can read data, normalize regional formats, display results in sandbox

**Stage-Gate to Objective 2:**
- At least one approach met targets for each use case (otherwise cannot proceed)
- Architecture recommendation for low-risk features documented (O2 starting point clear)
- Foundation system stable (no show-stopper technical issues)
- Safety framework operational (monthly regressions, hard stops tested)

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

## Objective 2: Admin Automation + Lightweight Architecture Validation (Low Complexity / Low Risk)

**Timeline:** Months 6-14 (Jun 2026 - Feb 2027)

**Rationale:** Start with high-value, low-risk features to prove AI system works on simple tasks before tackling safety-critical clinical features. **Validate O1 hypothesis:** Simple classifiers sufficient for admin tasks. Build confidence and momentum.

---

### **Core R&D Uncertainties**

**Primary Uncertainty:**
> Can AI accurately classify and process heterogeneous NZ administrative data (inbox items, hospital letters, normal results) with sufficient reliability for autonomous filing and triage using lightweight (cost-effective) architectures?

**Secondary Uncertainties:**
1. **Is simple classifier sufficient?** (O1 predicted BERT ≥90% - validate in production features)
2. **What confidence threshold for auto-filing?** (95%? 98%? 99% - safety vs workload trade-off)
3. **Do regional lab variations require format-specific models?** (or can one model handle all?)
4. **Does auto-filing reduce cognitive load or create anxiety?** ("Did AI miss something?")

**Why this is R&D:**
- Unknown: Can lightweight approach scale from O1 PoC to full production features
- Unknown: Real-world accuracy vs O1 synthetic data (expect 5-10pp drop)
- Unknown: Optimal confidence thresholds for autonomous actions (not established in literature)
- Unknown: GP acceptance of AI autonomous filing (human factors, not just technical)

---

### **Hypothesis-Driven Approach**

**Primary Hypothesis (From O1):**
> "Simple classifiers (BERT/DistilBERT) can achieve ≥90% accuracy for admin classification tasks at $0.002/request, making expensive LLMs unnecessary for low-risk features."

**O2-Specific Hypotheses:**
- **H1:** Inbox classification: BERT achieves ≥90% accuracy on real production inbox data (vs O1 synthetic)
- **H2:** Auto-filing safety: 98% confidence threshold prevents inappropriate auto-filing (≤1% error rate)
- **H3:** Regional normalization: Single model handles all NZ lab formats with <5% accuracy degradation
- **H4:** Letter extraction: Rule-based parsing ≥85% accurate for NZ hospital letters (DHB templates are structured)

**Architecture Validation in O2:**
**Test:** Does O1's recommendation (simple classifiers) hold in production features?
- Week 6-8: Deploy BERT for inbox triage
- Week 9-10: Measure accuracy, cost, latency vs O1 predictions
- Decision: If <90%, escalate to LLM; if ≥90%, confirm hypothesis

---

### **Technical Unknowns (O2 Will Resolve)**

1. **Unknown:** Accuracy degradation from synthetic (O1) to real data (O2)?
   - O1 used clean synthetic data → O2 uses messy real inbox items
   - Hypothesis: 5-10pp drop expected
   - How we'll find out: Compare O1 BERT (on synthetic) vs O2 BERT (on real Medtech sandbox data)

2. **Unknown:** Optimal auto-filing confidence threshold?
   - Too high (99%): Saves little GP time (most items flagged for review)
   - Too low (90%): Risk of inappropriate filing (miss urgent items)
   - How we'll find out: A/B test thresholds (95%, 97%, 99%) in sandbox, measure false positives vs workload reduction

3. **Unknown:** DHB letter format coverage?
   - O1 tested 3 major labs → O2 adds 20+ DHB letter formats
   - Some DHBs use unstructured letters (harder to parse)
   - How we'll find out: Collect letter templates from all DHBs, test extraction accuracy per DHB

4. **Unknown:** GP trust in auto-filing?
   - Technical accuracy ≠ GP acceptance
   - GPs may distrust AI, review all auto-filed items anyway (defeats purpose)
   - How we'll find out: Sandbox usability testing with 5 GPs, measure actual review rates

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

### **Failure Modes & Pivot Plans**

**Failure 1: BERT accuracy <90% on real data (O1 hypothesis fails)**
- **Diagnosis:** Which inbox types failing? (Letters vs labs vs referrals?)
- **Pivot A:** Add contextual features (sender, subject line, patient history)
- **Pivot B:** Escalate to small LLM (7B) - still cheaper than GPT-4
- **Pivot C:** Use BERT for simple types (labs), LLM for complex (letters) - hybrid within O2

**Failure 2: Auto-filing creates GP anxiety (technical success, human failure)**
- **Diagnosis:** GP interviews reveal distrust despite 98% accuracy
- **Pivot A:** Change to "suggested filing" (GP one-click approve, not autonomous)
- **Pivot B:** Add explanation ("Filed as normal because HbA1c 38, within range 20-42")
- **Pivot C:** Limit to specific item types (normal screening only, not all results)

**Failure 3: Regional lab variations too extreme (>10% accuracy drop)**
- **Diagnosis:** Which regions causing failures?
- **Pivot A:** Build lab-specific parsers (one model per major lab)
- **Pivot B:** Partner with labs to standardize formats (political solution)
- **Pivot C:** Fallback to manual review for unknown formats, auto-file known only

**Failure 4: DHB letter extraction <85% accurate**
- **Diagnosis:** Structured vs unstructured letter analysis
- **Pivot A:** Use rule-based parsing for structured DHBs (template-based)
- **Pivot B:** Use LLM only for unstructured DHBs (minority of cases)
- **Pivot C:** Extract key phrases only (not full structured data)

---

### **Learnings Feed Forward to O3/O4**

**O2 → O3 (Clinical Intelligence):**
- **If BERT worked:** Lightweight classifiers proven for simple tasks → O3 uses for screening eligibility (rule-based)
- **If confidence threshold = 98%:** Same threshold for O3 care gap alerts (consistent user experience)
- **If regional normalization succeeded:** Apply same approach to clinical data variations in O3
- **If GPs wanted explanations:** O3 must provide clinical rationale for all suggestions (not just classification)

**O2 → O4 (Clinical Decision Support + Pilot):**
- **GP trust findings:** If O2 reveals distrust issues → O4 pilot includes trust-building measures (transparency, explanations)
- **Auto-filing learnings:** If autonomous actions accepted → O4 can be more autonomous; if rejected → O4 stays assist-only
- **Workflow integration:** If O2 discovers optimal UI patterns → O4 applies to prescription validation interface

---

### **Risk Mitigation**

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Regional lab formats more varied than expected** | Medium | Medium | O1 already covers 3 major labs; expand dataset if needed; fallback to manual review for unknown formats; see Pivot Plans above |
| **Auto-filing confidence threshold unclear** | Medium | High | Start conservative (high confidence required); A/B test thresholds; iteratively lower as safety proven |
| **Medtech API limitations discovered** | Low | High | Early integration (Month 10) catches issues; Medtech partnership for support |
| **GP sandbox feedback reveals workflow mismatch** | Medium | Medium | Iterative testing with 5 GPs throughout development; adjust UI based on feedback; Pivot Plans documented |

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
