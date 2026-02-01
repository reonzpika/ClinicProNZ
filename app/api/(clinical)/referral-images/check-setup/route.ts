import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { users } from '@/db/schema';
import { getDb } from 'database/client';

export const runtime = 'nodejs';

/**
 * GET /api/referral-images/check-setup?userId={clerkUserId}
 *
 * Returns whether the user has referral-images setup (exists in users table).
 * Response: { hasSetup: boolean, referralUserId: string | null }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId || typeof userId !== 'string') {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    const [row] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return NextResponse.json({
      hasSetup: !!row,
      referralUserId: row?.id ?? null,
    });
  } catch (error) {
    console.error('[referral-images/check-setup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check setup' },
      { status: 500 }
    );
  }
}
