# Clinical Images Feature

**Last Updated**: 2025-12-15  
**Status**: Implementation Ready - Comprehensive Specs Complete  
**Completion**: ~30% (Infrastructure complete, UI/UX specs finalized, Redis/Ably architecture defined)

---

## Feature Purpose

Enable GPs to capture clinical images from within Medtech Evolution and save directly to patient encounters. Includes mobile QR handoff for phone camera capture. Images instantly available for HealthLink/ALEX referrals.

**Key Value Proposition**: Fast clinical image capture with mobile handoff, desktop review, and direct Medtech integration.

---

## Implementation Documentation

**Primary Implementation Guide:**

1. **[implementation-documentation.md](./implementation-documentation.md)** - **START HERE** - Complete implementation guide for AI agent with database schema, API endpoints, frontend code examples, and deployment instructions

**Supporting Specifications:**

2. **[mobile-ui-spec.md](./mobile-ui-spec.md)** - Complete mobile UI specification (7 screens, data flow, validation)
3. **[desktop-ui-spec.md](./desktop-ui-spec.md)** - Complete desktop UI specification (layout, components, interactions)
4. **[test-results.md](./test-results.md)** - FHIR API validation results (POST Media confirmed working)

---

## Current Status

### What's Working ✅
- Infrastructure complete (OAuth, BFF, ALEX API connectivity)
- POST Media validated (widget can upload images to Medtech)
- Desktop widget foundation (components, store, hooks)
- QR code generation for mobile handoff

### What's Pending ⏳

**Phase 1: Mobile Upload & Real-Time Sync** (Current Focus)
- [ ] Redis session storage implementation (Upstash)
- [ ] S3 bucket setup with lifecycle policies
- [ ] Mobile page implementation (7 screens)
- [ ] Desktop Ably listener implementation
- [ ] BFF API endpoints (6 endpoints):
  - POST /api/session-tokens
  - GET /api/session-tokens/:token
  - POST /api/users/:userId/presigned-url
  - POST /api/users/:userId/images
  - GET /api/users/:userId/session
  - POST /api/users/:userId/commit
- [ ] Image compression (client-side, <1MB target)
- [ ] Real-time Ably sync (mobile → desktop)
- [ ] End-to-end testing (mobile capture → desktop preview → commit)

**Phase 2: Complete Integration** (Not Started)
- [ ] Desktop UI polish (patient banner, warnings, metadata fields)
- [ ] Error handling improvements
- [ ] Widget launch mechanism research

**Phase 3: Production Deployment** (Not Started)
- [ ] Production environment configuration
- [ ] Medtech partner integration testing

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
| BFF | Node.js/Express (Lightsail) | OAuth, FHIR translation, static IP for Medtech firewall |
| Session Storage | Redis (Upstash) | Session metadata, S3 keys (2-hour TTL) |
| Image Storage | S3 (`clinicpro-images-temp`) | Temporary image storage (1-hour lifecycle) |
| Real-Time Sync | Ably | Mobile → Desktop notifications |
| ALEX API | Medtech FHIR R4 | Upload images to patient encounters |

**Key Infrastructure:**
- **Redis Keys**: `user:{userId}` (session data), `session-token:{token}` (QR tokens)
- **S3 Bucket**: `clinicpro-images-temp` in `ap-southeast-2` with 1-hour lifecycle policy
- **Ably Channel**: `session:{userId}` for real-time image notifications
- **Image Compression**: Client-side via `browser-image-compression` (target <1MB, JPEG 85% quality)

---

## Key Architectural Decisions

### UI/UX Decisions (2025-12-09)

#### Session Scope: Per Patient
- **Decision**: One session per patient, expires after 1 hour from last activity
- **Rationale**: Simplifies patient tracking, prevents wrong-patient uploads, natural clinical workflow
- **Behavior**: When patient changes, widget closes (with warning if uncommitted images)

#### Two Commit Paths
- **Decision**: Desktop review (default/recommended) + Mobile direct commit (optional)
- **Rationale**: Desktop review provides safety net (Media resources cannot be edited/deleted after commit), mobile direct provides speed when needed
- **Validation**: Desktop enforces body site/comment required; mobile allows upload without metadata

#### Metadata Fields
- **Decision**: 
  - Body Site / Comment: Required (desktop), optional (mobile)
  - Laterality: Left / Right / N/A (not "Both"), optional
  - View, Type, Notes: Optional
- **Rationale**: Body site is clinically essential; laterality often N/A (e.g., torso images); "Both" was ambiguous

#### Media Immutability
- **Decision**: Accepted that committed images cannot be edited or deleted via API
- **Rationale**: ALEX API does not support PUT/PATCH/DELETE on Media resources (confirmed via Perplexity research)
- **Mitigation**: Desktop review screen prevents committing mistakes

#### Session Storage: Redis + S3
- **Decision**: Use Redis for session metadata, S3 for temporary image storage
- **Rationale**: Supports 100+ concurrent GPs, survives BFF restart, 10,000x lower memory usage vs in-memory

#### Real-Time Sync: Ably
- **Decision**: Use existing Ably infrastructure for mobile → desktop sync
- **Rationale**: Already integrated, handles reconnection automatically, supports 200 concurrent connections (100 GPs target)

#### Image Compression: Frontend
- **Decision**: Compress images on mobile/desktop before upload (target <1MB)
- **Rationale**: Reduces bandwidth, works cross-platform (Canvas API), saves backend CPU

#### Image Format: HEIC → JPEG Conversion
- **Decision**: Convert HEIC to JPEG using browser Canvas API before upload
- **Rationale**: Cross-platform support (iOS/Android), reduces backend complexity

#### Mobile UX: Single Image Review After Capture
- **Decision**: After camera capture, show immediate review screen (Screen 3A) with metadata entry
- **Rationale**: Allows GP to reject/retake immediately, add metadata while patient context fresh, supports quick multi-image capture

#### Desktop UX: Silent Real-Time Updates
- **Decision**: When mobile uploads image, it appears in thumbnail strip without toast notification
- **Rationale**: Avoids interrupting GP's workflow, thumbnails provide sufficient visual feedback

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

## Scale Assumptions & Resource Planning

**Target Capacity**: 100 concurrent GPs

**Usage Patterns**:
- **Average session**: 5 images per session, 1MB each (after compression)
- **Session duration**: 10 minutes average, 2-hour max TTL
- **Daily usage**: 5-10 sessions per GP per day
- **Monthly volume**: 50,000-100,000 image uploads

**Infrastructure Requirements (100 Concurrent GPs)**:

| Resource | Specification | Cost Estimate |
|----------|--------------|---------------|
| Redis (Upstash) | ~10MB storage (session metadata only) | Free tier sufficient |
| S3 Storage | ~500MB temporary (1-hour lifecycle, auto-cleanup) | ~$0.01/month |
| Ably | 100 connections, ~5,000 messages/day | Free tier (supports 200 connections, 100k messages/day) |
| BFF (Lightsail) | 512MB-1GB RAM, 1 vCPU | Current $10/month sufficient |

**Bottlenecks & Limits**:
- **Redis Session Limit**: 50 images per session (configurable)
- **S3 Upload Timeout**: 60 seconds per image
- **Ably Message Size**: Max 32KB per message (sufficient for metadata)
- **ALEX API Rate Limits**: Unknown (assume conservative ~10 req/sec)

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

### Phase 1: Mobile Upload & Real-Time Sync (CURRENT)
**Time**: 8-12 hours  
**Status**: Ready to Start - Complete specs available in implementation-documentation.md

**Backend Tasks** (3-5 hours):
- [ ] Setup Upstash Redis instance and configure connection
- [ ] Setup S3 bucket with lifecycle policy (1-hour expiry)
- [ ] Implement 6 BFF API endpoints (session tokens, presigned URLs, images, commit)
- [ ] Integrate ALEX OAuth service with Redis session storage
- [ ] Implement FHIR Media resource builder

**Frontend Mobile Tasks** (3-5 hours):
- [ ] Implement mobile page with 7 screens (using mobile-ui-spec.md)
- [ ] Implement image compression (browser-image-compression)
- [ ] Integrate S3 upload flow via presigned URLs
- [ ] Implement Ably publisher for image-uploaded events
- [ ] Implement session validation and error handling

**Frontend Desktop Tasks** (2-3 hours):
- [ ] Implement Ably subscriber for image-uploaded events
- [ ] Update desktop widget to fetch session on load
- [ ] Implement real-time image preview updates
- [ ] Update commit flow to use Redis session data
- [ ] Add disconnection detection and manual refresh

**Testing** (1-2 hours):
- [ ] End-to-end flow: QR scan → Mobile capture → Desktop preview → Commit
- [ ] Error scenarios (network failure, session expiry, S3 upload failure)
- [ ] Cross-device testing (iOS Safari, Android Chrome)

### Phase 2: Complete Integration (NOT STARTED)
**Time**: 4-6 hours  
**Status**: Awaiting Phase 1 completion

- [ ] Desktop UI polish (patient banner, warnings, metadata validation)
- [ ] Enhanced error handling and retry logic
- [ ] Performance optimization
- [ ] Production testing with real GP workflows

### Phase 3: Widget Launch Mechanism (NOT STARTED)
**Time**: 3-5 hours  
**Status**: Awaiting Medtech partner guidance

- [ ] Research Medtech Evolution widget launch patterns
- [ ] Implement patient/encounter context passing
- [ ] Test launch flow from Medtech Evolution
- [ ] Ready for GP practice pilots

**Total Estimated Time**: 15-23 hours across 3 phases

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

## Validation Rules

### Mobile (Lenient)
- **All fields optional**
- GP can upload images without any metadata
- Rationale: Mobile is for quick capture, desktop provides validation

### Desktop (Strict)
- **Body Site / Comment**: Required (cannot commit without)
- **Laterality**: Optional
- **View, Type, Notes**: Optional
- Visual feedback: Yellow badge on thumbnail if body site missing

---

## Critical Constraints

### Media Resource Immutability
**Confirmed via Perplexity research of ALEX API documentation (2025-12-09):**

> "Media resources in ALEX are currently read/create only via the documented API; there is no documentation of any ability to update or delete Media once created, nor any described versioning or correction workflow for Media itself."

**Implications**:
- Once committed to Medtech, images cannot be edited via API
- Desktop review screen is **essential** (not optional)
- GPs must verify all details before committing
- Mistakes require manual correction in Medtech (not via widget)

---

## Open Questions

**For Medtech Partner Support** (see [medtech-support-questions.md](../../reference/medtech-support-questions.md)):
1. Launch URL format for ALEX Apps
2. Patient context fields passed at launch (patient ID, NHI, encounter, facility, provider)
3. Launch token validation mechanism
4. ALEX Apps registration process
5. Embedding method (iFrame, new window, or tab)
6. Lifecycle events or callbacks (if any)
7. Example integration documentation

**For Implementation**:
1. **Session persistence**: Should session survive page refresh? (Recommend: Yes, 1 hour TTL)
2. **Maximum images per session**: Impose hard limit? (Recommend: 20 images)
3. **HEIC backend handling**: Should backend handle HEIC → JPEG conversion as fallback? (Recommend: Yes, as fallback)

---

## References

### Implementation Specs
- **[mobile-ui-spec.md](./mobile-ui-spec.md)** - Complete mobile UI specification
- **[desktop-ui-spec.md](./desktop-ui-spec.md)** - Complete desktop UI specification
- **[implementation-requirements.md](./implementation-requirements.md)** - Technical requirements

### Integration Reference
- **[medtech-evolution-integration.md](../../reference/medtech-evolution-integration.md)** - Medtech Evolution widget integration patterns
- **[medtech-support-questions.md](../../reference/medtech-support-questions.md)** - Questions for Medtech partner support
- **[alex-api.md](../../reference/alex-api.md)** - ALEX FHIR API reference

### Project Docs
- **[DEVELOPMENT_ROADMAP.md](../../DEVELOPMENT_ROADMAP.md)** - Implementation phases and tasks
- **[architecture.md](../../infrastructure/architecture.md)** - Technical architecture details
- **[test-results.md](./test-results.md)** - POST Media validation results
- **[oauth-and-config.md](../../infrastructure/oauth-and-config.md)** - OAuth config, environment variables

---

*This is a living document. Update when architectural decisions change or new phases begin.*
