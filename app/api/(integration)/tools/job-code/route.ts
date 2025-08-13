import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { logLlmOutput } from '@/src/lib/acc-tools/logging';
import { queryTopK } from '@/src/lib/acc-tools/vector';
import { rerankAnzsco } from '@/src/lib/acc-tools/llm';

export async function POST(req: Request) {
	try {
		const { userId } = await auth();
		if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		const body = await req.json();
		const { job, sessionId } = body as { job: string; sessionId?: string };
		if (!job || typeof job !== 'string') return NextResponse.json({ error: 'job required' }, { status: 400 });

		const matches = await queryTopK('anzsco', job, 12);
		const candidates = matches.map(m => ({
			code: (m.metadata?.code as string) || '',
			title: (m.metadata?.title as string) || '',
			description: (m.metadata?.description as string) || '',
		})).filter(c => c.code && c.title);
		const ranked = await rerankAnzsco({ job, candidates, topK: 3 });

		await logLlmOutput({
			sessionId: sessionId || 'unknown',
			userId,
			scope: 'job',
			model: 'openai:gpt-4o-mini',
			inputMeta: { jobLength: job.length },
			outputsJson: ranked,
		});

		return NextResponse.json(ranked);
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
	}
}