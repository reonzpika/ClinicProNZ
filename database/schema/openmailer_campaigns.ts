import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const openmailerCampaigns = pgTable(
  'openmailer_campaigns',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    subject: text('subject').notNull(),
    bodyHtml: text('body_html').notNull(),
    bodyText: text('body_text'),
    fromName: text('from_name').notNull().default('Dr. Ryo Eguchi'),
    fromEmail: text('from_email').notNull().default('ryo@clinicpro.co.nz'),
    replyTo: text('reply_to'),
    listName: text('list_name').notNull(),
    status: text('status').notNull().default('draft'), // draft, scheduled, sending, sent
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    totalRecipients: integer('total_recipients').default(0).notNull(),
    totalSent: integer('total_sent').default(0).notNull(),
    totalOpens: integer('total_opens').default(0).notNull(),
    totalClicks: integer('total_clicks').default(0).notNull(),
    totalBounces: integer('total_bounces').default(0).notNull(),
    totalUnsubscribes: integer('total_unsubscribes').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('openmailer_campaigns_list_name_idx').on(table.listName),
    index('openmailer_campaigns_status_idx').on(table.status),
  ]
);

export type OpenmailerCampaign = typeof openmailerCampaigns.$inferSelect;
export type NewOpenmailerCampaign = typeof openmailerCampaigns.$inferInsert;
