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

Investigate which architectural paradigms accurately perform multi-condition clinical calculations (CVD risk, diabetes monitoring, COPD/CHF/asthma management) while maintaining equity without algorithmic bias. This addresses complex reasoning challenges absent in routine task automation (Objective 2) and requires investigation of unstructured data extraction, multi-factor integration, and equity-preserving algorithm design.

### Key R&D Questions

**Architectural Paradigm Performance on Complex Clinical Reasoning:**
1. Do architectural paradigms achieving high accuracy on routine tasks (Objective 2) maintain performance on multi-condition reasoning, or does task complexity necessitate different paradigm characteristics?

**Unstructured Data Extraction Under NZ Healthcare Documentation Patterns:**
2. Can architectural approaches reliably extract clinical parameters (smoking status, disease severity, medication adherence) from unstructured GP notes containing NZ healthcare system documentation patterns (regional abbreviations, local terminology, contextual phrasing)?

**Multi-Condition Logic Without Alert Overload:**
3. How can care gap detection logic prioritise across multiple conditions (diabetes + CVD + CKD) without overwhelming clinicians, and which architectural approaches enable clinically appropriate multi-condition reasoning?

**Equity-Preserving Algorithm Design:**
4. How can algorithms prioritise patients experiencing health inequities (Māori, Pacific, high-deprivation) without introducing algorithmic bias that reinforces stereotypes or causes harm, and do equity mechanisms interact with architectural paradigm choice?

### Research Activities

#### Clinical Testbed: Care Gap Finder

**Purpose:** Controlled environment for investigating complex clinical reasoning, multi-condition logic, and equity-preserving algorithms across architectural paradigms.

**Testbed Capabilities (5 Chronic Conditions):**

- **Diabetes monitoring:** HbA1c trends, ACR, retinal screening, foot checks, kidney function (flags overdue monitoring)
- **Cardiovascular risk assessment:** NZ CVDRA calculation using age, sex, ethnicity, BP, lipids, smoking, diabetes (stratifies risk bands)
- **COPD management:** Spirometry tracking, exacerbation frequency from notes, inhaler technique documentation (flags management gaps)
- **Heart failure (CHF) monitoring:** BNP and eGFR trends, fluid status from notes (flags deterioration patterns)
- **Asthma control assessment:** Medication patterns, symptom frequency from notes, action plan documentation (flags poor control)

**Additional Capabilities:**
- Multi-condition prioritisation logic
- Patient communication generation (health literacy-appropriate, culturally responsive)
- Practice dashboards with equity-focused filters (Māori, Pacific, deprivation quintile)
- Integration with both Medtech and Indici PMSs

**Research Instrumentation:**
- Extraction accuracy measurement: Structured field retrieval vs unstructured note parsing
- Clinical calculation verification: CVD risk, disease control assessment, gap identification vs GP audit
- Equity outcome tracking: Patient prioritisation by ethnicity, deprivation, clinical risk
- Multi-condition logic evaluation: Alert appropriateness, clinician override patterns, priority ranking validation

#### Architectural Paradigm Investigation on Complex Reasoning

**Research Focus:** Discover whether paradigms successful for routine tasks (Objective 2) transfer to complex clinical reasoning or require different approaches.

**Systematic Experiments:**

**1. Multi-Factor Clinical Calculation (CVD Risk Assessment)**
- Investigate paradigms: Rules-only (existing calculator) → Hybrid rules+LLM → LLM with structured output → Agentic with verification
- Test on ≥1,000 patients: Measure calculation accuracy (target ≥95%), handling of missing data, explanation quality
- Equity assessment: Compare Māori/Pacific risk stratification accuracy. Do paradigms maintain equity or introduce bias?
- Research question: Do deterministic calculations require rule-based approaches, or can learned paradigms match accuracy while improving missing data handling?

**2. Unstructured Data Extraction (Clinical Note Parsing)**
- Investigate paradigms: Named entity recognition → LLM extraction → RAG-augmented (guideline context) → Multi-agent verification
- Test extraction accuracy: Smoking status, disease severity markers, medication adherence, symptom frequency from free-text notes
- NZ healthcare documentation testing: Regional abbreviations (e.g., "HTN," "T2DM"), local terminology, contextual phrasing ("not keen on tablets"), ACC/PHO-specific documentation patterns
- Research question: Whether domain adaptation suffices for unstructured extraction, or NZ healthcare system documentation patterns require architectural modifications?

**3. Multi-Condition Prioritisation Logic**
- Investigate approaches: Rule-based prioritisation → LLM-based clinical reasoning → Hybrid scoring
- Test scenarios: Patient with diabetes + CVD + CKD (which gaps take priority?); Patient with diabetes (controlled) vs diabetes (uncontrolled) for appropriate urgency stratification
- Measure: Clinician agreement with prioritisation (target ≥85% vs GP audit), alert appropriateness, override patterns
- Research question: Can architectural paradigms perform clinically appropriate multi-condition reasoning, or does complexity exceed current AI capabilities?

#### Equity-Preserving Algorithm Research

**Research Focus:** Design algorithms that prioritise patients experiencing inequities without introducing harmful biases, addressing Te Tiriti obligations and health equity imperatives.

**Research Activities:**

**1. Equity Algorithm Design Patterns**
- Investigate approaches:
  - **Explicit prioritisation:** Māori/Pacific patients flagged earlier for same clinical risk (corrects systemic under-screening)
  - **Risk model calibration:** Ethnicity-specific thresholds reflecting differential baseline risk (follows PREDICT-CVD NZ approach)
  - **Equity-blind with deprivation:** Use deprivation quintile as proxy (avoids ethnic profiling but may miss equity gaps)
- Test outcomes: Screening rates by ethnicity, clinical outcomes, unintended consequences
- Research question: Which equity algorithm patterns achieve equitable outcomes without harmful stereotyping?

**2. Bias Detection and Mitigation**
- Audit architectural paradigms for bias: Do LLM-based approaches absorb biases from training data? Do rule-based approaches maintain equity by design?
- Test edge cases: Māori patient with atypical presentation, Pacific patient with missing ethnicity data, high-deprivation NZ European patient
- Measure: False negative rates by ethnicity, false positive rates, inappropriate alert generation
- Research question: How do equity mechanisms interact with architectural paradigm choice? Do some paradigms inherently preserve vs compromise equity?

#### Multi-System Generalisation Investigation (Continued)

**Research Focus:** Extend Objective 2 findings. Does complex reasoning generalise across PMSs?

**Activities:**
- Deploy Care Gap Finder to both Medtech and Indici with identical architecture
- Measure performance variance: Extraction accuracy from different note formats, calculation accuracy from different structured data schemas
- Investigate: Do data complexity differences (structured labs in one PMS, embedded PDFs in another) affect paradigm performance?
- Research question: Does architectural generalisation hold for complex tasks, or do generalisation patterns differ by task complexity?

#### Lean Clinical Validation (Staged Deployment)

**Approach:** Release lean MVP (diabetes + CVD) once core targets met (≥95% CVDRA accuracy, ≥85% care gap detection vs audit), then expand to COPD/CHF/asthma while continuing research on multi-condition logic and equity algorithms.

**R&D Value:**
- Real-world validation of multi-condition reasoning in diverse patient populations
- Equity outcome measurement: Changes in Māori/Pacific screening rates, care gap closure
- Multi-practice variation investigation: Performance across different deprivation quintiles, ethnic compositions, practice sizes

### Research Knowledge Deliverables by Month 16

**Primary Deliverables (Research Knowledge):**

1. **Architectural Paradigm Performance on Complex Reasoning**
   - Quantified performance comparison: Routine tasks (Objective 2) vs complex multi-condition reasoning
   - Task complexity characteristics predicting paradigm suitability: When do simple approaches suffice vs require sophisticated reasoning?
   - Clinical calculation accuracy boundaries: Which paradigms achieve clinical-grade accuracy (≥95%) under real-world missing data conditions?

2. **Unstructured Data Extraction Patterns**
   - NZ healthcare documentation handling: Which paradigms robustly extract from regional abbreviations, local terminology, contextual phrasing?
   - Extraction accuracy by data type: Structured fields (high accuracy, paradigm-agnostic) vs unstructured notes (paradigm-dependent performance)
   - Domain adaptation effectiveness: Where fine-tuning/prompting suffices vs architectural modifications required

3. **Multi-Condition Clinical Reasoning Capabilities**
   - Multi-condition logic patterns: Rule-based prioritisation vs learned reasoning performance
   - Clinician agreement analysis: Which approaches achieve ≥85% GP audit concordance?
   - Alert appropriateness and override patterns: When clinicians accept vs reject AI prioritisation (appropriate reliance calibration)

4. **Equity-Preserving Algorithm Design Patterns**
   - Documented equity algorithm approaches with measured outcomes (screening rates by ethnicity, care gap closure)
   - Bias detection methodology: How to audit architectural paradigms for equity preservation vs bias introduction
   - Te Tiriti-compliant AI design principles: Prioritising Māori/Pacific patients without harmful stereotyping
   - Architectural-equity interaction effects: Which paradigms inherently support vs compromise equity goals

5. **Multi-System Generalisation on Complex Tasks**
   - Generalisation pattern validation: Do Objective 2 findings (routine task generalisation) hold for complex reasoning?
   - System-specific performance variance: Medtech vs Indici on multi-condition calculations and unstructured extraction
   - Data complexity effects on generalisation: How PMS data characteristics affect paradigm robustness

**Secondary Deliverables (Working Clinical Tool):**

6. **Care Gap Finder Operational in Both PMSs**
   - Validated on ≥1,000 de-identified patient records: ≥95% CVDRA accuracy, ≥85% care gap detection vs GP audit
   - Deployed to early adopter practices (staged: diabetes/CVD first, then COPD/CHF/asthma)
   - Demonstrated equity outcomes: Appropriate prioritisation of Māori/Pacific and high-deprivation patients without bias
   - Measured clinical impact: Care gaps identified and closed, screening rates by ethnicity (validates research while supporting PHO quality indicators)

**Knowledge Transfer:**
- Architectural recommendations for Objective 4 (generalisation research) based on complex reasoning validation
- Equity algorithm patterns transferable to patient-facing AI (Years 3-5 HealthHub NZ) and broader health sector

---

## Objective 4 – Multi-Practice Generalisation and Real-World Failure Mode Research (Months 16–24)

### Plain-English Aim

Investigate whether architectural paradigms validated in controlled environments (Objectives 1-3) generalise across diverse real-world conditions (multiple practices, patient populations, clinician workflows, PMSs) by discovering performance degradation patterns, safety-architecture interaction effects, and real-world failure modes that emerge only under operational deployment. This is the "hardest" R&D: understanding what makes AI systems robust vs brittle in authentic clinical practice.

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
- **PMS diversity:** 60/40 split Medtech/Indici reflecting market share
- **Geographic diversity:** Urban (Auckland, Wellington, Christchurch), regional (Dunedin, Palmerston North), rural (West Coast, Northland)
- **Ethnic composition diversity:** High Māori practices (>40%), high Pacific (>30%), predominantly NZ European
- **Deprivation diversity:** Q1 (low deprivation) through Q5 (high deprivation) representation
- **Practice size diversity:** Solo GP, small group (<5 GPs), large group (≥5 GPs)
- **Workflow diversity:** GP-led vs nurse-led screening, proactive outreach vs opportunistic

#### Research Investigation Areas

**1. Multi-Practice Performance Variation Analysis**

**Research Activities:**
- Measure performance metrics across all practices: Inbox classification accuracy, CVD risk calculation accuracy, care gap detection concordance
- Quantify variation: Mean performance, standard deviation, outlier practices (>2 SD from mean)
- Investigate variance causes:
  - **Patient population effects:** Does ethnic composition affect extraction accuracy? Does deprivation correlate with missing data rates?
  - **Clinician workflow effects:** Do proactive practices achieve different outcomes than reactive practices?
  - **Practice characteristics:** Does PMS choice, practice size, or IT maturity predict performance?
- Research question: Is architectural performance consistent across practices (robust generalisation), or do practice characteristics cause unpredictable performance variation (brittle generalisation)?

**2. Lab-to-Clinic Translation Pattern Validation**

**Research Activities:**
- Compare multi-practice performance against Objectives 2-3 controlled validation findings
- Measure: Synthetic test accuracy → Early adopter accuracy → Multi-practice mean accuracy (quantify each translation step)
- Investigate degradation patterns:
  - **Progressive degradation:** Performance declines with each translation step (synthetic → controlled → operational)
  - **Step-function degradation:** Performance stable until specific conditions trigger failure
  - **Unpredictable degradation:** No consistent pattern across practices
- Document: Which paradigm characteristics predict translation robustness (performance maintains) vs brittleness (performance degrades)?
- Research question: Can lab-to-clinic translation be predicted from early validation, or are operational deployment patterns fundamentally unpredictable?

**3. Safety-Architecture Interaction Investigation**

**Research Activities:**
- Systematic safety testing under operational workload (thousands of scenarios per practice)
- Investigate interaction effects:
  - **Confidence threshold effects:** How do paradigm-specific confidence scores affect false negative rates under real clinical variability?
  - **Refusal scaffold behaviour:** Under what conditions do safety mechanisms trigger appropriately vs inappropriately (alert fatigue)?
  - **Emergent safety failures:** Do combined stressors (high workload + atypical patient + edge case presentation) create failures absent under controlled testing?
- Measure: Safety metric performance (prohibited claim rate target ≤0.5%, refusal appropriateness ≥95%) across practices and paradigms
- Document: Safety failure taxonomy by paradigm and practice characteristics
- Research question: Are safety-architecture interactions predictable from laboratory testing, or do emergent behaviours arise only under operational deployment?

**4. Real-World Failure Mode Taxonomy**

**Research Activities:**
- Comprehensive documentation of all system failures across 10-20 practices over 6-8 months
- Failure categorisation:
  - **Architectural failures:** Paradigm-specific (e.g., LLM hallucination, classifier overconfidence)
  - **Data-induced failures:** Practice-specific data characteristics causing errors (unexpected formats, missing fields)
  - **Workflow-induced failures:** Practice workflow patterns incompatible with AI suggestions
  - **Emergent failures:** Multiple interacting factors creating unpredictable failure modes
- Failure consequence analysis: Patient safety impact, clinician trust degradation, workflow disruption
- Failure frequency and detectability: How often do failures occur? Can they be detected automatically vs require clinician reporting?
- Research question: Can real-world failure modes be predicted from controlled testing, or must they be discovered empirically through operational deployment?

**5. Equity Outcome Validation at Scale**

**Research Activities:**
- Measure equity outcomes across diverse practices:
  - **Screening rate changes:** Māori/Pacific screening rates pre-deployment vs post-deployment (target: improvement without widening gaps)
  - **Care gap closure:** Which ethnic groups benefit most from AI prioritisation? Are inequities reduced or maintained?
  - **Unintended consequences:** Does AI prioritisation create new biases? (e.g., over-alerting for Māori patients causing stereotyping concerns)
- Compare outcomes across practice types: High Māori practices vs low Māori practices. Do equity algorithms perform consistently?
- Research question: Do equity-preserving algorithms designed in controlled settings (Objective 3) maintain equity across diverse real-world practices, or do practice-specific factors compromise equity goals?

**6. Architectural Paradigm Refinement Based on Real-World Evidence**

**Research Activities:**
- Analyse failure patterns across practices: Which architectural characteristics correlate with robustness vs brittleness?
- Investigate paradigm modifications:
  - **Domain adaptation refinement:** Incorporate practice-specific documentation patterns, abbreviations, workflow contexts
  - **Architectural adjustments:** If agentic approaches show superior generalisation, transition from simpler paradigms
  - **Safety mechanism tuning:** Adjust confidence thresholds, refusal triggers based on operational evidence
- Re-validation after modifications: Do changes improve generalisation or introduce new failures?
- Research question: Can architectural paradigms be refined for generalisation, or are inherent paradigm limitations revealed by multi-practice deployment?

#### Longitudinal Safety and Performance Monitoring

**Purpose:** Detect performance drift, safety degradation, model staleness over time for research on temporal robustness.

**Activities:**
- Monthly performance regression testing: Synthetic test suite, edge cases, adversarial scenarios
- Automated safety gates: Continuous monitoring of prohibited claim rate, refusal appropriateness, PHI leakage indicators
- Model drift detection: Compare current month performance to baseline (Month 16) and quantify degradation
- Investigate drift causes: Has clinical guideline changed? Has practice workflow evolved? Has patient population shifted?
- Research question: Do architectural paradigms maintain performance over time (temporal robustness), or does drift necessitate continuous retraining/recalibration?

### Research Knowledge Deliverables by Month 24

**Primary Deliverables (Research Knowledge):**

1. **Multi-Practice Generalisation Pattern Analysis**
   - Quantified performance variation across 10-20 practices: Mean, standard deviation, outlier identification
   - Practice characteristic effects: Which factors (patient population, workflow, PMS, size) predict performance variance?
   - Architectural paradigm generalisation boundaries: Which paradigms exhibit robust vs brittle generalisation?
   - Generalisation prediction framework: Can early validation predict multi-practice performance, or is empirical validation necessary?

2. **Lab-to-Clinic Translation Pattern Documentation**
   - Comprehensive degradation analysis: Synthetic → controlled → operational performance translation
   - Paradigm-specific translation patterns: Which architectural characteristics predict translation robustness?
   - Operational deployment risk factors: Practice characteristics causing unexpected performance degradation
   - Translation prediction methodology: How to estimate operational performance from laboratory validation

3. **Safety-Architecture Interaction Effects and Failure Mode Taxonomy**
   - Safety mechanism performance under operational workload: Confidence thresholds, refusal scaffolds, prohibited claim detection
   - Emergent safety failures: Conditions causing safety mechanism breakdown (combined stressors, edge cases)
   - Failure mode taxonomy: Comprehensive documentation of all failure types observed across practices
   - Failure prediction and detection: Which failures can be predicted vs require operational discovery; automated detection methods

4. **Equity Outcome Validation at Scale**
   - Māori/Pacific screening rate changes: Pre-deployment vs post-deployment across diverse practices
   - Care gap closure by ethnicity and deprivation: Evidence of inequity reduction vs maintenance
   - Equity algorithm robustness: Performance consistency across high vs low Māori practices
   - Unintended bias detection: Evidence of harmful stereotyping, over-alerting, or new inequities introduced

5. **Architectural Paradigm Robustness Analysis**
   - Real-world performance comparison: Which paradigms maintain accuracy, safety, equity across diverse conditions?
   - Refinement effectiveness: Do modifications improve generalisation, or are paradigm limitations fundamental?
   - Temporal robustness: Performance drift patterns over 6-8 months. Which paradigms remain stable vs degrade?
   - Paradigm selection framework: Evidence-based recommendations for future clinical AI development

6. **Multi-PMS Generalisation Validation (Medtech vs Indici at Scale)**
   - Performance consistency vs variance across PMSs in diverse practice settings
   - System-specific challenges revealed by multi-practice deployment
   - Integration architecture best practices: Lessons learned for adding future PMSs or national FHIR APIs

**Secondary Deliverables (Operational Validation):**

7. **Production-Grade System Across 10-20 Practices**
   - Demonstrated robustness: Inbox Helper and Care Gap Finder operational across diverse real-world conditions
   - Measured clinical impact:
     - Time savings: GP inbox processing time reduction (validates workflow benefit)
     - Care gaps closed: Screening rate improvements, overdue check completion (validates clinical utility)
     - Equity outcomes: Māori/Pacific screening rates, health inequity reduction (validates equity algorithms)
     - Safety record: Zero patient harm incidents, safety metric targets maintained (≤0.5% prohibited claims, ≥95% appropriate refusals)

8. **Final R&D Report and Commercial Roadmap**
   - Comprehensive research findings: All knowledge deliverables synthesised
   - Architectural recommendations: Evidence-based guidance for clinical AI development in NZ health sector
   - Broader rollout roadmap: Path to national scale (GP practices, PHOs, Te Whatu Ora integration) grounded in R&D evidence
   - Years 3-5 HealthHub NZ research plan: Patient-facing AI investigations building on validated architectural knowledge

**Knowledge Transfer:**
- Research outputs transferable to PHOs, DHBs/Te Whatu Ora, health AI developers, government agencies
- Architectural paradigm knowledge enables evidence-based development for entire NZ health AI sector
- Equity-preserving algorithm patterns applicable to future health AI projects
- Generalisation prediction frameworks reduce risk for clinical AI investments nationwide

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
- How does one NZ-trained LLM generalise across different hospital data formats while maintaining accuracy?
- Can AI maintain safety as it scales from hundreds to hundreds of thousands of users?

**Benefits:** Connected care where patient sees specialist and GP gets AI summary automatically. No repeated tests, no lost referrals.

**Why Substantial R&D:** Patient-facing AI requires different safety training than GP-facing AI. Learning from outcomes without compromising safety is unsolved AI research. National-scale generalisation requires novel training approaches beyond the 24-month grant scope.

**Supports government goal:** Makes 10-year digital health plan intelligent and accessible for all New Zealanders.

---

**Document Status:** Final version, aligned with R&D Activities research emphasis  
**Last Updated:** 2 December 2025  
**Version:** 4.0 - Complete Research-Focused Rewrite
