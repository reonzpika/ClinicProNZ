import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { checkUserSessionLimit } from '@/lib/services/guest-session-service';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user session status
    const sessionStatus = await checkUserSessionLimit(userId);

    return NextResponse.json({
      sessionsUsed: sessionStatus.sessionsUsed,
      sessionsRemaining: sessionStatus.sessionsRemaining,
      canCreateSession: sessionStatus.canCreateSession,
      resetTime: sessionStatus.resetTime.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching user usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
