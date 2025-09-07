import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getDb } from 'database/client';
import { patientSessions, users } from '@/db/schema';

export async function GET(_req: NextRequest) {
  try {
    const db = getDb();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const rows = await db
      .select({ currentSessionId: users.currentSessionId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const currentSessionId = rows?.[0]?.currentSessionId || null;
    return NextResponse.json({ currentSessionId });
  } catch (error) {
    console.error('GET /api/current-session failed:', error);
    return NextResponse.json({ error: 'Failed to get current session' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = getDb();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Validate the session belongs to the user
    const sessionRows = await db
      .select({ id: patientSessions.id })
      .from(patientSessions)
      .where(and(eq(patientSessions.id, sessionId), eq(patientSessions.userId, userId)))
      .limit(1);
    if (sessionRows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await db.update(users).set({ currentSessionId: sessionId }).where(eq(users.id, userId));
    return NextResponse.json({ currentSessionId: sessionId });
  } catch (error) {
    console.error('PUT /api/current-session failed:', error);
    return NextResponse.json({ error: 'Failed to set current session' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
