import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { marketingSpend } from '@/db/schema/marketing_spend';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

export async function GET(req: Request) {
	try {
		const context = await extractRBACContext(req);
		if (!context.userId || context.tier !== 'admin') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const url = new URL(req.url);
		const periodStart = url.searchParams.get('start');
		const periodEnd = url.searchParams.get('end');
		const start = periodStart || new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
		const end = periodEnd || new Date().toISOString().slice(0, 10);

		const spendRows = await db
			.select({ cents: sql`sum(${marketingSpend.amountNzdCents})`.as('cents') })
			.from(marketingSpend)
			.where(sql`${marketingSpend.periodStart} >= ${start} AND ${marketingSpend.periodEnd} <= ${end}`);
		const totalSpendCents = Number(spendRows?.[0]?.cents || 0);

		// Placeholder: new signups count to be sourced from Clerk/Stripe later
		const newGps = 1;
		const cac = newGps > 0 ? (totalSpendCents / 100) / newGps : null;

		return NextResponse.json({
			mrr: null,
			arr: null,
			grossMarginPct: null,
			cac,
			ltv: null,
		});
	} catch (error) {
		console.error('Error computing investor KPIs:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}