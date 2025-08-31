import { relations } from 'drizzle-orm/relations';

import { clinicalImageAnalyses, features, mobileTokens, patientSessions, templates, users, userSettings, votes } from './schema';

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  userSettings: many(userSettings),
  templates: many(templates),
  clinicalImageAnalyses: many(clinicalImageAnalyses),
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

export const clinicalImageAnalysesRelations = relations(clinicalImageAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [clinicalImageAnalyses.userId],
    references: [users.id],
  }),
  patientSession: one(patientSessions, {
    fields: [clinicalImageAnalyses.sessionId],
    references: [patientSessions.id],
  }),
}));

export const patientSessionsRelations = relations(patientSessions, ({ one, many }) => ({
  clinicalImageAnalyses: many(clinicalImageAnalyses),
  user: one(users, {
    fields: [patientSessions.userId],
    references: [users.id],
  }),
}));

export const mobileTokensRelations = relations(mobileTokens, ({ one }) => ({
  user: one(users, {
    fields: [mobileTokens.userId],
    references: [users.id],
  }),
}));
