import { NextResponse } from 'next/server';

import { getGuestSessionStats } from '@/lib/services/guest-session-service';

export async function POST(req: Request) {
  try {
    const { guestToken } = await req.json();

    if (!guestToken) {
      return NextResponse.json({ error: 'Guest token is required' }, { status: 400 });
    }

    const sessionStatus = await getGuestSessionStats(guestToken);

    return NextResponse.json({
      canCreateSession: sessionStatus.canCreateSession,
      sessionsUsed: sessionStatus.sessionsUsed,
      sessionsRemaining: sessionStatus.sessionsRemaining,
      resetTime: sessionStatus.resetTime.toISOString(),
      limit: 5,
    });
  } catch (error) {
    console.error('Error checking guest session status:', error);
    return NextResponse.json({ error: 'Failed to check session status' }, { status: 500 });
  }
}
