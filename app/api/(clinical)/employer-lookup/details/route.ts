import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { cacheGet, cacheSet } from '@/src/lib/cache/redis';
import { formatNzAddressForAcc45, type GoogleAddressComponent } from '@/src/lib/utils/acc45-address';

const GOOGLE_API = 'https://maps.googleapis.com/maps/api/place/details/json';

function getGoogleKey(): string | null {
  return process.env.GOOGLE_MAPS_API_KEY || null;
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
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
  await cacheSet(key, current + 1, 70);
  return { allowed: true, headers: { 'x-ratelimit-remaining': String(Math.max(0, limitPerMinute - current - 1)) } };
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = (url.searchParams.get('id') || '').trim();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
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
    googleUrl.searchParams.set('place_id', id);
    googleUrl.searchParams.set('fields', 'name,formatted_address,address_component,geometry,url,website');
    googleUrl.searchParams.set('key', key);

    const response = await fetch(googleUrl.toString());
    if (!response.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
    }
    const data = await response.json();

    const result = data.result || {};
    const components = (result.address_components || []) as GoogleAddressComponent[];
    const name = String(result.name || '');
    const formatted = String(result.formatted_address || '');

    const fields = formatNzAddressForAcc45(name, components, formatted);

    const res = NextResponse.json({ details: {
      name,
      formattedAddress: formatted,
      addressComponents: components,
      fields,
    }});
    Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
