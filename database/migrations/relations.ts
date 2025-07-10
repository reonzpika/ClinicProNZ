import { relations } from 'drizzle-orm/relations';

import { features, mobileTokens, patientSessions, templates, users, userSettings, votes } from './schema';

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  userSettings: many(userSettings),
  templates: many(templates),
  mobileTokens: many(mobileTokens),
  patientSessions: many(patientSessions),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  feature: one(features, {
    fields: [votes.featureId],
    references: [features.id],
  }),
}));

export const featuresRelations = relations(features, ({ many }) => ({
  votes: many(votes),
}));

export const templatesRelations = relations(templates, ({ one }) => ({
  user: one(users, {
    fields: [templates.ownerId],
    references: [users.id],
  }),
}));

export const mobileTokensRelations = relations(mobileTokens, ({ one }) => ({
  user: one(users, {
    fields: [mobileTokens.userId],
    references: [users.id],
  }),
}));

export const patientSessionsRelations = relations(patientSessions, ({ one }) => ({
  user: one(users, {
    fields: [patientSessions.userId],
    references: [users.id],
  }),
}));
