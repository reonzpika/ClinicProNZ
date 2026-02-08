import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const openmailerSubscribers = pgTable(
  'openmailer_subscribers',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name'),
    listName: text('list_name').notNull().default('general'),
    status: text('status').notNull().default('active'), // active, unsubscribed, bounced
    source: text('source'), // manual, clinicpro, import
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    subscribedAt: timestamp('subscribed_at', { withTimezone: true }).defaultNow().notNull(),
    unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('openmailer_subscribers_email_idx').on(table.email),
    index('openmailer_subscribers_list_name_idx').on(table.listName),
    index('openmailer_subscribers_status_idx').on(table.status),
  ]
);

export type OpenmailerSubscriber = typeof openmailerSubscribers.$inferSelect;
export type NewOpenmailerSubscriber = typeof openmailerSubscribers.$inferInsert;
