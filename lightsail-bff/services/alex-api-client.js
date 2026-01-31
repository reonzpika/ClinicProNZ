/**
 * Medtech ALEX API Client
 * Auto-injects headers and handles OAuth
 */

const oauthTokenService = require('./oauth-token-service');
const { randomUUID } = require('node:crypto');

class AlexApiClient {
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      correlationId = randomUUID(),
      facilityId,
    } = options;

    const baseUrl = process.env.MEDTECH_API_BASE_URL;
    const effectiveFacilityId
      = (typeof facilityId === 'string' && facilityId.trim() ? facilityId.trim() : null)
        || process.env.MEDTECH_FACILITY_ID;
    const url = `${baseUrl}${endpoint}`;

    try {
      const accessToken = await oauthTokenService.getAccessToken();

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/fhir+json',
        'mt-facilityid': effectiveFacilityId,
        // Request tracing across BFF <-> ALEX.
        // Documented in ALEX API reference as `mt-correlationid`.
        'mt-correlationid': correlationId,
      };

      const requestOptions = { method, headers };
      if (body) {
        requestOptions.body = JSON.stringify(body);
      }

      console.log('[ALEX API] Request', { method, endpoint, correlationId });

      const response = await fetch(url, requestOptions);

      // Retry on 401
      if (response.status === 401 && !options.retried) {
        console.warn('[ALEX API] 401, refreshing token');
        await oauthTokenService.forceRefresh();
        return this.request(endpoint, { ...options, retried: true });
      }

      if (!response.ok) {
        const errorText = await response.text();
        const err = new Error(`ALEX API error: ${response.status} ${errorText}`);
        err.statusCode = response.status;
        err.correlationId = correlationId;
        throw err;
      }

      const data = await response.json();
      console.log('[ALEX API] Success', { status: response.status, correlationId });
      return data;
    } catch (error) {
      console.error('[ALEX API] Failed', { endpoint, error: error.message, correlationId });
      throw error;
    }
  }

  async get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }
}

module.exports = new AlexApiClient();
