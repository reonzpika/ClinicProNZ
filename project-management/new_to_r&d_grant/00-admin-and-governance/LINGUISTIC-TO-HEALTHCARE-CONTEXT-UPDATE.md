# Linguistic Focus Removed - Healthcare System Context Enhanced

**Date:** 2 December 2025  
**Status:** ✅ COMPLETE

---

## What Was Changed

Removed Māori linguistic challenges as a technical R&D focus and replaced with **NZ healthcare system context** (which is the real challenge you face as a GP).

**Kept all Te Tiriti/equity content intact** (Māori/Pacific patient prioritization, equity-preserving algorithms).

---

## Changes by Document

### **1. revised-objectives-24-months.md (Objective 1)**

#### **Key R&D Questions:**

**OLD:**
```
Whether domain adaptation suffices for NZ clinical language characteristics, 
or do linguistic properties (bilingual code-switching, Māori medical terminology, 
regional abbreviations) require architectural modifications?
```

**NEW:**
```
Whether domain adaptation suffices for NZ healthcare system context 
(bpac/MoH guidelines, regional lab formats with NZ reference ranges, 
ACC/PHO documentation patterns, local clinical pathways), or do these 
contextual differences require architectural modifications?
```

---

#### **NZ Clinical Corpus Development:**

**OLD:**
```
- Document linguistic characteristics: te reo Māori medical terminology 
  frequency, bilingual code-switching patterns, regional abbreviation 
  variations, guideline-specific phrasing
```

**NEW:**
```
- Document NZ healthcare system characteristics: Regional lab reference 
  ranges (NZ-specific normals), local abbreviations and documentation 
  patterns, NZ guideline-specific clinical pathways, ACC/PHO terminology 
  and workflows
```

---

#### **Use Case 3 (Clinical Note Extraction):**

**OLD:**
```
- Measure: Extraction accuracy on NZ linguistic variations, handling 
  of bilingual text, robustness to abbreviations
- Research question: Whether domain adaptation suffices for NZ language 
  characteristics or architectural modifications necessary?
```

**NEW:**
```
- Measure: Extraction accuracy on NZ healthcare documentation patterns, 
  robustness to local abbreviations, handling of ACC/PHO-specific terminology
- Research question: Whether domain adaptation suffices for NZ healthcare 
  system context or architectural modifications necessary?
```

---

#### **Research Deliverable #2:**

**OLD:**
```
2. NZ Clinical Language Analysis
   - Documented linguistic characteristics affecting architectural performance
   - Bilingual handling patterns: How do paradigms handle Māori terminology 
     and code-switching?
```

**NEW:**
```
2. NZ Healthcare System Context Analysis
   - Documented NZ-specific characteristics affecting architectural performance: 
     bpac/MoH guideline patterns, regional lab format variations, ACC/PHO 
     terminology, local clinical pathway differences
   - Context handling patterns: How do paradigms handle NZ-specific reference 
     ranges, local abbreviations, and regional documentation variations?
```

---

### **2. revised-objectives-24-months.md (Objectives 2-4)**

#### **Objective 2 - Lab-to-Clinic Translation:**

**Changed:**
- "Linguistic variations" → "Documentation variations"
- "Linguistic (abbreviation misunderstanding)" → "Documentation (abbreviation misunderstanding, regional variations)"

#### **Objective 3 - Unstructured Extraction:**

**OLD:**
```
Unstructured Data Extraction Under NZ Linguistic Variation:
Can architectural approaches extract from NZ linguistic characteristics 
(abbreviations, bilingual terminology, contextual phrasing)?
```

**NEW:**
```
Unstructured Data Extraction Under NZ Healthcare Documentation Patterns:
Can architectural approaches extract from NZ healthcare system documentation 
patterns (regional abbreviations, local terminology, contextual phrasing)?
```

#### **Objective 4 - Refinement:**

**Changed:**
- "practice-specific linguistic patterns" → "practice-specific documentation patterns"

---

### **3. forge-application-narrative.md (Q2 - Uncertainty)**

**OLD:**
```
Domain Adaptation Feasibility Under NZ Linguistic and Sovereignty Constraints

Whether domain adaptation suffices for NZ clinical language characteristics 
(Māori code-switching in clinical notes, regional abbreviations, bilingual 
terminology)...
```

**NEW:**
```
Domain Adaptation Feasibility Under NZ Healthcare System Context and Sovereignty Constraints

Whether domain adaptation suffices for NZ healthcare system characteristics 
(bpac/MoH guidelines, regional lab formats with NZ-specific reference ranges, 
ACC/PHO documentation patterns, local clinical pathways)...
```

---

## What Was KEPT (All Equity/Te Tiriti Content)

✅ **Māori/Pacific equity prioritization** (Objective 3, throughout)  
✅ **Equity-preserving algorithms** (Q5 in forge-application-narrative.md)  
✅ **Te Tiriti-compliant AI design principles**  
✅ **Māori/Pacific screening rate improvements** (success metrics)  
✅ **High Māori practices vs low Māori practices comparison** (Objective 4)  
✅ **Equity outcome validation at scale**  

**One Note - Future Vision Section (Years 3-5):**
- Line 643 mentions "te reo speaker" as one example of health literacy levels
- **Context:** This is about patient-facing communication (18-year-old vs 75-year-old vs te reo speaker)
- **Decision:** KEPT as is because it's about patient communication preferences, not technical linguistic challenges
- **Location:** Future HealthHub NZ vision (Years 3-5), not core 24-month project

---

## Why This Is Better

### **Before:**
- Emphasized bilingual linguistic challenges (not your real problem)
- Could seem like virtue signaling
- Assessors might question if it's a real technical challenge

### **After:**
- Emphasizes NZ healthcare system context (your actual daily challenge)
- Specific: bpac guidelines, LabTests/SCL/Medlab formats, ACC documentation
- Genuine uncertainty: International models trained on US/UK healthcare won't know NZ system
- More defensible: You live this problem every day as a GP

---

## Assessment Impact

**Callaghan Assessor Reaction:**

**Before:** *"Are Māori medical terms really a significant technical challenge in GP notes?"*

**After:** *"Of course NZ healthcare system context is different from international models. bpac vs UpToDate, NZ lab reference ranges, ACC vs workers comp documentation. This is genuine domain adaptation uncertainty."*

**Result:** ✅ **More credible, more honest, stronger R&D justification**

---

## Files Updated

1. ✅ `/workspace/project-management/new_to_r&d_grant/00-admin-and-governance/revised-objectives-24-months.md`
   - Objective 1: 6 updates
   - Objectives 2-4: 5 updates
   - Overview: 1 update

2. ✅ `/workspace/project-management/new_to_r&d_grant/01-application-narrative/forge-application-narrative.md`
   - Q2 Uncertainty: 1 major update

**Total changes:** 13 linguistic references replaced with healthcare system context

---

## What You Should Review

**One item for your decision:**

**Years 3-5 Patient-Facing Vision (line 643):**
> "How do you train NZ-LLM to communicate medical information safely across different health literacy levels (18-year-old vs 75-year-old vs te reo speaker)?"

**Current status:** KEPT  
**Rationale:** This is about patient communication preferences/health literacy, not technical linguistic challenges in GP-facing tools

**Do you want to:**
1. **Keep as is** (it's patient communication, seems reasonable)
2. **Remove "vs te reo speaker"** (just say "different health literacy levels and communication preferences")
3. **Something else?**

Let me know if this needs adjustment!

---

**Document Created:** 2 December 2025  
**Status:** Complete, ready for your review  
**Next:** Update CHANGELOG and version bump
