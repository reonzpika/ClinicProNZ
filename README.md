## ClinicPro

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./package.json)
[![Build](https://img.shields.io/badge/build-Vercel%20Serverless-informational.svg)](vercel.json)
[![License](https://img.shields.io/badge/license-unspecified-lightgrey.svg)](#license)

### Description
ClinicPro is a full‑stack Next.js (App Router) application that provides AI‑assisted medical scribing for New Zealand GPs, including consultation note generation, clinical image analysis, and dual recording (desktop/mobile) with reliable transcription, real‑time updates, and role‑based access control.

### Backend (BFF)

- Repo: https://github.com/reonzpika/clinicpro-bff
- Production base URL: https://api.clinicpro.co.nz
- Health check:
  - GET https://api.clinicpro.co.nz/
  - Example: `curl -s https://api.clinicpro.co.nz`
- Frontend configuration:
  - Point the app to the BFF: set your API base to `https://api.clinicpro.co.nz`
  - Example (Next.js): set `NEXT_PUBLIC_API_BASE=https://api.clinicpro.co.nz`
- Operations & deployment:
  - See `DEPLOYMENT_NOTES.md` in the BFF repo for server, TLS, and runbook details.

---

### Key Features
- **AI clinical notes**: OpenAI‑powered templated note generation (`app/api/(clinical)/consultation/notes`)
- **Recording systems**: Desktop and mobile audio capture with Deepgram STT and Ably signalling
- **Clinical image analysis**: Gemini vision inference over images stored in S3
- **RAG (pilot)**: LlamaIndex/Weaviate plan; current vector search via Postgres/pgvector
- **Authentication & RBAC**: Clerk middleware, protected routes and admin gating
- **Billing**: Stripe Checkout and webhooks; user tier metadata updates
- **Storage**: AWS S3 presigned upload/download for clinical assets
- **Cost tracking**: OpenAI and Deepgram usage aggregation (`api_usage_costs`)
- **Marketing & admin tooling**: Surveys, email capture, feature roadmap, admin cost/session analytics
- **Vercel cron jobs**: Maintenance tasks via scheduled routes

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS, Radix UI
- **State/data**: TanStack React Query 5, Zustand
- **AI/LLM**: OpenAI; Gemini Vision (Google Generative Language APIs)
- **Speech‑to‑text**: Deepgram SDK (nova‑3‑medical)
- **Realtime**: Ably (user channels)
- **Database**: PostgreSQL (Neon), Drizzle ORM, pgvector
- **Caching**: Upstash Redis (optional)
- **Storage**: AWS S3, sharp for image processing
- **Auth**: Clerk (Next.js SDK + middleware; Svix verification for Clerk webhooks)
- **Payments**: Stripe (Checkout sessions + webhooks)
- **Infra**: Vercel serverless functions + scheduled crons
- **Tooling**: ESLint, Vitest, Commitlint + Commitizen, semantic‑release

### Directory Overview
- `app/` Next.js App Router pages and API routes (serverless)
- `database/` Drizzle schema, client, and migrations
- `src/` Feature modules, providers, RAG helpers, services, stores
- `docs/` Feature and tech stack documentation
- `scripts/` Data ingestion and test utilities
- `data/`, `data_chunks/` Healthify pilot corpus and chunks

---

## Installation
1. Prerequisites:
   - Node.js (LTS recommended), pnpm (9.x) — see `packageManager` in `package.json`
   - PostgreSQL database URL (Neon recommended)
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure environment (see Env Vars below). Create `.env.local` and set `DATABASE_URL` at minimum.
4. Initialise database:
   ```bash
   pnpm db:push
   # Optional seeds:
   pnpm db:seed-templates
   ```
5. Run development server:
   ```bash
   pnpm dev
   ```
6. Build & start:
   ```bash
   pnpm build && pnpm start
   ```

## Environment Variables
Set in `.env.local` (loaded by `drizzle.config.ts` and `database/client.ts`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection (Neon HTTP ok) |
| `OPENAI_API_KEY` | OpenAI embeddings and chat |
| `GEMINI_API_KEY` | Gemini Vision for image analysis |
| `DEEPGRAM_API_KEY` | Deepgram speech‑to‑text |
| `ABLY_API_KEY` | Ably realtime channel publish |
| `AWS_REGION` | AWS S3 region (defaults: `ap-southeast-2`) |
| `AWS_ACCESS_KEY_ID` | AWS S3 credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS S3 credentials |
| `S3_BUCKET_NAME` | S3 bucket for uploads/images |
| `STRIPE_SECRET_KEY` | Stripe server key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `CLERK_SECRET_KEY` | Clerk server key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook verification |
| `UPSTASH_REDIS_REST_URL` | Redis (optional) |
| `UPSTASH_REDIS_REST_TOKEN` | Redis (optional) |
| `PPLX_API_KEY`, `PPLX_MODEL` | Perplexity (optional) |
| `GOOGLE_MAPS_API_KEY` | Employer lookup endpoints (optional) |
| `RAG_ENFORCE_TIER` | Gate RAG access by tier (optional) |
| `CRON_SECRET` | Vercel cron auth for maintenance route |

Note: Some client SDKs (e.g. Clerk) may require publishable frontend keys; add as needed per provider docs.

## Usage Examples

### Web UI
- Main tools:
  - AI Scribe (consultation): `/ai-scribe/consultation`
  - Templates: `/ai-scribe/templates`
  - Clinical Images: `/image` (landing) → `/image/app` (tool)
  - ACC tools: `/acc`
  - Dashboard: `/dashboard`

### API (requires Clerk authentication unless noted)

- Generate consultation notes:
  ```bash
  curl -X POST http://localhost:3000/api/consultation/notes \
    -H "Content-Type: application/json" \
    --cookie "YOUR_SIGNED_IN_COOKIES" \
    -d '{
      "templateId": "TEMPLATE_ID",
      "additionalNotes": "GP clinical reasoning and problems",
      "transcription": "Dialogue...",
      "typedInput": "Extra observations"
    }'
  ```
  Response: streamed/plaintext final note.

- Transcribe audio (non‑persist):
  ```bash
  curl -X POST "http://localhost:3000/api/deepgram/transcribe" \
    --cookie "YOUR_SIGNED_IN_COOKIES" \
    -F "audio=@sample.wav"
  ```
  JSON: `{ transcript, paragraphs, metadata, words, confidence }`.

- Transcribe and persist (mobile flow):
  ```bash
  curl -X POST "http://localhost:3000/api/deepgram/transcribe?persist=true" \
    --cookie "YOUR_SIGNED_IN_COOKIES" \
    -F "audio=@sample.wav"
  ```
  JSON: `{ persisted: true, sessionId, chunkId, transcript, ... }` and Ably signal to `user:{userId}`.

- Analyse clinical image (Gemini Vision via S3 or inline):
  ```bash
  curl -X POST http://localhost:3000/api/clinical-images/analyze \
    -H "Content-Type: application/json" \
    --cookie "YOUR_SIGNED_IN_COOKIES" \
    -d '{
      "imageKey": "clinical-images/abc.jpg",
      "patientSessionId": "SESSION_ID",
      "imageId": "IMAGE_ID",
      "prompt": "Left forearm abrasion"
    }'
  ```
  SSE stream: status update and final structured description.

### RAG (pilot)
- Current implementation queries Postgres vectors (`src/lib/rag/index.ts`).
- See `docs/llamaindex-rag-chatbot.md` for the Weaviate migration plan and envs.

## Scripts (Selected)
- App: `pnpm dev`, `pnpm build`, `pnpm start`
- Quality: `pnpm lint`, `pnpm check-types`, `pnpm test`
- DB: `pnpm db:push`, `pnpm db:drop`, `pnpm db:reset`, `pnpm db:studio`
- Data: `pnpm db:populate-healthify`, `pnpm db:crawl-healthify`, `pnpm db:enhance-all`
- Templates: `pnpm db:seed-templates`
- Releases/commits: `pnpm commit` (Commitizen)

## API Overview (non‑exhaustive)
Production API base: https://api.clinicpro.co.nz (BFF)
- **Clinical**
  - `POST /api/consultation/notes`
  - `POST /api/consultation/chat`
  - `POST /api/deepgram/transcribe[?persist=true]`
  - `POST /api/clinical-images/analyze`, `list`, `metadata`, `delete`
  - RAG: `POST /api/rag/query`, `GET /api/rag/stream`, admin ingest/test
- **User/session**
  - `GET/POST /api/patient-sessions`, `recording`, `stats`, `clear`
  - `GET /api/current-session`
- **Business**
  - `POST /api/create-checkout-session`
  - Templates CRUD and generators
  - Uploads: `uploads/presign`, `uploads/download`
- **Integration**
  - Ably user token
  - Stripe and Clerk webhooks
  - Tools: ACC codes lookup
- **Marketing**
  - Surveys (submit/analytics), roadmap (vote/feature‑request), email capture, contact

Auth is enforced by `middleware.ts` for most routes; admin routes require `userTier=admin`.

## Database
- Drizzle schema in `database/schema/*` (e.g., `patient_sessions`, `users`, `api_usage_costs`, `clinical_image_*`, `rag`)
- Client: `database/client.ts` (lazy Neon HTTP + Drizzle)
- Migrations: `database/migrations/*`
- Vector search helper: `src/lib/rag/index.ts`

## Configuration & Deployment
- Next config: `next.config.mjs` (bundle analysis, strict mode in prod)
- Tailwind: `tailwind.config.ts`
- Vercel functions: `vercel.json` sets maxDuration for selected API routes
- Crons:
  - `0 13 * * *` → `/api/maintenance/cleanup-mobile-tokens`
  - `0 3 * * *` → `/api/maintenance/cleanup-empty-sessions?token=${CRON_SECRET}`

## Testing & Quality
- Unit/UI tests: `pnpm test` (Vitest, jsdom)
- Linting: `pnpm lint`
- Commit style: Conventional Commits enforced via Commitlint/Commitizen (`pnpm commit`)
- Releases: `semantic-release` configured for `main` (no npm publish)

## Contributing
- Guidelines: to be filled in
- Until then:
  - Use `pnpm commit` for Conventional Commits
  - Run `pnpm lint`, `pnpm test`, `pnpm check-types` before PRs

## License
- Not specified (no `LICENSE` file found). Add a license file or clarify intended licensing.

## Acknowledgements
- Healthify NZ content used for the RAG pilot corpus
- OpenAI, Deepgram, Ably, Clerk, Stripe, Vercel, Drizzle ORM, Neon

## Notes and Caveats
- This system assists clinical documentation; it is not a diagnostic device.
- Ensure environment variables for auth, AI, and storage are correctly set before running.
