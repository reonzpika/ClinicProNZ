import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/db/client';
import { mobileTokens } from '@/db/schema';
import { checkGuestSessionLimit } from '@/src/lib/services/guest-session-service';

export async function POST(req: Request) {
  try {
    // Get userId from request headers (sent by client)
    const userId = req.headers.get('x-user-id');

    const body = await req.json().catch(() => ({}));
    const { guestToken: existingGuestToken } = body;

    // Check session limits for guest tokens
    if (!userId && existingGuestToken) {
      const sessionStatus = await checkGuestSessionLimit(existingGuestToken);
      if (!sessionStatus.canCreateSession) {
        return NextResponse.json({
          error: 'Session limit exceeded',
          message: `You have used ${sessionStatus.sessionsUsed}/5 free sessions. Please sign in to continue.`,
          sessionsUsed: sessionStatus.sessionsUsed,
          sessionsRemaining: sessionStatus.sessionsRemaining,
          resetTime: sessionStatus.resetTime.toISOString(),
        }, { status: 429 });
      }
    }

    // Generate a unique token OR reuse existing guest token
    const token = (!userId && existingGuestToken) ? existingGuestToken : uuidv4();

    // Set token expiry based on user type
    let expiresAt: Date;
    if (userId) {
      // Authenticated users: 24 hours (existing behavior)
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else {
      // Anonymous users: 7 days for guest tokens
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    // Store the token in database (userId can be null for guest tokens)
    // For reused guest tokens, check if record already exists
    if (!userId && existingGuestToken && token === existingGuestToken) {
      // Check if guest token exists in database
      const { eq } = await import('drizzle-orm');
      const existingRecord = await db
        .select()
        .from(mobileTokens)
        .where(eq(mobileTokens.token, token))
        .limit(1);

      if (existingRecord.length > 0) {
        // Token exists, update it
        await db.update(mobileTokens)
          .set({
            expiresAt,
            isActive: true,
            lastUsedAt: new Date(),
          })
          .where(eq(mobileTokens.token, token));
      } else {
        // Token doesn't exist, create it
        await db.insert(mobileTokens).values({
          token,
          userId: null, // Guest token
          expiresAt,
          isActive: true,
          lastUsedAt: new Date(),
        });
      }
    } else {
      // New token (authenticated user) or new guest token
      await db.insert(mobileTokens).values({
        token,
        userId: userId || null,
        expiresAt,
        isActive: true,
        lastUsedAt: new Date(),
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
      isGuest: !userId, // Indicate if this is a guest session
      guestToken: !userId ? token : undefined, // Return guest token for client storage
    });
  } catch (error) {
    console.error('Error generating mobile token:', error);
    return NextResponse.json({
      error: 'Failed to generate mobile token',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
