import { getDb } from 'database/client';
import { and, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { apiUsageCosts } from '@/db/schema/api_usage_costs';
import { patientSessions } from '@/db/schema/patient_sessions';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

export async function GET(req: Request) {
  try {
    const context = await extractRBACContext(req);
    const isAdmin = context.tier === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const filterUserId = searchParams.get('userId') || undefined;

    const db = getDb();

    // Aggregate costs by session
    const rows = await db
      .select({
        sessionId: apiUsageCosts.sessionId,
        userId: apiUsageCosts.userId,
        patientName: patientSessions.patientName,
        createdAt: patientSessions.createdAt,
        requestCount: sql<number>`COUNT(*)`,
        totalCost: sql<number>`COALESCE(SUM(CAST(${apiUsageCosts.costUsd} AS DECIMAL)), 0)`,
        deepgram: sql<number>`COALESCE(SUM(CASE WHEN ${apiUsageCosts.apiProvider} = 'deepgram' THEN CAST(${apiUsageCosts.costUsd} AS DECIMAL) ELSE 0 END), 0)`,
        openai: sql<number>`COALESCE(SUM(CASE WHEN ${apiUsageCosts.apiProvider} = 'openai' THEN CAST(${apiUsageCosts.costUsd} AS DECIMAL) ELSE 0 END), 0)`,
        perplexity: sql<number>`COALESCE(SUM(CASE WHEN ${apiUsageCosts.apiProvider} = 'perplexity' THEN CAST(${apiUsageCosts.costUsd} AS DECIMAL) ELSE 0 END), 0)`,
        transcription: sql<number>`COALESCE(SUM(CASE WHEN ${apiUsageCosts.apiFunction} = 'transcription' THEN CAST(${apiUsageCosts.costUsd} AS DECIMAL) ELSE 0 END), 0)`,
        note_generation: sql<number>`COALESCE(SUM(CASE WHEN ${apiUsageCosts.apiFunction} = 'note_generation' THEN CAST(${apiUsageCosts.costUsd} AS DECIMAL) ELSE 0 END), 0)`,
        chat: sql<number>`COALESCE(SUM(CASE WHEN ${apiUsageCosts.apiFunction} = 'chat' THEN CAST(${apiUsageCosts.costUsd} AS DECIMAL) ELSE 0 END), 0)`,
      })
      .from(apiUsageCosts)
      .leftJoin(patientSessions, eq(apiUsageCosts.sessionId, patientSessions.id))
      .where(filterUserId ? eq(apiUsageCosts.userId, filterUserId) : undefined as any)
      .groupBy(apiUsageCosts.sessionId, apiUsageCosts.userId, patientSessions.patientName, patientSessions.createdAt)
      .orderBy(sql`MAX(${patientSessions.createdAt}) DESC`);

    const result = rows
      .filter(r => r.sessionId)
      .map((r: any) => ({
        sessionId: r.sessionId,
        patientName: r.patientName || 'Unknown',
        totalCost: Number(r.totalCost) || 0,
        requestCount: Number(r.requestCount) || 0,
        createdAt: r.createdAt?.toISOString?.() || new Date(r.createdAt as any).toISOString(),
        byProvider: {
          deepgram: Number(r.deepgram) || 0,
          openai: Number(r.openai) || 0,
          perplexity: Number(r.perplexity) || 0,
        },
        byFunction: {
          transcription: Number(r.transcription) || 0,
          note_generation: Number(r.note_generation) || 0,
          chat: Number(r.chat) || 0,
        },
      }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching session cost details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
