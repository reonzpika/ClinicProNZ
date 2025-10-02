import { auth } from '@clerk/nextjs/server';
import { and, asc, desc, eq, gt } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getDb, schema } from 'database/client';

// GET /api/transcriptions?sessionId=...&afterId=...
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    const afterIdParam = url.searchParams.get('afterId');
    const limitParam = url.searchParams.get('limit');
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }
    const afterId = afterIdParam ? Number(afterIdParam) : 0;
    const limit = limitParam ? Math.max(1, Math.min(2000, Number(limitParam))) : 2000;

    const db = getDb();

    // Authorize session ownership
    const sessionRows = await db
      .select({ id: schema.patientSessions.id })
      .from(schema.patientSessions)
      .where(and(eq(schema.patientSessions.id, sessionId), eq(schema.patientSessions.userId, userId)))
      .limit(1);
    if (!sessionRows || sessionRows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Fetch chunks afterId (or all if 0)
    const where = afterId > 0
      ? and(eq(schema.transcriptionChunks.sessionId, sessionId), gt(schema.transcriptionChunks.id, afterId))
      : eq(schema.transcriptionChunks.sessionId, sessionId);

    const rows = await db
      .select({
        id: schema.transcriptionChunks.id,
        chunkId: schema.transcriptionChunks.chunkId,
        text: schema.transcriptionChunks.text,
        source: schema.transcriptionChunks.source,
        deviceId: schema.transcriptionChunks.deviceId,
        createdAt: schema.transcriptionChunks.createdAt,
      })
      .from(schema.transcriptionChunks)
      .where(where)
      .orderBy(asc(schema.transcriptionChunks.id))
      .limit(limit);

    return NextResponse.json({ chunks: rows });
  } catch (error) {
    console.error('GET /transcriptions error', error);
    return NextResponse.json({ error: 'Failed to fetch transcriptions' }, { status: 500 });
  }
}

