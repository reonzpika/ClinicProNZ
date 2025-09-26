import { getDb } from 'database/client';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { apiUsageCosts } from '@/db/schema/api_usage_costs';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

export async function GET(req: Request) {
  try {
    const context = await extractRBACContext(req);
    const isAdmin = context.tier === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const db = getDb();

    const totals = await db
      .select({
        totalCost: sql<number>`COALESCE(SUM(CAST(${apiUsageCosts.costUsd} AS DECIMAL)), 0)`,
        totalUsers: sql<number>`COUNT(DISTINCT ${apiUsageCosts.userId})`,
        totalSessions: sql<number>`COUNT(DISTINCT ${apiUsageCosts.sessionId})`,
        totalRequests: sql<number>`COUNT(*)`,
      })
      .from(apiUsageCosts);

    const byProviderRows = await db
      .select({
        provider: apiUsageCosts.apiProvider,
        totalCost: sql<number>`COALESCE(SUM(CAST(${apiUsageCosts.costUsd} AS DECIMAL)), 0)`,
      })
      .from(apiUsageCosts)
      .groupBy(apiUsageCosts.apiProvider);

    const byFunctionRows = await db
      .select({
        func: apiUsageCosts.apiFunction,
        totalCost: sql<number>`COALESCE(SUM(CAST(${apiUsageCosts.costUsd} AS DECIMAL)), 0)`,
      })
      .from(apiUsageCosts)
      .groupBy(apiUsageCosts.apiFunction);

    const byProvider = { deepgram: 0, openai: 0, perplexity: 0 } as Record<'deepgram'|'openai'|'perplexity', number>;
    byProviderRows.forEach((row: any) => {
      if (row.provider) byProvider[row.provider as 'deepgram'|'openai'|'perplexity'] = Number(row.totalCost);
    });

    const byFunction = { transcription: 0, note_generation: 0, chat: 0 } as Record<'transcription'|'note_generation'|'chat', number>;
    byFunctionRows.forEach((row: any) => {
      if (row.func) byFunction[row.func as 'transcription'|'note_generation'|'chat'] = Number(row.totalCost);
    });

    const total = totals[0] ?? {
      totalCost: 0,
      totalUsers: 0,
      totalSessions: 0,
      totalRequests: 0,
    } as { totalCost: number; totalUsers: number; totalSessions: number; totalRequests: number };
    return NextResponse.json({
      totalCost: Number(total.totalCost) || 0,
      totalUsers: Number(total.totalUsers) || 0,
      totalSessions: Number(total.totalSessions) || 0,
      totalRequests: Number(total.totalRequests) || 0,
      byProvider,
      byFunction,
    });
  } catch (error) {
    console.error('Error fetching cost summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

