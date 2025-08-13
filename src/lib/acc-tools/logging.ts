import { db } from '../../../database/client';
import { llmAuditLogs } from '../../../database/schema/llm_audit';

export async function logLlmOutput(params: {
	sessionId: string;
	userId: string;
	scope: 'injury' | 'job' | 'employer' | 'summary';
	model: string;
	inputMeta?: Record<string, any>;
	outputsJson: any;
}): Promise<void> {
	await db.insert(llmAuditLogs).values({
		sessionId: params.sessionId,
		userId: params.userId,
		scope: params.scope,
		model: params.model,
		inputMeta: params.inputMeta || null,
		outputsJson: params.outputsJson,
	});
}

export async function logUserEdits(params: {
	id: string; // audit log id to update
	editsJson: any;
}): Promise<void> {
	await db.update(llmAuditLogs)
		.set({ editsJson: params.editsJson })
		.where(llmAuditLogs.id.eq(params.id as any));
}