# Cursor AI Rules System

**Version**: 3.1.0 (Autonomous + Enforced + After-Completion)  
**Last Updated**: 2025-11-10  
**Architecture**: 15 modular files, conversation-driven, updates after completion, strict enforcement

---

## 📁 Directory Structure

```
.cursor/rules/
├── core/                    [Always Loaded - Autonomous]
│   ├── system-context.mdc
│   ├── current-task.mdc (conversation-driven workflow)
│   ├── document-creation.mdc
│   ├── autonomous-updates.mdc ⭐ NEW - Conversational triggers
│   ├── communication-style.mdc
│   ├── nz-localization.mdc
│   └── user-intent-understanding.mdc
│
├── communication/           [Mixed]
│   ├── advisory-role.mdc ⭐ NOW ALWAYS LOADED
│   └── analysis-paralysis-detection.mdc [On-Demand]
│
├── project-management/      [Mixed]
│   ├── core-principles.mdc ⭐ NOW ALWAYS LOADED (project registry + context priority)
│   ├── project-summary-rules.mdc
│   ├── dashboard-sync-rules.mdc
│   ├── template-system-rules.mdc
│   ├── metadata-rules.mdc
│   └── project-creation-workflow.mdc
│
└── technical/               [File-Scoped]
    └── debugging-strategy.mdc
```

---

## 🎯 Quick Reference

### When Rules Load

**Always (Every Session - Enforced Core)**:
- `core/system-context.mdc`
- `core/user-intent-understanding.mdc` ⭐ Vague query detection + DISCUSS vs EXECUTE intent
- `core/current-task.mdc` (conversation-driven workflow with 🛑 STOP enforcement)
- `communication/advisory-role.mdc` ⭐ NOW ALWAYS-LOADED - Discuss-first mindset
- `project-management/core-principles.mdc` ⭐ NOW ALWAYS-LOADED - Project registry + context priority
- `core/document-creation.mdc`
- `core/autonomous-updates.mdc` ⭐ Continuous project updates
- `core/communication-style.mdc`
- `core/nz-localization.mdc`

**When Editing Specific Files**:
- `PROJECT_SUMMARY.md` → `project-summary-rules.mdc`
- `PROJECTS_OVERVIEW.md` → `dashboard-sync-rules.mdc`
- `Templates/*.md` → `template-system-rules.mdc`
- `*.ts, *.tsx, *.py` → `debugging-strategy.mdc`
- `*.md, *.tsx, *.ts` → `nz-localization.mdc`

**When Needed (Workflow)**:
- Procrastination detected → `communication/analysis-paralysis-detection.mdc`

**Note**: advisory-role and user-intent-understanding are now always-loaded (v3.0)

---

## 🔑 Critical Rules

### 1. Intent Detection (DISCUSS vs EXECUTE) ⭐ NEW in v3.0
**Rule**: AI determines if user wants discussion or implementation BEFORE acting.

**DISCUSS-FIRST triggers** (always discuss before implementing):
- "work on", "improve", "enhance", "fix", "look at"
- Any questions
- Default: Unless explicitly told to implement, discuss first

**EXECUTE triggers** (may proceed with implementation):
- "implement [specific thing]", "build [specific thing]"
- Must verify scope is clear

**AI behavior**: Detects intent → Reads project context → Discusses (if DISCUSS-FIRST) or implements (if EXECUTE with clear scope)

### 2. Autonomous Updates (AFTER COMPLETION) ⭐ Updated v3.1
**Rule**: AI updates project documentation AFTER work is complete.

**Two areas**:
- **Project docs** (`/project-management/`): Autonomous updates, no approval needed
- **Codebase**: Discuss → Suggest → Approve → Implement → Update docs

**Update timing**:
- After implementation complete → Update PROJECT_SUMMARY.md
- After plan finalized (even if deferred) → Update PROJECT_SUMMARY.md
- NOT during discussion → Stay in chat

**User never needs to**:
- Say "update the project"
- Manually edit PROJECT_SUMMARY.md
- Think about documentation

### 3. Document Creation Timing (ALWAYS ENFORCED)
**Rule**: Only create files when task is complete OR needs future reference.

**During discussions/planning**: Respond in chat only.

### 4. PROJECT_SUMMARY.md ↔ PROJECTS_OVERVIEW.md Sync (MANDATORY)
**Rule**: When `PROJECT_SUMMARY.md` changes, `PROJECTS_OVERVIEW.md` MUST update in same task.

**Happens automatically in autonomous mode.**

### 5. Document References (CRITICAL)
**Rule**: New files in project directory MUST be referenced in `PROJECT_SUMMARY.md`.

**Why**: AI reads `PROJECT_SUMMARY.md` first. Unreferenced files = missed in future.

---

## 🚀 Common Tasks

### Create New Project
```
AI follows project-creation-workflow.mdc:
1. Gather details
2. Create directory (kebab-case)
3. Create PROJECT_SUMMARY.md IMMEDIATELY
4. Select template
5. Create folders
6. Update PROJECTS_OVERVIEW.md
```

### Update Project
```
AI follows validation checklist:
1. Update PROJECT_SUMMARY.md
2. Update PROJECTS_OVERVIEW.md (mandatory sync)
3. Bump version
4. Update last_updated
5. Reference any new files
```

### Get Advisory Feedback
```
Ask for feedback on decisions
→ advisory-role.mdc loads
→ Brutal honesty, challenges assumptions
→ Action bias (build over plan)
```

---

## 📊 Stats

| Metric | Value |
|--------|-------|
| Total Files | 15 |
| Total Lines | ~1,700 |
| Always-Loaded (Enforced Core) | ~1,200 lines (~6,000 tokens) |
| Context-Aware | Remaining lines (load on-demand) |
| System Mode | Conversation-Driven (Autonomous + Enforced) |

**v3.0 Changes**: Added 2 rules to always-loaded (advisory-role, core-principles) + strengthened enforcement with 🛑 STOP points and intent detection. Token cost increased by ~1,800 tokens but eliminates AI discretion and ensures correct behavior.

**v3.1 Changes**: Changed autonomous updates from "during conversation" to "after completion". Code workflow: Discuss → Suggest → Approve → Implement → Update docs. Plans documented even if deferred. Explicit doc override phrases added.

---

## 🧪 Testing

**Quick Smoke Test**:
```
1. Ask: "What system am I in?"
   → Should know project management structure

2. Ask: "I want to work on medtech integration improvements"
   → Should read PROJECTS_OVERVIEW.md + PROJECT_SUMMARY.md FIRST
   → Should DISCUSS (not implement): "What specific problems?" "What needs improving?"
   → Should NOT explore codebase or make changes without explicit approval

3. Ask: "What do you think about X?"
   → Should respond in chat (not create file)

4. Update PROJECT_SUMMARY.md
   → Should also update PROJECTS_OVERVIEW.md

5. Ask: "Implement drag-and-drop in medtech widget"
   → Should read project context first
   → Should proceed with implementation (EXECUTE trigger with clear scope)

6. Create new project
   → Should follow complete workflow
```

**Full Test Plan**: See `TEST_PLAN.md`

---

## 🔧 Maintenance

### Adding New Rules
1. Create file in appropriate folder
2. Add YAML frontmatter with `alwaysApply` and `globs`
3. Set `version` and `last_updated`
4. Declare `dependencies` if needed
5. Test loading behavior

### Modifying Existing Rules
1. Update file content
2. Bump `version` (patch/minor/major)
3. Update `last_updated`
4. Test for regressions
5. Update dependencies if hierarchy changes

### Disabling Rules
```yaml
# Temporarily disable
alwaysApply: false
globs: []  # Remove auto-loading

# Or move to /disabled/ folder
```

---

## 📝 YAML Frontmatter Template

```yaml
---
description: "Brief description of what this rule does"
alwaysApply: false  # true = always loaded, false = on-demand
globs: 
  - "**/*.ts"  # Auto-load when editing these files
  - "**/*.tsx"
version: "1.0.0"  # Semantic versioning
last_updated: "2025-11-09"  # ISO 8601 date
dependencies:  # Optional: other rules this depends on
  - "path/to/other-rule.mdc"
priority: CRITICAL  # Optional: HIGH, MEDIUM, LOW
---
```

---

## 🐛 Troubleshooting

### Rule Not Loading
1. Check `alwaysApply` setting
2. Check `globs` pattern matches file
3. Verify YAML frontmatter is valid
4. Check Cursor console for errors

### Rules Conflicting
1. Check for circular dependencies
2. Verify hierarchy (core → domain → data)
3. Check if multiple rules claim same responsibility

### Token Limits Hit
1. Check which rules are always-loaded
2. Move non-critical rules to on-demand
3. Use more specific globs for auto-loading

---

## 📚 Documentation

- **MIGRATION_SUMMARY.md**: What changed, why, and how
- **TEST_PLAN.md**: Comprehensive testing checklist
- **README.md**: This file - quick reference

---

## 🎓 Best Practices

1. **Always-Load Only Essentials**: Keep always-loaded rules minimal (<200 lines total)
2. **Use File-Scoped Globs**: Auto-load rules when editing specific files
3. **Single Responsibility**: One concern per file
4. **No Circular Refs**: Clear hierarchy (core → domain → data)
5. **Version Everything**: Track changes with semver
6. **Test After Changes**: Run smoke test minimum

---

## 🏆 Success Metrics

**System is working well if**:
- ✅ Token usage is efficient (only relevant rules loaded)
- ✅ Rules auto-load without manual prompting
- ✅ Validation checklists catch errors
- ✅ No circular loading issues
- ✅ Easy to maintain and update
- ✅ Clear which rule governs which behavior

---

## 💡 For Your SaaS Product

This rule system is a **working prototype** for your Project Management AI SaaS:

1. **Modular Architecture** → Feature modules in SaaS
2. **Context-Aware Loading** → Smart UI based on user context
3. **File-Scoped Triggers** → Workflow automation
4. **Validation Checklists** → User guidance/onboarding
5. **Rule Hierarchy** → System architecture

**You're dogfooding your product right now.** Learn from what works/doesn't work.

---

## 📞 Support

**Questions?** 
1. Check MIGRATION_SUMMARY.md for detailed explanation
2. Check TEST_PLAN.md for testing guidance
3. Review specific rule file (they're well-documented)
4. Ask in next Cursor session

**Issues?**
1. Check Cursor console for errors
2. Verify YAML frontmatter is valid
3. Run smoke test to isolate issue
4. Rollback if critical (see MIGRATION_SUMMARY.md)

---

**Version**: 3.1.0  
**Status**: ✅ Production Ready  
**Last Validated**: 2025-11-10

---

*Built with ❤️ by a brutally honest AI advisor who practices what it preaches.*
