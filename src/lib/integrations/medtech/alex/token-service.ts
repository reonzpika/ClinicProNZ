import { cacheGet, cacheSet } from '@/src/lib/cache/redis';
import { getMedtechAlexConfig } from './env';

type OAuthTokenResponse = {
  access_token: string;
  expires_in: number; // seconds
  token_type: string;
  scope?: string;
};

type CachedToken = {
  token: string;
  expiresAtEpochSec: number; // absolute seconds since epoch
};

const TOKEN_SKEW_SECONDS = 120; // refresh 2 minutes early
const REDIS_KEY = 'medtech:alex:token';

let inMemoryToken: CachedToken | null = null;

function isTokenValid(cached: CachedToken | null): cached is CachedToken {
  if (!cached) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return cached.expiresAtEpochSec - TOKEN_SKEW_SECONDS > nowSec;
}

export async function getAccessToken(): Promise<string> {
  // 1) In-memory cache
  if (isTokenValid(inMemoryToken)) {
    return inMemoryToken!.token;
  }

  // 2) Redis cache (best-effort)
  try {
    const fromRedis = (await cacheGet<CachedToken>(REDIS_KEY)) || null;
    if (isTokenValid(fromRedis)) {
      inMemoryToken = fromRedis;
      return fromRedis.token;
    }
  } catch {}

  // 3) Fetch new token
  const cfg = getMedtechAlexConfig();
  const form = new URLSearchParams();
  form.set('client_id', cfg.clientId);
  form.set('client_secret', cfg.clientSecret);
  form.set('grant_type', 'client_credentials');
  form.set('scope', cfg.apiScope);

  const resp = await fetch(cfg.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Medtech token error: ${resp.status} ${resp.statusText} ${text}`);
  }
  const data = (await resp.json()) as OAuthTokenResponse;
  if (!data.access_token || !data.expires_in) {
    throw new Error('Medtech token response missing fields');
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const cached: CachedToken = {
    token: data.access_token,
    expiresAtEpochSec: nowSec + Math.max(300, data.expires_in),
  };
  inMemoryToken = cached;

  // best-effort Redis set with TTL slightly under actual expiry
  const ttl = Math.max(60, data.expires_in - TOKEN_SKEW_SECONDS);
  try {
    await cacheSet(REDIS_KEY, cached, ttl);
  } catch {}

  return data.access_token;
}

export async function invalidateAccessToken(): Promise<void> {
  inMemoryToken = null;
  // best-effort: overwrite Redis with 1-second value to force refresh next time
  try {
    await cacheSet(REDIS_KEY, { token: '', expiresAtEpochSec: 0 }, 1);
  } catch {}
}
