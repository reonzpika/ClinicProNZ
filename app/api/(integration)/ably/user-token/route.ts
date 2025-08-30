import * as Ably from 'ably';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.ABLY_API_KEY) {
      return NextResponse.json({ error: 'Ably not configured' }, { status: 503 });
    }

    const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: userId,
      capability: {
        [`user:${userId}`]: ['publish', 'subscribe', 'presence'],
      },
      ttl: 24 * 60 * 60 * 1000,
    } as any);

    return NextResponse.json(tokenRequest);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create Ably token' }, { status: 500 });
  }
}