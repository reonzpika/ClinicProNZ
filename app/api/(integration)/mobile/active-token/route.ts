import { and, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { mobileTokens } from '@/db/schema';
import { cleanupInactiveMobileTokens } from '@/src/lib/services/cleanup-service';

export async function GET(req: Request) {
  try {
    // Opportunistic cleanup to prevent bloat
    try {
      await cleanupInactiveMobileTokens();
    } catch {
      // ignore cleanup errors
    }
    // Get userId from request headers (sent by client)
    const userId = req.headers.get('x-user-id');

    // Authentication required for mobile token retrieval
    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required',
        message: 'Please sign in to retrieve your mobile token',
      }, { status: 401 });
    }

    // Check for existing active token (permanent tokens)
    const existingTokens = await db
      .select()
      .from(mobileTokens)
      .where(
        and(
          eq(mobileTokens.userId, userId),
          eq(mobileTokens.isActive, true),
        ),
      )
      .orderBy(desc(mobileTokens.createdAt))
      .limit(1);

    if (existingTokens.length === 0) {
      return NextResponse.json({
        error: 'No active token found',
        message: 'No active mobile token exists for this user',
      }, { status: 404 });
    }

    const existingToken = existingTokens[0]!;

    // Update lastUsedAt for the existing token
    await db
      .update(mobileTokens)
      .set({ lastUsedAt: new Date(), isPermanent: true })
      .where(eq(mobileTokens.token, existingToken.token));

    // Create mobile URL for QR code
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'https://clinicpro.co.nz';
    const mobileUrl = `${baseUrl}/mobile?token=${existingToken.token}`;

    return NextResponse.json({
      token: existingToken.token,
      mobileUrl,
      isGuest: false,
    });
  } catch (error) {
    console.error('Error fetching active mobile token:', error);
    return NextResponse.json({
      error: 'Failed to fetch active mobile token',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
