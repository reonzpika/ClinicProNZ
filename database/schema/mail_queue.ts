import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const mailStatusEnum = pgEnum('mail_status', ['queued', 'sent', 'failed']);

export const mailQueue = pgTable('mail_queue', {
  id: text('id').primaryKey(),
  toEmail: text('to_email').notNull(),
  subject: text('subject').notNull(),
  htmlBody: text('html_body').notNull(),
  textBody: text('text_body').notNull(),
  status: mailStatusEnum('status').default('queued').notNull(),
  error: text('error'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
});
