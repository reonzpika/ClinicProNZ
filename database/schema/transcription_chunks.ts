import { bigserial, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { patientSessions } from './patient_sessions';
import { users } from './users';

export const transcriptionChunks = pgTable('transcription_chunks', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  sessionId: uuid('session_id').references(() => patientSessions.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  chunkId: uuid('chunk_id').notNull(),
  text: text('text').notNull(),
  source: text('source').notNull().default('desktop'),
  deviceId: text('device_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

