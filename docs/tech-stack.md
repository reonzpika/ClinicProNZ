## ClinicPro Tech Stack

### Overview
- **App type**: Next.js (App Router) full‑stack app, React 19, TypeScript 5
- **Hosting**: Vercel serverless functions + scheduled crons
- **Package manager**: pnpm (primary), npm in CI

### Frontend
- **Framework**: Next.js 15, React 19, TypeScript 5
- **Styling**: Tailwind CSS 3, PostCSS (autoprefixer, cssnano), tailwindcss-animate
- **UI primitives**: Radix UI, lucide-react icons
- **Utilities**: class-variance-authority, tailwind-merge, clsx
- **State/data**: TanStack React Query 5 (+ Devtools), Zustand
- **Markdown**: react-markdown, remark-gfm, rehype-raw, isomorphic-dompurify
- **Animation/media**: framer-motion, gsap, lenis, qrcode.react, ogl

### Backend & APIs
- **Runtime**: Next.js API routes (Edge/Node serverless on Vercel)
- **AI/LLM**:
  - OpenAI (`openai`) for chat/embeddings
  - Anthropic Claude 3.5 Sonnet Vision (`@anthropic-ai/sdk`) for image analysis
  - Vercel AI SDK (`ai`, `@ai-sdk/openai`) present
- **Speech‑to‑text**: Deepgram SDK
- **Realtime**: Ably Realtime/REST (`ably`)
- **File handling**: formidable
- **Logging**: pino, pino-pretty, @logtail/pino

### Database & Persistence
- **Primary DB**: PostgreSQL (Neon serverless)
- **ORM/Schema**: Drizzle ORM + drizzle-kit
- **Vectors**: pgvector
- **Driver/clients**: `pg`, `postgres`, Neon HTTP (`@neondatabase/serverless`)

### Caching
- **Redis**: Upstash Redis (`@upstash/redis`)

### Storage & Media
- **Object storage**: AWS S3 (AWS SDK v3, presigned URLs), region `ap-southeast-2`
- **Image processing**: sharp

### Auth & Identity
- **Auth provider**: Clerk (Next.js SDK, middleware)
- **Webhooks**: Svix verification for Clerk events

### Payments & Billing
- **Provider**: Stripe (Checkout sessions, webhooks)

### Deployment & CI/CD
- **Platform**: Vercel (serverless functions, `vercel.json` crons)
- **GitHub Actions**: semantic-release, dependency updates, Crowdin translations, CI placeholder

### Testing & Quality
- **Unit/UI tests**: Vitest (jsdom, @vitest/expect, coverage-v8)
- **Testing Library**: @testing-library/react, @testing-library/jest-dom
- **Linting**: ESLint (antfu), @next/eslint-plugin-next, eslint-plugin-tailwindcss, eslint-plugin-react-hooks,
  eslint-plugin-testing-library, eslint-plugin-jest-dom, eslint-plugin-playwright, simple-import-sort, eslint-plugin-format
- **Type checking**: TypeScript (`tsc`)
- **Git hooks/commit**: Husky, Commitlint + cz-commitlint + Commitizen
- **Releases**: semantic-release

### Notable Config Files
- **Next**: `next.config.mjs`
- **TypeScript**: `tsconfig.json`
- **Tailwind**: `tailwind.config.ts` / `postcss.config.js`
- **ESLint**: `eslint.config.mjs`
- **Vitest**: `vitest.config.mts` / `vitest-setup.ts`
- **Drizzle**: `drizzle.config.ts`, `database/schema/*`, `database/migrations/*`
- **Vercel**: `vercel.json`
- **GitHub Actions**: `.github/workflows/*.yml`

### Environment Variables (selected)
- **Database**: `DATABASE_URL`
- **OpenAI**: `OPENAI_API_KEY`
- **Anthropic**: `ANTHROPIC_API_KEY`
- **Perplexity (optional)**: `PPLX_API_KEY`, `PPLX_MODEL`
- **Deepgram**: none required in code (uses API key at call sites if configured)
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Clerk**: `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
- **Ably**: `ABLY_API_KEY`
- **Redis (Upstash)**: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- **AWS S3**: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
- **Search (optional)**: `GOOGLE_SEARCH_API_KEY`, `GOOGLE_SEARCH_ENGINE_ID`
- **Google Maps (optional)**: `GOOGLE_MAPS_API_KEY`
- **RAG**: `RAG_ENFORCE_TIER`
- **Vercel Cron**: `CRON_SECRET` (used in scheduled routes)

### Package Management
- **pnpm** (primary) — see `packageManager` in `package.json`
- **npm** used in some GitHub Actions (release/update flows)

### Notes
- App Router confirmed via `app/**/page.tsx`.
- Neon used via `@neondatabase/serverless`; vectors with `pgvector`.
- Image analysis path uses Claude Vision; embeddings via OpenAI.
- Realtime sync for mobile/desktop flows via Ably channels.
