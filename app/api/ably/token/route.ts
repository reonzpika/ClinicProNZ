import { auth } from '@clerk/nextjs/server';
import * as Ably from 'ably';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/client';
import { mobileTokens } from '@/schema/mobile_tokens';

export async function POST(req: Request) {
  try {
    let userId: string | null = null;

    // First try Clerk authentication (for desktop users)
    const { userId: clerkUserId } = await auth();
    if (clerkUserId) {
      userId = clerkUserId;
    } else {
      // If Clerk auth fails, try mobile token authentication
      const url = new URL(req.url);
      const mobileToken = url.searchParams.get('token') || req.headers.get('x-mobile-token');

      if (mobileToken) {
        console.error('Validating mobile token:', mobileToken);

        // Validate mobile token
        const tokenRecord = await db
          .select()
          .from(mobileTokens)
          .where(eq(mobileTokens.token, mobileToken))
          .limit(1);

        console.error('Token record found:', tokenRecord.length > 0 ? 'YES' : 'NO');
        if (tokenRecord.length > 0) {
          console.error('Token record:', tokenRecord[0]);
          console.error('Token expires at:', tokenRecord[0]!.expiresAt);
          console.error('Current time:', new Date());
          console.error('Is expired?', tokenRecord[0]!.expiresAt <= new Date());
        }

        if (tokenRecord.length > 0 && tokenRecord[0]!.expiresAt > new Date()) {
          userId = tokenRecord[0]!.userId;
          console.error('Token valid, userId:', userId);
        } else {
          console.error('Token validation failed');
        }
      }
    }

    if (!userId) {
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

    // Generate a token for the client
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: userId,
      // Optional: Add capabilities/restrictions
      capability: {
        [`user-${userId}`]: ['publish', 'subscribe', 'presence'],
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
