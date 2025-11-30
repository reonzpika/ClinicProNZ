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

NexWave Solutions Ltd develops privacy-preserving AI tools for NZ general practice. We will build a NZ-sovereign clinical AI assistant with two core tools:

1. **Inbox Helper (Reactive):** Triage, classify, and auto-file inbox items (labs, letters, referrals). Compare labs with previous results, flag urgent issues, generate patient messages. Saves 1-2 hours/day per GP.

2. **Care Gap Finder (Proactive):** Scan patient records to identify overdue chronic disease checks (diabetes, CVD, COPD, CHF, asthma). Generate recall lists, prioritise high-risk and Māori/Pacific patients. Supports PHO quality indicators.

The system is strictly assist-only. It never provides diagnostic or treatment directives. Development uses synthetic and de-identified data only; no production PHI is used for model training.

**Dual PMS integration:** The system will integrate with both Medtech and Indici PMSs from Objective 1, allowing research on multi-PMS generalisation and broader market reach.

**Hosting and privacy:** Inference may occur in Australia with no persistent PHI outside New Zealand. All PHI at rest remains in NZ with NZ-held keys. Cross-border processing is governed by Privacy Act 2020 IPP 12 safeguards, HISO 10029 security controls, and a DPIA completed pre-pilot. We align with Te Whatu Ora's NAIAEAG precautionary guidance (no PHI into unapproved LLMs; transparency; human oversight).

**Lean MVP approach:** Early versions of both tools will be released to paid early adopters as soon as minimum safety and accuracy thresholds are met, with ongoing R&D continuing through month 24.

---

## Eligibility Confirmations

- NZ-incorporated company; solvent; intends to conduct ongoing R&D.
- **New to R&D:** <$150k total R&D in last three years; no R&D grants/loans >$5k in last three years.
- Not grouped with an R&D performer (>$150k in last three years).
- Able to fund 60% co-funding from GP clinical work income; evidence provided.

---

## Describe Planned R&D Activities (~250 words)

Build a NZ-trained clinical LLM and validate which AI architecture (simple classifiers, hybrid rules+LLM, or NZ-trained LLM) works best for different clinical risk levels:

**Inbox Helper (Objective 2):**
- Triage and classify inbox items (labs, hospital letters, specialist letters, referrals, prescriptions, admin, patient messages)
- Auto-file normal screening results with appropriate recall intervals
- Compare current labs with previous results, flag trends
- Rule-based clinical overlays (non-prescribing)
- Patient communication message generation

**Care Gap Finder (Objective 3):**
- Data extraction from free-text clinical notes for 5 chronic conditions (diabetes, CVD, COPD, CHF, asthma)
- Care gap detection with multi-condition logic
- Patient prioritisation (high-risk, Māori/Pacific equity focus)
- GP/practice dashboards with equity filters
- Automated patient recall list generation

**Multi-PMS Integration (Objectives 1-4):**
- Connect to both Medtech and Indici via FHIR/related APIs
- Research architectural patterns for multi-PMS generalisation
- Validate performance consistency across different PMSs

**Domain adaptation:** Train NZ-LLM on curated NZ clinical corpus (bpac, MoH, Pharmac, lab formats) and synthetic/de-identified datasets. No training on production PHI.

**Safety:** Assist-only constraints, prohibited-claim detection, refusal scaffolds, monthly safety regressions with hard stops if metrics fail.

**Evaluation:** Architecture comparison (accuracy, cost, latency), clinician usefulness, equity metrics (Māori/Pacific patient outcomes), alert fatigue rates, real-world pilot with 10-20 GPs.

---

## Uncertainty – What is the Specific Uncertainty? (~250 words)

**Primary uncertainty:**
Which AI architecture works best for different clinical risk levels while maintaining safety, cost-effectiveness, and performance across multiple PMSs?

**Specific uncertainties:**

1. **Architecture selection:** Can simple classifiers safely handle low-risk tasks (inbox triage) at $0.002/request? Or do we need more expensive LLMs? Do clinical calculations require hybrid rules+LLM to prevent hallucination?

2. **NZ-LLM effectiveness:** Can a NZ-trained small model (7B-13B parameters) understand local clinical language (bpac/MoH guidance, Pharmac medication names, regional lab formats, Medtech/Indici note styles) better than generic models like GPT-4?

3. **Multi-PMS generalisation:** Will an architecture that achieves 90% accuracy in Medtech maintain similar performance in Indici, or will we need PMS-specific adaptations? How do we design one system that works across both without major rework?

4. **Alert fatigue thresholds:** How many care gap alerts can we show before GPs start dismissing them? What's the optimal balance between sensitivity (catching all gaps) and specificity (avoiding noise)?

5. **Equity maintenance:** Can we prioritise high-risk and Māori/Pacific patients without introducing bias or under-alerting in other populations?

6. **Real-world accuracy degradation:** How much does performance drop from synthetic data (Objective 1) to sandbox testing (Objectives 2-3) to real-world pilot (Objective 4)?

The right balance of architecture complexity, NZ domain adaptation, safety constraints, and multi-PMS compatibility cannot be known in advance. Systematic experimentation across objectives is required.

---

## R&D Challenge – Why is This Difficult for a Professional? (~250 words)

A competent professional cannot deduce working solutions without systematic R&D because:

**Architecture trade-offs are non-obvious:** Simple classifiers are cheaper but may miss nuanced clinical content. LLMs are more capable but risk hallucination on calculations (e.g., CVDRA). Hybrid approaches add complexity. The optimal choice varies by task risk level and cannot be determined by inspection—requires empirical testing.

**Multi-PMS complexity:** Medtech and Indici have different data structures, APIs, and clinical note patterns. An architecture that works in one PMS may fail in another due to subtle differences in how data is stored and retrieved. Generalisation patterns must be discovered through testing.

**NZ-specific language understanding:** Local clinical language includes regional abbreviations, Māori health terms, Pharmac-specific medication names, and DHB-specific letter formats. No published work provides recipes for achieving high accuracy on NZ-specific clinical tasks with small models under strict privacy constraints.

**Safety and alert fatigue interaction:** Adding safety constraints (refusal scaffolds, prohibited-claim detection) affects model outputs in ways that interact with alert fatigue. Too many refused suggestions frustrate GPs; too few safety checks risk harm. Finding the optimal balance requires systematic testing with real GP feedback.

**Emergent behaviour:** Interactions between NZ domain adaptation, safety tuning, quantisation for cost reduction, and streaming for low latency create emergent behaviour that cannot be predicted from component specifications alone.

**Equity without bias:** Prioritising Māori/Pacific patients requires careful algorithm design to avoid unintended under-alerting or over-alerting. Standard ML fairness techniques don't directly apply to multi-condition clinical monitoring with equity goals.

---

## Knowledge Availability – What Exists and Why It's Insufficient? (~250 words)

**Existing solutions:**
- AI scribes exist overseas (Abridge, Nuance DAX) but are not tuned for NZ language, Pharmac medication names, or local GP workflows
- Generic LLMs (GPT-4, Claude) can handle some clinical tasks but are expensive ($0.15/request), not NZ-tuned, and lack transparent data lineage
- Academic papers describe RAG, LoRA/QLoRA fine-tuning, and guardrails but don't provide NZ-specific guidance or guarantees for assist-only performance

**Why existing knowledge is insufficient:**

1. **No NZ-specific inbox solution:** There is no published, validated solution for NZ GP inbox management. International tools don't understand LabTests Auckland vs SCL vs Medlab report formats, DHB letter templates, or regional clinical variations.

2. **No multi-PMS architectural patterns:** Published work focuses on single EMR/PMS integration. Patterns for maintaining performance across multiple PMSs (Medtech and Indici) with different data structures are not documented.

3. **No small-model NZ clinical benchmarks:** Academic papers benchmark large models (GPT-4, 70B+ parameters) but provide no guidance on whether 7B-13B parameter models can achieve acceptable accuracy on NZ clinical tasks. Cost-effectiveness trade-offs at scale are unknown.

4. **Proprietary implementations:** Commercial tools don't disclose architecture choices (simple vs hybrid vs LLM-only), training data composition, safety mechanisms, or performance characteristics needed to replicate their results under NZ privacy constraints (IPP 12, no persistent PHI outside NZ).

5. **No equity-focused algorithms:** Published fairness work focuses on binary protected attributes. Multi-condition clinical monitoring with Māori/Pacific equity goals requires novel approaches not available in literature.

Therefore, systematic R&D is required to resolve these uncertainties.

---

## Newness – What is New? (~250 words)

**Novel system features:**

1. **Dual PMS integration from day one:** First NZ clinical AI designed to work across both Medtech and Indici, with systematic R&D on multi-PMS generalisation patterns.

2. **Architecture validation R&D:** Systematic comparison of simple classifiers, hybrid rules+LLM, and NZ-trained LLM across different clinical risk levels (low-risk admin tasks vs medium-risk clinical calculations vs high-risk safety decisions). No prior work provides this risk-based architectural framework for NZ primary care.

3. **NZ-tuned clinical LLM:** Small model (7B-13B parameters) trained specifically on NZ clinical corpus (bpac, MoH, Pharmac, regional lab formats) with transparent data lineage. First sovereign clinical LLM for NZ primary care.

4. **Lean MVP with ongoing R&D:** Novel approach releasing early MVPs to paid adopters while continuing substantial R&D through month 24 on generalisation, safety tuning, and equity algorithms. Not just "build then release"—systematic feedback-driven refinement.

5. **Equity-focused care gap algorithms:** Novel prioritisation logic explicitly designed for Māori/Pacific patient equity without introducing bias in other populations. Validated through pilot metrics.

6. **Multi-PMS alert fatigue research:** First systematic study of alert fatigue thresholds across different PMS interfaces and practice workflows. Findings inform optimal alert presentation strategies.

7. **Long-term R&D roadmap:** Clear vision for Years 3-5 extending to patient-facing HealthHub NZ app, multimodal models, continual learning, te reo support, and real-world outcome trials. Demonstrates commitment to sustained R&D beyond this grant.

**Value to sector:** Provides NZ primary care with sovereign, auditable, cost-effective clinical AI under Privacy Act 2020 controls. Inbox Helper and Care Gap Finder address urgent GP workload and burnout issues.

---

## Why is it Better? (~250 words)

**Clinician value:**
- **Time savings:** 1-2 hours/day per GP on inbox triage and care gap monitoring
- **Patient safety:** Systematic care gap identification reduces missed monitoring (diabetes, CVD, COPD, CHF, asthma)
- **Equity outcomes:** Prioritisation logic ensures Māori/Pacific patients aren't left behind
- **Multi-PMS flexibility:** Works in both Medtech and Indici, reaching broader GP market

**Safety and trust:**
- **Assist-only constraints:** Never provides diagnostic or treatment directives
- **Measurable safety:** Monthly regressions with hard stops (prohibited-claim ≤0.5%, refusal ≥95%)
- **Transparent:** Public source register, model cards, update logs, regions/sub-processors disclosed

**Sovereignty and cost-effectiveness:**
- **NZ data control:** All PHI at rest in NZ with NZ-held keys
- **Cost-effective at scale:** 20-50x cheaper than Azure OpenAI ($5-10k/month vs $140-170k/month for 5,000 GPs)
- **Predictable performance:** Local/AU infrastructure provides stable latency and unit economics

**Procurement readiness:**
- **Privacy compliance:** DPIA completed, IPP 12 controls, HISO 10029 mapping
- **Audit trails:** Full data lineage, versioning, change logs
- **Sector validation:** Real-world pilot with 10-20 GPs provides evidence of effectiveness

**Long-term vision:**
- **Years 3-5 roadmap:** Patient-facing HealthHub NZ app reuses validated architecture
- **Advanced R&D:** Vision-capable models, learning from real-world use, te reo support, outcome trials
- **Ecosystem contribution:** Open patterns for multi-PMS integration benefit wider sector

**Commercial validation:** Lean MVPs with early adopters demonstrate market demand before full rollout.

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

**Rationale for team structure:** Founder's dual GP/technical expertise enables rapid clinical workflow iteration and NZ-specific domain understanding. Ting as full-time R&D Operations Lead provides dedicated project management, systematic testing, and quality assurance—demonstrating growth intention beyond solo founder. Developer contractor provides flexible capacity to scale up during intensive development phases (Objectives 2-3) without fixed overhead. This structure maintains GP practice income for co-funding while enabling substantial 24-month R&D programme.

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

### CD-A: Intellectual Property ($7,500, Months 2-6)

**Third-party professional services only (no internal labour):**

**1. IP Audit & Freedom-to-Operate (FTO) Analysis: $2,000**
- Provider: NZ patent attorney
- Timing: Months 2-3
- Deliverables: FTO report, prior art search, IP landscape map, patentability assessment

**2. Provisional Patent Filing: $4,500**
- Provider: NZ patent attorney  
- Timing: Months 3-6
- Deliverables: Provisional patent application filed with IPONZ covering clinical LLM architecture, workflows, integration methods; secure priority date for 12-month full filing window

**3. NDAs, Contracts & Trademark: $1,000**
- Provider: Legal adviser
- Timing: Months 4-6
- Deliverables: Mutual NDA templates, collaboration agreements, trademark search/filing

**Total CD-A:** $7,500

---

### CD-B: Regulatory & Compliance ($7,500, Months 2-18)

**Third-party professional services only (no internal labour):**

**1. Comprehensive Regulatory Gap Analysis: $3,500**
- Provider: Privacy/regulatory consultant
- Timing: Months 2-3
- Deliverables: Privacy Act 2020, HIPC, IPP 12, clinical safety, AI ethics compliance audit

**2. Ongoing Regulatory Adviser (6 sessions): $3,000**
- Provider: Privacy/regulatory expert
- Timing: Months 4, 6, 9, 12, 15, 18 (~$500 per session)
- Deliverables: Expert guidance through MVP, sandbox, pilot, scale-up phases; session reports

**3. Compliance Roadmap & Documentation: $1,000**
- Provider: Legal/compliance adviser
- Timing: Months 4-6
- Deliverables: Governance framework, DPA templates, data handling protocols, incident response; includes DPA negotiation support with Medtech/Indici/sub-processors

**Total CD-B:** $7,500

---

**Total Capability Development:** $15,000 (third-party professional services only)

**CapDev Requirement Check:**
- Required: ≥5% of grant = $13,915 (for $278,305 grant)
- Actual: $15,000
- **Percentage: 5.39% ✓** (exceeds requirement by $1,085)

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
| **Capability Development** (third-party services only) | $15,000 |
| **Materials & Consumables** ($1,000/month × 24) | $24,000 |
| **Hardware** (immediate expenses only) | $1,800 |
| **Total R&D Eligible Costs** | **$695,976** |
| | |
| **Grant (40%)** | **$278,390** |
| **Co-Funding (60%)** | **$417,586** |

**Note:** Grant amount in quarterly schedule sums to $278,305 due to rounding; difference of $85 is negligible.

---

## Co-Funding Evidence

**GP Clinical Work Income (24 months):**
- Total revenue (excl. GST): $375,652
- Business expenses (5%): $18,783
- **Net GP income available for co-funding: $356,869**

**Monthly average:**
- GP revenue: $15,652/month
- GP expenses: $783/month  
- Net available: $14,869/month

**Opening cash:** $100,000 NZD (business account)

**Cashflow position: ✓ POSITIVE THROUGHOUT**
- Opening: $100,000
- Never goes negative
- Minimum cash: $4,246 (Month 24, before final grant)
- Closing: $39,185 after all costs and grants
- **AU reserve NOT required** ✓

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
- Can AI identify emerging health trends (e.g., "South Auckland diabetes screening rates dropping 15%—intervention needed")?

**Benefits:** AI recommendations improve based on actual NZ patient outcomes. Evidence-based insights for government health planning.

**3. National Scale Integration - Years 4-5**

Extend beyond Medtech/Indici to hospital systems and national records.

**AI R&D questions:**
- How does one NZ-trained LLM generalise across different hospital data formats while maintaining accuracy?

**Benefits:** Connected care—patient sees specialist, GP gets AI summary automatically. No repeated tests, no lost referrals.

**Why Substantial R&D:** Patient-facing AI requires different safety training than GP-facing AI. Learning from outcomes without compromising safety is unsolved AI research. National-scale generalisation requires novel training approaches.

**Supports government goal:** Makes 10-year digital health plan intelligent and accessible for all New Zealanders.

---

**Document Version:** 3.0  
**Last Updated:** 29 November 2025  
**Status:** Ready for Forge portal submission
