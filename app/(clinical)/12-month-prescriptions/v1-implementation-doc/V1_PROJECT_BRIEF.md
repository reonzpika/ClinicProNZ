# v1 Project Brief: 12-Month Prescription Tool Launch

**Project:** ClinicPro - 12-Month Prescription Decision Tool  
**Version:** 1.0 (Simplified Launch)  
**Date:** February 2026  
**Status:** Ready for Implementation

---

## What We're Building

**Interactive Decision Checklist** that guides GPs through patient assessment for 12-month prescriptions, with external links to NZF for medication-specific details.

---

## What We're NOT Building (Yet)

- ❌ Traffic Light Medication Checker (RED/AMBER/GREEN zones)
- ❌ Interactive visual flowchart
- ❌ Live NZF data integration
- ❌ Medication search functionality

**Why not?** Launch fast, get feedback, iterate. These features come in v2 after NZF API response.

---

## Core Philosophy

**v1 focuses on PATIENT assessment, not medication database.**

GPs already know how to check medications in NZF. They need help with:
1. Decision framework (controlled drug? stability? equity?)
2. Documentation (what to record)
3. Quick reference (simple medication lists as reminder)

We defer to NZF as the authoritative source for medication monitoring.

---

## User Flow (30 seconds - 2 minutes)

```
GP opens tool
    ↓
Q1: Controlled drug? → YES = STOP / NO = Continue
    ↓
Q2: Checked NZF? → "Yes" or "Skip" (both continue)
    ↓
Q3: Requires <annual monitoring? → YES = Max 3-6mo / NO = Continue
    ↓
Q4: Patient stability? (age, condition, dose) → Stable/Unstable
    ↓
Q5: Choose duration → 3mo / 6mo / 12mo
    ↓
RESULT: Decision summary + Copy to notes button
```

**Key insight:** Most decisions will take 5 questions. Simple, fast, practical.

---

## Success Criteria

**v1 is successful if:**

1. ✅ GPs can make a decision in <2 minutes
2. ✅ Tool respects their clinical judgment (no forced pathways)
3. ✅ Clear what's legal vs guidance vs practice decision
4. ✅ Simple medication guidance visible (not buried)
5. ✅ Copy-pasteable decision summary for notes

**v1 is NOT successful if:**

- Takes >5 minutes to use
- Feels like "checking boxes" without clinical judgment
- GPs confused about whether lists are mandatory
- Medication lists are comprehensive (they're examples only)

---

## Changes to Existing Code

### Files to MODIFY:

1. **`DecisionWizard.tsx`** (major rewrite)
   - New Q1-Q5 flow
   - Remove all zone references
   - Simplify result calculation
   - Keep "Copy Summary" functionality

2. **`page.tsx`** (moderate changes)
   - Remove Quick Start accordion
   - Remove flowchart tab
   - Remove all Traffic Light modal triggers
   - Add simple medication guidance accordion
   - Simplify header

### Files to HIDE (don't delete, just unused):

- `TrafficLightModal.tsx`
- `TrafficLightPanel.tsx`
- `TrafficLightContent.tsx`
- `TrafficLightStructured.tsx`
- `InteractiveFlowchart.tsx`
- `traffic-light-data.ts`
- `traffic-light-types.ts`

### Files to KEEP unchanged:

- `nz-12month-rx-guide.ts` (comprehensive guide)
- `guide/page.tsx` (guide rendering)
- All markdown files in project root

---

## Tech Stack (Unchanged)

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- React hooks (useState)

---

## Timeline

**Week 1:** Implement v1 (this handoff)  
**Week 2:** User testing with 3-5 GPs  
**Week 3:** Iterate based on feedback  
**Week 4:** Launch publicly

Meanwhile: Wait for NZF API response (could be weeks/months)

---

## Post-Launch (v2 Planning)

**If NZF grants API access:**
- Add Traffic Light Checker with live data
- Medication search
- Auto-populate monitoring requirements

**If NZF denies API access:**
- Manual curated medication list (100-200 common meds)
- Monthly updates from team
- OR keep v1 simple approach (link to NZF)

**Based on GP feedback:**
- PHO integration?
- Practice-specific medication lists?
- Audit export functionality?

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| GPs want comprehensive med lists | High | Clear messaging: "Examples only, check NZF" |
| Tool feels incomplete without zones | Medium | Explain v2 roadmap, get feedback |
| Takes too long to use | High | Keep to 5 questions max, no optional fields |
| Legal confusion (must vs should) | High | Use 🔴🟡🟢🔵 markers consistently |

---

## Questions for Post-Launch

1. Do GPs actually use NZF link, or do they want integrated data?
2. Is 5 questions too many? Can we simplify further?
3. Do they copy the summary to notes, or just use as mental checklist?
4. Which medication categories cause most uncertainty?
5. Do they use it during consultation, or as pre-planning tool?

---

## Handoff Checklist

Before handing to Cursor:

- ✅ V1_PROJECT_BRIEF.md (this file)
- ✅ V1_INTERACTIVE_CHECKLIST_SPEC.md (Q1-Q5 detailed)
- ✅ V1_MEDICATION_GUIDANCE_CONTENT.md (simple lists + NZF messaging)
- ✅ V1_CODE_CHANGES.md (step-by-step implementation)

Cursor should be able to implement v1 from these 4 files alone.

---

**Last updated:** February 2026  
**Author:** Ryo
