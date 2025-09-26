import * as Ably from 'ably';
import { getDb } from 'database/client';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { apiUsageCosts, patientSessions, type NewApiUsageCost } from '@/db/schema';
import { calculateDeepgramCost } from '@/src/features/admin/cost-tracking/services/costCalculator';
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

    // When recording stops, aggregate Deepgram cost once per session
    if (isRecording === false) {
      try {
        const sessionRows = await db
          .select({ transcriptions: patientSessions.transcriptions })
          .from(patientSessions)
          .where(and(eq(patientSessions.id, sessionId), eq(patientSessions.userId, context.userId)))
          .limit(1);

        const transcriptionsRaw = sessionRows?.[0]?.transcriptions || '[]';
        let transcriptions: Array<any> = [];
        try {
          transcriptions = JSON.parse(transcriptionsRaw || '[]');
          if (!Array.isArray(transcriptions)) {
            transcriptions = [];
          }
        } catch {
          transcriptions = [];
        }

        const totalDurationSec = transcriptions.reduce((sum: number, entry: any) => {
          const d = Number(entry?.durationSec || 0);
          return sum + (Number.isFinite(d) ? d : 0);
        }, 0);
        const totalMinutes = totalDurationSec / 60;

        // Compute cost and upsert a single Deepgram record for this session
        const metrics = { duration: totalMinutes } as const;
        const breakdown = calculateDeepgramCost(metrics as any);

        // Remove prior deepgram transcription cost rows for this session (idempotent aggregate)
        try {
          await db.delete(apiUsageCosts).where(
            and(
              eq(apiUsageCosts.sessionId, sessionId),
              eq(apiUsageCosts.apiProvider, 'deepgram'),
              eq(apiUsageCosts.apiFunction, 'transcription'),
            ),
          );
        } catch {}

        const record: NewApiUsageCost = {
          userId: context.userId,
          sessionId,
          apiProvider: 'deepgram',
          apiFunction: 'transcription',
          usageMetrics: { duration: totalMinutes },
          costUsd: breakdown.costUsd.toString(),
        } as any;

        await db.insert(apiUsageCosts).values(record);
      } catch (err) {
        try {
          console.warn('[Recording] Failed to aggregate Deepgram cost:', err);
        } catch {}
      }
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
