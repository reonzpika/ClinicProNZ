import { and, desc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { mobileTokens, patientSessions, users } from '@/db/schema';
import { deleteMobileToken } from '@/src/lib/services/cleanup-service';

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

    // Use mobileTokens.token for lookup and ensure token is active
    const tokenResult = await db
      .select({
        userId: mobileTokens.userId,
        isActive: mobileTokens.isActive,
        isPermanent: mobileTokens.isPermanent,
        token: mobileTokens.token,
      })
      .from(mobileTokens)
      .where(
        and(
          eq(mobileTokens.token, tokenId),
          eq(mobileTokens.isActive, true),
        ),
      )
      .limit(1);

    if (tokenResult.length === 0) {
      // Opportunistic cleanup: attempt to delete token if it exists but is inactive/non-usable
      try {
        if (tokenId) {
          await deleteMobileToken(tokenId);
        }
      } catch {
        // ignore cleanup errors
      }
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

    // Guests are not supported; require userId
    let sessionQuery;

    if (userId) {
      // Authenticated user - prefer user's persisted current session if available
      const userRow = await db
        .select({
          currentSessionId: users.currentSessionId,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const preferredSessionId = userRow?.[0]?.currentSessionId || null;

      if (preferredSessionId) {
        // Return the explicitly selected current session
        sessionQuery = db
          .select({
            id: patientSessions.id,
            patientName: patientSessions.patientName,
            createdAt: patientSessions.createdAt,
          })
          .from(patientSessions)
          .where(eq(patientSessions.id, preferredSessionId))
          .limit(1);
      } else {
        // Fallback: latest by createdAt
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
      }
    } else {
      return NextResponse.json({ error: 'Invalid token data' }, { status: 401 });
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
