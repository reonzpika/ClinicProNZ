// Add this to your database/migrations/schema.ts file

export const aiSuggestions = pgTable('ai_suggestions', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: text('user_id').notNull(),
  sessionId: uuid('session_id'),
  reviewType: text('review_type').notNull(), // 'red_flags', 'ddx', 'investigations', 'management'
  noteContent: text('note_content').notNull(),
  aiResponse: text('ai_response').notNull(),
  userFeedback: text('user_feedback'), // 'helpful', 'not_helpful', null
  responseTimeMs: integer('response_time_ms').notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
}, table => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'ai_suggestions_user_id_users_id_fk',
  }),
  foreignKey({
    columns: [table.sessionId],
    foreignColumns: [patientSessions.id],
    name: 'ai_suggestions_session_id_patient_sessions_id_fk',
  }),
]);

// After adding this, run:
// pnpm db:generate
// pnpm db:push
