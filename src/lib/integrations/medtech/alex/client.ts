import { getMedtechAlexConfig } from './env';
import { getAccessToken, invalidateAccessToken } from './token-service';

export type AlexRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string; // relative to base URL (if set)
  body?: unknown;
  headers?: Record<string, string>;
  includeFacility?: boolean; // add Facility-Id header
  baseUrlOverride?: string; // optional override for testing
};

export async function alexRequest<T = unknown>(opts: AlexRequestOptions): Promise<Response> {
  const cfg = getMedtechAlexConfig();
  const method = opts.method || 'GET';
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };

  if (opts.includeFacility) {
    headers['Facility-Id'] = cfg.facilityId;
  }

  const baseUrl = opts.baseUrlOverride || cfg.alexBaseUrl || '';
  const url = baseUrl ? `${baseUrl}${opts.path}` : opts.path;

  const response = await fetch(url, {
    method,
    headers,
    body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(opts.body ?? {}),
  });

  // One retry on 401: invalidate token and try again
  if (response.status === 401) {
    await invalidateAccessToken();
    const retryToken = await getAccessToken();
    const retryHeaders = { ...headers, Authorization: `Bearer ${retryToken}` };
    const retry = await fetch(url, {
      method,
      headers: retryHeaders,
      body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(opts.body ?? {}),
    });
    return retry;
  }

  return response;
}
