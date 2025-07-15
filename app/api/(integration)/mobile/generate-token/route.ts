import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/db/client';
import { mobileTokens } from '@/db/schema';
import { checkGuestSessionLimit } from '@/src/lib/services/guest-session-service';

export async function POST(req: Request) {
  console.log('🚀 [mobile-token POST] Request received');
  
  try {
    // Log headers received
    const headers = {
      'x-user-id': req.headers.get('x-user-id'),
      'x-user-tier': req.headers.get('x-user-tier'),
      'x-guest-token': req.headers.get('x-guest-token'),
    };
    console.log('📋 [mobile-token POST] Headers:', headers);

    // Get userId from request headers (sent by client)
    const userId = req.headers.get('x-user-id');
    console.log('👤 [mobile-token POST] UserId from headers:', userId);

    console.log('📝 [mobile-token POST] Parsing request body...');
    const body = await req.json().catch(() => ({}));
    const { guestToken: existingGuestToken } = body;
    console.log('📝 [mobile-token POST] Request body:', { existingGuestToken });

    // Check session limits for guest tokens
    if (!userId && existingGuestToken) {
      console.log('🔍 [mobile-token POST] Checking guest session limits...');
      const sessionStatus = await checkGuestSessionLimit(existingGuestToken);
      console.log('🔍 [mobile-token POST] Session status:', sessionStatus);
      
      if (!sessionStatus.canCreateSession) {
        console.log('❌ [mobile-token POST] Session limit exceeded');
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
    const token = !userId && existingGuestToken ? existingGuestToken : uuidv4();
    console.log('🔑 [mobile-token POST] Token to use:', token, userId ? '(authenticated)' : '(guest)');

    // Set token expiry based on user type
    let expiresAt: Date;
    if (userId) {
      // Authenticated users: 24 hours (existing behavior)
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    } else {
      // Anonymous users: 7 days for guest tokens
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    console.log('⏰ [mobile-token POST] Token expiry:', expiresAt);

    // Store the token in database (userId can be null for guest tokens)
    console.log('💾 [mobile-token POST] Storing token in database...');
    // For reused guest tokens, check if record already exists
    if (!userId && existingGuestToken && token === existingGuestToken) {
      console.log('🔍 [mobile-token POST] Checking if guest token exists...');
      // Check if guest token exists in database
      const { eq } = await import('drizzle-orm');
      const existingRecord = await db
        .select()
        .from(mobileTokens)
        .where(eq(mobileTokens.token, token))
        .limit(1);

      if (existingRecord.length > 0) {
        console.log('📝 [mobile-token POST] Updating existing guest token...');
        // Token exists, update it
        await db.update(mobileTokens)
          .set({
            expiresAt,
            isActive: true,
            lastUsedAt: new Date(),
          })
          .where(eq(mobileTokens.token, token));
      } else {
        console.log('💾 [mobile-token POST] Creating new guest token record...');
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
      console.log('💾 [mobile-token POST] Creating new token record...');
      // New token (authenticated user) or new guest token
      await db.insert(mobileTokens).values({
        token,
        userId: userId || null,
        expiresAt,
        isActive: true,
        lastUsedAt: new Date(),
      });
    }
    console.log('✅ [mobile-token POST] Token stored in database successfully');

    // Check if Ably is configured
    console.log('🔌 [mobile-token POST] Checking Ably configuration...');
    if (!process.env.ABLY_API_KEY) {
      console.log('❌ [mobile-token POST] Ably not configured');
      return NextResponse.json({
        error: 'Ably service not configured',
        code: 'ABLY_NOT_CONFIGURED',
      }, { status: 503 });
    }

    // Create mobile URL for QR code
    const baseUrl = process.env.NEXT_PUBLIC_MOBILE_APP_URL || 'https://mobile.clinicpro.co.nz';
    const mobileUrl = `${baseUrl}/connect?token=${token}`;
    console.log('📱 [mobile-token POST] Mobile URL created:', mobileUrl);

    console.log('✅ [mobile-token POST] Returning token successfully');
    return NextResponse.json({
      token,
      mobileUrl,
      expiresAt: expiresAt.toISOString(),
      isGuest: !userId, // Indicate if this is a guest session
      guestToken: !userId ? token : undefined, // Return guest token for client storage
    });
  } catch (error) {
    console.error('❌ [mobile-token POST] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return NextResponse.json({
      error: 'Failed to generate mobile token',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
