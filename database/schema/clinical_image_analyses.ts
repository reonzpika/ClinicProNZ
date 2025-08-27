import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { patientSessions } from './patient_sessions';
import { users } from './users';

export const clinicalImageAnalyses = pgTable('clinical_image_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  imageKey: text('image_key').notNull(), // S3 key reference (e.g., "clinical-images/user_123/image.jpg")
  userId: text('user_id').references(() => users.id).notNull(), // Who analyzed it
  sessionId: uuid('session_id').references(() => patientSessions.id), // Link to consultation if applicable
  prompt: text('prompt'), // Analysis prompt used
  result: text('result').notNull(), // AI analysis result
  modelUsed: text('model_used'), // e.g., "claude-3-5-sonnet-20241022"
  analyzedAt: timestamp('analyzed_at').notNull(), // When analysis was performed
  createdAt: timestamp('created_at').defaultNow().notNull(), // When record was created
  updatedAt: timestamp('updated_at').defaultNow().notNull(), // When record was last updated
});

export type ClinicalImageAnalysis = typeof clinicalImageAnalyses.$inferSelect;
export type NewClinicalImageAnalysis = typeof clinicalImageAnalyses.$inferInsert;
