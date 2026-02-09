import { clerkClient } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { users } from '@/db/schema';

export const runtime = 'nodejs';

/**
 * GET /api/referral-images/check-setup?userId={clerkUserId}
 *
 * Returns whether the user has referral-images setup (exists in users table).
 * If no row by userId, looks up by email from Clerk so same-email accounts are treated as having setup.
 * Response: { hasSetup: boolean, referralUserId: string | null }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId || typeof userId !== 'string') {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 },
    );
  }

  try {
    const db = getDb();
    const [row] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (row) {
      return NextResponse.json({
        hasSetup: true,
        referralUserId: row.id,
      });
    }

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const email
      = clerkUser.emailAddresses[0]?.emailAddress ?? null;

    if (!email) {
      return NextResponse.json({
        hasSetup: false,
        referralUserId: null,
      });
    }

    const [rowByEmail] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return NextResponse.json({
      hasSetup: !!rowByEmail,
      referralUserId: rowByEmail?.id ?? null,
    });
  } catch (error) {
    console.error('[referral-images/check-setup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check setup' },
      { status: 500 },
    );
  }
}
