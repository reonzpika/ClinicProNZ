# Lightsail Setup Reference

**Last Updated:** 2025-11-09  
**Purpose:** Reference for Medtech integration testing on Lightsail

---

## 🔧 Lightsail Configuration

### Server Details
- **IP Address:** `13.236.58.12` (static, allow-listed with Medtech ✅)
- **Domain:** `api.clinicpro.co.nz`
- **OS:** Ubuntu
- **Location:** AWS Lightsail

### Users
- **ubuntu** - Default admin user (sudo access)
- **deployer** - Application user (runs BFF server)

---

## 📁 Directory Structure

### Application Directory: `/home/deployer/app/`

**Contents:**
```
/home/deployer/app/
├── .env                    # Environment variables (configured ✅)
├── index.js                # Express server (existing BFF)
├── package.json            # Dependencies
├── node_modules/           # Installed packages
├── services/               # Service modules (if any)
└── test-alex-api.js        # Test script (created during testing)
```

---

## 🔐 Environment Variables

**Location:** `/home/deployer/app/.env`

**Configuration (as of Nov 7, 2025):**
```bash
# Medtech ALEX API Configuration
MEDTECH_CLIENT_ID=7685ade3-f1ae-4e86-a398-fe7809c0fed1
MEDTECH_CLIENT_SECRET=Zub8Q~oBMwpgCJzif6Nn2RpRlIbt6q6g1y3ZhcID
MEDTECH_TENANT_ID=8a024e99-aba3-4b25-b875-28b0c0ca6096
MEDTECH_API_SCOPE=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default
MEDTECH_API_BASE_URL=https://alexapiuat.medtechglobal.com/FHIR
MEDTECH_FACILITY_ID=F2N060-E

# Server Configuration
PORT=3000
NODE_ENV=production
```

**Notes:**
- ✅ All Medtech credentials are configured
- ✅ Uses UAT facility ID: `F2N060-E`
- ⚠️ **Security:** This file contains secrets - never commit to git
- 📝 File permissions: `-rw-rw-r--` (readable by deployer user)

---

## 🚀 How to Access

### SSH Access

**As ubuntu user (admin):**
```bash
ssh ubuntu@13.236.58.12
# Or with key:
ssh -i your-key.pem ubuntu@13.236.58.12
```

**Switch to deployer user:**
```bash
sudo su - deployer
```

**Go to app directory:**
```bash
cd ~/app
```

---

## ✅ Testing Medtech Integration

### Quick Test (from Lightsail)

This uses the allow-listed IP `13.236.58.12` to test the real ALEX API.

**1. SSH into Lightsail:**
```bash
ssh ubuntu@13.236.58.12
sudo su - deployer
cd ~/app
```

**2. Create test script:**
```bash
# Copy the test script from TEST_ON_LIGHTSAIL.md
# It should create a file: test-alex-api.js
```

**3. Install dependencies (if needed):**
```bash
npm install dotenv
```

**4. Run test:**
```bash
node test-alex-api.js
```

**Expected output:**
```
🧪 Medtech ALEX API Test

Configuration:
  Base URL: https://alexapiuat.medtechglobal.com/FHIR
  Facility: F2N060-E
  Client ID: 7685ade3-f1ae-4e86-a398-fe7809c0fed1

🔐 Requesting OAuth token from Azure AD...
✅ Token acquired in 410ms
   Expires in: 3599 seconds
   Token prefix: eyJ0eXAiOiJKV1QiLCJh...

🌐 Testing ALEX API...
   Endpoint: https://alexapiuat.medtechglobal.com/FHIR/Patient?identifier=...
   Facility: F2N060-E
✅ ALEX API responded in 523ms
   Resource Type: Bundle
   Bundle Type: searchset
   Total Results: 1

✅ SUCCESS: Medtech integration is working!
```

---

## 📊 Existing BFF Server

### Current Setup
- **Server:** Express.js running on port 3000
- **Status:** Running (check with `ps aux | grep node`)
- **Logs:** Check with `cat server.log` (if logging is set up)

### Nginx Reverse Proxy
- **Frontend:** `https://api.clinicpro.co.nz:443`
- **Backend:** `http://localhost:3000`
- **SSL:** Let's Encrypt certificate

### Server Management
```bash
# Check if server is running
ps aux | grep node

# Stop server
sudo kill $(pgrep -f "node index.js")

# Start server
nohup node index.js > server.log 2>&1 &

# View logs
tail -f server.log
```

---

## 🔍 Troubleshooting

### View Environment Variables
```bash
# As deployer user
cd ~/app
cat .env
```

### Check Node.js Version
```bash
node --version
# Should be v20 or higher
```

### Install/Update Node.js (if needed)
```bash
# As ubuntu user
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Check Network Connectivity
```bash
# Test if ALEX API is reachable
curl -v --max-time 5 https://alexapiuat.medtechglobal.com/FHIR/metadata

# Check public IP (should be 13.236.58.12)
curl -s ifconfig.me
```

### Permission Issues
```bash
# If you get permission errors, ensure you're the deployer user
whoami  # Should show "deployer"

# Fix file permissions if needed (as ubuntu user)
sudo chown -R deployer:deployer /home/deployer/app
```

---

## 📝 Common Tasks

### Update .env File
```bash
# As deployer user
cd ~/app
nano .env  # or vi .env

# After editing, restart server (if running)
sudo kill $(pgrep -f "node index.js")
nohup node index.js > server.log 2>&1 &
```

### Install New Dependencies
```bash
cd ~/app
npm install <package-name>
```

### View Existing Code
```bash
cd ~/app
cat index.js  # View main server file
ls -la        # List all files
```

---

## 🔒 Security Notes

### Credentials
- ✅ Stored in `.env` file on server only
- ✅ Never committed to git
- ✅ File permissions restrict access to deployer user
- ⚠️ Client secret is sensitive - rotate if exposed

### IP Allow-listing
- ✅ Lightsail IP `13.236.58.12` is allow-listed with Medtech
- ✅ This enables direct ALEX API access from this server
- ⚠️ Other IPs (like Cursor remote or local machines) won't work without allow-listing

### SSH Access
- Use SSH keys instead of passwords where possible
- Keep SSH keys secure
- Consider using AWS Session Manager as alternative

---

## 📚 Related Documentation

- **TEST_ON_LIGHTSAIL.md** - Step-by-step testing guide
- **MEDTECH_FINAL_STATUS.md** - Overall integration status
- **GATEWAY_IMPLEMENTATION.md** - BFF architecture details
- **project-management/medtech-integration/** - Full project docs

---

## 🔄 Deployment Process

### Update BFF Code
```bash
# 1. SSH into Lightsail
ssh ubuntu@13.236.58.12
sudo su - deployer
cd ~/app

# 2. Backup existing code (optional)
cp index.js index.js.backup

# 3. Update code (via git, scp, or direct edit)
git pull origin main  # If using git
# or
nano index.js  # Direct edit

# 4. Install dependencies
npm install

# 5. Restart server
sudo kill $(pgrep -f "node index.js")
nohup node index.js > server.log 2>&1 &

# 6. Test
curl http://localhost:3000/health
```

---

## 📞 Quick Reference

**Access Lightsail:**
```bash
ssh ubuntu@13.236.58.12
sudo su - deployer
cd ~/app
```

**Run Medtech test:**
```bash
node test-alex-api.js
```

**Check server status:**
```bash
ps aux | grep node
```

**View .env:**
```bash
cat .env
```

**Restart BFF server:**
```bash
sudo kill $(pgrep -f "node index.js")
nohup node index.js > server.log 2>&1 &
```

---

**Last tested:** 2025-11-09  
**Working:** OAuth ✅ | ALEX API pending test ⏳
