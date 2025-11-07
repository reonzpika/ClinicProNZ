# Forge Application Narrative and Objectives

## Application Title
**NZ-Sovereign Clinical LLM (assist-only) for GP workflow: inbox management, clinical coding, referral quality, and care gap monitoring**

## Proposed Dates
- **Start:** 27 Jan 2026
- **End:** 26 Jan 2027

## ANZSIC Detail
- **Primary:** J5420 Software Publishing
- **Alternative:** M7000 Computer System Design and Related Services

---

## Background and Compliance (?250 words)

NexWave Solutions Ltd develops privacy-preserving AI tools for NZ general practice. We will build a NZ-sovereign clinical LLM to improve work efficiency in four areas:

- **Inbox management:** classify, summarise and route items to reduce triage time
- **Clinical coding assistant:** suggest NZ billing codes (ACC, PHO, Care Plus)
- **Referral quality checker:** flag missing HealthPathways criteria before sending
- **Chronic care gap identifier:** alert overdue NZ-guideline monitoring

The system is strictly assist-only. It never provides diagnostic or treatment directives. Development uses synthetic and de-identified data only; no production PHI is used for model training.

**Hosting and privacy:** inference may occur in Australia with no persistent PHI outside New Zealand. All PHI at rest remains in NZ with NZ-held keys. Cross-border processing is governed by Privacy Act 2020 IPP 12 safeguards, HISO 10029 security controls, and a DPIA completed pre-pilot. We align with Te Whatu Ora's NAIAEAG precautionary guidance (no PHI into unapproved LLMs; transparency; human oversight).

Initial integration is Medtech-first using synthetic workloads. Any pilot will require explicit clinic consent, assist-only controls, and clear transparency notices.

---

## Eligibility Confirmations

- NZ-incorporated company; solvent; intends to conduct ongoing R&D.
- **New to R&D:** ? $150k total R&D in last three years; no R&D grants/loans > $5k in last three years.
- Not grouped with an R&D performer (> $150k in last three years).
- Able to fund 60% co-funding from GP clinical work income; evidence provided.

---

## Describe Planned R&D Activities (?250 words)

Build a small NZ-tuned LLM (7B-13B parameters) with task adapters for:

- **Inbox management:** safe classification/summarisation/routing of labs, letters, referrals
- **Clinical coding:** suggest ACC codes, PHO subsidies, Care Plus eligibility from consultation notes
- **Referral quality:** check against 10 regional Community HealthPathways criteria
- **Care gap monitoring:** track NZ-guideline chronic disease monitoring (NZGG, PHO indicators)

**Domain adaptation:** continual pretraining and instruction tuning on NZ public clinical sources (as permitted) and synthetic/de-identified corpora. No training on production PHI.

**Safety:** assist-only policy engine, claim/PII classifiers, refusal scaffolds, audit logs; reproducible safety regressions.

**Medtech-first sandbox:** synthetic inbox workloads, latency/throughput tests, least-privilege scopes; no persistent PHI outside NZ; PHI at rest in NZ.

**Transparency:** public source register, update log, model/data cards, regions/sub-processors.

**Evaluation:** clinician usefulness, edit-distance reduction, inbox handling efficiency, refusal appropriateness, prohibited-claim rate, latency and cost predictability.

---

## Uncertainty ? What is the Specific Uncertainty? (?250 words)

It is uncertain whether a small/medium, locally controlled LLM can:

- Achieve GP-grade usefulness while consistently refusing diagnostic/treatment directives
- Maintain low latency and predictable cost on NZ/AU infrastructure
- Handle heterogeneous inbox content safely (letters, labs, referrals) without hallucinations or omissions

The right balance of NZ domain adaptation, safety tuning, guardrails, and quantisation to meet these targets cannot be known in advance. Public recipes do not specify settings that guarantee success under our privacy and compute constraints.

---

## R&D Challenge ? Why is This Difficult for a Professional? (?250 words)

A competent professional cannot deduce a working configuration that meets utility, safety (assist-only), and latency targets on small/medium models within NZ privacy constraints. Interactions between continual pretraining, instruction tuning, guardrails, quantisation, and streaming create emergent behaviour. Inbox content is especially noisy and varied. Stable refusal behaviour with acceptable usefulness requires systematic experiment design, evaluation harnesses, and safety regressions, not just prompting.

---

## Knowledge Availability ? What Exists and Why It's Insufficient? (?250 words)

AI scribes exist overseas, but are not tuned for NZ language, medication names, Pharmac rules, or local workflows; implementations are proprietary and do not disclose the settings needed to meet our safety/latency/privacy targets. There is no reliable, NZ-specific inbox management solution for GPs. Academic methods (RAG, LoRA/QLoRA, guardrails) lack NZ-specific guidance and do not provide guarantees for assist-only performance on small/medium models hosted under IPP 12 controls. Therefore, knowledge sufficient to resolve our uncertainties does not exist in a directly applicable form.

---

## Newness ? What is New? (?250 words)

A NZ-tuned clinical LLM with:

- Task adapters for scribing, inbox management (unmet need in NZ), and history summaries
- Enforceable assist-only behaviour and refusal scaffolds, evaluated with monthly safety regressions
- Transparent NZ data lineage, hosting regions, and update logs

Inbox management is a new NZ-specific application; a robust, sector-ready solution does not exist today. Our approach provides a sovereign, auditable capability under NZ privacy and security controls.

---

## Why is it Better? (?250 words)

**Clinician value:** faster notes with fewer edits; safer, clearer inbox triage; concise context summaries ? all assist-only and under clinician control.

**Safety and trust:** measurable refusals, low prohibited-claim rates, and reproducible safety regressions. No training on production PHI.

**Sovereignty and performance:** NZ storage with NZ-held keys; AU inference without persistent PHI outside NZ; predictable latency and unit economics on local infrastructure.

**Procurement readiness:** DPIA, IPP 12 controls, HISO mapping, transparency artefacts, and audit trails.

---

## Overseas Labour Resources

**None.** All R&D labour is performed in NZ. AU is used only for transient inference with no persistent PHI outside NZ.

---

## Hosting and Data Residency Statement

Inference may occur in Australia with no persistent PHI outside New Zealand. All PHI at rest remains in NZ with NZ-held keys. Cross-border disclosure complies with IPP 12 via contractual and technical safeguards. No patient data is used for model training; only synthetic/de-identified data is used for development and evaluation. A DPIA will be completed before any pilot.

---

## Objectives, Dates and Deliverables

### O1: Baseline and Dataset Curation (27 Jan ? 31 Mar 2026)

**Deliverables:**
- Curated NZ public corpus
- Synthetic/de-identified datasets
- Eval harness
- Baseline model selection and quantised deployment

**Targets:**
- Baseline latency P95
- Baseline scribe edit distance
- Inbox summary quality baseline

---

### O2: NZ GP Domain Adaptation (10 Feb ? 30 May 2026)

**Deliverables:**
- Continual pretraining and instruction tuning for 4 use cases (inbox, coding, referrals, care gaps)
- Model v0.1

**Targets:**
- Inbox classification accuracy ? 70% (baseline)
- Clinical coding accuracy ? 60% (baseline)

---

### O3: Safety and Assist-Only Enforcement (01 Mar ? 30 Jul 2026)

**Deliverables:**
- Policy engine
- Claim/PII classifiers
- Refusal scaffolds
- Audit logs
- Monthly safety regression pack

**Targets:**
- Prohibited-claim rate ? 0.5%
- Refusal appropriateness ? 95%
- Zero PHI leakage in red-team tests

---

### O4: Medtech Sandbox and Synthetic Inbox Workloads (01 Mar ? 30 Sep 2026)

**Deliverables:**
- Sandbox connection
- Synthetic inbox generators
- Least-privilege scopes
- Latency/throughput tests
- Transparency page v1

**Targets:**
- Inbox response P95 ? 5.0 s
- Stable throughput
- No persistent PHI outside NZ

---

### CD-A: Capability Development ? Regulatory & Compliance (27 Jan ? 31 Mar 2026)

**Deliverables:**
- Certificates (OPC Privacy Act 2020; OPC Health 101; Ko Awatea Privacy)
- DPIA (Option B)
- IPP 12 checklist
- HISO mapping
- DPA templates
- NAIAEAG alignment note

---

### CD-B: Capability Development ? R&D Information Management (27 Jan ? 30 Apr 2026)

**Deliverables:**
- MLflow + DVC configured
- Safety dashboard
- Transparency SOP and page v1

---

## Success Metrics (for Internal Tracking)

### Utility
- ? 30% reduction in inbox triage time by Month 10
- Clinician-rated usefulness ? 80% for all 4 use cases
- ? 5% appropriate billing revenue uplift (coding assistant)
- Referral acceptance rate ? 90% (reduced bounce-backs)

### Safety
- Prohibited-claim rate ? 0.5%
- Refusal appropriateness ? 95%
- Zero PHI leakage in tests

### Performance
- Response time P95 ? 5.0 s (all use cases)
- Stable throughput under load
- Cost-effective at scale (20-50x cheaper than Azure OpenAI)
