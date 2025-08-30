import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { patientSessions } from './patient_sessions';
import { users } from './users';

export const clinicalImageAnalyses = pgTable('clinical_image_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  imageKey: text('image_key').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').references(() => patientSessions.id, { onDelete: 'cascade' }),
  prompt: text('prompt'),
  result: text('result').notNull(),
  modelUsed: text('model_used'),
  analyzedAt: timestamp('analyzed_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type ClinicalImageAnalysis = typeof clinicalImageAnalyses.$inferSelect;
export type NewClinicalImageAnalysis = typeof clinicalImageAnalyses.$inferInsert;
