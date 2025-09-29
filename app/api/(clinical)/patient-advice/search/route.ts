// @ts-nocheck
import { NextResponse } from 'next/server';

import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';
import { cacheGet, cacheSet, hoursToSeconds } from '@/src/lib/cache/redis';

type SearchItem = { title: string; link: string };
type SearchResponse = { items: SearchItem[] };

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();
    if (!q) {
      return NextResponse.json({ items: [] } satisfies SearchResponse);
    }

    const context = await extractRBACContext(req);
    const permission = await checkCoreAccess(context);
    if (!permission.allowed) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
    const key = process.env.GOOGLE_SEARCH_API_KEY;
    if (!cx || !key) {
      return NextResponse.json({ error: 'Missing Google search config' }, { status: 500 });
    }

    const ttlHrs = Number(process.env.SEARCH_CACHE_TTL_HOURS || '72');
    const ttl = hoursToSeconds(ttlHrs);
    const cacheKey = `advice:search:v1:${cx}:${q.toLowerCase()}`;
    const forceRefresh = url.searchParams.get('refresh') === '1';

    if (!forceRefresh) {
      const cached = await cacheGet<SearchResponse>(cacheKey);
      if (cached && Array.isArray(cached.items) && cached.items.length > 0) {
        return NextResponse.json(cached as SearchResponse);
      }
    }

    const endpoint = new URL('https://www.googleapis.com/customsearch/v1');
    endpoint.searchParams.set('key', key);
    endpoint.searchParams.set('cx', cx);
    endpoint.searchParams.set('num', '10');
    endpoint.searchParams.set('q', q);

    const resp = await fetch(endpoint.toString(), { method: 'GET' });
    if (!resp.ok) {
      return NextResponse.json({ items: [] } satisfies SearchResponse, { status: 200 });
    }
    const data: any = await resp.json();
    const items: SearchItem[] = Array.isArray(data?.items)
      ? data.items
          .map((it: any) => ({ title: String(it?.title || '').trim(), link: String(it?.link || '').trim() }))
          .filter((it: SearchItem) => it.title && it.link && it.link.includes('healthify.nz'))
          .slice(0, 10)
      : [];

    const response: SearchResponse = { items };
    await cacheSet(cacheKey, response, ttl);
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ items: [] } satisfies SearchResponse);
  }
}

