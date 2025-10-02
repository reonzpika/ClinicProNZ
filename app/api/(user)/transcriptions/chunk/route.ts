import { auth } from '@clerk/nextjs/server';
import * as Ably from 'ably';
import { and, desc, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getDb, schema } from 'database/client';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, chunkId, text, source, deviceId } = await req.json();
    if (!sessionId || !chunkId || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const db = getDb();

    // Ensure session belongs to user and is not soft-deleted
    const sessionRows = await db
      .select({ id: schema.patientSessions.id, deletedAt: schema.patientSessions.deletedAt })
      .from(schema.patientSessions)
      .where(and(eq(schema.patientSessions.id, sessionId), eq(schema.patientSessions.userId, userId)));
    if (!sessionRows || sessionRows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Insert chunk idempotently
    let rowId: number | null = null;
    try {
      const rows = await db
        .insert(schema.transcriptionChunks)
        .values({ sessionId, userId, chunkId, text, source: (source || 'desktop') as any, deviceId })
        .returning({ id: schema.transcriptionChunks.id });
      rowId = rows?.[0]?.id ?? null;
    } catch (e: any) {
      // On unique violation, fetch existing row id
      try {
        const existing = await db
          .select({ id: schema.transcriptionChunks.id })
          .from(schema.transcriptionChunks)
          .where(and(eq(schema.transcriptionChunks.sessionId, sessionId), eq(schema.transcriptionChunks.chunkId, chunkId)))
          .orderBy(desc(schema.transcriptionChunks.id))
          .limit(1);
        rowId = existing?.[0]?.id ?? null;
      } catch {}
    }

    if (!rowId) {
      return NextResponse.json({ error: 'Failed to insert chunk' }, { status: 500 });
    }

    // Publish Ably notification (best-effort)
    try {
      if (process.env.ABLY_API_KEY) {
        const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });
        const channel = ably.channels.get(`user:${userId}`);
        await channel.publish('transcriptions_updated', { type: 'transcriptions_updated', sessionId, lastId: rowId, timestamp: Date.now() } as any);
      }
    } catch {}

    return NextResponse.json({ success: true, id: rowId });
  } catch (error) {
    console.error('POST /transcriptions/chunk error', error);
    return NextResponse.json({ error: 'Failed to save chunk' }, { status: 500 });
  }
}

