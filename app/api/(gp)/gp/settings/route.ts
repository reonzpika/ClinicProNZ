import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { userSettings } from '@/db/schema/user_settings';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

const DEFAULTS = { manualNoteDurationMinutes: 5, hourlyRate: 140 };

export async function PUT(req: Request) {
	try {
		const context = await extractRBACContext(req);
		if (!context.userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		const { manualNoteDurationMinutes, hourlyRate } = await req.json();
		const settings = { ...DEFAULTS } as any;
		if (typeof manualNoteDurationMinutes === 'number') settings.manualNoteDurationMinutes = manualNoteDurationMinutes;
		if (typeof hourlyRate === 'number') settings.hourlyRate = hourlyRate;

		await db
			.insert(userSettings)
			.values({ userId: context.userId, settings })
			.onConflictDoUpdate({ target: userSettings.userId, set: { settings, updatedAt: new Date() } });

		return NextResponse.json({ settings });
	} catch (error) {
		console.error('Error updating GP settings:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}