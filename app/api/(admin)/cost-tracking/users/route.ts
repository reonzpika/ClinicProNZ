import { getDb } from 'database/client';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { apiUsageCosts } from '@/db/schema/api_usage_costs';
import { users } from '@/db/schema/users';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

export async function GET(req: Request) {
  try {
    // Check admin access
    const context = await extractRBACContext(req);
    const isAdmin = context.tier === 'admin';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const db = getDb();

    // Get user cost summaries
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

    // Get provider breakdown for each user
    const providerBreakdowns = await db
      .select({
        userId: apiUsageCosts.userId,
        provider: apiUsageCosts.apiProvider,
        totalCost: sql<number>`COALESCE(SUM(CAST(${apiUsageCosts.costUsd} AS DECIMAL)), 0)`,
      })
      .from(apiUsageCosts)
      .groupBy(apiUsageCosts.userId, apiUsageCosts.apiProvider);

    // Get function breakdown for each user
    const functionBreakdowns = await db
      .select({
        userId: apiUsageCosts.userId,
        function: apiUsageCosts.apiFunction,
        totalCost: sql<number>`COALESCE(SUM(CAST(${apiUsageCosts.costUsd} AS DECIMAL)), 0)`,
      })
      .from(apiUsageCosts)
      .groupBy(apiUsageCosts.userId, apiUsageCosts.apiFunction);

    // Format response
    const response = userSummaries.map((user: { userId: string | null; email: string | null; totalCost: unknown; sessionCount: unknown; requestCount: unknown }) => {
      const userProviderBreakdown = providerBreakdowns
        .filter((p: { userId: string | null }) => p.userId === user.userId)
        .reduce((acc: { deepgram: number; openai: number; perplexity: number }, item: { provider: string | null; totalCost: unknown }) => {
          if (item.provider) {
            acc[item.provider as 'deepgram' | 'openai' | 'perplexity'] = Number(item.totalCost);
          }
          return acc;
        }, { deepgram: 0, openai: 0, perplexity: 0 });

      const userFunctionBreakdown = functionBreakdowns
        .filter((f: { userId: string | null }) => f.userId === user.userId)
        .reduce((acc: { transcription: number; note_generation: number; chat: number }, item: { function: string | null; totalCost: unknown }) => {
          if (item.function) {
            acc[item.function as 'transcription' | 'note_generation' | 'chat'] = Number(item.totalCost);
          }
          return acc;
        }, { transcription: 0, note_generation: 0, chat: 0 });

      return {
        userId: user.userId,
        email: user.email || '',
        totalCost: Number(user.totalCost),
        sessionCount: Number(user.sessionCount),
        requestCount: Number(user.requestCount),
        byProvider: userProviderBreakdown,
        byFunction: userFunctionBreakdown,
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user cost summaries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
