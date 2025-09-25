import { getDb } from 'database/client';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { apiUsageCosts } from '@/db/schema/api_usage_costs';
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

    // Get overall summary
    const summaryResult = await db
      .select({
        totalCost: sql<number>`COALESCE(SUM(CAST(${apiUsageCosts.costUsd} AS DECIMAL)), 0)`,
        totalUsers: sql<number>`COUNT(DISTINCT ${apiUsageCosts.userId})`,
        totalSessions: sql<number>`COUNT(DISTINCT ${apiUsageCosts.sessionId})`,
        totalRequests: sql<number>`COUNT(*)`,
      })
      .from(apiUsageCosts);

    // Get cost breakdown by provider
    const providerBreakdown = await db
      .select({
        provider: apiUsageCosts.apiProvider,
        totalCost: sql<number>`COALESCE(SUM(CAST(${apiUsageCosts.costUsd} AS DECIMAL)), 0)`,
      })
      .from(apiUsageCosts)
      .groupBy(apiUsageCosts.apiProvider);

    // Get cost breakdown by function
    const functionBreakdown = await db
      .select({
        function: apiUsageCosts.apiFunction,
        totalCost: sql<number>`COALESCE(SUM(CAST(${apiUsageCosts.costUsd} AS DECIMAL)), 0)`,
      })
      .from(apiUsageCosts)
      .groupBy(apiUsageCosts.apiFunction);

    const summary = summaryResult[0] || {
      totalCost: 0,
      totalUsers: 0,
      totalSessions: 0,
      totalRequests: 0,
    };

    // Format response
    const response = {
      totalCost: Number(summary.totalCost),
      totalUsers: Number(summary.totalUsers),
      totalSessions: Number(summary.totalSessions),
      totalRequests: Number(summary.totalRequests),
      byProvider: {
        deepgram: 0,
        openai: 0,
        perplexity: 0,
      },
      byFunction: {
        transcription: 0,
        note_generation: 0,
        chat: 0,
      },
    };

    // Populate provider breakdown
    providerBreakdown.forEach((item: { provider: string | null; totalCost: unknown }) => {
      if (item.provider && item.provider in response.byProvider) {
        response.byProvider[item.provider as keyof typeof response.byProvider] = Number(item.totalCost);
      }
    });

    // Populate function breakdown
    functionBreakdown.forEach((item: { function: string | null; totalCost: unknown }) => {
      if (item.function && item.function in response.byFunction) {
        response.byFunction[item.function as keyof typeof response.byFunction] = Number(item.totalCost);
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching cost summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
