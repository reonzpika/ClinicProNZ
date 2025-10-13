import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getDb } from 'database/client';
import { sql } from 'drizzle-orm';

import { cacheGet, cacheSet } from '@/src/lib/cache/redis';

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0] ?? '';
    const trimmed = first.trim();
    if (trimmed) return trimmed;
  }
  return req.headers.get('cf-connecting-ip') || 'unknown';
}

async function rateLimit(req: NextRequest, bucket: string, limitPerMinute: number): Promise<{ allowed: boolean; headers: Record<string, string> }>
{
  const ip = getClientIp(req);
  const now = new Date();
  const key = `ratelimit:${bucket}:${ip}:${now.getUTCFullYear()}${now.getUTCMonth()}${now.getUTCDate()}${now.getUTCHours()}${now.getUTCMinutes()}`;
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
    const q = (url.searchParams.get('q') || '').trim();

    if (q.length < 2) {
      const res = NextResponse.json({ results: [] });
      res.headers.set('Cache-Control', 'public, max-age=10, s-maxage=10');
      return res;
    }

    const { allowed, headers } = await rateLimit(req, 'acc-occupation-codes', 60);
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const db = getDb();
    const like = `%${q}%`;

    const result: any = await db.execute(sql`
      SELECT code, title, anzsco_code, notes
      FROM public.acc_occupation_codes
      WHERE (title % ${q} OR code % ${q} OR title ILIKE ${like} OR code ILIKE ${like})
      ORDER BY GREATEST(similarity(title, ${q}), similarity(code, ${q})) DESC, title ASC
      LIMIT 25
    `);

    const rows: Array<{ code: string; title: string; anzsco_code?: string | null; notes?: string | null }> = Array.isArray(result?.rows) ? result.rows : (Array.isArray(result) ? result : []);

    const data = rows.map(r => ({
      code: r.code,
      title: r.title,
      anzscoCode: (r as any).anzsco_code ?? null,
      notes: (r as any).notes ?? null,
    }));

    const res = NextResponse.json({ results: data });
    res.headers.set('Cache-Control', 'public, max-age=10, s-maxage=10');
    Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
