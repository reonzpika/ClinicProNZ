import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { churnOverrides } from '@/db/schema/churn_overrides';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

export async function GET(req: Request) {
	try {
		const context = await extractRBACContext(req);
		if (!context.userId || context.tier !== 'admin') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const rows = await db.select().from(churnOverrides).orderBy(churnOverrides.effectiveDate);
		return NextResponse.json({ overrides: rows });
	} catch (error) {
		console.error('Error listing churn overrides:', error);
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
		const { userId, stripeCustomerId, status, reason, effectiveDate, source } = body;
		if (!status || !effectiveDate) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const inserted = await db.insert(churnOverrides).values({
			userId: userId || null,
			stripeCustomerId: stripeCustomerId || null,
			status,
			reason: reason || null,
			effectiveDate,
			source: source || 'manual',
		}).returning();

		return NextResponse.json({ override: inserted[0] });
	} catch (error) {
		console.error('Error creating churn override:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}