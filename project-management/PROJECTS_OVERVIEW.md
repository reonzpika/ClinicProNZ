---
project_name: Projects Overview - Mission Control
project_stage: Operational
owner: AI Assistant
last_updated: "2025-11-07"
version: "1.0.3"
tags:
  - dashboard
  - portfolio
  - mission-control
---

# Projects Overview - Mission Control

**Purpose**: This document serves as the central "mission control" dashboard providing an immediate snapshot of all ongoing projects. It enables quick onboarding, status updates, high-level planning, and cross-project visibility for both humans and AI.

**Location**: `/project-management/PROJECTS_OVERVIEW.md`

**Last Updated**: [2025-11-07]

---

## Active Projects Index

| Project Name | Folder | Stage | Owner | Last Updated | Link to Summary |
|--------------|--------|-------|-------|--------------|-----------------|
| ClinicPro SaaS | `clinicpro` | Operational | Development Team | 2025-11-07 | [PROJECT_SUMMARY.md](./clinicpro/PROJECT_SUMMARY.md) |
| Medtech ALEX Integration | `medtech-integration` | Build | Development Team | 2025-01-15 | [PROJECT_SUMMARY.md](./medtech-integration/PROJECT_SUMMARY.md) |
| GP Voices Community Site | `gp-voices-community` | Build | ClinicPro Engineering | 2025-01-15 | [PROJECT_SUMMARY.md](./gp-voices-community/PROJECT_SUMMARY.md) |
| R&D Grant Submission | `new_to_r&d_grant` | Validation | TBD | 2025-11-07 | [PROJECT_SUMMARY.md](./new_to_r&d_grant/PROJECT_SUMMARY.md) |
| Project Management AI SaaS | `project-management-ai-saas` | Validation | TBD | 2025-11-06 | [PROJECT_SUMMARY.md](./project-management-ai-saas/PROJECT_SUMMARY.md) |

---

## AI-Generated Highlights

### Recent Achievements Across Projects
*[AI will auto-populate this section based on recent milestones and updates]*

- **2025-11-07**: ClinicPro — Marketing, Growth & Monetisation plan added; pricing/outreach/webinar scheduled (Nov 12–21)
- **2025-01-15**: GP Voices Community project initialised — Theme components implemented, configuration and deployment pending
- **2025-01-15**: Project management system installed — NexWave system adapted for ClinicPro workspace
- **2025-01-15**: Medtech integration gateway OAuth service completed (Oct 31)
- **2025-01-15**: ClinicPro SaaS production deployment operational
- **2025-11-07**: ClinicPro project summary synced to codebase; tech stack verified; security/route docs added
- **2025-11-07**: R&D Grant Submission - Partnership development progress: Medtech partnership letter confirmed (expected ~20 Nov). Comprehensive Care PHO approach prepared (email scheduled Monday 11 Nov - 42+ practices, 400+ GPs). Submission timeline established: mid-December 2025 target.
- **2025-11-06**: Project Management AI SaaS - PLANNING COMPLETE. Target locked: solo founders/side-hustlers with info overload. Competitor analysis done (no one doing exactly what we're building). AI rules enhanced for accountability. 7 key lessons documented. Next session = START building (Week 1: setup + auth + deploy).

### Top Blockers & Risks
*[AI will auto-populate this section based on identified blockers and risks]*

- **R&D Grant Submission**: Market validation gaps (GP letters of interest, operational evidence depth)
- **R&D Grant Submission**: Commercialisation strategy incomplete (pricing, projections, GTM, adoption timeline)
- **Medtech ALEX Integration**: No active blockers — ready for end-to-end testing

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
| Validation | 2 | R&D Grant Submission, Project Management AI SaaS |
| Build | 2 | Medtech ALEX Integration, GP Voices Community Site |
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
- **Owner**: Development Team
- **Last Updated**: 2025-11-07
- **Summary**: Full-stack Next.js SaaS application providing AI-assisted medical scribing for New Zealand GPs. Includes consultation note generation, clinical image analysis, dual recording (desktop/mobile) with transcription, real-time updates, and Clerk-based authentication. Stripe billing configured. Medtech integration is positioned as an upsell. RBAC is currently not enforced beyond authentication. Note: BFF (api.clinicpro.co.nz) is used only for Medtech integration flows; core app runs on Vercel serverless.
- **Key Dates**: 
  - Production deployment: Active
  - Latest feature: Clinical notes API improvements (Oct 2024)
- **Status**: Active — Production
- **Link**: [View Full Summary](./clinicpro/PROJECT_SUMMARY.md)
- **Technical Docs**: `/docs/tech-stack.md`, `/docs/features/`

### Medtech ALEX Integration
- **Folder**: `medtech-integration`
- **Stage**: Build
- **Owner**: Development Team
- **Last Updated**: 2025-01-15
- **Summary**: Clinical images widget integration with Medtech Evolution/Medtech32 via ALEX API. Enables GPs to capture/upload photos from within Medtech, saved back to patient encounters via FHIR API.
- **Key Dates**: 
  - OAuth service completed: Oct 31, 2024
  - BFF deployed: Oct 31, 2024
  - IP allow-listing resolved: Jan 15, 2025
- **Status**: Active — Ready for end-to-end testing
- **Link**: [View Full Summary](./medtech-integration/PROJECT_SUMMARY.md)
- **Technical Docs**: `/project-management/medtech-integration/docs/`

### GP Voices Community Site
- **Folder**: `gp-voices-community`
- **Stage**: Build
- **Owner**: ClinicPro Engineering
- **Last Updated**: 2025-01-15
- **Summary**: Mobile-first Discourse community platform for ClinicPro users (New Zealand GPs). Custom Discourse theme providing comment-first UX, AI-powered weekly summaries, tag-based content organisation, and Clerk OIDC authentication integration.
- **Key Dates**: 
  - Project initialised: 2025-01-15
  - Theme components implemented: 2025-01-15
  - Configuration and deployment: Pending
- **Status**: Active — Theme development in progress
- **Link**: [View Full Summary](./gp-voices-community/PROJECT_SUMMARY.md)
- **Technical Docs**: `/docs/gp-voices-theme.md`, `/docs/gp-voices-import-setup.md`
- **Theme Location**: `/discourse-theme/gp-voices/`

### R&D Grant Submission
- **Folder**: `new_to_r&d_grant`
- **Stage**: Validation
- **Owner**: TBD
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
- **Stage**: Validation
- **Owner**: TBD
- **Last Updated**: 2025-11-06
- **Summary**: AI co-founder for solo founders drowning in information. Targets first-time founders and side-hustlers struggling with info overload and unclear next steps. Provides structure + AI guidance to turn overwhelm into action. Tech: Next.js 14 + PostgreSQL + ChatGPT API.
- **Key Dates**: 
  - Planning complete: 2025-11-06
  - Next session: START Week 1 building
- **Status**: READY TO BUILD — Planning phase complete; next action is initialise Next.js project
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

*Dashboard Last Updated: [2025-11-07] - ClinicPro GTM plan added; schedule updated*
