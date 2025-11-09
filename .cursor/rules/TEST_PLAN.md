# Modular Rules System - Test Plan

**Version**: 1.0.0  
**Date**: 2025-11-09  
**Status**: Ready for Testing

---

## Overview

This test plan validates the modular rule system migration from 5 monolithic files to 15 modular, context-aware files.

**Migration Summary**:
- **Old**: 722 lines, 5 files (2 always-loaded, 3 on-demand)
- **New**: ~750 lines, 15 files (3 always-loaded, 12 context-aware)
- **Always-Loaded**: 50 lines → 100 lines (added critical document-creation rule)

---

## Test Categories

### 1. Core Functionality Tests (Always-Loaded Rules)
### 2. Communication Tests (On-Demand Loading)
### 3. Project Management Tests (Context-Aware Loading)
### 4. Technical Tests (File-Scoped Loading)
### 5. Integration Tests (Cross-Rule Behavior)
### 6. Regression Tests (Ensure No Breaking Changes)

---

## 1. CORE FUNCTIONALITY TESTS

### Test 1.1: System Context Loading
**Objective**: Verify system-context.mdc is always loaded

**Steps**:
1. Start new Cursor session
2. Ask: "What system am I in?"
3. Verify AI references `/project-management/PROJECTS_OVERVIEW.md` and `PROJECT_SUMMARY.md`

**Expected Result**: AI should immediately know about the project management system structure without loading additional rules.

**Status**: [ ] Pass [ ] Fail

---

### Test 1.2: Current Task Workflow
**Objective**: Verify current-task.mdc workflow loop executes correctly

**Steps**:
1. Ask: "Create a new project called 'test-project'"
2. Observe if AI follows workflow:
   - Step 1: Reads advisory-role.mdc
   - Step 2: Reads core-principles.mdc
   - Step 3-5: Creates project
   - Step 6-7: Re-reads rules

**Expected Result**: AI should mention reading rules at start/end of task.

**Status**: [ ] Pass [ ] Fail

---

### Test 1.3: Document Creation Timing
**Objective**: Verify CRITICAL document-creation.mdc rule is enforced

**Test Case A - Discussion (Should NOT create file)**:
1. Ask: "What do you think about adding a blog to my project?"
2. Verify AI responds in chat only, does NOT create `blog-ideas.md`

**Test Case B - Final Deliverable (SHOULD create file)**:
1. Say: "I'm done with the blog post, save it"
2. Verify AI creates the file

**Expected Result**: 
- Test Case A: Response in chat only
- Test Case B: File created

**Status**: [ ] Pass [ ] Fail

---

### Test 1.4: Post-Task Validation Checklist
**Objective**: Verify AI uses validation checklist after completing tasks

**Steps**:
1. Update a project's PROJECT_SUMMARY.md
2. Observe if AI mentions validation checklist items
3. Check if PROJECTS_OVERVIEW.md was also updated

**Expected Result**: AI should self-validate using the 5-point checklist.

**Status**: [ ] Pass [ ] Fail

---

## 2. COMMUNICATION TESTS

### Test 2.1: Advisory Role Loading
**Objective**: Verify advisory-role.mdc is loaded when needed

**Steps**:
1. Ask: "Should I pivot my project to a different audience?"
2. Verify AI uses brutal honesty, challenges assumptions
3. Check if AI references user context (solo founder, analysis paralysis)

**Expected Result**: AI should challenge the pivot, ask about validation, use advisory tone.

**Status**: [ ] Pass [ ] Fail

---

### Test 2.2: Communication Style
**Objective**: Verify communication-style.mdc principles are applied

**Steps**:
1. Make a vague request: "Help me with my project"
2. Observe if AI:
   - Challenges vagueness
   - Asks clarifying questions
   - Prioritizes action over analysis

**Expected Result**: AI should call out vagueness, not just accept it.

**Status**: [ ] Pass [ ] Fail

---

### Test 2.3: User Intent Understanding
**Objective**: Verify user-intent-understanding.mdc is used for clarification

**Steps**:
1. Say: "I want to work on marketing"
2. Verify AI:
   - Reads PROJECT_SUMMARY.md for context
   - Checks PROJECTS_OVERVIEW.md for project
   - Asks targeted questions (not generic)

**Expected Result**: AI should gather context before proceeding.

**Status**: [ ] Pass [ ] Fail

---

### Test 2.4: Analysis Paralysis Detection
**Objective**: Verify analysis-paralysis-detection.mdc catches procrastination patterns

**Steps**:
1. Say: "Should I study competitors before building?"
2. Verify AI:
   - Calls it out as procrastination
   - Time-boxes research (15-30 min)
   - Pushes to start building

**Expected Result**: AI should recognize pattern, time-box, push to action.

**Status**: [ ] Pass [ ] Fail

---

### Test 2.5: NZ Localization (File-Scoped)
**Objective**: Verify nz-localization.mdc auto-loads when editing .md/.tsx files

**Steps**:
1. Edit a PROJECT_SUMMARY.md file
2. Add content with American spelling (e.g., "optimize", "behavior")
3. Verify AI corrects to NZ spelling ("optimise", "behaviour")

**Expected Result**: NZ spelling rules should be applied automatically.

**Status**: [ ] Pass [ ] Fail

---

## 3. PROJECT MANAGEMENT TESTS

### Test 3.1: Core Principles Auto-Loading
**Objective**: Verify core-principles.mdc loads when working in /project-management/

**Steps**:
1. Navigate to /project-management/ folder
2. Ask: "What are the critical rules?"
3. Verify AI references the 7 quick reference rules

**Expected Result**: AI should know core principles without explicit prompt.

**Status**: [ ] Pass [ ] Fail

---

### Test 3.2: PROJECT_SUMMARY.md Rules (File-Scoped)
**Objective**: Verify project-summary-rules.mdc auto-loads when editing PROJECT_SUMMARY.md

**Steps**:
1. Open any PROJECT_SUMMARY.md file
2. Make a change (add a section)
3. Verify AI:
   - Updates metadata (last_updated, version)
   - Also updates PROJECTS_OVERVIEW.md
   - Checks document references

**Expected Result**: AI should enforce PROJECT_SUMMARY.md rules automatically.

**Status**: [ ] Pass [ ] Fail

---

### Test 3.3: Dashboard Sync (File-Scoped)
**Objective**: Verify dashboard-sync-rules.mdc auto-loads when editing PROJECTS_OVERVIEW.md

**Steps**:
1. Open PROJECTS_OVERVIEW.md
2. Ask: "When should I update this?"
3. Verify AI references all update triggers

**Expected Result**: AI should know dashboard update triggers.

**Status**: [ ] Pass [ ] Fail

---

### Test 3.4: Template System (File-Scoped)
**Objective**: Verify template-system-rules.mdc auto-loads when working with templates

**Steps**:
1. Navigate to /project-management/Templates/
2. Ask: "How do I create a new template?"
3. Verify AI references template structure standards

**Expected Result**: AI should know template structure, composition strategy.

**Status**: [ ] Pass [ ] Fail

---

### Test 3.5: Metadata Validation
**Objective**: Verify metadata-rules.mdc validates YAML frontmatter

**Steps**:
1. Create new PROJECT_SUMMARY.md with invalid metadata
2. Verify AI:
   - Catches missing required fields
   - Validates project_stage enum
   - Validates version format (semver)
   - Validates last_updated format (ISO 8601)

**Expected Result**: AI should catch all metadata validation errors.

**Status**: [ ] Pass [ ] Fail

---

### Test 3.6: Project Creation Workflow
**Objective**: Verify project-creation-workflow.mdc executes complete workflow

**Steps**:
1. Ask: "Create a new project called 'test-saas-project' for a SaaS idea"
2. Verify AI:
   - Gathers details (stage, product type)
   - Creates directory (kebab-case)
   - Creates PROJECT_SUMMARY.md IMMEDIATELY
   - Selects appropriate template
   - Creates folders based on template
   - Updates PROJECTS_OVERVIEW.md

**Expected Result**: Complete project created following all 7 workflow steps.

**Status**: [ ] Pass [ ] Fail

---

## 4. TECHNICAL TESTS

### Test 4.1: Debugging Strategy (File-Scoped)
**Objective**: Verify debugging-strategy.mdc auto-loads when editing code files

**Steps**:
1. Open a .ts or .tsx file
2. Present an error: "TypeError: Cannot read property 'map' of undefined"
3. Verify AI:
   - Categorizes error type
   - Lists 3-5 hypotheses
   - Recommends lowest-effort diagnostic step
   - Asks before applying fix

**Expected Result**: AI should follow 3-step debug triage process.

**Status**: [ ] Pass [ ] Fail

---

## 5. INTEGRATION TESTS

### Test 5.1: Workflow Loop + Validation
**Objective**: Verify current-task workflow integrates with validation checklist

**Steps**:
1. Complete a full task (e.g., update project)
2. Verify AI:
   - Reads rules at start (steps 1-2)
   - Executes task (steps 3-5)
   - Re-reads rules at end (steps 6-7)
   - Runs validation checklist before completing

**Expected Result**: Complete workflow with validation.

**Status**: [ ] Pass [ ] Fail

---

### Test 5.2: PROJECT_SUMMARY.md ↔ PROJECTS_OVERVIEW.md Sync
**Objective**: Verify mandatory synchronization between files

**Steps**:
1. Update PROJECT_SUMMARY.md metadata (change stage from Validation → Build)
2. Verify PROJECTS_OVERVIEW.md is updated in SAME task:
   - Index table shows new stage
   - Highlights mention stage change
   - Status counts updated
   - Project details updated

**Expected Result**: Both files updated atomically.

**Status**: [ ] Pass [ ] Fail

---

### Test 5.3: Cross-Rule Dependencies
**Objective**: Verify rules reference each other correctly

**Steps**:
1. Create new project (triggers project-creation-workflow.mdc)
2. Verify workflow loads dependencies:
   - template-system-rules.mdc
   - project-summary-rules.mdc
   - dashboard-sync-rules.mdc

**Expected Result**: Dependent rules load automatically.

**Status**: [ ] Pass [ ] Fail

---

### Test 5.4: Communication + Project Management Integration
**Objective**: Verify communication and PM rules work together

**Steps**:
1. Say vaguely: "I want to update my project"
2. Verify AI:
   - Uses user-intent-understanding.mdc (gathers context)
   - Checks PROJECTS_OVERVIEW.md (project selection)
   - Uses core-principles.mdc (determines action)
   - Uses advisory-role.mdc (challenges if needed)

**Expected Result**: Multiple rules coordinate seamlessly.

**Status**: [ ] Pass [ ] Fail

---

## 6. REGRESSION TESTS

### Test 6.1: No Loss of Functionality
**Objective**: Verify all old functionality still works

**Test Old Master Rule Features**:
- [ ] PROJECT_SUMMARY.md is mandatory
- [ ] Dashboard sync is enforced
- [ ] Document creation timing is respected
- [ ] Template selection works
- [ ] Metadata validation works
- [ ] Operational loop executes

**Expected Result**: All features from old master_rule.mdc still work.

**Status**: [ ] Pass [ ] Fail

---

### Test 6.2: No Loss of AI Character
**Objective**: Verify all old AI character behavior preserved

**Test Old AI Character Features**:
- [ ] Brutal honesty advisory role
- [ ] User context understanding
- [ ] Analysis paralysis detection
- [ ] Action bias
- [ ] NZ localization

**Expected Result**: All features from old ai-character.mdc still work.

**Status**: [ ] Pass [ ] Fail

---

### Test 6.3: File-Scoped Globs Work
**Objective**: Verify new glob patterns auto-load rules

**Test Cases**:
- [ ] Edit .ts file → debugging-strategy.mdc loads
- [ ] Edit .md file → nz-localization.mdc loads
- [ ] Edit PROJECT_SUMMARY.md → project-summary-rules.mdc loads
- [ ] Edit PROJECTS_OVERVIEW.md → dashboard-sync-rules.mdc loads
- [ ] Edit Templates/*.md → template-system-rules.mdc loads

**Expected Result**: Rules auto-load based on file type.

**Status**: [ ] Pass [ ] Fail

---

## 7. PERFORMANCE TESTS

### Test 7.1: Token Efficiency
**Objective**: Verify token usage is optimized

**Steps**:
1. Start new session
2. Check which rules are loaded initially
3. Verify only 3 core rules are always-loaded (~100 lines)
4. Verify other rules load only when needed

**Expected Result**: 
- Initial load: ~100 lines (500 tokens)
- Context-aware loading: Only relevant rules

**Status**: [ ] Pass [ ] Fail

---

### Test 7.2: Rule Loading Performance
**Objective**: Verify rules load quickly without errors

**Steps**:
1. Edit different file types rapidly
2. Verify appropriate rules load without delay
3. Check for any error messages about missing rules

**Expected Result**: Fast, error-free rule loading.

**Status**: [ ] Pass [ ] Fail

---

## 8. EDGE CASE TESTS

### Test 8.1: Missing PROJECT_SUMMARY.md
**Objective**: Verify AI creates PROJECT_SUMMARY.md when missing

**Steps**:
1. Create folder without PROJECT_SUMMARY.md
2. Try to work on project
3. Verify AI creates PROJECT_SUMMARY.md immediately

**Expected Result**: AI should create file before proceeding.

**Status**: [ ] Pass [ ] Fail

---

### Test 8.2: Ambiguous Project Selection
**Objective**: Verify project selection decision tree works

**Steps**:
1. Say: "Update my project" (without specifying which)
2. Verify AI:
   - Checks PROJECTS_OVERVIEW.md
   - Lists active projects
   - Asks user to specify

**Expected Result**: AI should handle ambiguity gracefully.

**Status**: [ ] Pass [ ] Fail

---

### Test 8.3: Circular Reference Prevention
**Objective**: Verify no circular rule references cause issues

**Steps**:
1. Trigger workflow that loads multiple rules
2. Monitor for infinite loops or stack overflow
3. Verify rules load in correct hierarchy

**Expected Result**: No circular loading issues.

**Status**: [ ] Pass [ ] Fail

---

## Test Execution Log

### Session 1: [Date]
**Tester**: 
**Tests Run**: 
**Pass Rate**: 
**Issues Found**: 

### Session 2: [Date]
**Tester**: 
**Tests Run**: 
**Pass Rate**: 
**Issues Found**: 

---

## Issue Tracking

| Issue # | Severity | Description | Test # | Status | Resolution |
|---------|----------|-------------|--------|--------|------------|
| 1 | | | | Open/Closed | |
| 2 | | | | Open/Closed | |

**Severity Levels**: Critical | High | Medium | Low

---

## Success Criteria

**System passes testing if**:
- ✅ All Core Functionality tests pass (100%)
- ✅ All Communication tests pass (80%+)
- ✅ All Project Management tests pass (100%)
- ✅ All Technical tests pass (100%)
- ✅ All Integration tests pass (80%+)
- ✅ All Regression tests pass (100%)
- ✅ No critical issues found
- ✅ Token efficiency improved or maintained

---

## Rollback Plan

**If critical issues found**:
1. Stop using new modular rules
2. Restore old files from git history:
   ```bash
   git checkout HEAD~1 .cursor/rules/master_rule.mdc
   git checkout HEAD~1 .cursor/rules/ai-character.mdc
   git checkout HEAD~1 .cursor/rules/current-task.mdc
   ```
3. Document issues in this test plan
4. Fix issues in modular rules
5. Re-test before re-deploying

---

## Post-Migration Checklist

After testing completes:
- [ ] All tests documented
- [ ] Pass rate calculated
- [ ] Issues logged and prioritized
- [ ] Documentation updated (if needed)
- [ ] Team notified of changes
- [ ] Old files confirmed deleted
- [ ] Git commit created with test results
- [ ] Monitor for 1 week for issues

---

## Quick Smoke Test

**For rapid validation**, run this minimal test:

1. **Core**: Ask "What system am I in?" → Should know project management system
2. **Communication**: Ask vague question → Should challenge vagueness
3. **Project Management**: Update PROJECT_SUMMARY.md → Should update PROJECTS_OVERVIEW.md
4. **Technical**: Show code error → Should follow debug triage
5. **Integration**: Create new project → Should follow complete workflow

**If all 5 pass**: System is likely working correctly.

---

## Notes

- Rules are located in `.cursor/rules/` with subdirectories
- Old files deleted: master_rule.mdc, ai-character.mdc, current-task.mdc, system-context.mdc, debugging-strategy.mdc
- New structure: core/, communication/, project-management/, technical/
- 15 total rule files (3 always-loaded, 12 context-aware)

---

**Test Plan Version**: 1.0.0  
**Last Updated**: 2025-11-09  
**Next Review**: After 1 week of usage
