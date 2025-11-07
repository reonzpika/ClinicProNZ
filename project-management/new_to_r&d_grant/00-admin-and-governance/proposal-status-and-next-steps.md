# Proposal Status & Next Steps
## R&D Grant Submission - ClinicPro NZ GP Clinical LLM

**Last Updated:** 2025-11-01  
**Status:** Mentor Review Ready; Gaps Identified for Final Submission

---

## ?? **Current Status: 6.9/10**

**Strong on:** Technical R&D justification, risk analysis, clear project planning  
**Weak on:** Commercialization strategy, market validation, demand evidence

---

## ? **STRENGTHS (Keep These)**

### **1. Project Planning (7/10)**
? **What's strong:**
- Detailed 12-month roadmap (Section 7) with Q1-Q4 breakdown
- 5 R&D Objectives (O1-O5) with specific dates, deliverables, and targets
- 3 Capability Development streams (CD-A/B/C)
- Clear milestones table with dates
- Detailed cost breakdown ($107,232) by objective, labour rates ($96/hr), M&C ($200/month)

?? **What's missing:**
- **No long-term vision beyond Year 1** (What happens in Year 2-5?)
- No discussion of scaling plan (100 GPs ? 3,000 GPs ? national/export)
- No IPO/acquisition/exit strategy

**Action needed:** Add "Long-Term Vision" subsection to Section 9

---

### **2. Risk Analysis (9/10)**
? **What's strong:**
- 8 risks identified with likelihood/impact/mitigation (Section 8)
- Covers technical (model quality, PHI leakage), financial (cashflow), operational (scope creep, vendor breach, model drift)
- Staged de-risking strategy (Section 9.4): synthetic-first ? sandbox ? safety gates ? pilot
- Monthly safety regressions with hard-stop criteria (prohibited-claim >0.5% = halt releases)

?? **What's missing:**
- Nothing major?this section is strong

---

### **3. Innovation Impact (7/10)**
? **What's strong:**
- Clear technical uncertainty (Section 3.3): "Can a small model (7B-13B params) achieve 70-80% of GPT-4/5 quality under NZ cost/privacy/latency constraints?"
- 4 strong, NZ-specific use cases (inbox, coding, referrals, care gaps)
- Quantified benefits: 30% time savings, 5% revenue uplift, 20-50x cheaper than Azure
- Competitive advantage: NZ-sovereign, multi-task (ONE model), cost-effective at scale

?? **What's missing:**
- **No long-term impact discussion** (contribution to NZ health tech ecosystem, export potential, IP value)
- Limited community/environmental impact (could add: reduced burnout ? better patient care ? healthier communities)

**Action needed:** Expand Section 10 with broader impact (community, environment, NZ tech ecosystem)

---

### **4. Clear & Specific (9/10)**
? **What's strong:**
- Plain language; LLM explained in Section 2.1
- Technical terms defined (assist-only, IPP 12, HIPC, HISO)
- Measurable success criteria (Section 10): 85% coding accuracy, 90% referral acceptance, 5s latency
- 4 use cases clearly described with "What it does" + "Why it's R&D" + "Success metrics"

?? **What's missing:**
- Nothing major?this section is strong

---

### **5. Credible Support (7/10)**
? **What's strong:**
- Data-driven cost estimates ($96/hr ? 1,062 hrs = $101,952; $200/month M&C)
- Realistic timeline (12 months for 4 use cases; stepped objectives)
- Cashflow forecast (Section 6.2) shows positive cash throughout ($5k ? $73k)
- Co-funding from GP clinical work income ($11k/month)

?? **What's missing:**
- **No evidence of co-funding capability** (no bank statement, no financial statements)
- No proof ClinicPro is operational (could add: screenshot, revenue figure, user count)

**Action needed:** Prepare bank statement, YTD P&L/Balance Sheet for actual submission (not for mentor)

---

## ?? **WEAKNESSES (Must Fix Before Submission)**

### **1. Market Analysis (4/10) - CRITICAL GAP**

? **MISSING:**
- **No evidence of demand:**
  - No customer testimonials from GPs
  - No letters of interest from clinics
  - No Medtech partnership letter/MOU/agreement
  - No market research data (surveys, interviews, focus groups)
  - We *claim* ClinicPro is operational but provide **no proof** (revenue, user count, growth)

- **Weak competitor analysis:**
  - Brief mention of Azure OpenAI cost comparison (Section 4)
  - Competitors (Nabla, Nuance DAX) mentioned but not analyzed
  - No competitive landscape map or SWOT
  - No "why us vs competitors" table

- **Target market not defined:**
  - We say "5,000 NZ GPs" but don't segment (rural vs urban? solo vs group practices? age demographics?)
  - No discussion of adoption barriers (tech-averse older GPs? practice manager buy-in?)
  - No total addressable market (TAM) / serviceable addressable market (SAM) calculation

**Action needed:**
1. **Get 2-3 letters of interest from GPs** (even informal emails work)
2. **Get Medtech partnership letter/MOU** or at least email confirmation of collaboration
3. **Create competitor analysis table** (Azure vs Nabla vs "do nothing" vs us)
4. **Define target market segments** (early adopters: tech-savvy, group practices, 30-50 age range?)
5. **Add to Section 2.2** or create new **Section 2.3: Market Validation**

---

### **2. Commercialization Strategy (5/10) - CRITICAL GAP**

? **MISSING:**
- **No pricing model:**
  - How will we charge? (Per-GP subscription? Per-transaction? Freemium?)
  - Example: $50/GP/month ? 3,000 GPs = $180k/year revenue
  
- **No revenue projections:**
  - Year 2-3 revenue forecast (pilot ? scale)
  - Break-even analysis (when does revenue cover R&D investment?)
  
- **No adoption timeline:**
  - Year 1 (R&D): Build and pilot (10-50 GPs)
  - Year 2: Early adopters (500 GPs)
  - Year 3-5: Scale to national (3,000+ GPs); explore export (Australia, Pacific Islands)
  
- **No go-to-market plan:**
  - How will we acquire customers post-R&D? (Medtech integration? Direct sales? Conferences?)
  - What's the pilot-to-paid conversion strategy?
  
- **No exit strategy:**
  - IPO? Acquisition by Medtech/health tech company? Bootstrap to profitability?

**Action needed:**
1. **Create new Section (after Section 10): "Commercialization & Market Strategy"**
   - Pricing model with revenue projections
   - 3-year adoption timeline (pilot ? scale ? export)
   - Go-to-market plan (Medtech rollout, conferences, direct sales)
   - Competitive positioning (why choose us over Azure/Nabla)

---

### **3. Why Grant Funding is Essential (7/10) - NOT EXPLICIT**

?? **What's weak:**
- We justify the R&D problem (cost, sovereignty, NZ-tuned)
- We show we can afford 60% co-funding
- **But we don't explicitly say:** "Without grant funding, this R&D is not viable because..."

? **What to add (1 paragraph in Section 1 or 6):**

> **Why Grant Funding is Essential:**
> 
> Grant funding is critical because commercial investors are risk-averse to early-stage R&D with uncertain technical outcomes. The cost/quality trade-off for small models under NZ constraints is unproven?no investor will fund systematic experimentation without guaranteed ROI. The 40% grant de-risks this R&D, enabling us to afford the 1,062 hours of systematic experimentation (O1-O5) required to resolve technical uncertainties. Without it, we would need to use expensive Azure OpenAI ($140k/month at scale), which is commercially unviable for NZ's 5,000 GP market. This grant makes a sovereign, cost-effective solution possible.

**Action needed:** Add 1 paragraph to **Section 6.2 (Cashflow Confidence)** or **Section 1 (Executive Summary)**

---

### **4. Community & Broader Impact (5/10) - WEAK**

?? **What's weak:**
- We focus on GP efficiency and cost savings (business impact)
- Limited discussion of patient outcomes, health equity, community benefits
- No environmental impact (e.g., paperless workflows? Reduced travel for remote consults?)
- No contribution to NZ AI/health tech ecosystem (IP, jobs, export earnings)

? **What to add:**

**Community Impact:**
- **Reduced GP burnout ? better patient care:** GPs spend 30.8% of time on admin; AI frees time for complex patients, improves consultation quality
- **Rural GP support:** AI reduces isolation/workload in under-resourced rural practices
- **Health equity:** Free up GP time for underserved populations (M?ori, Pacific, elderly)
- **Chronic disease management:** Proactive care gap monitoring improves PHO quality outcomes ? healthier population

**Economic Impact:**
- **NZ health tech ecosystem:** Contribute sovereign AI capability; reduce dependence on US tech
- **Export potential:** AU, Pacific Islands, UK (small markets with similar privacy concerns)
- **Job creation:** Year 2-3 hiring (data scientists, engineers, support staff)

**Action needed:** Add subsection to **Section 9.6 or Section 10**

---

## ?? **PRIORITY ACTIONS FOR TOMORROW**

### **?? CRITICAL (Must Have for Callaghan Submission)**

1. **Market Validation Evidence:**
   - [ ] Get 2-3 letters of interest from GPs (template: "I am interested in piloting ClinicPro's AI assistant for inbox/coding/referrals/care gaps")
   - [x] Get Medtech partnership letter/MOU or email confirmation (emailed Medtech; Alex said "next week")
   - [ ] **Get Comprehensive Care PHO letter of support** (they're actively surveying about AI/scribing - perfect timing!)
   - [ ] If ClinicPro is operational: provide proof (revenue, user count, growth chart)

2. **Create Section: "Commercialization & Market Strategy"** (~2 pages)
   - [ ] Pricing model (e.g., $50/GP/month)
   - [ ] Revenue projections (Year 1-3)
   - [ ] Adoption timeline (pilot ? 500 GPs ? 3,000 GPs ? export)
   - [ ] Go-to-market plan (Medtech rollout, conferences, direct sales)
   - [ ] Competitive positioning table (us vs Azure vs Nabla vs "do nothing")

3. **Add: "Why Grant Funding is Essential"** (1 paragraph in Section 6.2)
   - [ ] Explain why commercial funding is unavailable (risk-averse investors)
   - [ ] Explain how 40% grant de-risks R&D and makes it viable

---

### **?? IMPORTANT (Strengthens Proposal)**

4. **Expand Section 9: Long-Term Vision** (~1 page)
   - [ ] Year 2-3 roadmap (scale to national; explore export)
   - [ ] Year 3-5 vision (other specialties: nurses, specialists; expand use cases)
   - [ ] Exit strategy (IPO? Acquisition? Bootstrap to profitability?)

5. **Add: Community & Broader Impact** (subsection in Section 9 or 10)
   - [ ] Patient outcomes (reduced burnout ? better care)
   - [ ] Health equity (rural GP support, underserved populations)
   - [ ] NZ tech ecosystem (sovereign AI, export earnings, jobs)

6. **Create Competitor Analysis Table** (add to Section 2 or 4)
   - [ ] Compare: Azure OpenAI, Nabla, Nuance DAX, "Do Nothing", **Us**
   - [ ] Dimensions: Cost, Privacy, NZ-tuned, Multi-task, Latency, Vendor lock-in

---

### **?? NICE TO HAVE (Polish)**

7. **Prepare Financial Evidence** (for actual submission; not mentor)
   - [ ] Bank statement (current balance, 3-month history)
   - [ ] YTD Balance Sheet and P&L (NexWave Solutions Ltd)
   - [ ] Optional: Shareholder funding declaration (if needed)

8. **Add Appendix: Quarterly Claims Schedule** (optional; we removed it)
   - [ ] Q1-Q4 claims schedule table with dates and amounts

9. **Proofread for NZ Spelling** (already mostly done)
   - [ ] Final pass: summarise, specialise, organisational, colour, favour, etc.

---

## ?? **WHAT'S READY NOW**

### **? Complete and Mentor-Ready:**
1. **MENTOR-PROPOSAL.md** (10 sections, 25-30 pages)
   - Section 1: Executive Summary
   - Section 2: The Opportunity
   - Section 3: Our Solution (4 use cases)
   - Section 4: Why Not Azure OpenAI?
   - Section 5: Privacy & Compliance
   - Section 6: Financials & Feasibility
   - Section 7: Timeline & Deliverables
   - Section 8: Risks & Mitigations
   - Section 9: Why We'll Succeed
   - Section 10: Success Criteria

2. **Supporting Documents (All Updated):**
   - `forge-application-narrative.md` (Forge portal submission text)
   - `cost-template/cost-template.md` (Financial breakdown)
   - `cashflow-12-month.md` (12-month forecast)
   - `dpia-draft.md` (Data Protection Impact Assessment)
   - `privacy-compliance-quick-reference.md` (IPP 12, HISO, DPA clauses)
   - `safety-and-transparency-framework.md` (Safety procedures)
   - `claims-toolkit.md` (Quarterly claim templates)
   - `capability-development-evidence-pack.md` (CapDev plan)
   - `project-master-index.md` (Navigation hub)
   - `risk-and-change-management.md` (Risk register, stage-gates)

3. **Cursor Rules for LLM Agents:**
   - `.cursor/rules/project-rules.mdc` (Router for LLM agents)

---

## ?? **SUMMARY: What You Need to Do**

### **For Mentor Review (Share Now):**
? **MENTOR-PROPOSAL.md is ready**?send to mentor and ask her to review against Callaghan criteria (especially market validation and commercialization gaps)

### **After Mentor Feedback (Before Callaghan Submission):**

**Must Have (Critical Gaps):**
1. Get 2-3 GP letters of interest
2. Get Medtech partnership letter
3. Add Section: "Commercialization & Market Strategy" (pricing, revenue, go-to-market)
4. Add paragraph: "Why Grant Funding is Essential"

**Should Have (Strengthens Proposal):**
5. Expand Section 9: Long-term vision (Year 2-5)
6. Add: Community & broader impact
7. Create competitor analysis table

**Nice to Have (Polish):**
8. Bank statement, YTD P&L/Balance Sheet
9. Final NZ spelling proofread

---

## ?? **Key Changes Made Today (2025-11-01)**

### **Structural:**
- ? Replaced 3 use cases (scribe, inbox, history) with **4 strong NZ-specific use cases** (inbox, coding, referrals, care gaps)
- ? Updated all documents to reflect new use cases
- ? Removed Section 11 (Questions for Feedback) and Appendices from mentor proposal

### **Technical:**
- ? Changed cost comparison from "100x cheaper" to **"20-50x cheaper"** (accurate Azure calculation)
- ? Updated Azure costs: **$140-170k/month for 5,000 GPs** (not $900k for 10k)
- ? Fixed HealthPathways: **10 regional Community HealthPathways sites** (not 16 DHBs)
- ? Updated all "GPT-4" references to **"GPT-4/5"**
- ? Changed "SOAP note" to **"consultation note"**
- ? Applied **NZ spelling** throughout (summarise, specialise, quantisation)

### **Financial:**
- ? Updated labour plan: **~20 hrs/week throughout** (not stepped 16?20?24)
- ? Changed co-funding source: **"GP clinical work income"** (not "ClinicPro revenue" or "operating profit")
- ? Updated all cashflow tables with "GP Clinical Income" terminology

### **Metrics:**
- ? Simplified performance: **Response time P95 ? 5.0s for all use cases** (not separate scribe/inbox targets)
- ? Updated success metrics: Inbox triage time (-30%), coding accuracy (85%), referral acceptance (90%), care gap detection (85%)

---

## ?? **Questions to Ask Mentor**

When you send MENTOR-PROPOSAL.md, ask:

1. **Market Validation:**
   - "How much evidence of demand does Callaghan typically require? (Letters of interest? Surveys? Revenue proof?)"
   - "Is Medtech partnership letter essential, or can we describe the relationship verbally?"

2. **Commercialization:**
   - "Should we add a detailed commercialization section now, or save it for Stage 2 (if applicable)?"
   - "How detailed should revenue projections be for a pre-revenue R&D grant?"

3. **Grant Justification:**
   - "Is our '40% grant de-risks R&D' argument strong enough, or should we elaborate more on why commercial funding is unavailable?"

4. **Long-Term Vision:**
   - "Does Callaghan expect Year 2-5 roadmap in a New to R&D application, or is 12-month focus sufficient?"

5. **Overall:**
   - "What would Callaghan reviewers challenge most in this proposal?"
   - "On a scale of 1-10, how competitive is this for New to R&D funding?"

---

**Good luck tomorrow! Start with the ?? CRITICAL actions (market validation and commercialization section) and you'll have a strong submission.** ??
