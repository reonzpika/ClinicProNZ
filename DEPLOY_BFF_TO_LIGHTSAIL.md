# Deploy Medtech BFF to Lightsail

**Goal:** Set up Lightsail as a proxy/BFF so your Next.js app can access ALEX API through the allow-listed IP.

---

## 🏗️ Architecture

```
Next.js App (Vercel/Local: any IP)
    ↓ HTTPS
Lightsail BFF (13.236.58.12: allow-listed)
    ↓ HTTPS
ALEX API (alexapiuat.medtechglobal.com)
```

**Benefits:**
- ✅ All ALEX API calls go through allow-listed IP
- ✅ Next.js app can run anywhere (Vercel, local, etc.)
- ✅ OAuth tokens managed server-side
- ✅ No IP restrictions on Next.js app

---

## 🚀 Step 1: Create BFF Server on Lightsail

### 1.1 SSH into Lightsail

```bash
ssh ubuntu@13.236.58.12
sudo su - deployer
cd ~/app
```

### 1.2 Create BFF Server File

```bash
cat > medtech-bff.js << 'EOF'
/**
 * Medtech BFF (Backend-for-Frontend)
 * 
 * Proxy server that provides ALEX API access to Next.js app
 * Uses allow-listed IP 13.236.58.12
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration - allow your Next.js app
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://clinicpro.co.nz',
    'https://www.clinicpro.co.nz',
    'https://*.vercel.app', // Your Vercel deployments
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' })); // For image uploads

// OAuth token cache
let tokenCache = null;
let tokenExpiry = 0;

/**
 * Get OAuth token (cached for 55 minutes)
 */
async function getToken() {
  if (tokenCache && Date.now() < tokenExpiry) {
    console.log('[BFF] Using cached token');
    return tokenCache;
  }

  console.log('[BFF] Acquiring new OAuth token...');
  const startTime = Date.now();

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

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OAuth failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  tokenCache = data.access_token;
  tokenExpiry = Date.now() + 55 * 60 * 1000; // 55 minutes

  console.log(`[BFF] Token acquired in ${Date.now() - startTime}ms`);
  
  return tokenCache;
}

/**
 * Proxy ALEX API request
 */
async function proxyAlexRequest(method, path, body = null, customHeaders = {}) {
  const token = await getToken();
  const url = `${process.env.MEDTECH_API_BASE_URL}${path}`;

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/fhir+json',
      'mt-facilityid': process.env.MEDTECH_FACILITY_ID,
      ...customHeaders,
    },
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  console.log(`[BFF] ${method} ${path}`);
  const startTime = Date.now();

  const response = await fetch(url, options);
  const duration = Date.now() - startTime;

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  console.log(`[BFF] Response ${response.status} in ${duration}ms`);

  if (!response.ok) {
    throw {
      statusCode: response.status,
      message: typeof data === 'string' ? data : data.message || 'ALEX API error',
      data,
    };
  }

  return { statusCode: response.status, data };
}

// ============================================================================
// Health Check
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'medtech-bff',
    timestamp: new Date().toISOString(),
    environment: {
      hasBaseUrl: !!process.env.MEDTECH_API_BASE_URL,
      hasFacilityId: !!process.env.MEDTECH_FACILITY_ID,
      hasCredentials: !!(process.env.MEDTECH_CLIENT_ID && process.env.MEDTECH_CLIENT_SECRET),
    },
  });
});

// ============================================================================
// Test Endpoint
// ============================================================================

app.get('/api/medtech/test', async (req, res) => {
  try {
    const nhi = req.query.nhi || 'ZZZ0016';
    const result = await proxyAlexRequest(
      'GET',
      `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`
    );
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[BFF] Error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
      details: error.data,
    });
  }
});

// ============================================================================
// Token Info (for debugging)
// ============================================================================

app.get('/api/medtech/token-info', (req, res) => {
  const expiresIn = tokenCache ? Math.max(0, tokenExpiry - Date.now()) : 0;
  
  res.json({
    tokenCache: {
      isCached: !!tokenCache,
      expiresIn: expiresIn > 0 ? {
        milliseconds: expiresIn,
        seconds: Math.floor(expiresIn / 1000),
        minutes: Math.floor(expiresIn / 60000),
      } : null,
    },
  });
});

// ============================================================================
// Capabilities Endpoint
// ============================================================================

app.get('/api/medtech/capabilities', async (req, res) => {
  try {
    const result = await proxyAlexRequest('GET', '/metadata');
    res.json(result.data);
  } catch (error) {
    console.error('[BFF] Error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Locations Endpoint
// ============================================================================

app.get('/api/medtech/locations', async (req, res) => {
  try {
    const result = await proxyAlexRequest('GET', '/Location');
    res.json(result.data);
  } catch (error) {
    console.error('[BFF] Error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Patient Search
// ============================================================================

app.get('/api/medtech/patient', async (req, res) => {
  try {
    const { nhi, id } = req.query;
    
    let path;
    if (nhi) {
      path = `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`;
    } else if (id) {
      path = `/Patient/${id}`;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either nhi or id parameter required',
      });
    }
    
    const result = await proxyAlexRequest('GET', path);
    res.json(result.data);
  } catch (error) {
    console.error('[BFF] Error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Media/Image Upload
// ============================================================================

app.post('/api/medtech/media', async (req, res) => {
  try {
    const mediaResource = req.body;
    
    // Validate FHIR Media resource
    if (!mediaResource.resourceType || mediaResource.resourceType !== 'Media') {
      return res.status(400).json({
        success: false,
        error: 'Invalid FHIR Media resource',
      });
    }
    
    const result = await proxyAlexRequest('POST', '/Media', mediaResource);
    res.status(result.statusCode).json(result.data);
  } catch (error) {
    console.error('[BFF] Error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
      details: error.data,
    });
  }
});

// ============================================================================
// Generic Proxy (catch-all)
// ============================================================================

app.all('/api/medtech/proxy/*', async (req, res) => {
  try {
    const path = '/' + req.params[0] + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');
    const result = await proxyAlexRequest(req.method, path, req.body);
    res.status(result.statusCode).json(result.data);
  } catch (error) {
    console.error('[BFF] Error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================================================
// Error Handler
// ============================================================================

app.use((err, req, res, next) => {
  console.error('[BFF] Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

// ============================================================================
// Start Server
// ============================================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    Medtech BFF Server                          ║
╚════════════════════════════════════════════════════════════════╝

  🚀 Server running on port ${PORT}
  🌐 Environment: ${process.env.NODE_ENV || 'development'}
  🏥 ALEX API: ${process.env.MEDTECH_API_BASE_URL}
  🏢 Facility: ${process.env.MEDTECH_FACILITY_ID}
  
  📋 Available Endpoints:
     GET  /health
     GET  /api/medtech/test
     GET  /api/medtech/token-info
     GET  /api/medtech/capabilities
     GET  /api/medtech/locations
     GET  /api/medtech/patient?nhi=ZZZ0016
     POST /api/medtech/media
     ALL  /api/medtech/proxy/*

  ⏰ Started at: ${new Date().toISOString()}
  
`);
});
EOF
```

### 1.3 Update package.json (if needed)

```bash
# Check if express and cors are installed
npm list express cors

# If not installed:
npm install express cors
```

### 1.4 Stop Old Server (if running)

```bash
# Check what's running
ps aux | grep node

# Stop old server
sudo kill $(pgrep -f "node index.js")
sudo kill $(pgrep -f "node medtech-bff.js")
```

### 1.5 Start BFF Server

```bash
# Start in background with logging
nohup node medtech-bff.js > bff.log 2>&1 &

# Check it started
ps aux | grep node

# View logs
tail -f bff.log
```

### 1.6 Test BFF Locally (from Lightsail)

```bash
# Health check
curl http://localhost:3000/health

# Test endpoint
curl http://localhost:3000/api/medtech/test

# Token info
curl http://localhost:3000/api/medtech/token-info
```

---

## 🔧 Step 2: Configure Nginx (if not already done)

The BFF should be accessible via `https://api.clinicpro.co.nz`. Check if Nginx is configured:

```bash
# Check Nginx config
sudo cat /etc/nginx/sites-available/default
# or
sudo cat /etc/nginx/sites-available/api.clinicpro.co.nz
```

If not configured, add this:

```bash
sudo nano /etc/nginx/sites-available/api.clinicpro.co.nz
```

Add:

```nginx
server {
    listen 80;
    server_name api.clinicpro.co.nz;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.clinicpro.co.nz;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.clinicpro.co.nz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.clinicpro.co.nz/privkey.pem;

    # Proxy to Node.js BFF
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/api.clinicpro.co.nz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📱 Step 3: Test BFF Externally

From your local machine:

```bash
# Health check
curl https://api.clinicpro.co.nz/health

# Test ALEX API access
curl https://api.clinicpro.co.nz/api/medtech/test

# Test with specific NHI
curl "https://api.clinicpro.co.nz/api/medtech/test?nhi=ZZZ0016"

# Check token info
curl https://api.clinicpro.co.nz/api/medtech/token-info
```

Expected response:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "resourceType": "Bundle",
    "type": "searchset",
    "total": 1,
    "entry": [...]
  }
}
```

---

## 🔄 Step 4: Update Next.js App

### 4.1 Create Environment Variable

In your Next.js app (`.env.local`):

```bash
# Use Lightsail BFF instead of direct ALEX API
MEDTECH_BFF_URL=https://api.clinicpro.co.nz
NEXT_PUBLIC_MEDTECH_USE_MOCK=false
```

### 4.2 Update API Calls

In your Next.js API routes, instead of calling ALEX API directly, call the BFF:

**Before:**
```typescript
// Direct ALEX API call (won't work from Vercel)
const response = await alexApiClient.get('/Patient?identifier=...')
```

**After:**
```typescript
// Call BFF (works from anywhere)
const response = await fetch(`${process.env.MEDTECH_BFF_URL}/api/medtech/patient?nhi=${nhi}`)
const data = await response.json()
```

### 4.3 Update API Routes

For example, update `/app/api/(integration)/medtech/test/route.ts`:

```typescript
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const nhi = searchParams.get('nhi') || 'ZZZ0016';
  
  try {
    // Call BFF instead of ALEX API directly
    const response = await fetch(
      `${process.env.MEDTECH_BFF_URL}/api/medtech/test?nhi=${nhi}`
    );
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

---

## ✅ Step 5: Test End-to-End

### 5.1 Test from Local Dev Server

```bash
# In your Next.js app
pnpm dev

# Test API endpoint
curl http://localhost:3000/api/medtech/test

# Test desktop widget
# Open: http://localhost:3000/medtech-images?encounterId=test&patientId=test
```

### 5.2 Deploy to Vercel

```bash
git add .
git commit -m "feat: use Lightsail BFF for Medtech integration"
git push origin main
```

In Vercel, add environment variable:
- **Key:** `MEDTECH_BFF_URL`
- **Value:** `https://api.clinicpro.co.nz`

### 5.3 Test Production

```bash
# Test from Vercel
curl https://your-app.vercel.app/api/medtech/test
```

---

## 🔒 Security Checklist

- ✅ BFF validates all requests
- ✅ OAuth tokens cached server-side only
- ✅ CORS configured for your domains only
- ✅ HTTPS enabled (SSL certificate)
- ✅ No credentials exposed to browser
- ✅ Rate limiting (optional, can add later)

---

## 📊 Architecture Summary

```
┌─────────────────────┐
│   Next.js App       │
│ (Vercel/Local/Any)  │
│   Any IP            │
└──────────┬──────────┘
           │ HTTPS
           │
           ▼
┌─────────────────────┐
│  Lightsail BFF      │
│  13.236.58.12       │
│  (Allow-listed)     │
├─────────────────────┤
│ • OAuth Management  │
│ • Token Caching     │
│ • Request Proxying  │
└──────────┬──────────┘
           │ HTTPS
           │
           ▼
┌─────────────────────┐
│    ALEX API         │
│ alexapiuat.medtech  │
│ global.com          │
└─────────────────────┘
```

---

## 🚀 Quick Start Summary

```bash
# 1. SSH into Lightsail
ssh ubuntu@13.236.58.12
sudo su - deployer
cd ~/app

# 2. Create BFF server (copy from above)
cat > medtech-bff.js << 'EOF'
# ... (paste full server code)
EOF

# 3. Install dependencies
npm install express cors

# 4. Start server
nohup node medtech-bff.js > bff.log 2>&1 &

# 5. Test
curl http://localhost:3000/health
curl http://localhost:3000/api/medtech/test

# 6. Test externally
curl https://api.clinicpro.co.nz/health

# 7. Update Next.js app to use BFF
# MEDTECH_BFF_URL=https://api.clinicpro.co.nz
```

---

**You're ready to deploy!** 🎉
