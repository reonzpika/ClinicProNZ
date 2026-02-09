import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Debug endpoint: returns session claims and public metadata for the current user.
 * Sign-in only (no admin required). Use to verify JWT includes metadata.tier.
 * GET /api/session-debug
 */
export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    const metadataFromClaims = (sessionClaims as { metadata?: unknown })?.metadata;
    const tierFromClaims =
      typeof metadataFromClaims === 'object' &&
      metadataFromClaims !== null &&
      'tier' in metadataFromClaims
        ? (metadataFromClaims as { tier?: string }).tier
        : undefined;
    const currentTier =
      typeof tierFromClaims === 'string' ? tierFromClaims : 'no tier set';

    return NextResponse.json({
      userId,
      sessionClaims,
      metadataFromClaims,
      tierFromClaims,
      currentTier,
      publicMetadata: user.publicMetadata,
    });
  } catch (error) {
    console.error('[session-debug]', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch session data',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
