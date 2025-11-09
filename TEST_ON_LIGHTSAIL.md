# Test Medtech Integration on Lightsail

**Lightsail IP:** `13.236.58.12` (already allow-listed ✅)  
**Domain:** `api.clinicpro.co.nz`

---

## Option 1: Quick SSH Test (Recommended)

SSH into your Lightsail instance and run the test directly:

### 1. SSH into Lightsail

```bash
ssh ubuntu@13.236.58.12
# Or if you have a key:
# ssh -i your-key.pem ubuntu@13.236.58.12
```

### 2. Create Test Directory

```bash
mkdir -p ~/medtech-test
cd ~/medtech-test
```

### 3. Create Environment File

```bash
cat > .env << 'EOF'
MEDTECH_CLIENT_ID=7685ade3-f1ae-4e86-a398-fe7809c0fed1
MEDTECH_CLIENT_SECRET=Zub8Q~oBMwpgCJzif6Nn2RpRlIbt6q6g1y3ZhcID
MEDTECH_TENANT_ID=8a024e99-aba3-4b25-b875-28b0c0ca6096
MEDTECH_API_SCOPE=api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default
MEDTECH_API_BASE_URL=https://alexapiuat.medtechglobal.com/FHIR
MEDTECH_FACILITY_ID=F99669-C
NEXT_PUBLIC_MEDTECH_USE_MOCK=false
EOF
```

### 4. Create Simple Test Script

```bash
cat > test-alex-api.js << 'EOF'
#!/usr/bin/env node

require('dotenv').config();

// Step 1: Get OAuth token
async function getToken() {
  const params = new URLSearchParams({
    client_id: process.env.MEDTECH_CLIENT_ID,
    client_secret: process.env.MEDTECH_CLIENT_SECRET,
    grant_type: 'client_credentials',
    scope: process.env.MEDTECH_API_SCOPE,
  });

  const tokenEndpoint = `https://login.microsoftonline.com/${process.env.MEDTECH_TENANT_ID}/oauth2/v2.0/token`;
  
  console.log('🔐 Requesting OAuth token from Azure AD...');
  const startTime = Date.now();
  
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OAuth failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  console.log(`✅ Token acquired in ${Date.now() - startTime}ms`);
  console.log(`   Expires in: ${data.expires_in} seconds`);
  console.log(`   Token prefix: ${data.access_token.substring(0, 20)}...`);
  
  return data.access_token;
}

// Step 2: Test ALEX API
async function testAlexApi(token) {
  const endpoint = `${process.env.MEDTECH_API_BASE_URL}/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|ZZZ0016`;
  
  console.log('\n🌐 Testing ALEX API...');
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Facility: ${process.env.MEDTECH_FACILITY_ID}`);
  
  const startTime = Date.now();
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/fhir+json',
      'mt-facilityid': process.env.MEDTECH_FACILITY_ID,
    },
  });

  const duration = Date.now() - startTime;

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ALEX API failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  console.log(`✅ ALEX API responded in ${duration}ms`);
  console.log(`   Resource Type: ${data.resourceType}`);
  console.log(`   Bundle Type: ${data.type}`);
  console.log(`   Total Results: ${data.total}`);
  
  if (data.entry && data.entry.length > 0) {
    const patient = data.entry[0].resource;
    console.log(`   First Patient:`);
    console.log(`     - ID: ${patient.id}`);
    console.log(`     - Name: ${patient.name?.[0]?.given?.[0]} ${patient.name?.[0]?.family}`);
    console.log(`     - Gender: ${patient.gender}`);
    console.log(`     - Birth Date: ${patient.birthDate}`);
  }

  return data;
}

// Main test
async function main() {
  console.log('🧪 Medtech ALEX API Test\n');
  console.log('Configuration:');
  console.log(`  Base URL: ${process.env.MEDTECH_API_BASE_URL}`);
  console.log(`  Facility: ${process.env.MEDTECH_FACILITY_ID}`);
  console.log(`  Client ID: ${process.env.MEDTECH_CLIENT_ID}`);
  console.log('');

  try {
    // Step 1: Get token
    const token = await getToken();
    
    // Step 2: Test ALEX API
    await testAlexApi(token);
    
    console.log('\n✅ SUCCESS: Medtech integration is working!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

main();
EOF

chmod +x test-alex-api.js
```

### 5. Install Dependencies

```bash
# Check if Node.js is installed
node --version

# If not installed:
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
# sudo apt-get install -y nodejs

# Install dotenv
npm install dotenv
```

### 6. Run the Test

```bash
node test-alex-api.js
```

### Expected Output (Success):

```
🧪 Medtech ALEX API Test

Configuration:
  Base URL: https://alexapiuat.medtechglobal.com/FHIR
  Facility: F99669-C
  Client ID: 7685ade3-f1ae-4e86-a398-fe7809c0fed1

🔐 Requesting OAuth token from Azure AD...
✅ Token acquired in 412ms
   Expires in: 3599 seconds
   Token prefix: eyJ0eXAiOiJKV1QiLCJh...

🌐 Testing ALEX API...
   Endpoint: https://alexapiuat.medtechglobal.com/FHIR/Patient?identifier=...
   Facility: F99669-C
✅ ALEX API responded in 523ms
   Resource Type: Bundle
   Bundle Type: searchset
   Total Results: 1
   First Patient:
     - ID: 12345
     - Name: Test Patient
     - Gender: male
     - Birth Date: 1990-01-01

✅ SUCCESS: Medtech integration is working!
```

---

## Option 2: Deploy Full BFF to Lightsail

If you want to deploy the full integration to Lightsail:

### 1. SSH into Lightsail

```bash
ssh ubuntu@13.236.58.12
sudo su - deployer
cd ~/app
```

### 2. Copy Integration Files

From your local machine:

```bash
# Copy oauth service
scp src/lib/services/medtech/oauth-token-service.ts ubuntu@13.236.58.12:~/medtech-test/

# Copy alex api client
scp src/lib/services/medtech/alex-api-client.ts ubuntu@13.236.58.12:~/medtech-test/

# Copy test script
scp test-medtech-integration.ts ubuntu@13.236.58.12:~/medtech-test/
```

Or use git:

```bash
# On Lightsail
cd ~/app
git clone <your-repo>
cd <your-repo>
git checkout cursor/test-medtech-integration-25d4

# Copy .env.local
cp .env.local.example .env.local
# Edit with real credentials
```

### 3. Install and Run

```bash
npm install
npm install tsx dotenv
npx tsx test-medtech-integration.ts
```

---

## Option 3: Create API Proxy Endpoint

If you want to test from Cursor but route through Lightsail:

### 1. On Lightsail, create a simple proxy:

```bash
cd ~/app
cat > proxy-server.js << 'EOF'
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// OAuth token cache
let tokenCache = null;
let tokenExpiry = 0;

// Get OAuth token
async function getToken() {
  if (tokenCache && Date.now() < tokenExpiry) {
    return tokenCache;
  }

  const params = new URLSearchParams({
    client_id: process.env.MEDTECH_CLIENT_ID,
    client_secret: process.env.MEDTECH_CLIENT_SECRET,
    grant_type: 'client_credentials',
    scope: process.env.MEDTECH_API_SCOPE,
  });

  const response = await fetch(
    `https://login.microsoftonline.com/${process.env.MEDTECH_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    }
  );

  const data = await response.json();
  tokenCache = data.access_token;
  tokenExpiry = Date.now() + 55 * 60 * 1000; // 55 minutes
  
  return tokenCache;
}

// Proxy endpoint
app.get('/api/medtech/*', async (req, res) => {
  try {
    const token = await getToken();
    const path = req.params[0];
    const url = `${process.env.MEDTECH_API_BASE_URL}/${path}${req.url.split('?')[1] ? '?' + req.url.split('?')[1] : ''}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/fhir+json',
        'mt-facilityid': process.env.MEDTECH_FACILITY_ID,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Proxy server running on http://localhost:3001');
});
EOF

node proxy-server.js &
```

### 2. Test from Cursor:

```bash
curl https://api.clinicpro.co.nz/api/medtech/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|ZZZ0016
```

---

## Quick Comparison

| Method | Speed | Complexity | Use Case |
|--------|-------|------------|----------|
| **SSH Test** | ⚡ Fastest | Simple | Quick validation |
| **Deploy BFF** | 🚀 Medium | Medium | Production setup |
| **API Proxy** | 🌐 Slower | Medium | Remote testing |

---

## Recommended: Start with SSH Test

1. SSH into Lightsail
2. Run the simple Node.js test script above
3. Verify ALEX API works from allow-listed IP
4. Then decide if you want to deploy full BFF

---

## What to Test

Once on Lightsail, test these endpoints:

```bash
# 1. Test patient lookup
curl "https://alexapiuat.medtechglobal.com/FHIR/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|ZZZ0016" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/fhir+json" \
  -H "mt-facilityid: F99669-C"

# 2. Test metadata (capability statement)
curl "https://alexapiuat.medtechglobal.com/FHIR/metadata" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/fhir+json" \
  -H "mt-facilityid: F99669-C"

# 3. Test location lookup
curl "https://alexapiuat.medtechglobal.com/FHIR/Location" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/fhir+json" \
  -H "mt-facilityid: F99669-C"
```

---

**Let me know if you want me to help set this up via SSH!**
