import * as Ably from 'ably';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb } from 'database/client';
import { patientSessions } from '@/db/schema';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

export async function POST(req: Request) {
  try {
    const db = getDb();
    const context = await extractRBACContext(req);
    if (!context.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Neon HTTP driver doesn't support transactions; perform a single UPDATE
    const updated = await db
      .update(patientSessions)
      .set({
        isRecording: false,
        transcriptions: JSON.stringify([]),
        typedInput: '',
        consultationNotes: '',
        notes: '',
        updatedAt: new Date(),
      })
      .where(and(eq(patientSessions.id, sessionId), eq(patientSessions.userId, context.userId)))
      .returning({ id: patientSessions.id });

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Server emits recording stop (best-effort)
    try {
      if (process.env.ABLY_API_KEY) {
        const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });
        const channel = ably.channels.get(`token:${context.userId}`);
        await channel.publish('recording_status', {
          type: 'recording_status',
          sessionId,
          isRecording: false,
          timestamp: Date.now(),
        });
      }
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in clear session API:', error);
    return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 });
  }
}
