# New to R&D Grant Proposal - ClinicPro
## NZ-Sovereign Clinical AI for General Practice

**Prepared for:** [Mentor Name]  
**Date:** November 2025  
**Applicant:** NexWave Solutions Ltd  
**Project Duration:** 27 Jan 2026 - 26 Jan 2027 (12 months)

---

## **Section 1: Executive Summary** (1 page)

### **The Opportunity**

New Zealand has 5,000 GPs drowning in administrative work—and I'm one of them.

As a practicing GP, I see hundreds of inbox items daily: lab results, hospital letters, referrals. These take hours to process, pulling me away from patients. It's driving workforce burnout (70% report moderate-to-high burnout) and early retirement (35% leaving within 5 years).

**Here's the gap:** Current AI tools focus on documentation (AI scribes) but don't address the biggest time sink—inbox management and admin workflows. And there's no dedicated LLM trained for NZ healthcare: our local lab formats, Pharmac formulary, ACC codes, health system structures, and local guidelines.

**I'm building the solution:** A small, NZ-tuned LLM that handles 2 critical workflows—inbox management and care gap monitoring—for $5-10k/month, self-hosted in New Zealand (vs $140k/month for commercial APIs at scale).

**Why I can deliver:**
- **GP clinician** experiencing the problem daily in practice
- **Full-stack developer** with AI/ML expertise
- **Proven track record**: Built ClinicPro (operational AI scribe service used by NZ GPs)
- **Medtech partnership**: NZ's largest PMS (~60% market share) = real-world testing environment + 3,000+ GP adoption pathway

This R&D will prove a small, self-hosted model can match GPT-4 quality for these specific NZ healthcare tasks at 20-50x lower cost—a technical breakthrough no one has achieved.

---

### **What We're Building**

**Two AI assistants in one model:**

1. **Inbox Management** (Reactive) - Triage, classify, and summarize hundreds of daily items (hospital letters, lab results, referrals, discharge summaries)
   - Urgent vs routine classification
   - Key findings extraction
   - Action items identification
   - Smart routing to appropriate GP
   
2. **Care Gap Monitoring** (Proactive) - Identify and alert overdue chronic disease monitoring per NZ clinical guidelines
   - Scan patient records for overdue monitoring (HbA1c, BP checks, lipids, medication reviews)
   - Surface gaps before/during consultations
   - PHO quality indicator compliance

**Key innovation:** ONE small model (7B-13B parameters) handling BOTH reactive admin automation AND proactive clinical decision support.

---

### **Why This is Hard (The R&D Challenge)**

**The problem:** No AI tool currently exists that can accurately manage NZ GP inboxes.

**Current landscape:**
- ❌ **No tool for NZ GP inbox management** - Existing AI focuses on documentation (scribes), not inbox triage/classification
- ❌ **Generic LLMs can't handle NZ healthcare** - GPT-4 lacks knowledge of Pharmac formulary, ACC codes, local lab formats, NZ health system structures
- ❌ **No dedicated LLM for NZ healthcare** - Training data exists (Pharmac, BPAC, NZ guidelines) but no one has built the model
- ❌ **No proven approach** for multi-task clinical AI under NZ privacy constraints (self-hosted, no offshore PHI)

**This isn't just about cost** (though self-hosting saves 20-50x vs commercial APIs). **It's about building something that doesn't exist** - an AI that accurately understands NZ clinical workflows.

**Technical uncertainty:** Can we build a small, self-hosted model that delivers GPT-4-level accuracy for these specific NZ healthcare tasks?

We need to systematically test:
- **Continual pretraining** on NZ clinical sources (Pharmac, BPAC, local guidelines, lab report formats)
- **Dual-task instruction tuning** - ONE model for 2 distinct workflows (reactive inbox + proactive care gaps), not 2 separate systems
- **NZ-specific evaluation** - Does it correctly interpret local lab results? Accurately triage inbox items? Identify care gaps per NZ guidelines?
- **Safety scaffolds** - Assist-only policy engine, refusal of diagnostic/treatment advice
- **Real-world latency** - P95 <5.0s for inbox workflows (hundreds of requests/day per clinic)

**This is genuine R&D.** No published solution exists for NZ healthcare inbox management. We're proving it can be done accurately, safely, and cost-effectively.

---

### **12-Month Plan & Team**

**R&D Team:**
- **Founder (you):** 1,329 hours @ 25 hrs/week
  - Clinical domain expertise + technical leadership
  - NZ healthcare workflows + AI/ML development
  
- **Local developer:** 390 hours starting Month 4 (10 hrs/week)
  - Frontend development (GP mobile interface)
  - FHIR integration testing (Medtech sandbox)
  - Test automation and synthetic data generation

**5 R&D Objectives:**
- **O1:** Baseline & dataset curation (synthetic NZ GP inbox data, care gap scenarios)
- **O2:** NZ domain adaptation (train on Pharmac, BPAC, local labs, NZ clinical guidelines)
- **O3:** Safety enforcement (assist-only policy engine, refusal scaffolds)
- **O4:** Medtech sandbox integration (synthetic inbox workloads, patient record analysis, FHIR testing)
- **O5:** Pilot-readiness & evaluation (telemetry, incident procedures, GP evaluation framework)

**Capability Development:**
- **IP protection** ($6k): Freedom-to-Operate analysis, provisional patent filing, IP strategy
- **Conference attendance** ($3.2k): HealthTech Week Auckland + HIC Melbourne 2026
- **Hardware** ($2.6k Year 1): GPU workstation (local testing), mobile devices (GP workflow validation)

---

### **Grant Ask**

|| Item | Amount (NZD excl. GST) |
||------|------------------------|
|| **Total Eligible Costs** | **$175,065** |
|| **Grant (40%)** | **$70,026** |
|| **Co-Funding (60%)** | **$105,039** |

**Co-funding source:** GP clinical work income ($11k/month)  
**Cashflow:** Positive throughout project (minimum $1,879 Month 6)  
**Timeline:** 12 months (27 Jan 2026 - 26 Jan 2027)

---

### **Why This Will Succeed**

✅ **Unique founder profile** - GP + developer + AI expertise (rare combination)  
✅ **Proven delivery capability** - ClinicPro operational (validates I can ship products)  
✅ **Market access** - Medtech partnership = real-world testing + 3,000+ GP adoption pathway  
✅ **Deep problem understanding** - I experience inbox overload daily in practice  
✅ **NZ-first approach** - Training on Pharmac, ACC, local lab formats, health system from Day 1  
✅ **Clear commercialization path** - Medtech rollout post-R&D; exportable to AU/Pacific markets

**Impact:** Reduces GP burnout (inbox automation saves 1-2 hours/day) while improving patient outcomes (proactive care gap monitoring). Addresses both workforce sustainability and care quality - the dual crises facing NZ primary care.

---

### **Key Differentiators**

✓ **First dedicated LLM for NZ healthcare** (trained on local Pharmac, BPAC, lab formats, NZ clinical guidelines)  
✓ **Beyond scribing** (tackles inbox automation AND proactive care monitoring, not just documentation)  
✓ **Dual capability** (reactive admin relief + proactive clinical decision support in one model)  
✓ **NZ data sovereignty** (self-hosted in NZ/AU, NZ-held keys, no offshore PHI)  
✓ **Cost-effective at scale** ($5-10k/month vs $140k/month for commercial APIs)  
✓ **Medtech integration** (NZ's largest PMS = rapid adoption across existing customer base)  
✓ **Privacy-first R&D** (no training on production PHI; synthetic/de-identified data only)

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
- No tools exist for inbox triage and care gap monitoring - the two highest-impact workflows for GP workload and patient outcomes

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

**Two Critical Unmet Needs in NZ General Practice:**

1. **Inbox Management (Reactive):** No AI solution for NZ GP inboxes - region-specific lab formats, DHB letter structures, hundreds of items daily consuming 1-2 hours per GP

2. **Care Gap Monitoring (Proactive):** No AI tracks NZ-guideline chronic disease monitoring gaps - HbA1c checks, BP monitoring, medication reviews, PHO quality indicators

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

### **3.2 Dual-Function Design for Maximum Clinical Impact**

Unlike existing solutions limited to note-taking, our model is purpose-built to handle two distinct, high-impact workflows:

**1. Inbox Management (Reactive Admin Relief)**
- **Triage** hundreds of daily items: urgent vs routine
- **Classify** by type: lab results, hospital letters, referrals, discharge summaries
- **Extract** key findings and action items
- **Route** to appropriate GP for action
- **Impact:** Reduce inbox processing time by 30-50% (saves 1-2 hours/day per GP)

**2. Care Gap Monitoring (Proactive Clinical Support)**
- **Scan** patient records for overdue chronic disease monitoring
- **Identify** gaps: HbA1c checks, BP monitoring, lipids, medication reviews
- **Alert** GPs before/during consultations
- **Support** PHO quality indicator compliance
- **Impact:** Improve chronic disease outcomes, increase PHO funding capture, reduce GP anxiety about "missing things"

**Why these two workflows:**
- **Complementary capabilities:** Reactive (handle what comes in) + Proactive (surface what's missing)
- **Maximum impact:** Address burnout (admin overload) AND patient outcomes (quality monitoring)
- **Achievable depth:** Get both to 90%+ accuracy in 12 months vs 70% on multiple features

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

#### **Use Case 2: Care Gap Monitoring**

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
- **Domain adaptation:** Continual pretraining on NZ public clinical sources (BPAC, NZGG, Pharmac formulary, NZMA journals, local clinical guidelines)
- **NZ health system knowledge:** Train on NZ-specific entities (regional lab formats, DHB letter structures, NZ chronic disease guidelines, PHO quality indicators)
- **Task-specific tuning:** Instruction tuning for 2 distinct use cases using synthetic/de-identified NZ data
  - Inbox management: Classification, summarization, triage
  - Care gap monitoring: Guideline adherence, temporal logic, multi-condition tracking
- **Dual-task architecture:** ONE model handles both reactive (inbox) and proactive (care gaps) workflows (shared NZ domain knowledge, cost-efficient)

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
3. **Dual-task challenge**: Can ONE model handle 2 distinct workflows (reactive inbox classification + proactive care gap monitoring with temporal logic) or do we need 2 specialised models?
4. **Safety vs usefulness trade-off**: How aggressive can refusal scaffolds be without making the model useless?
5. **NZ-specific accuracy**: Can model handle 20+ DHBs' letter formats, regional lab variations, and local guideline differences?

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
| **Founder R&D Labour** (1,329 hours @ $96/hr) | $127,584 |
| **Developer R&D Labour** (390 hours @ $72/hr, starts Month 4) | $28,080 |
| **Capability Development** (54 hours @ $96/hr) | $5,184 |
| **Materials & Consumables** ($200/month × 12) | $2,400 |
| **Professional Services (IP)** | $6,000 |
| **Conference Travel** (HIC + HealthTech Week) | $3,200 |
| **Hardware & Depreciation** (Year 1) | $2,617 |
| **Total Eligible Costs** | **$175,065** |
| | |
| **Grant (40%)** | **$70,026** |
| **Co-Funding (60%)** | **$105,039** |

**Capability Development Breakdown:**
- CD-A: Privacy & compliance (12 hours + 3 free courses) = $1,152
- CD-B: R&D information management (10 hours) = $960
- CD-C: Stage-gates & risk management (8 hours) = $768
- CD-D: Conference attendance & knowledge acquisition (24 hours) = $2,304

**CapDev Check:** $5,184 = 7.4% of grant ✓ (exceeds 5% minimum)

---

### **6.2 Cashflow Confidence**

**Co-Funding Source:**
- ✓ **Income from GP clinical work** (shareholder-director compensated via PAYE for R&D labour)
- ✓ **Consistent income stream** (~$11k/month) exceeds R&D costs throughout the project
- ✓ **Cash position remains positive throughout** 12-month project:
  - Opening cash: $5,000
  - Minimum cash position: $1,879 (Month 6)
  - Closing cash: $32,213 (Month 13)

**Quarterly Grant Receipts:**
- Q1 claim (Month 3) → Grant received Month 4: $16,973
- Q2 claim (Month 6) → Grant received Month 7: $16,858
- Q3 claim (Month 9) → Grant received Month 10: $18,298
- Q4 claim (Month 12) → Grant received Month 13: $17,898

**Cashflow Strategy:**
- Hardware purchases deferred to Month 4 (after first grant receipt)
- Developer starts Month 4 (after first grant receipt)
- IP work spread across project to manage monthly cashflow
- Result: Tight but positive cashflow throughout

---

### **6.3 Labour Plan**

**Founder R&D Commitment:**
- ~25 hrs/week throughout 12 months (1,329 hours total)
- Rate: $96/hr (shareholder-employee on PAYE, timesheets required)
- Focus: Model development, safety testing, compliance, integration

**Developer R&D Commitment:**
- ~10 hrs/week starting Month 4 (390 hours over 9 months)
- Rate: $72/hr (local contractor, invoiced)
- Focus: Medtech sandbox integration, testing infrastructure, frontend

**Capability Development:**
- 54 hours total (privacy, R&D management, conference attendance)
- Spread across Months 1-7

---

## **Section 7: Timeline & Deliverables** (1-2 pages)

### **7.1 12-Month Roadmap**

**Q1 (Jan-Mar 2026): Foundation**
- **O1:** Baseline and dataset curation
  - Curate NZ public corpus (BPAC, NZGG, Pharmac, local guidelines)
  - Generate synthetic/de-identified datasets (inbox items: labs, letters, referrals; patient records for care gap scenarios)
  - Build evaluation harness (test suites for inbox management and care gap monitoring)
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
  - Instruction tuning for 2 use cases (inbox management, care gap monitoring)
  - **Deliverables:** Model v0.1
  - **Targets:**
    - Inbox classification accuracy ≥70% (baseline)
    - Care gap detection accuracy ≥70% (baseline)
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
  - Connect to Medtech sandbox (least-privilege FHIR scopes)
  - Generate synthetic inbox data (labs, letters, discharge summaries)
  - Generate synthetic patient records (for care gap testing)
  - Run latency/throughput tests (P95 <5.0s under realistic load)
  - Publish transparency page v1 (data sources, model info, update log)
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
    - Care gap detection accuracy ≥85%
    - Clinician-rated usefulness ≥80% for both use cases

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
| **3. Small Model Quality Insufficient** | Medium | High | • Systematic experimentation (O1-O2); baseline GPT-4/5 comparison; iterative tuning; acceptance threshold: match GPT-4 quality for specific NZ tasks (not all tasks); pivots possible if 7B too small (try 13B) |
| **4. Cashflow Shortfall** | Low | High | • Income from GP clinical work funds co-contribution; cash position positive throughout ($10k opening → $32k closing); quarterly grant receipts; hardware/developer deferred to Month 4; contingency: reduce developer hours if needed |
| **5. Over-Reliance by Clinicians** | Medium | High | • Clear labeling ("AI-generated; use clinical judgment"); no auto-insert (manual review required); training materials for pilot clinics; periodic UI reminders |
| **6. Scope Creep / Misconfiguration** | Medium | Medium | • Focused on 2 use cases only; least-privilege Medtech scopes (only access necessary fields); change control gates (Privacy Lead approval for new data uses); quarterly reviews |
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
- **User insight:** I experience inbox overload (hundreds of items daily) and care gap monitoring challenges
- **Clinical safety:** I know what "assist-only" means in practice - what's helpful vs dangerous
- **Real-world validation:** I can test in my own practice before asking other GPs to pilot

**Why this matters:** Most AI health startups are built by technologists who guess at clinical needs. I **live** the problem every day - I know exactly what "good enough" looks like for clinical utility.

---

#### **Technical Expertise (Full-Stack Developer + AI Specialist)**
- **AI specialist:** Deep expertise in LLMs, fine-tuning, safety guardrails, and evaluation
- **Full-stack developer:** Built ClinicPro end-to-end (backend, frontend, Medtech integration)
- **Proven builder:** ClinicPro is already live with a third-party LLM (operational product, not a prototype)
- **Hands-on R&D:** I will personally lead model development, safety testing, and integration
- **Developer support:** Local contractor (10 hrs/week from Month 4) for integration work

**Why this matters:** I'm not outsourcing the hard parts. I have the technical skills to execute the R&D myself, with targeted contractor support for integration, which de-risks the project significantly.

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
- ✓ Not NZ-tuned (miss Pharmac, ACC codes, local lab formats, NZ clinical guidelines)
- ✓ Limited use cases (scribing only; no inbox management or care gap monitoring)

**This R&D project:** Build a **NZ-sovereign, cost-effective, dual-task LLM** that solves all these issues - handling inbox management (reactive) and care gap monitoring (proactive) in one model.

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
- Generate realistic NZ inbox items (lab results, hospital letters, discharge summaries)
- Create synthetic patient records for care gap scenarios
- No production PHI for training
- Iterate fast without regulatory constraints

**2. Medtech Sandbox Testing (Months 4-9)**
- Test 2 use cases with **fake patient data** in Medtech sandbox
  - Inbox management: Synthetic inbox items flowing through FHIR API
  - Care gap monitoring: Synthetic patient records with known gaps
- Least-privilege scopes (only access fields we need: inbox, observations, conditions)
- Latency/throughput benchmarks (P95 <5.0s under realistic load)
- Catch integration issues before touching real data

**3. Monthly Safety Gates (Ongoing)**
- Track prohibited-claim rate, refusal appropriateness, PHI leakage
- **Hard stop if safety metrics fail:** No progression until fixed
- Independent safety regressions every month
- Red-team testing (deliberately try to make model misbehave)

**4. Staged Pilot (Month 10+, Only If Ready)**
- Only after all gates passed:
  - ✓ Safety metrics met (prohibited-claim <0.5%, refusal >95%)
  - ✓ Accuracy targets met (inbox ≥90%, care gaps ≥85%)
  - ✓ DPIA signed by participating clinic
  - ✓ Transparency page live
- Start with **10-50 consenting GPs** (explicit informed consent)
- Monitor closely, iterate based on feedback
- Scale only after validation

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
| **Inbox triage time savings** | ≥30% reduction (saves 1-2 hrs/day per GP) | Time study: before/after AI summaries |
| **Care gap monitoring completion** | ≥80% | PHO QOF score improvement ≥10% |
| **PHO quality indicator improvement** | ≥10% | Compare PHO scores pre/post implementation |
| **Clinician usefulness rating** | ≥80% for both use cases | Post-task surveys: "Was this useful?" (1-5 scale) |

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

**We aim to match GPT-4/5 quality for these specific NZ healthcare tasks** while achieving 20-50x cost savings through self-hosting.

**Success criteria:**
- Inbox management: Match GPT-4 classification accuracy (≥90%) for NZ-specific lab results, DHB letters, local formats
- Care gap monitoring: Achieve ≥85% accuracy on NZ guideline adherence (BPAC, NZGG, PHO indicators)
- Cost: $0.0005/request (self-hosted) vs $0.019/request (Azure OpenAI) = 38x cheaper

**This is the R&D question:** Can a small (7B-13B param), self-hosted model match GPT-4 quality for NZ-specific clinical tasks? Unknown - requires systematic experimentation and pilot evaluation.

**If we achieve 85-90% quality at 20-50x lower cost,** that's sufficient for assist-only clinical use and represents a genuine breakthrough.

---

**END OF PROPOSAL**
