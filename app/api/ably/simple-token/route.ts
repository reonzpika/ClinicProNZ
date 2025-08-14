import * as Ably from 'ably';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { mobileTokens } from '@/db/schema';
import { cleanupInactiveMobileTokens } from '@/src/lib/services/cleanup-service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Opportunistic cleanup to remove old inactive tokens
    try {
      await cleanupInactiveMobileTokens();
    } catch {
      // ignore cleanup errors
    }
    let tokenId: string | null = null;

    // Parse request body - handle both JSON and form data
    const contentType = request.headers.get('content-type') || '';

    try {
      if (contentType.includes('application/json')) {
        const { tokenId: jsonTokenId } = await request.json();
        tokenId = jsonTokenId;
      } else {
        // Handle URL-encoded form data (Ably authParams default)
        const body = await request.text();
        const params = new URLSearchParams(body);
        tokenId = params.get('tokenId');
      }
    } catch (parseError) {
      console.error('Error parsing request:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 },
      );
    }

    if (!tokenId) {
      return NextResponse.json(
        { error: 'TokenId is required' },
        { status: 400 },
      );
    }

    // FIXED: Check if Ably is configured BEFORE creating client
    if (!process.env.ABLY_API_KEY) {
      return NextResponse.json(
        {
          error: 'Ably service not configured',
          code: 'ABLY_NOT_CONFIGURED',
        },
        { status: 503 },
      );
    }

    // Validate tokenId exists
    const tokenData = await db
      .select()
      .from(mobileTokens)
      .where(eq(mobileTokens.token, tokenId))
      .limit(1);

    if (!tokenData.length) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const token = tokenData[0];

    if (!token) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 401 },
      );
    }

    // Require active token (no expiry logic)
    if (token.isActive === false) {
      return NextResponse.json({ error: 'Inactive token' }, { status: 401 });
    }

    // FIXED: Create Ably client with proper constructor pattern
    const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });

    // Create Ably token request for authUrl compatibility
    const ablyTokenRequest = await ably.auth.createTokenRequest({
      clientId: token.userId || token.token, // Use token itself as clientId for guest users
      capability: {
        [`token:${tokenId}`]: ['publish', 'subscribe', 'presence'],
      },
      ttl: 24 * 60 * 60 * 1000, // 24 hours in milliseconds (auto-refresh via authCallback)
    });

    // FIXED: Return TokenRequest object instead of raw token
    // Ably authUrl expects TokenRequest object for proper token management
    return NextResponse.json(ablyTokenRequest);
  } catch (error) {
    console.error('Error creating simple Ably token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
