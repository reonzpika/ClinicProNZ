import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../../../../database/client';
import { checkGuestSessionLimit } from '@/lib/services/guest-session-service';
import { mobileTokens } from '../../../../database/schema';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
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
        // Guest token doesn't exist in DB yet, insert it
        await db.insert(mobileTokens).values({
          userId: null, // Guest token
          token,
          expiresAt,
          isActive: true,
        });
      }
    } else {
      // New token, insert into database
      await db.insert(mobileTokens).values({
        userId: userId || null,
        token,
        expiresAt,
        isActive: true,
      });
    }

    // Generate the mobile connection URL with dynamic host detection
    const getBaseUrl = () => {
      // First try environment variable
      if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
      }

      // Extract from request headers for dynamic detection
      const host = req.headers.get('host');
      const protocol = req.headers.get('x-forwarded-proto') || 'https';

      if (host) {
        return `${protocol}://${host}`;
      }

      // Final fallback for local development
      return 'http://localhost:3000';
    };

    const baseUrl = getBaseUrl();
    const mobileUrl = `${baseUrl}/mobile?token=${token}`;

    return NextResponse.json({
      token,
      mobileUrl,
      expiresAt: expiresAt.toISOString(),
      qrData: mobileUrl, // For QR code generation
      isGuest: !userId, // Indicate if this is a guest token
      guestToken: !userId ? token : null, // Return guest token for client storage
    });
  } catch (error) {
    console.error('Mobile token generation error:', error);
    return NextResponse.json({ error: 'Failed to generate mobile token' }, { status: 500 });
  }
}
