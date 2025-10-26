// Server-only Medtech ALEX environment loader and validator
// Ensures secrets never reach client bundles

export type MedtechAlexConfig = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  apiScope: string; // e.g., api://.../.default
  facilityId: string; // e.g., F2N060-E
  tokenEndpoint: string; // derived from tenantId
  environment: 'uat' | 'prod' | 'sandbox' | 'unknown';
  alexBaseUrl?: string; // optional; used by smoke test or client
  alexPingPath?: string; // optional; default '/'
};

let cachedConfig: MedtechAlexConfig | null = null;

function required(name: string, value: string | undefined): string {
  if (!value || !value.trim()) {
    throw new Error(`[medtech/env] Missing required env: ${name}`);
  }
  return value.trim();
}

export function getMedtechAlexConfig(): MedtechAlexConfig {
  if (cachedConfig) return cachedConfig;

  const tenantId = required('MEDTECH_TENANT_ID', process.env.MEDTECH_TENANT_ID);
  const clientId = required('MEDTECH_CLIENT_ID', process.env.MEDTECH_CLIENT_ID);
  const clientSecret = required('MEDTECH_CLIENT_SECRET', process.env.MEDTECH_CLIENT_SECRET);
  const apiScope = required('MEDTECH_API_SCOPE', process.env.MEDTECH_API_SCOPE);
  const facilityId = required('MEDTECH_FACILITY_ID', process.env.MEDTECH_FACILITY_ID);

  const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const envGuess: MedtechAlexConfig['environment'] =
    apiScope.includes('sandbox') ? 'sandbox' : apiScope.includes('prod') ? 'prod' : 'uat';

  cachedConfig = {
    tenantId,
    clientId,
    clientSecret,
    apiScope,
    facilityId,
    tokenEndpoint,
    environment: envGuess || 'unknown',
    alexBaseUrl: process.env.MEDTECH_ALEX_BASE_URL?.trim() || undefined,
    alexPingPath: process.env.MEDTECH_ALEX_PING_PATH?.trim() || '/',
  };
  return cachedConfig;
}
