import { getDb } from 'database/client';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { apiUsageCosts } from '@/db/schema/api_usage_costs';
import { users } from '@/db/schema/users';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

export async function GET(req: Request) {
  try {
    const context = await extractRBACContext(req);
    const isAdmin = context.tier === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const db = getDb();

    const userSummaries = await db
      .select({
        userId: apiUsageCosts.userId,
        email: users.email,
        totalCost: sql<number>`COALESCE(SUM(CAST(${apiUsageCosts.costUsd} AS DECIMAL)), 0)`,
        sessionCount: sql<number>`COUNT(DISTINCT ${apiUsageCosts.sessionId})`,
        requestCount: sql<number>`COUNT(*)`,
      })
      .from(apiUsageCosts)
      .leftJoin(users, sql`${apiUsageCosts.userId} = ${users.id}`)
      .groupBy(apiUsageCosts.userId, users.email);

    const providerBreakdowns = await db
      .select({
        userId: apiUsageCosts.userId,
        provider: apiUsageCosts.apiProvider,
        totalCost: sql<number>`COALESCE(SUM(CAST(${apiUsageCosts.costUsd} AS DECIMAL)), 0)`,
      })
      .from(apiUsageCosts)
      .groupBy(apiUsageCosts.userId, apiUsageCosts.apiProvider);

    const functionBreakdowns = await db
      .select({
        userId: apiUsageCosts.userId,
        func: apiUsageCosts.apiFunction,
        totalCost: sql<number>`COALESCE(SUM(CAST(${apiUsageCosts.costUsd} AS DECIMAL)), 0)`,
      })
      .from(apiUsageCosts)
      .groupBy(apiUsageCosts.userId, apiUsageCosts.apiFunction);

    const response = userSummaries.map((user: any) => {
      const byProvider = { deepgram: 0, openai: 0, perplexity: 0 } as Record<'deepgram'|'openai'|'perplexity', number>;
      providerBreakdowns
        .filter((p: any) => p.userId === user.userId && p.provider)
        .forEach((p: any) => {
          byProvider[p.provider as 'deepgram'|'openai'|'perplexity'] = Number(p.totalCost);
        });

      const byFunction = { transcription: 0, note_generation: 0, chat: 0 } as Record<'transcription'|'note_generation'|'chat', number>;
      functionBreakdowns
        .filter((f: any) => f.userId === user.userId && f.func)
        .forEach((f: any) => {
          byFunction[f.func as 'transcription'|'note_generation'|'chat'] = Number(f.totalCost);
        });

      return {
        userId: user.userId,
        email: user.email || '',
        totalCost: Number(user.totalCost),
        sessionCount: Number(user.sessionCount),
        requestCount: Number(user.requestCount),
        byProvider,
        byFunction,
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user cost summaries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

