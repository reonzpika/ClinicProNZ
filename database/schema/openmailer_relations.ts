import { relations } from 'drizzle-orm/relations';
import { openmailerCampaigns } from './openmailer_campaigns';
import { openmailerClicks } from './openmailer_clicks';
import { openmailerEmails } from './openmailer_emails';
import { openmailerLinks } from './openmailer_links';
import { openmailerSubscribers } from './openmailer_subscribers';

export const openmailerSubscribersRelations = relations(openmailerSubscribers, ({ many }) => ({
  emails: many(openmailerEmails),
}));

export const openmailerCampaignsRelations = relations(openmailerCampaigns, ({ many }) => ({
  emails: many(openmailerEmails),
  links: many(openmailerLinks),
}));

export const openmailerEmailsRelations = relations(openmailerEmails, ({ one, many }) => ({
  campaign: one(openmailerCampaigns, {
    fields: [openmailerEmails.campaignId],
    references: [openmailerCampaigns.id],
  }),
  subscriber: one(openmailerSubscribers, {
    fields: [openmailerEmails.subscriberId],
    references: [openmailerSubscribers.id],
  }),
  clicks: many(openmailerClicks),
}));

export const openmailerLinksRelations = relations(openmailerLinks, ({ one, many }) => ({
  campaign: one(openmailerCampaigns, {
    fields: [openmailerLinks.campaignId],
    references: [openmailerCampaigns.id],
  }),
  clicks: many(openmailerClicks),
}));

export const openmailerClicksRelations = relations(openmailerClicks, ({ one }) => ({
  email: one(openmailerEmails, {
    fields: [openmailerClicks.emailId],
    references: [openmailerEmails.id],
  }),
  link: one(openmailerLinks, {
    fields: [openmailerClicks.linkId],
    references: [openmailerLinks.id],
  }),
}));
