---
project_name: ClinicPro SaaS
project_stage: Operational
owner: Development Team
last_updated: "2025-11-07"
version: "1.0.4"
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

## Next Session: Pick Up Here

Maintenance only. If you touch ClinicPro this week, keep it to stability fixes; prioritise Medtech Phase 1D validation and customer work.

---

## Current Status [2025-01-15]

### Production Status
- ✅ **Deployed**: Vercel (frontend) + AWS Lightsail BFF (backend)
- ✅ **BFF URL (Medtech integration only)**: `https://api.clinicpro.co.nz`
- ✅ **Health**: System operational
- ✅ **Features**: Core features in production use

### Recent Updates
- **2025-01-15**: Project management system installed — NexWave system adapted for ClinicPro workspace
- **2024-10-01**: Clinical notes API improvements — Multi-source data handling, transcription error handling, anti-hallucination rules

---

## Key Features

### Core Clinical Features
- **AI Clinical Notes**: OpenAI‑powered templated note generation (`app/api/(clinical)/consultation/notes`)
- **Recording Systems**: Desktop and mobile audio capture with Deepgram STT (nova‑3‑medical) and Ably signalling
- **Clinical Image Analysis**: Anthropic Claude Vision inference over images stored in S3
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
- **AI/LLM**: OpenAI, Anthropic Claude Vision (vision inference)
- **Speech-to-Text**: Deepgram SDK (nova-3-medical)
- **Realtime**: Ably (user channels)
- **Database**: PostgreSQL (Neon), Drizzle ORM, pgvector
- **Caching**: Upstash Redis (optional)
- **Storage**: AWS S3, sharp for image processing
- **Auth**: Clerk (Next.js SDK + middleware; Svix verification for Clerk webhooks)
- **Payments**: Stripe (Checkout sessions + webhooks)
- **Infrastructure**: Vercel serverless functions + scheduled crons; Medtech Integration BFF on AWS Lightsail (used only by Medtech flows)

### Development & Quality
- **Tooling**: ESLint, Vitest, Commitlint + Commitizen, semantic-release

---

## Architecture

### Deployment Architecture
```
Standard App Flows
User Browser
    ↓
Vercel (Frontend - Next.js)
    ↓
External Services (OpenAI, Deepgram, Stripe, etc.)

Medtech Integration Flows (Widgets)
User Browser (Medtech Widgets)
    ↓
AWS Lightsail BFF (api.clinicpro.co.nz)
    ↓
Medtech ALEX / External Services
```

### Key Components
- **Frontend**: Next.js App Router (`app/` directory)
- **API Routes**: Serverless functions (`app/api/`)
- **Database**: PostgreSQL with Drizzle ORM (`database/`)
- **Services**: Feature modules (`src/`)
- **Medtech Integration BFF**: AWS Lightsail (`api.clinicpro.co.nz`) — only for Medtech integration widgets

---

## Providers & State Management

- **Query Client**: TanStack React Query with custom defaults (`src/lib/react-query.ts`), provided via `QueryClientProvider` (`src/providers/QueryClientProvider.tsx`), wired in `app/layout.tsx`.
- **Zustand Stores**: Session and UI state in:
  - `src/stores/consultationStore.ts` — consultation session, SOAP sections, chat context, clinical images
  - `src/stores/transcriptionStore.ts` — transcription flow state
  - `src/stores/imageStore.ts` — image capture/annotations
  - `src/stores/userSettingsStore.ts` — user preferences (e.g., default template, autosave)

---

## Routing Snapshot (high‑level)

- Pages (`app/`):
  - Marketing: `(marketing)/landing-page`, `about`, `ai-scribing`, `clinicpro`, `contact`, `roadmap`
  - Clinical: `(clinical)/consultation`, `chat`, `image`, `templates`, `search`, `differential-diagnosis`, `acc-occupation-codes`, `employer-lookup`
  - User: `(user)/dashboard`, `settings`, auth
  - Business: `(business)/billing`, `pricing`
  - Admin: `(admin)/admin`, `emergency-admin`
  - Integration: `(integration)/mobile`; Medtech: `(medtech)/medtech-images`
- APIs (`app/api/`): grouped under `(clinical)`, `(user)`, `(business)`, `(admin)`, `(integration)`, `(marketing)`, plus `current-session`, `maintenance`, `search`.

---

## Security & Access

- **Authentication**: Clerk middleware protects sensitive pages and API routes (`middleware.ts`).
- **Authorisation**: Admin‑only checks exist for `/api/admin/*` and RAG admin routes. Tier headers are forwarded to APIs for context.
- **Current policy**: All authenticated users have access to all features; no tier gating enforced [[memory:3197347]].
- **RBAC status**: Legacy tier headers remain for future flexibility; formal RBAC is TBD and not enforced at present.

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

## Business & Commercialisation

- **Payments**: Stripe Checkout/webhooks configured (self‑serve billing present).
- **Pricing**: Public pricing TBD. Candidate model is usage‑based packs (individual and clinic pooled) with rollover and overage, per commercialisation draft — see `project-management/new_to_r&d_grant/01-application-narrative/commercialization-and-market-strategy.md`.
- **Product packaging**: Medtech integration positioned as an upsell to the base ClinicPro offering.
- **Legal**: Draft Terms and Privacy are published but not professionally reviewed yet — Terms: `https://www.clinicpro.co.nz/terms`, Privacy: `https://www.clinicpro.co.nz/privacy`. Review by NZ legal/compliance advisors pending.
- **Website**: Landing page reference for messaging and positioning: `https://www.clinicpro.co.nz/landing-page`.

---

## Marketing, Growth & Monetisation [2025-11-07]

### Competitive Landscape & Market Reality [2025-11-07]
- **Competitive Market**: Heidi offers freemium model; other paid competitors already integrated into Medtech
- **Market Challenge**: Difficult to acquire paid customers in competitive landscape
- **Current Status**: Product is functional and used daily by founder; helpful for own work
- **Strategic Question**: Whether marketing/growth investment is worth ROI given competition vs. focusing on other projects
- **Note**: Solo founder/developer context — limited time/resources; need to prioritise highest ROI activities

### Positioning & ICP
- **Ideal Customer Profile (NZ)**: General practices (1–10 GPs), practice managers, and GP owners prioritising quality documentation and reduced admin burden.
- **Positioning**: "ClinicPro helps NZ GPs produce consistent, high‑quality notes in minutes — freeing time for patient care." Differentiators: clinical note quality, NZ‑context prompts, minimal setup, and Medtech upsell path.

### Go‑to‑Market (GTM)
- **Primary channels**: Direct outreach to NZ clinics; PHO partnerships; lightweight webinars/demos; GP communities (LinkedIn + GP groups); the forthcoming GP Voices community.
- **Secondary**: Content marketing (weekly clinical documentation tips, case studies), Medtech ecosystem visibility.
- **Funnel**:
  1. Landing → pricing → 14‑day trial sign‑up (Clerk) → in‑app checklist → generate first note
  2. Founder‑led demo for clinics → 2–4 week pilot → convert to paid

### Pricing & Packaging (pilot approach)
- **Tierless product** aligned with current access model [[memory:3197347]].
- Start with simple, transparent pricing on site + clinic contact. Keep usage‑based packs under evaluation (individual vs pooled clinic minutes) per existing draft. Validate willingness‑to‑pay during demos; adjust iteratively.

### Activation & Onboarding
- In‑app checklist: connect mic, record sample, generate first note, export/download.
- Email nudge sequence during trial: day 0, 2, 5, 10.
- Success metric = first note generated within 24 hours of sign‑up.

### Partnerships
- PHO intros (e.g., Comprehensive Care). Medtech integration positioned as upsell; prepare 1‑pager for PHOs/Medtech.

### KPIs (initial focus)
- Top of funnel: unique visitors → trial sign‑ups.
- Activation: % generating a note in 24h.
- Sales: demos booked, pilots started, pilot→paid conversions.
- Revenue: MRR, ARPA; Costs: CAC, gross margin; Retention: 30/60/90‑day.

### 2‑Week Action Plan (dates are targets)
- 2025‑11‑12: Publish pricing page (tierless, clear CTA to start trial or book demo).
- 2025‑11‑14: Send 20 clinic outreach emails; book 5 demos (template + list).
- 2025‑11‑18: Host 30‑minute live demo/webinar; record for reuse.
- 2025‑11‑21: Start 3 clinic pilots; define success criteria and close plan.

### Risks & Mitigations
- Low activation → Add in‑app checklist, sample data, and 24h nudge.
- Pricing fit unknown → Start simple, test during demos, iterate weekly.
- Channel spread → Focus on 2 channels this month: direct outreach + demos.

---

## Updates History

---

*Project Created: [2025-01-15]*  
*Last Updated: [2025-01-15]*  
*Version: 1.0.0*
