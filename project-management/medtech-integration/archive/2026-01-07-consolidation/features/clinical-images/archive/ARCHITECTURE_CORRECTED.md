# Architecture Correction Complete ✅

**Date**: 2025-12-15  
**Issue**: Documentation incorrectly stated all API routes run on Vercel  
**Resolution**: Corrected to show split between Vercel (dynamic IP) and Lightsail BFF (static IP)

---

## What Was Wrong

Previous documentation said:
> "API routes run on Vercel in `/app/api/(integration)/medtech/` (NOT separate Lightsail server)"

This was **incorrect** because:
- ❌ Implied ALL endpoints run on Vercel
- ❌ Didn't explain why Lightsail BFF exists
- ❌ Missed the IP whitelisting requirement

---

## Correct Architecture

### The Real Setup

**Vercel (Dynamic IP)**:
- ✅ Frontend (desktop widget + mobile page)
- ✅ API routes that DON'T call Medtech ALEX API
- ✅ Examples: Session management, S3 URLs, Redis operations

**Lightsail BFF (Static IP: 13.236.58.12)**:
- ✅ API routes that DO call Medtech ALEX API
- ✅ Example: Commit endpoint (uploads to ALEX)
- ✅ Why: Medtech firewall requires whitelisted IP

### Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      User's Browser                         │
│                                                             │
│  Desktop Widget              Mobile Page                    │
│  (React/Next.js)             (React/Next.js)               │
└────────────┬─────────────────────────┬─────────────────────┘
             │                         │
             │                         │
   ┌─────────▼─────────────────────────▼────────────┐
   │              Vercel (Dynamic IP)               │
   │                                                │
   │  Session API (5 endpoints):                   │
   │  • POST /session/tokens                       │
   │  • GET /session/tokens/:token                 │
   │  • POST /session/presigned-url                │
   │  • POST /session/images                       │
   │  • GET /session/:id                           │
   │                                                │
   │  ┌──────────┐         ┌──────────┐           │
   │  │  Redis   │         │    S3    │           │
   │  │ (Upstash)│         │   AWS    │           │
   │  └──────────┘         └──────────┘           │
   └───────────────┬────────────────────────────────┘
                   │
                   │ (AJAX call from browser)
                   │
   ┌───────────────▼────────────────────────────────┐
   │      Lightsail BFF (Static IP: 13.236.58.12)  │
   │                                                │
   │  Commit API (1 endpoint):                     │
   │  • POST /session/commit                       │
   │                                                │
   │  Location: /opt/clinicpro-bff/                │
   │  Restart: systemctl restart clinicpro-bff     │
   └───────────────┬────────────────────────────────┘
                   │
                   │ (Static IP required)
                   │
   ┌───────────────▼────────────────────────────────┐
   │        Medtech ALEX API (FHIR R4)             │
   │                                                │
   │  Firewall: Only allows 13.236.58.12          │
   └────────────────────────────────────────────────┘
```

---

## What I've Fixed

### 1. ✅ Corrected Documentation (7 files)

| File | What Changed |
|------|-------------|
| `FEATURE_OVERVIEW.md` | Added architecture split, deployment strategy, component table |
| `PROJECT_SUMMARY.md` | Added deployment architecture section with flow |
| `IMPLEMENTATION_PLAN.md` | Shows which endpoints go where (5 Vercel + 1 Lightsail) |
| `README_NEXT_STEPS.md` | Updated backend phase to show 5+1 endpoint split |
| `SETUP_INSTRUCTIONS.md` | Added GitHub Actions to setup checklist |
| `GITHUB_ACTIONS_SETUP.md` | **NEW** - Complete setup guide for auto-deployment |
| `ARCHITECTURE_CORRECTED.md` | **NEW** - This file (summary of changes) |

---

### 2. ✅ Created GitHub Actions Workflow

**File**: `.github/workflows/deploy-lightsail-bff.yml`

**What it does:**
- Watches for changes to BFF-related code
- When you push to `main`, automatically:
  1. SSHs into Lightsail (13.236.58.12)
  2. Runs `git pull origin main`
  3. Runs `npm ci --production`
  4. Runs `sudo systemctl restart clinicpro-bff`
  5. Verifies service is running
  6. Comments on commit with status

**Benefits:**
- ✅ No more manual SSH deployments
- ✅ Same workflow as Vercel (push = deploy)
- ✅ Consistent every time (no human error)
- ✅ Full audit trail in GitHub Actions UI
- ✅ Easy rollback (redeploy previous commit)

**Setup required:** 10 minutes (see `GITHUB_ACTIONS_SETUP.md`)

---

### 3. ✅ Clarified Key Decisions

Now documented in `FEATURE_OVERVIEW.md` → "Development Context & Decisions":

**Codebase Architecture Clarifications**:
- **API Routes Split**: Vercel (session/S3/Redis) + Lightsail (ALEX API only)
- **Why Split**: Medtech firewall requires IP whitelisting, Vercel has dynamic IPs
- **Lightsail Location**: `/opt/clinicpro-bff/` on server
- **Restart Command**: `sudo systemctl restart clinicpro-bff`

---

## Phase 1 Implementation Plan (Updated)

### Backend (3-4 hours)

**On Vercel (5 endpoints):**
1. POST `/api/medtech/session/tokens` - Generate QR code
2. GET `/api/medtech/session/tokens/:token` - Validate token
3. POST `/api/medtech/session/presigned-url` - Get S3 upload URL
4. POST `/api/medtech/session/images` - Add image to Redis session
5. GET `/api/medtech/session/:id` - Fetch session state

**On Lightsail BFF (1 endpoint):**
6. POST `/api/medtech/session/commit` - Upload to ALEX API

**Shared Code (used by both):**
- Redis session manager (`/src/lib/services/redis/`)
- Session types (`/src/medtech/images-widget/types/`)

---

## What You Need to Do

### Option A: Setup GitHub Actions Now (Recommended)

**Time**: 10 minutes  
**Benefit**: Eliminates manual deployments forever

Follow: **[GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)**

Steps:
1. Find your SSH private key (the one you use to SSH into Lightsail)
2. Copy entire key content
3. Add to GitHub Secrets as `LIGHTSAIL_SSH_KEY`
4. Verify BFF directory is a git repo
5. Test by pushing a small change

**After setup:** Push to main → Auto-deploys to Lightsail (1-2 mins)

---

### Option B: Skip GitHub Actions For Now

You can still do manual SSH deployments:

```bash
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12
cd /opt/clinicpro-bff
git pull origin main
npm ci
sudo systemctl restart clinicpro-bff
```

**Note:** You'll need to do this every time BFF code changes during Phase 1.

---

## Your Next Steps (Updated)

### 1. Complete S3 Setup (~30 mins)

Follow: **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)**

### 2. (Optional) Setup GitHub Actions (~10 mins)

Follow: **[GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)**

### 3. Reply When Ready

> "Setup complete! Ready for backend implementation."

### 4. I'll Implement Phase 1

**On Vercel:**
- 5 API endpoints (session management, S3, Redis)
- Simple mobile page (4 screens)
- Desktop Ably listener

**On Lightsail BFF:**
- 1 commit endpoint (uploads to ALEX API)

**Total time:** 6-9 hours of implementation

---

## Summary

| Issue | Status |
|-------|--------|
| ❌ Documentation showed wrong architecture | ✅ **FIXED** - Now shows Vercel + Lightsail split |
| ❌ Unclear which endpoints go where | ✅ **FIXED** - Clear 5+1 split documented |
| ❌ Manual SSH deployments required | ✅ **SOLVED** - GitHub Actions auto-deploy |
| ❌ Lightsail BFF path unknown | ✅ **DOCUMENTED** - `/opt/clinicpro-bff/` |
| ❌ Restart command unknown | ✅ **DOCUMENTED** - `systemctl restart clinicpro-bff` |

---

**Architecture is now correctly documented! 🎉**

All documentation updated, GitHub Actions workflow created, ready for Phase 1 implementation after you complete S3 setup.

---

**Questions?**

- Architecture still unclear? Ask me to explain any part.
- Want to skip GitHub Actions? That's fine, we can do manual deployments.
- Ready to start S3 setup? Follow [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)

**Let me know when setup is complete!**

---

**End of Architecture Correction Summary**
