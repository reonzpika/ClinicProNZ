import { getDb } from 'database/client';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { shareEvents } from '@/db/schema';

export const runtime = 'nodejs';

/**
 * POST /api/referral-images/share/track
 *
 * Track share click or share completion
 *
 * Request body:
 * - userId: string (required)
 * - location: string (required) e.g. 'desktop_after_download', 'desktop_header', 'mobile_toast'
 * - method?: string (optional) e.g. 'whatsapp', 'email', 'copy_link', 'native_sheet'
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, location, method } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      );
    }
    if (!location || typeof location !== 'string') {
      return NextResponse.json(
        { error: 'location is required' },
        { status: 400 },
      );
    }

    const db = getDb();
    await db.insert(shareEvents).values({
      userId,
      location: location.trim(),
      method: method && typeof method === 'string' ? method.trim() : null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[referral-images/share/track] Error:', error);
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 },
    );
  }
}
