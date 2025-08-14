import { integer, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { patientSessions } from './patient_sessions';
import { users } from './users';

export const sessionMetrics = pgTable('session_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => patientSessions.id),
  userId: text('user_id').references(() => users.id),
  aiModel: text('ai_model'),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  latencyMs: integer('latency_ms'),
  retryCount: integer('retry_count').default(0).notNull(),
  regenCount: integer('regen_count').default(0).notNull(),
  clipboardCopies: integer('clipboard_copies').default(0).notNull(),
  tokenCostUsd: numeric('token_cost_usd'),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});