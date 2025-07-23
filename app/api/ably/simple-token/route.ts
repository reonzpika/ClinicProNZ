import * as Ably from 'ably';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { mobileTokens } from '@/db/schema';

// Initialize Ably with API key
const ably = new Ably.Rest(process.env.ABLY_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { tokenId } = await request.json();

    if (!tokenId) {
      return NextResponse.json(
        { error: 'TokenId is required' },
        { status: 400 },
      );
    }

    // Check if Ably is configured
    if (!process.env.ABLY_API_KEY) {
      return NextResponse.json(
        {
          error: 'Ably service not configured',
          code: 'ABLY_NOT_CONFIGURED',
        },
        { status: 503 },
      );
    }

    // Validate tokenId exists and is not expired
    const tokenData = await db
      .select()
      .from(mobileTokens)
      .where(eq(mobileTokens.token, tokenId))
      .limit(1);

    if (!tokenData.length) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 },
      );
    }

    const token = tokenData[0];

    if (!token) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 401 },
      );
    }

    // Check if token is expired (24 hours)
    const expiryTime = new Date(token.expiresAt).getTime();
    const now = Date.now();

    if (now > expiryTime) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 401 },
      );
    }

    // FIXED: Create Ably token and return it directly for authUrl compatibility
    const ablyTokenRequest = await ably.auth.createTokenRequest({
      clientId: token.userId || token.token, // Use token itself as clientId for guest users
      capability: {
        [`token:${tokenId}`]: ['publish', 'subscribe', 'presence'],
      },
      ttl: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    });

    // Create an actual token from the token request for direct use
    const ablyToken = await ably.auth.requestToken(ablyTokenRequest);

    // FIXED: Return token string directly for Ably authUrl
    // When using authUrl, Ably expects the response to be a token string
    return new Response(ablyToken.token, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error creating simple Ably token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
