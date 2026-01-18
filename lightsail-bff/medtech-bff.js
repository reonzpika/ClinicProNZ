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
    },
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
      `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`,
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
      expiresIn: expiresIn > 0
? {
        milliseconds: expiresIn,
        seconds: Math.floor(expiresIn / 1000),
        minutes: Math.floor(expiresIn / 60000),
      }
: null,
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
    const path = `/${req.params[0]}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
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

  ���� Server running on port ${PORT}
  ������ Environment: ${process.env.NODE_ENV || 'development'}
  ������ ALEX API: ${process.env.MEDTECH_API_BASE_URL}
  ������ Facility: ${process.env.MEDTECH_FACILITY_ID}
  
  ������ Available Endpoints:
     GET  /health
     GET  /api/medtech/test
     GET  /api/medtech/token-info
     GET  /api/medtech/capabilities
     GET  /api/medtech/locations
     GET  /api/medtech/patient?nhi=ZZZ0016
     POST /api/medtech/media
     ALL  /api/medtech/proxy/*

  ��⏰ Started at: ${new Date().toISOString()}
  
`);
});
