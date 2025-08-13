import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const llmAuditLogs = pgTable('llm_audit_logs', {
	id: uuid('id').primaryKey().defaultRandom(),
	sessionId: text('session_id').notNull(),
	userId: text('user_id').notNull(),
	scope: text('scope').notNull(), // injury | job | employer | summary
	model: text('model').notNull(),
	inputMeta: jsonb('input_meta'), // redacted metadata only
	outputsJson: jsonb('outputs_json').notNull(),
	editsJson: jsonb('edits_json'),
	createdAt: timestamp('created_at').defaultNow(),
});

export type LlmAuditLog = typeof llmAuditLogs.$inferSelect;
export type NewLlmAuditLog = typeof llmAuditLogs.$inferInsert;