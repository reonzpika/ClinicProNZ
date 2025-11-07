# Commercialization & Market Strategy

Prepared: November 2025  
Owner: NexWave Solutions Ltd  
Project: ClinicPro – NZ-Sovereign Clinical LLM for GP Workflow

---

## 1) Pricing Model Overview

We will use a hybrid usage-based model, optimized for GP clinics with mixed staffing (many part-time), and aligned with AI infrastructure costs that scale with use. The model emphasizes predictable spend for clinics and alignment with value delivered across multiple workflows (inbox, coding, referrals, care gaps).

### Core Unit Definition
- 1 Credit = 1 AI Action  
  A single workflow task such as: triaging one inbox item, providing one coding suggestion pass, checking one referral for completeness against HealthPathways, or evaluating care gaps for one patient encounter.
- Each credit includes a reasonable complexity limit (tokens/compute time). Edge cases are auto-split to avoid unexpected billing spikes.

### Pricing Tiers & Plans (NZD)

| Plan Type | Pack Volume (Actions) | Monthly Price | Cost per Action | Notes |
|---|---:|---:|---:|---|
| \*\*Individual Packs\*\* |  |  |  | Auto-renew, 1-month rollover |
| Lite | 200 | $19 | $0.095 | For part-time/light users |
| Standard | 800 | $59 | $0.074 | Moderate use |
| Full-time | 2,000 | $119 | $0.059 | Heavy individual users |
| Overage | — | $0.08 / action | — | Applies after pack exhaustion |
| \*\*Clinic Pooled Packs\*\* |  |  |  | 2-month rollover, shared across GPs |
| Small | 5,000 | $249 | $0.049 | Small clinics |
| Medium | 15,000 | $599 | $0.040 | Mid-sized clinics |
| Large | 50,000 | $1,499 | $0.030 | Large practices |
| Overage | — | $0.04 / action | — | Overrun allowance at lower rate |
| Platform Fee | — | $0 (first 6 months), then $29/clinic/mo | — | Optional support/compliance fee |

Key properties:
- Clinics can buy pooled credits and share across GPs (minimizes waste for part-timers).
- Individuals (locums/part-time) can subscribe to personal packs when not covered by a clinic pool.

### Guardrails & Experience Controls
- Usage alerts: 70% / 90% / 100% pack consumption.
- Soft caps with admin approval for overages; optional monthly spend cap per GP to prevent bill shock.
- Transparent per-GP usage dashboards; clinic admins can set per-user limits.
- Fair-use policy and rate limits to prevent a single user draining the pool.
- Clear action mapping examples in-product (e.g., “1 inbox item triaged = 1 action”).

---

## 2) Unit Economics & ROI (Overview)

Operational costs scale with usage but are bounded by fixed infrastructure when self-hosted.

- Self-hosted model infrastructure: fixed monthly GPU capacity (NZ/AU), enabling 20–50x lower unit cost vs commercial APIs at national scale.
- Variable cost per 1,000 actions improves with volume (model/runtime optimizations, batching, quantization, caching).
- Gross margin improves significantly once clinic pooled packs reach steady utilization.

Clinic ROI narrative:
- Time savings: inbox triage + coding/referrals reduce admin burden; even modest savings (e.g., 20–30 minutes/week per GP) exceed Lite/Standard pack costs.
- Revenue uplift: more complete clinical coding reduces leakage (target +5% coding revenue uplift).
- Referral quality: fewer bounce-backs reduce rework time and delays.

Note: A detailed unit-economics table will be maintained in internal financial models and summarized in the application with conservative/base/aggressive scenarios.

---

### 2.1 Detailed Unit Economics (Base assumptions)

Assumptions reflect self-hosted small models with optimization (quantization, batching, caching) and NZ/AU GPUs.

| Metric | Assumption (Base) | Notes |
|---|---:|---|
| Variable COGS per 1,000 actions | $12–$25 | Depends on mix/complexity; improves with volume |
| Average variable COGS per action | $0.012–$0.025 | Directional; targeted throughputs achieved in sandbox |
| Fixed infra (shared, national) | $5k–$10k / month | GPU + ops; amortized across all clinics/GPs |
| Support/ops (early scale) | ~$6k / month | Customer support, monitoring, compliance overhead |

Gross margin by pack (illustrative):

| Pack | Price | Price/action | Est. COGS/action | Gross Margin |
|---|---:|---:|---:|---:|
| Individual Lite (200) | $19 | $0.095 | ~$0.020 | ~79% |
| Individual Std (800) | $59 | $0.074 | ~$0.018 | ~76% |
| Individual Full (2,000) | $119 | $0.059 | ~$0.016 | ~73% |
| Clinic Small (5,000) | $249 | $0.049 | ~$0.015 | ~69% |
| Clinic Medium (15,000) | $599 | $0.040 | ~$0.014 | ~65% |
| Clinic Large (50,000) | $1,499 | $0.030 | ~$0.012 | ~60% |

Notes:
- Margins exclude shared fixed infra; overall contribution improves as utilization rises.
- Overage pricing (clinic $0.04/action) maintains margins while avoiding service disruption.

---

### 2.2 Clinic ROI Examples

Conservative value-of-time assumption: $150/hour per GP.

Indicative time saved per action (assist-only workflows):
- Inbox triage: 1–2 minutes
- Coding suggestion: 2–3 minutes
- Referral check: 3–5 minutes
- Care gap evaluation: 2–3 minutes

Example A – Part-time GP on Lite (200 actions/month):
- Assume average 1.5 minutes saved/action ⇒ 300 minutes (5 hours)
- Value of time saved: 5 × $150 = $750
- Cost: $19 ⇒ ROI ≈ 39:1

Example B – Clinic on Small Pool (5,000 actions/month):
- Assume blended 1.5 minutes saved/action ⇒ 7,500 minutes (125 hours)
- Value: 125 × $150 = $18,750
- Cost: $249 ⇒ ROI ≈ 75:1

Sensitivity (very conservative):
- 0.5 minute saved/action at 5,000 actions ⇒ 2,500 minutes (41.7 hours)
- Value: 41.7 × $150 = ~$6,255 vs $249 cost ⇒ ROI ≈ 25:1

Revenue uplift (coding completeness):
- If the assistant recovers a modest 2–5% of underbilled items, typical practices see measurable monthly uplift; this benefit is additive to time savings.

---

## 3) Adoption Timeline (High-Level)

- Months 1–3: Pilot (your clinic + 2–3 additional clinics), 30–50 GPs, usage telemetry collection.
- Months 4–12: Early adopters via Medtech/PHO intros, 250–500 GPs, expand beyond scribing to 4 workflows.
- Year 2: Medtech channel scale to 1,000–2,000 GPs; strengthen PHO outcomes integration.
- Year 3: National coverage to 2,500–3,500 GPs; prepare AU export pilots.

---

## 4) Go-To-Market (GTM)

Primary channels:
- Medtech: listings, in-product placements, sandbox → pilot → production pathway.
- PHOs: QOF/quality outcome alignment (care-gap improvements) and co-funded pilots.
- Direct: founder-led sales to early adopters; conferences/webinars; clinical communities.

Offers & incentives:
- 60-day free pilot for clinics; month-to-month billing; enterprise annual prepay discounts.
- Simple upgrade recommendations based on observed usage (reduce “meter anxiety”).

---

### 4.1 Medtech Channel (Primary)

Objectives:
- Convert sandbox access into production pilots and scale via Medtech distribution.

Tactics:
- Listing and placements in Medtech ecosystem (store/marketplace, partner newsletters).
- Joint webinar/demo with Medtech PMs focused on inbox + referrals pain points.
- Native workflow integration: one-click from Medtech inbox to “AI Action”.
- Co-develop success story from sandbox synthetic workloads → publish case study.

Funnel & Targets:
- M1–M3: 3 pilots (your clinic + 2 others) → 30–50 GPs
- M4–M12: 10–20 production clinics via Medtech CTAs → 250–500 GPs
- Y2: 40–80 production clinics → 1,000–2,000 GPs

KPIs:
- Pilot → production conversion rate ≥ 50%
- CAC via Medtech channel ≤ $150/clinic in Y1 (time-weighted)
- Time-to-value: < 1 hour to first action post-install

Collateral:
- 3-minute demo video; 1-pager for practice managers; technical integration note.

Risks & Mitigations:
- Dependency on Medtech placements → maintain direct pipeline; publish case studies.
- Scope creep on integration → enforce least-privilege scopes, change control gates.

---

### 4.2 PHO Partnerships (Outcomes-Driven)

Objectives:
- Tie value to PHO quality outcomes (care gaps, recall completeness) and secure co-funded pilots.

Tactics:
- Pitch PHO-level pilots with pooled clinic credits; report on QOF metrics lift.
- Monthly outcomes dashboards: care gap closure rates, referral bounce-back reduction.
- Bundle “Care Gap Monitoring” with “Coding Assistant” to drive financial ROI.

Funnel & Targets:
- M4–M12: 2–3 PHO pilots covering 10–30 clinics total
- Y2: convert 1–2 pilots to annual agreements

KPIs:
- Care gap completion +10% within 6 months
- Referral bounce-backs −20% within 3 months
- Pilot renewal rate ≥ 70%

Collateral:
- PHO outcomes brief; ROI calculator; sample monthly dashboard.

Risks & Mitigations:
- Long PHO sales cycles → run in parallel with Medtech & direct; use 60-day pilots.

---

### 4.3 Direct to Clinics (Founder-Led)

Objectives:
- Win early adopters; refine messaging; de-risk reliance on any single channel.

Tactics:
- Outreach to existing ClinicPro users; invite into 60-day pilot with pooled credits.
- Webinars for practice managers on “Inbox Overload” and “Referral Bounce-Backs”.
- Conference demos (RNZCGP events), community groups, and targeted email sequences.

Funnel & Targets:
- M1–M6: 15–25 direct clinics (50–100 GPs)
- Y2: 30–50 direct clinics (150–300 GPs)

KPIs:
- Trial-to-paid ≥ 40%
- Time-to-first action < 24 hours
- Net revenue retention ≥ 110%

Collateral:
- Onboarding checklist; usage playbook; clinic admin guide; FAQ on credits & caps.

Risks & Mitigations:
- Founder bandwidth → templatize emails/demos; record evergreen webinar; prioritize highest-fit clinics.

## 5) Competitive Positioning

Comparison dimensions: cost per GP/action, NZ data sovereignty, NZ-specific tuning (Pharmac/ACC/HealthPathways), multi-workflow coverage, latency (P95 ≤ 5s), vendor lock-in.

Competitors considered: Azure OpenAI (API only), Nabla, Heidi AI Scribe, Nuance DAX, “Do Nothing”, ClinicPro.

Summary: ClinicPro uniquely combines NZ sovereignty, NZ-tuned multi-workflow capability, and cost efficiency at national scale, with a usage-based model aligned to real clinic utilization.

### Comparative Table

| Dimension | ClinicPro (This R&D) | Azure OpenAI (API) | Nabla | Heidi AI Scribe | Nuance DAX | Do Nothing |
|---|---|---|---|---|---|---|
| Cost model | Usage-based packs; pooled clinic credits; low unit cost at scale | Per-token API (high at scale) | Per-seat/subscription | Per-seat/subscription | Per-seat + services | Hidden costs (time, burnout, revenue leakage) |
| NZ data sovereignty | Self/partner-hosted in NZ/AU; NZ-held keys | AU region possible; US vendor control | Offshore (non-NZ) | Offshore (non-NZ) | Offshore (US) | N/A |
| NZ-specific tuning | Pharmac, ACC, HealthPathways, PHO indicators (planned) | General models; limited NZ tuning | General clinical | General clinical | General clinical | N/A |
| Multi-workflow (inbox, coding, referrals, care gaps) | Yes (designed for 4 workflows) | DIY integrations required | Limited beyond scribing | Scribing-focused | Scribing-focused | No |
| Medtech integration path | Sandbox access; native workflow focus | Custom build by clinic/vendor | Limited | Limited | Limited | N/A |
| Latency target | P95 ≤ 5s (designed) | Varies by load/region | Vendor-defined | Vendor-defined | Vendor-defined | N/A |
| Vendor lock-in | Low (self-hosted, model portability) | High (API dependency, pricing risk) | Medium/High | Medium/High | High | N/A |
| Privacy posture | Assist-only; no PHI in training; DPIA + IPP12/HISO aligned | Depends on usage & contracts | Vendor-defined | Vendor-defined | Vendor-defined | N/A |

---

## 6) Risks & Mitigations (Commercial)

- Unpredictable spend concerns → Monthly caps, alerts, clinic admin controls.
- Credit confusion → Single “AI Action” unit + in-product mapping examples.
- Revenue volatility (your side) → Pooled packs, overage pricing, volume discounts, annual contracts for larger clinics/PHOs.

---

## 7) Evidence & Next Steps

- Pilot the pricing tiers with representative clinics; refine thresholds and overage rates based on real usage.
- Integrate live usage feedback in-product; provide mobile-data-plan analogy in onboarding.
- Maintain conservative/base/aggressive revenue scenarios for the grant, tied to GTM milestones.

---

---

## 8) Revenue Projections (Base Case)

Assumptions (Base):
- Adoption follows Section 3 timeline (pilot → early adopters → national scale).
- Mix skews to clinic pooled packs; some individual packs for locums/part-timers.
- 60-day free clinic pilot; platform fee $0 for first 6 months, then $29/clinic/month.
- Blended ASP reflects pack volumes, modest overage, and platform fee after month 6.

| Year | Avg Active GPs | Blended Monthly Revenue | Annual Revenue (NZD) | Notes |
|---:|---:|---:|---:|---|
| 1 | ~300 | ~$14.7k | ~$176k | Pilot months included; fee starts after 6 months |
| 2 | ~1,000 | ~$49k | ~$588k | Medtech channel scale; growing clinic pools |
| 3 | ~2,500 | ~$122k | ~$1.47m | National coverage ramp; PHO/enterprise deals |

Notes:
- Figures are directional for grant planning; actuals will vary with usage mix and clinic size.
- Internal model tracks conservative/base/aggressive scenarios and sensitivity (usage/price/fee uptake).

---

Document Version: 1.1  
Last Updated: 2025-11-06


