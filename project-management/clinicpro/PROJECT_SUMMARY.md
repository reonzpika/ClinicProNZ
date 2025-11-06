---
project_name: ClinicPro SaaS
project_stage: Operational
owner: Development Team
last_updated: "2025-01-15"
version: "1.0.0"
tags:
  - saas
  - healthcare
  - ai
  - production
  - nz-gp
summary: "Full-stack Next.js SaaS application providing AI-assisted medical scribing for New Zealand GPs. Includes consultation note generation, clinical image analysis, dual recording (desktop/mobile) with transcription, real-time updates, and role-based access control."
---

# ClinicPro SaaS

## Project Overview

**Status**: Operational — Production

**Description**: Full-stack Next.js (App Router) SaaS application providing AI-assisted medical scribing for New Zealand GPs. Production deployment active on Vercel with BFF (Backend-for-Frontend) on AWS Lightsail.

**Key Value Proposition**: AI-powered clinical documentation assistance, reducing administrative burden for GPs and improving note quality and consistency.

---

## Current Status [2025-01-15]

### Production Status
- ✅ **Deployed**: Vercel (frontend) + AWS Lightsail BFF (backend)
- ✅ **Domain**: Production base URL: `https://api.clinicpro.co.nz`
- ✅ **Health**: System operational
- ✅ **Features**: Core features in production use

### Recent Updates
- **2025-01-15**: Project management system installed — NexWave system adapted for ClinicPro workspace
- **2024-10-01**: Clinical notes API improvements — Multi-source data handling, transcription error handling, anti-hallucination rules

---

## Key Features

### Core Clinical Features
- **AI Clinical Notes**: OpenAI-powered templated note generation (`app/api/(clinical)/consultation/notes`)
- **Recording Systems**: Desktop and mobile audio capture with Deepgram STT and Ably signalling
- **Clinical Image Analysis**: Gemini vision inference over images stored in S3
- **RAG (Pilot)**: LlamaIndex/Weaviate plan; current vector search via Postgres/pgvector

### Platform Features
- **Authentication & RBAC**: Clerk middleware, protected routes and admin gating
- **Billing**: Stripe Checkout and webhooks; user tier metadata updates
- **Storage**: AWS S3 presigned upload/download for clinical assets
- **Cost Tracking**: OpenAI and Deepgram usage aggregation (`api_usage_costs`)
- **Marketing & Admin Tooling**: Surveys, email capture, feature roadmap, admin cost/session analytics
- **Vercel Cron Jobs**: Maintenance tasks via scheduled routes

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS, Radix UI
- **State/Data**: TanStack React Query 5, Zustand

### Backend & Infrastructure
- **AI/LLM**: OpenAI, Gemini Vision (Google Generative Language APIs)
- **Speech-to-Text**: Deepgram SDK (nova-3-medical)
- **Realtime**: Ably (user channels)
- **Database**: PostgreSQL (Neon), Drizzle ORM, pgvector
- **Caching**: Upstash Redis (optional)
- **Storage**: AWS S3, sharp for image processing
- **Auth**: Clerk (Next.js SDK + middleware; Svix verification for Clerk webhooks)
- **Payments**: Stripe (Checkout sessions + webhooks)
- **Infrastructure**: Vercel serverless functions + scheduled crons, AWS Lightsail BFF

### Development & Quality
- **Tooling**: ESLint, Vitest, Commitlint + Commitizen, semantic-release

---

## Architecture

### Deployment Architecture
```
User Browser
    ↓
Vercel (Frontend - Next.js)
    ↓
AWS Lightsail BFF (api.clinicpro.co.nz)
    ↓
External Services (OpenAI, Deepgram, Stripe, etc.)
```

### Key Components
- **Frontend**: Next.js App Router (`app/` directory)
- **API Routes**: Serverless functions (`app/api/`)
- **Database**: PostgreSQL with Drizzle ORM (`database/`)
- **Services**: Feature modules (`src/`)
- **BFF**: AWS Lightsail (`api.clinicpro.co.nz`)

---

## Milestones & Roadmap

### Completed Milestones
- ✅ Initial production deployment
- ✅ Core clinical features (notes, recording, images)
- ✅ Authentication & billing integration
- ✅ Clinical notes API improvements (Oct 2024)

### Ongoing Development
- 🔄 Feature enhancements and bug fixes
- 🔄 Performance optimisations
- 🔄 User experience improvements

### Upcoming Features
- 📋 RAG chatbot implementation (LlamaIndex/Weaviate migration)
- 📋 Enhanced clinical image analysis
- 📋 Advanced reporting and analytics

---

## Dependencies

### Outgoing Dependencies
- **Medtech ALEX Integration** — Clinical images widget integration (separate project)

### Incoming Dependencies
- **Medtech Integration** — Depends on ClinicPro infrastructure (BFF, OAuth)

---

## Operational Metrics

### Key Metrics to Track
- User sign-ups and active users
- API usage (OpenAI, Deepgram costs)
- Session generation and completion rates
- Consultation note generation quality
- System uptime and performance

### Cost Tracking
- OpenAI usage aggregation (`api_usage_costs` table)
- Deepgram usage tracking
- Infrastructure costs (Vercel, Lightsail, S3)

---

## Maintenance & Operations

### Scheduled Tasks (Vercel Crons)
- `0 13 * * *` → `/api/maintenance/cleanup-mobile-tokens`
- `0 3 * * *` → `/api/maintenance/cleanup-empty-sessions?token=${CRON_SECRET}`

### Health Checks
- **BFF Health**: `GET https://api.clinicpro.co.nz/`
- **Frontend**: Vercel deployment status

### Monitoring
- Vercel Analytics
- Error tracking (implicit via Vercel)
- Cost tracking (`api_usage_costs` table)

---

## Technical Documentation References

**Project Management**: This file (`PROJECT_SUMMARY.md`)

**Technical Documentation**: `/docs/`
- `tech-stack.md` — Complete technology stack overview
- `features/` — Feature-specific documentation
  - `recording-systems.md` — Recording architecture
  - `image-desktop.md` — Desktop image capture
  - `image-mobile.md` — Mobile image capture
  - `qa-system.md` — Q&A system documentation
- `llamaindex-rag-chatbot.md` — RAG implementation plan

**Code References**:
- API Routes: `/app/api/`
- Database Schema: `/database/schema/`
- Services: `/src/lib/`
- Features: `/src/features/`

---

## Decisions & Learnings [2025-01-15]

### Clinical Notes API Architecture
**Date**: 2024-10-01

**Decision**: Multi-source data handling with priority hierarchy

**Rationale**:
- GP's problem list (Additional Notes) is PRIMARY source
- Transcription and typed input are SUPPLEMENTARY
- Enables better clinical focus and detail extraction

**Reference**: `/PROMPT_IMPROVEMENTS_SUMMARY.md`

### Template-in-System-Prompt Architecture
**Date**: 2024-10-01

**Decision**: Dynamic template inclusion in system prompt, cached per templateId

**Rationale**:
- Better LLM comprehension by treating template as core instruction
- Efficient caching (5 min TTL, max 10 templates)
- Template-specific optimisation

---

## Updates History

### [2025-01-15] — Project Management System Installation
- Created PROJECT_SUMMARY.md
- Documented operational status and architecture
- Added technical references and milestones

### [2024-10-01] — Clinical Notes API Improvements
- Multi-source data handling implemented
- Transcription error handling added
- Anti-hallucination rules implemented
- Template-in-system-prompt architecture

---

*Project Created: [2025-01-15]*  
*Last Updated: [2025-01-15]*  
*Version: 1.0.0*
