import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { openmailerEmails } from './openmailer_emails';
import { openmailerLinks } from './openmailer_links';

export const openmailerClicks = pgTable(
  'openmailer_clicks',
  {
    id: text('id').primaryKey(),
    emailId: text('email_id')
      .notNull()
      .references(() => openmailerEmails.id, { onDelete: 'cascade' }),
    linkId: text('link_id')
      .notNull()
      .references(() => openmailerLinks.id, { onDelete: 'cascade' }),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    clickedAt: timestamp('clicked_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('openmailer_clicks_email_id_idx').on(table.emailId),
    index('openmailer_clicks_link_id_idx').on(table.linkId),
    index('openmailer_clicks_clicked_at_idx').on(table.clickedAt),
  ]
);

export type OpenmailerClick = typeof openmailerClicks.$inferSelect;
export type NewOpenmailerClick = typeof openmailerClicks.$inferInsert;
