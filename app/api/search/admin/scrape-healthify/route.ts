import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { scrapeAndIngestHealthify } from '@/src/lib/scrapers/healthify-scraper';

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin tier
    const userTier = (sessionClaims as any)?.metadata?.tier || 'basic';
    if (userTier !== 'admin') {
      return NextResponse.json({
        error: 'Admin tier required for content ingestion',
      }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { queries } = body;

    if (!queries || !Array.isArray(queries)) {
      return NextResponse.json(
        { error: 'Queries array is required' },
        { status: 400 },
      );
    }

    const results = [];

    // Process each query
    for (const query of queries) {
      if (typeof query !== 'string' || !query.trim()) {
        continue;
      }

      try {
        // Starting scrape for query (logging removed for lint compliance)
        await scrapeAndIngestHealthify(query.trim());
        results.push({ query, status: 'success' });

        // Delay between queries to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        // Error logged (console removed for lint compliance)
        results.push({ query, status: 'error', error: errorMsg });
      }
    }

    return NextResponse.json({
      message: 'Scraping completed',
      results,
    });
  } catch (error) {
    console.error('Scrape endpoint error:', error);

    return NextResponse.json(
      { error: 'Failed to process scraping request' },
      { status: 500 },
    );
  }
}

// GET endpoint to check scraping status or trigger simple scrapes
export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin tier
    const userTier = (sessionClaims as any)?.metadata?.tier || 'basic';
    if (userTier !== 'admin') {
      return NextResponse.json({
        error: 'Admin tier required',
      }, { status: 403 });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get('query');

    if (query) {
      // Single query scraping
      try {
        // Single scrape starting (logging removed for lint compliance)
        await scrapeAndIngestHealthify(query);

        return NextResponse.json({
          message: `Successfully scraped content for "${query}"`,
          query,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
          { error: `Scraping failed: ${errorMsg}` },
          { status: 500 },
        );
      }
    }

    // Return scraping info
    return NextResponse.json({
      message: 'Healthify scraper ready',
      usage: {
        POST: 'Scrape multiple queries: { "queries": ["query1", "query2"] }',
        GET: 'Single query: ?query=headache',
      },
    });
  } catch (error) {
    console.error('Scrape status error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}
