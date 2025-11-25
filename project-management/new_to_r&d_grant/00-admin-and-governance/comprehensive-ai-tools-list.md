# Comprehensive AI Tools List for 2-Year R&D Programme

**Document Status:** Draft for finalization (23 Nov 2025)  
**Purpose:** Detailed breakdown of all AI capabilities to be built over 24-month R&D grant period  
**Total Feature Areas:** 10 major areas, ~45 specific tools

---

## **1. Inbox Management & Triage**

### Core Capabilities:
- **Inbox triage and classification**
  - Urgency flagging (critical/urgent/routine)
  - Type classification (labs/letters/referrals/scripts/admin/patient messages)
  - Action identification (urgent review/follow-up/no action/file)

### R&D Uncertainty:
- Can AI accurately classify heterogeneous NZ inbox items (regional lab formats, DHB letter variations)?
- What confidence threshold is safe for auto-filing vs GP review?

---

## **2. Lab Result Interpretation**

**Initial Focus (Year 1-2):** Three high-yield lab panels  
**Future Expansion:** TFT (thyroid function), iron studies, liver function tests, etc.

### **2A: Lipid Panel Intelligence**
- Abnormal lipid detection and flagging
- Statin indication assessment (per BPAC guidelines)
- Lipid target achievement monitoring (for patients on statins)
- Lifestyle vs medication recommendation
- Specialist referral triggers (familial hyperlipidaemia: LDL >5.0 + family history)

### **2B: HbA1c & Diabetes Monitoring**
- HbA1c trend analysis (improving/stable/worsening)
- Diabetes control classification (good/moderate/poor)
- Medication review triggers (when HbA1c elevated)
- Pre-diabetes identification and follow-up intervals
- Diabetes complication screening reminders (retinopathy, nephropathy, foot checks)

### **2C: Renal Function Intelligence**
- eGFR trend tracking and rate of decline calculation
- CKD stage classification (Stage 1-5 per NZ renal guidelines)
- Nephrotoxic medication identification
- Nephrology referral triggers (eGFR <30, rapid decline, ACR >30 with declining eGFR)
- Dose adjustment recommendations (medication dosing in renal impairment)
- ACR (albumin-creatinine ratio) interpretation

### R&D Uncertainty:
- Can AI safely interpret NZ lab results with regional variations (LabTests Auckland ≠ SCL ≠ Medlab)?
- How to handle multi-condition interactions (diabetes + CKD = different interpretation)?

---

## **3. Cardiovascular Risk Assessment (CVDRA)**

### Core Capabilities:
- **CVDRA auto-calculation** (NZ CVD Risk Calculator)
  - Extract parameters from patient data (age, sex, ethnicity, smoking, diabetes, BP, lipids)
  - Calculate 5-year CVD risk
  - Interpret risk level and treatment thresholds
- **Treatment recommendations** (per BPAC guidelines)
  - CVDRA >15%: "Consider statin therapy"
  - CVDRA 10-15%: "Discuss lifestyle + consider statin"
  - CVDRA <10%: "Lifestyle advice, recheck 5 years"
- **Intelligent recall scheduling**
  - 5 years for low risk (<10%)
  - Annual for moderate risk (10-15%)
  - 6-monthly for high risk (>15%) or CVD patients

### R&D Uncertainty:
- Can AI accurately extract CVDRA parameters from unstructured clinical notes?
- Can hybrid architecture (LLM for extraction + Rules for calculation) prevent hallucination?
- How to handle missing parameters (e.g., smoking status not documented)?

---

## **4. Care Gap Monitoring (Proactive)**

### Core Capabilities:
- Overdue chronic disease monitoring identification:
  - **Diabetes:** HbA1c, lipids, ACR, retinopathy, foot checks
  - **CVD:** BP, lipids, CVDRA updates
  - **CKD:** eGFR, ACR, electrolytes
  - **COPD:** Spirometry, inhaler technique, vaccinations
  - **Hypertension:** BP monitoring frequency
- PHO quality indicator tracking and optimization
- Care gap prioritisation (by clinical risk level)
- Pre-consultation care gap alerts
- Batch care gap reports (for practice nurses)

### R&D Uncertainty:
- Can AI handle complex temporal logic (HbA1c every 3 months IF poor control, 6 months IF stable)?
- How to prioritize 15 care gaps per patient (which is most urgent)?
- Multi-condition interactions (diabetes + CVD = different monitoring schedule)?

---

## **5. National Screening Programme Management**

### Core Capabilities:

#### **Cervical Screening Tracking**
- Eligible women 25-69 years, 3-yearly
- Overdue screening identification
- Automatic recall letters
- HPV test result interpretation

#### **Bowel Screening Tracking**
- Eligible people 60-74 years, 2-yearly FIT
- Overdue screening identification
- Result interpretation (positive FIT → colonoscopy referral)

#### **Breast Screening Tracking**
- Eligible women 45-69 years, 2-yearly mammogram
- Overdue screening identification
- BreastScreen Aotearoa referral generation

#### **Normal Screening Result Auto-Filing & Recall**
- Normal screening result identification (cervical, breast, bowel screening)
- Auto-filing with templated comments ("Cervical screening normal - due in 3 years")
- Intelligent recall scheduling:
  - Cervical screening: 3 years
  - Bowel screening (FIT): 2 years
  - Breast screening: 2 years
- Patient notification generation ("Your screening result is normal")

### R&D Uncertainty:
- Can AI track eligibility across multiple screening programmes simultaneously?
- How to prioritize multiple overdue screenings (bowel vs cervical vs breast)?
- When is it safe to auto-file without GP review?
- How to detect clinical context that changes "normal" interpretation?

---

## **6. Referral & Letter Management**

### Core Capabilities:

#### **Hospital Discharge Summary Processing**
- Extract key findings, new medications, follow-up actions
- Flag "GP to arrange X" action items
- Auto-file if no action required

#### **Specialist Letter Interpretation**
- Extract recommendations and action items
- Medication change detection
- Follow-up interval extraction

#### **Referral Letter Generation (Outgoing)**
- Auto-generate specialist referrals from consultation context
- Include relevant history, medications, recent results
- Format per specialist preferences

### R&D Uncertainty:
- Can AI extract action items from unstructured NZ hospital letters (20+ DHB formats)?
- How to detect implicit vs explicit action items ("recommend follow-up" vs "GP to arrange")?

---

## **7. Prescription & Medication Intelligence**

### Core Capabilities:

#### **Prescription Safety & Accuracy** (addresses 1,257 weekly errors per RNZ report)
- **Dosing error detection:**
  - Age-inappropriate dosing (paediatric, elderly)
  - Weight-based dosing errors
  - Renal function dose adjustment (CKD patients)
  - Hepatic dose adjustment
- **Quantity errors:**
  - Mismatched quantity vs duration (e.g., 30 tablets for "take twice daily for 1 month")
  - Unusual quantities flagged (prescribed 10 tablets, meant 100?)
- **Missing prescription details:**
  - Route missing (oral, topical, IV?)
  - Frequency missing (once daily, BD, TDS?)
  - Duration missing (7 days, ongoing, PRN?)
  - Indication missing (required for some medications)
- **Dangerous abbreviation detection:**
  - Flag unclear abbreviations (U for units, IU, etc.)
  - Suggest safer alternatives
- **Pre-submission validation:**
  - AI checks prescription before sending to pharmacy
  - "This prescription is missing frequency - please add"

#### **Clinical Intelligence**
- Pharmac formulary compliance checking (funded vs non-funded)
- Drug interaction detection (major interactions flagged)
- Dosing guidance (NZ-specific dosing per BPAC/NZGG)
- Special authority criteria checking (does patient meet criteria?)
- Medication reconciliation (discharge letters vs current medications)
- Duplicate therapy detection (two statins, two NSAIDs)

### R&D Uncertainty:
- Can AI detect prescription errors before submission with ≥95% sensitivity (without causing alert fatigue)?
- How to handle NZ-specific Pharmac rules and special authority criteria?
- Renal dose adjustment: Can AI calculate correct dose from eGFR + medication + indication?

---

## **8. ACC & Unclaimed Revenue Identification**

### Core Capabilities:
- **Unclaimed ACC consult identification**
  - Scan consultation notes for injury-related consultations
  - Flag consults that appear ACC-claimable but not coded as ACC
  - Suggest ACC code (based on injury description)
- **ACC-funded treatment identification**
  - Identify treatments/procedures that could be ACC-funded
  - Flag revenue opportunities (non-ACC billed when ACC-fundable)
- **ACC claim documentation assistance**
  - Extract injury details from consultation notes
  - Pre-populate ACC claim forms

### R&D Uncertainty:
- Can AI reliably detect injury-related consultations from unstructured notes?
- Can AI differentiate ACC-fundable vs non-fundable conditions accurately?
- What's the false positive rate (flagging non-ACC consults as ACC)?

**Differentiation from Health Accelerators ACC Digital Assistant:** We focus on proactive revenue identification (finding unclaimed ACC cases) vs their reactive coding assistant. Integrated within comprehensive clinical AI suite.

---

## **9. NZ Medical Answer Engine**

**Inspiration:** Similar to Australia's medlo.com.au - "Australia's Leading Medical Answer Engine"

### Core Capabilities:
- **NZ-specific medical question answering**
  - Natural language queries from GPs (e.g., "What's first-line treatment for hypertension in CKD?")
  - Answers grounded in NZ clinical guidelines (BPAC, NZGG, HealthPathways)
  - Citations and references for all answers
- **Guideline synthesis**
  - Synthesize multiple NZ guidelines into coherent answers
  - Handle guideline conflicts (when BPAC vs NZGG differ)
  - Regional variations (DHB-specific HealthPathways)
- **Clinical decision support**
  - Treatment pathway recommendations (NZ-specific)
  - Medication dosing guidance (Pharmac formulary context)
  - Vaccine schedules (NZ immunization schedule)
  - Antibiotic prescribing (per BPAC, local antibiograms)
- **Integration within Medtech widget**
  - Ask questions within clinical workflow (not separate app)
  - Context-aware (can reference current patient data if needed)

### R&D Uncertainty:
- Can NZ-sovereign clinical LLM match quality of commercial models (GPT-4, Claude) for medical Q&A?
- How to ensure answers are always grounded in NZ guidelines (prevent hallucination)?
- Can small model (7B-13B) handle complex multi-step medical reasoning?
- How to maintain currency (guidelines update, model needs retraining)?
- What's optimal UX for medical Q&A within clinical workflow (not disruptive)?

**Differentiation from medlo.com.au:** NZ-specific (not Australian), integrated within Medtech (not standalone), built on sovereign infrastructure (data stays in NZ), part of comprehensive clinical AI suite.

---

## **10. Clinical AI Dashboard & Integration**

### Core Capabilities:

#### **Intelligent Alert Prioritization**
- Clinical risk weighting (urgent vs important)
- Time-sensitive vs can-wait classification
- Patient context awareness (upcoming appointment? recent admission?)

#### **Adaptive Presentation**
- Learn from GP dismissal patterns (if GP always dismisses X, stop showing)
- Personalized to GP preferences
- Different views for different workflows (consultation vs inbox vs admin time)

#### **Cognitive Load Optimization**
- How much information to show without overwhelming?
- Summary vs detail toggle
- Batch vs real-time alerts

#### **Workflow Integration UX**
- Where in Medtech interface should dashboard appear?
- Widget vs separate tab vs overlay?
- Mobile vs desktop optimization

### R&D Uncertainty:
- **Alert fatigue prevention:** When you have 15 care gaps, 8 abnormal results, 3 overdue screenings - which to show first?
- **Context-aware surfacing:** Should diabetes alerts show during consultation vs inbox review vs end-of-day batch?
- **Adaptive learning:** Can AI learn individual GP preferences without explicit configuration?
- **Multi-modal presentation:** Text summary vs visual dashboard vs notification badges?

**This is genuine R&D** - no one has solved "how to present 40+ AI tool outputs to busy GP without causing alert fatigue."

---

## **Summary**

- **10 major feature areas**
- **~45 specific AI tools** to be built over 24 months

### **Core R&D Uncertainties (Programme-Wide):**

1. **Architecture:** Can small, self-hosted model achieve GPT-4-level accuracy for NZ-specific clinical tasks?
2. **NZ Context:** How to handle NZ clinical context (regional variations, Pharmac rules, local guidelines)?
3. **Safety:** When is AI autonomous action safe vs when does GP review required?
4. **Usability:** How to prevent alert fatigue while maintaining safety?
5. **Multi-task:** Can single model handle diverse tasks (reactive + proactive + safety) simultaneously?
6. **Medical Q&A:** Can NZ-sovereign LLM provide reliable medical answers comparable to commercial models?
7. **Revenue identification:** Can AI reliably identify unclaimed ACC cases without high false positive rate?

---

## **Feature Prioritization Summary**

### **High Priority (Core Value Proposition):**
1. Inbox Management & Triage
2. Lab Result Interpretation (3 high-yield labs)
3. CVDRA + Recall
4. Prescription & Medication Intelligence
5. NZ Medical Answer Engine

### **Medium Priority (Proactive Clinical Support):**
6. Care Gap Monitoring
7. National Screening Programme Management
8. Referral & Letter Management

### **Nice-to-Have (Revenue Optimization):**
9. ACC & Unclaimed Revenue Identification
10. Clinical AI Dashboard (essential for usability, but builds on all other features)

---

---

## **Grouping into 3 Objectives (DECIDED)**

### **Objective 2: Inbox & Admin Automation (Low Complexity / Low Risk)**
**Timeline:** Months 6-14

**Features:**
1. Inbox Management & Triage
2. Referral & Letter Management
3. Lab Result Interpretation (3 high-yield labs)
4. National Screening Programme Management (with auto-filing)

---

### **Objective 3: Clinical Intelligence & Proactive Care (Medium Complexity / Medium Risk)**
**Timeline:** Months 12-20

**Features:**
1. CVDRA Auto-Calculation + Recall
2. Care Gap Monitoring
3. ACC & Unclaimed Revenue Identification

---

### **Objective 4: Clinical Decision Support & Medical Intelligence (High Complexity / High Risk)**
**Timeline:** Months 18-24

**Features:**
1. Prescription & Medication Intelligence (safety-critical)
2. NZ Medical Answer Engine (complex medical reasoning)
3. Clinical AI Dashboard (integrates all features, adaptive learning)

---

**Next Steps:**
- [x] Features finalized (10 features)
- [x] Grouped into 3 objectives
- [ ] Update revised-objectives-24-months.md with final feature groupings
- [ ] Align R&D narrative with finalized features
- [ ] Update budget allocations per objective
