import { getDb } from 'database/client';
import { sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { cacheGet, cacheSet } from '@/src/lib/cache/redis';

// Ensure Node.js runtime (needed for Neon/drizzle client env access)
export const runtime = 'nodejs';

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0] ?? '';
    const trimmed = first.trim();
    if (trimmed) {
 return trimmed;
}
  }
  return req.headers.get('cf-connecting-ip') || 'unknown';
}

async function rateLimit(req: NextRequest, bucket: string, limitPerMinute: number): Promise<{ allowed: boolean; headers: Record<string, string> }> {
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

    let db;
    try {
      db = getDb();
    } catch (err) {
      const res = NextResponse.json({ error: 'Database not configured' }, { status: 500 });
      res.headers.set('x-debug', 'missing-database-url');
      Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }
    const like = `%${q}%`;

    // Check if pg_trgm is available to safely use similarity / % operator
    let hasTrgm = false;
    try {
      const extResult: any = await db.execute(sql`SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') AS enabled`);
      const extRows = Array.isArray(extResult?.rows) ? extResult.rows : (Array.isArray(extResult) ? extResult : []);
      hasTrgm = Boolean(extRows?.[0]?.enabled);
    } catch {
      hasTrgm = false;
    }

    let rows: Array<{ code: string; title: string }> = [];

    // Introspect the table to discover column names
    const colsRes: any = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'acc_occupation_codes'
    `);
    const colRows = Array.isArray(colsRes?.rows) ? colsRes.rows : (Array.isArray(colsRes) ? colsRes : []);
    const columnNames: string[] = colRows.map((r: any) => r.column_name || r.columnName).filter(Boolean);

    // Pick code and title-like columns
    const pick = (cands: string[]): string | null => cands.find(c => columnNames.includes(c)) || null;
    const findByIncludes = (needle: string[]): string | null => columnNames.find(c => needle.some(n => c.toLowerCase().includes(n))) || null;

    const codeCol = pick(['code', 'occupation_code']) || findByIncludes(['code']) || null;
    const titleCol = pick(['title', 'occupation_title', 'name', 'occupation', 'description']) || findByIncludes(['title', 'name', 'occupation', 'desc']) || null;

    if (!codeCol || !titleCol) {
      const errRes = NextResponse.json({ error: 'Search query failed (unknown schema)' }, { status: 500 });
      errRes.headers.set('x-debug', `unknown-columns: code=${codeCol || 'null'}, title=${titleCol || 'null'}`);
      Object.entries(headers).forEach(([k, v]) => errRes.headers.set(k, v));
      return errRes;
    }

    const quoteIdent = (name: string) => `"${name.replace(/"/g, '""')}"`;
    const codeIdent = sql.raw(quoteIdent(codeCol));
    const titleIdent = sql.raw(quoteIdent(titleCol));

    // Build and run the final query using discovered columns
    try {
      if (hasTrgm) {
        const result: any = await db.execute(sql`
          SELECT ${codeIdent} AS code, ${titleIdent} AS title
          FROM public.acc_occupation_codes
          WHERE (${titleIdent} % ${q} OR ${codeIdent} % ${q} OR ${titleIdent} ILIKE ${like} OR ${codeIdent} ILIKE ${like})
          ORDER BY GREATEST(similarity(${titleIdent}, ${q}), similarity(${codeIdent}, ${q})) DESC, ${titleIdent} ASC
          LIMIT 25
        `);
        rows = Array.isArray(result?.rows) ? result.rows : (Array.isArray(result) ? result : []);
      } else {
        const result: any = await db.execute(sql`
          SELECT ${codeIdent} AS code, ${titleIdent} AS title
          FROM public.acc_occupation_codes
          WHERE (${titleIdent} ILIKE ${like} OR ${codeIdent} ILIKE ${like})
          ORDER BY ${titleIdent} ASC
          LIMIT 25
        `);
        rows = Array.isArray(result?.rows) ? result.rows : (Array.isArray(result) ? result : []);
      }
    } catch (err) {
      const errRes = NextResponse.json({ error: 'Search query failed' }, { status: 500 });
      errRes.headers.set('x-debug', 'acc-occupation-codes-dynamic-sql-error');
      Object.entries(headers).forEach(([k, v]) => errRes.headers.set(k, v));
      return errRes;
    }

    const data = rows.map(r => ({ code: r.code, title: r.title, anzscoCode: null as any, notes: null as any }));

    const res = NextResponse.json({ results: data });
    res.headers.set('Cache-Control', 'public, max-age=10, s-maxage=10');
    Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
