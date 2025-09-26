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

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    const db = getDb();

    // Base query: per-session aggregation
    const baseQuery = db
      .select({
        sessionId: apiUsageCosts.sessionId,
        patientName: patientSessions.patientName,
        totalCost: sql<number>`COALESCE(SUM(CAST(${apiUsageCosts.costUsd} AS DECIMAL)), 0)`,
        requestCount: sql<number>`COUNT(*)`,
        createdAt: patientSessions.createdAt,
      })
      .from(apiUsageCosts)
      .leftJoin(patientSessions, eq(apiUsageCosts.sessionId, patientSessions.id))
      .groupBy(apiUsageCosts.sessionId, patientSessions.patientName, patientSessions.createdAt);

    // Apply optional user filter
    let sessionsAgg = [] as Array<any>;
    if (userId) {
      sessionsAgg = await baseQuery.where(eq(apiUsageCosts.userId, userId));
    } else {
      sessionsAgg = await baseQuery;
    }

    // Provider breakdown per session
    const providerAgg = await db
      .select({
        sessionId: apiUsageCosts.sessionId,
        provider: apiUsageCosts.apiProvider,
        totalCost: sql<number>`COALESCE(SUM(CAST(${apiUsageCosts.costUsd} AS DECIMAL)), 0)`,
      })
      .from(apiUsageCosts)
      .groupBy(apiUsageCosts.sessionId, apiUsageCosts.apiProvider);

    const functionAgg = await db
      .select({
        sessionId: apiUsageCosts.sessionId,
        func: apiUsageCosts.apiFunction,
        totalCost: sql<number>`COALESCE(SUM(CAST(${apiUsageCosts.costUsd} AS DECIMAL)), 0)`,
      })
      .from(apiUsageCosts)
      .groupBy(apiUsageCosts.sessionId, apiUsageCosts.apiFunction);

    const response = sessionsAgg
      .filter((s: any) => !!s.sessionId)
      .map((s: any) => {
        const byProvider = { deepgram: 0, openai: 0, perplexity: 0 } as Record<'deepgram'|'openai'|'perplexity', number>;
        providerAgg
          .filter((p: any) => p.sessionId === s.sessionId && p.provider)
          .forEach((p: any) => {
            byProvider[p.provider as 'deepgram'|'openai'|'perplexity'] = Number(p.totalCost);
          });

        const byFunction = { transcription: 0, note_generation: 0, chat: 0 } as Record<'transcription'|'note_generation'|'chat', number>;
        functionAgg
          .filter((f: any) => f.sessionId === s.sessionId && f.func)
          .forEach((f: any) => {
            byFunction[f.func as 'transcription'|'note_generation'|'chat'] = Number(f.totalCost);
          });

        return {
          sessionId: s.sessionId as string,
          patientName: s.patientName || 'Session',
          totalCost: Number(s.totalCost),
          requestCount: Number(s.requestCount),
          createdAt: s.createdAt?.toISOString?.() || new Date().toISOString(),
          byProvider,
          byFunction,
        };
      });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching session cost details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

