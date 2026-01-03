# Cursor AI Rules System

**Version**: 6.1.0 (Todo Integration for Memory Persistence)  
**Last Updated**: 2026-01-02  
**Architecture**: 4 always-loaded files + embedded navigation

---

## What Changed in v6.1

**Change from v6.0**: Added `session-workflow.mdc` as always-loaded with integrated todo system for persistent memory.

**Why**: 
- AI forgets critical final steps (documentation, build verification, weekly log) after long coding sessions
- Rules get buried in long context (200+ messages) but incomplete todos remain visible
- Uses todo system as persistent checklist that AI cannot ignore

**How it works**:
- When AI enters DOING mode (writes/modifies code), todos are automatically created
- Final 3 todos ALWAYS added: (1) Build/test/fix errors, (2) Update documentation, (3) Update weekly log
- AI cannot mark work "done" with pending todos
- Incomplete todos remain visible throughout session as memory mechanism

**Impact**: 
- ✅ Quality control steps never skipped, even in 200+ message threads
- ✅ Documentation always completed
- ✅ Build verification mandatory before finishing
- ✅ Weekly log tracking automated
- ✅ Visual progress tracking throughout work session

---

## What Changed in v6.0

**Change from v5.0**: Added Part 2 (Documentation Rules) to `project-work-rules.mdc`.

**Why**: 
- Prevent AI from creating unnecessary files (consolidation over proliferation)
- Enforce referencing new files in main docs (AI context awareness)
- Clarify when to update documentation (major milestones only, not every small change)

**Impact**: 
- ✅ Fewer scattered files, more consolidated documentation
- ✅ All new files guaranteed to be referenced in PROJECT_SUMMARY.md or FEATURE_OVERVIEW.md
- ✅ No session summaries or temporary files
- ✅ Documentation updates only when appropriate (not after every change)

---

## What Changed in v5.0

**Change from v4.0**: Moved `project-work-rules.mdc` from context-loaded (via glob pattern) to always-loaded.

**Why**: Core workflow rules (discuss → approve → implement → update) should be consistently available across all interactions. The file is lightweight and contains essential patterns that apply to all project work.

**Impact**: 
- ✅ More consistent behavior across all interactions
- ✅ No need to wait for PROJECT_SUMMARY.md to open
- ✅ Simplified architecture (3 always-loaded files instead of 2 + conditional loading)

---

## What Changed in v4.0

**Problem in v3.x**: 15 files, 1,200+ lines always-loaded, AI overwhelmed with competing instructions, would bypass "read overview first" checkpoint.

**Solution in v4.0**: Radical simplification with hard-gated multi-level system.

---

## System Architecture

### Level 0: The Gate (Always-Loaded)

**File**: `mandatory-overview-first.mdc` (~50 lines, ~250 tokens)

**Purpose**: Single instruction - read PROJECTS_OVERVIEW.md before anything else.

**Why it works**: So simple AI can't misinterpret. No competing instructions, no escape hatches.

---

### Level 1: Navigation (Embedded in Overview)

**File**: `/project-management/PROJECTS_OVERVIEW.md`

**Contains**:
1. **YAML keyword registry** - Maps keywords to project folders
2. **AI Navigation Instructions** - What to do after reading overview:
   - Match query to project via keywords
   - Load that project's PROJECT_SUMMARY.md
   - Handle new projects, general queries, ambiguous requests

**Why embedded**: Instructions are IN the file AI must read. Can't skip navigation logic.

---

### Level 2: Work & Documentation Rules (Always-Loaded)

**File**: `project-work-rules.mdc` (~140 lines, ~700 tokens)

**Loads when**: Always (alwaysApply: true)

**Contains**:
- **Part 1**: Work workflow (discuss → approve → implement → update when appropriate)
- **Part 2**: Documentation rules (consolidation first, new file requirements, AI context awareness)
- **Validation checklist**
- **Writing style guidelines** (no em dashes)

**Why always-loaded**: Core workflow and documentation patterns should be available at all times to ensure consistent behavior and prevent file proliferation.

---

### Level 3: Session Workflow & Todo System (Always-Loaded)

**File**: `session-workflow.mdc` (~500 lines, ~2,500 tokens)

**Loads when**: Always (alwaysApply: true)

**Contains**:
- **Session initialization**: Briefing format, common actions
- **Mode detection**: THINKING, DOING, REVIEWING modes with patterns
- **Todo list integration**: Automatic todo creation, mandatory final 3 todos, progress tracking
- **Universal work pattern**: THINKING → DOING → REVIEWING flow
- **Session ending checklist**: Incomplete todo detection

**Why always-loaded**: 
- Prevents AI from forgetting critical steps after long sessions
- Uses todo visibility as persistent memory mechanism
- Ensures quality control steps never skipped (build/docs/log)
- Rules can be buried in long context, but incomplete todos remain visible

**Key Innovation**: 
- When AI enters DOING mode, todos automatically created
- Final 3 todos ALWAYS added: Build/test/fix, Update docs, Update weekly log
- AI cannot mark work "done" with pending todos
- Works even in 200+ message conversations

---

## Token Efficiency

| Version | Always-Loaded | Context-Loaded | Total |
|---------|---------------|----------------|-------|
| v3.1 | ~1,200 lines (~6,000 tokens) | ~500 lines | ~1,700 lines |
| v4.0 | ~50 lines (~250 tokens) | ~800 lines | ~850 lines |
| v5.0 | ~120 lines (~600 tokens) | ~0 lines | ~120 lines |
| v6.0 | ~190 lines (~950 tokens) | ~0 lines | ~190 lines |
| v6.1 | ~690 lines (~3,450 tokens) | ~0 lines | ~690 lines |

**v6.1 changes**: Added session-workflow.mdc (~500 lines) with todo integration for persistent memory. Trade-off: Higher token cost but ensures critical steps never forgotten in long sessions.

---

## How It Works

### Example 1: Project Query

```
User: "I want to work on medtech"

AI Process:
1. Reads mandatory-overview-first.mdc → "Read overview"
2. Reads PROJECTS_OVERVIEW.md
3. Sees navigation instructions
4. Checks keyword registry: "medtech" → medtech-integration folder
5. Reads /project-management/medtech-integration/PROJECT_SUMMARY.md
6. Opening PROJECT_SUMMARY.md triggers glob → project-work-rules.mdc loads
7. Now has full context + all work rules
8. Follows workflow: Discuss → Approve → Implement → Update
```

### Example 2: General Query

```
User: "What's 2+2?"

AI Process:
1. Reads mandatory-overview-first.mdc → "Read overview"
2. Reads PROJECTS_OVERVIEW.md
3. Sees navigation instructions: "Not project-related? Answer directly"
4. Responds: "4"
5. Adds: "Not related to your projects, but let me know if you need anything else!"
```

### Example 3: New Project

```
User: "Create new mobile app project"

AI Process:
1. Reads mandatory-overview-first.mdc → "Read overview"
2. Reads PROJECTS_OVERVIEW.md
3. Checks keywords: No match for "mobile app"
4. Navigation says: "Ask if new project"
5. AI asks: "Is this: (A) New project, (B) Related to existing, (C) General?"
6. User: "New project"
7. AI asks details, creates PROJECT_SUMMARY.md, updates overview
```

---

## File Structure

```
.cursor/rules/
├── mandatory-overview-first.mdc (Always-loaded, Level 0)
├── project-work-rules.mdc (Always-loaded, Level 2)
├── session-workflow.mdc (Always-loaded, Level 3) ← NEW in v6.1
├── accountability-system.mdc (Workspace rule, always-loaded)
├── ai-role-and-context.mdc (Workspace rule, always-loaded)
├── library-first-approach.mdc (Workspace rule, always-loaded)
├── fhir-medtech-development.mdc (Technical FHIR rules, on-demand)
└── README.md (This file)

/project-management/
├── PROJECTS_OVERVIEW.md (Contains navigation + keyword registry, Level 1)
├── [project-name]/
│   ├── PROJECT_SUMMARY.md (Required for each project)
│   └── PROJECT_RULES.mdc (Optional project-specific rules)
├── weekly-logs/
│   └── YYYY-WW.md (Weekly accomplishments, decisions, metrics)
└── ...
```

---

## Key Rules

### 1. Overview First (Always)

Before responding to ANY query, AI must read PROJECTS_OVERVIEW.md. No exceptions.

### 2. Navigation is Embedded

All navigation logic lives in the overview file itself:
- Keyword registry (YAML)
- Matching instructions
- What to do for new projects, general queries, ambiguous requests

### 3. Work Rules Always Available

project-work-rules.mdc is always loaded to ensure consistent workflow behavior. The rules are lightweight (~140 lines) and contain essential workflow patterns (discuss → approve → implement → update) that should apply to all interactions.

### 3a. Todo System for Persistent Memory

session-workflow.mdc implements todo-driven workflow to solve the "AI forgets after long sessions" problem:

**How it works**:
1. When AI enters DOING mode (writes/modifies code), todos automatically created
2. Final 3 todos ALWAYS added (in this order):
   - Build, test, and fix all errors
   - Update documentation (PROJECT_SUMMARY.md + PROJECTS_OVERVIEW.md)
   - Update weekly log (if significant milestone)
3. AI updates todo status as progressing (pending → in_progress → completed)
4. AI cannot mark work "done" with pending todos

**Why it works**:
- Rules can be buried in 200+ message context
- Incomplete todos remain visible throughout session
- Acts as persistent checklist AI cannot ignore
- Visual reminder of what still needs doing

**Example todo structure**:
```
1. [First implementation step] - in_progress
2. [Second implementation step] - pending
3. [Third implementation step] - pending
4. Build, test, and fix all errors - pending
5. Update documentation (PROJECT_SUMMARY + PROJECTS_OVERVIEW) - pending
6. Update weekly log (if significant) - pending
```

### 4. Discuss Before Implementing

"Work on X", "improve Y", "fix Z" → Discuss first, get approval, then implement.

"Implement X", "build Y" → Verify scope, then proceed.

### 5. Dashboard Sync is Mandatory

When PROJECT_SUMMARY.md changes, PROJECTS_OVERVIEW.md MUST update:
- Active Projects Index (dates, stage)
- Highlights (achievements, blockers)
- Schedule (upcoming/past events)
- Project Details (summary, status)

### 6. Ad-Hoc Templates

No template files. Generate project structures on-the-fly based on:
- Project stage (Ideation/Validation/Build/Operational)
- Project type (SaaS/marketplace/research/grant)
- Specific needs (discussed with user)

---

## Project-Specific Rules

Projects can have unique rules in `[project-folder]/PROJECT_RULES.mdc`:

**Example**: `medtech-integration/PROJECT_RULES.mdc`
```yaml
---
alwaysApply: false
globs: 
  - "**/medtech-integration/PROJECT_SUMMARY.md"
---

# Medtech Integration Specific Rules

- Always validate FHIR compliance
- Check API rate limits before bulk operations
- Medical data requires extra security validation
```

**When to use**: Only when project has unique requirements not covered by general rules.

---

## Testing the System

### Quick Test

**Test 1**: Project query
- Say: "work on medtech"
- Expected: AI reads overview → matches keyword → loads project summary → discusses (doesn't implement immediately)

**Test 2**: New project
- Say: "create new project for X"
- Expected: AI reads overview → no keyword match → asks if new project → creates after details gathered

**Test 3**: General query
- Say: "what's React hooks?"
- Expected: AI reads overview → determines not project-related → answers briefly → mentions if relevant to projects

**Test 4**: Dashboard sync
- Edit any PROJECT_SUMMARY.md
- Expected: PROJECTS_OVERVIEW.md also updates (index, highlights, schedule, details)

**Test 5**: Todo system
- Say: "build a login form"
- Expected: AI creates todos with final 3 (build/docs/log), updates status as progressing, cannot say "done" until all completed

---

## Success Metrics

**System is working when**:
- ✅ AI always reads overview first (no codebase exploration before context)
- ✅ AI matches queries to projects via keywords accurately
- ✅ AI discusses before implementing code changes
- ✅ Dashboard stays synchronized with project summaries
- ✅ No unnecessary files created during discussions
- ✅ AI creates todos when entering DOING mode
- ✅ AI completes all todos (build/docs/log) before marking done
- ✅ Documentation and weekly logs consistently updated

**System needs tuning when**:
- ❌ AI explores codebase before reading overview
- ❌ AI implements changes without discussion/approval
- ❌ Dashboard gets out of sync with project summaries
- ❌ AI creates test reports or interim docs during exploration
- ❌ AI marks work "done" with pending todos
- ❌ AI skips build verification or documentation updates

---

## Maintenance

### Adding New Project

1. User requests new project
2. AI reads overview (per Level 0 rule)
3. AI asks details: stage, type, needs
4. AI creates folder + PROJECT_SUMMARY.md
5. AI adds to PROJECTS_OVERVIEW.md:
   - Add to project_keywords in YAML
   - Add row to Active Projects Index
   - Add to Project Details section

### Updating Rules

**For general rules**: Edit `project-work-rules.mdc`

**For project-specific rules**: Create/edit `[project-folder]/PROJECT_RULES.mdc`

**For navigation logic**: Edit PROJECTS_OVERVIEW.md navigation instructions section

### Keywords Not Matching

If AI doesn't match query to project:
1. Check PROJECTS_OVERVIEW.md YAML `project_keywords`
2. Add missing keywords to relevant project
3. Save and test

---

## Philosophy

**v4.0 Design Principles**:

1. **Simplicity over completeness** - Fewer rules, clearer behavior
2. **Instructions as data** - Navigation in overview file, not separate rules
3. **Context before rules** - Load rules only when context is loaded
4. **Hard gates over soft reminders** - Make it impossible to bypass, not just discouraged
5. **Trust the overview** - Single source of truth for navigation

---

## Comparison to v3.x

| Aspect | v3.x | v4.0 |
|--------|------|------|
| Always-loaded rules | 9 files, ~1,200 lines | 1 file, ~50 lines |
| Navigation logic | Scattered across multiple files | Embedded in overview |
| Enforcement | Soft (🛑 emojis, "MANDATORY" labels) | Hard (technical gates) |
| Context loading | AI discretion | Forced by system |
| Complexity | High (load order, dependencies) | Low (read overview, that's it) |
| Maintainability | 15 files to manage | 2 core files + overview |

---

## Migration from v3.x

**What was deleted**:
- All `/core/` rules (9 files)
- All `/communication/` rules (5 files)
- All `/project-management/` rules (6 files)
- All `/technical/` rules (1 file)
- All meta-documentation (5 files)
- All template files (10 files)

**What was consolidated**:
- Everything merged into `project-work-rules.mdc`
- Navigation moved to PROJECTS_OVERVIEW.md
- Project registry moved to PROJECTS_OVERVIEW.md YAML

**What survived**:
- `library-first-approach.mdc` (workspace-level rule)
- `fhir-medtech-development.mdc` (technical FHIR rules)

---

## Questions?

The system is now simple enough to understand in one read:
1. Read overview first (mandatory-overview-first.mdc)
2. Follow navigation in overview (PROJECTS_OVERVIEW.md)
3. Apply work rules consistently (project-work-rules.mdc - always loaded)
4. Use todo system for memory persistence (session-workflow.mdc - always loaded)

That's it. No complex dependencies, no load orders, no competing instructions.

---

**Version**: 6.1.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2026-01-02

**Key v6.1 Innovation**: Todo system as persistent memory mechanism. Solves "AI forgets critical steps after long sessions" by making incomplete todos always visible, even when rules get buried in context.

---

*Built for clarity, maintained for simplicity.*
