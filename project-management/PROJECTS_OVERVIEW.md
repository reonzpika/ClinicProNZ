---
project_name: Projects Overview - Mission Control
project_stage: Operational
owner: AI Assistant
last_updated: "2025-01-15"
version: "1.0.0"
tags:
  - dashboard
  - portfolio
  - mission-control
---

# Projects Overview - Mission Control

**Purpose**: This document serves as the central "mission control" dashboard providing an immediate snapshot of all ongoing projects. It enables quick onboarding, status updates, high-level planning, and cross-project visibility for both humans and AI.

**Location**: `/project-management/PROJECTS_OVERVIEW.md`

**Last Updated**: [2025-01-15]

---

## Active Projects Index

| Project Name | Folder | Stage | Owner | Last Updated | Link to Summary |
|--------------|--------|-------|-------|--------------|-----------------|
| ClinicPro SaaS | `clinicpro` | Operational | Development Team | 2025-01-15 | [PROJECT_SUMMARY.md](./clinicpro/PROJECT_SUMMARY.md) |
| Medtech ALEX Integration | `medtech-integration` | Build | Development Team | 2025-01-15 | [PROJECT_SUMMARY.md](./medtech-integration/PROJECT_SUMMARY.md) |

---

## AI-Generated Highlights

### Recent Achievements Across Projects
*[AI will auto-populate this section based on recent milestones and updates]*

- **2025-01-15**: Project management system installed — NexWave system adapted for ClinicPro workspace
- **2025-01-15**: Medtech integration gateway OAuth service completed (Oct 31)
- **2025-01-15**: ClinicPro SaaS production deployment operational

### Top Blockers & Risks
*[AI will auto-populate this section based on identified blockers and risks]*

- **Medtech Integration**: Awaiting Medtech response on ALEX API firewall allow-listing (IP: 13.236.58.12) — blocking BFF connectivity
- **Medtech Integration**: Clinical metadata schema clarification needed before POST Media implementation

### Cross-Project Themes & Dependencies
*[AI will identify and surface themes, dependencies, or relationships across projects]*

- **Medtech Integration** depends on **ClinicPro SaaS** infrastructure (BFF deployment, OAuth infrastructure)
- Both projects share technical documentation in `/docs/` directory
- Both projects use same codebase and deployment infrastructure

---

## Quick Status Summary

| Stage | Count | Projects |
|-------|-------|----------|
| Ideation | 0 | - |
| Validation | 0 | - |
| Build | 1 | Medtech ALEX Integration |
| Operational | 1 | ClinicPro SaaS |
| Archived | 0 | - |

**Total Active Projects**: 2

---

## Project Details

### ClinicPro SaaS
- **Folder**: `clinicpro`
- **Stage**: Operational
- **Owner**: Development Team
- **Last Updated**: 2025-01-15
- **Summary**: Full-stack Next.js SaaS application providing AI-assisted medical scribing for New Zealand GPs. Includes consultation note generation, clinical image analysis, dual recording (desktop/mobile) with transcription, real-time updates, and role-based access control.
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
  - Awaiting Medtech firewall update: In progress
- **Status**: Active — Blocked on external dependency
- **Link**: [View Full Summary](./medtech-integration/PROJECT_SUMMARY.md)
- **Technical Docs**: `/project-management/medtech-integration/docs/`

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

*Dashboard Last Updated: [2025-01-15]*
