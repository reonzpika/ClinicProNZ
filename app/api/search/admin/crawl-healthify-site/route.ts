import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { crawlHealthifySite } from '@/src/lib/scrapers/healthify-site-crawler';

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userTier = (sessionClaims as any)?.metadata?.tier || 'basic';
    if (userTier !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('[ADMIN CRAWLER] Starting comprehensive Healthify site crawl');

    // Start the crawl (this will take a long time)
    await crawlHealthifySite();

    return NextResponse.json({ 
      success: true, 
      message: 'Site crawl completed successfully' 
    });

  } catch (error) {
    console.error('[ADMIN CRAWLER] Crawl failed:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred during crawl' },
      { status: 500 },
    );
  }
}

// GET endpoint to check crawl status
export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userTier = (sessionClaims as any)?.metadata?.tier || 'basic';
    if (userTier !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get crawl statistics
    const { db } = await import('@/database/client');
    const { ragDocuments } = await import('@/database/schema/rag');
    const { eq, count } = await import('drizzle-orm');

    const [basicCount] = await db
      .select({ count: count() })
      .from(ragDocuments)
      .where(eq(ragDocuments.enhancementStatus, 'basic'));

    const [enhancedCount] = await db
      .select({ count: count() })
      .from(ragDocuments)  
      .where(eq(ragDocuments.enhancementStatus, 'enhanced'));

    const [totalCount] = await db
      .select({ count: count() })
      .from(ragDocuments)
      .where(eq(ragDocuments.sourceType, 'healthify'));

    return NextResponse.json({
      totalArticles: totalCount?.count || 0,
      basicArticles: basicCount?.count || 0,
      enhancedArticles: enhancedCount?.count || 0,
    });

  } catch (error) {
    console.error('[ADMIN CRAWLER] Status check failed:', error);
    return NextResponse.json(
      { error: 'Failed to get crawl status' },
      { status: 500 },
    );
  }
}
