import { and, desc, eq, gt } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { mobileTokens, patientSessions } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('token');

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 400 },
      );
    }

    // FIXED: Use mobileTokens.token instead of mobileTokens.id for lookup
    const tokenResult = await db
      .select({
        userId: mobileTokens.userId,
        expiresAt: mobileTokens.expiresAt,
        token: mobileTokens.token,
      })
      .from(mobileTokens)
      .where(
        and(
          eq(mobileTokens.token, tokenId), // FIXED: was mobileTokens.id
          gt(mobileTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (tokenResult.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 },
      );
    }

    const tokenData = tokenResult[0];
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 401 },
      );
    }

    const { userId } = tokenData;

    // FIXED: Support guest tokens (userId can be null for guest users)
    let sessionQuery;

    if (userId) {
      // Authenticated user - look up sessions by userId
      sessionQuery = db
        .select({
          id: patientSessions.id,
          patientName: patientSessions.patientName,
          createdAt: patientSessions.createdAt,
        })
        .from(patientSessions)
        .where(eq(patientSessions.userId, userId))
        .orderBy(desc(patientSessions.createdAt))
        .limit(1);
    } else {
      // Guest user - look up sessions by guestToken
      // For mobile tokens used by guests, match the token with guest sessions
      sessionQuery = db
        .select({
          id: patientSessions.id,
          patientName: patientSessions.patientName,
          createdAt: patientSessions.createdAt,
        })
        .from(patientSessions)
        .where(eq(patientSessions.guestToken, tokenId))
        .orderBy(desc(patientSessions.createdAt))
        .limit(1);
    }

    const sessionResult = await sessionQuery;

    if (sessionResult.length === 0) {
      return NextResponse.json({
        sessionId: null,
        patientName: null,
        message: 'No active session found',
      });
    }

    const session = sessionResult[0];
    if (!session) {
      return NextResponse.json({
        sessionId: null,
        patientName: null,
        message: 'No active session found',
      });
    }

    return NextResponse.json({
      sessionId: session.id,
      patientName: session.patientName,
      createdAt: session.createdAt,
    });
  } catch (error) {
    console.error('Error fetching current session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
