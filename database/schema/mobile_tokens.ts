import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const mobileTokens = pgTable('mobile_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id),
  token: text('token').unique().notNull(),
  deviceId: text('device_id'), // To identify connected devices
  deviceName: text('device_name'), // User-friendly device name
  isActive: boolean('is_active').default(true).notNull(),
  isPermanent: boolean('is_permanent').default(true).notNull(),
  // expiresAt removed in Session v2. Use isPermanent + isActive.
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
