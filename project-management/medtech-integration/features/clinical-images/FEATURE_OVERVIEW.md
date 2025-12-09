# Clinical Images Feature

**Last Updated**: 2025-12-09  
**Status**: Phase 1 In Progress - Mobile Upload & Dataflow  
**Completion**: ~30% (Infrastructure complete, mobile implementation pending)

---

## Feature Purpose

Enable GPs to capture clinical images from within Medtech Evolution and save directly to patient encounters. Includes mobile QR handoff for phone camera capture. Images instantly available for HealthLink/ALEX referrals.

---

## Current Status

### What's Working ✅
- Infrastructure complete (OAuth, BFF, ALEX API connectivity)
- POST Media validated (widget can upload images to Medtech)
- Desktop widget complete (capture, edit, metadata, commit flow)
- QR code generation for mobile handoff

### What's Not Done ⏳
- Mobile upload uses placeholder (alert instead of real backend)
- No mobile → desktop sync mechanism
- Backend commit endpoint mocked (not connected to real ALEX API)
- Widget launch mechanism unknown (Phase 3)

---

## Architecture Overview

### High-Level Flow

```
GP opens Medtech Evolution
    → Launches ClinicPro Images Widget (desktop browser)
    → Option A: Upload from desktop camera/files
    → Option B: Scan QR code → Opens mobile page
                              → Capture with phone camera
                              → Upload to S3
                              → Redis stores session + S3 keys
                              → Ably notifies desktop (real-time)
                              → Desktop polls Redis for images
    → Desktop: Review, edit, add metadata
    → Desktop: Commit → BFF fetches from S3
                      → Converts to FHIR Media resource
                      → POST to ALEX API
                      → Medtech stores in patient encounter
```

### Component Architecture

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Desktop Widget | React/Next.js (Vercel) | Image capture, editing, metadata entry |
| Mobile Page | React/Next.js (Vercel) | Phone camera capture, QR handoff |
| BFF | Node.js (Lightsail) | OAuth, FHIR translation, static IP for Medtech firewall |
| Session Storage | Redis | Session metadata, S3 keys (10-minute TTL) |
| Image Storage | S3/Supabase Storage | Temporary image storage (1-hour retention) |
| Real-Time Sync | Ably | Mobile → Desktop notifications |
| ALEX API | Medtech FHIR R4 | Upload images to patient encounters |

---

## Key Architectural Decisions

### Phase 1 Decisions (2025-12-09)

#### Session Storage: Redis + S3
- **Decision**: Use Redis for session metadata, S3 for temporary image storage
- **Rationale**: Supports 100+ concurrent GPs, survives BFF restart, 10,000x lower memory usage vs in-memory

#### Real-Time Sync: Ably
- **Decision**: Use existing Ably infrastructure for mobile → desktop sync
- **Rationale**: Already integrated, handles reconnection automatically, supports 200 concurrent connections (100 GPs target)

#### Session Lifetime: Inactivity Timeout
- **Decision**: 10-minute session expiry after last activity (no heartbeat)
- **Rationale**: Avoids heartbeat message overhead (19% of monthly Ably quota), simpler code

#### Image Compression: Frontend
- **Decision**: Compress images on mobile/desktop before upload
- **Rationale**: Reduces bandwidth, works cross-platform (Canvas API), saves backend CPU

#### Image Format: HEIC → JPEG Conversion on Frontend
- **Decision**: Convert HEIC to JPEG using browser Canvas API before upload
- **Rationale**: Cross-platform support (iOS/Android), reduces backend complexity, existing code reusable

#### Mobile Metadata Entry: Optional Basic Fields
- **Decision**: Mobile can optionally add laterality and body site (desktop can edit later)
- **Rationale**: GPs often know body site when capturing, laterality is clinically important, keeps mobile fast

---

### Earlier Decisions (2025-10-31, 2025-01-15)

#### Integration Gateway (BFF)
- **Decision**: Use abstraction layer (BFF) instead of direct FHIR from frontend
- **Rationale**: Decouples frontend from FHIR complexity, handles ALEX-specific quirks, enables provider flexibility

#### BFF Deployment: Lightsail with Static IP
- **Decision**: Deploy BFF on Lightsail (13.236.58.12), not Vercel serverless
- **Rationale**: Medtech firewall requires IP whitelisting, Vercel uses dynamic IPs

#### Clinical Metadata Limitation
- **Decision**: Capture metadata in frontend but don't expect it to appear in Medtech UI
- **Rationale**: Optional FHIR Media elements (body site, laterality, view type) cannot be mapped to Medtech Inbox fields

#### Encounter Linkage
- **Decision**: POST Media resource directly, no separate DocumentReference
- **Rationale**: Media resource automatically creates Daily Record entry against patient record

---

## Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend (Desktop) | React/Next.js + Vercel | Widget UI, image editing, metadata entry |
| Frontend (Mobile) | React/Next.js + Vercel | Phone camera capture, QR handoff |
| BFF | Node.js + Lightsail | Static IP for Medtech firewall, OAuth token management |
| Session Storage | Redis (Upstash) | Session metadata, survives restarts, scales to 100+ GPs |
| Image Storage | S3 / Supabase Storage | Temporary storage (1-hour retention), 10,000x lower memory |
| Real-Time Sync | Ably | Mobile ↔ Desktop communication, auto-reconnect, message replay |
| Authentication | OAuth 2.0 | Medtech ALEX API requirement |
| API Protocol | FHIR R4 | Medtech ALEX API standard |
| Image Compression | Browser Canvas API | Cross-platform (iOS/Android), frontend processing |

---

## Scale Assumptions

- **Target**: 100 concurrent GPs
- **Average session**: 5 images per session, 1MB each (after compression)
- **Session duration**: 10 minutes average
- **Daily usage**: 5-10 sessions per GP per day
- **Monthly volume**: 50,000-100,000 image uploads

### Resource Usage (100 Concurrent GPs)
- **Redis memory**: ~10MB (session metadata only)
- **S3 storage**: ~500MB temporary (1-hour retention, auto-cleanup)
- **Ably connections**: 100 concurrent (free tier supports 200)
- **Ably messages**: ~5,000/day (free tier supports 100,000/day)
- **BFF memory**: 512MB-1GB sufficient

---

## Integration Points

### External Systems
- **Medtech ALEX API**: https://alexapiuat.medtechglobal.com/FHIR (UAT)
- **BFF**: https://api.clinicpro.co.nz (13.236.58.12)
- **Frontend**: Vercel deployment
- **Medtech Evolution**: Desktop application (GP launches widget from here)

### Internal Services
- **OAuth Service**: `/src/lib/services/medtech/oauth-token-service.ts`
- **ALEX API Client**: `/src/lib/services/medtech/alex-api-client.ts`
- **Image Compression**: `/src/medtech/images-widget/services/compression.ts`
- **Ably Integration**: `/src/features/clinical/mobile/hooks/useSimpleAbly.ts`

---

## Development Phases

### Phase 1: Mobile Upload & Dataflow (CURRENT)
**Time**: 6-8 hours  
**Status**: In Progress

- Mobile upload UI with real backend (replace alert)
- Redis + S3 session storage implementation
- Mobile → Desktop sync via Ably
- Dataflow documentation

### Phase 2: Complete Integration
**Time**: 4-6 hours  
**Status**: Not Started

- Connect real ALEX API to commit endpoint
- Build FHIR Media resource from session images
- End-to-end testing with real images
- Error handling validation

### Phase 3: Widget Launch Mechanism
**Time**: 3-5 hours  
**Status**: Not Started

- Determine how to launch from Medtech Evolution
- Implement patient context passing
- Test launch flow
- Ready for GP practice pilots

**Total Estimated Time**: 13-19 hours (6-8h Phase 1 + 4-6h Phase 2 + 3-5h Phase 3)

---

## Key Files

### Frontend
- Desktop widget: `/src/medtech/images-widget/`
- Desktop page: `/app/(medtech)/medtech-images/page.tsx`
- Mobile page: `/app/(medtech)/medtech-images/mobile/page.tsx`
- Widget store: `/src/medtech/images-widget/store/imageWidgetStore.ts`

### Backend (BFF)
- Commit endpoint: `/app/api/(integration)/medtech/attachments/commit/route.ts`
- Mobile upload: `/app/api/(integration)/medtech/mobile/upload/route.ts` (to be created)
- OAuth service: `/src/lib/services/medtech/oauth-token-service.ts`
- ALEX API client: `/src/lib/services/medtech/alex-api-client.ts`

### Shared Services
- Image compression: `/src/medtech/images-widget/services/compression.ts`
- Ably hook: `/src/features/clinical/mobile/hooks/useSimpleAbly.ts`

---

## References

- **[DEVELOPMENT_ROADMAP.md](../../DEVELOPMENT_ROADMAP.md)** - Implementation phases and tasks
- **[ARCHITECTURE_AND_TESTING_GUIDE.md](../../docs/ARCHITECTURE_AND_TESTING_GUIDE.md)** - Technical architecture details
- **[FHIR_API_TEST_RESULTS.md](../../docs/FHIR_API_TEST_RESULTS.md)** - POST Media validation results
- **[TECHNICAL_CONFIG.md](../../docs/TECHNICAL_CONFIG.md)** - OAuth config, API endpoints

---

*This is a living document. Update when architectural decisions change or new phases begin.*
