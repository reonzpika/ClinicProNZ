---
project_name: Projects Overview - Mission Control
project_stage: Operational
owner: AI Assistant
last_updated: "2025-11-10"
version: "4.0.1"
tags:
  - dashboard
  - portfolio
  - mission-control

# Project Keyword Registry - AI uses this to match queries to projects
project_keywords:
  medtech-integration:
    keywords: ["medtech", "ALEX", "integration", "medical records", "clinical images", "widget"]
    description: "Medical record integration with Medtech Evolution via ALEX API"
  clinicpro:
    keywords: ["clinicpro", "saas", "clinic", "scribing", "consultation notes"]
    description: "Main SaaS product for GP medical scribing"
  gp-voices-community:
    keywords: ["community", "gp voices", "discourse", "forum", "theme"]
    description: "GP community platform with Discourse"
  new_to_r&d_grant:
    keywords: ["grant", "r&d", "callaghan", "funding", "clinical llm"]
    description: "R&D grant application for NZ clinical LLM"
  project-management-ai-saas:
    keywords: ["pm saas", "project management", "ai pm", "conversation", "autonomous"]
    description: "Conversation-driven AI project management SaaS"
---

# Projects Overview - Mission Control

## 🤖 AI Navigation Instructions

**You just read this overview because `mandatory-overview-first.mdc` told you to. Good.**

Now determine what to do next:

### 1. Match Query to Project

Check the `project_keywords` in YAML frontmatter above:
- **Scan user query** for keyword matches against all projects
- **If EXACT MATCH found** → Go to Step 2
- **If MULTIPLE MATCHES** → Ask user: "Which project: [list matching options]?"
- **If NO MATCH** → Go to Step 3

### 2. Load Project Context

If project keyword matched:
- Read `/project-management/[project-folder]/PROJECT_SUMMARY.md`
- **Read project work rules**: `/workspace/.cursor/rules/project-work-rules.mdc`
- Now you have full context - follow the workflow in that rule file

### 3. Is This a New Project?

If no keywords matched:
- Ask: "I don't see an existing project for this. Is this:
  - (A) A new project to create?
  - (B) Related to an existing project listed below?
  - (C) A general question (not project-related)?"

### 4. General Questions (Not Project-Related)

If user query is clearly not about projects:
- Answer the question directly and helpfully
- Keep response focused
- **Then briefly mention**: "This might be relevant to [project name] - want to discuss in that context?"
- Don't force project context where it doesn't naturally fit

---

**Purpose**: This document serves as the central "mission control" dashboard providing an immediate snapshot of all ongoing projects. It enables quick onboarding, status updates, high-level planning, and cross-project visibility for both humans and AI.

**Location**: `/project-management/PROJECTS_OVERVIEW.md`

**Last Updated**: [2025-11-07]

**Context Note**: Solo founder/developer — limited time/resources require prioritisation of highest ROI activities. Technical work aligns with skills; marketing/sales activities have higher opportunity cost.

---

## Communication Principles

### Role and Style

Act as a brutally honest advisor. Be direct—no corporate speak or hedging.

**Communication**:
- Get to the point quickly, no preamble
- Use bullet points and clear structure
- Use NZ English spelling: organisation, colour, analyse, centre, programme, realise, specialise, prioritise

**Key insight**: Users are often solo founders or side hustlers.

When users are stuck or making poor decisions, challenge them directly. Explain opportunity cost, show the simpler path, and push to action with specific next steps.

### Understanding User Needs

Users may not articulate needs clearly. Look for underlying goals, unstated concerns, and hidden blockers.

Ask specific, contextual questions:
- ❌ "What do you want to do?" → ✅ "Are you trying to add a feature, fix a bug, or refactor?"
- ❌ "Can you explain more?" → ✅ "Is the error happening on production or only locally?"

---

## New Projects

When creating a new project:
1. Ask about stage (Ideation/Validation/Build/Operational) and project type (SaaS/marketplace/research/grant/etc)
2. Generate folder structure ad-hoc based on answers
3. Create PROJECT_SUMMARY.md immediately (mandatory) - use template: [`PROJECT_SUMMARY_TEMPLATE.md`](./PROJECT_SUMMARY_TEMPLATE.md)
4. Use kebab-case for folder name
5. Update PROJECTS_OVERVIEW.md with new project

**Folder structure guidelines**:
- **SaaS Build**: `/api`, `/frontend`, `/docs`, `/tests`
- **Validation**: `/research`, `/interviews`, `/prototypes`
- **Grant/Research**: `/proposals`, `/compliance`, `/reports`, `/partners`
- **Operations**: `/monitoring`, `/support`, `/processes`

Start minimal, add folders as project evolves.

---

## Active Projects Index

| Project Name | Folder | Stage | Owner | Last Updated | Link to Summary |
|--------------|--------|-------|-------|--------------|-----------------|
| ClinicPro SaaS | `clinicpro` | Operational | Solo Founder/Developer | 2025-11-07 | [PROJECT_SUMMARY.md](./clinicpro/PROJECT_SUMMARY.md) |
| Medtech ALEX Integration | `medtech-integration` | Build | Solo Founder/Developer | 2025-11-07 | [PROJECT_SUMMARY.md](./medtech-integration/PROJECT_SUMMARY.md) |
| GP Voices Community Site | `gp-voices-community` | Build | Solo Founder/Developer | 2025-01-15 | [PROJECT_SUMMARY.md](./gp-voices-community/PROJECT_SUMMARY.md) |
| R&D Grant Submission | `new_to_r&d_grant` | Validation | Solo Founder/Developer | 2025-11-07 | [PROJECT_SUMMARY.md](./new_to_r&d_grant/PROJECT_SUMMARY.md) |
| Project Management AI SaaS | `project-management-ai-saas` | Build | Solo Founder/Developer | 2025-11-09 | [PROJECT_SUMMARY.md](./project-management-ai-saas/PROJECT_SUMMARY.md) |

---

## AI-Generated Highlights

### Recent Achievements Across Projects
*[AI will auto-populate this section based on recent milestones and updates]*

- **2025-11-07**: Medtech Integration — POST Media endpoint implemented; Facility ID configuration blocker identified (403 error); Email sent to Medtech ALEX support
- **2025-11-07**: Strategic prioritisation review — Medtech Integration identified as high ROI revenue path; ClinicPro marketing ROI questioned given competitive market
- **2025-11-07**: Solo founder/developer context noted — limited time/resources require focus on highest ROI activities
- **2025-01-15**: GP Voices Community project initialised — Theme components implemented, configuration and deployment pending
- **2025-01-15**: Project management system installed — NexWave system adapted for ClinicPro workspace
- **2025-01-15**: Medtech integration gateway OAuth service completed (Oct 31)
- **2025-01-15**: ClinicPro SaaS production deployment operational
- **2025-11-11**: Medtech Integration — 503 error resolved! Changed facility ID from F99669-C to F2N060-E. BFF now successfully connecting to ALEX API (OAuth: 249ms, Patient query: 200 OK). Lightsail configuration verified and documented. Ready for next testing phase.
- **2025-11-10**: GP Voices Community - Week 1 LinkedIn validation results: 8 new followers, but most engagement from AI vendors (not GPs). Validation criteria established: 4-6 week test tracking GP engagement quality vs quantity. Automation only if GP demand proven.
- **2025-11-09**: Project Management AI SaaS - 🎉 MAJOR MILESTONE: Working prototype complete! Modular rule system (15 files), autonomous updates system (523 lines), conversation-driven workflow implemented. System now operational and being dogfooded. Stage moved Validation → Build.
- **2025-11-08**: Project Management AI SaaS - PM system improvements documented. Added "Document Creation Timing" rule to prevent creating interim documents during discussions. Rule will inform SaaS product UX design (draft mode vs saved documents, explicit save actions).
- **2025-11-07**: ClinicPro project summary synced to codebase; tech stack verified; security/route docs added
- **2025-11-07**: R&D Grant Submission - Partnership development progress: Medtech partnership letter confirmed (expected ~20 Nov). Comprehensive Care PHO approach prepared (email scheduled Monday 11 Nov - 42+ practices, 400+ GPs). Submission timeline established: mid-December 2025 target.
- **2025-11-06**: Project Management AI SaaS - PLANNING COMPLETE. Target locked: solo founders/side-hustlers with info overload. Competitor analysis done (no one doing exactly what we're building). AI rules enhanced for accountability. 7 key lessons documented. Next session = START building (Week 1: setup + auth + deploy).

### Top Blockers & Risks
*[AI will auto-populate this section based on identified blockers and risks]*

- **R&D Grant Submission**: Market validation gaps (GP letters of interest, operational evidence depth)
- **R&D Grant Submission**: Commercialisation strategy incomplete (pricing, projections, GTM, adoption timeline)

### Cross-Project Themes & Dependencies
*[AI will identify and surface themes, dependencies, or relationships across projects]*

- **Medtech Integration** depends on **ClinicPro SaaS** infrastructure (BFF deployment, OAuth infrastructure)
- **GP Voices Community** depends on **ClinicPro SaaS** for Clerk OIDC authentication integration
- All projects share technical documentation in `/docs/` directory
- ClinicPro SaaS and Medtech Integration use same codebase and deployment infrastructure
- **Project Management AI SaaS** is based on the current project management system (this repository) — the SaaS will commercialise the system in use now
- **AI Strategy**: Both new projects leverage AI/LLM capabilities — the R&D Grant could potentially fund development of AI features for the SaaS project

---

## Quick Status Summary

| Stage | Count | Projects |
|-------|-------|----------|
| Ideation | 0 | - |
| Validation | 1 | R&D Grant Submission |
| Build | 3 | Medtech ALEX Integration, GP Voices Community Site, Project Management AI SaaS |
| Operational | 1 | ClinicPro SaaS |
| Archived | 0 | - |

**Total Active Projects**: 5

---

## Schedule

*[AI will auto-populate this section with upcoming dates, appointments, meetings, deadlines, and due dates from all projects]*

### Upcoming Events

| Date | Time | Event | Project | Type | Notes |
|------|------|-------|---------|------|-------|
| 2025-11-12 | - | Publish pricing page | ClinicPro SaaS | Action | Tierless pricing + CTA |
| 2025-11-14 | - | Send 20 clinic outreach emails; book 5 demos | ClinicPro SaaS | Action | Outreach batch 1 |
| 2025-11-18 | - | Host 30‑min live demo/webinar | ClinicPro SaaS | Meeting | Record for reuse |
| 2025-11-21 | - | Start 3 clinic pilots | ClinicPro SaaS | Milestone | Define pilot success criteria |
| 2025-11-11 | Morning | Comprehensive Care email sent | R&D Grant Submission | Action | Request PHO letter of support (scheduled send) |
| 2025-11-12 | 8:30am | Mentor meeting | R&D Grant Submission | Meeting | Mentor engagement for R&D Grant |
| 2025-11-13 | 2:00pm | Callaghan Innovation meeting | R&D Grant Submission | Meeting | Meeting with Callaghan Innovation/Paul |
| ~2025-11-20 | - | Medtech letter expected | R&D Grant Submission | Milestone | Partnership letter from Alex |
| ~2025-12-15 | - | Grant submission target | R&D Grant Submission | Deadline | Submit to Callaghan Innovation |
| 2026-01-27 | - | Project start | R&D Grant Submission | Milestone | R&D Grant project commencement (if approved) |
| 2027-01-26 | - | Project end | R&D Grant Submission | Milestone | R&D Grant project completion |

### Past Events

| Date | Event | Project | Type | Notes |
|------|-------|---------|------|-------|
| 2025-11-07 | Medtech letter confirmed | R&D Grant Submission | Action | Alex responded positively, expects delivery ~20 Nov |
| 2025-11-06 | Mentor proposal sent | R&D Grant Submission | Action | Proposal submitted for review |

---

## Project Details

### ClinicPro SaaS
- **Folder**: `clinicpro`
- **Stage**: Operational
- **Owner**: Solo Founder/Developer
- **Last Updated**: 2025-11-07
- **Summary**: Full-stack Next.js SaaS application providing AI-assisted medical scribing for New Zealand GPs. Includes consultation note generation, clinical image analysis, dual recording (desktop/mobile) with transcription, real-time updates, and Clerk-based authentication. Stripe billing configured. Medtech integration is positioned as an upsell. RBAC is currently not enforced beyond authentication. Note: BFF (api.clinicpro.co.nz) is used only for Medtech integration flows; core app runs on Vercel serverless.
- **Market Context**: Competitive market (Heidi freemium, paid competitors integrated into Medtech). Product functional and used daily by founder. Marketing ROI uncertain given competition.
- **Key Dates**: 
  - Production deployment: Active
  - Latest feature: Clinical notes API improvements (Oct 2024)
- **Status**: Active — Production
- **Link**: [View Full Summary](./clinicpro/PROJECT_SUMMARY.md)
- **Technical Docs**: `/docs/tech-stack.md`, `/docs/features/`

### Medtech ALEX Integration
- **Folder**: `medtech-integration`
- **Stage**: Build
- **Owner**: Solo Founder/Developer
- **Last Updated**: 2025-11-11
- **Summary**: Clinical images widget integration with Medtech Evolution/Medtech32 via ALEX API. Enables GPs to capture/upload photos from within Medtech, saved back to patient encounters via FHIR API. **Revenue Strategy**: Modular features approach — images widget is first module. Once ready, can immediately pitch to Medtech's existing customer base (3,000+ GPs) for revenue. Clear revenue path with existing customer base.
- **Key Dates**: 
  - OAuth service completed: Oct 31, 2024
  - BFF deployed: Oct 31, 2024
  - IP allow-listing resolved: Jan 15, 2025
  - 503 error resolved: Nov 11, 2025
- **Status**: Active — BFF verified and operational; ALEX API connectivity confirmed (OAuth + FHIR queries working)
- **Link**: [View Full Summary](./medtech-integration/PROJECT_SUMMARY.md)
- **Technical Docs**: `/project-management/medtech-integration/docs/` (Architecture guide, Lightsail setup, testing guide)

### GP Voices Community Site
- **Folder**: `gp-voices-community`
- **Stage**: Build
- **Owner**: Solo Founder/Developer
- **Last Updated**: 2025-11-10
- **Summary**: Mobile-first Discourse community platform for ClinicPro users (New Zealand GPs). Custom Discourse theme providing comment-first UX, AI-powered weekly summaries, tag-based content organisation, and Clerk OIDC authentication integration. **Active LinkedIn validation experiment** (Week 1/6 complete) testing demand for curated NZ healthcare news before building automation.
- **Key Dates**: 
  - Project initialised: 2025-01-15
  - Theme components implemented: 2025-01-15
  - LinkedIn validation started: 2025-11-08
  - LinkedIn validation decision: ~2025-12-20 (after 4-6 weeks)
  - Configuration and deployment: Pending
- **Status**: Active — Theme development in progress; LinkedIn content validation in progress (Week 1: vendor engagement > GP engagement)
- **Link**: [View Full Summary](./gp-voices-community/PROJECT_SUMMARY.md)
- **Technical Docs**: `/docs/gp-voices-theme.md`, `/docs/gp-voices-import-setup.md`
- **Theme Location**: `/discourse-theme/gp-voices/`

### R&D Grant Submission
- **Folder**: `new_to_r&d_grant`
- **Stage**: Validation
- **Owner**: Solo Founder/Developer
- **Last Updated**: 2025-11-07
- **Summary**: R&D grant proposal for building NZ-sovereign clinical LLM for GP workflows (inbox management, coding, referrals, care gaps). 12-month project seeking $42,893 grant (40%) with $64,339 co-funding. Partnership development in progress with Medtech and Comprehensive Care PHO.
- **Key Dates**: 
  - Mentor meeting: 2025-11-12
  - Callaghan Innovation meeting: 2025-11-13
  - Medtech letter expected: ~2025-11-20
  - Grant submission target: ~2025-12-15
  - Project start (if approved): 2026-01-27
  - Project end: 2027-01-26
- **Status**: Partnership development in progress; preparing for mentor/Callaghan meetings
- **Link**: [View Full Summary](./new_to_r&d_grant/PROJECT_SUMMARY.md)

### Project Management AI SaaS
- **Folder**: `project-management-ai-saas`
- **Stage**: Build (moved from Validation 2025-11-09)
- **Owner**: Solo Founder/Developer
- **Last Updated**: 2025-11-09
- **Summary**: Conversation-driven AI project management for solo founders. Documentation happens automatically from natural conversation. Working prototype (modular rule system) now operational and being dogfooded. Core innovation: autonomous updates from conversation.
- **Key Dates**: 
  - Planning complete: 2025-11-06
  - Working prototype complete: 2025-11-09
  - Autonomous system operational: 2025-11-09
- **Status**: 🎉 Working prototype operational — Modular rule system (15 files), autonomous updates (523 lines), being actively dogfooded
- **Technical Achievement**: 843 lines always-loaded (~4,200 tokens), conversation-driven workflow, 9 conversational triggers
- **Link**: [View Full Summary](./project-management-ai-saas/PROJECT_SUMMARY.md)

---

## Archived Projects

*[Projects that have been completed or archived will be listed here]*

---

## Maintenance Notes

- This dashboard is automatically maintained by AI
- Updates occur after major project changes
- AI-generated highlights refresh based on project updates
- Cross-project dependencies are monitored and surfaced here
- Project management root: `/project-management/`
- Technical documentation: `/docs/` (separate from project management)

---

*Dashboard Last Updated: [2025-11-11] - Medtech: BFF verified operational, 503 error resolved, ready for next phase*
