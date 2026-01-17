import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

// Metadata for uploads used by the standalone Photo Tool.
// Images are stored in S3 with a 24-hour lifecycle; we mirror expiry here for efficient listing.
export const imageToolUploads = pgTable('image_tool_uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  imageId: text('image_id').notNull(), // client-generated id (nanoid)
  s3Key: text('s3_key').notNull(),
  fileSize: integer('file_size'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
}, (table) => {
  return {
    userCreatedIdx: index('image_tool_uploads_user_created_idx').on(table.userId, table.createdAt),
    expiresIdx: index('image_tool_uploads_expires_idx').on(table.expiresAt),
  };
});

export type ImageToolUpload = typeof imageToolUploads.$inferSelect;
export type NewImageToolUpload = typeof imageToolUploads.$inferInsert;

