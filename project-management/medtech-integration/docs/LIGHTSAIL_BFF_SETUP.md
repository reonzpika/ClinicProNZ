# Lightsail BFF Setup Documentation

**Version**: 1.0  
**Last Updated**: 2025-11-11  
**Status**: ✅ Production Ready

---

## Overview

The Lightsail BFF (Backend for Frontend) is a Node.js Express server that acts as a proxy between the ClinicPro widget (hosted on Vercel) and the Medtech ALEX API. It's required because only whitelisted static IPs can access the ALEX API.

**Purpose**: 
- Provide static IP (13.236.58.12) for ALEX API access
- Manage OAuth token caching
- Proxy FHIR API requests
- Handle ALEX-specific headers and authentication

---

## Server Details

### Instance Information
- **Provider**: AWS Lightsail
- **Static IP**: `13.236.58.12`
- **Domain**: `api.clinicpro.co.nz`
- **Instance Name**: `ip-172-26-3-91`
- **OS**: Ubuntu
- **Access**: SSH via key-based authentication

### Service Configuration
- **Service Name**: `clinicpro-bff.service`
- **Service Type**: systemd
- **User**: `deployer`
- **Port**: `3000`
- **Auto-start**: Enabled (starts on boot)
- **Auto-restart**: Enabled (restarts on failure)

---

## Directory Structure

```
/home/deployer/app/
├── .env                    # Environment variables (sensitive)
├── .git/                   # Git repository
├── .gitignore              # Git ignore rules
├── index.js                # Main entry point (starts Express server)
├── medtech-bff.js         # BFF logic (routes, OAuth, ALEX API client)
├── services/               # Service modules
├── node_modules/           # Dependencies
├── package.json            # Project dependencies
├── package-lock.json       # Locked dependency versions
├── DEPLOYMENT_NOTES.md     # Deployment documentation
└── README.md               # Project readme
```

---

## Service File

**Location**: `/etc/systemd/system/clinicpro-bff.service`

```ini
[Unit]
Description=ClinicPro BFF (Node)
After=network.target

[Service]
User=deployer
Group=deployer
WorkingDirectory=/home/deployer/app
EnvironmentFile=/home/deployer/app/.env
Environment=NODE_ENV=production PORT=3000
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

**Key Points**:
- Service runs as `deployer` user (not root)
- Loads environment variables from `/home/deployer/app/.env`
- Automatically restarts on failure (after 3 seconds)
- Starts on boot (`enabled`)

---

## Environment Variables

**Location**: `/home/deployer/app/.env`

```bash
# Medtech ALEX API Configuration
MEDTECH_CLIENT_ID=7685ade3-f1ae-4e86-a398-fe7809c0fed1
MEDTECH_CLIENT_SECRET=[secret]
MEDTECH_TENANT_ID=8a024e99-aba3-4b25-b875-28b0c0ca6096
MEDTECH_API_SCOPE=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default
MEDTECH_API_BASE_URL=https://alexapiuat.medtechglobal.com/FHIR
MEDTECH_FACILITY_ID=F2N060-E  # Use F2N060-E for testing (Medtech's facility)

# Server Configuration
PORT=3000
NODE_ENV=production
```

**Important Variables**:
- `MEDTECH_FACILITY_ID`: 
  - `F2N060-E` - Medtech's test facility (no Hybrid Connection Manager needed) ✅
  - `F99669-C` - Your local facility (requires Hybrid Connection Manager) ⚠️
- `MEDTECH_API_BASE_URL`: Use UAT for testing, production URL when ready
- `PORT`: Must match nginx/proxy configuration

---

## Dependencies

**From `package.json`**:

```json
{
  "name": "clinicpro-bff",
  "version": "0.2.0",
  "main": "index.js",
  "engines": {
    "node": ">=20"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.2"
  }
}
```

**Simple Stack**:
- Express for HTTP server
- CORS for cross-origin requests (Vercel → Lightsail)
- dotenv for environment variable loading

---

## SSH Access

### Connect to Server

```bash
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12
```

### Switch to Deployer User (if needed)

```bash
sudo su - deployer
```

### Key Locations
- **SSH Key**: Stored locally on your machine
- **Authorized Keys**: `/home/ubuntu/.ssh/authorized_keys`

---

## Common Operations

### Check Service Status

```bash
sudo systemctl status clinicpro-bff
```

**Expected Output**:
```
● clinicpro-bff.service - ClinicPro BFF (Node)
   Loaded: loaded (/etc/systemd/system/clinicpro-bff.service; enabled)
   Active: active (running) since [timestamp]
   Main PID: [pid]
```

---

### View Logs

**Last 50 lines**:
```bash
sudo journalctl -u clinicpro-bff -n 50
```

**Follow logs (live tail)**:
```bash
sudo journalctl -u clinicpro-bff -f
```

**Filter by time**:
```bash
# Today's logs
sudo journalctl -u clinicpro-bff --since today

# Last hour
sudo journalctl -u clinicpro-bff --since "1 hour ago"
```

---

### Restart Service

```bash
sudo systemctl restart clinicpro-bff
```

**Check if restart was successful**:
```bash
sudo systemctl status clinicpro-bff
```

---

### Update Environment Variables

**Edit .env file**:
```bash
sudo nano /home/deployer/app/.env
```

**After editing**:
```bash
# Save changes (Ctrl+X, Y, Enter)

# Restart service to load new variables
sudo systemctl restart clinicpro-bff

# Verify service started successfully
sudo systemctl status clinicpro-bff
```

---

### Deploy Code Changes

```bash
# 1. SSH into server
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12

# 2. Navigate to app directory
cd /home/deployer/app

# 3. Check current branch and status
git status
git branch

# 4. Pull latest code
sudo -u deployer git pull origin main  # or your branch name

# 5. Install dependencies (if package.json changed)
sudo -u deployer npm install

# 6. Restart service
sudo systemctl restart clinicpro-bff

# 7. Check logs for errors
sudo journalctl -u clinicpro-bff -f

# 8. Test endpoint
curl http://localhost:3000/api/medtech/test?nhi=ZZZ0016
```

---

### Test Endpoints Locally

**From Lightsail server**:

```bash
# Test endpoint (OAuth + Patient query)
curl http://localhost:3000/api/medtech/test?nhi=ZZZ0016

# Token info
curl http://localhost:3000/api/medtech/token-info

# Health check (if available)
curl http://localhost:3000/health
```

**From external (your computer)**:

```bash
# Test endpoint
curl https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016

# Token info
curl https://api.clinicpro.co.nz/api/medtech/token-info
```

---

## Troubleshooting

### Service Won't Start

**Check logs**:
```bash
sudo journalctl -u clinicpro-bff -n 100
```

**Common issues**:
- Missing environment variables → Check `.env` file
- Port already in use → Check `sudo netstat -tlnp | grep 3000`
- Permission issues → Verify deployer user owns files
- Syntax errors in code → Check logs for stack traces

**Fix**:
```bash
# Check file ownership
ls -la /home/deployer/app/

# Fix ownership if needed
sudo chown -R deployer:deployer /home/deployer/app/

# Restart
sudo systemctl restart clinicpro-bff
```

---

### 503 Service Unavailable from ALEX API

**Cause**: Using facility ID `F99669-C` without Hybrid Connection Manager

**Fix**:
```bash
# Edit .env
sudo nano /home/deployer/app/.env

# Change:
MEDTECH_FACILITY_ID=F99669-C
# To:
MEDTECH_FACILITY_ID=F2N060-E

# Restart
sudo systemctl restart clinicpro-bff
```

---

### 401 Unauthorized from ALEX API

**Cause**: Invalid OAuth credentials or expired token

**Fix**:
```bash
# Check environment variables
sudo cat /home/deployer/app/.env | grep MEDTECH

# Verify credentials are correct
# - MEDTECH_CLIENT_ID
# - MEDTECH_CLIENT_SECRET
# - MEDTECH_TENANT_ID

# Check logs for OAuth errors
sudo journalctl -u clinicpro-bff -n 100 | grep -i oauth
```

---

### Public Domain Not Responding

**Check if service is running**:
```bash
sudo systemctl status clinicpro-bff
```

**Check local access works**:
```bash
curl http://localhost:3000/api/medtech/test?nhi=ZZZ0016
```

**If local works but public doesn't**:
- Check nginx/proxy configuration
- Check firewall rules
- Verify DNS resolves: `nslookup api.clinicpro.co.nz`

---

### High Memory Usage

**Check memory**:
```bash
free -h
sudo systemctl status clinicpro-bff
```

**Current**: ~50MB is normal for Node.js Express server

**If over 200MB**:
- Check for memory leaks in code
- Restart service: `sudo systemctl restart clinicpro-bff`

---

## Security Notes

### File Permissions

```bash
# .env file should be readable only by deployer
sudo chmod 600 /home/deployer/app/.env
sudo chown deployer:deployer /home/deployer/app/.env
```

### Secrets Management

- ✅ Client secret stored in `.env` file (not in git)
- ✅ `.env` file in `.gitignore`
- ✅ Service runs as non-root user (`deployer`)
- ⚠️ Consider using AWS Secrets Manager for production

### SSH Access

- ✅ Key-based authentication only
- ✅ Password authentication disabled
- ⚠️ Limit SSH access to specific IPs if possible

---

## Monitoring

### Service Health

```bash
# Check if service is running
sudo systemctl is-active clinicpro-bff

# Check if service is enabled (starts on boot)
sudo systemctl is-enabled clinicpro-bff

# View service uptime
sudo systemctl status clinicpro-bff | grep Active
```

### Log Monitoring

**Recent errors**:
```bash
sudo journalctl -u clinicpro-bff -p err -n 50
```

**OAuth activity**:
```bash
sudo journalctl -u clinicpro-bff | grep -i oauth
```

**ALEX API activity**:
```bash
sudo journalctl -u clinicpro-bff | grep -i "ALEX API"
```

---

## Maintenance

### Update Node.js

```bash
# Check current version
node --version

# If update needed, use nvm or apt
# (Follow Ubuntu/Node.js upgrade guide)
```

### Update Dependencies

```bash
cd /home/deployer/app
sudo -u deployer npm update
sudo systemctl restart clinicpro-bff
```

### Disk Space Cleanup

```bash
# Check disk space
df -h

# Clean old logs (older than 7 days)
sudo journalctl --vacuum-time=7d

# Clean npm cache
sudo -u deployer npm cache clean --force
```

---

## Testing Checklist

### After Deployment

- [ ] Service is running: `sudo systemctl status clinicpro-bff`
- [ ] No errors in logs: `sudo journalctl -u clinicpro-bff -n 50`
- [ ] Local endpoint works: `curl http://localhost:3000/api/medtech/test?nhi=ZZZ0016`
- [ ] Public endpoint works: `curl https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016`
- [ ] OAuth token acquisition works (check logs)
- [ ] FHIR API calls succeed (check logs for 200 status)

### After Environment Variable Changes

- [ ] .env file updated
- [ ] Service restarted
- [ ] Service started successfully (no errors in logs)
- [ ] Test endpoint returns expected results

---

## Quick Reference Commands

```bash
# Connect
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12

# Service management
sudo systemctl status clinicpro-bff    # Check status
sudo systemctl restart clinicpro-bff   # Restart
sudo systemctl stop clinicpro-bff      # Stop
sudo systemctl start clinicpro-bff     # Start

# Logs
sudo journalctl -u clinicpro-bff -f    # Follow logs
sudo journalctl -u clinicpro-bff -n 50 # Last 50 lines

# Testing
curl http://localhost:3000/api/medtech/test?nhi=ZZZ0016
curl https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016

# Deploy
cd /home/deployer/app
sudo -u deployer git pull origin main
sudo -u deployer npm install
sudo systemctl restart clinicpro-bff
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-11  
**Status**: ✅ Production Ready  
**Verified**: BFF successfully connecting to ALEX API with F2N060-E facility
