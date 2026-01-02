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
- Compare chosen approaches on two clinical tasks: **inbox triage** (lab interpretation, letter classification, urgency assessment) and **care gap monitoring** (identifying overdue chronic disease checks, focusing on diabetes and cardiovascular risk assessment/management, with potential expansion to other conditions like COPD, heart failure, CKD if time allows)
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

**Core Uncertainty:** What is the optimal AI architecture for NZ clinical decision support under sovereignty constraints?

**The Architecture Design Challenge**

Multiple AI approaches exist (lightweight models, retrieval systems, agentic architectures, hybrid combinations) with different trade-offs:

**Key unknowns:**

- **Optimal component combination:**
  - Which approaches should be combined for best results?
  - Does inbox triage need different architecture than care gap monitoring?
  - What role does each component play (retrieval, reasoning, safety verification)?
  - Cannot predict optimal design without systematic investigation

- **Cost-accuracy balance:**
  - Where is the sweet spot between clinical performance and operational cost?
  - System will run thousands of times daily; cost multiplies quickly
  - Simple approaches cheaper but may miss clinical nuances
  - Sophisticated approaches more accurate but expensive at scale
  - Unknown which tasks justify higher costs vs which can use lightweight solutions

- **NZ-trained performance:**
  - Must build NZ-trained system (cannot use overseas APIs due to Privacy Act)
  - Unknown if NZ training achieves clinical-grade performance comparable to international commercial models
  - No existing benchmarks for NZ-sovereign clinical AI

**Secondary Uncertainties**

- **Real-world deployment:** Will AI trained on curated NZ data work accurately in messy PMS environments (Medtech/Indici) where GP workflows happen? Training data necessarily cleaner than production reality.

- **Safety characteristics:** How do different AI architectures fail in clinical contexts? Which safety mechanisms work with which approaches?

- **Equity algorithms:** How to prioritize Māori/Pacific patients appropriately without creating bias or under-alerting other groups? No published methods for multi-condition monitoring with NZ equity goals.

---

## R&D Challenge – Why is This Difficult for a Professional? (~250 words)

Experts cannot predict optimal AI architecture without systematic experimentation because:

**1. Real Clinical Data Has High Variability and Inconsistency**

Clinical data varies in ways that challenge AI systems:

- **Documentation inconsistency:** Terminology varies across GPs, missing fields common, GP-specific abbreviations differ by practice
- **Lab result variations:** Same test described differently across regions and providers (HbA1c 48 vs A1c 7.5% vs glycated Hb 64 mmol/mol)
- **Third-party systems change unpredictably:** Labs and hospitals modify formats and terminology without notice
- **Edge cases are frequent:** 5-15% of "routine" items have unusual characteristics
- **Requires clinical intelligence:** AI must interpret variations correctly, not rely on rigid pattern matching
- Which architectures handle variability best cannot be deduced without testing

**2. AI Systems Fail in Unpredictable Ways**

AI systems have multiple failure modes:

- Pattern matching failures on unfamiliar variations
- Hallucination: Fabricating missing clinical values
- Omission: Skipping critical information without warning
- Error propagation across system components

Cannot predict which failures occur in real-world deployment without systematic testing. Need to discover which architectural characteristics provide robustness and adaptability vs brittleness.

**3. Performance Translation from Training to Deployment**

- AI trained on curated NZ health data (guidelines, lab reports, clinical notes) must work in real practice management system environments where GP workflows happen
- Deployment adds complexity: live workflows with interruptions, different user interfaces, varied data quality across practices, time pressure affecting documentation quality
- Which architectural characteristics maintain accuracy and adapt to real-world variability?
- Cannot deduce without testing in actual GP workflows across diverse practice settings

Only systematic testing across real clinical environments reveals which AI architectures maintain accuracy, safety, and adaptability under operational conditions.

---

## Knowledge Availability – What Exists and Why It's Insufficient? (~250 words)

Existing solutions address different problems and don't resolve our specific uncertainties.

**1. Current NZ Clinical AI Tools**

- **AI scribe (e.g. Heidi):**
  - Transcription and documentation only, not clinical decision support
  - Converts speech to text but doesn't interpret clinical meaning

- **InboxMagic:**
  - Early-stage MVP without published methods or deep PMS integration
  - Unclear which AI approaches used or if they work at scale

- **SmartCareGP, HealthAccelerator:**
  - Rule-based automation, not AI-powered clinical reasoning
  - Cannot handle multi-condition prioritization or adapt when formats change

- **Knowledge gap:** No AI trained on NZ healthcare context (bpac guidelines, Ministry of Health protocols, regional lab formats) that intelligently solves inbox overload and care gap monitoring. Current tools do transcription (Heidi) or basic automation (others), not AI-powered clinical decision support.

**2. Overseas AI Systems**

- Commercial AI models (GPT-4, Claude) prove AI can perform clinical reasoning
- However, they don't address critical unknowns for NZ deployment:
  - How to achieve comparable performance under NZ sovereignty constraints (no overseas APIs, Privacy Act compliance)?
  - At sustainable cost with NZ clinical context understanding (local guidelines, lab formats, ACC/PHO patterns)?
  - Which architectural design (retrieval, agentic, hybrid) works for sovereign deployment?

- **Knowledge gap:** No documented pathway for sovereign AI deployment achieving clinical-grade performance at sustainable cost.

**3. Academic Research**

- Published research tests isolated AI techniques (fine-tuning, retrieval systems, hybrid architectures) on standardised, clean datasets
- Real-world deployment requires combined constraints: sovereignty + clinical safety + equity + Privacy Act + cost sustainability + multi-system integration
- Lab benchmarks don't predict AI performance in messy clinical workflows with interruptions, inconsistent data, time pressure

- **Knowledge gap:** No research validates which AI architectures work under combined real-world constraint set.

**Conclusion:** Systematic investigation required to resolve which AI architectures work for clinical decision support under NZ sovereignty constraints at sustainable cost in real GP workflows.

---

## Newness – What is New? (~250 words)

Two AI-powered clinical decision support services for NZ general practice:

**Service 1: Inbox Helper - Intelligent Inbox Management**

AI clinical intelligence applied to:

- **Triage and classification:** Reads labs, letters, referrals, messages; classifies by urgency and type using clinical reasoning
- **Discharge summary processing:** Reads hospital discharge summaries, extracts key information, surfaces GP action list and urgent items
- **Clinical interpretation:** Compares current labs with previous results, identifies trends, flags abnormalities
- **Automated filing with judgment:** Determines which results are safe to auto-file based on clinical context
- **Patient communication:** Generates appropriate messages adapted to clinical situation

**Service 2: Care Gap Finder - Proactive Chronic Disease Intelligence**

AI clinical intelligence applied to:

- **Multi-condition reasoning:** Gathers all recorded patient information (labs, medications, diagnoses, demographics), determines care priorities focusing on diabetes and cardiovascular risk assessment/management (with potential expansion to other chronic conditions if time allows)
- **Priority decision-making:** Decides which checks are most urgent given patient's overall clinical picture
- **Equity-aware prioritization:** Prioritizes Māori/Pacific and high-risk patients appropriately without algorithmic bias
- **Practice intelligence:** Generates dashboards showing patterns across patient populations with actionable insights

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

Existing automation (SmartCareGP, HealthAccelerator, rule-based systems) relies on rigid rules that break when third-party systems change formats, flags everything matching thresholds (creating alert fatigue), and requires manual reconfiguration.

**Our AI provides three key advantages:**

1. **Adaptive intelligence:** Understands clinical meaning regardless of format variations. When labs change terminology (happens regularly), AI interprets clinically rather than failing. No manual reconfiguration needed.

2. **Clinical context awareness:** Considers full patient picture, not threshold matching. Reduces alert fatigue by understanding which combinations actually matter. Surfaces hidden patterns invisible to manual review or simple queries.

3. **NZ-trained and integrated:** Understands local context (bpac guidelines, regional lab formats, ACC/PHO patterns). Embedded directly in Medtech/Indici workflow with no context switching.

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

### Objective 1: Foundation AI Architecture and Data Requirements (Months 1-6)

**Dates:** 27 Jan 2026 – 30 Jun 2026

**Technological uncertainty:** No proven AI architecture exists for NZ-sovereign GP clinical decision support. Overseas models cannot be deployed under Privacy Act sovereignty constraints, and no published research validates which AI approaches achieve clinical-grade performance on NZ healthcare data at sustainable cost.

**Plain-English aim:** Investigate which AI approach and what NZ data are needed to build clinical-grade AI system for GP workflow. This establishes the foundation architecture that Objectives 2-3 will specialise for inbox management and care gap detection.

**Core R&D questions:**

1. **Which AI architecture achieves clinical-grade performance for GP workflows?**
   - Lightweight models, retrieval systems, agentic architectures, or hybrid combinations?
   - Can we reach ≥90% triage, ≥95% clinical calculations at sustainable cost?

2. **What NZ data types and volumes are required?**
   - Which matter most: bpac guidelines, MoH protocols, regional lab formats, clinical notes?
   - Minimum viable dataset: 1,000 examples? 10,000? 100,000?
   - Can available NZ data achieve clinical accuracy under sovereignty constraints?

3. **How do we design architecture supporting equity and safety requirements?**
   - Must support equity-aware rules (Māori/Pacific prioritisation) and confidence calibration
   - Does this require architectural features (checker agents, ensemble voting) or post-hoc techniques?

**Investigation approach (controlled, synthetic data):**
- Research multiple AI approaches on curated NZ clinical corpus
- Test varying data amounts/types to determine minimum requirements
- Build foundation system and early prototypes
- Evaluate on synthetic NZ healthcare scenarios

**Deliverables by Month 6:**
- Foundation system connected to Medtech and Indici test environments
- Architecture selected with evidence: "Use [approach] because [empirical results]"
- Data requirements documented: "Need [X types, Y volume] for clinical accuracy"
- Prototypes on synthetic data: ≥90% triage, ≥95% CVDRA accuracy
- Foundation establishes base for Objectives 2-3 specialisation

**R&D output:** Understanding which AI architecture and NZ data requirements enable clinical-grade performance under sovereignty constraints.

---

### Objective 2: Real-World Data Handling for Inbox Management (Months 4-12)

**Dates:** 1 Apr 2026 – 31 Dec 2026

**Technological uncertainty (progressive constraint removal):** Given the base architecture from Objective 1 (validated on controlled synthetic data), it is unknown whether that architecture handles diverse, messy real-world clinical data. Real GP inboxes contain heterogeneous formats (lab PDFs, narrative letters, semi-structured referrals) from multiple sources (LabTests, SCL, Medlab, regional labs, hospitals). No research validates which architectural components enable safe deployment with variable-quality real-world data.

**Plain-English aim:** Investigate how to deploy the Objective 1 AI architecture safely with diverse real-world inbox data. **Lean MVP released as we validate safety.**

**Core R&D questions (building on Objective 1 foundation):**

1. **How does the chosen AI architecture handle diverse real-world file types and formats?**
   - Real inboxes contain: lab PDFs (tabular), hospital letters (narrative), referral forms (semi-structured), discharge summaries (mixed), patient messages (unstructured)
   - Each lab uses different formats despite containing same information
   - Which formats does AI handle reliably vs which cause extraction errors?
   - Do we need additional architectural components (format-specific parsers, separate agents)?

2. **How does AI apply patient-specific clinical context?**
   - Normal ranges vary by patient: 65-year-old diabetic vs 25-year-old vs pregnant patient
   - Māori/Pacific patients have different CVD risk thresholds
   - How does AI access and apply patient context from records?
   - What happens when context is incomplete or ambiguous?

3. **How do we calibrate AI confidence for safe automated actions?**
   - Auto-filing requires high confidence; flagging for review requires lower confidence
   - Does confidence calibration require architectural changes (checker agents, ensemble voting, calibration layers) or post-hoc techniques?
   - What confidence thresholds are safe without real-world failure data to calibrate from?

4. **How accurately does AI extract complex clinical information?**
   - Discharge summaries: 5-10 pages mixing diagnosis, medications, actions needed, follow-up
   - Can AI distinguish urgent actions from routine information?
   - Accuracy vs GP reading same document?

**Investigation approach (real-world data):**
- Test AI on real inbox data from multiple labs, hospitals, practices
- Measure format-handling accuracy, patient-context application, confidence calibration
- Iterate based on error analysis and GP feedback

**Deliverables by Month 12:**
- AI system handling inbox tasks in Medtech and Indici sandbox environments
- ≥90% classification accuracy on ≥2,000 real inbox items (diverse sources)
- Zero unsafe automated actions in edge-case suite (1,000+ scenarios)
- Confidence calibration validated: "90% AI confidence = 92% actual accuracy"
- Discharge summary extraction: ≥85% accuracy on key information
- GP feedback: ≥5 GPs tested, ≥80% trust AI suggestions

**R&D output:** Understanding how to adapt base AI architecture for diverse real-world clinical data formats and when AI confidence is trustworthy for automated actions.

---

### Objective 3: Clinical Accuracy Validation for Care Gap Detection (Months 7-16)

**Dates:** 1 Jul 2026 – 30 Apr 2027

**Technological uncertainty (edge cases and equity):** Building on Objective 1's base architecture and Objective 2's real-world data handling, it remains unknown whether AI achieves clinical-grade accuracy for complex calculations with missing/ambiguous data, handles clinical uncertainty appropriately, and implements equity prioritisation without introducing new algorithmic biases. Edge cases (extreme values, contradictory data, borderline thresholds) are prevalent in real patient populations but cannot be fully enumerated in advance.

**Plain-English aim:** Investigate how to ensure AI makes clinically accurate calculations and appropriate decisions for diabetes and cardiovascular risk management. **Lean MVP (diabetes) released as we validate accuracy, then CVD added.**

**Core R&D questions (building on Objectives 1-2):**

1. **How do we ensure AI clinical calculations are correct in edge cases?**
   - CVD risk (CVDRA) requires 8 variables: age, sex, ethnicity, BP, lipids, smoking, diabetes, atrial fibrillation
   - What does AI do when 1-2 variables missing or ambiguous?
   - How does AI handle edge cases: very old patients (>85), extreme lab values, contradictory data?
   - Can we validate AI calculations match GP manual calculations across diverse scenarios?
   - What causes calculation failures and how do we detect them before reaching patients?

2. **How does AI handle clinical uncertainty and borderline cases?**
   - Borderline HbA1c (63 vs 64 mmol/mol - just under vs over action threshold)
   - Conflicting information: high CVD risk but recent normal cardiac investigations
   - Missing key information: no BP recorded in last 12 months
   - When should AI defer to GP judgement rather than make suggestion?
   - Can AI communicate uncertainty appropriately?

3. **How do we build equity into AI without creating new biases?**
   - Māori/Pacific patients need prioritisation for equity outcomes
   - How do we adjust AI algorithms to prioritise without under-alerting other groups?
   - How do we validate equity adjustments don't introduce new algorithmic biases?
   - What metrics actually measure equity outcomes vs demographic distributions?
   - Do equity algorithms (linked to architecture from Obj 1) work consistently across different practice populations?

**Investigation approach (edge cases and equity validation):**
- Validate AI calculations on 1,000+ diverse patient scenarios including edge cases
- Compare AI decisions vs GP clinical audit systematically
- Test borderline/ambiguous cases to understand AI reasoning behaviour
- Measure equity outcomes across different populations
- Error analysis: When AI is wrong, why is it wrong?

**Deliverables by Month 16:**
- AI system handling care gap detection in Medtech and Indici sandbox environments
- ≥95% CVDRA calculation accuracy on ≥1,000 patient records (including edge cases)
- ≥85% agreement with GP audit on care gap decisions
- Documentation: "AI reasoning process and when it fails"
- Equity validation: Demonstrated appropriate prioritisation without bias across populations
- **If time allows:** COPD, heart failure, CKD monitoring using similar approaches

**R&D output:** Understanding how to ensure AI clinical accuracy in edge cases, when AI should defer to GP, and how to implement equity without introducing new biases.

---

### Objective 4: Performance Validation and Real-World Deployment (Months 16-24)

**Dates:** 1 Apr 2027 – 26 Jan 2028

**Plain-English aim:** Measure AI system performance in real GP practices and validate it meets clinical, safety, and operational targets at scale.

**Core validation goals:**

**Performance Metrics (Speed & Reliability):**
- Response time (P95): ≤5.0 seconds
- System uptime: ≥99.5%
- Throughput: Handle 1,000+ requests/day per practice without degradation
- Unit economics: ≤$0.01 per request at scale

**Clinical Accuracy Metrics:**
- Inbox triage: ≥90% classification accuracy across 10-20 practices
- CVD calculation: ≥95% accuracy vs manual GP calculation
- Care gap detection: ≥85% agreement with GP audit
- Performance stability: No >10% accuracy degradation across practice types

**Safety Metrics (Zero Tolerance):**
- Prohibited-claim rate: ≤0.5%
- Unsafe automated actions: Zero in production
- Missed urgent items: Zero in edge-case suite
- PHI leakage: Zero

**Clinical Utility Metrics (Does it help?):**
- Inbox time savings: ≥30% reduction (1-2 hours/day per GP)
- Care gap completion: ≥80% vs current manual monitoring
- GP satisfaction: ≥80% find it useful
- Adoption rate: ≥80% of pilot GPs continue using after 6 months

**Equity Metrics:**
- Māori/Pacific screening completion: Improved vs baseline
- No under-alerting in high-deprivation populations
- Care gap closure rates equal across ethnic groups
- Equity algorithms validated: No new algorithmic biases introduced

**Workflow Integration Metrics:**
- Alert acceptance rate: ≥70% (GPs follow AI suggestions)
- Alert fatigue score: ≤3/10 (GP survey)
- Override patterns documented: When/why GPs override
- Workflow disruption: ≤2 extra clicks per action

**Real-World Validation Approach:**
- Deploy to 10-20 practices (urban/rural, high/low deprivation, Medtech/Indici mix)
- Monitor all metrics continuously over 6-9 months
- Document failure modes, performance variations, unexpected usage
- Interview GPs monthly about trust, failures, improvements needed

**Deliverables by Month 24:**
- All metrics measured and documented across 10-20 practices
- Final R&D report: Performance validation results
- Documentation: Real-world failure modes and causes
- Documentation: Performance variation patterns across practice types
- Production-grade system ready for broader rollout

**Hard stops (if metrics fail):**
- Safety metrics fail → halt all deployment until fixed
- Clinical accuracy drops >10% → investigate and resolve before proceeding
- GP satisfaction <60% → re-evaluate workflow integration

**R&D output:** Validated performance measurements demonstrating AI system meets clinical, safety, and operational targets in real GP practice environments.

---

## Capability Development Activities

**Total CapDev:** $36,000 (5.02% of total eligible costs)
**Structure:** 3 objectives (third-party professional services only)

---

### CD-1: Regulatory & Compliance Capability for NZ Health AI

**Start Date:** 27 February 2026 (Month 2)  
**End Date:** 26 July 2027 (Month 18)  
**Budget:** $18,000

**Deliverable:**
Expert-level regulatory and compliance capability for NZ health AI development, enabling safe pilot deployment and establishing reusable frameworks for Years 3-5 HealthHub NZ. Deliverables include: regulatory gap analysis with remediation roadmap, complete DPIA validating cross-border data handling controls, clinical safety validation reports across MVP and pilot phases, 6-8 ongoing compliance advisory sessions, and governance frameworks with templates.

**Capability Building - How This Transfers Knowledge:**

**Founder and Ting gain expert-level capability in:**
- Privacy Act 2020, HIPC, and IPP 12 compliance for health AI (currently have operational knowledge; need expert-level capability for R&D-stage experimental scenarios and multi-PMS integration complexities)
- Medical device software risk assessment frameworks and clinical safety validation methodologies for assist-only AI systems
- Navigating increasingly complex compliance scenarios across MVP development, sandbox testing, pilot deployment, and scale-up phases through hands-on guidance from regulatory experts
- Building reusable governance frameworks, compliance checklists, DPA templates, and incident response procedures applicable to all future health AI projects

**Knowledge Transfer Method:** Third-party experts (privacy/DPIA specialists, clinical safety consultants, regulatory advisers) provide training through gap analysis, DPIA development, safety advisory sessions, and ongoing compliance guidance. Each engagement builds practical skills in handling real compliance challenges. Frameworks and templates created become reusable organisational knowledge.

**Enduring Capability:** After 24 months, team has expert-level compliance capability to manage future health AI R&D independently, avoiding costly compliance failures and enabling patient-facing AI development (Years 3-5 HealthHub NZ) with proper regulatory foundation.

---

### CD-2: R&D Information Management for Systematic Research

**Start Date:** 27 February 2026 (Month 2)  
**End Date:** 26 September 2026 (Month 8)  
**Budget:** $10,000

**Deliverable:**
Systematic R&D documentation and experiment tracking capability enabling reproducible research and efficient knowledge transfer to future projects. Deliverables include: fully configured experiment tracking system integrated with model registry and dataset lineage, standardised evaluation frameworks for measuring AI performance, experiment design templates for systematic investigation, research documentation workflows, and LLM methods advisory reports capturing best practices for clinical AI research documentation.

**Capability Building - How This Transfers Knowledge:**

**Founder and Ting gain practical capability in:**
- Building and maintaining experiment tracking systems, model registries, and dataset lineage workflows (currently lack systematic R&D documentation infrastructure)
- Designing experiments with standardised evaluation frameworks that enable consistent comparison across different AI architectural approaches
- Creating evaluation frameworks (how to measure AI performance: accuracy, cost, safety, latency) and experiment design templates (how to structure systematic investigations)
- Documenting AI experiments systematically with proper metadata, versioning protocols, and results archival
- Industry-standard MLOps practices for managing complex AI research programmes and ensuring reproducibility

**Knowledge Transfer Method:** Technical consultants specialising in ML research infrastructure and LLM methods provide hands-on training through system setup, evaluation framework design, and 5-8 advisory sessions. Training includes configuring tracking systems, establishing metadata standards, creating experiment design templates, and building documentation workflows integrated with research infrastructure.

**Enduring Capability:** After 8 months, team has capability to manage systematic R&D documentation across staged investigations (architecture selection, real-world testing, clinical validation). Experiment tracking infrastructure, evaluation frameworks, and documentation workflows are reusable for Years 3-5 HealthHub NZ R&D and beyond. Knowledge properly captured enables efficient learning transfer between projects rather than starting from scratch each time.

---

### CD-3: R&D Project Management Capability for First-Time R&D Performer

**Start Date:** 27 February 2026 (Month 2)  
**End Date:** 26 June 2027 (Month 16)  
**Budget:** $8,000

**Deliverable:**
Structured R&D project management capability transforming team from solo founder to organised R&D operation. Deliverables include: comprehensive R&D project management training for operations lead (Ting), configured agile R&D system with Kanban boards and 24-month roadmap, budget tracking spreadsheets, risk register templates, vendor management workflows, 6-8 coaching session reports with decision-making support, and documented process improvements demonstrating Ting's capability development from novice to independent R&D manager.

**Capability Building - How This Transfers Knowledge:**

**Ting (Operations Lead) gains capability to independently manage R&D programmes:**
- Planning and managing R&D projects under uncertainty (vs traditional business projects with predictable outcomes)
- Budget tracking, resource allocation, and risk management specific to R&D programmes
- Managing third-party service providers and consultants (including CapDev procurement for regulatory, compliance, and technical services)
- Breaking down R&D objectives into manageable tasks, creating realistic timelines with contingency planning, and adapting plans as research findings emerge
- Project documentation workflows for milestones, quarterly claims, and programme reporting (complements CD-2's experiment tracking systems)

**Founder gains:**
- Structured approach to R&D management rather than ad-hoc execution
- Decision-making frameworks for R&D trade-offs and resource allocation

**Knowledge Transfer Method:** R&D project management consultant provides intensive training (Months 2-4) establishing foundational capability and systems, followed by ongoing coaching (Months 5-16) through 6-8 sessions scheduled around critical milestones. Coach provides decision-making support, problem-solving guidance, and skill refinement as Ting manages real R&D challenges. This is meta-capability development: training Ting to manage the R&D programme including procurement of other CapDev services.

**Enduring Capability:** After 16 months, Ting has demonstrated capability to run R&D programmes independently. Systems (Kanban, roadmaps, budget tracking, risk registers) and processes become organisational standards reusable for Years 3-5 HealthHub NZ R&D and future projects. Transforms business from solo founder to scalable R&D organisation.

---

**CapDev Requirement Check:**
- Required: ≥5% of total eligible costs = $35,846 (for $716,926 total)
- Actual: $36,000
- **Percentage: 5.02% ✓** (meets requirement)

**Rationale:** As first-time R&D performers, we prioritise capabilities directly de-risking the R&D programme (compliance, systematic documentation, project management). All three objectives build enduring organisational capability reusable for Years 3-5 HealthHub NZ and future health AI projects.

---

### How This Funding Increases R&D Capability (Portal Answer)

**Regulatory & Compliance Expertise ($18,000):**
- Advanced Privacy Act 2020 & HIPC expertise. Currently compliant for operational product; need expert-level capability for R&D-stage experimental scenarios and multi-PMS integration complexities.
- Comprehensive regulatory gap analysis identifies compliance risks early, preventing costly pilot delays.
- Data Privacy Impact Assessment (DPIA) teaches systematic risk assessment for cross-border data handling under IPP 12.
- Clinical safety advisory builds medical device software risk assessment capability for assist-only AI systems.
- Ongoing regulatory guidance through development, sandbox testing, pilot deployment, and scale-up phases. Each engagement teaches us how to navigate increasingly complex compliance scenarios.
- Governance frameworks and compliance documentation templates apply to all future health AI products, HealthHub NZ (Years 3-5) and beyond.

**R&D Information Management Capability ($10,000):**
- Technical consultant trains us to build and maintain experiment tracking systems, model registries, and dataset lineage workflows. Essential skills for systematic R&D documentation and reproducibility.
- LLM methods advisory for founder and Ting focused on designing experiments, standardised evaluation frameworks, and architectural comparisons that integrate with our experiment tracking, model registry, and dataset lineage systems. Ensures clinical AI research outputs are consistently documented, comparable across projects, and properly archived for future reference.
- Learn industry-standard MLOps practices for managing complex AI research programmes.

**Project Management Capability ($8,000):**
- R&D PM coach trains Ting (Operations Lead) on managing R&D projects systematically. Budget tracking, risk management, stage-gate processes, vendor management, documentation workflows.
- Ongoing coaching sessions build Ting's capability to run R&D programmes independently.
- Transforms us from solo founder to structured R&D organisation with repeatable processes for Years 3-5 HealthHub NZ and beyond.

All capabilities represent enduring skills reusable across future R&D programmes and national-scale health AI deployment.

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

**Document Version:** 4.1  
**Last Updated:** 9 December 2025  
**Status:** Ready for Forge portal submission

**Version 4.1 Changes (9 Dec 2025):**
- **CapDev section updated:** Integrated content from FORGE-CAPDEV-OBJECTIVES.md (CD-1, CD-2, CD-3 with clean structure, NZ English, aligned with Objectives 4.0)
- **Added portal answer section:** "How This Funding Increases R&D Capability" (250-word summary for portal entry)
- **03-capability-development folder archived:** All supporting files moved to archive/ subfolder

**Version 4.0 Changes (9 Dec 2025):**
- **Objectives 1-4 completely restructured for strong R&D framing:**
  - **Added technological uncertainty statements** to each objective (explicit for RDTI eligibility)
  - **Progressive constraint removal** clearly shown: Obj 1 (synthetic data) → Obj 2 (real-world data) → Obj 3 (edge cases/equity) → Obj 4 (production scale)
  - **Clear dependency flow:** Obj 2-3 explicitly build on Obj 1's architectural foundation
  - **Objective 1:** Foundation AI architecture investigation; establishes base for Obj 2-3 specialisation; includes equity/safety architectural requirements
  - **Objective 2:** Real-world data handling research; tests if Obj 1 architecture handles messy clinical data; focus on diverse formats, patient context, confidence calibration
  - **Objective 3:** Clinical accuracy validation; edge cases and equity research; removed multi-condition reasoning question per feedback
  - **Objective 4:** Complete reframe to performance validation with specific metrics (speed, accuracy, safety, utility, equity, workflow) and hard stops
  - **NZ English throughout** with trimmed unnecessary words
  - **Care Gap scope refined:** Focus on diabetes + CVD (COPD, heart failure, CKD if time allows)

**Version 3.5 Changes (9 Dec 2025):**
- Final refinement of Q1-Q6 for clarity and optimal framing:
  - **Q1:** Reframed from "test classifiers vs LLMs" to "investigate AI approaches to determine optimal architecture"; mentions lightweight models, RAG, agentic AI, hybrid; shows realistic R&D process ("initial research will determine most promising approaches to test")
  - **Q2:** Core uncertainty now "what is optimal AI architecture?" (not "which approach for which task"); focus on optimal component combination, cost-accuracy balance, NZ-trained performance; less repetition of architecture types
  - **Q3:** Simplified Challenge 2 - removed specific architecture breakdowns (classifiers/LLMs/hybrid), now lists failure modes generically to avoid repetition
  - **Q4:** Minor tightening - shortened tool descriptions, condensed overseas AI bullet list from 4 to 3 points
  - **Q5:** Removed examples for cleaner reading; added discharge summary processing capability to Inbox Helper; clarified Care Gap Finder gathers recorded info (doesn't extract from consultation notes); removed "Why These Are Clinical AI Services" section
  - **Q6:** Condensed "Our AI approach" from 7 bullets to 3 key advantages (adaptive intelligence, clinical context awareness, NZ-trained and integrated)
  - All answers now max 250 words with bullet points for easy reading

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
