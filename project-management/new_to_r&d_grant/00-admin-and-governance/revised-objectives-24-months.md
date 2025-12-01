# R&D Objectives – ClinicPro AI (Inbox + Care Gaps)

**Project Duration:** 24 months (Jan 2026 – Jan 2028)

**Overall Goal:** Build a safe, NZ-specific clinical AI assistant that:
- Helps GPs manage overwhelming inboxes quickly and safely (Inbox Helper), and
- Finds patients who are missing important chronic disease checks (Care Gap Finder),

while proving which AI architecture (simple models, hybrid rules+LLM, NZ-trained LLM) works best for different clinical risk levels and across multiple PMSs (Medtech and Indici).

---

## High-Level Timeline (with Lean MVPs and Ongoing R&D)

**Months 1–6:** Build foundation and architecture; connect to Medtech and Indici; start early Inbox prototype.

**Months 4–12:** Inbox Helper – admin automation and early clinical overlays; lean MVP shipped to early adopters once safe.

**Months 7–16:** Care Gap Finder – diabetes/CVD first, then COPD/CHF/asthma; lean MVP shipped once safe; dashboards and comms added.

**Months 16–24:** Harder R&D – NZ-LLM refinement, equity and safety tuning, alert-fatigue optimisation, and multi-practice/multi-PMS generalisation based on real-world feedback.

---

## Programme Overview Note

A lean MVP for Inbox Helper (Objective 2) and Care Gap Finder (Objective 3) will be released to early adopters as soon as minimum safety and accuracy thresholds are met. Further planned features, refinements, and generalisation work will continue through to month 24, informed by pilot data and user feedback.

**Link to Long-Term Vision:** The architectures, NZ-LLM, and safety frameworks developed in this project for GP-facing tools (Inbox Helper and Care Gap Finder) are deliberately designed to be reused for a patient-facing companion product, HealthHub NZ, planned for years 3–5. This creates a coherent ecosystem where GP tools and patient tools share the same NZ-specific clinical knowledge and data standards.

---

## Objective 1 – Build the Smart Foundation and Early Prototypes (Months 1–6)

### Plain-English Aim

Create a flexible, safe AI backbone that can plug into Medtech and Indici, test different AI "recipes" on synthetic NZ healthcare data, and support early Inbox and Care Gap prototypes by months 4–7.

### Key R&D Questions

- Which AI approach works best for each task: simple classifier, generic LLM, hybrid rules+LLM, or NZ-trained LLM?
- Can a NZ-trained LLM understand local clinical language (bpac/MoH guidance, lab formats, Medtech/Indici notes) better than generic models?
- How do we design one architecture that can support both Medtech and Indici without major rework for each platform?

### What is Actually Built

#### NZ Clinical Data and Test Sets

- Curate an NZ clinical corpus (≥10,000 pages) from bpac.org.nz, Ministry of Health, Pharmac, example lab reports and discharge summaries.
- Generate synthetic datasets:
  - ≥1,000 synthetic inbox items (labs, discharge letters, referrals, scripts, admin, patient messages) using LabTests, SCL, Medlab formats and typical GP workflows.
  - ≥500 synthetic patient records with chronic conditions (diabetes, COPD, CHF, asthma) including labs, medications, and monitoring history.

#### Core Platform and Integrations

Build a modular backend that:
- Connects securely to Medtech and Indici (read-only initially, through their FHIR/related APIs).
- Normalises different lab and document formats into a consistent internal structure.
- Routes tasks to different model types (simple classifier vs hybrid vs LLM) depending on risk and complexity.

Build simple "widget shells" for Medtech and Indici that can display early AI outputs inside each PMS.

#### Architecture Experiments

Compare multiple approaches for representative use cases:
- Inbox triage: BERT-style classifier vs small LLM vs hybrid.
- CVD risk calculation (CVDRA): rules-only vs LLM-only vs hybrid rules+LLM.

Train an initial NZ-LLM (or adapted small model) on the NZ corpus and benchmark it vs GPT-4 on NZ-specific tasks (e.g., interpreting local labs, summarising NZ discharge letters).

### Deliverables by Month 6

- **Foundation system v1.0 deployed:**
  - Connected to Medtech and Indici test/sandbox environments.
  - Handling synthetic inbox items and patient records with ≥90% triage accuracy and ≥95% CVDRA accuracy on test sets.

- **Architecture recommendations documented for:**
  - Inbox Helper (e.g., lightweight classifier + rules vs LLM),
  - Care Gap Finder (hybrid rules+NZ-LLM for extraction and calculations).

- **Early sandbox prototypes:**
  - Inbox prototype that can sort and flag synthetic inbox items.
  - Care Gap prototype that calculates CVD risk and simple diabetes gaps on synthetic patients.

---

## Objective 2 – Inbox Helper: Admin Automation and Early Clinical Overlays (Months 4–12)

### Plain-English Aim

Turn the Inbox prototype into a practical tool that reduces GP inbox workload and highlights urgent issues safely in both Medtech and Indici. A lean Inbox MVP will be offered to early adopters as soon as core safety/accuracy thresholds are met.

### Key R&D Questions

- Can lightweight models safely handle messy, real NZ inbox data (vs synthetic data)?
- What confidence level is safe enough for auto-filing normal results without risking missed urgents?
- How should AI suggestions appear in Medtech and Indici so GPs understand and trust them (explanations, overrides, layouts)?

### Features Developed

#### Triage and Processing

- Automatically classify real inbox items into: labs, hospital letters, specialist letters, referrals, prescriptions, admin, patient messages.
- Assign urgency labels:
  - "Review today" (serious abnormalities or red-flag letters),
  - "Soon",
  - "Routine".
- Compare current labs with previous ones:
  - "HbA1c increased from 48 to 62 mmol/mol over 12 months."
  - "eGFR dropped from 65 to 45 ml/min over 6 months."

#### Automation

**Normal screening results:**
- Normal mammograms → auto-file with standard text ("Normal 2026, repeat 2028") and recall set.
- Normal HPV cervical screens → auto-file with appropriate recall interval.
- Normal blood tests in agreed-safe categories auto-filed with:
  - GP-authored standard comments,
  - Correct recall intervals based on NZ guidelines.

#### Clinical Overlays (Early, Non-Prescribing)

Rule-based flags on labs and trends:
- "eGFR 45 suggests possible CKD stage 3b – consider review."
- "HbA1c >64 indicates poor diabetes control – discuss management."

No specific drug recommendations; instead, prompts aligned with guideline actions (e.g., "consider reviewing statin therapy based on CVD risk score from Care Gap Finder").

#### Patient Handoffs

Generate simple, editable messages, such as:
- "Your test results are normal; no changes are needed."
- "Your cholesterol is raised; please book a nurse appointment to discuss lifestyle and options."

Support for SMS/portal/email templates, with GP approval before sending.

### Medtech and Indici Integration

**Common Inbox Helper widget used in both systems:**
- In Medtech: integrated in the inbox view, showing AI classification, urgency, and suggested actions, with one-click approval or override.
- In Indici: similar AI summaries and action buttons adapted to Indici's layout and workflow.

R&D focus: measure and compare performance, errors, and GP interactions across both PMSs and adjust the architecture and UI to generalise.

### Lean MVP and Ongoing R&D

A lean MVP of the Inbox Helper will be released to early adopter practices as soon as minimum safety and accuracy thresholds are met (e.g., ≥90% triage accuracy, zero unsafe auto-filing in 1,000 edge-case tests), with further triage, automation, and patient-message features added during the remainder of the project.

R&D continues in parallel on:
- Expanding supported document types,
- Improving explanations,
- Optimising confidence thresholds and UI based on feedback.

### Deliverables by Month 12

- Inbox Helper fully functional in Medtech and Indici sandbox environments.
- Validation on ≥2,000 real inbox items (de-identified or safe test environments) showing:
  - ≥90% classification accuracy,
  - Zero unsafe auto-filing in edge-case test suite,
  - Measured ~30% time saving in simulated GP workflows.
- Usability feedback from at least 5 GPs incorporated into system design and defaults.

---

## Objective 3 – Care Gap Finder: Chronic Disease Intelligence (Months 7–16)

### Plain-English Aim

Build a tool that scans patient records to find people who are overdue for key chronic disease checks (starting with diabetes and cardiovascular risk, then COPD, CHF, and asthma) and helps practices get those patients seen. A lean Care Gap MVP will be offered once core accuracy and safety thresholds are met.

### Key R&D Questions

- Can NZ-trained AI reliably pull out key details (e.g., smoking status, medications, severity markers) from messy free-text clinical notes as well as structured fields?
- How can care gap logic handle multiple conditions (e.g., diabetes + CKD + CVD) without overwhelming GPs with alerts?
- How should patients be prioritised so that high-risk and Māori/Pacific patients are not left behind?

### Features Developed

#### Data Review and Analysis

**Diabetes:**
- Reads HbA1c trends, ACR, and diabetes diagnoses.
- Flags overdue HbA1c tests, eye checks, foot checks, and kidney monitoring.

**Cardiovascular risk:**
- Pulls age, sex, ethnicity, BP, lipids, smoking, diabetes.
- Calculates NZ CVDRA and groups patients by risk band (e.g., low, moderate, high).

**COPD:**
- Identifies COPD diagnoses and last spirometry.
- Flags overdue lung function tests and frequent exacerbations based on notes.

**Heart failure (CHF):**
- Tracks BNP and eGFR trends.
- Flags patterns suggesting worsening heart failure needing review.

**Asthma:**
- Uses medication patterns and note content to estimate control (e.g., frequent reliever use).
- Flags patients who may require step-up therapy review.

#### Care Gap Detection

For each condition, checks:
- Are recommended tests up to date?
- Are monitoring visits overdue?
- Are key guideline-based checks missing (e.g., vaccines, retinal screening)?

Combines multiple conditions to avoid double-alerting and to reflect the highest-priority needs.

#### Patient Communication

Generates personalised, plain-language messages, for example:
- "Your diabetes review is overdue; please book an appointment with our nurse."
- "You are at higher risk of heart disease; your doctor recommends a heart health check."

Supports different channels (SMS/portal/email), with practice-controlled templates and review.

#### GP/Practice Dashboards

A "Top priority patients" list showing:
- Who has important gaps,
- Why they are flagged,
- Suggested next step (e.g., book nurse review, book GP review).

Filters by:
- Condition (e.g., diabetes-only list),
- Risk level,
- Equity focus (Māori, Pacific, high-deprivation).

### Medtech and Indici Integration

**Care Gap Finder panels integrated into both PMSs:**
- At patient level: show their current gaps and recent relevant results.
- At practice level: show lists of patients needing action and allow staff to bulk-send recalls or schedule clinics.

### Lean MVP and Ongoing R&D

A lean MVP of the Care Gap Finder (starting with diabetes and CVD risk) will be released early once core targets are met (e.g., ≥95% CVDRA accuracy, ≥85% care-gap detection vs GP audit, safe messaging), then expanded to COPD, CHF, asthma and more advanced dashboards as the NZ-LLM and rules are refined.

R&D continues on:
- Adding COPD/CHF/asthma logic,
- Improving multi-condition logic and prioritisation,
- Refining NZ-LLM extraction and equity-aware algorithms.

### Deliverables by Month 16

- Care Gap Finder operational in sandbox for both Medtech and Indici.
- Validated on ≥1,000 de-identified patient records, showing:
  - ≥95% accuracy for CVDRA,
  - ≥85% agreement with GP audit on care gaps,
  - Demonstrated ability to prioritise high-risk and Māori/Pacific patients appropriately.

---

## Objective 4 – Advanced Refinement, Safety, Equity and Generalisation (Months 16–24)

### Plain-English Aim

Use real-world feedback and pilot data to do the "hard" R&D work: refine NZ-LLM models, tune alert and safety behaviour, and prove the system generalises across multiple practices and both PMSs. This ensures substantive R&D continues to the end of the project, even with early MVP releases.

### Key R&D Questions

- How much does performance change when moving from pilot practices to new practices with different patient populations, clinicians, and workflows?
- How can alert thresholds and messaging be tuned to minimise "noise" while still catching all important issues (alert fatigue vs safety)?
- How can NZ-LLM and rules be refined to support equitable performance across regions and populations?

### Activities and Features

Objective 4 will use real-world data and GP/patient feedback to study why errors, missed gaps, or alert fatigue occur, and to refine the NZ-LLM, rules, and UI patterns so performance, safety, and equity are maintained across new practices and both Medtech and Indici. This is systematic R&D on generalisation and safety, not routine maintenance.

#### NZ-LLM and Rules Refinement Using Real-World Data

- Analyse model errors, missed gaps, and mis-classified inbox items observed during early adopter use.
- Retrain or fine-tune NZ-LLM and adjust rules to:
  - Improve extraction from messy real-world notes and letters,
  - Reduce misunderstanding of local abbreviations and phrasing,
  - Maintain strict constraints (e.g., never recommend specific medications, always show reasoning).

#### Safety and Alert Optimisation

Collect statistics on:
- How often alerts are accepted, ignored, or dismissed.
- Which alerts GPs and nurses find most/least useful.

Adjust thresholds and logic to:
- Maintain very high sensitivity for safety-critical events (e.g., dangerous labs, major gaps),
- Reduce lower-value or repetitive alerts to avoid fatigue.

Expand automated safety testing and regression suites to thousands of test scenarios, including adversarial prompts and rare edge cases.

#### Multi-Practice, Multi-PMS Generalisation

Run structured pilots across several practices using both Medtech and Indici:
- Compare accuracy, safety, and usage patterns by region, practice size, and patient mix.
- Investigate any performance gaps (e.g., poorer results in particular regions or populations) and fix them through model, rule, or data changes.
- Document technical patterns and best practices for adding future PMSs or health-system integrations.

### Deliverables by Month 24

- **Refined NZ-LLM models and rule sets with:**
  - Documented accuracy and safety across multiple practices,
  - Evidence of robust performance across both Medtech and Indici.

- **Alert and safety configuration tuned based on real usage, with clear quantitative metrics for:**
  - Alert rates,
  - Acceptance/override patterns,
  - Safety outcomes (e.g., no missed critical results in tested cohorts).

- **Final pilot report summarising:**
  - Time savings per GP per day,
  - Care gaps identified and closed,
  - Equity metrics (e.g., changes in Māori/Pacific screening and review rates),
  - Safety incidents (if any) and mitigation processes.

- **A clear roadmap for broader commercial rollout** (including additional features and PMSs) grounded in the R&D findings.

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
- Can AI identify emerging health trends (e.g., "South Auckland diabetes screening rates dropping 15%—intervention needed")?
- How do you train AI on real-world data while preventing dangerous pattern learning?

**Benefits:** AI recommendations improve based on actual NZ patient outcomes, not just international guidelines. Evidence-based insights for government health planning.

### 3. National Scale Integration - Years 4-5

Extend beyond Medtech/Indici to hospital systems and national records.

**AI R&D questions:**
- How does one NZ-trained LLM generalise across different hospital data formats while maintaining accuracy?
- Can AI maintain safety as it scales from hundreds to hundreds of thousands of users?

**Benefits:** Connected care—patient sees specialist, GP gets AI summary automatically. No repeated tests, no lost referrals.

**Why Substantial R&D:** Patient-facing AI requires different safety training than GP-facing AI. Learning from outcomes without compromising safety is unsolved AI research. National-scale generalisation requires novel training approaches beyond the 24-month grant scope.

**Supports government goal:** Makes 10-year digital health plan intelligent and accessible for all New Zealanders.

---

**Document Status:** Final version for external review  
**Last Updated:** 28 November 2025  
**Version:** 3.0
