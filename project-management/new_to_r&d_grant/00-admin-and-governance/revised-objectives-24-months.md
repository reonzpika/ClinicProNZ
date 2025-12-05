# R&D Objectives – ClinicPro AI (Inbox + Care Gaps)

**Project Duration:** 24 months (Jan 2026 – Jan 2028)

**Overall Goal:** Systematically investigate which architectural paradigms (from simple pattern recognition to sophisticated reasoning systems) achieve clinical safety, NZ-contextual accuracy, and cost-effectiveness under combined constraints (sovereignty, equity, multi-PMS, real-time performance).

**Research Approach:** Two clinical testbeds (Inbox Helper for routine task automation and Care Gap Finder for multi-condition clinical reasoning) enable controlled investigation of architectural performance across different task characteristics and risk levels.

**Core Research Questions:**
- Do task characteristics predict optimal architectural paradigm, or are selection patterns unpredictable without empirical investigation?
- Whether domain adaptation suffices for NZ healthcare system context (guidelines, lab formats, clinical pathways), or do these contextual differences require architectural modifications?
- Will architectural approaches generalise across PMSs (Medtech, Indici), or will system-specific adaptations emerge as necessary?
- How do safety mechanisms interact with different paradigms, and what failure modes emerge in real clinical deployment?

---

## High-Level Timeline (Research Phases)

**Months 1–6:** Foundation phase – Investigate architectural paradigm performance on synthetic NZ clinical data; establish experimental infrastructure across Medtech and Indici.

**Months 4–12:** Routine task automation research – Inbox Helper testbed validates architectural approaches for low-risk clinical tasks; investigate confidence thresholds, UI trust patterns, real-world performance degradation.

**Months 7–16:** Complex reasoning research – Care Gap Finder testbed validates paradigms for multi-condition clinical calculations; investigate equity-preserving algorithms, multi-system generalisation patterns.

**Months 16–24:** Advanced R&D – Investigate lab-to-clinic translation patterns, safety-architecture interaction effects, multi-practice generalisation, real-world failure mode taxonomy.

---

## Programme Overview Note

**Research Posture:** This is genuine R&D with systematic investigation of unknowns. Architectural paradigm selection, domain adaptation effectiveness, multi-system generalisation patterns, and safety-architecture interactions cannot be deduced from existing knowledge; they require empirical investigation under real clinical constraints.

**Clinical Testbeds as Research Instruments:** Inbox Helper and Care Gap Finder serve as controlled experimental environments for investigating architectural performance across different task characteristics (routine vs complex, single-condition vs multi-condition, deterministic vs probabilistic). Working prototypes released to early adopters (once safety thresholds met) provide real-world data for investigating lab-to-clinic translation patterns, research that cannot be conducted in synthetic environments.

**Knowledge Outputs:** Primary deliverables are research knowledge (architectural performance boundaries, generalisation patterns, failure mode taxonomy, equity algorithm designs) documented for sector-wide use. Secondary deliverables are working clinical tools validating research findings while addressing GP workforce crisis.

**Link to Long-Term Vision:** Research knowledge (architectural paradigm performance, safety frameworks, equity algorithms) transfers directly to patient-facing AI (HealthHub NZ, Years 3–5), where safety requirements intensify and architectural decisions become more critical. This 24-month project establishes foundational knowledge enabling responsible patient-facing deployment.

---

## Objective 1 – Architectural Paradigm Investigation on Synthetic NZ Clinical Data (Months 1–6)

### Plain-English Aim

Systematically investigate which architectural paradigms (from simple pattern recognition through sophisticated reasoning systems including emerging approaches like agentic AI and retrieval-augmented generation) achieve target performance under combined constraints, using synthetic NZ clinical data to enable rapid experimentation without patient risk.

### Key R&D Questions

**Primary Uncertainty:**
- Do architectural paradigms exhibit predictable performance boundaries under combined clinical constraints (safety + real-time + cost + NZ sovereignty + equity), or does performance depend on unpredictable interactions between paradigm characteristics and task properties?

**Cascading Research Questions:**
1. Whether domain adaptation techniques (fine-tuning, prompt engineering, retrieval augmentation) suffice for NZ healthcare system context (bpac/MoH guidelines, regional lab formats with NZ reference ranges, ACC/PHO documentation patterns, local clinical pathways), or do these contextual differences require architectural modifications?

2. Do simpler paradigms (pattern classifiers, rule-based systems) achieve sufficient accuracy for routine clinical tasks, or does NZ healthcare system variability and context-dependence necessitate more sophisticated reasoning architectures?

3. How does architectural complexity affect failure modes? Do simpler systems fail predictably while complex systems exhibit emergent failures, or are failure patterns unpredictable without empirical investigation?

4. Can architectural approaches be designed for multi-system generalisation (Medtech, Indici), or will PMS-specific data characteristics force system-specific implementations?

### Research Activities

#### NZ Clinical Corpus Development

**Purpose:** Create NZ-specific training and evaluation datasets capturing healthcare system characteristics, guideline variations, and lab format diversity unavailable in international datasets.

**Activities:**
- Curate NZ clinical corpus (≥10,000 pages): bpac.org.nz, MoH guidelines, Pharmac schedules, regional lab formats (LabTests, SCL, Medlab), ACC documentation, PHO quality frameworks
- Document NZ healthcare system characteristics: Regional lab reference ranges (NZ-specific normals), local abbreviations and documentation patterns, NZ guideline-specific clinical pathways, ACC/PHO terminology and workflows
- Generate synthetic datasets preserving NZ healthcare system properties:
  - ≥1,000 inbox items (labs, discharge letters, referrals, scripts, admin, patient messages)
  - ≥500 patient records with chronic conditions (diabetes, CVD, COPD, CHF, asthma)

#### Experimental Infrastructure

**Purpose:** Enable systematic comparison of architectural paradigms under controlled conditions.

**Build:**
- Modular evaluation framework supporting paradigm swapping (classifier → hybrid → LLM → agentic → RAG)
- Integration layer abstracting Medtech and Indici FHIR APIs for multi-system testing
- Performance measurement infrastructure: accuracy, latency, cost per request, failure mode logging
- Safety testing framework: prohibited claim detection, refusal appropriateness, PHI leakage prevention

#### Architectural Paradigm Investigation

**Purpose:** Discover which paradigm characteristics predict success under combined clinical constraints.

**Systematic Experiments:**

**Use Case 1: Inbox Triage (Routine Task, Deterministic)**
- Investigate paradigm spectrum: Simple classifier → Small LLM → Hybrid rules+LLM → RAG-augmented → Agentic multi-step
- Measure: Accuracy, confidence calibration, failure modes, cost, latency
- Research question: Does task simplicity enable lightweight paradigms, or does clinical context require sophisticated reasoning?

**Use Case 2: CVD Risk Calculation (Clinical Calculation, Multi-Factor)**
- Investigate paradigms: Rules-only → LLM-only → Hybrid rules+LLM → Agentic with verification → RAG with guideline retrieval
- Measure: Calculation accuracy, missing data handling, explanation quality, equity outcomes (Māori/Pacific risk stratification)
- Research question: Do deterministic calculations require rule-based approaches, or can learned approaches match accuracy while improving adaptability?

**Use Case 3: Clinical Note Extraction (Unstructured Data, High Variability)**
- Investigate paradigms: Named entity recognition → LLM extraction → RAG-augmented → Multi-agent verification
- Measure: Extraction accuracy on NZ healthcare documentation patterns, robustness to local abbreviations, handling of ACC/PHO-specific terminology
- Research question: Whether domain adaptation suffices for NZ healthcare system context or architectural modifications necessary?

**Research Approach:** Evidence-driven investigation where research follows empirical results, not predetermined architectural preferences. If emerging paradigms (e.g., agentic AI with tool use, advanced RAG patterns) demonstrate superior performance, investigation pivots accordingly.

#### Clinical Testbed Prototypes

**Purpose:** Establish working prototypes for Objectives 2-3 clinical validation.

**Build:**
- Inbox Helper prototype (using optimal paradigm from Use Case 1 investigation)
- Care Gap Finder prototype (using optimal paradigm from Use Cases 2-3 investigation)
- Widget shells for Medtech and Indici displaying AI outputs

**Note:** Prototypes are research instruments, not products; architectures may change based on Objectives 2-4 findings.

### Research Knowledge Deliverables by Month 6

**Primary Deliverables (Research Knowledge):**

1. **Architectural Paradigm Performance Report**
   - Quantified performance boundaries for investigated paradigms across combined constraints
   - Task characteristic analysis: Which properties (determinism, complexity, context-dependence) predict paradigm suitability?
   - Cost-performance trade-offs: Where do simpler paradigms suffice vs require sophisticated reasoning?
   - Failure mode taxonomy: How do different paradigms fail under NZ clinical data characteristics?

2. **NZ Healthcare System Context Analysis**
   - Documented NZ-specific characteristics affecting architectural performance: bpac/MoH guideline patterns, regional lab format variations, ACC/PHO terminology, local clinical pathway differences
   - Domain adaptation effectiveness: Where does fine-tuning/prompting suffice vs require architectural modifications?
   - Context handling patterns: How do paradigms handle NZ-specific reference ranges, local abbreviations, and regional documentation variations?

3. **Multi-System Generalisation Patterns (Preliminary)**
   - Architectural approaches enabling Medtech/Indici abstraction
   - Data format normalisation requirements
   - System-specific adaptations identified in synthetic testing

**Secondary Deliverables (Working Prototypes):**

4. **Foundation System v1.0**
   - Connected to Medtech and Indici sandbox environments
   - Modular architecture supporting paradigm experimentation
   - Achieving target accuracy on synthetic data: ≥90% inbox triage, ≥95% CVDRA calculation

5. **Clinical Testbed Prototypes**
   - Inbox Helper prototype processing synthetic inbox items
   - Care Gap Finder prototype calculating CVD risk and diabetes gaps on synthetic patients
   - Performance baselines established for Objectives 2-3 real-world validation

**Knowledge Transfer:**
- Architectural recommendations for Objectives 2-3 (evidence-based, not predetermined)
- Identified research questions requiring real clinical data (cannot be answered synthetically)

---

## Objective 2 – Apparently-Routine Clinical Task Automation: Discovering Hidden Complexity and Architectural Performance Under Real Clinical Constraints (Inbox Helper Testbed, Months 4–12)

### Plain-English Aim

Investigate which architectural paradigms safely automate apparently-routine clinical tasks (inbox triage, normal result handling, trend flagging) that contain hidden complexity and frequent edge cases. Validate synthetic data findings (Objective 1) under real clinical constraints and discover performance degradation patterns, architectural robustness boundaries, and safety-critical failure modes that cannot be studied synthetically.

### Why "Routine" Tasks Require R&D

Inbox triage appears routine but involves subtle clinical judgment that creates deceptive complexity. Edge cases occur frequently (5-15% of "routine" items) with patient harm potential:

- **Context-dependent clinical significance:** "Normal" PSA of 2.5 ng/mL is abnormal for patient who had total prostatectomy (should be undetectable)
- **Borderline normal results:** HbA1c 41 vs 42 mmol/mol (clinical significance depends on patient diabetes history, trending pattern)
- **Incidental findings in "normal" reports:** "Normal CXR. Incidental note: Previous thoracic surgery" (requires GP review despite "normal" classification)

Simple pattern matching fails catastrophically on edge cases (misses context); complex reasoning may be overconfident while hallucinating on edge cases; hybrid approaches exhibit emergent failure modes. Which paradigm characteristics predict safe performance on apparently-routine tasks with hidden complexity is unknowable without systematic investigation. Laboratory accuracy metrics don't reveal edge case robustness.

### Key R&D Questions

**1. Lab-to-Clinic Translation on Edge Cases:**
How much does architectural performance degrade from synthetic test sets to real clinical data containing unexpected edge cases? Which paradigm characteristics predict robustness vs catastrophic failure on rare but safety-critical scenarios?

**2. Confidence Calibration Across Paradigms:**
What confidence thresholds enable safe automation given that confidence semantics differ fundamentally? Classifier probabilities are calibrated; LLM confidence scores don't correlate with accuracy (known failure mode); hybrid systems exhibit emergent confidence behavior. Can universal safety thresholds exist, or must thresholds be paradigm-specific?

**3. Edge Case Detection:**
Can architectural paradigms reliably detect when apparently-routine tasks contain hidden complexity requiring human review? Do detection capabilities vary predictably by paradigm (classifiers miss context, LLMs hallucinate context), or must detection robustness be empirically validated?

**4. Real-World Failure Modes:**
What failure modes emerge in deployment that were absent in synthetic testing? Do edge case failures cluster by paradigm type, or are failure modes unpredictable without empirical observation?

### Research Activities

#### Clinical Testbed: Inbox Helper

**Purpose:** Controlled environment for investigating apparently-routine task automation with systematic edge case injection to test architectural robustness boundaries.

**Testbed Capabilities:**
- Triage and classification with urgency stratification, including edge cases (incidental findings, context-dependent significance like "normal" PSA post-prostatectomy)
- Safe automation with confidence-based human escalation for borderline normals, incidental findings, unexpected formats
- Patient communication generation with GP approval gates

**Research Instrumentation:**
- Performance logging: Overall accuracy, edge case detection rate, confidence distributions, false negative tracking
- Edge case injection: Systematic insertion of known edge cases to measure paradigm-specific detection capabilities
- Paradigm comparison: Architectural approaches tested on identical edge-case-enriched datasets


#### Multi-System Generalisation Investigation (Medtech vs Indici)

Deploy identical architecture to both Medtech and Indici sandbox environments; measure performance differences (accuracy, edge case detection, failure modes); investigate causes of variance (data format differences, API limitations). Research question: Do architectural paradigms exhibit consistent performance across systems, or do system characteristics force architectural adaptations?

#### Controlled Clinical Research Deployment (Research Partner Practices)

**Purpose:** Investigate research questions requiring authentic clinical contexts that cannot be replicated in sandbox environments.

Once minimum thresholds met (≥90% overall accuracy, ≥95% edge case detection, zero unsafe auto-filing), deploy to 3-5 research partner practices for systematic data collection.

**What Cannot Be Researched in Sandboxes:**
- Context-dependent edge cases emerging only in authentic workflows
- Multi-practice architectural robustness variation
- Performance under production constraints (time pressure, interruptions)
- Long-tail edge cases (rare but safety-critical scenarios)

**Research continues:** Architecture experimentation, edge case detection refinement, confidence threshold optimisation based on authentic failure modes.

### Research Knowledge Deliverables by Month 12

**Primary Deliverables (Research Knowledge):**

1. **Lab-to-Clinic Performance Translation Report**
   - Performance degradation: Overall vs edge case accuracy across paradigms
   - Predictive patterns: Which paradigm characteristics indicate edge case robustness vs brittleness

2. **Confidence Calibration Across Paradigms**
   - Confidence semantics by paradigm: Classifier calibration, LLM confidence-accuracy correlation, hybrid emergent patterns
   - Safe automation thresholds: Paradigm-specific or universal?

3. **Edge Case Detection Capabilities**
   - Detection performance by paradigm: Sensitivity, specificity, false negative rate
   - Escalation framework: Which edge case characteristics enable reliable detection

4. **Real-World Failure Mode Taxonomy**
   - Failure clustering by paradigm: Predictable vs emergent failures
   - Clinical risk assessment: Patient harm potential by failure type

5. **Multi-System Generalisation Patterns (Medtech vs Indici)**
   - Performance consistency vs variance across PMSs
   - Architectural characteristics enabling vs hindering generalisation

**Secondary Deliverables (Working Clinical Tool):**

6. **Inbox Helper Operational in Both PMSs**
   - Validated on ≥2,000 real inbox items (≥200 edge cases): ≥90% overall accuracy, ≥95% edge case detection
   - Deployed to 3-5 research partner practices
   - Workflow impact: ~30% inbox processing time reduction

**Knowledge Transfer:**
Architectural recommendations for Objective 3 based on edge case robustness findings. Research question: Does multi-condition complexity (Objective 3) amplify edge case frequency?

---

## Objective 3 – Multi-Condition Clinical Reasoning Research (Care Gap Finder Testbed, Months 7–16)

### Plain-English Aim

Investigate which architectural paradigms accurately perform multi-condition clinical reasoning while maintaining equity without algorithmic bias. Addresses complex reasoning challenges absent in routine task automation (Objective 2): unstructured data extraction, multi-factor clinical calculations, competing care needs prioritisation, and equity-preserving algorithm design.

### Key R&D Questions

**1. Paradigm Performance on Complex Reasoning:**
Do architectural paradigms achieving high accuracy on routine tasks (Objective 2) maintain performance on multi-condition reasoning, or does task complexity necessitate different paradigm characteristics?

**2. Unstructured Data Extraction:**
Can architectural approaches reliably extract clinical parameters from unstructured GP notes containing NZ healthcare documentation patterns (regional abbreviations, local terminology, contextual phrasing)?

**3. Multi-Condition Reasoning Complexity:**
Can architectural paradigms perform clinically appropriate prioritisation when patients have competing care needs (diabetes control vs CVD prevention vs CKD monitoring)? Do paradigms "reason" about clinical trade-offs or apply rigid rules? Can multi-condition reasoning match GP clinical judgment (target ≥85% concordance)?

**4. Equity-Preserving Algorithms:**
How can algorithms prioritise patients experiencing health inequities (Māori, Pacific, high-deprivation) without introducing harmful algorithmic bias? Do equity mechanisms interact with architectural paradigm choice?

### Research Activities

#### Clinical Testbed: Care Gap Finder

**Purpose:** Controlled environment for investigating multi-condition clinical reasoning and equity-preserving algorithms across architectural paradigms.

**Testbed Capabilities:**
Five chronic conditions (diabetes, CVD, COPD, CHF, asthma) provide testbed for multi-condition reasoning complexity, unstructured data extraction, clinical calculation accuracy, and equity-preserving prioritisation. Integrated with both Medtech and Indici PMSs.

**Research Instrumentation:**
- Clinical calculation verification: CVD risk, care gap detection vs GP audit (target ≥85% concordance)
- Extraction accuracy: Structured vs unstructured data, paradigm-dependent performance
- Equity outcome tracking: Patient prioritisation by ethnicity, deprivation, clinical risk
- Multi-condition reasoning evaluation: Clinician override patterns, priority ranking validation

#### Equity-Preserving Algorithm Research

**Purpose:** Design algorithms prioritising patients experiencing inequities without introducing harmful biases, addressing Te Tiriti obligations.

**Investigate Three Equity Approaches:**
- **Explicit prioritisation:** Māori/Pacific patients flagged earlier for same clinical risk (corrects systemic under-screening)
- **Risk model calibration:** Ethnicity-specific thresholds reflecting differential baseline risk (follows PREDICT-CVD NZ approach)
- **Equity-blind with deprivation:** Use deprivation quintile as proxy (avoids ethnic profiling but may miss equity gaps)

**Bias Detection:**
Audit architectural paradigms for bias. Do LLM-based approaches absorb training data biases? Do rule-based approaches maintain equity by design? Test edge cases: Māori patient with atypical presentation, Pacific patient with missing ethnicity data. Measure false negative rates by ethnicity.

**Research Questions:**
Which equity patterns achieve equitable outcomes without harmful stereotyping? How do equity mechanisms interact with architectural paradigm choice?

#### Multi-System Generalisation Investigation

Deploy identical architecture to both Medtech and Indici; measure performance variance (extraction accuracy, calculation accuracy). Research question: Does architectural generalisation hold for complex tasks, or do generalisation patterns differ by task complexity?

#### Controlled Clinical Research Deployment

Release lean MVP (diabetes + CVD) once core targets met (≥95% CVDRA accuracy, ≥85% care gap detection), then expand to COPD/CHF/asthma while continuing research. Enables equity outcome measurement and multi-practice variation investigation unavailable in sandbox testing.

### Research Knowledge Deliverables by Month 16

**Primary Deliverables (Research Knowledge):**

1. **Paradigm Performance on Complex Reasoning**
   - Performance comparison: Routine tasks (Objective 2) vs complex multi-condition reasoning
   - Task complexity characteristics predicting paradigm suitability

2. **Unstructured Data Extraction Patterns**
   - NZ healthcare documentation handling by paradigm
   - Domain adaptation effectiveness: Where fine-tuning suffices vs architectural modifications required

3. **Multi-Condition Clinical Reasoning Capabilities**
   - Clinician agreement analysis: Which approaches achieve ≥85% GP audit concordance
   - Reasoning patterns: Rule-based vs learned approaches

4. **Equity-Preserving Algorithm Design Patterns**
   - Documented equity approaches with measured outcomes (screening rates by ethnicity)
   - Te Tiriti-compliant AI design principles: Prioritising Māori/Pacific without harmful bias
   - Architectural-equity interaction effects

5. **Multi-System Generalisation on Complex Tasks**
   - Generalisation validation: Do Objective 2 findings hold for complex reasoning
   - System-specific performance variance: Medtech vs Indici

**Secondary Deliverables (Working Clinical Tool):**

6. **Care Gap Finder Operational in Both PMSs**
   - Validated on ≥1,000 patient records: ≥95% CVDRA accuracy, ≥85% care gap detection
   - Deployed to research partner practices (staged: diabetes/CVD first, then COPD/CHF/asthma)
   - Demonstrated equity outcomes: Māori/Pacific prioritisation without bias

**Knowledge Transfer:**
Architectural recommendations for Objective 4 based on complex reasoning validation. Equity algorithm patterns transferable to patient-facing AI (Years 3-5) and broader health sector.

---

## Objective 4 – Multi-Practice Generalisation and Real-World Failure Mode Research (Months 16–24)

### Plain-English Aim

Investigate whether architectural paradigms validated in controlled environments (Objectives 1-3) generalise across diverse real-world conditions by discovering performance degradation patterns, safety-architecture interaction effects, and real-world failure modes. This is the "hardest" R&D: understanding what makes AI systems robust vs brittle in authentic clinical practice.

### Key R&D Questions

**Multi-Practice Generalisation Patterns:**
1. How much does architectural performance vary across practices with different patient populations (urban/rural, ethnic composition, deprivation), clinician workflows (GP vs nurse-led, proactive vs reactive), and practice characteristics (size, PMS choice, IT maturity)?

**Lab-to-Clinic Translation at Scale:**
2. Do performance patterns observed in early adopter practices (Objectives 2-3) predict performance in new practices, or are degradation patterns practice-specific and unpredictable?

**Safety-Architecture Interaction Effects:**
3. How do safety mechanisms (refusal scaffolds, confidence thresholds, prohibited claim detection) interact with architectural paradigm characteristics under real clinical workload, and what emergent failure modes occur?

**Real-World Failure Mode Discovery:**
4. What failure modes emerge in multi-practice operational deployment that were absent in controlled validation, and which architectural characteristics predict failure robustness vs brittleness?

### Research Activities

#### Multi-Practice Structured Pilots (10-20 GP Practices)

**Purpose:** Systematic investigation of architectural generalisation across diverse real-world conditions. This is R&D on generalisation patterns, not commercial rollout.

**Research Design:**
- **Controlled deployment:** 10-20 practices selected for diversity (urban/rural, Medtech/Indici, ethnic composition, deprivation quintiles, practice size)
- **Systematic measurement:** Identical performance metrics across all practices enable comparison (accuracy, safety, usage patterns, clinical outcomes)
- **Longitudinal tracking:** Performance monitored over 6-8 months to detect degradation over time vs stable operation

**Practice Selection Criteria (Research-Driven):**
Systematic diversity across PMS choice (60/40 Medtech/Indici), geography (urban/regional/rural), ethnic composition (high Māori/Pacific vs predominantly NZ European), deprivation quintiles (Q1-Q5), practice size, and clinical workflows.

#### Research Approach

Systematic deployment across 10-20 diverse practices with identical performance metrics enables controlled investigation of generalisation patterns. Measure performance variance (accuracy, safety, usage), investigate causes (patient population, workflow, practice characteristics), document failure modes, validate equity outcomes, and quantify lab-to-clinic translation patterns. Longitudinal tracking over 6-8 months reveals temporal robustness.

#### Temporal Robustness Investigation

Monitor performance over 6-8 months to detect drift patterns. Research question: Do architectural paradigms maintain performance over time (temporal robustness), or does drift necessitate continuous retraining/recalibration?

### Research Knowledge Deliverables by Month 24

**Primary Deliverables (Research Knowledge):**

1. **Multi-Practice Generalisation Pattern Analysis**
   - Quantified performance variation across 10-20 practices and practice characteristic effects
   - Architectural paradigm generalisation boundaries (robust vs brittle)

2. **Lab-to-Clinic Translation Pattern Documentation**
   - Degradation analysis: Synthetic → controlled → operational performance
   - Paradigm-specific translation robustness patterns

3. **Safety-Architecture Interaction Effects and Failure Mode Taxonomy**
   - Safety mechanism performance under operational workload
   - Comprehensive failure mode documentation across practices

4. **Equity Outcome Validation at Scale**
   - Māori/Pacific screening rate changes and care gap closure by ethnicity
   - Equity algorithm robustness across diverse practices

5. **Architectural Paradigm Robustness Analysis**
   - Real-world performance comparison across diverse conditions
   - Temporal robustness: Drift patterns over 6-8 months

6. **Multi-PMS Generalisation Validation**
   - Performance consistency vs variance across Medtech/Indici at scale

**Secondary Deliverables (Operational Validation):**

7. **Production-Grade System Across 10-20 Practices**
   - Inbox Helper and Care Gap Finder operational across diverse conditions
   - Measured clinical impact: Time savings, care gaps closed, equity outcomes, safety record

8. **Final R&D Report**
   - Comprehensive research findings synthesised
   - Architectural recommendations for NZ health AI sector

**Knowledge Transfer:**
Research outputs transferable to PHOs, Te Whatu Ora, health AI developers, and government agencies. Architectural paradigm knowledge enables evidence-based development for entire NZ health AI sector.

---

## Future Roadmap (Years 3–5)

**Vision:** By Year 5, any New Zealander can access personalised health guidance powered by NZ-sovereign AI, improving health outcomes nationwide.

**Core R&D Project: NZ Health Intelligence Layer (Years 3-5)**

The 24-month grant validates NZ-trained LLM for GP-facing tools. Years 3-5 extend this to patient-facing care and national-scale learning.

### 1. Patient-Facing AI (HealthHub NZ) - Years 3-4

Patients access complete health records (diagnosis, medications, test results, hospital visits) with AI guidance on their phones.

**AI R&D questions:**
- How do you train NZ-LLM to communicate medical information safely across different health literacy levels (18-year-old vs 75-year-old vs te reo speaker)?
- Can NZ-LLM validate patient-entered data (blood pressure readings) by learning clinical patterns?
- What AI safety thresholds determine "book GP appointment" vs "go to ED now"?

**Benefits:** Rural patients get after-hours guidance (fewer unnecessary ED visits), chronic disease patients monitor at home, better engagement improves outcomes.

### 2. AI Learning From Real-World Outcomes - Years 4-5

Train NZ-LLM on aggregated patient outcomes to improve recommendations.

**AI R&D questions:**
- Can NZ-LLM learn from thousands of diabetes patients' outcomes to identify which interventions actually work?
- Can AI identify emerging health trends (e.g., "South Auckland diabetes screening rates dropping 15%, intervention needed")?
- How do you train AI on real-world data while preventing dangerous pattern learning?

**Benefits:** AI recommendations improve based on actual NZ patient outcomes, not just international guidelines. Evidence-based insights for government health planning.

### 3. National Scale Integration - Years 4-5

Extend beyond Medtech/Indici to hospital systems and national records.

**AI R&D questions:**
- How does a NZ-sovereign AI system generalise across different hospital data formats while maintaining accuracy?
- Can AI maintain safety as it scales from hundreds to hundreds of thousands of users?

**Benefits:** Connected care where patient sees specialist and GP gets AI summary automatically. No repeated tests, no lost referrals.

**Why Substantial R&D:** Patient-facing AI requires different safety training than GP-facing AI. Learning from outcomes without compromising safety is unsolved AI research. National-scale generalisation requires novel training approaches beyond the 24-month grant scope.

**Supports government goal:** Makes 10-year digital health plan intelligent and accessible for all New Zealanders.

---

**Document Status:** Final version, aligned with R&D Activities research emphasis  
**Last Updated:** 2 December 2025  
**Version:** 4.2 - All objectives balanced (Objective 4 trimmed 68%)
