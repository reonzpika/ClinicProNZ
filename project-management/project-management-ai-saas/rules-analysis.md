# Rules Analysis - Project Management System

**Date**: 2025-11-08  
**Purpose**: Document which rules are always applied vs referenced, and how they interconnect

---

## Always Applied Rules (`alwaysApply: true`)

### 1. `current-task.mdc` ✅ ALWAYS APPLIED
- **Purpose**: Dispatcher and working guide for session task management
- **Key Content**:
  - Core dispatcher principles
  - Working loop (7 steps)
  - References: `.cursor/rules/ai-character.mdc` and `.cursor/rules/master_rule.mdc`
- **Role**: Entry point - tells AI to read other rules

### 2. `system-context.mdc` ✅ ALWAYS APPLIED
- **Purpose**: System overview and context
- **Key Content**:
  - System structure overview
  - References to other rule files
  - Technical rules coexistence note
- **Role**: Provides context about the system structure

---

## Referenced Rules (`alwaysApply: false`)

### 1. `master_rule.mdc` ❌ NOT ALWAYS APPLIED (but referenced)
- **Purpose**: Comprehensive governance for multi-project management
- **When Used**: 
  - Referenced by `current-task.mdc` (step 2 in working loop)
  - Referenced by `system-context.mdc`
  - Should be read at task start per `current-task.mdc`
- **Key Content**:
  - PROJECT_SUMMARY.md requirements
  - Document creation timing rules
  - Dashboard synchronization
  - Template selection
  - Operational loop

### 2. `ai-character.mdc` ❌ NOT ALWAYS APPLIED (but referenced)
- **Purpose**: Advisor role, communication style, user intent understanding
- **When Used**:
  - Referenced by `current-task.mdc` (step 1 in working loop)
  - Referenced by `master_rule.mdc` (3 times)
  - Referenced by `system-context.mdc`
  - Should be read at task start/end per `current-task.mdc`
- **Key Content**:
  - Brutally honest advisor persona
  - Analysis paralysis recognition
  - User intent understanding
  - NZ English localization

### 3. `debugging-strategy.mdc` ❌ NOT ALWAYS APPLIED (but referenced)
- **Purpose**: Disciplined error handling
- **When Used**:
  - Referenced by `system-context.mdc`
  - Should be used "when a user presents any kinds of errors"
- **Key Content**: Debugging approach for technical errors

---

## Rule Reference Chain

```
current-task.mdc (ALWAYS APPLIED)
  ├─> Step 1: Read ai-character.mdc
  ├─> Step 2: Read master_rule.mdc
  └─> Step 6: Re-read master_rule.mdc, then ai-character.mdc

system-context.mdc (ALWAYS APPLIED)
  ├─> References: current-task.mdc (operational workflow)
  ├─> References: master_rule.mdc (detailed policies)
  ├─> References: ai-character.mdc (character guidelines)
  └─> References: debugging-strategy.mdc (technical debugging)

master_rule.mdc (REFERENCED)
  ├─> References: ai-character.mdc (3 times for user intent)
  └─> Self-contained governance rules

ai-character.mdc (REFERENCED)
  └─> Self-contained character/communication rules

debugging-strategy.mdc (REFERENCED)
  └─> Self-contained debugging rules
```

---

## Current Behavior

**Always Applied**:
1. `current-task.mdc` - Dispatcher that tells AI to read other rules
2. `system-context.mdc` - System overview

**Loaded on Demand** (via references):
1. `master_rule.mdc` - Loaded by current-task.mdc step 2
2. `ai-character.mdc` - Loaded by current-task.mdc step 1
3. `debugging-strategy.mdc` - Loaded when errors occur

---

## Potential Issues

1. **`master_rule.mdc` is critical but not always applied**
   - Contains Document Creation Timing rule (critical for preventing interim docs)
   - Contains PROJECT_SUMMARY.md requirements
   - Currently relies on `current-task.mdc` to load it
   - If current-task.mdc isn't followed, master_rule might be missed

2. **`ai-character.mdc` is critical but not always applied**
   - Contains communication style and user intent understanding
   - Currently relies on `current-task.mdc` to load it
   - If current-task.mdc isn't followed, character guidelines might be missed

3. **Rule loading depends on following `current-task.mdc` workflow**
   - If AI doesn't follow the 7-step loop, critical rules might not load
   - No guarantee that master_rule or ai-character are actually read

---

## Recommendations

**Option 1: Make critical rules always applied**
- Set `master_rule.mdc` to `alwaysApply: true`
- Set `ai-character.mdc` to `alwaysApply: true`
- Ensures critical rules are always loaded

**Option 2: Keep current structure but strengthen references**
- Keep `master_rule.mdc` and `ai-character.mdc` as referenced
- Ensure `current-task.mdc` workflow is strictly followed
- Add validation that rules were actually read

**Option 3: Hybrid approach**
- Make `master_rule.mdc` always applied (most critical)
- Keep `ai-character.mdc` as referenced (loaded by current-task)
- Keep `debugging-strategy.mdc` as referenced (on-demand)

---

## Impact on SaaS Product

**Current System Behavior**:
- Rules are loaded conditionally based on workflow
- Critical rules might be missed if workflow isn't followed
- Document Creation Timing rule might not apply if master_rule isn't loaded

**SaaS Product Implications**:
- Need to ensure critical rules/policies are always enforced
- Consider making core governance rules always active
- Allow optional/on-demand rules to be loaded as needed
- Provide rule loading audit/logging

---

*Analysis completed: 2025-11-08*
