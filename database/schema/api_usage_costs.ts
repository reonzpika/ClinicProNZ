import { decimal, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { patientSessions } from './patient_sessions';
import { users } from './users';

export const apiUsageCosts = pgTable('api_usage_costs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id),
  sessionId: uuid('session_id').references(() => patientSessions.id),
  apiProvider: text('api_provider', {
    enum: ['deepgram', 'openai', 'perplexity'],
  }).notNull(),
  apiFunction: text('api_function', {
    enum: ['transcription', 'note_generation', 'chat'],
  }).notNull(),
  usageMetrics: jsonb('usage_metrics').notNull(), // {duration: 120, inputTokens: 500, outputTokens: 200, requests: 1}
  costUsd: decimal('cost_usd', { precision: 10, scale: 6 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ApiUsageCost = typeof apiUsageCosts.$inferSelect;
export type NewApiUsageCost = typeof apiUsageCosts.$inferInsert;
