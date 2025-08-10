import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { mobileTokens } from '@/db/schema';
import { cleanupInactiveMobileTokens } from '@/src/lib/services/cleanup-service';

export async function POST(req: Request) {
  try {
    // Opportunistic cleanup to prevent bloat
    try {
      await cleanupInactiveMobileTokens();
    } catch {
      // ignore cleanup errors
    }
    // Get userId from request headers (sent by client)
    const userId = req.headers.get('x-user-id');

    // Authentication required for mobile token generation
    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required',
        message: 'Please sign in to generate a mobile token',
      }, { status: 401 });
    }

    const now = new Date();

    // Parse optional body for forceRotate flag
    let forceRotate = false;
    try {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const body = await req.json().catch(() => null);
        if (body && typeof body.forceRotate === 'boolean') {
          forceRotate = body.forceRotate === true;
        }
      }
    } catch {
      // ignore parse errors; default forceRotate false
    }

    // Check for existing active token (ignore expiry)
    const existingTokens = forceRotate
      ? []
      : await db
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

    let token: string;
    let expiresAt: Date;

    if (existingTokens.length > 0) {
      // Return existing active token
      const existingToken = existingTokens[0]!;
      token = existingToken.token;
      expiresAt = new Date(existingToken.expiresAt);

      // Update lastUsedAt for the existing token
      await db
        .update(mobileTokens)
        .set({ lastUsedAt: now })
        .where(eq(mobileTokens.token, token));
    } else {
      // Deactivate any existing tokens for this user before creating new one
      await db
        .update(mobileTokens)
        .set({ isActive: false })
        .where(eq(mobileTokens.userId, userId));

      // Generate a new unique token
      token = uuidv4();
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Store the new token in database
      await db.insert(mobileTokens).values({
        token,
        userId,
        expiresAt,
        isActive: true,
        lastUsedAt: now,
      });
    }

    // Check if Ably is configured
    if (!process.env.ABLY_API_KEY) {
      return NextResponse.json({
        error: 'Ably service not configured',
        code: 'ABLY_NOT_CONFIGURED',
      }, { status: 503 });
    }

    // Create mobile URL for QR code
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'https://clinicpro.co.nz';
    const mobileUrl = `${baseUrl}/mobile?token=${token}`;

    return NextResponse.json({
      token,
      mobileUrl,
      expiresAt: expiresAt.toISOString(),
      isGuest: false, // Guest tokens no longer supported
      // Authentication required for mobile tokens
    });
  } catch (error) {
    console.error('Error generating mobile token:', error);
    return NextResponse.json({
      error: 'Failed to generate mobile token',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
