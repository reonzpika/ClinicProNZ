import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/client';
import { mobileTokens } from '@/schema/mobile_tokens';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Validate mobile token
    const tokenRecord = await db
      .select()
      .from(mobileTokens)
      .where(eq(mobileTokens.token, token))
      .limit(1);

    if (tokenRecord.length === 0) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const tokenData = tokenRecord[0]!;

    // Check if token is expired
    if (tokenData.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    // Check if token is active
    if (!tokenData.isActive) {
      return NextResponse.json({ error: 'Token inactive' }, { status: 401 });
    }

    // Update last used timestamp
    await db
      .update(mobileTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(mobileTokens.token, token));

    // Return token validation success with user info
    return NextResponse.json({
      valid: true,
      userId: tokenData.userId,
      expiresAt: tokenData.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Mobile token validation error:', error);
    return NextResponse.json({ error: 'Token validation failed' }, { status: 500 });
  }
}
