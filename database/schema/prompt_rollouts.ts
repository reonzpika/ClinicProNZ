import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { promptVersions } from './prompt_versions';
import { users } from './users';

// Scope: 'self' applies only to a specific admin (userId). 'global' applies to all users.
export const promptRollouts = pgTable('prompt_rollouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  versionId: uuid('version_id').references(() => promptVersions.id).notNull(),
  scope: text('scope').notNull(), // 'self' | 'global'
  userId: text('user_id'), // required for 'self', null for 'global'
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
