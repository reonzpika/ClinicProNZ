import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { marketingSpend } from '@/db/schema/marketing_spend';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

export async function GET(req: Request) {
	try {
		const context = await extractRBACContext(req);
		if (!context.userId || context.tier !== 'admin') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const rows = await db.select().from(marketingSpend).orderBy(marketingSpend.periodStart);
		return NextResponse.json({ entries: rows });
	} catch (error) {
		console.error('Error listing marketing spend:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const context = await extractRBACContext(req);
		if (!context.userId || context.tier !== 'admin') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const body = await req.json();
		const { periodStart, periodEnd, amountNzd, channel, notes } = body;
		if (!periodStart || !periodEnd || amountNzd == null || !channel) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const cents = Math.round(Number(amountNzd) * 100);
		const inserted = await db.insert(marketingSpend).values({
			periodStart,
			periodEnd,
			amountNzdCents: cents,
			channel,
			notes: notes || null,
		}).returning();

		return NextResponse.json({ entry: inserted[0] });
	} catch (error) {
		console.error('Error creating marketing spend:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}