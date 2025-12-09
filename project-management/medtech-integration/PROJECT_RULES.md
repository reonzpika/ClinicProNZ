# Medtech Integration - Project Rules

**Last Updated**: 2025-12-09

---

## Before Starting Work

1. **Read PROJECT_RULES.md** (this file) first
2. Read **PROJECT_SUMMARY.md** for current status
3. Read relevant **feature's FEATURE_OVERVIEW.md** for architectural context
4. Check **DEVELOPMENT_ROADMAP.md** for task details

---

## Documentation Update Workflow

### Always Update (After Completing Any Task)
- ✅ **PROJECT_SUMMARY.md** - Update quick reference, status, recent updates

### Update When Appropriate
- **FEATURE_OVERVIEW.md** - Major architectural decisions or technology changes
- **DEVELOPMENT_ROADMAP.md** - Task completion, phase changes, time estimate updates
- **CHANGELOG.md** - Significant changes with date, what changed, impact

### Never Update
- ❌ **STATUS_DETAILED.md** - Deprecated, not maintained

---

## Hard Constraints (Never Violate)

### Infrastructure
- ❌ **BFF must have static IP** - Don't suggest serverless for BFF (Medtech firewall requires whitelisting)
- ❌ **Single Lightsail BFF** - Currently one instance at api.clinicpro.co.nz (13.236.58.12)

### FHIR/API
- ❌ **FHIR R4 spec is authoritative** - Check spec, don't assume fields or behavior
- ❌ **identifier field is mandatory** - All Media resources must include identifier with system + value
- ❌ **Images must be <1MB** - Compress before upload

### Testing
- ❌ **Always use test facility F2N060-E** - Don't use production facility IDs in development
- ❌ **Test patient ID**: 14e52e16edb7a435bfa05e307afd008b (NHI: ZZZ0016)

### Sessions
- ❌ **Sessions are temporary** - 10-minute lifetime, not persistent storage

---

## Workflow Steps (Always Follow)

### When Making Architectural Decisions
1. Document decision in FEATURE_OVERVIEW.md
2. Update PROJECT_SUMMARY.md with reference
3. Update DEVELOPMENT_ROADMAP.md if phases/tasks affected

### When Completing Tasks
1. Mark task complete in DEVELOPMENT_ROADMAP.md
2. Update PROJECT_SUMMARY.md quick reference
3. Add entry to CHANGELOG.md if significant

### When Discovering New Constraints
1. Add to PROJECT_RULES.md (this file)
2. Update FEATURE_OVERVIEW.md if architectural impact
3. Update PROJECT_SUMMARY.md recent updates section

---

## External Dependencies

### ALEX API
- **Source of truth**: https://alexapidoc.medtechglobal.com/
- **Always check docs** before implementing new endpoints
- **UAT Environment**: https://alexapiuat.medtechglobal.com/FHIR
- **Contact**: Medtech support if API behavior unclear

### BFF (Backend for Frontend)
- **Location**: Lightsail (api.clinicpro.co.nz)
- **IP**: 13.236.58.12 (whitelisted by Medtech)
- **Code location**: /home/deployer/app
- **Service**: clinicpro-bff.service (systemd)

### Medtech Evolution
- **Launch mechanism**: Unknown (Phase 3 investigation needed)
- **Context passing**: Unknown (how to receive patient/encounter ID)

---

## User Context

### Primary Users
- **GPs (General Practitioners)** - New Zealand primary care physicians
- Frame all features from GP workflow perspective
- Use clinical terminology correctly
- Focus on speed and simplicity (GPs are time-constrained)

### Use Cases
- Capture clinical images during consultation
- Mobile handoff (QR code for phone camera)
- Images available for HealthLink/ALEX referrals

---

## Technology Stack (Don't Change Without Discussion)

- **Frontend**: React/Next.js on Vercel
- **BFF**: Node.js on Lightsail (static IP requirement)
- **Real-time**: Ably (already integrated)
- **Session Storage**: Redis + S3 (Phase 1 decision)
- **Image Format**: JPEG (convert HEIC on frontend)
- **Compression**: Frontend (before upload)

---

## Scale Assumptions

- **Target**: 100 concurrent GPs
- **Average session**: 5 images, 1MB each, 10 minutes
- **Daily usage**: 500-1000 sessions/day

---

*Update this file when new constraints discovered or workflow changes.*
