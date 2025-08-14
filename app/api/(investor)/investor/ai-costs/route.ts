import { NextResponse } from 'next/server';
import { sql as dsql } from 'drizzle-orm';

import { db } from '@/db/client';
import { sessionMetrics } from '@/db/schema/session_metrics';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

export async function GET(req: Request) {
	try {
		const context = await extractRBACContext(req);
		if (!context.userId || context.tier !== 'admin') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const url = new URL(req.url);
		const days = Number(url.searchParams.get('days') || '30');

		// Aggregate by date (UTC)
		const rows = await db
			.select({
				day: dsql`date_trunc('day', ${sessionMetrics.recordedAt})`.as('day'),
				sessions: dsql`count(*)`.as('sessions'),
				inputTokens: dsql`sum(${sessionMetrics.inputTokens})`.as('input_tokens'),
				outputTokens: dsql`sum(${sessionMetrics.outputTokens})`.as('output_tokens'),
				costUsd: dsql`sum(${sessionMetrics.tokenCostUsd})`.as('cost_usd'),
			})
			.from(sessionMetrics)
			.where(dsql`${sessionMetrics.recordedAt} >= now() - interval '${days} days'`)
			.groupBy(dsql`1`)
			.orderBy(dsql`1`);

		return NextResponse.json({ series: rows });
	} catch (error) {
		console.error('Error listing AI costs:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}