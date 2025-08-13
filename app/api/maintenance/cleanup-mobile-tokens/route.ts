import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { cleanupInactiveMobileTokens } from '@/src/lib/services/cleanup-service';

// Simple cron-protected endpoint. Protect with env secret header to avoid public access
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const expected = process.env.CRON_SECRET;
    const headerSecret = req.headers.get('x-cron-secret');
    const querySecret = url.searchParams.get('key');
    const authHeader = req.headers.get('authorization');
    const bearerSecret = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7)
      : null;

    // Simple auth: allow either header or query param match
    if (!expected || (headerSecret !== expected && querySecret !== expected && bearerSecret !== expected)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deleted = await cleanupInactiveMobileTokens();
    return NextResponse.json({ deleted });
  } catch (error) {
    console.error('Error during token cleanup:', error);
    return NextResponse.json({ error: 'Failed to cleanup tokens' }, { status: 500 });
  }
}

// Allow GET to support simple schedulers
export const GET = POST;
