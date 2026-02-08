import { index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { openmailerCampaigns } from './openmailer_campaigns';
import { openmailerSubscribers } from './openmailer_subscribers';

export const openmailerEmails = pgTable(
  'openmailer_emails',
  {
    id: text('id').primaryKey(),
    campaignId: text('campaign_id')
      .notNull()
      .references(() => openmailerCampaigns.id, { onDelete: 'cascade' }),
    subscriberId: text('subscriber_id')
      .notNull()
      .references(() => openmailerSubscribers.id, { onDelete: 'cascade' }),
    messageId: text('message_id'), // Resend message ID
    status: text('status').notNull().default('pending'), // pending, sent, failed, bounced
    openedAt: timestamp('opened_at', { withTimezone: true }),
    clickedAt: timestamp('clicked_at', { withTimezone: true }),
    bouncedAt: timestamp('bounced_at', { withTimezone: true }),
    unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('openmailer_emails_campaign_subscriber_idx').on(table.campaignId, table.subscriberId),
    index('openmailer_emails_campaign_id_idx').on(table.campaignId),
    index('openmailer_emails_subscriber_id_idx').on(table.subscriberId),
    index('openmailer_emails_message_id_idx').on(table.messageId),
  ]
);

export type OpenmailerEmail = typeof openmailerEmails.$inferSelect;
export type NewOpenmailerEmail = typeof openmailerEmails.$inferInsert;
