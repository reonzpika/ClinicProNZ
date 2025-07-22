import { auth } from '@clerk/nextjs/server';
import * as Ably from 'ably';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { mobileTokens } from '@/db/schema/mobile_tokens';

export async function POST(req: Request) {
  try {
    let userId: string | null = null;
    let clientId: string | null = null;

    // First try Clerk authentication (for desktop users)
    const { userId: clerkUserId } = await auth();

    if (clerkUserId) {
      userId = clerkUserId;
      clientId = clerkUserId;
    } else {
      // If Clerk auth fails, try mobile token authentication
      const url = new URL(req.url);
      const mobileToken = url.searchParams.get('token') || req.headers.get('x-mobile-token');

      if (mobileToken) {
        // Validate mobile token
        const tokenRecord = await db
          .select()
          .from(mobileTokens)
          .where(eq(mobileTokens.token, mobileToken))
          .limit(1);

        if (tokenRecord.length > 0) {
          const record = tokenRecord[0]!;
          const isExpired = record.expiresAt <= new Date();

          if (!isExpired) {
            userId = record.userId;
            // For guest tokens (userId is null), use the mobile token as clientId
            if (!userId) {
              clientId = `guest-${mobileToken}`;
            } else {
              clientId = userId;
            }
          }
        }
      } else {
        // If no mobile token, check for guest token (desktop guest users)
        const guestToken = req.headers.get('x-guest-token') || url.searchParams.get('guestToken');

        if (guestToken) {
          // Use guest token directly as client ID for desktop guest users
          clientId = guestToken;
        }
      }
    }

    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Ably is configured
    if (!process.env.ABLY_API_KEY) {
      return NextResponse.json({
        error: 'Ably service not configured',
        code: 'ABLY_NOT_CONFIGURED',
      }, { status: 503 });
    }

    // Create Ably client with your API key (server-side only)
    const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });

    // Phase 1: Updated capability-based authentication with new channel naming
    const isGuestUser = clientId.startsWith('guest-');
    const baseChannelPattern = isGuestUser
      ? `guest:${clientId.replace('guest-', '')}*`
      : `user:${clientId}*`;

    // Generate a token for the client
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId,
      // Phase 1: Capability-based access control for new channel architecture
      capability: {
        [baseChannelPattern]: ['publish', 'subscribe', 'presence'],
        'consult:*': ['publish', 'subscribe'], // Access to all consultation transcript channels
      },
      // Token expires in 24 hours (same as mobile token)
      ttl: 24 * 60 * 60 * 1000,
    });

    return NextResponse.json({ tokenRequest });
  } catch (error) {
    console.error('Error generating Ably token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
