import { NextRequest, NextResponse } from 'next/server';
import { getAlgoliaIndex } from '@/src/lib/algolia';

function enforceWhitelistFilter(): string {
  const whitelistedDomains = [
    'healthify.nz',
    'nzf.org.nz',
    'www.nzfchildren.org.nz',
    'dermnetnz.org',
    'www.cdc.gov',
    'wwwnc.cdc.gov',
    'www.health.govt.nz',
  ];
  // Algolia filter syntax using ORs on a facet `site`
  const siteFilters = whitelistedDomains.map((d) => `site:${d}`).join(' OR ');
  return siteFilters;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q')?.trim() || '';
    const page = Number(url.searchParams.get('page') || '0');
    const perPage = Math.min(Number(url.searchParams.get('perPage') || '10'), 25);
    const withSnippet = url.searchParams.get('withSnippet') !== 'false';

    if (!q) {
      return NextResponse.json({ items: [], page: 0, nbPages: 0 }, { status: 200 });
    }

    const index = getAlgoliaIndex();

    const filters = enforceWhitelistFilter();

    const res = await index.search(q, {
      page,
      hitsPerPage: perPage,
      filters,
      attributesToRetrieve: ['title', 'url', 'snippet', 'site'],
      attributesToHighlight: withSnippet ? ['content'] : [],
      attributesToSnippet: withSnippet ? ['content:35'] : [],
    });

    const items = res.hits.map((hit: any) => ({
      title: hit.title as string,
      url: hit.url as string,
      snippet: (hit.snippet as string) || hit._snippetResult?.content?.value || undefined,
      site: (hit.site as string) || undefined,
      rank: hit._rankingInfo?.nbTypos ?? undefined,
    }));

    return NextResponse.json({ items, page: res.page, nbPages: res.nbPages }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Search failed', details: err?.message }, { status: 500 });
  }
}