import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const recordingTokens = pgTable('recording_tokens', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  userId: text('user_id').notNull(),
  token: text('token').unique().notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
