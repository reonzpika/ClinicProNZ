import { auth } from '@clerk/nextjs/server';
import * as Ably from 'ably';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Ably is configured
    if (!process.env.ABLY_API_KEY) {
      return NextResponse.json({ 
        error: 'Ably service not configured',
        code: 'ABLY_NOT_CONFIGURED'
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
