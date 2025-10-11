import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { cacheGet, cacheSet, hoursToSeconds } from '@/src/lib/cache/redis';

const GOOGLE_API = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

function getGoogleKey(): string | null {
  return process.env.GOOGLE_MAPS_API_KEY || null;
}

function getClientIp(req: NextRequest): string {
  // Basic IP extraction for rate limiting; proxies may set x-forwarded-for
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  // Fallback to cf-connecting-ip or remote address (not always available)
  return req.headers.get('cf-connecting-ip') || 'unknown';
}

async function rateLimit(req: NextRequest, bucket: string, limitPerMinute: number): Promise<{ allowed: boolean; headers: Record<string, string> }>
{
  const ip = getClientIp(req);
  const key = `ratelimit:${bucket}:${ip}:${new Date().getUTCFullYear()}${new Date().getUTCMonth()}${new Date().getUTCDate()}${new Date().getUTCHours()}${new Date().getUTCMinutes()}`;
  const current = (await cacheGet<number>(key)) || 0;
  if (current >= limitPerMinute) {
    return { allowed: false, headers: { 'x-ratelimit-remaining': '0' } };
  }
  await cacheSet(key, current + 1, 70); // expire slightly over a minute
  return { allowed: true, headers: { 'x-ratelimit-remaining': String(Math.max(0, limitPerMinute - current - 1)) } };
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const { allowed, headers } = await rateLimit(req, 'employer-lookup', 60);
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const key = getGoogleKey();
    if (!key) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const googleUrl = new URL(GOOGLE_API);
    googleUrl.searchParams.set('query', q);
    googleUrl.searchParams.set('region', 'nz');
    googleUrl.searchParams.set('key', key);

    const response = await fetch(googleUrl.toString());
    if (!response.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
    }
    const data = await response.json();

    const results = Array.isArray(data.results)
      ? data.results.slice(0, 10).map((r: any) => ({
          id: r.place_id as string,
          name: r.name as string,
          formattedAddress: r.formatted_address as string,
        }))
      : [];

    const res = NextResponse.json({ results });
    Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
