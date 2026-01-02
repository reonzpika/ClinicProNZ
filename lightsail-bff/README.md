# Lightsail BFF (Backend for Frontend)

**Version**: 2.0  
**Last Updated**: 2026-01-02  
**Status**: ✅ Production Ready

---

## Overview

This is the Backend for Frontend (BFF) service that acts as a proxy between the ClinicPro widget and Medtech ALEX API. It runs on AWS Lightsail with a static IP address (13.236.58.12) which is whitelisted by Medtech.

**Why it exists:**
- Medtech ALEX API only accepts requests from whitelisted IPs
- Vercel (where frontend is hosted) uses dynamic IPs
- BFF provides the required static IP

---

## Repository Structure

This folder contains the BFF source code within the main `ClinicProNZ` repository:

```
lightsail-bff/
├── index.js              # Main entry point (Express server)
├── medtech-bff.js        # BFF logic (routes, OAuth, ALEX API client)
├── services/             # Service modules
│   ├── alex-api-client.js    # ALEX FHIR API client
│   └── oauth-token-service.js # OAuth token management
├── package.json          # Dependencies
├── package-lock.json     # Locked versions
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── DEPLOYMENT_NOTES.md   # Deployment documentation
└── README.md             # This file
```

**Deployment Location:**
- Source: `/lightsail-bff/` in this repo
- Server: `/home/deployer/app/` on Lightsail (13.236.58.12)
- Auto-deploys via GitHub Actions when this folder changes

---

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
cd lightsail-bff
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

### 3. Run Locally

```bash
npm start
```

Server runs on http://localhost:3000

---

## Deployment

### Automatic (Recommended)

Push changes to `main` branch. GitHub Actions automatically:
1. Detects changes to `lightsail-bff/**`
2. SSHs into Lightsail
3. Pulls latest code
4. Copies files to `/home/deployer/app/`
5. Installs dependencies
6. Restarts service

See `.github/workflows/deploy-lightsail-bff.yml`

### Manual (If Needed)

```bash
# SSH into Lightsail
ssh -i your-key.pem ubuntu@13.236.58.12

# Switch to deployer user
sudo -u deployer bash
cd ~/app

# Pull latest code
git pull origin main

# Copy BFF files
rsync -av --exclude='.env' --exclude='node_modules' lightsail-bff/ .

# Install dependencies
npm ci --production

# Exit deployer user
exit

# Restart service
sudo systemctl restart clinicpro-bff

# Check status
sudo systemctl status clinicpro-bff
```

---

## Environment Variables

Required variables (see `.env.example`):

```bash
# Medtech ALEX API
MEDTECH_CLIENT_ID=your-client-id
MEDTECH_CLIENT_SECRET=your-secret
MEDTECH_TENANT_ID=your-tenant-id
MEDTECH_API_SCOPE=api://your-scope/.default
MEDTECH_API_BASE_URL=https://alexapiuat.medtechglobal.com/FHIR
MEDTECH_FACILITY_ID=F2N060-E

# Server
PORT=3000
NODE_ENV=production
```

**On Lightsail:**
- Stored in `/home/deployer/app/.env`
- Not tracked in git (`.gitignore`)
- Loaded by systemd service

---

## API Endpoints

### Test Endpoint
```bash
GET /api/medtech/test?nhi=ZZZ0016
```
Tests OAuth + FHIR Patient query

### Token Info
```bash
GET /api/medtech/token-info
```
Shows current OAuth token status

### Capabilities
```bash
GET /api/medtech/capabilities
```
Returns feature flags and coded value lists

### Commit Images (Future)
```bash
POST /api/medtech/session/commit
```
Commits session images to ALEX API

---

## Testing

### Local Test
```bash
curl http://localhost:3000/api/medtech/test?nhi=ZZZ0016
```

### Production Test
```bash
curl https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs
sudo journalctl -u clinicpro-bff -n 50

# Check file permissions
sudo chown -R deployer:deployer /home/deployer/app

# Restart
sudo systemctl restart clinicpro-bff
```

### 401 Unauthorized

Check OAuth credentials in `.env`:
- `MEDTECH_CLIENT_ID`
- `MEDTECH_CLIENT_SECRET`
- `MEDTECH_TENANT_ID`

### 503 Service Unavailable

Using wrong facility ID. Change to `F2N060-E` in `.env` for testing.

---

## Documentation

- **Project Summary**: `/project-management/medtech-integration/PROJECT_SUMMARY.md`
- **BFF Setup Guide**: `/project-management/medtech-integration/infrastructure/bff-setup.md`
- **GitHub Actions Setup**: `/project-management/medtech-integration/features/clinical-images/GITHUB_ACTIONS_SETUP.md`
- **Architecture Guide**: `/project-management/medtech-integration/infrastructure/architecture.md`

---

## Service Configuration

**Systemd Service**: `clinicpro-bff.service`
- Location: `/etc/systemd/system/clinicpro-bff.service`
- User: `deployer`
- Working Directory: `/home/deployer/app`
- Auto-restart: Enabled
- Starts on boot: Enabled

**Commands:**
```bash
sudo systemctl status clinicpro-bff   # Check status
sudo systemctl restart clinicpro-bff  # Restart
sudo systemctl stop clinicpro-bff     # Stop
sudo systemctl start clinicpro-bff    # Start
```

---

## History

- **2026-01-02**: Merged from separate `clinicpro-bff` repo into main repo
- **2025-11-11**: POST Media endpoint validated
- **2025-10-31**: Initial BFF deployment to Lightsail

---

**Server**: 13.236.58.12 (api.clinicpro.co.nz)  
**Repository**: https://github.com/reonzpika/ClinicProNZ  
**Service Status**: ✅ Production Ready
