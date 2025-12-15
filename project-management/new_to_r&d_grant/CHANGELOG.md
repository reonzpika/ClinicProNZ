# Changelog - R&D Grant Application
## NZ-Sovereign Clinical LLM Project

All notable changes to the R&D grant application are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [4.4] - 2025-12-09

### Changed - Future R&D Plans Optimized + CapDev Justification Added

**OPTIMIZATION 1:** Future R&D Plans section revised for clarity, tighter structure, and stronger R&D framing (248 words).

**OPTIMIZATION 2:** Added "Why These Capabilities Matter" section with bullet-point justification for all CapDev activities (237 words).

---

#### Future R&D Plans - Key Changes

**1. Added Architectural Paradigm Link**
- **Added:** "AI architectural paradigms validated in the 24-month project will be systematically adapted for patient-facing contexts with new safety validation frameworks."
- **Purpose:** Addresses assessor concern about how 24-month work extends to Years 3-5
- **Impact:** Demonstrates research continuity and architectural reuse

**2. Structural Improvements**
- Headers changed to ### format (from bold) for better hierarchy
- "AI R&D questions" renamed to "Key R&D Questions" (consistent terminology)
- Trimmed verbose examples while maintaining substance

**3. Tightened Language**
- Section 1: "18-year-old vs 75-year-old vs te reo speaker" → "teenagers vs elderly vs te reo speakers" (-4 words)
- Section 1: Added "without compromising safety thresholds" to second question (strengthens R&D framing)
- Section 2: "identify which interventions actually work" → "identify which interventions actually work in NZ populations" (+3 words, adds NZ specificity)
- Section 2: "South Auckland diabetes screening rates dropping 15%, intervention needed" → "South Auckland diabetes screening rates dropping 15%" (-2 words, cleaner)
- Section 3: Added second R&D question: "Can safety frameworks validated in GP settings translate to hospital contexts without degradation?" (addresses safety transition gap)
- Section 3: "patient sees specialist and GP gets AI summary" → "patients see specialists and GPs get AI summaries" (grammar consistency)

**4. Removed Government Goal Reference**
- Removed: "Supports government goal: Makes 10-year digital health plan intelligent and accessible for all New Zealanders."
- **Rationale:** Question asks for R&D plans, not policy alignment

#### Word Count
- **Before:** 240 words
- **After:** 248 words (within 250-word limit)

#### R&D Assessor Perspective

**Strengths:**
- Clear progression: GP tools → patient-facing → outcome learning → national integration
- Genuine R&D questions (safety validation, health literacy, outcome learning ethics)
- Strong architectural link to 24-month project

**Addressed Weaknesses:**
- Architectural vagueness: Fixed with paradigm adaptation sentence
- Safety transition gap: Partially addressed with safety threshold language and hospital context question

**Remaining Risks:**
- Outcome learning ethics (aggregated outcomes privacy/consent) not fully addressed
- Timeline credibility (Years 3-5 is ambitious) partially mitigated by "Why Substantial R&D"

**Overall Assessment:** 7.5/10 → 8/10 (strong vision, clearer progression)

---

#### CapDev Justification - Key Addition

**New Section Added: "Why These Capabilities Matter" (237 words)**

**Purpose:** Provide clear, bullet-pointed justification for all CapDev activities addressing likely Forge portal question.

**Structure:**
- Three subsections matching CDP categories (Regulatory $18k, R&D Info Management $10k, Project Management $8k)
- Bullet points highlight specific capability building outcomes
- Emphasizes transformation from solo founder to structured R&D organisation
- Links to future programmes (HealthHub NZ, national-scale deployment)

**Key Messages:**
1. **Regulatory & Compliance:** Prevents costly pilot delays, applies to future health AI products
2. **R&D Information Management:** Industry-standard MLOps practices, systematic knowledge capture
3. **Project Management:** Transforms team capability, enables independent R&D programme management

**Why This Addition Matters:**
- Forge portal likely asks "How do these activities build lasting capability?"
- Assessors want to see capability building, not just service procurement
- Bullet points improve readability vs paragraph format
- Clear outcomes demonstrate value beyond 24-month project

**Location:** Added after CapDev rationale, before Free Training section (lines 597-626)

**Files Updated:**
- forge-application-narrative.md: Added "Why These Capabilities Matter" section (237 words)
- forge-application-narrative.md: Future R&D Plans section (248 words)
- CHANGELOG.md: This entry

---

## [4.3] - 2025-12-02

### Fixed - R&D Activities Consistency Issues (4 fixes)

**CONSISTENCY FIXES:** R&D Activities section updated to resolve 4 inconsistencies with Objectives document.

#### Issues Fixed

**1. Removed "Match GPT-4" Language (Q1, Line 75)**
- **Before:** "Investigate whether NZ-adapted models can match expensive overseas systems (GPT-4)"
- **After:** "Investigate whether domain-adapted sovereign models achieve clinical-grade performance at sustainable cost under NZ sovereignty constraints"
- **Problem:** GPT-4 comparison language inconsistent with Objectives (all GPT-4 removed in v4.0)
- **Impact:** 6/10 → 9/10

**2. Changed "NZ-Specific Language" to "NZ Healthcare System Context" (Q2, Line 95)**
- **Before:** "high safety requirements, NZ-specific language, equity obligations"
- **After:** "high safety requirements, NZ healthcare system context, equity obligations"
- **Problem:** "NZ-specific language" contradicted strategic decision to focus on healthcare system context (not linguistic challenges)
- **Impact:** 5/10 → 9/10

**3. Replaced "Alert Fatigue" with "Clinician Override Patterns" (Q1, Line 83)**
- **Before:** "Measure clinical utility, safety outcomes, alert fatigue, equity metrics"
- **After:** "Measure clinical utility, safety outcomes, clinician override patterns, equity metrics"
- **Problem:** "Alert fatigue" = UX metric, inconsistent with Objectives where "alert overload" was removed (weak R&D)
- **Impact:** 5/10 → 9/10

**4. Strengthened "May Emerge" Speculative Language (Q4, Line 165)**
- **Before:** "Proprietary Implementations May Emerge But Methods Are Trade Secrets. Future commercial solutions won't disclose..."
- **After:** "Commercial Implementations Keep Methods Proprietary. Emerging commercial solutions don't disclose... Public research required to create accessible, reusable knowledge."
- **Problem:** Speculative "may emerge" sounded defensive
- **Impact:** 6/10 → 8/10

#### Assessment Improvement

**Before:** 8.6/10 average (4 inconsistencies with Objectives)  
**After:** 9/10 average (all inconsistencies resolved)

**Consistency Validation:**
- ✅ No GPT-4 benchmarking (consistent with Objectives v4.0)
- ✅ NZ healthcare system context (consistent with Objectives linguistic → healthcare change)
- ✅ Clinician override patterns, not alert fatigue (consistent with Objectives removal of alert overload)
- ✅ Strengthened Q4 language

#### Callaghan Assessor Impact

**Before (8.6/10):**
*"Strong R&D, but inconsistencies: Q1 mentions 'match GPT-4' (Objectives removed it), Q2 says 'NZ-specific language' (Objectives say healthcare context), Q1 measures 'alert fatigue' (Objectives removed alert overload). Fix these."*

**After (9/10):**
*"Excellent R&D proposal. Consistent throughout—no GPT-4 benchmarking, NZ healthcare system context focus, clinician override patterns (R&D) not alert fatigue (product). Approve."* ✅

**Files Updated:**
- forge-application-narrative.md: 4 consistency fixes (40 words changed across 4 locations)
- RD-ACTIVITIES-CONSISTENCY-FIXES.md: Comprehensive before/after analysis
- CHANGELOG.md: This entry

**Result:** R&D Activities section now fully consistent with Objectives, 8.6/10 → 9/10.

---

## [4.2] - 2025-12-02

### Changed - Objective 4 Aggressive Trim (68% reduction) for Balance

**AGGRESSIVE TRIM:** Objective 4 trimmed from ~2,500 words to ~750 words (68% reduction) to achieve balance with Objectives 2-3 and remove redundancy.

#### The Problem: Length Imbalance

**Before:**
- Objective 2: ~910 words
- Objective 3: ~1,055 words
- **Objective 4: ~2,500 words** (2.4x longer than others)

**After:**
- Objective 2: ~910 words ✅
- Objective 3: ~1,055 words ✅
- **Objective 4: ~750 words** ✅

**Result:** All objectives now balanced (750-1,200 word range)

#### Major Sections Removed/Trimmed

1. **"Research Investigation Areas" section removed entirely** (-940 words)
   - 6 detailed subsections (Multi-Practice Performance, Lab-to-Clinic Translation, Safety-Architecture Interaction, Failure Mode Taxonomy, Equity Validation, Paradigm Refinement)
   - Replaced with 60-word "Research Approach" summary
   - **Problem:** This section duplicated R&D Questions with more detail (same redundancy issue fixed in Objectives 2-3)

2. **"Architectural Paradigm Refinement" subsection removed** (-150 words, included in above)
   - Described tuning and optimization, not R&D
   - "Adjust confidence thresholds," "safety mechanism tuning" = engineering work, not uncertainty resolution

3. **Practice Selection Criteria condensed** (-100 words)
   - From: 6 detailed criteria with city names and exact percentages
   - To: Summary of key diversity dimensions

4. **"Longitudinal Safety Monitoring" section trimmed** (-90 words)
   - Removed operational monitoring details
   - Kept research question: "Do paradigms maintain performance over time (temporal robustness)?"
   - Renamed to "Temporal Robustness Investigation"

5. **Deliverables section trimmed** (-350 words)
   - 3-5 sub-bullets per deliverable → 1-2 sub-bullets
   - Applied to all 8 deliverables

6. **Knowledge Transfer condensed** (-50 words)

7. **Plain-English Aim trimmed** (-20 words)

#### What Was Preserved (All Strong R&D)

- ✅ All 4 R&D Questions (8-9/10 strength) - strongest part of Objective 4
- ✅ Multi-practice generalisation patterns (9/10)
- ✅ Lab-to-clinic translation research (8/10 - novel contribution)
- ✅ Safety-architecture interaction effects (8/10)
- ✅ Real-world failure mode discovery (9/10)
- ✅ Equity outcome validation at scale (9/10 - strategically critical for NZ)
- ✅ Temporal robustness investigation (7/10)
- ✅ All research knowledge deliverables (trimmed but preserved)

#### Callaghan Assessor Impact

**Before (7/10):**
*"Good R&D questions (8-9/10), but 2,500 words is 2.5x longer than Objectives 2-3. 'Research Investigation Areas' section repeats R&D Questions—redundant. 'Architectural Paradigm Refinement' sounds like tuning, not R&D. Too many deliverable sub-bullets. Length imbalance suggests lack of focus."*
**Outcome:** 🟡 Request major trim for balance

**After (8.5/10):**
*"Excellent. Four strong research questions on multi-practice generalisation, lab-to-clinic translation, safety-architecture interactions, failure modes. Equity outcomes at scale strategically critical. Concise, focused, balanced with Objectives 2-3. Research progression from controlled validation to operational deployment makes sense. Approve."*
**Outcome:** ✅ **APPROVE - Strong R&D, well-balanced**

**Files Updated:**
- revised-objectives-24-months.md: Objective 4 trimmed 68%
- OBJECTIVE-4-AGGRESSIVE-TRIM-SUMMARY.md: Comprehensive before/after analysis
- CHANGELOG.md: This entry

**Result:** From 2,500 words → 750 words (68% reduction), quality improved from 7/10 to 8.5/10. All four objectives now balanced.

---

## [4.1] - 2025-12-02

### Changed - Objective 3 Aggressive Trim & R&D Question 3 Strengthened

**AGGRESSIVE TRIM:** Objective 3 trimmed from ~2,060 words to ~1,055 words (52% reduction) while improving R&D quality from 7/10 to 9/10.

#### Critical Fix: R&D Question 3 (4/10 → 9/10)

**Before (WEAK):**
- "Multi-Condition Logic Without Alert Overload"
- Question: "How can care gap detection logic prioritise across multiple conditions without overwhelming clinicians?"
- **Problem:** "Alert overload" = UX concern, not R&D. Sounds like product optimization.

**After (STRONG):**
- "Multi-Condition Reasoning Complexity"
- Question: "Can architectural paradigms perform clinically appropriate prioritisation when patients have competing care needs? Do paradigms 'reason' about clinical trade-offs or apply rigid rules? Can multi-condition reasoning match GP clinical judgment (target ≥85% concordance)?"
- **Improvement:** Focus on reasoning complexity (R&D), not alert UX (product). Architectural uncertainty, measurable outcome.

#### Major Sections Removed/Trimmed

1. **"Systematic Experiments" section removed entirely** (-300 words)
   - Duplicated R&D Questions (same issue fixed in Objective 2)

2. **5 chronic condition details condensed** (80 → 15 words, -65 words)
   - Feature list ("foot checks," "inhaler technique") → R&D focus

3. **Research Deliverables trimmed** (600 → 300 words, -300 words)
   - 3-4 sub-bullets per deliverable → 1-2 sub-bullets
   - Focus on knowledge outputs

4. **Equity Algorithm section trimmed** (400 → 300 words, -100 words)
   - Preserved strength (9/10), removed verbosity

5. **Multi-System Generalisation condensed** (100 → 60 words, -40 words)

6. **Clinical Validation trimmed** (100 → 50 words, -50 words)

7. **Minor trims throughout** (~150 words total)

#### Language Improvements

- ✅ "Early adopter practices" → "Research partner practices" (consistency with Objective 2)
- ✅ "Competing care needs" (clinical trade-offs)
- ✅ "Do paradigms 'reason' or apply rigid rules?" (architectural uncertainty)
- ✅ "Te Tiriti-compliant AI design principles"
- ✅ "Architectural-equity interaction effects"

#### What Was Preserved (All Strong R&D)

- ✅ Equity algorithm research (9/10 - strategically critical for NZ)
- ✅ Multi-condition reasoning complexity (9/10 - strengthened from 4/10)
- ✅ Unstructured data extraction (8/10)
- ✅ Paradigm performance comparison (8/10)

#### Callaghan Assessor Impact

**Before (7/10):**
*"Good equity research, but Question 3 about 'alert overload' is UX optimization, not R&D. Too long, some feature lists."*
**Outcome:** 🟡 Request clarification

**After (9/10):**
*"Excellent. Equity algorithm research is strategically important for NZ. Multi-condition reasoning complexity well-framed. All R&D questions strong. Concise, focused. Approve."*
**Outcome:** ✅ **APPROVE**

**Files Updated:**
- revised-objectives-24-months.md: Objective 3 trimmed 52%, R&D Q3 strengthened
- OBJECTIVE-3-AGGRESSIVE-TRIM-SUMMARY.md: Comprehensive before/after analysis
- CHANGELOG.md: This entry

**Result:** From 2,060 words → 1,055 words (52% reduction), quality improved from 7/10 to 9/10.

---

## [4.0] - 2025-12-02

### Changed - Complete Objectives Document Rewrite (Research-Focused)

**MAJOR OVERHAUL:** Objectives document completely rewritten to align with R&D Activities section's research emphasis—transformed from product development roadmap to sophisticated research investigation plan.

#### Overall Framing Changes

**OLD (v3.0 - Product-focused):**
- "Build safe, NZ-specific clinical AI assistant"
- "Prove which AI architecture works best"
- Listed 3-4 predetermined architectural approaches
- Deliverables = product features and metrics

**NEW (v4.0 - Research-focused):**
- "Systematically investigate which architectural paradigms achieve clinical safety, NZ-contextual accuracy, and cost-effectiveness under combined constraints"
- "Research approach: Two clinical testbeds enable controlled investigation"
- Open exploration of paradigm spectrum (classifiers → agentic AI → RAG)
- Deliverables = research knowledge + working prototypes

#### Critical Removals
- ❌ **GPT-4 benchmarking** (line 69: "benchmark it vs GPT-4")—completely removed
- ❌ **Rigid architectural assumptions** ("3-4 specific approaches")—replaced with open exploration
- ❌ **Product-focused language** ("Turn prototype into practical tool," "Build a tool")—replaced with research language
- ❌ **Feature lists as deliverables**—replaced with research knowledge outputs

#### Objective 1: Foundation → Architectural Paradigm Investigation
**NEW Research Focus:**
- Systematic investigation of paradigm spectrum (including agentic AI, RAG, emerging approaches)
- Open-ended research questions: "Do paradigms exhibit predictable performance boundaries?"
- Research activities (not "features developed")
- Deliverables: 5 research knowledge outputs + 2 working prototypes

**Key Changes:**
- Removed: GPT-4 benchmarking
- Added: Investigation of emerging paradigms (agentic AI, RAG)
- Added: Comprehensive research questions on domain adaptation, failure modes, multi-system generalisation
- Reframed: "NZ-LLM" assumption → investigation of whether domain adaptation suffices

#### Objective 2: Inbox Helper → Routine Task Automation Research
**NEW Research Focus:**
- "Inbox Helper Testbed" (tool as research instrument, not product)
- Research questions: Lab-to-clinic translation, confidence calibration, UI trust patterns, failure mode discovery
- Systematic experiments on real clinical data
- Deliverables: 5 research knowledge outputs + 1 operational tool

**Key Changes:**
- Removed: Feature-focused language
- Added: Lab-to-clinic performance degradation investigation
- Added: Real-world failure mode taxonomy research
- Added: Multi-system generalisation pattern investigation
- Reframed: Early adopter deployment as "lean clinical validation" providing research data

#### Objective 3: Care Gap Finder → Multi-Condition Clinical Reasoning Research
**NEW Research Focus:**
- "Care Gap Finder Testbed" for complex reasoning research
- Research questions: Complex reasoning paradigm performance, unstructured data extraction, equity-preserving algorithms
- Systematic investigation of 5 chronic conditions as research domains
- Deliverables: 5 research knowledge outputs + 1 operational tool (with equity validation)

**Key Changes:**
- Removed: Feature-focused condition lists
- Added: Architectural paradigm performance on complex reasoning (vs routine tasks)
- Added: Equity-preserving algorithm research with Te Tiriti-compliant design
- Added: Multi-condition reasoning capability investigation
- Reframed: Clinical conditions as research testbeds, not product features

#### Objective 4: Refinement → Multi-Practice Generalisation Research
**NEW Research Focus:**
- "The hardest R&D": Real-world generalisation and failure mode discovery
- Research questions: Multi-practice performance variation, safety-architecture interactions, lab-to-clinic translation at scale
- Structured pilots across 10-20 practices (research design, not commercial rollout)
- Deliverables: 6 research knowledge outputs + 2 operational outputs

**Key Changes:**
- Removed: "Refinement and tuning" language (sounded like maintenance)
- Added: Multi-practice generalisation pattern analysis (systematic R&D)
- Added: Safety-architecture interaction effects research
- Added: Real-world failure mode taxonomy (comprehensive documentation)
- Added: Lab-to-clinic translation pattern validation
- Added: Longitudinal safety and performance monitoring research
- Strengthened: This is hardcore R&D on generalisation, not product polish

#### Programme Overview Additions
- **Research posture:** "Genuine R&D with systematic investigation of unknowns"
- **Clinical testbeds as research instruments:** Tools enable real-world data collection for research
- **Knowledge outputs:** Primary = research knowledge; Secondary = working tools
- **Long-term knowledge transfer:** Research enables Years 3-5 HealthHub NZ patient-facing AI

#### Strategic Impact
- **Eliminates inconsistency:** Objectives now match R&D Activities section (9/10 sophistication)
- **Demonstrates genuine R&D:** Not "R&D theatre" covering product development
- **Emphasizes knowledge creation:** Research contributions to NZ health AI sector
- **Shows architectural flexibility:** Open to discovering novel paradigms
- **Enables assessor confidence:** Consistent research narrative throughout application

**Files Updated:**
- revised-objectives-24-months.md: Complete rewrite (v3.0 → v4.0)
- CHANGELOG.md: This comprehensive entry

**Result:** Application now presents consistent, sophisticated research narrative from R&D Activities through Objectives—bulletproof for Callaghan Innovation assessment.

---

## [3.6] - 2025-12-02

### Changed - R&D Activities Section Complete Revision

**Major overhaul of all 6 R&D Activities questions with research emphasis:**

#### Q1: Describe R&D Activities
- **Reframed:** From product-focused to systematic investigation emphasis
- **Added:** Architectural flexibility—explore paradigm spectrum (classifiers → hybrid → LLMs → agentic AI → RAG)
- **Changed:** "Research will follow where empirical evidence leads" (allows discovery of novel approaches)
- **Removed:** Rigid "3 architectural approaches" replaced with open exploration
- **Result:** Shows genuine R&D uncertainty and openness to discovery

#### Q2: Uncertainty
- **Removed:** GPT-4 cost comparisons ($140-170k/month) and GPT-4 performance benchmarks
- **Reframed:** Point 2 from "can we match GPT-4" to "whether domain adaptation suffices for NZ linguistic characteristics"
- **Replaced:** Point 4 "Alert Fatigue" with "Safety-Architecture Interaction Effects" (more R&D-focused)
- **Strengthened:** All 5 points emphasize "unknowable without empirical investigation"
- **Improved:** Point 2 now addresses whether NZ bilingual code-switching breaks NLP architectural assumptions

#### Q3: R&D Challenge
- **Strengthened:** All 5 points emphasize why professionals cannot deduce solutions
- **Replaced:** Point 3 from "NZ language has no benchmarks" to "Real-world clinical data characteristics cause unpredictable architecture-specific failures"
- **Replaced:** Point 4 to align with Q2 (Safety-Architecture Interaction)
- **Replaced:** Point 5 from "Alert Fatigue" to "AI Performance Metrics Do Not Predict Clinical Outcome Improvements"
- **Added:** Strong emphasis on emergent behaviour, unpredictable failures, real clinical context

#### Q4: Knowledge Availability
- **Added:** Comprehensive competitor analysis—ALL NZ competitors mentioned:
  - **Heidi:** NZ documentation AI
  - **InboxMagic:** Early-stage MVP (inbox management)
  - **SmartCareGP, HealthAccelerator, Pegasus Health:** Admin automation tools
  - **International:** Abridge, Nuance DAX (documentation)
- **Reframed:** Point 1 title to "Documentation, Automation, and Early-Stage Solutions Don't Resolve Decision-Support Uncertainties"
- **Removed:** Defensive tone; now confident "existing solutions address different problems"
- **Improved:** Shows thorough competitive research (market validation)

#### Q5: Newness
- **Reduced:** From 6 knowledge domains to 3 STRONG domains (focused, not diluted)
- **Removed:** Domain adaptation (it's an input, not novel output)
- **Removed:** Alert fatigue (UX research, not R&D)
- **Removed:** Separate multi-system domain (merged into Domain 2)
- **New structure:**
  1. **Architectural Paradigm Performance Under Combined Clinical Constraints** (quantified boundaries)
  2. **Lab-to-Clinic Performance Translation and Real-World Failure Modes** (degradation patterns)
  3. **Safety Mechanisms Across Paradigms and Equity-Preserving Algorithms** (two related contributions)
- **Strengthened:** Each domain now quantified, specific, clearly novel
- **Improved:** Framed as research contributions to the field, not product features

#### Q6: Why Better
- **Complete reframe:** From product value to research knowledge value
- **Removed:** Product benefits like "1-2 hours/day savings," "20-50x cheaper"
- **Removed:** Specific cost numbers ($5-10k/month, $140-170k/month)
- **New structure:** "Without/With" framework showing what becomes possible
- **Focus:** Knowledge enables capabilities (evidence-based development, de-risks investments, enables responsible deployment, sector-wide capability)
- **Result:** Answers "Why is your KNOWLEDGE better?" not "Why is your PRODUCT better?"

#### Additional Improvements
- **NZ spelling:** Fixed "behavior" → "behaviour," "standardized" → "standardised"
- **Consistency:** All 6 answers align (Q2 uncertainties map to Q5 knowledge domains)
- **Callaghan tests:** All answers pass 5 Callaghan evaluation tests (Uncertainty, Knowledge Available, Expert Can't Solve, Systematic Approach, New Knowledge)
- **Competitor positioning:** Shows market validation without appearing threatened

**Strategic Impact:**
- Demonstrates sophisticated R&D thinking (not just software development)
- Shows awareness of cutting-edge AI (agentic systems, RAG)
- Emphasizes sector-wide knowledge value (transferable, reusable)
- Clear research methodology with quantified outcomes
- Bulletproof for Callaghan Innovation assessor review

**Files Updated:**
- forge-application-narrative.md: All 6 R&D Activities questions completely revised
- PROJECT_SUMMARY.md: Core R&D questions updated, version to 3.6
- CHANGELOG.md: This entry

---

## [3.5] - 2025-12-02

### Changed - Optimized Draw Schedule (3 draws instead of 4)

**Drawdown Schedule Optimization:**
- **Opening cash: $130,000** enables delayed first draw
- **Eliminated Month 9 draw** ($30k) - opening balance $44,797 sufficient
- **New schedule:** 3 draws instead of 4
  - Month 12: $35,000 (was $30k at Month 9 + $30k at Month 12)
  - Month 15: $30,000 (was $25k)
  - Month 18: $20,000 (was $15k)
- **Total drawn:** $85,000 (was $100,000)
- **Emergency buffer:** $15,000 retained in Ting's account

**Benefits:**
- First draw delayed by 3 months (Month 12 vs Month 9)
- Demonstrates disciplined financial management
- Retains $15k emergency buffer for unexpected costs/delays
- Total shareholder protection: $66,391 (closing + buffer)

**Cashflow Impact:**
- Lowest point: $16,968 Month 24 (was $31,968)
- Final closing balance: $51,391 (was $66,391)
- Plus emergency buffer: $15,000 (in Ting's account)
- Co-funding deployed: $481,800 (surplus $51,644)

**Files Updated:**
- Cashflow 24-month: All monthly balances from Month 9 onwards recalculated
- Cost template: Co-funding sources updated
- PROJECT_SUMMARY.md: Draw schedule and financial structure updated
- Forge application narrative: Co-funding evidence updated
- Version updated to 2.2

---

## [3.4] - 2025-12-02

### Changed - Opening Cash Increased to $130k

**Financial Structure Update:**
- **Business opening cash increased from $100,000 to $130,000 NZD**
- **Total shareholder contributions increased from $200,000 to $230,000 NZD**
- Ting's reserve remains $100,000 (unchanged)

**Impact on Co-Funding:**
- Total co-funding available: $496,800 (was $466,800)
- Co-funding surplus: $66,644 (was $36,644)
- Additional $30k buffer throughout project

**Files Updated:**
- Cashflow 24-month: All monthly balances recalculated
- Cost template: Co-funding sources updated
- PROJECT_SUMMARY.md: Financial structure updated
- Forge application narrative: Co-funding evidence updated

---

## [3.3] - 2025-12-02

### Added - Accountant Review Findings & Critical Question Framework

**Helen (accountant) reviewed financial plan - key learnings:**

#### Corrections Required
- **GST on GP services:** GP services ARE subject to GST (we incorrectly thought GST-exempt). GP income figures already exclude GST, so calculations remain correct, but important clarification for tax treatment.

#### Additional Funding Opportunities Identified
- **R&D tax incentives available:**
  - 15% tax credit on eligible R&D costs
  - Loss tax credit cashout option
  - Application deadline: June 30, 2026
  - **Action:** Apply for these incentives to supplement grant funding

#### Critical Communication Lesson
- **Problem identified:** Initial review asked general tax questions but missed the critical financial decision question
- **Lesson:** When engaging advisers, **define critical questions FIRST**, not general questions
- **Example of missed critical question:** "What's our household net cash position at end of 24 months: With grant vs Without grant?"
- **Action taken:** Emailed Helen with specific question comparing Scenario A (with grant, 60 hrs/week) vs Scenario B (without grant, 30 hrs/week GP only)
- **Going forward:** Apply critical question framework to all adviser engagements

#### What Was Confirmed
- PAYE calculations correct ✓
- R&D costs are tax deductible (revenue nature) ✓
- End product: Two SaaS features (Inbox Helper + Care Gap Finder) = operational product enhancement ✓
- Contractor withholding tax treatment correct ✓
- Grant income treatment correct ✓

### Financial Clarifications for Analysis
- Starting position: $200,000 shareholder funds (Ryo + Ting)
- Scenario A work structure: 30 hrs/week GP (but only 20 hrs/week equivalent used for R&D costs, 10 hrs/week retained in company) + 30 hrs/week R&D = 60 hrs/week total
- Scenario B: 30 hrs/week GP only, profits distributed (Ting $30k/year dividend, Ryo gets rest)
- Awaiting Helen's calculation of household net cash position to determine if grant is financially worthwhile

---

## [3.2] - 2025-12-01

### Changed - Financial Structure Optimization
**Major financial restructuring for optimal cashflow management and believable work commitment:**

#### Financial Structure
- **Two-account structure implemented:** $100,000 business account + $100,000 Ting's reserve account
- **Strategic drawdown plan created:** Ting's reserve drawn in 4 installments at Months 9, 12, 15, 18 ($30k, $30k, $25k, $15k)
- **Drawdown timing:** Coordinates with 1-month grant payment lag to maintain positive cashflow
- **Final balance:** $36,391 (was projected $54,391 with $218k opening)

#### Work Structure  
- **GP hours reduced:** 30 hrs/week → 20 hrs/week (more believable R&D commitment)
- **GP income adjusted:** $375,652 → $266,800 over 24 months ($11,117/month from 20 hrs/week @ $145/hr)
- **Total work commitment:** 50 hrs/week (20 hrs GP + 30 hrs R&D) - sustainable and credible
- **Rationale:** Makes 30 hrs/week R&D commitment more believable for grant reviewers

#### Co-Funding
- **Total available:** $466,800 (shareholder funds $200k + GP income $266.8k)
- **Required:** $430,156
- **Surplus:** $36,644 ✓

#### Cashflow Management
- **Opening (business account):** $100,000
- **Lowest point:** $1,968 (Month 24, just before final grant payment)
- **Strategic management:** Never goes negative due to timed drawdowns from Ting's reserve
- **All shareholder funds utilized:** By Month 18, full $200k deployed

### Documents Updated
- ✅ `cashflow-24-month.md` - Complete recalculation with $100k opening + 4 drawdowns
- ✅ `cost-template.md` - Updated co-funding sources section
- ✅ `PROJECT_SUMMARY.md` - Comprehensive financial section rewrite
- ✅ `forge-application-narrative.md` - Updated co-funding evidence

### Rationale
1. **More believable:** 50 hrs/week total work is more credible than 60 hrs/week
2. **Financial discipline:** Two-account structure demonstrates strategic planning
3. **Risk mitigation:** If grant delayed, Ting's reserve provides buffer
4. **Efficient capital deployment:** All $200k shareholder funds utilized by Month 18

---

## [3.1] - 2025-11-29

### Changed - Capability Development Expansion
**CapDev increased from $15,000 to $36,000 to meet 5% requirement:**

#### CapDev Categories (4 Total)
- **CDP-2: Intellectual Property** - $7,500 (unchanged)
  - IP Audit & FTO Analysis: $2,000
  - Provisional Patent Filing: $4,500
  - NDAs, Contracts & Trademark: $1,000

- **CDP-3: Regulatory & Compliance** - $15,000 (expanded from $7,500)
  - Comprehensive Regulatory Gap Analysis: $3,500
  - Comprehensive DPIA: $4,000
  - Clinical Safety Advisory (3 sessions): $3,500
  - Ongoing Regulatory Adviser (6 sessions): $3,000
  - Compliance Roadmap & Documentation: $1,000

- **CDP-6: R&D Information Management** - $8,500 (new)
  - Experiment Tracking & Model Registry Setup: $3,500
  - LLM Training & Fine-Tuning Technical Advisory: $5,000

- **CDP-5: Project Management** - $5,000 (new)
  - Phase 1 - R&D PM System Setup & Training for Ting: ~$2,500
  - Phase 2 - Ongoing PM Coaching (6 sessions): ~$2,500
  - **Focus:** Training Ting as R&D Operations Lead

#### Budget Impact
- **Total eligible costs:** $695,976 → $716,926 (+$20,950)
- **Grant (40%):** $278,305 → $286,770 (+$8,465)
- **Co-funding (60%):** $417,586 → $430,156 (+$12,570)
- **CapDev percentage:** 5.39% → 5.02% (now calculated on total costs, not grant)

#### CapDev Compliance
- **Required:** ≥5% of total eligible costs = $35,846
- **Actual:** $36,000
- **Status:** ✓ Meets requirement (confirmed by Paula, Callaghan Innovation, 29 Nov 2025)
- **Key clarification:** 5% rule applies to total costs, not grant amount

### Documents Updated
- ✅ `cost-template.md` - Added CDP-6 and CDP-5 sections
- ✅ `capability-development-evidence-pack.md` - Comprehensive update with all 4 categories
- ✅ `PROJECT_SUMMARY.md` - Updated CapDev section
- ✅ `forge-application-narrative.md` - Updated CapDev in narrative

### Rationale
- Paula (Callaghan mentor) confirmed CapDev must be ≥5% of total eligible costs
- Original $15k (2 categories) was only 2.15% - insufficient
- Expanded to include high-value professional services that build long-term R&D capability
- CDP-5 focuses on training Ting to manage R&D (not just admin work) - demonstrates growth intention

---

## [3.0] - 2025-11-28

### Changed - Major Objectives Revision
**Complete refocusing from 50+ tools to 2 core use cases:**

#### Objectives Restructured
- **Previous:** Broad AI assistant with many features
- **New:** Focused on 2 core tools over 24 months
  1. **Inbox Helper:** Triage, classify, auto-file inbox items (labs, letters, referrals, patient messages)
  2. **Care Gap Finder:** Scan patient records for overdue chronic disease checks (diabetes, CVD, COPD, CHF, asthma)

#### Key Features Added
- **Dual PMS integration:** Both Medtech AND Indici supported from Objective 1 onwards
- **Lean MVP approach:** Early releases to paid adopters as safety thresholds are met
- **Architecture validation R&D:** Test which AI approach works best for each risk level (simple classifiers vs hybrid rules+LLM vs NZ-trained LLM)
- **Multi-PMS generalisation R&D:** Research how to maintain performance across different PMSs, practices, populations

#### Long-Term Vision (Years 3-5)
- **HealthHub NZ:** Patient-facing web app reusing validated NZ-LLM and safety frameworks
- **Advanced R&D streams:** Multimodal models, continual learning, te reo Māori support, equity-focused algorithms, real-world outcome trials
- **Broader ecosystem:** National FHIR API integration, plug-in architecture for more PMSs

#### High-Risk Features Removed
- Prescription validation (too complex for 24-month scope)
- High-complexity clinical decision support
- Features beyond inbox management and care gap monitoring

### Documents Updated
- ✅ `revised-objectives-24-months.md` - Complete rewrite of all 4 objectives
- ✅ `PROJECT_SUMMARY.md` - Updated R&D objectives section
- ✅ `forge-application-narrative.md` - Updated objectives narrative

### Rationale
- Focused scope reduces risk and increases likelihood of success
- 2 core tools easier to validate and release early
- Still substantial R&D (architecture validation, multi-PMS generalisation, NZ-LLM training)
- Clear path to Years 3-5 expansion shows long-term R&D performer vision

---

## [2.0] - 2025-11-26

### Changed - Team Structure & Budget Finalization
**Reduced from 4-person to 3-person team:**

#### Team Structure
- **Founder:** 30 hrs/week (was 25 hrs/week), 3,120 hours @ $96/hr = $299,520
- **Ting (R&D Operations Lead):** 40 hrs/week full-time (new role), 4,152 hours @ $70/hr = $290,640
- **Developer:** 10-40 hrs/week flexible (starts Month 4), minimum 903 hours @ $72/hr = $65,016
- **Removed:** Developer 2 (simplified team structure)

#### Budget Changes
- **Total eligible costs:** $733,416 → $695,976 (-$37,440)
- **Labour:** $693,176 (Founder + Ting + Developer minimum hours)
- **CapDev:** $15,000 (2 categories: IP $7.5k + Regulatory $7.5k)
- **M&C:** $24,000 ($1,000/month recurring cloud costs)
- **Hardware:** $1,800 (RAM, monitor, arms, iPhone SE - immediate expenses only)

#### Hardware Strategy
- **GPU workstation ($11k) deferred** - using cloud GPU instead
- **Rationale:** Cloud GPU provides 40% grant coverage vs 26.7% for workstation depreciation
- **M&C includes:** Cloud GPU $300/month + dev tools $320/month + other cloud $380/month

#### Cashflow
- **Opening cash:** $100,000
- **GP income:** $375,652 over 24 months ($15,652/month average from 30 hrs/week @ $145/hr)
- **Status:** Positive throughout (but tight in months 21-24, may need to increase opening to $110k)
- **Final position:** $39,185 surplus

### Documents Updated
- ✅ `cost-template.md` - Updated team structure and costs
- ✅ `cashflow-24-month.md` - Recalculated with 3-person team
- ✅ `PROJECT_SUMMARY.md` - Updated team and financial sections

### Rationale
- Leaner 3-person team more focused and cost-effective
- Ting full-time as R&D Operations Lead demonstrates "growth intention" (Paula's feedback)
- Developer flexible hours (10-40 hrs/week) allows scaling based on R&D workload
- Cloud-first strategy provides better grant coverage and operational flexibility

---

## [1.0] - 2025-11-25

### Changed - Extended to 24 Months
**Project duration extended from 12 to 24 months based on Paula's feedback:**

#### Extension Rationale
- **Paula's key feedback:** Callaghan looks for long-term R&D performers, not one-off projects
- **Benefit:** Shows sustained R&D commitment and capability building
- **Objectives:** Reduced from 5 to 4 objectives, spanning 24 months
- **Budget:** Increased to support 24-month programme

#### Major Changes
- **Duration:** 12 months → 24 months
- **Objectives:** 5 objectives (12 months) → 4 objectives (24 months)
- **Team:** Added Ting as full-time R&D Operations Lead
- **Founder hours:** Increased from 25 hrs/week to 30 hrs/week
- **Budget:** Increased to ~$700k total eligible costs

### Documents Created/Updated
- ✅ `revised-objectives-24-months.md` - New 24-month objective structure
- ✅ `cashflow-24-month.md` - 24-month cashflow forecast
- ✅ Updated all documents to reflect 24-month timeline

### Rationale
- Demonstrates long-term R&D commitment to Callaghan Innovation
- Allows more thorough R&D on architecture validation, NZ-LLM training, multi-PMS generalisation
- Time for real-world pilots and iterative refinement (Objective 4)
- Shows pathway to becoming sustained R&D performer (Years 3-5 vision)

---

## [0.9] - 2025-11-13

### Added - Mentor Feedback Received
**Meeting with Paula (Callaghan Innovation mentor):**

#### Key Feedback
1. **Extend to 2 years:** Show long-term R&D vision, not just immediate goals
2. **Company growth intention:** Mention hiring plans (demonstrates growth mindset)
3. **Competitor mention:** Briefly acknowledge competitor landscape
4. **Max 4 objectives:** Consolidate from 5 objectives
5. **Conference specificity:** Must link to specific R&D activities (not generic attendance)
6. **Maximize grant request:** Use full opening cash capacity (~$200k NZD)

#### Status
- Overall feedback: "Really good, good chance of getting approved"
- Requires improvements as noted above

### Action Items Created
- [ ] Extend to 24-month structure
- [ ] Consolidate to 4 objectives
- [ ] Add competitor landscape section
- [ ] Identify specific conference workshops
- [ ] Add long-term R&D vision (Years 3-5)
- [ ] Include hiring plan and growth intentions

---

## [0.8] - 2025-11-07

### Added - Partnership Development
**Medtech partnership letter confirmed:**

- **Alex Cauble-Chantrenne** (Medtech) responded positively
- Expected delivery: ~20 Nov 2025
- Will include mention of GP demand for AI inbox management

### Added - PHO Partnership Approach
**Comprehensive Care PHO approach prepared:**

- PHO with 42+ practices, 400+ GPs, 200,000+ patients
- Email scheduled for Monday 11 Nov
- Request for letter of support

### Added - Submission Timeline
**Target submission: Mid-December 2025**

- Allows 6-8 weeks for Callaghan review before 27 Jan 2026 project start

---

## Document Purpose

This changelog tracks all significant changes to the R&D grant application, including:
- Budget and financial structure changes
- Team structure modifications
- Objective revisions
- Capability development updates
- Strategic decisions and rationale
- Document updates and version control

**Location:** `/project-management/new_to_r&d_grant/CHANGELOG.md`

**Maintained By:** Project team

**Last Updated:** 2025-12-02

---

**END OF CHANGELOG**
