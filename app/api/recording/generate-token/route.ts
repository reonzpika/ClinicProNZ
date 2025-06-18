import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../../../../database/client';
import { recordingTokens } from '../../../../database/schema';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Generate a unique token
    const token = uuidv4();
    const tokenId = uuidv4();

    // Token expires in 5 hours (longer window for consultation sessions)
    const expiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000);

    // Store the token in database
    await db.insert(recordingTokens).values({
      id: tokenId,
      sessionId,
      userId,
      token,
      expiresAt,
      isUsed: false,
    });

    // Generate the mobile recording URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const recordingUrl = `${baseUrl}/record?sessId=${sessionId}&token=${token}`;

    return NextResponse.json({
      token,
      sessionId,
      recordingUrl,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
