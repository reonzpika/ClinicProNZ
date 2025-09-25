import { getDb } from 'database/client';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { apiUsageCosts } from '@/database/schema/api_usage_costs';
import { users } from '@/database/schema/users';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';
import { checkTierFromSessionClaims } from '@/src/shared/utils/roles';

export async function GET(req: Request) {
  try {
    // Check admin access
    const context = await extractRBACContext(req);
    const isAdmin = checkTierFromSessionClaims(context.sessionClaims, 'admin');

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
    const response = userSummaries.map((user) => {
      const userProviderBreakdown = providerBreakdowns
        .filter(p => p.userId === user.userId)
        .reduce((acc, item) => {
          if (item.provider) {
            acc[item.provider as 'deepgram' | 'openai' | 'perplexity'] = Number(item.totalCost);
          }
          return acc;
        }, { deepgram: 0, openai: 0, perplexity: 0 });

      const userFunctionBreakdown = functionBreakdowns
        .filter(f => f.userId === user.userId)
        .reduce((acc, item) => {
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
