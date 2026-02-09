import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { openmailerCampaigns } from './openmailer_campaigns';

export const openmailerLinks = pgTable(
  'openmailer_links',
  {
    id: text('id').primaryKey(),
    campaignId: text('campaign_id')
      .notNull()
      .references(() => openmailerCampaigns.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    shortCode: text('short_code').notNull().unique(),
    clickCount: integer('click_count').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('openmailer_links_campaign_id_idx').on(table.campaignId),
    index('openmailer_links_short_code_idx').on(table.shortCode),
  ],
);

export type OpenmailerLink = typeof openmailerLinks.$inferSelect;
export type NewOpenmailerLink = typeof openmailerLinks.$inferInsert;
