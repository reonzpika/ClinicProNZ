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

We will build NZ-trained AI for two GP clinical decision support tools (Inbox Helper and Care Gap Finder) under sovereignty constraints, requiring systematic research to determine optimal AI architecture.

**Main Research Activity: Determining Optimal AI Architecture**

Multiple AI system architectures exist with different trade-offs:

- **Lightweight AI models:** Fast and low-cost but limited reasoning capability
- **Retrieval-augmented systems (RAG):** Dynamically retrieve from NZ knowledge bases for better context
- **Agentic AI systems:** Multiple specialized agents working together for complex reasoning
- **Hybrid combinations:** Combining strengths of different approaches

**Research approach:**
- Investigate which architecture best fits NZ sovereignty constraints (no overseas APIs), clinical safety requirements, and cost sustainability
- Initial research and prototyping will determine most promising approaches to test
- Compare chosen approaches on two clinical tasks: **inbox triage** (lab interpretation, letter classification, urgency assessment) and **care gap monitoring** (multi-condition reasoning across 5 chronic conditions)
- Measure: clinical accuracy, computational cost, safety, performance across Medtech/Indici
- Research follows empirical evidence; likely hybrid approach but specific combination determined through systematic investigation

**NZ Healthcare Training**

- Train AI on curated NZ clinical corpus: bpac guidelines, Ministry of Health protocols, Pharmac database, regional lab formats, Medtech/Indici documentation patterns
- Test whether NZ-trained AI achieves clinical-grade accuracy (≥90% triage, ≥95% clinical calculations) at sustainable cost

**Real-World Validation**

- Pilot with 10-20 GP practices across diverse settings
- Measure: clinical utility, safety outcomes, equity metrics, performance stability
- Document: synthetic → sandbox → production performance translation

**Knowledge Outputs**

- Publish frameworks for NZ health AI sector
- Specific implementations remain competitive IP

---

## Uncertainty – What is the Specific Uncertainty? (~250 words)

**Core Uncertainty:** Which AI approach works for which clinical tasks under NZ sovereignty constraints?

**The AI Approach Dilemma**

Different tasks may need different AI types:

- **Simple pattern recognition** (normal lab auto-filing):
  - Can lightweight classifiers handle this safely?
  - Inexpensive but limited reasoning capability
  
- **Complex reasoning** (multi-condition care gaps):
  - Do we need sophisticated language models?
  - Can reason clinically but cost significantly more to run at scale
  
- **Mixed tasks** (inbox triage):
  - Would hybrid systems (combining different AI types) work better than either alone?

We cannot predict which approach fits which task without systematic testing:
- Cost-accuracy trade-offs unknown
- Simple models: cheap but may miss nuances
- Large models: powerful but expensive to run thousands of times daily
- Hybrid approaches: untested in clinical contexts

**Sovereignty constraint:**
- Must build NZ-trained AI systems (cannot use overseas APIs due to Privacy Act requirements)
- Don't know if NZ training will achieve clinical-grade performance comparable to international commercial models

**Secondary Uncertainties**

- **Real-world PMS integration:** Will AI trained on generic NZ health data (clinical guidelines, lab formats, documentation examples) work accurately when deployed in real practice management system environments (Medtech and Indici) where GP workflows happen? Training data is necessarily cleaner than messy production environments.

- **Safety interactions:** How do different AI types fail in clinical contexts? Which failures are dangerous vs acceptable? Simple classifiers fail predictably; large language models can "hallucinate" (fabricate values) or omit critical information unpredictably.

- **Equity algorithms:** How do we prioritize Māori/Pacific patients appropriately without creating bias or under-alerting other population groups? No published methods exist for multi-condition monitoring with NZ equity goals.

These uncertainties must be resolved to build a practical, safe, sovereign system that works in real GP workflows.

---

## R&D Challenge – Why is This Difficult for a Professional? (~250 words)

Experts cannot predict which AI approaches will work in clinical practice. Systematic experimentation is required because:

**1. Real Clinical Data Has High Variability and Inconsistency**

Clinical data varies in ways that break rigid automation:

- **Documentation inconsistency:** Terminology varies across GPs, missing fields common, GP-specific abbreviations differ by practice
- **Lab result variations:** Same test described differently across regions and providers (HbA1c 48 vs A1c 7.5% vs glycated Hb 64 mmol/mol)
- **Third-party systems change unpredictably:** Labs and hospitals modify formats and terminology without notice
- **Edge cases are frequent:** 5-15% of "routine" items have unusual characteristics
- **AI cannot rely on 100% rigid automation:** Must have clinical intelligence to interpret variations correctly
- Which AI types can adapt vs which break on variation cannot be deduced without testing

**2. AI Systems Fail Unpredictably**

Different AI types fail in different ways:

- **Simple classifiers:**
  - Fail on unfamiliar patterns
  - Cannot adapt to new variations (rigid, brittle)
  
- **Large language models:**
  - Two critical failure modes:
    - Hallucination: Fabricate missing clinical values
    - Omission: Skip critical information without warning
    
- **Hybrid systems:**
  - May propagate errors across components in unexpected ways

- Cannot predict which failures occur in real-world deployment without systematic testing
- Need to discover which AI characteristics provide clinical intelligence and adaptability vs rigid automation that breaks

**3. Performance Translation from Training to Deployment**

- AI trained on generic NZ health data (guidelines, lab reports, clinical notes) must work in real practice management system environments where GP workflows happen
- Deployment adds complexity: live workflows with interruptions, different user interfaces, varied data quality across practices, time pressure affecting documentation quality
- Which AI characteristics maintain accuracy and adapt to real-world variability?
- Cannot deduce without testing in actual GP workflows across diverse practice settings

Only systematic testing across real clinical environments reveals which approaches maintain accuracy, safety, and adaptability under operational conditions.

---

## Knowledge Availability – What Exists and Why It's Insufficient? (~250 words)

Existing solutions address different problems and don't resolve our specific uncertainties.

**1. Current NZ Clinical AI Tools**

- **Heidi (NZ market leader):**
  - Transcription and documentation only, not clinical decision support
  - Converts speech to text but doesn't interpret clinical meaning or make recommendations

- **InboxMagic:**
  - Early-stage MVP without published methods or deep practice management system integration
  - Unclear which AI approaches they use or whether they work at scale

- **SmartCareGP, HealthAccelerator:**
  - Rule-based admin automation, not clinical reasoning
  - Cannot handle multi-condition prioritization or adapt when formats change

- **Knowledge gap:** No AI trained on NZ healthcare context (bpac guidelines, Ministry of Health protocols, regional lab formats) that intelligently solves inbox overload and care gap monitoring with clinical reasoning. Current tools either do transcription (Heidi) or basic rule-based automation (others), not AI-powered clinical decision support.

**2. Overseas AI Systems**

- Commercial large language models (like GPT-4, Claude) prove that AI can perform clinical reasoning tasks
- However, they don't address critical unknowns for NZ deployment:
  - How to achieve comparable performance under NZ sovereignty constraints (no overseas APIs, Privacy Act compliance)?
  - At sustainable cost for NZ general practice operating at scale?
  - With NZ clinical context understanding (local guidelines, lab formats, ACC/PHO patterns)?
  - With equity algorithms prioritizing Māori/Pacific patients appropriately?

- **Knowledge gap:** No documented pathway exists for sovereign AI deployment achieving clinical-grade performance at sustainable cost with NZ contextual understanding.

**3. Academic Research**

- Published research tests isolated AI techniques (model fine-tuning, retrieval systems, hybrid architectures) on standardised, clean datasets
- Real-world deployment requires combined constraints: sovereignty + clinical safety + equity + Privacy Act compliance + cost sustainability + real-time performance + multi-system integration
- Lab benchmarks don't predict how AI performs when deployed in messy clinical workflows with interruptions, inconsistent data, and time pressure

- **Knowledge gap:** No research validates which AI approaches work under combined real-world constraint set.

**Conclusion:** Systematic investigation required to resolve which AI approaches work for clinical decision support under NZ sovereignty constraints at sustainable cost in real GP workflows.

---

## Newness – What is New? (~250 words)

Two AI-powered clinical decision support services for New Zealand general practice, where AI clinical intelligence (not rigid automation) interprets medical information and adapts to real-world variation.

**Service 1: Inbox Helper - Intelligent Inbox Management**

AI clinical intelligence applied to:

- **Triage and classification:**
  - AI reads labs, letters, referrals, patient messages and classifies by urgency and type using clinical reasoning, not keyword matching
  - Understands "chest pain radiating to left arm" is urgent regardless of exact wording

- **Clinical interpretation:**
  - Compares current labs with previous results, identifies trends, flags abnormalities using medical knowledge
  - Recognizes "HbA1c increased from 48 to 64 over 6 months" signals worsening diabetes control requiring action

- **Automated filing with clinical judgment:**
  - AI determines which results are safe to auto-file based on clinical context, not rigid rules
  - Normal mammogram in 45-year-old with no family history auto-files safely; same result in patient with BRCA gene requires GP review

- **Patient communication:**
  - Generates appropriate messages based on clinical understanding of results and patient context
  - Adapts message tone and detail for different situations

**Service 2: Care Gap Finder - Proactive Chronic Disease Intelligence**

AI clinical intelligence applied to:

- **Multi-condition reasoning:**
  - Scans patient records and determines care priorities across 5 chronic conditions (diabetes, CVD, COPD, heart failure, asthma)
  - Decides which checks are most urgent given patient's overall clinical picture
  - Example: 65-year-old with diabetes + CKD + CVD needs cardiovascular risk review prioritized over routine foot check

- **Clinical extraction:**
  - Pulls relevant details from free-text GP notes, medications, labs using medical understanding, not structured field queries
  - Finds "pt smoking again, stressed about redundancy" buried in consultation note from 3 months ago

- **Equity-aware prioritization:**
  - Applies clinical judgment to prioritize Māori/Pacific and high-risk patients appropriately without algorithmic bias
  - Ensures vulnerable populations receive proactive care

- **Practice intelligence:**
  - Generates dashboards showing patterns across patient populations with actionable insights GPs can act on

**Why These Are Clinical AI Services:**

- **Clinical reasoning:** AI understands medical context and implications, not just pattern matching on keywords
- **Adaptive intelligence:** Handles variations in terminology, formats, and documentation styles; works when third-party systems change formats
- **Insight generation:** Surfaces patterns and information not easily visible from manual review or simple database queries
- **Integrated workflow:** Works within existing GP workflow in both Medtech and Indici practice management systems

---

## Why is it Better? (~250 words)

**Better Than Manual Processes**

- **Inbox Management:**
  - Manual: 1-2 hours/day reviewing every item individually
  - With AI: 30%+ time savings through intelligent pre-processing
  - **AI advantage:** Instantly compares current results with patient history, spots trends invisible in single manual review (e.g., "creatinine slowly rising over 18 months suggests progressive kidney disease")

- **Care Gap Monitoring:**
  - Manual: Time-consuming chart reviews, limited to what GP remembers to check
  - With AI: Systematic population-level scanning with multi-condition prioritization
  - **AI advantage:** Sees patterns across entire practice that manual review misses (e.g., "Your Māori patients with diabetes have 40% lower HbA1c screening completion in Q3-Q4")

- **Equity:**
  - Manual: Relies on GP memory, vulnerable patients often missed
  - With AI: Systematic identification and prioritization
  - **AI advantage:** Never forgets, consistently applies equity principles across all patients

**Better Than Existing Automation Tools**

**Existing automation tools** (SmartCareGP, HealthAccelerator, rule-based systems):
- **Rigid rules:** Alert triggers on "HbA1c >64", breaks when format changes
- **No clinical context:** Flags everything matching threshold, creates alert fatigue
- **No adaptation:** Requires manual reconfiguration when third-party systems change terminology

**Our AI-powered approach:**

- **Clinical intelligence:** Understands that "HbA1c 64", "A1c 7.5%", "glycated Hb 64 mmol/mol" all indicate poor diabetes control; doesn't break when labs change format

- **Ready to adapt:** When labs change terminology or formats (happens regularly with third-party systems), AI interprets clinically rather than failing; no manual reconfiguration needed

- **Flexible reasoning:** Considers full clinical context, not threshold matching; diabetes with HbA1c 64 might need urgent attention in pregnancy but routine review in stable elderly patient with 15-year diabetes history

- **Insight generation:** Surfaces non-obvious patterns buried in data: "Practice diabetes control worsening in winter months" or "Patients on X medication have better HbA1c outcomes"; information invisible to manual review or simple queries

- **Better clinical judgment:** Reduces alert fatigue by understanding which combinations actually matter clinically vs firing alerts on every threshold breach

- **Seamless integration:** Deep integration embedded directly in Medtech/Indici workflow; no context switching, no standalone applications to log into separately

Clinical AI intelligence (not rigid automation) enables adaptation to real-world variability, generates actionable insights, and provides better clinical decision support embedded in daily GP workflow.

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

**Ting (Shareholder-employee, R&D Programme Manager):** 4,152 hours @ $70/hr = $290,640

**Role Purpose:** Enable founder to focus on technical and clinical R&D by managing programme operations AND owning research synthesis, documentation, and evaluation framework support activities.

**Core Responsibilities:**

- **Research Synthesis & Documentation (25% time):** Transform founder's technical findings and raw experiment results into structured research reports, comparison matrices, and documented findings. Create and maintain searchable knowledge base of all R&D learnings, architectural decisions, experiment outcomes, and technical rationale. Organise experiment results into comparison tables, summary dashboards, and visual presentations for quarterly reporting and final R&D report. Review and summarise academic papers, technical reports, and industry documentation identified by founder. Maintain record of R&D decisions with supporting rationale for audit trail and knowledge transfer.

- **Evaluation Framework Support (20% time):** Structure raw test outputs into standardised comparison tables showing performance across architectural paradigms. Maintain dashboards tracking key metrics (accuracy, latency, cost, safety) across experiments and iterations. Create and maintain comprehensive database of edge cases discovered during testing, organised by type, severity, and resolution status. Develop and maintain comparison matrices of different architectural approaches (founder provides data and metrics, Ting structures for analysis). Organise synthetic datasets, test sets, and evaluation results with proper versioning and lineage tracking for reproducibility.

- **Programme Management & Coordination (25% time):** Timeline and milestone tracking across 4 objectives with proactive bottleneck identification. Budget monitoring, cashflow tracking, and financial forecasting. Monthly progress reporting documenting achievements, challenges, and strategic decisions. Risk identification and mitigation planning as programme evolves. Coordinate activities between founder (technical lead), developer (contractor), and external vendors.

- **Grant Administration & Compliance (15% time):** Quarterly grant claim preparation (timesheets, invoices, evidence compilation). Maintain comprehensive evidence repository meeting Callaghan requirements. Prepare final R&D report for Callaghan Innovation (synthesising technical findings provided by founder into accessible, well-structured format). Coordinate accountant liaison for PAYE and tax compliance.

- **Stakeholder Management & Pilot Operations (15% time):** GP practice recruitment, onboarding, training coordination, and ongoing support (Months 16-24). User feedback collection and synthesis for founder's review. Medtech and Indici partnership communications and relationship management. Coordinate CapDev vendor procurement and session scheduling.

**Note on Role Evolution:** As first-time R&D performers, specific activities will adapt as programme needs emerge. Role designed to own research synthesis, documentation, and evaluation support (enabling systematic knowledge capture), plus all programme operations and grant compliance. Frees founder for technical R&D, clinical validation, and architectural decision-making. CDP-5 training (Project Management + Research Documentation & Evaluation Methods, $5k) builds Ting's R&D operations capability during first 16 months.

**Background:** Sales, marketing, and ecommerce entrepreneurship with demonstrated capability in systematic process execution, data organisation, and operations management. Currently supports founder's GP practice administration. Entrepreneurial skillset (systematic thinking, attention to detail, process optimisation) translates directly to research documentation, results organisation, and knowledge management activities essential for rigorous R&D.

**Why Full-Time:** 24-month R&D programme requires substantial research operations capacity: systematic documentation of findings across 4 objectives, evaluation framework maintenance (tracking hundreds of experiments and configurations), comprehensive knowledge base creation for sector knowledge transfer, pilot operations (10-20 practices, Months 16-24), plus full programme management and quarterly grant compliance. Systematic research synthesis and evaluation support are critical R&D activities often underestimated in programme planning. Role transforms solo founder operation into structured R&D organisation with proper research documentation capability.

**Rate Justification:** $70/hr reflects R&D Programme Manager with research operations responsibilities (not purely administrative coordination). Role combines research synthesis (25%), evaluation framework support (20%), programme management (25%), grant compliance (15%), and stakeholder coordination (15%). Research documentation and evaluation activities require systematic thinking, attention to detail, and ability to structure complex technical information - comparable to "Clinical Research Coordinator" or "Research Operations Specialist" roles in Auckland healthcare/tech market ($135-150k salary equivalent). Combined research operations and programme management scope justify senior rate.

**Shareholder Structure:** Ting is founder's spouse and company shareholder. Employment agreement with PAYE, formal timesheets, and arms-length salary aligned with market rates. Relationship disclosed for transparency; role and compensation independently justified by programme needs.

**Developer (Contractor):** 903 hours (minimum) @ $72/hr = $65,016
- Starts Month 4, flexible 10-40 hrs/week based on R&D workload (budgeted at 10 hrs/week minimum)
- Frontend development (Medtech and Indici widgets)
- FHIR integration testing across both PMSs
- Synthetic data generation and test automation
- 21 months (Months 4-24)

**Total R&D Labour:** 8,175 hours (minimum) = $655,176

**Rationale for team structure:** Founder's dual GP/technical expertise enables rapid clinical workflow iteration and NZ-specific domain understanding. Ting as full-time R&D Programme Manager owns research synthesis, evaluation framework support, and programme operations - enabling systematic knowledge documentation and freeing founder for technical R&D. Demonstrates growth intention beyond solo founder with dedicated research operations capacity. Developer contractor provides flexible capacity to scale up during intensive development phases (Objectives 2-3) without fixed overhead. This structure maintains manageable GP practice workload (20 hrs/week) for business income while enabling substantial 30 hrs/week R&D commitment over 24 months.

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
- **Research documentation best practices** (structuring technical findings, creating comparison frameworks, maintaining research knowledge bases, reproducibility protocols)
- **Evaluation framework methods** (organising experiment results, performance tracking systems, test data management, benchmark comparison methodologies)
- System setup with Ting leading: Agile R&D workflows (Kanban), 24-month roadmaps, budget tracking, risk registers, research documentation templates, evaluation tracking dashboards
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

**Deliverables may include:** R&D PM training materials, research documentation and evaluation framework training materials, configured PM system with research tracking templates, coaching session reports, Ting-maintained roadmap/budget/risk register, vendor management records, monthly progress reports, research knowledge base structure

**Total CDP-5:** $8,000

---

**Total Capability Development:** $36,000 (third-party professional services only)

**CapDev Requirement Check:**
- Required: ≥5% of total eligible costs = $35,846 (for $716,926 total)
- Actual: $36,000
- **Percentage: 5.02% ✓** (meets requirement)

**Rationale for Structure:** As a first-time R&D performer, we prioritise capabilities that directly de-risk the R&D programme (compliance, systematic documentation, project management). IP protection will be addressed post-grant once innovations are validated and commercial pathway is clear. Broad descriptions with "may include" language reflect appropriate flexibility for first-time R&D where specific needs emerge during programme execution.

---

### Why These Capabilities Matter (237 words)

**Regulatory & Compliance Expertise ($18,000):**

- Advanced Privacy Act 2020 & HIPC expertise for R&D-stage experimental scenarios and multi-PMS integration complexities
- Comprehensive regulatory gap analysis identifies compliance risks early, preventing costly pilot delays
- DPIA teaches systematic risk assessment for cross-border data handling under IPP 12
- Clinical safety advisory builds medical device software risk assessment capability for assist-only AI systems
- Ongoing regulatory guidance through development, sandbox testing, pilot deployment, and scale-up phases
- Governance frameworks and compliance templates apply to future health AI products (HealthHub NZ, Years 3-5)

**R&D Information Management ($10,000):**

- Technical consultant trains founder and Ting to build experiment tracking systems, model registries, and dataset lineage workflows essential for systematic R&D documentation
- LLM methods advisory teaches experiment design, standardised evaluation frameworks, and architectural comparison methodologies
- Ting develops research operations capability: organising experiment results, maintaining performance tracking dashboards, structuring technical findings
- Industry-standard MLOps practices for managing complex AI research programmes

**Project Management & Research Operations ($8,000):**

- R&D PM coach trains Ting on R&D project management fundamentals plus research documentation best practices and evaluation framework methods
- Learns to structure technical findings into comparison frameworks, maintain research knowledge bases with reproducibility protocols, organise experiment results, manage performance tracking systems
- Ongoing coaching builds Ting's capability to run R&D programmes independently with proper research documentation
- Transforms team from solo founder to structured R&D organisation with systematic research operations capability for future programmes and national-scale health AI deployment

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

The 24-month grant validates NZ-trained LLM for GP-facing tools. Years 3-5 extend this foundation to patient-facing care and national-scale learning. AI architectural paradigms validated in the 24-month project will be systematically adapted for patient-facing contexts with new safety validation frameworks.

### 1. Patient-Facing AI (HealthHub NZ) – Years 3-4

Patients access complete health records with AI guidance on phones.

**Key R&D Questions:**
- How do you train NZ-LLM to communicate medical information safely across different health literacy levels (teenagers vs elderly vs te reo speakers)?
- Can NZ-LLM validate patient-entered data (blood pressure readings) by learning clinical patterns without compromising safety thresholds?

**Benefits:** Rural patients get after-hours guidance, chronic disease patients monitor at home, better engagement improves outcomes.

### 2. AI Learning From Real-World Outcomes – Years 4-5

Train NZ-LLM on aggregated patient outcomes to improve recommendations.

**Key R&D Questions:**
- Can NZ-LLM learn from thousands of diabetes patients' outcomes to identify which interventions actually work in NZ populations?
- Can AI identify emerging health trends at scale (e.g., "South Auckland diabetes screening rates dropping 15%")?

**Benefits:** AI recommendations improve based on actual NZ outcomes. Evidence-based insights for government health planning.

### 3. National Scale Integration – Years 4-5

**Key R&D Questions:**
- How does a NZ-sovereign AI system generalise across different hospital data formats while maintaining accuracy?
- Can safety frameworks validated in GP settings translate to hospital contexts without degradation?

**Benefits:** Connected care where patients see specialists and GPs get AI summaries automatically. No repeated tests, no lost referrals.

**Why Substantial R&D:** Patient-facing AI requires different safety validation than GP-facing AI. Learning from outcomes without compromising safety is unsolved research. National-scale generalisation requires novel architectural approaches.

---

**Document Version:** 3.3  
**Last Updated:** 9 December 2025  
**Status:** Ready for Forge portal submission

**Version 3.3 Changes (9 Dec 2025):**
- R&D Activities section (Q1-Q6) completely rewritten for clarity and reduced repetition:
  - Simplified language: removed jargon ("architectural paradigms" → "AI approaches")
  - Converted all sections to bullet-point format for easier reading
  - Eliminated repetition: each question now has distinct focus
  - Q2: Rephrased multi-system uncertainty as "training on generic data → deployed in real PMS"
  - Q3: Added "omission" alongside hallucination; emphasized clinical intelligence vs rigid automation
  - Q5: Major rewrite - product-focused showing HOW AI builds services with concrete examples
  - Q6: Major expansion - three-way comparison (manual vs existing automation vs our AI) with emphasis on AI advantages (adaptation, insights, flexibility)

**Version 3.2 Changes:**
- Future R&D Plans optimized (248 words): Added architectural paradigm link, tightened structure, strengthened R&D framing
- CapDev justification added (237 words): "Why These Capabilities Matter" section with bullet-pointed capability building outcomes

**Version 3.1 Changes:**
- Updated CapDev to $36,000 (5.02% of total costs) per Paula's confirmation
- Added 4 CapDev categories: IP ($7.5k), Regulatory ($15k), R&D Info Management ($8.5k), Project Management ($5k)
- Updated total eligible costs to $716,926
- Updated grant to $286,770 and co-funding to $430,156
