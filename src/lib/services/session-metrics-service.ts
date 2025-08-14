import { db } from '@/db/client';
import { sessionMetrics } from '@/db/schema/session_metrics';

export type RecordSessionMetricsInput = {
	userId: string;
	sessionId?: string | null;
	aiModel: string;
	inputTokens?: number | null;
	outputTokens?: number | null;
	latencyMs?: number | null;
	retryCount?: number | null;
	regenCount?: number | null;
	clipboardCopies?: number | null;
	tokenCostUsd?: number | null;
	recordedAt?: Date | null;
};

export async function recordSessionMetrics(input: RecordSessionMetricsInput) {
	await db.insert(sessionMetrics).values({
		userId: input.userId,
		sessionId: input.sessionId || null as any,
		aiModel: input.aiModel,
		inputTokens: input.inputTokens ?? null as any,
		outputTokens: input.outputTokens ?? null as any,
		latencyMs: input.latencyMs ?? null as any,
		retryCount: input.retryCount ?? 0,
		regenCount: input.regenCount ?? 0,
		clipboardCopies: input.clipboardCopies ?? 0,
		tokenCostUsd: input.tokenCostUsd ?? null as any,
		recordedAt: input.recordedAt ?? new Date(),
	});
}