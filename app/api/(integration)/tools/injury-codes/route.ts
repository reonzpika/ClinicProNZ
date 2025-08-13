import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { logLlmOutput } from '@/src/lib/acc-tools/logging';
import { queryTopK } from '@/src/lib/acc-tools/vector';
import { rerankAccCodes } from '@/src/lib/acc-tools/llm';

export async function POST(req: Request) {
	try {
		const { userId } = await auth();
		if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const body = await req.json();
		const { injuries, sessionId } = body as { injuries: string[]; sessionId?: string };
		if (!Array.isArray(injuries) || injuries.length === 0) {
			return NextResponse.json({ error: 'injuries[] required' }, { status: 400 });
		}

		const results = [] as any[];
		for (const injury of injuries) {
			const matches = await queryTopK('acc-codes', injury, 12);
			const candidates = matches.map(m => ({
				code: (m.metadata?.code as string) || '',
				description: (m.metadata?.description as string) || (m.metadata?.preferredTerm as string) || '',
			})).filter(c => c.code && c.description);
			const ranked = await rerankAccCodes({ injury, candidates, topK: 5 });
			results.push({ injury, ...ranked });
		}

		await logLlmOutput({
			sessionId: sessionId || 'unknown',
			userId,
			scope: 'injury',
			model: 'openai:gpt-4o-mini',
			inputMeta: { n: injuries.length },
			outputsJson: { results },
		});

		return NextResponse.json({ results });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
	}
}