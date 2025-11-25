# Feature Grouping Decisions - R&D Grant

**Date:** 23 Nov 2025  
**Status:** Finalized (Session 1)  
**Purpose:** Document decisions on which AI features to include and how to group them into 3 objectives

---

## **Finalized Feature List (10 Features)**

### **Changes from Initial Draft:**

**Added:**
- CVDRA as standalone feature (#3) - was previously part of Lab Result Interpretation

**Modified:**
1. **Inbox Management & Triage** - Removed smart routing, removed batch processing
2. **Lab Result Interpretation** - Explicitly scoped to 3 high-yield labs initially (lipids, HbA1c, renal), future expansion to TFT, iron studies, LFTs
3. **National Screening Programme Management** - Added "Normal Screening Result Auto-Filing & Recall" for cervical/breast/bowel screening (NOT general lab results)
4. **ACC** - Refocused on **unclaimed revenue identification** (finding ACC-claimable consults/treatments not coded as ACC)
5. **Clinical Guideline Assistant** → **NZ Medical Answer Engine** - Complete redesign inspired by medlo.com.au, integrated medical Q&A within Medtech

**Removed:**
- Patient Communication Tools - Entire feature removed
- Smart routing to appropriate GP - Removed from inbox management
- Batch processing - Removed from inbox management

---

## **Final 10 Features**

1. **Inbox Management & Triage**
2. **Lab Result Interpretation** (3 high-yield labs: lipids, HbA1c, renal)
3. **CVDRA Auto-Calculation + Recall** (standalone feature)
4. **Care Gap Monitoring**
5. **National Screening Programme Management** (cervical, breast, bowel + auto-filing normal screening results)
6. **Referral & Letter Management**
7. **Prescription & Medication Intelligence** (safety-critical)
8. **ACC & Unclaimed Revenue Identification**
9. **NZ Medical Answer Engine** (medical Q&A, guideline synthesis)
10. **Clinical AI Dashboard** (alert prioritization, adaptive learning, workflow integration)

---

## **Grouping into 3 Objectives**

### **Objective 2: Inbox & Admin Automation (Low Complexity / Low Risk)**
**Timeline:** Months 6-14

**Features:**
1. Inbox Management & Triage
2. Referral & Letter Management
3. Lab Result Interpretation (3 high-yield labs)
4. National Screening Programme Management (with auto-filing)

**Rationale:**
- All inbox-related features (GPs spend 2-3 hours/day on inbox)
- Low clinical risk (classification, extraction, filing normal results)
- High ROI (immediate time savings)
- Simple architectures (classifiers, rule-based, simple LLMs)
- Significant inbox workload reduction

---

### **Objective 3: Clinical Intelligence & Proactive Care (Medium Complexity / Medium Risk)**
**Timeline:** Months 12-20

**Features:**
1. CVDRA Auto-Calculation + Recall
2. Care Gap Monitoring
3. ACC & Unclaimed Revenue Identification

**Rationale:**
- Proactive (not reactive to inbox)
- Medium risk (clinical interpretation, but GP makes final decisions)
- Requires temporal logic (recalls, monitoring intervals)
- Requires clinical reasoning (care gaps, CVDRA parameters, injury context extraction)
- Revenue optimization (care gaps improve PHO metrics, ACC finds unclaimed revenue)

---

### **Objective 4: Clinical Decision Support & Medical Intelligence (High Complexity / High Risk)**
**Timeline:** Months 18-24

**Features:**
1. Prescription & Medication Intelligence (safety-critical)
2. NZ Medical Answer Engine (complex medical reasoning)
3. Clinical AI Dashboard (integrates all features, adaptive learning)

**Rationale:**
- High-stakes features (prescriptions = safety-critical)
- Complex reasoning (medical Q&A, multi-step logic)
- Requires multi-layer validation (prescription errors must be caught)
- Dashboard builds on all previous features (O2+O3 outputs feed into dashboard)
- Medical Answer Engine validates quality of underlying clinical LLM
- Includes pilot + production readiness

---

## **Objective Distribution Summary**

| Objective | Features | Complexity | Risk | Timeline |
|-----------|----------|------------|------|----------|
| O1 | 0 (foundation only) | - | - | M1-8 |
| O2 | 4 features | Low | Low | M6-14 |
| O3 | 3 features | Medium | Medium | M12-20 |
| O4 | 3 features | High | High | M18-24 |

**Total:** 10 features across 3 objectives (O1 is foundation/architecture only)

---

## **Key Design Principles Used**

1. **Progression by complexity:** Low → Medium → High
2. **Progression by risk:** Admin → Clinical interpretation → Safety-critical
3. **Logical workflow grouping:** Inbox-focused → Proactive care → Decision support
4. **Balanced workload:** 4-3-3 feature distribution
5. **Overlapping timelines:** O2+O3 overlap (M12-14), O3+O4 overlap (M18-20) for continuous development

---

## **Next Steps**

1. ✅ Feature list finalized (10 features)
2. ✅ Grouping into 3 objectives decided
3. ⏳ Update revised-objectives-24-months.md with final feature groupings
4. ⏳ Ensure each objective's narrative aligns with final feature list
5. ⏳ Update budget allocations per objective
6. ⏳ Verify all R&D uncertainties still relevant to finalized features

---

**Document Owner:** Founder  
**Last Updated:** 23 Nov 2025  
**Next Review:** After updating revised-objectives-24-months.md
