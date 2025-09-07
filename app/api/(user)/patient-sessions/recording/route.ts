import * as Ably from 'ably';
import { getDb } from 'database/client';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { patientSessions } from '@/db/schema';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

export async function POST(req: Request) {
  try {
    const db = getDb();
    const context = await extractRBACContext(req);
    if (!context.userId) {
 return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
}

  const { sessionId, isRecording } = await req.json();
  if (!sessionId || typeof isRecording !== 'boolean') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

    const updated = await db
      .update(patientSessions)
      .set({ isRecording, updatedAt: new Date() })
      .where(and(eq(patientSessions.id, sessionId), eq(patientSessions.userId, context.userId)))
      .returning({ id: patientSessions.id });

    if (!updated.length) {
 return NextResponse.json({ error: 'Session not found' }, { status: 404 });
}

    // Server emits recording status (best-effort)
    try {
      if (process.env.ABLY_API_KEY) {
        const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });
        const channel = ably.channels.get(`user:${context.userId}`);
        await channel.publish('recording_status', {
          type: 'recording_status',
          sessionId,
          isRecording,
          timestamp: Date.now(),
        });
      }
    } catch {}

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update recording status' }, { status: 500 });
  }
}
