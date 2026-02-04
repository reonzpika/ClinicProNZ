import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { patientSessions } from './patient_sessions';
import { users } from './users';

export const aiSuggestions = pgTable('ai_suggestions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id),
  sessionId: uuid('session_id').references(() => patientSessions.id),
  reviewType: text('review_type').notNull(), // 'red_flags', 'ddx', 'investigations', 'management'
  noteContent: text('note_content').notNull(),
  aiResponse: text('ai_response').notNull(),
  userFeedback: text('user_feedback'), // 'helpful', 'not_helpful', null
  responseTimeMs: integer('response_time_ms').notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type NewAiSuggestion = typeof aiSuggestions.$inferInsert;
