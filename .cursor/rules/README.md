# Cursor AI Rules (`.cursor/rules/`)

This folder contains the Cursor rule files that shape how the coding agent works in this repo.

The core goals are:
- Keep work focused and customer-driven (accountability + prioritisation).
- Enforce a consistent workflow (THINKING → approval → DOING; build and quality checks; documentation proposals).
- Keep project management docs low-duplication and easy to rehydrate at the start of a new chat.
- Apply extra constraints automatically when working on Medtech/FHIR integrations.

---

## How rules load

Rules load in two ways:
- **Always-on**: `alwaysApply: true` rules are always in context.
- **Scoped**: rules with `globs:` are applied when you work in matching paths.

---

## Current rule files (source of truth)

### Always-on
- `ai-role-and-context.mdc`
  - Defines the agent’s role (technical co-founder + PM) and communication standards (NZ English; no em dashes).
  - Defines the “read these first” project docs: `project-management/CURRENT-WORK.md`, `project-management/PORTFOLIO.md`.
- `session-workflow.mdc`
  - Mode detection (THINKING, DOING, REVIEWING).
  - Requires approval before implementation when planning features.
  - Uses a todo-driven checklist so build, docs proposals, and logging do not get skipped.
- `accountability-system.mdc`
  - Weekly focus and customer contact tracking; encourages 30% customer/business work.
  - Limits active build projects to 1–2 per week.
- `library-first-approach.mdc`
  - Prefer libraries and proven patterns before building from scratch.
  - If “web search” is unavailable in the runtime, fall back to: `package.json`, existing code patterns, and GitHub (`gh`) lookup.

### Scoped (auto-activates by path)
- `project-management.mdc` (scoped to `project-management/**`)
  - Canonical project docs and strict anti-duplication policy.
  - **Approval-gated** documentation updates (propose first; only edit after approval).
- `project-medtech-integration.mdc` (scoped to `project-management/medtech-integration/**`)
  - Medtech documentation placement rules plus facility IDs and ALEX invariants.
- `fhir-medtech-development.mdc` (scoped to FHIR/Medtech-related code and docs)
  - FHIR R4 and ALEX constraints; recommends using MCP FHIR tools against HAPI for learning/prototyping.
- `deep-planning-handoff.mdc` (keyword-triggered, not always-on)
  - When you explicitly ask for “deep planning”, generates a Claude.ai prompt and then validates the returned recommendations against this repo.

---

## Canonical project documentation (in `/project-management/`)

Root docs:
- `CURRENT-WORK.md`: priorities, active queue, constraints, and metrics.
- `PORTFOLIO.md`: one-line project statuses and navigation pointers.
- `2026-ANNUAL-PLANNING.md`: company goals and kill signals (use for strategic/quarterly work).

Per-project docs (in `/project-management/<project>/`):
- `PROJECT_SUMMARY.md`: current state and the next pick-up point (not chronological).
- `LOG.md`: chronological evidence and decisions.

Legacy docs may exist (deprecated):
- `PROJECTS_OVERVIEW.md` (deprecated; points to `PORTFOLIO.md`)
- `CURRENT-FOCUS.md` (deprecated; points to `CURRENT-WORK.md`)

---

## Updating these rules

When a rule mentions a path, keep it aligned with the real repo layout.

Preferred changes:
- Update scoped globs when folders move (for example, `src/medtech/**` rather than `src/components/medtech/**`).
- Keep process rules in `session-workflow.mdc`, and documentation policy in `project-management.mdc`.

---

## Historical note

Some older internal documentation referenced additional rule files (for example, `mandatory-overview-first.mdc` and `project-work-rules.mdc`). In the current repo state, those files are not present; the active workflow is defined by the files listed above.
