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

**Deleted Old Rules**:
- ~~mandatory-overview-first.mdc~~ (replaced by ai-role-and-context.mdc)
- ~~project-work-rules.mdc~~ (replaced by session-workflow.mdc)

**New Rule**:
- **deep-planning-handoff.mdc** (keyword-triggered for Claude.ai handoff)

---

### 2. Tracking Files

**CURRENT-FOCUS.md** - Single source of truth
- Location: `/project-management/CURRENT-FOCUS.md`
- Contains: This week's ONE big win, active projects (max 2), today's priority, customer outreach targets, quick metrics
- Update: Weekly (Sunday/Monday) + daily priority each morning

**Weekly Logs** - Progress tracking
- Location: `/project-management/weekly-logs/2026-WXX.md`
- Contains: Weekly plan, daily log, customer conversations, decisions, blockers, end-of-week review
- Update: Throughout week + mandatory Friday review

---

## How It Works

### Opening Cursor (Session Start)

**You say**: "hi"

**AI provides briefing**:
```
Hey, ready to work.

📍 Today: [Today's priority]
🎯 Week: [This week's ONE big win]
📊 Status: [Paying clinics | MRR | Features]

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
1. Did you hit this week's ONE big win? (YES/NO + why)
2. How many customer conversations? (number + learnings)
3. Time split: Building vs Customer/Business?
4. Key decisions or blockers?
5. Next week's ONE big win?

**AI asks**: "Should I create weekly log for this?"

**Only creates log if you approve**

---

### Daily Focus

**You say**: "what should i work on?"

**AI checks**:
1. CURRENT-FOCUS.md (this week's big win, today's priority)
2. Active project count (warns if 3+)
3. Customer outreach status (gentle reminder if 0 by Wednesday)
4. Suggests ONE specific task

**Response format**:
```
This week's focus: [ONE big win]
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

### 1. Initialize CURRENT-FOCUS.md

**Do this now** (Sunday evening or Monday morning):
1. Open `/project-management/CURRENT-FOCUS.md`
2. Set this week's ONE big win
3. Define 1-2 active projects
4. List 5 customer outreach targets
5. Set today's priority

### 2. Start Week 1 Log

**Optional but recommended**:
- Open `/project-management/weekly-logs/2026-W01.md`
- Fill in "This Week's Plan" section
- Update daily as you work
- Complete Friday review

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
3. Don't know what to work on → System suggests ONE task based on weekly goal
4. Too much building, not enough business → System tracks 70/30 split and reminds

**System responds by**:
- Keeping focus clear (ONE big win per week)
- Making customer work feel easier (text = counts as contact)
- Suggesting specific actions (not generic "do customer work")
- Staying in chat for discussions (only docs when decided)
- Acting as technical co-founder (strategic + technical + PM + accountability)

---

## Maintenance

**Weekly** (Sunday/Monday):
- Update CURRENT-FOCUS.md (new week's goals)
- Plan customer outreach targets

**Daily** (each morning):
- Update "Today's Priority" in CURRENT-FOCUS.md
- Ask AI: "what should i work on?"

**Friday** (end of week):
- Run "weekly review" with AI
- Update metrics in CURRENT-FOCUS.md
- Create weekly log (if significant decisions made)

**Monthly/Quarterly**:
- Check 2026-ANNUAL-PLANNING.md goals
- Evaluate kill signals (no customers? pivot?)
- Adjust strategy as needed

---

## Tips for Success

1. **Be honest in reviews**: AI can only help if you're honest about progress (or lack of)

2. **Use low-bar customer actions**: Text to GP = customer work (takes 30 seconds)

3. **ONE big win per week**: Resist urge to do everything; focus compounds

4. **Let AI search first**: Don't assume you need to build from scratch

5. **Trust the process**: System designed around your specific challenges

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
- `/workspace/project-management/CURRENT-FOCUS.md` (single source of truth)
- `/workspace/project-management/weekly-logs/` (progress logs)
- `/workspace/project-management/2026-ANNUAL-PLANNING.md` (annual goals)
- `/workspace/project-management/PROJECTS_OVERVIEW.md` (all projects)

**Result**:
A PM AI system that acts like a technical co-founder who understands your business context, challenges you strategically, plans code properly, and keeps you accountable to your 2026 revenue goals.

---

*System ready to use. Start by initializing CURRENT-FOCUS.md, then say "hi" to AI.*
