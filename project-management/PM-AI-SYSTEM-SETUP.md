---
created: "2026-01-01"
status: "Active"
version: "1.0.0"
---

# PM AI System Setup - Complete

## What Was Built

A complete Project Management AI assistant system integrated into Cursor AI.

**Purpose**: Help solo founder manage multiple projects, stay focused, prioritize customer work, and generate first revenue in 2026.

---

## System Components

### 1. AI Rules (Always Loaded)

**Location**: `/workspace/.cursor/rules/`

**Active Rules** (load in this order):
1. **ai-role-and-context.mdc** (Priority: CRITICAL, Load order: 0)
   - Defines AI identity (Technical Co-Founder + PM)
   - Contains user context (solo GP founder, 5 projects, pre-revenue)
   - Communication style guidelines
   - Core principles

2. **session-workflow.mdc** (Priority: HIGH, Load order: 1)
   - Session initialization (greeting → briefing)
   - Mode detection (THINKING → DOING → REVIEWING)
   - Universal work pattern
   - Documentation rules (chat first, docs only when decided)

3. **accountability-system.mdc** (Priority: HIGH, Load order: 2)
   - Weekly focus tracking
   - Customer work reminders (30% target)
   - Active project limits (max 2)
   - Metrics awareness
   - Review prompts

4. **library-first-approach.mdc** (Priority: NORMAL, always loaded)
   - Automatic web search before building
   - Searches: npm, GitHub, Stack Overflow, dev.to, Medium
   - Present findings before pseudocode
   - Decision criteria

5. **deep-planning-handoff.mdc** (Priority: HIGH, keyword-triggered)
   - Keywords: "deep planning", "claude planning", "strategic planning session"
   - Generates Claude.ai prompts for deep strategic discussions
   - Validates Claude's recommendations against codebase
   - Routes to implementation or documentation

6. **fhir-medtech-development.mdc** (Optional, loaded for Medtech work)
   - Medtech-specific guidance (unchanged)

**Project-Specific Rules** (not in .cursor/rules):
- Some projects have `PROJECT_RULES.md` in their project folder
- Example: `/project-management/medtech-integration/PROJECT_RULES.md`
- Contains: Hard constraints, workflows, testing requirements, tech stack rules
- AI automatically reads these when working on that project
- PROJECT_SUMMARY.md will indicate if PROJECT_RULES.md exists (see warning at top)

**Deleted Old Rules**:
- ~~mandatory-overview-first.mdc~~ (replaced by ai-role-and-context.mdc)
- ~~project-work-rules.mdc~~ (replaced by session-workflow.mdc)

**New Rule**:
- **deep-planning-handoff.mdc** (keyword-triggered for Claude.ai handoff)

---

### 2. Tracking Files

**CURRENT-WORK.md** - Root-level ops doc (canonical)
- Location: `/project-management/CURRENT-WORK.md`
- Contains: Top priorities, active work queue, recent context, constraints, and quick metrics
- Update: Whenever priorities or blockers change (or when you ask)

**PORTFOLIO.md** - Root-level project navigation (canonical)
- Location: `/project-management/PORTFOLIO.md`
- Contains: One-line status per project and links to each project folder
- Update: When a project’s one-line status materially changes

**Per-project LOG.md** - Progress tracking (canonical)
- Location: `/project-management/[project]/LOG.md`
- Contains: Chronological progress, evidence, decisions, blockers
- Update: When there is a meaningful milestone/blocker/decision (AI should propose and ask for approval)

---

## How It Works

### Opening Cursor (Session Start)

**You say**: "hi"

**AI provides briefing**:
```
Hey, ready to work.

📍 Today: [Today's priority]
📍 Priorities: [Top priorities]
📊 Status: [Key metrics]

━━━ ACTIVE PROJECTS ━━━
1. [Project] (PRIMARY) - [Status]
2. [Project] (SECONDARY) - [Status]
   Other: [Inactive projects]

━━━ COMMON ACTIONS ━━━
• "what should i work on?" - Task recommendation
• "plan today/week" - Planning sessions
• "daily check" / "weekly review" - Progress check
• "check progress" - Metrics tracking

Or just tell me what you want to do.
```

---

### Planning Code (THINKING Mode)

**You say**: "build ALEX POST Media endpoint"

**AI automatically**:
1. Searches npm, GitHub, Stack Overflow, dev.to, Medium
2. Presents findings (libraries, repos, articles)
3. Shows detailed pseudocode plan
4. Ends with: "Proceed with implementation?"

**You say**: "yes"

**AI moves to DOING mode**:
- Writes the code
- Reports completion
- Waits for next instruction

---

### Strategic Discussion (THINKING Mode)

**You say**: "should I build prescription validation feature?"

**AI discusses**:
- Business value questions (have GPs asked? what would they pay?)
- Opportunity cost (vs other features)
- Risk assessment (liability, time, complexity)
- Recommendation with reasoning

**Everything stays in CHAT** (no docs created during discussion)

**At end**: "Should I document this decision?" (only if you want)

---

### Deep Strategic Planning (Claude.ai Handoff)

**You say**: "deep planning mode - should I pivot from ClinicPro to Medtech only?"

**AI generates comprehensive prompt**:
```
━━━ CLAUDE.AI DEEP PLANNING PROMPT ━━━

Copy and paste to claude.ai/new

[Full context: your projects, goals, metrics, tech stack, constraints]
[The specific strategic question]
[What you need from Claude]
```

**You**: *Copy to Claude.ai, discuss deeply (unlimited conversation)*

**Claude.ai**: *Provides detailed strategic analysis and recommendation*

**You** (back in Cursor): *Paste Claude's recommendation*

**AI automatically detects and validates**:
```
Validating Claude's recommendation against codebase...

✅ CONFIRMED: [What's accurate]
⚠️ CLARIFICATION: [What needs adjustment]
❌ INCORRECT: [What conflicts with reality]

This is a [strategic/implementation/both] decision.

Next steps:
1. [Specific action]
2. [Specific action]
3. [Specific action]

Proceed with step 1?
```

**When to use**:
- Strategic decisions (pivot? kill project?)
- Feature prioritization (which 5 features?)
- Business model questions (pricing? GTM?)
- Architecture decisions (high-level patterns)
- Deep problem-solving (why am I stuck?)

**Why this works**:
- Claude.ai: Better for long strategic discussions (no token limits)
- Cursor AI: Better for implementation (has file access, writes code)
- Best of both worlds: Think deeply on Claude, execute in Cursor

---

### Weekly Review (REVIEWING Mode)

**You say**: "weekly review"

**AI prompts**:
1. Did you hit this week's primary priority? (YES/NO + why)
2. How many customer conversations? (number + learnings)
3. Time split: Building vs Customer/Business?
4. Key decisions or blockers?
5. Next week priorities?

**AI asks**: "Should I update CURRENT-WORK.md and add any entries to project LOG.md files?"

**Only updates docs if you approve**

---

### Daily Focus

**You say**: "what should i work on?"

**AI checks**:
1. CURRENT-WORK.md (priorities, queue, blockers, metrics)
2. Active project count (warns if 3+)
3. Customer outreach status (gentle reminder if 0 by Wednesday)
4. Suggests ONE specific task

**Response format**:
```
This week's top priority: [primary priority]
Active projects: [1-2 projects]

Today's recommendation: [ONE specific task]

Customer work: [X/5 contacts this week]
[Reminder if needed]

Ready to proceed?
```

---

## Key Behaviors

### 1. Chat First, Docs Only When Decided

**During discussion**: Everything in chat
**After decision**: AI asks "Should I document this?"
**Only creates docs if you approve**

### 2. Always Plan Code Before Writing

**User**: "build X"
**AI**: *searches for solutions* → *shows plan* → "Proceed?"
**User**: "yes"  
**AI**: *writes code*

**Never codes before plan is approved**

### 3. Customer Work Reminders (Gentle)

**Wednesday**: If 0 customer contacts → "Consider texting [GP] about [feature]?"
**Friday**: If 0 customer contacts → "Week ending, zero contact. Target: 30% customer work."

**Never blocks work** (just reminds)

### 4. Active Project Limits

**Max 2 projects per week**
If you try to work on 3rd → AI warns: "You have 2 active. Add 3rd or pause one?"

**Helps with your challenge**: "handling multiple projects"

### 5. Mode Detection

AI automatically detects:
- **THINKING mode**: Should I? How should I? Plans before building
- **DOING mode**: Execute approved plan (code, fix, document)
- **REVIEWING mode**: Progress checks, metrics, accountability

---

## Next Steps

### 1. Initialize CURRENT-WORK.md

**Do this now** (Sunday evening or Monday morning):
1. Open `/project-management/CURRENT-WORK.md`
2. Set top priorities and active work queue (max 10)
3. Capture blockers and key constraints
4. Update quick metrics if needed

### 2. Start Week 1 Log

**Optional**:
- Ensure each active project has a `LOG.md` entry when something meaningful changes (milestone, blocker, decision).

### 3. Test the System

**Try these commands**:
- "hi" → See briefing
- "what should i work on?" → Get recommendation
- "deep planning mode - [question]" → Generate Claude.ai prompt
- "build [something]" → See search + planning workflow
- "should I build [X]?" → Strategic discussion
- "weekly review" → Review prompts

---

## System Philosophy

**You said you struggle with**:
1. Handling multiple projects → System limits to 2 active
2. Customer outreach uncomfortable → System provides low-bar options and reminders
3. Don't know what to work on → System suggests ONE task based on current priorities
4. Too much building, not enough business → System tracks 70/30 split and reminds

**System responds by**:
- Keeping focus clear (top priorities and a single recommended next task)
- Making customer work feel easier (text = counts as contact)
- Suggesting specific actions (not generic "do customer work")
- Staying in chat for discussions (only docs when decided)
- Acting as technical co-founder (strategic + technical + PM + accountability)

---

## Maintenance

**Weekly** (Sunday/Monday):
- Update CURRENT-WORK.md (new week's priorities and queue)
- Plan customer outreach targets

**Daily** (each morning):
- Update CURRENT-WORK.md if priorities changed
- Ask AI: "what should i work on?"

**Friday** (end of week):
- Run "weekly review" with AI
- Update metrics in CURRENT-WORK.md if needed
- Add entries to relevant project `LOG.md` files (if significant)

**Monthly/Quarterly**:
- Check 2026-ANNUAL-PLANNING.md goals
- Evaluate kill signals (no customers? pivot?)
- Adjust strategy as needed

---

## Tips for Success

1. **Be honest in reviews**: AI can only help if you're honest about progress (or lack of)

2. **Use low-bar customer actions**: Text to GP = customer work (takes 30 seconds)

3. **Priorities matter**: Keep a clear top priority; avoid trying to do everything at once.

4. **Let AI search first**: Don't assume you need to build from scratch

5. **Trust the process**: System designed around your specific challenges

6. **Check PROJECT_RULES.md**: Some projects (like Medtech) have specific constraints; AI reads these automatically

---

## Files Summary

**Rules** (AI behavior):
- `/workspace/.cursor/rules/ai-role-and-context.mdc`
- `/workspace/.cursor/rules/session-workflow.mdc`
- `/workspace/.cursor/rules/accountability-system.mdc`
- `/workspace/.cursor/rules/library-first-approach.mdc`
- `/workspace/.cursor/rules/deep-planning-handoff.mdc` (NEW - Claude.ai integration)
- `/workspace/.cursor/rules/fhir-medtech-development.mdc`

**Tracking** (your data):
- `/workspace/project-management/CURRENT-WORK.md` (priorities and active queue)
- `/workspace/project-management/PORTFOLIO.md` (project list and navigation)
- `/workspace/project-management/2026-ANNUAL-PLANNING.md` (annual goals)
- `/workspace/project-management/[project]/LOG.md` (per-project progress, blockers, and milestones)

**Project-Specific** (when applicable):
- `/workspace/project-management/[project]/PROJECT_RULES.md` (project constraints - if exists)
- Example: Medtech Integration has PROJECT_RULES.md with hard constraints (static IP requirement, FHIR spec compliance, test facility IDs, etc.)

**Result**:
A PM AI system that acts like a technical co-founder who understands your business context, challenges you strategically, plans code properly, and keeps you accountable to your 2026 revenue goals.

---

*System ready to use. Start by updating CURRENT-WORK.md, then say "hi" to AI.*
