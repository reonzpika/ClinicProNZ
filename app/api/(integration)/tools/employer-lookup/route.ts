import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { logLlmOutput } from '@/src/lib/acc-tools/logging';
import { searchNzbnByName } from '@/src/lib/acc-tools/nzbn';

export async function POST(req: Request) {
	try {
		const { userId } = await auth();
		if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const body = await req.json();
		const { employerName, sessionId } = body as { employerName: string; sessionId?: string };
		if (!employerName || typeof employerName !== 'string') return NextResponse.json({ error: 'employerName required' }, { status: 400 });

		const results = await searchNzbnByName(employerName);

		await logLlmOutput({
			sessionId: sessionId || 'unknown',
			userId,
			scope: 'employer',
			model: 'api:nzbn',
			inputMeta: { employerNameLength: employerName.length },
			outputsJson: { results },
		});

		return NextResponse.json({ results });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
	}
}