import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '../../../../database/client';
import { recordingTokens } from '../../../../database/schema';

export async function POST(req: Request) {
  try {
    const { token, sessionId } = await req.json();

    if (!token || !sessionId) {
      return NextResponse.json({ error: 'Token and session ID are required' }, { status: 400 });
    }

    // Find the token in the database
    const tokenRecord = await db
      .select()
      .from(recordingTokens)
      .where(
        and(
          eq(recordingTokens.token, token),
          eq(recordingTokens.sessionId, sessionId),
        ),
      )
      .limit(1);

    if (tokenRecord.length === 0) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const record = tokenRecord[0];
    if (!record) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if token has expired
    if (new Date() > record.expiresAt) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 401 });
    }

    // Check if token has already been used (optional - remove this if you want reusable tokens)
    if (record.isUsed) {
      return NextResponse.json({ error: 'Token has already been used' }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      sessionId: record.sessionId,
      userId: record.userId,
      expiresAt: record.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json({ error: 'Failed to validate token' }, { status: 500 });
  }
}
