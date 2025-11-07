# New to R&D Grant Proposal - ClinicPro
## NZ-Sovereign Clinical AI for General Practice

**Prepared for:** [Mentor Name]  
**Date:** November 2025  
**Applicant:** NexWave Solutions Ltd  
**Project Duration:** 27 Jan 2026 - 26 Jan 2027 (12 months)

---

## **Section 1: Executive Summary** (1 page)

### **The Problem**

New Zealand GPs face a severe workforce and workload crisis:

- **70% burnout; 35% retiring in 5 years** - unreasonable workloads, unfunded admin roles driving early retirement
- **Inbox overload** - hundreds of items daily (letters, labs, referrals); GP working hours rising (35.9→38.1 hrs/week)
- **Rising responsibility without support** - expanded scope, compliance, documentation with no proportional support
- **GPs want AI but concerns exist** - privacy, Māori data sovereignty, system integration barriers

### **Why AI Can Help**

AI can rapidly process clinical text - triaging inbox items, extracting billing codes, checking referral criteria, identifying care gaps - freeing hours of GP time daily.

### **Current AI Tools Fall Short**

- **Most only do scribing** - no tools for inbox, coding, referrals, or care gaps
- **Lacks New Zealand Health System knowledge** - not trained on local requirements
- **Privacy concerns** - patient data sent offshore; Māori data sovereignty issues
- **Expensive at scale** - $140k+/month vs $5-10k/month self-hosted

### **Our Solution**

We're building a small, NZ-controlled AI model for 4 critical workflows: **inbox management, clinical coding, referral checking, and care gap monitoring.** Self-hosted for privacy, NZ-tuned for accuracy, cost-effective at scale.

**Why we can deliver this:**  
I'm a practicing GP, founder of ClinicPro (operational AI scribe service), and full-stack developer with AI/machine learning expertise. This unique combination of clinical insight, proven building capability, and technical depth means I understand both the problem (I experience it daily in practice) and can execute the technical solution. We're partnering with Medtech, NZ's largest practice management system, which provides direct access to real-world testing environments and rapid adoption pathways across 3,000+ GPs.

### **Why This is R&D**

**Technical uncertainty:** Can a small AI model (7B-13B parameters) achieve good quality for NZ-specific clinical tasks while being:
- **20-50x cheaper at scale** (self-hosted vs commercial APIs)
- **NZ-tuned** (trained on NZ-specific rules and workflows)
- **Multi-task** (one model for 4 use cases, not 4 separate models)
- **Privacy-safe** (self-hosted with strong safeguards)

**No published solution exists** for this cost/quality trade-off under NZ privacy constraints.

### **Grant Ask & Timeline**
- **Total eligible costs:** $107,232 (excl. GST)
- **Grant (40%):** $42,893
- **Co-funding (60%):** $64,339 (from GP clinical work income)
- **Timeline:** 12 months (5 R&D Objectives + Capability Development)

### **Key Differentiators**
✓ **NZ data sovereignty** (self-hosted in NZ/AU, NZ-held keys)  
✓ **Cost-effective at scale** (fixed infrastructure vs pay-per-request)  
✓ **NZ-tuned** (Pharmac, ACC, HealthPathways, regional variations)  
✓ **Medtech partnership** (NZ's largest PMS = real-world testing)  
✓ **Privacy-first** (no training on production PHI; synthetic/de-identified only)

---

## **Section 2: The Opportunity** (2-3 pages)

### **2.1 Problem Statement**

New Zealand general practitioners (GPs) face a severe workforce and workload crisis that threatens the sustainability of primary healthcare.

- **Burnout driving early retirement and workforce depletion:**  
  Burnout among GPs remains unacceptably high, with 70% reporting moderate-to-severe levels in 2024. Although the proportion of those rating "high" burnout (level 7-10) fell from 48% in 2022 to 38% in 2024, the overall burden is significant. Unreasonable workloads, unfunded and additional roles, and non-remunerated work are primary drivers. These conditions are causing many GPs to consider early retirement: 35% intend to retire within five years, and half plan to retire within a decade, threatening significant workforce shrinkage ([RNZCGP Workforce Survey](https://www.rnzcgp.org.nz/our-voice/workforce-survey/)).

- **Significant and rising administrative and inbox management burdens:**  
  Inbox management - processing hospital letters, lab results, referrals, and other communications - now constitutes a major and growing complaint among GPs. The incoming volume of items (which can be hundreds per day in busy clinics) is a substantial cognitive burden, detracting from patient care and driving burnout. The increase in non-consultation (admin, governance, training) tasks is rising, largely unfunded and often unrecognised, with average GP weekly working hours increasing from 35.9 in 2022 to 38.1 in 2024 ([RNZCGP Workforce Survey](https://www.rnzcgp.org.nz/our-voice/workforce-survey/), [Pinnacle Survey](https://www.pinnaclepractices.co.nz/assets/Resource-files/Pinnacle-workforce-survey-report-2023-v3.pdf)).

- **Rising responsibility without increased support:**  
  GPs face expanded scope - coordinating care pathways, maintaining compliance, fulfilling documentation requirements, and ensuring ongoing follow-up, all amidst increasing inbox volume and administrative complexity. Without proportional increases in support or automation, these responsibilities worsen stress and can compromise patient safety ([Pinnacle Workforce Survey Report](https://www.pinnaclepractices.co.nz/assets/Resource-files/Pinnacle-workforce-survey-report-2023-v3.pdf)).

- **Interest in AI, but major limitations:**  
  Recent surveys show openness to using AI for workload relief, particularly in notetaking and scribing, but major concerns remain around data privacy, Māori data sovereignty, and system integration ([RNZCGP Workforce Survey](https://www.rnzcgp.org.nz/our-voice/workforce-survey/)). Better IT, automation, and AI are cited as necessary innovations to relieve the widening administrative challenges ([Pinnacle Workforce Survey Report](https://www.pinnaclepractices.co.nz/assets/Resource-files/Pinnacle-workforce-survey-report-2023-v3.pdf)).

Together, these factors create an unsustainable environment that **drives GP burnout, workforce attrition, and threatens the quality of primary care.** Addressing these systemic issues requires innovative solutions that reduce administrative load, support clinical decision-making, and retain workforce capacity.

---

### **2.2 Why AI Can Help**

AI can address the most urgent pain points in New Zealand general practice:

**Inbox and admin burden relief:**
- AI models can rapidly triage, classify, and summarise the massive daily influx of hospital letters, results, and referrals - tasks currently consuming a significant proportion of GP time, contributing to burnout and workforce loss
- This frees GPs from routine, repetitive documentation work, allowing them to focus on patient-facing care

**Retention and workforce sustainability:**
- By reducing cognitive load and manual admin, AI supports GP wellbeing and keeps skilled clinicians in the workforce longer - directly countering early retirement trends spotlighted in national surveys ([RNZCGP Workforce Survey](https://www.rnzcgp.org.nz/our-voice/workforce-survey/))

**Alignment with clinician priorities:**
- Recent NZ workforce surveys show GPs are already experimenting with AI tools, especially for notetaking and scribing, and express strong demand for technology that can automate or streamline non-clinical tasks ([Pinnacle Workforce Survey](https://www.pinnaclepractices.co.nz/assets/Resource-files/Pinnacle-workforce-survey-report-2023-v3.pdf))
- However, GPs also highlight concerns about data privacy, local relevance, and system integration, which our solution directly addresses

**Patient care and system benefits:**
- By giving GPs more time for direct care and proactive patient management, AI can help improve access, safety, continuity, and even health funding outcomes

---

### **2.3 Current AI Tools Fall Short**

**Lack of NZ-specific tuning and integration:**
- Current tools are not tailored to New Zealand's healthcare environment
- They lack training on local clinical codes (ACC, Pharmac), referral pathways (HealthPathways), and practice funding requirements (PHO indicators)
- This leads to limited accuracy and relevance in daily GP workflows

**Failure to address core administrative burden (inbox management, non-visit tasks):**
- Most tools only support scribing/note-taking, leaving the largest pain points untouched
- No tools exist for inbox triage, clinical coding, referral checking, or care gap monitoring

**Local privacy and sovereignty concerns:**
- Sending patient data offshore is not acceptable, especially for Māori data sovereignty
- Commercial APIs send data to US servers; even Azure-hosted options raise concerns about foreign control
- GPs have explicitly flagged these as barriers to adoption ([RNZCGP Workforce Survey](https://www.rnzcgp.org.nz/our-voice/workforce-survey/))

**Cost and scalability issues for NZ clinics:**
- Commercial deployed models can be prohibitively expensive at volume
- Azure OpenAI: $140-170k/month at national scale (5,000 GPs × 50 requests/day)
- Small GP practices need cost-effective, scale-adapted solutions

**Integration barriers:**
- Existing tools are poorly integrated with local PMS systems (like Medtech) and workflows identified in local surveys
- Lack of seamless integration creates friction and reduces adoption

---

### **2.4 Market Gap**

**Four Unmet Needs in NZ General Practice:**

1. **Inbox Management:** No AI solution for NZ GP inboxes (region-specific lab formats, DHB letter structures)
2. **Clinical Coding:** No NZ-specific coding assistant (ACC, PHO, Care Plus rules)
3. **Referral Quality:** No tool checks HealthPathways criteria before sending referrals
4. **Care Gap Monitoring:** No AI tracks NZ-guideline chronic disease monitoring gaps

**Market Size:**
- ~5,000 GPs in NZ
- Medtech PMS: ~60% market share (largest in NZ)
- ClinicPro partnership with Medtech = direct access to 3,000+ GPs

---

### **2.5 Why Now?**

✓ **LLM technology matured** (small models now viable with quantisation, LoRA tuning)  
✓ **NZ privacy framework clear** (IPP 12, HIPC, HISO 10029, NAIAEAG guidance)  
✓ **Self-hosting infrastructure affordable** (GPU servers in NZ/AU: ~$5-10k/month)  
✓ **ClinicPro operational** (proven demand for AI-assisted GP workflows)  
✓ **Medtech partnership** (testing environment ready; direct access to 3,000+ GPs)

---

## **Section 3: Our Solution** (3-4 pages)

To address the unsustainable workload, inbox burden, and burnout crisis facing New Zealand GPs, we propose building a locally controlled, NZ-specific AI assistant designed to directly target the highest-impact pain points identified by frontline clinicians and workforce surveys.

---

### **3.1 Direct Relief for Administrative and Inbox Overload**

The AI model will triage, prioritise, and summarise clinical inbox items - including letters, results, and referrals - reducing manual sorting and freeing GPs from repetitive documentation. This targets the primary source of time pressure and stress for GPs.

**Key capabilities:**
- Automatic classification of inbox items by type, urgency, and clinical specialty
- Concise summaries highlighting actionable information
- Intelligent routing to appropriate workflows
- Processing hundreds of items per day without fatigue

**Impact:** Directly addresses the inbox burden identified as a major driver of burnout in recent surveys.

---

### **3.2 Multifunctional Design for Maximum Clinical Impact**

Unlike existing solutions limited to note-taking, our model is purpose-built to automate and assist with four critical workflows:

**1. Inbox Management**
- Triage and summarise hospital letters, lab results, referrals, patient messages
- Reduce time spent on daily inbox processing by 30%+

**2. Clinical Coding (including ACC, Pharmac)**
- Extract billable codes from consultation notes
- Identify ACC eligibility, PHO subsidies, Care Plus criteria
- Reduce revenue leakage from missed billing codes

**3. Referral Quality Checking**
- Ensure HealthPathways criteria are met before submission
- Reduce referral bounce-backs and patient care delays
- Regional variation support (10 Community HealthPathways sites)

**4. Care Gap Monitoring**
- Track chronic disease and preventive care requirements
- Alert overdue NZ-guideline monitoring (NZGG, BPAC, PHO indicators)
- Improve PHO quality outcomes and funding

This broad feature set directly addresses the functions NZ GPs have identified as most problematic.

---

### **3.3 NZ-Tuned and Privacy-First**

**Local training and knowledge:**
- Trained on New Zealand's local care standards, coding systems, PHO and HealthPathways requirements
- Understands ACC codes, Pharmac formulary, regional lab format variations
- Aligned with NZ clinical guidelines (NZGG, BPAC) and funding requirements

**Data sovereignty and privacy:**
- Hosted on New Zealand or Australia-based infrastructure with strict access controls
- Patient data remains in NZ; NZ-held encryption keys
- No offshore data transmission for training or inference (AU inference is transient only, no persistent storage)
- Compliance with Privacy Act 2020 (IPP 12), HIPC 2020, HISO 10029
- Supports Māori data sovereignty requirements

**Regulatory alignment:**
- DPIA completed before pilot
- Te Whatu Ora NAIAEAG guidance compliance (assist-only, transparency, human oversight)
- Monthly safety regressions to ensure assist-only behaviour

This ensures compliance with local privacy laws and supports Māori data sovereignty, overcoming a key barrier to AI adoption in NZ practice.

---

### **3.4 Cost-Effective, Scalable, and Interoperable**

**Predictable, sustainable economics:**
- Fixed infrastructure costs: $5-10k/month at national scale
- Compare to commercial APIs: $140-170k/month for same volume
- **20-50x more cost-effective** at scale
- Enables equitable access across all practice sizes

**Seamless integration:**
- Direct integration with Medtech, NZ's most widely used practice management system (~60% market share)
- Enables seamless workflow adoption with minimal training
- Real-world clinical utility from day one
- Rapid testing and feedback cycles

**Scalability:**
- Designed to serve all 5,000 NZ GPs
- Performance maintained under high load
- No per-request pricing risk as volume grows

---

### **3.5 Built with Deep Clinical Insight**

**Clinical + technical + commercial expertise:**
- Led by a practicing GP who experiences the problems firsthand
- Founder of ClinicPro (operational AI scribe service)
- Full-stack developer with AI/machine learning expertise
- Proven track record in medical AI and workflow automation

**Real-world validation:**
- Strong relationship with Medtech provides direct access to testing environments
- Rapid feedback from 3,000+ GPs through Medtech partnership
- Ability to iterate based on actual clinical workflows, not assumptions

**Grounded in daily clinical realities:**
- Not just technical ambitions - built by someone living the problem
- Understanding of what "assist-only" means in practice
- Knowledge of what's helpful vs dangerous in clinical decision-making

---

### **3.6 Why It's Different**

Our solution stands apart from existing AI tools:

✓ **NZ data sovereignty and privacy by default** - not an afterthought  
✓ **Meaningful cost savings at national scale** - sustainable for NZ health sector  
✓ **NZ-tuned logic and coding** - understands local requirements  
✓ **Focus on root-cause workflow pain points** - not just scribe replacement  
✓ **Partnership for direct, real-world integration and validation** - Medtech access

---

### **3.7 Use Case Details**

#### **Use Case 1: Inbox Management**

**What it does:**
- Classifies GP inbox items: Labs (urgent/routine), Letters (specialist/discharge/other), Referrals (incoming/updates), Patient messages, Pharmacy queries, Admin
- Summarises key points (e.g., "HbA1c 68 → increased from 52 six months ago → action required")
- Routes to correct workflow (e.g., "Urgent cardiology result → flag for today's review")

**Why it's R&D:**
- **NZ-specific challenge:** Lab formats vary by region (LabTests Auckland header structure ≠ SCL ≠ Medlab)
- **Noisy, heterogeneous data:** Inboxes contain everything from structured lab results to unstructured patient messages and pharmacy queries
- **Multi-label classification:** Single item might need multiple tags (e.g., "Urgent + Cardiology + Action Required")
- **Uncertainty:** Can a small model handle this variety with regional NZ variations?

**Success metrics:**
- Classification accuracy ≥90%
- Time savings: ≥30% reduction in inbox triage time
- Clinician satisfaction ≥80% ("AI summaries are useful")

---

#### **Use Case 2: Clinical Coding Assistant**

**What it does:**
- Reads consultation note
- Suggests NZ billing codes:
  - **ACC codes** (ACC45, soft tissue injury, gradual process)
  - **PHO codes** (consultation types, age bands)
  - **Care Plus eligibility** (3+ chronic conditions with specific criteria)
  - **Consultation complexity** (Standard vs Long vs Complex)
- Flags potential underbilling (e.g., "Patient has diabetes + hypertension + COPD → eligible for Care Plus")

**Why it's R&D:**
- **NZ-unique rules:** ACC codes, PHO subsidies, Care Plus criteria don't exist in GPT-4/5 training data
- **Complex logic:** Care Plus requires specific combinations of chronic conditions (not just "3+ conditions")
- **Extraction challenge:** Pull billable elements from unstructured notes
- **Limited training data:** Few thousand NZ billing examples vs GPT-4/5's billions of tokens
- **Uncertainty:** Can a small model learn these rules from limited data?

**Success metrics:**
- Coding accuracy ≥85% (compared to expert coder)
- Revenue uplift: ≥5% increase in appropriate billing
- GP acceptance: ≥75% accept AI suggestions

---

#### **Use Case 3: Referral Quality Checker**

**What it does:**
- Reviews outgoing specialist referrals before sending
- Cross-checks against regional HealthPathways criteria (Canterbury, Auckland, Wellington, etc.)
- Flags missing information:
  - Example (Cardiology): Missing ECG, lipid panel, smoking status, CVD risk score
  - Example (Dermatology): Missing photo, lesion duration, prior treatments
- Suggests additions: "⚠️ HealthPathways Cardiology (Canterbury) requires: ECG, lipids, BP, smoking status. Missing: ECG."

**Why it's R&D:**
- **Regional variation:** 10 regional Community HealthPathways sites with different criteria for each specialty
- **Unstructured referral letters:** Extract structured fields from free-text narratives
- **Dynamic requirements:** HealthPathways updates quarterly
- **Uncertainty:** Can small model track region-specific, evolving criteria and extract required fields?

**Success metrics:**
- Referral acceptance rate: ≥90% (reduce bounce-backs from specialists)
- Completeness: ≥80% of flagged missing items are genuinely required
- Time savings: ≥20% reduction in referral rework time

---

#### **Use Case 4: Chronic Disease Care Gap Identifier**

**What it does:**
- Flags patients overdue for NZ-guideline chronic disease monitoring
- Examples:
  - **Diabetes:** HbA1c >3 months, annual foot exam overdue, CVD risk assessment missing
  - **CVD:** BP not recorded in 6 months, lipid panel >12 months, smoking status unknown
  - **COPD:** Spirometry >2 years, inhaler technique check overdue, flu vaccine missed
- Links to NZ guidelines (NZGG, BPAC) and PHO performance indicators
- Prioritizes by risk (e.g., diabetes + CVD = higher priority than isolated hypertension)

**Why it's R&D:**
- **NZ-specific guidelines:** NZGG diabetes guidelines, NZ CVD risk charts (not Framingham), PHO quality indicators differ from overseas
- **Complex temporal logic:** Track multiple conditions × multiple tests × different intervals (e.g., HbA1c every 3 months IF poor control, 6 months IF stable)
- **Multi-condition interactions:** Diabetes + CVD = different monitoring schedule than diabetes alone
- **PHO funding alignment:** PHOs get paid for chronic disease management (financial incentive = commercial value)
- **Uncertainty:** Can small model handle complex, time-based, multi-condition logic with NZ-specific rules?

**Success metrics:**
- Gap detection accuracy ≥85% (compared to manual audit)
- PHO QOF (Quality Outcomes Framework) score improvement ≥10%
- Patient monitoring completion rate ≥80%

---

### **3.2 Technical Approach (Non-Technical Language)**

**Foundation:**
- Start with open-source base model (e.g., Llama 3, Mistral 7B-13B)
- Self-host on NZ/AU GPU infrastructure (NZ data sovereignty)

**NZ-Specific Fine-Tuning:**
- **Domain adaptation:** Continual pretraining on NZ public clinical sources (BPAC, NZGG, Pharmac formulary, NZMA journals, HealthPathways criteria)
- **NZ health system knowledge:** Train on NZ-specific entities (ACC codes, PHO subsidies, Care Plus criteria, regional lab formats, available tests per region)
- **Task-specific tuning:** Instruction tuning for 4 use cases using synthetic/de-identified NZ data
- **Multi-task architecture:** ONE model handles all 4 use cases (shared knowledge, cost-efficient)

**Safety Guardrails:**
- **Assist-only policy:** Model refuses diagnostic/treatment directives
- **Refusal scaffolds:** "I cannot diagnose; please use clinical judgment"
- **Human-in-the-loop:** All outputs reviewed by clinician before action
- **Monthly safety regressions:** Test prohibited-claim rate ≤0.5%, refusal appropriateness ≥95%

**Medtech-First Integration:**
- **Sandbox testing (Months 4-9):** Synthetic workloads in Medtech environment
- **Least-privilege scopes:** Only access necessary fields (no full patient records)
- **Pilot-readiness (Month 10+):** Real-world pilot after safety gates passed

---

### **3.3 Why This is R&D (Not Just Software Development)**

**The Technical Uncertainty:**

> **Research Question:** Can a small model (7B-13B params) achieve 70-80% of GPT-4/5 quality for NZ-specific clinical tasks under strict cost, privacy, and latency constraints?

**What Makes This Uncertain:**
1. **No published solution** for achieving GPT-4/5-like quality with small models under NZ privacy + cost + latency constraints
2. **NZ-specific data is sparse** (few thousand examples vs GPT-4/5's trillions of tokens): Can small model learn from limited data?
3. **Multi-task challenge**: Can ONE model handle 4 diverse tasks (classification, extraction, temporal logic, coding) or do we need 4 specialised models?
4. **Safety vs usefulness trade-off**: How aggressive can refusal scaffolds be without making the model useless?
5. **Regional variation**: Can model handle 10 regional Community HealthPathways sites' variations?

**What We Cannot Deduce in Advance:**
- Optimal model size (7B too small? 13B sufficient? 30B needed?)
- Required amount of NZ-specific fine-tuning (100 examples? 10,000 examples?)
- Best multi-task architecture (shared encoder? Task-specific adapters? LoRA layers?)
- Guardrail configuration (refusal threshold that balances safety + usefulness)

**This requires systematic experimentation** - not just "apply known techniques."

---

## **Section 4: Why Not Just Use Azure OpenAI?** (1 page)

### **4.1 The Challenge**

**Microsoft Azure OpenAI Service (AU-hosted) exists and solves privacy:**
- GPT-4/5 deployed in Australia East (Sydney)
- Data residency guarantees (no persistent storage outside selected region)
- Microsoft compliance (SOC 2, ISO 27001, HIPAA-equivalent)

**So why spend $107k on R&D instead of just using Azure?**

---

### **4.2 The Cost Problem at Scale**

**Azure OpenAI Pricing (GPT-4 Turbo):**
- Input: $0.01/1k tokens; Output: $0.03/1k tokens
- Average GP request: ~1k input + 300 output tokens = **~$0.019/request**

**At National Scale (5,000 NZ GPs):**
- 5,000 GPs × 50 requests/day = **250,000 requests/day**
- 250,000 × $0.019 = **$4,750/day**
- **$4,750/day - 30 days = $142,500/month**
- **$1.71 million/year for just the API costs**

**Self-Hosted Small Model:**
- Fixed infrastructure: ~$5-10k/month (GPU servers in NZ/AU)
- **Same 250k requests/day = $5-10k/month**
- **$60-120k/year**

**Savings: 17-28x cheaper at national scale**

---

### **4.3 The R&D Justification**

> "Azure OpenAI solves privacy but creates a NEW problem: **unsustainable cost at scale**. Our R&D explores: **Can we achieve 70-80% of GPT-4/5 quality at 20-50x lower cost?** If yes, NZ health sector saves $1.5+ million/year."

**This positions the R&D as:**
- ✓ **Cost optimization for national scale** (aligns with govt priorities)
- ✓ **Sovereign capability** (NZ controls the tech stack, no vendor lock-in)
- ✓ **Legitimate technical uncertainty** (small model quality under NZ constraints is unknown)

---

### **4.4 Additional Benefits of Self-Hosting**

Beyond cost:
- **Deeper NZ customization:** Full access to model weights (Azure only allows API-level fine-tuning)
- **No vendor lock-in:** Microsoft can change pricing, deprecate models, have outages
- **Sovereign control:** NZ owns the capability (no dependency on US tech vendors)

---

## **Section 5: Privacy & Compliance** (1-2 pages)

### **5.1 Data Residency Stance (Option B)**

**PHI at Rest:**
- ✓ **NZ only** (encrypted with NZ-held encryption keys in KMS/HSM)

**Inference (AI Processing):**
- ✓ **AU (Sydney)** - transient only (no persistent storage outside NZ)
- Encrypted requests over TLS to AU GPU servers
- Processing time: <5 seconds
- Response returned to NZ; no data retained in AU

**Key Management:**
- ✓ **NZ-held keys** (KMS/HSM in NZ)
- Key rotation every 90 days
- Immediate revocation capability if breach detected

---

### **5.2 Compliance Framework**

**Privacy Act 2020 (IPP 12 - Cross-Border Disclosure):**
- ✓ Contractual safeguards (Data Processing Agreements with AU provider)
- ✓ Technical safeguards (TLS in transit, AES-256 at rest, NZ-held keys)
- ✓ Organisational safeguards (staff training, access controls, quarterly reviews)
- ✓ Transparency (public transparency page with regions, sub-processors, update log)

**Health Information Privacy Code (HIPC 2020):**
- ✓ Special category health data protections
- ✓ Patient consent/notice for scribing where applicable
- ✓ Clinic-facing privacy notices

**HISO 10029 (Health Information Security Framework):**
- ✓ 12 control domains addressed (governance, access control, encryption, logging, incident response, etc.)
- ✓ Security policy, MFA, role-based access, quarterly access reviews

**Te Whatu Ora NAIAEAG Alignment:**
- ✓ **No PHI into unapproved LLMs:** Self-hosted model under clinic control
- ✓ **Transparency:** Public source register, model versions, regions, sub-processors
- ✓ **Human oversight:** Assist-only, clinician-in-the-loop, no auto-insert
- ✓ **Safety & accountability:** Monthly safety regressions, incident runbook (24hr breach notification)

---

### **5.3 What Makes Us Safe**

**No Training on Production PHI:**
- ✓ Never train on live patient data
- ✓ Development uses synthetic data (artificially generated clinical scenarios)
- ✓ De-identified data only where synthetic insufficient (with ethics approval)

**DPIA Completed Pre-Pilot:**
- ✓ Data Protection Impact Assessment completed in Q1 (Month 1-3)
- ✓ Signed by NexWave Director
- ✓ Clinic sign-off required before any pilot

**Monthly Safety Regressions:**
- ✓ Test prohibited-claim rate (must refuse diagnostic/treatment directives)
- ✓ Test refusal appropriateness (don't refuse valid requests)
- ✓ Test PHI leakage (no PHI in logs or unintended outputs)
- ✓ **Hard stop:** If any metric fails, halt releases until fixed

**Incident Runbook:**
- ✓ 24-hour breach notification to clinic
- ✓ OPC notification where required
- ✓ Key revocation capability (lockout AU inference in <1 hour)
- ✓ Rollback plan tested (revert to previous version)

---

## **Section 6: Financials & Feasibility** (1 page)

### **6.1 Budget Overview**

| Category | Amount (NZD excl. GST) |
|----------|------------------------|
| **R&D Internal Labour** (1,062 hours @ $96/hr) | $101,952 |
| **Capability Development** (30 hours @ $96/hr) | $2,880 |
| **Materials & Consumables** ($200/month × 12) | $2,400 |
| **Total Eligible Costs** | **$107,232** |
| | |
| **Grant (40%)** | **$42,893** |
| **Co-Funding (60%)** | **$64,339** |

**Capability Development Breakdown:**
- 3 privacy courses (OPC Privacy Act, OPC HIPC, Ko Awatea) - free but eligible
- 30 hours one-off setups:
  - CD-A: DPIA, IPP 12, HISO mapping, DPA templates (12h = $1,152)
  - CD-B: MLflow, DVC, safety dashboard, transparency SOP (10h = $960)
  - CD-C: Stage-gates, risk register, release checklist (8h = $768)

**CapDev Check:** $2,880 = 6.7% of grant ✓ (exceeds 5% minimum)

---

### **6.2 Cashflow Confidence**

**Co-Funding Source:**
- ✓ **Income from GP clinical work** (shareholder-director compensated via PAYE for R&D labour)
- ✓ **Consistent income stream** exceeds R&D costs throughout the project
- ✓ **Cash position remains positive throughout** 12-month project:
  - Opening cash: $5,000
  - Minimum cash position: $8,216 (Month 1)
  - Closing cash: $73,461 (Month 13)

**Quarterly Grant Receipts:**
- Q1 claim (Month 3) → Grant received Month 4: $9,027
- Q2 claim (Month 6) → Grant received Month 7: $10,224
- Q3 claim (Month 9) → Grant received Month 10: $12,221
- Q4 claim (Month 12) → Grant received Month 13: $12,221

---

### **6.3 Labour Plan**

**Consistent R&D Commitment:**
- ~20 hrs/week throughout 12 months

**Total Hours:**
- R&D: 1,062 hours across 5 Objectives
- CapDev: 30 hours (one-off setups in Months 1-4)
- Rate: $96/hr (shareholder-employee on PAYE, timesheets required)

---

## **Section 7: Timeline & Deliverables** (1-2 pages)

### **7.1 12-Month Roadmap**

**Q1 (Jan-Mar 2026): Foundation**
- **O1:** Baseline and dataset curation
  - Curate NZ public corpus (BPAC, NZGG, Pharmac)
  - Generate synthetic/de-identified datasets (inbox items, SOAP notes, billing scenarios)
  - Build evaluation harness (test suites for 4 use cases)
  - Select and quantize base model (7B-13B params)
  - **Deliverables:** Baseline metrics, datasets versioned in DVC
- **CD-A:** Regulatory & Compliance
  - Complete 3 privacy courses (OPC Privacy Act, OPC HIPC, Ko Awatea)
  - Draft DPIA (Option B: AU inference, NZ keys, IPP 12 safeguards)
  - Create IPP 12 checklist, HISO mapping, DPA templates
  - **Deliverables:** Certificates, DPIA v1.0 signed by Director
- **CD-C:** Project Management
  - Define stage-gates (O1-O5 entry/exit criteria)
  - Create risk register, change log, release checklist
  - **Deliverables:** Governance artefacts

---

**Q2 (Apr-Jun 2026): NZ Domain Adaptation**
- **O2:** NZ GP domain adaptation
  - Continual pretraining on NZ public clinical sources
  - Instruction tuning for 4 use cases (inbox, coding, referrals, care gaps)
  - **Deliverables:** Model v0.1
  - **Targets:** 
    - Inbox classification accuracy ≥70% (baseline)
    - Clinical coding accuracy ≥60% (baseline)
- **CD-B:** R&D Information Management
  - Set up MLflow (experiment tracking), DVC (dataset versioning)
  - Build safety dashboard (track metrics over time)
  - Draft transparency SOP and page v1
  - **Deliverables:** Tools configured, transparency page draft

---

**Q3 (Jul-Sep 2026): Safety & Integration**
- **O3:** Safety and assist-only enforcement
  - Implement policy engine (refusal scaffolds)
  - Build claim/PII classifiers (detect prohibited outputs)
  - Create audit logs (no PHI in logs)
  - Run monthly safety regressions
  - **Deliverables:** Safety pack template, monthly test results
  - **Targets:**
    - Prohibited-claim rate ≤0.5%
    - Refusal appropriateness ≥95%
    - Zero PHI leakage in red-team tests
- **O4:** Medtech sandbox and synthetic workloads
  - Connect to Medtech sandbox (least-privilege scopes)
  - Generate synthetic inbox, referral, patient data
  - Run latency/throughput tests
  - Publish transparency page v1 (sources, regions, sub-processors)
  - **Deliverables:** Sandbox integration, transparency page live
  - **Targets:**
    - Response P95 ≤5.0s
    - Stable throughput (no crashes under load)
    - No persistent PHI outside NZ confirmed

---

**Q4 (Oct-Dec 2026): Pilot-Readiness**
- **O5:** Pilot-readiness and evaluation
  - Build telemetry and monitoring (SIEM, safety dashboard)
  - Create incident playbooks (breach notification, rollback)
  - Develop clinician evaluation framework (usefulness surveys)
  - Complete pre-pilot checklist (DPIA signed by clinic, DPAs finalized, transparency live)
  - **Deliverables:** Pilot-ready system, evaluation framework
  - **Targets:**
    - Inbox classification accuracy ≥90%
    - Clinical coding accuracy ≥85%
    - Referral completeness check ≥80%
    - Care gap detection accuracy ≥85%
    - Clinician-rated usefulness ≥80%

---

### **7.2 Key Milestones**

| Date | Milestone | Deliverables |
|------|-----------|--------------|
| **27 Jan 2026** | Project start | O1, CD-A, CD-B, CD-C commence |
| **29 Feb 2026** | CD-C complete | Stage-gates, risk/change logs, release checklist |
| **31 Mar 2026** | Q1 ends; CD-A complete | O1 complete; 3 certificates; DPIA; IPP 12; HISO; DPAs |
| **30 Apr 2026** | Q1 claim due | Submit Q1 claim (~$9,027 grant) |
| **30 Apr 2026** | CD-B complete | MLflow/DVC; safety dashboard; transparency SOP |
| **Month 4** | Q1 grant receipt | $9,027 received |
| **30 May 2026** | O2 complete | Model v0.1; baseline accuracy established |
| **30 Jun 2026** | Q2 ends | Submit Q2 claim (~$10,224 grant) |
| **30 Jul 2026** | O3 complete | Safety pack; prohibited-claim ≤0.5%; refusal ≥95% |
| **Month 7** | Q2 grant receipt | $10,224 received |
| **30 Sep 2026** | Q3 ends; O4 complete | Transparency page v1; inbox P95 ≤5.0s |
| **Month 10** | Q3 grant receipt | $12,221 received |
| **31 Dec 2026** | Q4 ends | Submit Q4 claim (~$12,221 grant) |
| **26 Jan 2027** | Project end; O5 complete | Pilot-ready; all success criteria met; final report due within 3 months |
| **Month 13** | Q4 grant receipt | $12,221 received |

---

## **Section 8: Risks & Mitigations** (1 page)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **1. PHI Leakage (Cross-Border)** | Low | Critical | • No persistent PHI outside NZ; NZ-held keys; ephemeral AU caches only; SIEM monitoring for unusual data flows; monthly PHI leakage tests |
| **2. Unsafe Model Outputs** | Medium | Critical | • Assist-only policy engine; claim/PII classifiers; refusal scaffolds; clinician-in-the-loop (human review); monthly safety regressions (hard stop if prohibited-claim >0.5%) |
| **3. Small Model Quality Insufficient** | Medium | High | • Systematic experimentation (O1-O2); baseline GPT-4/5 comparison; iterative tuning; acceptance threshold: 70-80% of GPT-4/5 quality (not 100%); pivots possible if 7B too small (try 13B) |
| **4. Cashflow Shortfall** | Low | High | • Income from GP clinical work funds co-contribution; cash position positive throughout ($5k opening → $73k closing); quarterly grant receipts; contingency: reduce hours if needed |
| **5. Over-Reliance by Clinicians** | Medium | High | • Clear labeling ("AI-generated; use clinical judgment"); no auto-insert (manual review required); training materials for pilot clinics; periodic UI reminders |
| **6. Scope Creep / Misconfiguration** | Medium | Medium | • Least-privilege Medtech scopes (only access necessary fields); change control gates (Privacy Lead approval for new data uses); quarterly reviews |
| **7. Vendor/Sub-Processor Breach** | Low | Critical | • Due diligence on AU GPU provider; DPA with breach notification (24hr); NZ-held key revocation (immediate lockout); isolation and rollback plan tested |
| **8. Model Drift / Safety Degradation** | Medium | High | • Version pinning (no auto-updates); pre-release safety gates; monthly safety regressions track trends; rollback plan if metrics decline |

**Residual Risk:** Acceptable with controls in place; reviewed quarterly; escalate on material change.

---

## **Section 9: Why We'll Succeed** (1-2 pages)

### **9.1 Unique Founder Profile: Clinical + Technical + Commercial**

This project uniquely combines **clinical expertise**, **technical depth**, and **market access**:

---

#### **Clinical Expertise (GP Practitioner)**
- **Active GP:** I'm a practicing general practitioner - I understand the problem **firsthand**
- **User insight:** I experience documentation burden, inbox overload, and workflow constraints daily
- **Clinical safety:** I know what "assist-only" means in practice - what's helpful vs dangerous
- **Real-world validation:** I can test in my own practice before asking other GPs to pilot

**Why this matters:** Most AI health startups are built by technologists who guess at clinical needs. I **live** the problem every day.

---

#### **Technical Expertise (Full-Stack Developer + AI Specialist)**
- **AI specialist:** Deep expertise in LLMs, fine-tuning, safety guardrails, and evaluation
- **Full-stack developer:** Built ClinicPro end-to-end (backend, frontend, Medtech integration)
- **Proven builder:** ClinicPro is already live with a third-party LLM (operational product, not a prototype)
- **Hands-on R&D:** I will personally lead model development, safety testing, and integration

**Why this matters:** I'm not outsourcing the hard parts. I have the technical skills to execute the R&D myself, which de-risks the project significantly.

---

#### **Market Access (Medtech Partnership)**
- **Partnership with Medtech:** New Zealand's **largest practice management system** (~60% market share)
- **Real-world testing environment:** Medtech integration gives access to actual GP workflows, not simulated environments
- **Pilot-ready infrastructure:** Medtech sandbox allows synthetic testing first, then controlled pilots in real clinics
- **Scale potential:** If successful, Medtech relationship enables rapid adoption across 3,000+ NZ GPs

**Why this matters:** Most health AI projects struggle with integration and pilots. We have **direct access** to the platform used by most NZ GPs, dramatically shortening the path from R&D to deployment.

---

### **9.2 Commercial Validation: ClinicPro is Already Operational**

This isn't a concept - **ClinicPro is live**:

**Current offering:** AI scribe using third-party LLM (OpenAI/Anthropic API)

**Why R&D is needed:** Third-party LLMs have:
- ✓ Privacy concerns (PHI sent to US servers)
- ✓ Cost at scale (Azure OpenAI: $140k+/month for 5,000 GPs)
- ✓ Not NZ-tuned (miss Pharmac, ACC codes, HealthPathways, NZ lab formats)
- ✓ Limited use cases (scribing only; no inbox management, coding, referrals, care gaps)

**This R&D project:** Build a **NZ-sovereign, cost-effective, multi-use LLM** that solves all these issues.

**Why this matters:** We have **proven demand** for AI assistance in NZ general practice. This R&D makes it better, cheaper, safer, and expands capabilities.

---

### **9.3 Capability Development: Building Enduring Skills**

Beyond existing expertise, this project builds **formal compliance and R&D management capabilities**:

**Regulatory & Compliance (CD-A, 12 hours):**
- 3 NZ-recognised privacy courses (OPC Privacy Act 2020, OPC HIPC, Ko Awatea)
- DPIA (Option B: AU inference, NZ keys, IPP 12 safeguards)
- IPP 12 control checklist, HISO 10029 mapping
- DPA templates (Controller-Processor, Sub-processor)
- NAIAEAG alignment note, consent/notice text

**Outcome:** Procurement-ready compliance artefacts that clinics need to adopt safely.

**R&D Information Management (CD-B, 10 hours):**
- MLflow (experiment tracking, reproducibility)
- DVC (dataset versioning, data lineage)
- Safety dashboard (track metrics over time)
- Transparency SOP (source register, sub-processor register, update log)

**Outcome:** Systematic R&D processes ensure reproducibility, safety tracking, and regulatory transparency.

**Project Management (CD-C, 8 hours):**
- Stage-gates (O1-O5 entry/exit criteria, safety gates)
- Risk register (9 initial risks with mitigations and owners)
- Change log (version control for all documents)
- Release checklist (security, safety, compliance checks before every release)

**Outcome:** Structured governance prevents scope creep and ensures safety gates are enforced.

---

### **9.4 De-Risking Strategy: Staged, Safe, Measurable**

**1. Synthetic-First Development (Months 1-3)**
- All development uses **synthetic data** (no real patients)
- No production PHI for training
- Iterate fast without regulatory constraints

**2. Medtech Sandbox Testing (Months 4-9)**
- Test 4 use cases with **fake patient data** in Medtech sandbox
- Least-privilege scopes (only access fields we need)
- Latency/throughput benchmarks
- Catch integration issues before touching real data

**3. Monthly Safety Gates (Ongoing)**
- Safety regression pack every month
- **Hard stop:** If metrics fail (prohibited-claim >0.5%), halt releases until fixed
- Rollback plan tested (<1 hour revert time)

**4. Staged Pilot (Month 10+)**
- Pilot only after:
  - ✓ All stage-gates passed (O1-O4 complete)
  - ✓ Safety metrics met for 3 consecutive months
  - ✓ DPIA signed by clinic Privacy Officer
  - ✓ DPAs finalized with sub-processors
  - ✓ Transparency page live
- Assist-only controls enforced (no auto-insert)
- One clinic first (possibly my own practice) before wider roll-out

---

### **9.5 Clear Constraints: What We WON'T Do**

Disciplined scope prevents mission creep:

✓ **No diagnostic or treatment advice** (assist-only enforced with refusal scaffolds)  
✓ **No training on production PHI** (synthetic/de-identified only)  
✓ **No persistent PHI outside NZ** (ephemeral AU inference only)  
✓ **No third-party commercial LLM APIs** (self-hosted, NZ-controlled model)  
✓ **No pilot until safety gates passed** (metrics enforced, not optional)

---

### **9.6 Why This Team + This Approach = Success**

| Success Factor | How We Achieve It |
|----------------|-------------------|
| **Clinical relevance** | GP founder who lives the problem daily |
| **Technical execution** | Full-stack AI specialist with proven product (ClinicPro live) |
| **Market access** | Medtech partnership = real-world testing + 3,000+ GP scale potential |
| **Safety confidence** | Monthly regressions, hard stop gates, rollback plan |
| **Regulatory readiness** | DPIA, IPP 12, HISO, DPAs completed in Q1 |
| **Financial feasibility** | Sustainable revenue funds co-funding; cash always positive |
| **Scope discipline** | Assist-only, synthetic-first, staged pilot, clear boundaries |

**Bottom line:** We're not guessing. We have the **clinical insight**, **technical skills**, **market access**, and **structured processes** to deliver a safe, useful, cost-effective, NZ-sovereign AI assistant for general practice.

---

## **Section 10: Success Criteria** (1 page)

### **10.1 Utility Targets (Does it help clinicians?)**

| Metric | Target | How Measured |
|--------|--------|--------------|
| **Inbox triage time savings** | ≥30% reduction | Time study: before/after AI summaries |
| **Coding revenue uplift** | ≥5% increase | Compare billing pre/post AI suggestions |
| **Referral acceptance rate** | ≥90% | Track bounce-backs from specialists |
| **Care gap monitoring completion** | ≥80% | PHO QOF score improvement ≥10% |
| **Clinician usefulness rating** | ≥80% | Post-task surveys: "Was this useful?" (1-5 scale) |

---

### **10.2 Safety Targets (Is it safe for patients?)**

| Metric | Target | How Measured |
|--------|--------|--------------|
| **Prohibited-claim rate** | ≤0.5% | Monthly red-team tests: AI must refuse diagnostic/treatment directives (out of 1,000 tests, ≤5 failures) |
| **Refusal appropriateness** | ≥95% | Test suite: 1,000 scenarios (500 should refuse, 500 should accept); check correctness |
| **PHI leakage** | Zero | Red-team tests trying to extract PHI; check logs for accidental PHI |

**Hard stop:** If any safety metric fails, **halt all releases** until fixed.

---

### **10.3 Performance Targets (Is it fast and reliable?)**

| Metric | Target | How Measured |
|--------|--------|--------------|
| **Response time (P95)** | ≤5.0s | Time from request to response; 95th percentile must be ≤5 seconds |
| **Throughput stability** | No crashes | Load testing: 100 concurrent requests; no timeouts or errors |
| **Unit economics** | Stable | Cost per 1,000 requests tracked monthly; should remain consistent |

---

### **10.4 R&D Success Threshold**

**We DO NOT need to match GPT-4/5 100%.** Success = achieving **70-80% of GPT-4/5 quality at 20-50x lower cost**.

**Example:**
- If GPT-4/5 gets 95% coding accuracy, we need ≥70% accuracy (acceptable for assist-only use)
- If GPT-4/5 costs $0.019/request (Azure), we need ?$0.0005/request (self-hosted: 20-50x cheaper)

**This trade-off is the R&D question:** Is 70-80% quality sufficient for clinical utility? Unknown - requires pilot evaluation.

---

**END OF PROPOSAL**
