# Comprehensive AI Tools List for 2-Year R&D Programme

**Document Status:** Draft for discussion (23 Nov 2025)  
**Purpose:** Detailed breakdown of all AI capabilities to be built over 24-month R&D grant period  
**Total Feature Areas:** 11 major areas, ~50 specific tools

---

## **1. Inbox Management & Triage**

### Core Capabilities:
- **Inbox triage and classification**
  - Urgency flagging (critical/urgent/routine)
  - Type classification (labs/letters/referrals/scripts/admin)
  - Action identification (urgent review/follow-up/no action/file)
  - Smart routing to appropriate GP
  - Batch processing (summarise 50 items at once)

### R&D Uncertainty:
- Can AI accurately classify heterogeneous NZ inbox items (regional lab formats, DHB letter variations)?
- What confidence threshold is safe for auto-filing vs GP review?

---

## **2. Lab Result Interpretation (High-Yield Focus)**

### **2A: Lipid Panel Intelligence**
- Abnormal lipid detection and flagging
- CVDRA auto-calculation (NZ CVD Risk Calculator)
- Statin indication assessment (per BPAC guidelines)
- Lipid target achievement monitoring (for patients on statins)
- Lifestyle vs medication recommendation
- Specialist referral triggers (familial hyperlipidaemia)

### **2B: HbA1c & Diabetes Monitoring**
- HbA1c trend analysis (improving/stable/worsening)
- Diabetes control classification (good/moderate/poor)
- Medication review triggers (when HbA1c elevated)
- Pre-diabetes identification and follow-up intervals
- Diabetes complication screening reminders (retinopathy, nephropathy, foot checks)

### **2C: Renal Function Intelligence**
- eGFR trend tracking and rate of decline calculation
- CKD stage classification (Stage 1-5)
- Nephrotoxic medication identification
- Nephrology referral triggers (per NZ renal guidelines)
- Dose adjustment recommendations (medication dosing in renal impairment)
- ACR (albumin-creatinine ratio) interpretation

### R&D Uncertainty:
- Can AI safely interpret NZ lab results with regional variations (LabTests Auckland ≠ SCL ≠ Medlab)?
- Can small model calculate CVDRA accurately from unstructured clinical data?
- How to handle multi-condition interactions (diabetes + CKD = different interpretation)?

---

## **3. Normal Screening Auto-Filing & Recall**

### Core Capabilities:
- Normal result identification (within reference ranges + clinical context)
- Auto-filing with templated comments
- Intelligent recall scheduling:
  - Lipid recalls (5 years for low risk, annual for CVD patients)
  - HbA1c recalls (3/6/12 months based on control)
  - Renal function recalls (annual for CKD, 6-monthly for declining)
  - Thyroid recalls (annual for stable hypothyroid)
- Patient notification generation ("Your results are normal")

### R&D Uncertainty:
- When is it safe to auto-file without GP review?
- How to detect clinical context that changes "normal" interpretation (e.g., "normal" HbA1c in pre-diabetic)?

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

### R&D Uncertainty:
- Can AI track eligibility across multiple screening programmes simultaneously?
- How to prioritize multiple overdue screenings (bowel vs cervical vs breast)?

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

## **8. ACC & Injury Management**

### Core Capabilities:
- ACC code suggestion (based on consultation notes)
- ACC claim documentation assistance
- ACC-funded treatment identification
- Occupational injury classification (ACC45 vs ACC32)

### R&D Uncertainty:
- Can AI match injury descriptions to correct ACC codes (900+ ACC Read codes)?
- How to differentiate ACC-fundable vs non-fundable conditions from consultation notes?

**Note:** Health Accelerators ACC Digital Assistant is an existing competitor (180k milestone) - we differentiate by comprehensive clinical AI suite vs standalone ACC tool.

---

## **9. Clinical Guideline Assistant**

### Core Capabilities:
- Context-aware guideline surfacing (BPAC, NZGG during consultations)
- NZ-specific treatment pathways (HealthPathways integration)
- Vaccine schedule reminders (flu, COVID, childhood immunisations)
- Antibiotic prescribing guidelines (per BPAC recommendations)

### R&D Uncertainty:
- Can AI surface relevant guidelines without context from consultation?
- How to prevent guideline overload (showing 10 guidelines = none read)?

---

## **10. Patient Communication Tools**

### Core Capabilities:
- Patient-friendly result explanations (translate medical jargon)
- After-visit summary generation (consultation summary for patient)
- Medication instruction sheets (literacy-appropriate)
- Follow-up instruction generation ("Return if X happens")
- Screening invitation letters (automated outreach for overdue screening)

### R&D Uncertainty:
- Can AI generate health-literacy-appropriate text for NZ diverse population (Māori, Pacific, migrant)?
- How to maintain accuracy while simplifying medical terminology?

---

## **11. Clinical AI Dashboard & Integration**

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

- **11 major feature areas**
- **~50 specific AI tools** to be built over 24 months
- **Core R&D uncertainties:** 
  1. Can small, self-hosted model achieve GPT-4-level accuracy for NZ-specific clinical tasks?
  2. How to handle NZ clinical context (regional variations, Pharmac rules, local guidelines)?
  3. When is AI autonomous action safe vs when does GP review required?
  4. How to prevent alert fatigue while maintaining safety?
  5. Can single model handle diverse tasks (reactive + proactive + safety) simultaneously?

---

**Next Steps:**
- [ ] Group these 11 areas into 4 SMART objectives over 24 months
- [ ] Allocate features to Year 1 (Months 1-12) vs Year 2 (Months 13-24)
- [ ] Define measurable success criteria for each objective
- [ ] Calculate budget allocation per objective
