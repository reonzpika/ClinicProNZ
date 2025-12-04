# Forge Application Narrative and Objectives

## Application Title
**ClinicPro AI: NZ-Sovereign Clinical LLM for GP Workflow – Inbox Helper and Care Gap Finder**

## Proposed Dates
- **Start:** 27 Jan 2026
- **End:** 26 Jan 2028 (24 months)

## ANZSIC Detail
- **Primary:** J5420 Software Publishing
- **Alternative:** M7000 Computer System Design and Related Services

---

## Background and Compliance (~250 words)

NexWave Solutions Ltd (incorporated 2024) develops AI tools for New Zealand general practice. Founder is a practising GP and full-stack developer with AI/ML skills, bringing clinical domain knowledge, technical capability, and real-world understanding of GP workflow challenges.

**Current Product: ClinicPro SaaS**
- AI-assisted medical scribing platform for NZ GPs
- Operational product in daily clinical use
- Consultation note generation, clinical image analysis, real-time transcription
- Built with NZ privacy compliance from day one (Privacy Act 2020, HIPC)

**Market & Partnerships:**
- Target market: NZ general practitioners and primary care practices
- Formal partnership with Medtech (NZ's largest practice management system provider, ~60% market share)
- Medtech integration currently in development: smart clinical image tool and AI scribe features embedded within GP workflow

**Recent Development Activity:**
- Medtech FHIR API integration validated for secure patient data handling
- Smart clinical image tool in active development
- Transitioning from standalone SaaS to embedded PMS features for seamless clinical workflow

**Founder's Clinical Expertise:**
- Practising GP with firsthand experience of inbox overload, care gap monitoring challenges, and clinical safety requirements
- Tests features in real-world clinical practice daily
- Provides clinical domain expertise for safety validation and GP pilot recruitment
- GP clinical work income provides 60% co-funding for this R&D project

**Stage:** Early operational with proven product, formal partnership with NZ's largest PMS provider, and active integration development. This R&D grant funds transition to NZ-sovereign clinical LLM for two core tools: Inbox Helper and Care Gap Finder.

**Privacy & Safety:** The system is strictly assist-only; it never provides diagnostic or treatment directives. Development uses synthetic and de-identified data only; no production patient data used for model training. Inference may occur in Australia with no persistent data outside NZ. All patient data at rest remains in NZ with NZ-held keys. Cross-border processing governed by Privacy Act 2020 IPP 12 safeguards, HISO 10029 security controls, and DPIA completed pre-pilot. Aligns with Te Whatu Ora's NAIAEAG precautionary guidance.

---

## Eligibility Confirmations

- NZ-incorporated company; solvent; intends to conduct ongoing R&D.
- **New to R&D:** <$150k total R&D in last three years; no R&D grants/loans >$5k in last three years.
- Not grouped with an R&D performer (>$150k in last three years).
- Able to fund 60% co-funding from shareholder funds ($230k available: $130k opening + $100k Ting's reserve, of which $215k deployed with $15k emergency buffer) and GP clinical work income; evidence provided.

---

## Describe Planned R&D Activities (~250 words)

**Research Objective:** Systematically investigate which AI architectural paradigms achieve optimal clinical safety, NZ-contextual performance, and cost-effectiveness for primary care decision support. This foundational research enables New Zealand's transition to sovereign health AI at national scale.

**Core Architectural Investigation:**

Explore architectural spectrum from lightweight pattern recognition to sophisticated reasoning systems. Initial candidates include classifiers, rule-based systems, Large Language Model (LLM) reasoning, retrieval-augmented generation, agentic AI approaches, and hybrid combinations. **Research will follow where empirical evidence leads**. Investigation may discover novel architectural patterns or reveal optimal approaches vary by clinical task in unexpected ways.

Measure each paradigm across: accuracy, computational cost, latency, safety failure modes, generalisability across health systems, equity outcomes.

**Clinical Test Beds for Experimentation:**

**1. Inbox Management (reactive, high-volume):** Laboratory result interpretation, hospital letter summarisation, urgency classification, trend detection. Research question: Which architectural approach safely handles routine clinical tasks while maintaining accuracy and cost-effectiveness?

**2. Chronic Disease Monitoring (proactive, complex logic):** Identify overdue checks for diabetes, cardiovascular disease, chronic lung conditions, heart failure, asthma. Multi-condition gap detection with Māori/Pacific equity prioritisation. Research question: Which paradigm achieves clinical calculation accuracy while maintaining equity without algorithmic bias?

**NZ-Specific Domain Adaptation:**

Train sovereign AI on curated NZ clinical corpus: bpac guidelines, Ministry of Health protocols, Pharmac medication database, regional laboratory formats (LabTests, SCL, Medlab), Medtech and Indici clinical note patterns. Investigate whether domain-adapted sovereign models achieve clinical-grade performance at sustainable cost under NZ sovereignty constraints.

**Multi-System Generalisation Research:**

Integrate with both Medtech and Indici practice systems. Investigate architectural patterns that maintain performance across different health system data structures, which is critical for national-scale deployment.

**Real-World Validation:**

Pilot with 10-20 GP practices. Measure clinical utility, safety outcomes, clinician override patterns, equity metrics. Document performance characteristics from synthetic data → sandbox → production deployment.

**Knowledge Outputs:** Risk-stratified architectural framework, NZ domain adaptation methodology, multi-system generalisation patterns, equity-preserving algorithms, safety validation framework (transferable to patient-facing care for Years 3-5 HealthHub NZ and national health integration).

---

## Uncertainty – What is the Specific Uncertainty? (~250 words)

**Primary Uncertainty:**

Which AI architectural paradigm achieves clinical safety, NZ-contextual accuracy, and cost-effectiveness for primary care decision support across multiple health system platforms?

This cannot be resolved without systematic experimentation because clinical AI operates under unprecedented constraint combination: high safety requirements, NZ healthcare system context, equity obligations, privacy regulations, multi-system integration.

**Five Cascading Research Uncertainties:**

**1. Architectural Paradigm Selection Across Clinical Risk Spectrum**

Which architectural approach (ranging from simple pattern recognition to multi-agent reasoning systems) achieves required clinical safety and accuracy at sustainable cost? Do routine tasks permit lightweight solutions ($0.002/request), or do clinical nuances demand sophisticated reasoning ($0.15/request)? **Emerging AI paradigms (agentic systems, advanced retrieval-augmented generation) may prove superior to established approaches**, requiring investigation of cutting-edge techniques alongside conventional methods. **Cost-accuracy-safety trade-offs unknowable without empirical comparison. Optimal paradigm may vary by clinical task in unexpected ways.**

**2. Domain Adaptation Feasibility Under NZ Healthcare System Context and Sovereignty Constraints**

Whether domain adaptation alone suffices for NZ healthcare system characteristics (bpac/MoH guidelines, regional lab formats with NZ-specific reference ranges, ACC/PHO documentation patterns, local clinical pathways), or whether these contextual differences require architectural modifications to reasoning components. Standard techniques trained on international datasets (US/UK healthcare) may not capture NZ healthcare system nuances. **Adaptation effectiveness across paradigms under no-overseas-training constraints unknowable without systematic investigation and may require novel architectural approaches not yet documented.**

**3. Multi-System Generalisation Patterns**

Will architectural approach achieving 90% accuracy in Medtech maintain performance in Indici, given different data structures and workflows? What design patterns enable single system to generalise across health platforms without system-specific rework? **Generalisation behaviour cannot be predicted without testing. May reveal novel architectural requirements.**

**4. Safety-Architecture Interaction Effects**

How do safety constraints (refusal scaffolds, prohibited-claim detection) interact with different architectural paradigms? Do agentic systems maintain safety bounds differently than LLMs? Do hybrid approaches propagate safety failures across components? **Safety failure modes across paradigms create emergent risks that cannot be predicted from component specifications and require systematic empirical investigation.**

**5. Equity Algorithm Generalisability Across Populations**

Can prioritisation algorithms surface high-risk and Māori/Pacific patients without introducing under-alerting in other populations or perpetuating training data biases? **Novel equity-preserving approaches required; no published methods exist for multi-condition clinical monitoring with NZ equity goals.**

These uncertainties are interconnected: architectural paradigm choice affects domain adaptation, influences multi-system generalisation, impacts safety mechanisms, determines equity outcomes. Resolving these creates foundational knowledge for patient-facing AI (Years 3-5) and national health integration.

---

## R&D Challenge – Why is This Difficult for a Professional? (~250 words)

**Even highly competent professionals cannot deduce solutions without systematic experimentation:**

**1. Multi-Component Architecture Performance Cannot Be Predicted From Component Specifications**

Architectural paradigms (from simple pattern recognition to agentic reasoning) exhibit emergent behaviour when components interact. Sophisticated reasoning systems "hallucinate" on medical calculations; cardiovascular risk scoring requires precise 8-variable computation, yet reasoning models fabricate values. Interaction effects compound unpredictably: retrieval errors propagate into reasoning, quantization degrades safety mechanisms. **Component-level testing doesn't reveal system-level failures. Performance emerges from interactions unknowable without empirical measurement.**

**2. Multi-System Generalisation Creates Emergent Failure Modes**

Medtech and Indici structure data differently. Architectures performing well in one system fail subtly in another: laboratory formats differ, medication codes vary, note templates diverge. **These failures cannot be predicted from documentation; they emerge from real-world variations. Discovering robust patterns requires systematic testing.**

**3. Real-World Clinical Data Characteristics Cause Unpredictable Architecture-Specific Failures**

Real clinical data exhibits characteristics unreplicable synthetically: inconsistent documentation under time pressure, missing fields, data quality variations, system artifacts. **Different paradigms respond unpredictably to real-world messiness. Performance on clean synthetic data doesn't predict messy clinical data performance. Architecture-dependent sensitivity to data quality unknowable without real-world testing.**

**4. Safety Mechanisms Interact With Architectural Paradigms Creating Emergent Failure Modes**

Safety constraints (refusal scaffolds, prohibited-claim detection) behave differently across architectures. Agentic systems propagate errors across agents. LLMs bypass refusal scaffolds unexpectedly. Hybrid systems fail at component boundaries. **Safety failure modes vary unpredictably by paradigm. Emergent safety risks require systematic investigation.**

**5. AI Performance Metrics Do Not Predict Clinical Outcome Improvements**

Laboratory metrics (accuracy, F1) may not correlate with clinical outcomes (time saved, errors prevented, safety). High-accuracy systems may reduce trust through false positives while lower-accuracy systems with better explanations drive higher utility. **Which architectural characteristics translate to clinical value cannot be deduced from benchmarks and requires systematic real-world outcome measurement.**

---

## Knowledge Availability – What Exists and Why It's Insufficient? (~250 words)

**Existing Knowledge Addresses Different Problems:**

**1. Documentation, Automation, and Early-Stage Solutions Don't Resolve Decision-Support Uncertainties**

Clinical AI tools focus on documentation (Heidi in NZ, internationally Abridge/Nuance DAX). Admin automation solutions provide rule-based workflow support (SmartCareGP, HealthAccelerator, Pegasus Health). Early-stage inbox solutions are emerging (InboxMagic, MVP phase) but haven't demonstrated deep PMS integration or published architectural approaches. **Whether AI architectures work for active decision support with multi-condition reasoning (care gap monitoring across 5 chronic conditions), confidence-calibrated alerts, and equity-aware prioritization is technologically uncertain.** Decision support requires capabilities beyond automation or documentation: real-time clinical inference, multi-condition logic, architectural robustness under PMS constraints. No published work validates paradigms across use case types.

**2. Generic AI Systems Show Capability But Not Sovereign Deployment Pathways**

Overseas APIs (GPT-4, Claude) prove clinical reasoning capability but don't address: **How to achieve comparable performance under NZ sovereignty constraints (no overseas APIs), at sustainable cost, across PMS platforms, with equity algorithms.** Architectural paradigms for sovereign deployment at scale are undocumented.

**3. Academic Research Validates Isolated Components, Not Integrated Systems**

Published work studies techniques (fine-tuning, RAG, agentic systems) using standardised datasets. **How paradigms perform under combined real-world constraints (multi-PMS + equity + Privacy Act + cost + PMS interface limits) is unknowable from isolated testing.** Lab benchmarks don't predict clinical integration performance. Emergent behaviors cannot be deduced.

**4. Commercial Implementations Keep Methods Proprietary**

Emerging commercial solutions don't disclose architectural selection criteria, domain adaptation techniques, or safety validation methods. Knowledge remains proprietary and unavailable for sector capability building. Public research required to create accessible, reusable knowledge for entire health AI sector.

**5. PMS Integration Constraints Create Unknown Architectural Requirements**

Published AI research assumes unlimited UI flexibility. Real PMS integration (Medtech/Indici widgets) imposes constraints: limited screen space, fixed workflows. **Whether paradigms requiring extensive UI remain useful when constrained to PMS widgets requires empirical investigation.**

**Systematic investigation required to resolve technological uncertainties.**

---

## Newness – What is New? (~250 words)

**This R&D generates three bodies of novel knowledge:**

**1. Architectural Paradigm Performance Under Combined Clinical Constraints**

Quantified performance for architectural paradigms (classifiers → hybrid → LLMs → agentic AI → RAG) under constraints never tested together: clinical safety (prohibited-claim ≤0.5%), multi-condition reasoning (5 chronic conditions), real-time inference (<5s), cost (<$0.01/request), multi-PMS robustness (Medtech + Indici), equity prioritization. Documents which paradigms achieve clinical utility under which constraint combinations. **Emerging paradigms (agentic AI, RAG) have no published clinical validation under these constraints.** Creates evidence-based architectural selection framework transferable to patient-facing AI (Years 3-5).

**2. Lab-to-Clinic Performance Translation and Real-World Failure Modes**

Quantifies performance degradation when AI transitions: synthetic to real clinical data (inconsistent documentation, missing fields); controlled lab to real workflows (time pressure, interruptions); single-system to multi-system (Medtech to Indici). Identifies architectural characteristics predicting robustness vs brittleness. Documents failure modes emerging in deployment invisible in lab testing. **No published work quantifies real-world degradation across paradigms; academic research stops at laboratory benchmarks.** Enables prediction of clinical deployment success.

**3. Safety Mechanisms Across Paradigms and Equity-Preserving Algorithms**

**(A) Safety-architecture coupling:** Documents how safety constraints (refusal scaffolds, prohibited-claim detection) perform across paradigms. Safety failure modes for emerging architectures (agentic systems propagate errors, multi-agent coordination bypasses safety) undocumented in clinical contexts. **(B) Equity algorithms:** Novel prioritization ensuring Māori/Pacific patients receive proactive care without under-alerting others or perpetuating biases. Standard ML fairness techniques don't apply to multi-condition monitoring with outcome-based equity goals. **No published methods exist.** Essential for Te Tiriti-compliant clinical AI.

**Knowledge validated through clinical testbeds (Inbox Helper, Care Gap Finder), documented for sector reuse, foundational for Years 3-5 HealthHub NZ.**

---

## Why is it Better? (~250 words)

**This research generates knowledge enabling capabilities previously impossible:**

**1. Architectural Paradigm Knowledge Enables Evidence-Based Development**

Quantifies performance boundaries for architectural paradigms under combined clinical constraints (safety, multi-condition reasoning, real-time, cost, multi-PMS, equity). **Without this:** Developers choose architectures through trial-and-error or copy overseas approaches failing under NZ constraints (sovereignty, Privacy Act, equity). Costly experimentation repeated by each developer. **With this:** Evidence-based architectural selection, eliminating trial-and-error. Saves sector millions in failed experiments. Enables sovereign deployment at sustainable cost.

**2. Lab-to-Clinic Translation Knowledge De-Risks Investments**

Quantifies performance degradation from laboratory to real clinical deployment across paradigms. Identifies characteristics predicting robustness vs brittleness. **Without this:** Academic benchmarks don't predict clinical success; systems fail in real workflows. **With this:** Prediction of which architectures succeed before costly implementation. Accelerates clinical AI adoption by reducing deployment risk.

**3. Safety and Equity Knowledge Enables Responsible Deployment**

Safety failure mode taxonomy for emerging paradigms (agentic AI, multi-agent systems) fills critical gap. Equity-preserving algorithms enable Te Tiriti-compliant AI. **Without this:** Patient-facing AI too risky (unknown failure modes), equity retrofitted after development (ineffective). **With this:** Safe deployment of emerging paradigms, equity by design. Essential for patient-facing AI (Years 3-5) and broader sector.

**4. Knowledge Transferability Creates Sector-Wide Capability**

Research outputs documented and transferable to PHOs, hospitals, government agencies. Immediate tools (Inbox Helper, Care Gap Finder) validate research while addressing GP workforce crisis. Validated architectural approaches enable Years 3-5 HealthHub NZ and national health integration. **Research advances entire NZ health AI capability, not just one company's products.**

---

## Overseas Labour Resources

**None.** All R&D labour is performed in NZ by founder, Ting (R&D Operations Lead), and local contractor developer. Australia is used only for transient inference with no persistent PHI outside NZ.

---

## R&D Team (24 Months)

**Founder (Shareholder-employee):** 3,120 hours @ $96/hr = $299,520
- GP clinician + full-stack developer
- Clinical domain expertise for NZ-specific use cases
- Technical leadership for NZ-LLM development and architecture validation
- 30 hrs/week commitment throughout 24 months
- Enables parallel GP practice work for co-funding

**Ting (Shareholder-employee, R&D Operations Lead):** 4,152 hours @ $70/hr = $290,640
- R&D Project Manager + Research/Testing/Documentation + Quality Assurance
- Full-time commitment (40 hrs/week throughout 24 months)
- Manages systematic testing, pilot coordination, safety regressions
- Demonstrates growth intention and long-term R&D commitment (Paula's feedback)

**Developer (Contractor):** 903 hours (minimum) @ $72/hr = $65,016
- Starts Month 4, flexible 10-40 hrs/week based on R&D workload (budgeted at 10 hrs/week minimum)
- Frontend development (Medtech and Indici widgets)
- FHIR integration testing across both PMSs
- Synthetic data generation and test automation
- 21 months (Months 4-24)

**Total R&D Labour:** 8,175 hours (minimum) = $655,176

**Rationale for team structure:** Founder's dual GP/technical expertise enables rapid clinical workflow iteration and NZ-specific domain understanding. Ting as full-time R&D Operations Lead provides dedicated project management, systematic testing, and quality assurance, demonstrating growth intention beyond solo founder. Developer contractor provides flexible capacity to scale up during intensive development phases (Objectives 2-3) without fixed overhead. This structure maintains manageable GP practice workload (20 hrs/week) for business income while enabling substantial 30 hrs/week R&D commitment over 24 months.

---

## Hosting and Data Residency Statement

Inference may occur in Australia with no persistent PHI outside New Zealand. All PHI at rest remains in NZ with NZ-held keys. Cross-border disclosure complies with IPP 12 via contractual and technical safeguards (HISO 10029 security controls, DPA clauses, NZ-held encryption keys, audit logging). No patient data is used for model training; only synthetic and de-identified data is used for development and evaluation. A DPIA will be completed before any pilot involving real patient data.

---

## Objectives, Dates and Deliverables (24 Months)

### Objective 1: Build the Smart Foundation and Early Prototypes (Months 1-6)

**Dates:** 27 Jan 2026 – 30 Jun 2026

**Plain-English aim:** Create a flexible, safe AI backbone that can plug into Medtech and Indici, test different AI "recipes" on synthetic NZ healthcare data, and support early Inbox and Care Gap prototypes.

**Key R&D questions:**
- Which AI approach works best for each task: simple classifier, generic LLM, hybrid rules+LLM, or NZ-trained LLM?
- Can a NZ-trained LLM understand local clinical language (bpac/MoH guidance, lab formats, Medtech/Indici notes) better than generic models?
- How do we design one architecture that supports both Medtech and Indici without major rework for each platform?

**What is actually built:**

**NZ clinical data and test sets:**
- Curate NZ clinical corpus (≥10,000 pages) from bpac.org.nz, Ministry of Health, Pharmac, example lab reports and discharge summaries
- Generate synthetic datasets:
  - ≥1,000 synthetic inbox items (labs, discharge letters, referrals, scripts, admin, patient messages) using LabTests, SCL, Medlab formats and typical GP workflows
  - ≥500 synthetic patient records with chronic conditions (diabetes, COPD, CHF, asthma) including labs, medications, and monitoring history

**Core platform and integrations:**
- Build modular backend connecting securely to Medtech and Indici (read-only initially, through their FHIR/related APIs)
- Normalise different lab and document formats into consistent internal structure
- Route tasks to different model types (simple classifier vs hybrid vs LLM) depending on risk and complexity
- Build simple "widget shells" for Medtech and Indici displaying early AI outputs inside each PMS

**Architecture experiments:**
- Compare multiple approaches for representative use cases:
  - Inbox triage: BERT-style classifier vs small LLM vs hybrid
  - CVD risk calculation (CVDRA): rules-only vs LLM-only vs hybrid rules+LLM
- Train initial NZ-LLM (or adapted small model) on NZ corpus
- Benchmark vs GPT-4 on NZ-specific tasks (interpreting local labs, summarising NZ discharge letters)

**Deliverables by Month 6:**
- Foundation system v1.0 deployed, connected to Medtech and Indici test/sandbox environments
- Handling synthetic inbox items and patient records with ≥90% triage accuracy and ≥95% CVDRA accuracy on test sets
- Architecture recommendations documented for Inbox Helper (e.g., lightweight classifier + rules vs LLM) and Care Gap Finder (hybrid rules+NZ-LLM for extraction and calculations)
- Early sandbox prototypes: inbox prototype sorting and flagging synthetic items; care gap prototype calculating CVD risk and simple diabetes gaps on synthetic patients

**Success criteria:**
- All 3 architecture approaches tested on representative use cases
- Foundation system stable and connected to both PMSs
- Architecture recommendations documented with empirical evidence

---

### Objective 2: Inbox Helper – Admin Automation and Early Clinical Overlays (Months 4-12)

**Dates:** 1 Apr 2026 – 31 Dec 2026

**Plain-English aim:** Turn Inbox prototype into practical tool that reduces GP inbox workload and highlights urgent issues safely in both Medtech and Indici. **Lean MVP released to early adopters as soon as safety thresholds met.**

**Key R&D questions:**
- Can lightweight models safely handle messy, real NZ inbox data (vs synthetic data)?
- What confidence level is safe enough for auto-filing normal results without risking missed urgents?
- How should AI suggestions appear in Medtech and Indici so GPs understand and trust them (explanations, overrides, layouts)?

**Features developed:**

**Triage and processing:**
- Automatically classify real inbox items into: labs, hospital letters, specialist letters, referrals, prescriptions, admin, patient messages
- Assign urgency labels: "Review today" (serious abnormalities or red-flag letters), "Soon", "Routine"
- Compare current labs with previous ones: "HbA1c increased from 48 to 62 mmol/mol over 12 months"

**Automation:**
- Normal screening results: normal mammograms → auto-file with standard text ("Normal 2026, repeat 2028") and recall set; normal HPV cervical screens → auto-file with appropriate recall interval
- Normal blood tests in agreed-safe categories auto-filed with GP-authored standard comments and correct recall intervals based on NZ guidelines

**Clinical overlays (early, non-prescribing):**
- Rule-based flags on labs and trends: "eGFR 45 suggests possible CKD stage 3b – consider review", "HbA1c >64 indicates poor diabetes control – discuss management"
- No specific drug recommendations; instead, prompts aligned with guideline actions

**Patient handoffs:**
- Generate simple, editable messages: "Your test results are normal; no changes are needed", "Your cholesterol is raised; please book a nurse appointment to discuss lifestyle and options"
- Support for SMS/portal/email templates, with GP approval before sending

**Medtech and Indici integration:**
- Common Inbox Helper widget used in both systems
- In Medtech: integrated in inbox view, showing AI classification, urgency, suggested actions, one-click approval or override
- In Indici: similar AI summaries and action buttons adapted to Indici's layout and workflow
- R&D focus: measure and compare performance, errors, GP interactions across both PMSs; adjust architecture and UI to generalise

**Lean MVP and ongoing R&D:**
- A lean MVP of the Inbox Helper will be released to early adopter practices as soon as minimum safety and accuracy thresholds are met (≥90% triage accuracy, zero unsafe auto-filing in 1,000 edge-case tests), with further triage, automation, and patient-message features added during remainder of project
- R&D continues in parallel on: expanding supported document types, improving explanations, optimising confidence thresholds and UI based on feedback

**Deliverables by Month 12:**
- Inbox Helper fully functional in Medtech and Indici sandbox environments
- Validation on ≥2,000 real inbox items (de-identified or safe test environments) showing: ≥90% classification accuracy, zero unsafe auto-filing in edge-case test suite, measured ~30% time saving in simulated GP workflows
- Usability feedback from at least 5 GPs incorporated into system design and defaults

**Success criteria:**
- Inbox Helper achieves ≥90% classification accuracy on real data
- Zero unsafe auto-filing events detected in edge-case testing
- GP satisfaction ≥80% in usability testing
- Architecture validated (simple classifier vs LLM) for inbox tasks

---

### Objective 3: Care Gap Finder – Chronic Disease Intelligence (Months 7-16)

**Dates:** 1 Jul 2026 – 30 Apr 2027

**Plain-English aim:** Build tool that scans patient records to find people overdue for key chronic disease checks (starting with diabetes and cardiovascular risk, then COPD, CHF, and asthma) and helps practices get those patients seen. **Lean MVP (diabetes + CVD) released early, then expanded.**

**Key R&D questions:**
- Can NZ-trained AI reliably pull out key details (smoking status, medications, severity markers) from messy free-text clinical notes as well as structured fields?
- How can care gap logic handle multiple conditions (diabetes + CKD + CVD) without overwhelming GPs with alerts?
- How should patients be prioritised so that high-risk and Māori/Pacific patients are not left behind?

**Features developed:**

**Data review and analysis:**
- Diabetes: Reads HbA1c trends, ACR, diabetes diagnoses; flags overdue HbA1c tests, eye checks, foot checks, kidney monitoring
- Cardiovascular risk: Pulls age, sex, ethnicity, BP, lipids, smoking, diabetes; calculates NZ CVDRA and groups patients by risk band (low, moderate, high)
- COPD: Identifies COPD diagnoses and last spirometry; flags overdue lung function tests and frequent exacerbations based on notes
- Heart failure (CHF): Tracks BNP and eGFR trends; flags patterns suggesting worsening heart failure needing review
- Asthma: Uses medication patterns and note content to estimate control (frequent reliever use); flags patients who may require step-up therapy review

**Care gap detection:**
- For each condition, checks: Are recommended tests up to date? Are monitoring visits overdue? Are key guideline-based checks missing (vaccines, retinal screening)?
- Combines multiple conditions to avoid double-alerting and reflect highest-priority needs

**Patient communication:**
- Generates personalised, plain-language messages: "Your diabetes review is overdue; please book an appointment with our nurse", "You are at higher risk of heart disease; your doctor recommends a heart health check"
- Supports different channels (SMS/portal/email), with practice-controlled templates and review

**GP/practice dashboards:**
- "Top priority patients" list showing: who has important gaps, why they are flagged, suggested next step (book nurse review, book GP review)
- Filters by: condition (diabetes-only list), risk level, equity focus (Māori, Pacific, high-deprivation)

**Medtech and Indici integration:**
- Care Gap Finder panels integrated into both PMSs
- At patient level: show their current gaps and recent relevant results
- At practice level: show lists of patients needing action and allow staff to bulk-send recalls or schedule clinics

**Lean MVP and ongoing R&D:**
- A lean MVP of the Care Gap Finder (starting with diabetes and CVD risk) will be released early once core targets are met (≥95% CVDRA accuracy, ≥85% care-gap detection vs GP audit, safe messaging), then expanded to COPD, CHF, asthma and more advanced dashboards as NZ-LLM and rules are refined
- R&D continues on: adding COPD/CHF/asthma logic, improving multi-condition logic and prioritisation, refining NZ-LLM extraction and equity-aware algorithms

**Deliverables by Month 16:**
- Care Gap Finder operational in sandbox for both Medtech and Indici
- Validated on ≥1,000 de-identified patient records, showing: ≥95% accuracy for CVDRA, ≥85% agreement with GP audit on care gaps, demonstrated ability to prioritise high-risk and Māori/Pacific patients appropriately

**Success criteria:**
- CVDRA calculation ≥95% accurate
- Care gap detection ≥85% agreement with GP manual audit
- Demonstrated equity: Māori/Pacific patients appropriately prioritised without bias
- Hybrid architecture validated for clinical extraction and calculations

---

### Objective 4: Advanced Refinement, Safety, Equity and Generalisation (Months 16-24)

**Dates:** 1 Apr 2027 – 26 Jan 2028

**Plain-English aim:** Use real-world feedback and pilot data to do "hard" R&D work: refine NZ-LLM models, tune alert and safety behaviour, and prove system generalises across multiple practices and both PMSs. **This is systematic R&D on generalisation and safety, not routine maintenance.**

**Key R&D questions:**
- How much does performance change when moving from pilot practices to new practices with different patient populations, clinicians, and workflows?
- How can alert thresholds and messaging be tuned to minimise "noise" while still catching all important issues (alert fatigue vs safety)?
- How can NZ-LLM and rules be refined to support equitable performance across regions and populations?

**Activities and features:**

**NZ-LLM and rules refinement using real-world data:**
- Analyse model errors, missed gaps, and mis-classified inbox items observed during early adopter use
- Retrain or fine-tune NZ-LLM and adjust rules to: improve extraction from messy real-world notes and letters, reduce misunderstanding of local abbreviations and phrasing, maintain strict constraints (never recommend specific medications, always show reasoning)

**Safety and alert optimisation:**
- Collect statistics on: how often alerts are accepted, ignored, or dismissed; which alerts GPs and nurses find most/least useful
- Adjust thresholds and logic to: maintain very high sensitivity for safety-critical events (dangerous labs, major gaps), reduce lower-value or repetitive alerts to avoid fatigue
- Expand automated safety testing and regression suites to thousands of test scenarios, including adversarial prompts and rare edge cases

**Multi-practice, multi-PMS generalisation:**
- Run structured pilots across several practices using both Medtech and Indici
- Compare accuracy, safety, and usage patterns by region, practice size, and patient mix
- Investigate any performance gaps (poorer results in particular regions or populations) and fix them through model, rule, or data changes
- Document technical patterns and best practices for adding future PMSs or health-system integrations

**Deliverables by Month 24:**
- Refined NZ-LLM models and rule sets with documented accuracy and safety across multiple practices, evidence of robust performance across both Medtech and Indici
- Alert and safety configuration tuned based on real usage, with clear quantitative metrics for: alert rates, acceptance/override patterns, safety outcomes (no missed critical results in tested cohorts)
- Final pilot report summarising: time savings per GP per day, care gaps identified and closed, equity metrics (changes in Māori/Pacific screening and review rates), safety incidents (if any) and mitigation processes
- Clear roadmap for broader commercial rollout (including Years 3-5 HealthHub NZ vision and advanced R&D streams) grounded in R&D findings

**Success criteria:**
- System performance maintained across multiple practices and both PMSs (no >10% accuracy degradation)
- Alert fatigue ≤3/10 (measured via GP survey)
- Safety targets maintained (prohibited-claim ≤0.5%, zero serious violations)
- Pilot retention ≥80% (GPs stay in pilot for full duration)
- Equity metrics validated: Māori/Pacific patients benefit equally

---

## Capability Development Activities

### CDP-3: Regulatory & Compliance ($18,000, Months 2-18)

**Third-party professional services only (no internal labour):**

**Purpose:** Build expert-level regulatory and compliance capability for NZ health AI, focusing on avoiding pilot shutdown due to compliance failures and establishing frameworks for Years 3-5 HealthHub NZ.

**Activities may include:**
- **Comprehensive Regulatory Gap Analysis ($3,500, Months 2-3):** Privacy Act 2020, HIPC, IPP 12, clinical safety frameworks, AI ethics compliance audit; identifies compliance risks early with prioritised remediation roadmap
- **Comprehensive DPIA ($4,000, Months 3-5):** Data Privacy Impact Assessment for cross-border data handling (AU inference, NZ-held keys), risk assessment, mitigation strategies; required before pilot deployment
- **Clinical Safety Advisory ($3,500, Months 4-12):** Medical device software risk assessment, assist-only constraints validation, safety system reviews across MVP, sandbox, and pilot phases
- **Ongoing Regulatory Adviser ($5,000, Months 4-18):** Expert guidance through development, sandbox, pilot, and scale-up phases; approximately 6-8 advisory sessions scheduled flexibly based on R&D milestones and compliance needs
- **Compliance Documentation & Governance ($2,000, Months 4-6):** Governance frameworks, compliance templates, PHO data handling protocols, incident response runbooks, DPA templates

**Deliverables may include:** Gap analysis report, complete DPIA, clinical safety validation reports, advisory session reports, governance framework, compliance documentation templates

**Total CDP-3:** $18,000

---

### CDP-6: R&D Information Management ($10,000, Months 2-8)

**Third-party professional services only (no internal labour):**

**Purpose:** Build systematic R&D documentation and LLM development capabilities essential for reproducible research, architectural paradigm comparison, and knowledge transfer to future projects.

**Activities may include:**
- **R&D Experiment Tracking & Model Registry Setup ($4,000, Months 2-4):** Design and implement centralised experiment tracking system (MLflow or similar), model versioning, dataset lineage, research dashboard; training for founder and Ting
- **LLM Methods Advisory ($6,000, Months 2-8):** Approximately 5-8 advisory sessions focused on experiment design, standardised evaluation frameworks, and architectural comparison methodologies that integrate with experiment tracking, model registry, and dataset lineage systems; ensures research outputs are consistently documented and comparable across projects; flexible scheduling based on R&D progress

**Deliverables may include:** Configured experiment tracking system, model registry, standardised evaluation frameworks, experiment design templates, architecture comparison methodologies, research documentation workflows

**Total CDP-6:** $10,000

---

### CDP-5: Project Management ($8,000, Months 2-16)

**Third-party professional services only (no internal labour):**

**Purpose:** Build R&D project management capability for Ting (Operations Lead) to systematically manage complex R&D programme, transforming team from solo founder to structured R&D organisation.

**Phase 1 - Intensive Training & Setup (Months 2-4): $3,500**
- Training on R&D project management fundamentals (planning under uncertainty, budget tracking, risk management, documentation, vendor management, stakeholder communication)
- System setup with Ting leading: Agile R&D workflows (Kanban), 24-month roadmaps, budget tracking, risk registers, vendor management workflows
- Ting learns to manage CapDev procurement process (finding vendors, scoping work, managing contracts)

**Phase 2 - Ongoing Coaching (Months 5-16): $4,500**
- Approximately 6-8 coaching sessions scheduled around critical milestones (objective transitions, MVP launches, pilot preparation, mid-project reviews)
- Decision-making support for R&D trade-offs, problem-solving bottlenecks, refining Ting's R&D management skills
- Flexibility to add sessions if R&D challenges emerge

**Why this builds capability:**
- Ting learns how to manage R&D programmes (not just admin work)
- Meta-capability development: Ting manages procurement of other CapDev services (regulatory, R&D info systems)
- Demonstrates growth intention beyond solo founder
- After 24 months, Ting has skills to manage future R&D projects

**Deliverables may include:** R&D PM training materials, configured PM system, coaching session reports, Ting-maintained roadmap/budget/risk register, vendor management records, monthly progress reports

**Total CDP-5:** $8,000

---

**Total Capability Development:** $36,000 (third-party professional services only)

**CapDev Requirement Check:**
- Required: ≥5% of total eligible costs = $35,846 (for $716,926 total)
- Actual: $36,000
- **Percentage: 5.02% ✓** (meets requirement)

**Rationale for Structure:** As a first-time R&D performer, we prioritise capabilities that directly de-risk the R&D programme (compliance, systematic documentation, project management). IP protection will be addressed post-grant once innovations are validated and commercial pathway is clear. Broad descriptions with "may include" language reflect appropriate flexibility for first-time R&D where specific needs emerge during programme execution.

---

**Free Training (Supplementary, Not Counted in CapDev Budget):**
- Privacy: OPC Privacy Act 2020, OPC Health 101 HIPC, Ko Awatea Privacy
- AI in Healthcare: Collaborative Aotearoa AI in Primary Care modules
- IP Knowledge: IPONZ patent basics and resources

---

## Materials & Consumables ($24,000)

**Monthly M&C:** $1,000/month × 24 months = $24,000

**Breakdown per month:**
- Development tools and software licenses: $320/month
  - GPU cloud compute (Lambda Labs/AWS): $200/month
  - MLflow/DVC/monitoring tools: $80/month
  - Development IDEs and subscriptions: $40/month

- Cloud infrastructure: $680/month
  - NZ storage (PHI at rest): $300/month
  - AU inference (transient, no persistent PHI): $250/month
  - Networking and data transfer: $80/month
  - Monitoring and security (SIEM): $50/month

**Rationale:** Cloud-first GPU strategy (vs purchasing GPU workstation) provides better grant coverage (40% for cloud costs vs 26.7% for hardware depreciation) and operational flexibility. M&C budget allows scaling compute during intensive phases (Objectives 2-3) without upfront capital.

---

## Hardware & Equipment ($1,800)

**Immediate expenses only (all in Year 1):**
- RAM Upgrade 128GB: $800 (Month 1) – Large synthetic dataset loading, model checkpoint caching
- NVMe SSD 2TB: $400 (Month 1) – Fast model checkpoint storage and retrieval
- Dual 27" Monitors: $400 (Month 4) – Multi-screen development workflow (code + logs + PMS testing)
- Dual Monitor Arms: $100 (Month 4) – Ergonomic setup for extended R&D sessions
- iPhone SE (3rd gen): $100 (Month 4) – iOS mobile testing for GP workflows

**Total Hardware Year 1:** $1,800

**Hardware Strategy:**
- **GPU workstation ($11k) deferred** – using cloud GPU infrastructure (budgeted in M&C)
- Benefits: Better grant coverage (40% vs 26.7%), operational flexibility, no depreciation complexity
- Cloud GPU provides: scalable compute during intensive phases, no maintenance overhead, pay-as-you-go

**Note:** Workstation can be purchased with co-funding or post-grant if local testing needs increase beyond cloud capabilities.

---

## Total Budget Summary (24 Months)

| Category | Amount (NZD excl. GST) |
|----------|------------------------|
| **R&D Labour - Founder** (3,120 hrs @ $96/hr) | $299,520 |
| **R&D Labour - Ting** (4,152 hrs @ $70/hr) | $290,640 |
| **R&D Labour - Developer** (903 hrs @ $72/hr, minimum) | $65,016 |
| **Capability Development** (third-party services only) | $36,000 |
| **Materials & Consumables** (includes hardware) | $25,750 |
| **Total R&D Eligible Costs** | **$716,926** |
| | |
| **Grant (40%)** | **$286,770** |
| **Co-Funding (60%)** | **$430,156** |

---

## Co-Funding Evidence

**Shareholder Funds:**
- **Business account opening cash: $130,000 NZD**
- **Ting's reserve account: $85,000 NZD** (drawn strategically during project in 3 installments)
- **Emergency buffer: $15,000 NZD** (retained in Ting's account as prudent reserve)
- **Total shareholder funds available: $230,000 NZD**
- **Total deployed: $215,000 NZD**
- Source: Founder + Ting shareholder funds

**GP Clinical Work Income (24 months):**
- Total revenue (excl. GST): $266,800
- Monthly income: $11,117/month
- Work schedule: 20 hrs/week @ $145/hr (excl. GST)
- Total work commitment: 50 hrs/week (20 hrs GP + 30 hrs R&D)

**Co-funding requirement:** $430,156
**Total deployed:** $481,800 (shareholder funds $215k + GP income $266.8k) ✓
**Surplus:** $51,644 ✓
**Emergency buffer:** $15,000 (retained in Ting's account) ✓

**Cashflow position:** Managed throughout 24 months with strategic draws from Ting's reserve - Detailed 24-month forecast shows Ting's reserve drawn in 3 installments (Month 12: $35k, Month 15: $30k, Month 18: $20k = $85k total) to cover timing gaps before grant payments arrive. First draw delayed to Month 12 (from Month 9) thanks to $130k opening cash. Lowest point $16,968 (Month 24), closing balance $51,391, plus $15k emergency buffer = $66,391 total protection

**Drawdown Strategy:** Ting's reserve provides buffer for 1-month grant payment lag, with draws timed strategically before each grant payment arrives

**See:** Detailed 24-month cashflow forecast provided separately.

---

## Success Metrics (for Internal Tracking)

### Utility Targets
- Inbox triage time savings: ≥30% reduction (saves 1-2 hours/day per GP)
- Care gap monitoring completion: ≥80%
- PHO quality indicator improvement: ≥10%
- Clinician usefulness rating: ≥80% for both use cases

### Safety Targets
- Prohibited-claim rate: ≤0.5%
- Refusal appropriateness: ≥95%
- PHI leakage: Zero
- **Hard stop:** If any safety metric fails, halt all releases until fixed

### Performance Targets
- Response time (P95): ≤5.0s
- Throughput stability: No crashes under load
- Unit economics: Stable cost per 1,000 requests

### Equity Targets
- Māori/Pacific patient prioritisation: Demonstrated in dashboards and pilot metrics
- No under-alerting in high-risk populations: Validated through pilot audit
- Care gap closure rates equal across ethnic groups: Measured in pilot report

### R&D Success Threshold
**We DO NOT need to match GPT-4 100%.** Success = achieving **70-80% of GPT-4 quality at 20-50x lower cost** while maintaining safety, sovereignty, and equity goals.

---

## Future R&D Plans Beyond This Application (Years 3-5+)

**Portal Question:** "Provide a brief, high-level overview of your future R&D plans beyond the R&D within this application. Your activities must be more than improvements to the R&D covered under this application" (Maximum 250 words, bullet points preferred)

---

**Vision:** By Year 5, any New Zealander can access personalised health guidance powered by NZ-sovereign AI.

**Core R&D Project: NZ Health Intelligence Layer (Years 3-5)**

The 24-month grant validates NZ-trained LLM for GP-facing tools. Years 3-5 extend this to patient-facing care and national-scale learning.

**1. Patient-Facing AI (HealthHub NZ) - Years 3-4**

Patients access complete health records (diagnosis, medications, test results, hospital visits) with AI guidance on their phones.

**AI R&D questions:**
- How do you train NZ-LLM to communicate medical information safely across different health literacy levels (18-year-old vs 75-year-old vs te reo speaker)?
- Can NZ-LLM validate patient-entered data (blood pressure readings) by learning clinical patterns?

**Benefits:** Rural patients get after-hours guidance, chronic disease patients monitor at home, better engagement improves outcomes.

**2. AI Learning From Real-World Outcomes - Years 4-5**

Train NZ-LLM on aggregated patient outcomes to improve recommendations.

**AI R&D questions:**
- Can NZ-LLM learn from thousands of diabetes patients' outcomes to identify which interventions actually work?
- Can AI identify emerging health trends (e.g., "South Auckland diabetes screening rates dropping 15%, intervention needed")?

**Benefits:** AI recommendations improve based on actual NZ patient outcomes. Evidence-based insights for government health planning.

**3. National Scale Integration - Years 4-5**

Extend beyond Medtech/Indici to hospital systems and national records.

**AI R&D questions:**
- How does one NZ-trained LLM generalise across different hospital data formats while maintaining accuracy?

**Benefits:** Connected care where patient sees specialist and GP gets AI summary automatically. No repeated tests, no lost referrals.

**Why Substantial R&D:** Patient-facing AI requires different safety training than GP-facing AI. Learning from outcomes without compromising safety is unsolved AI research. National-scale generalisation requires novel training approaches.

**Supports government goal:** Makes 10-year digital health plan intelligent and accessible for all New Zealanders.

---

**Document Version:** 3.1  
**Last Updated:** 29 November 2025  
**Status:** Ready for Forge portal submission

**Version 3.1 Changes:**
- Updated CapDev to $36,000 (5.02% of total costs) per Paula's confirmation
- Added 4 CapDev categories: IP ($7.5k), Regulatory ($15k), R&D Info Management ($8.5k), Project Management ($5k)
- Updated total eligible costs to $716,926
- Updated grant to $286,770 and co-funding to $430,156
