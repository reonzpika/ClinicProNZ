import { bigint, boolean, foreignKey, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';

export const featureStatus = pgEnum('feature_status', ['planned', 'in_progress', 'completed']);

export const users = pgTable('users', {
  id: text().primaryKey().notNull(),
  email: text().notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
}, table => [
  unique('users_email_unique').on(table.email),
]);

export const userSettings = pgTable('user_settings', {
  userId: text('user_id').primaryKey().notNull(),
  settings: jsonb().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
}, table => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'user_settings_user_id_users_id_fk',
  }),
]);

export const features = pgTable('features', {
  id: serial().primaryKey().notNull(),
  title: varchar({ length: 128 }).notNull(),
  description: varchar({ length: 512 }).notNull(),
  status: featureStatus().notNull(),
  voteCount: integer('vote_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const votes = pgTable('votes', {
  id: serial().primaryKey().notNull(),
  featureId: integer('feature_id').notNull(),
  ipAddress: varchar('ip_address', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, table => [
  foreignKey({
    columns: [table.featureId],
    foreignColumns: [features.id],
    name: 'votes_feature_id_features_id_fk',
  }),
]);

export const featureRequests = pgTable('feature_requests', {
  id: serial().primaryKey().notNull(),
  idea: varchar({ length: 256 }).notNull(),
  details: varchar({ length: 1024 }),
  email: varchar({ length: 128 }),
  ipAddress: varchar('ip_address', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const templates = pgTable('templates', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text().notNull(),
  type: text().notNull(),
  ownerId: text('owner_id'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  description: text(),
  templateBody: text('template_body').notNull(),
}, table => [
  foreignKey({
    columns: [table.ownerId],
    foreignColumns: [users.id],
    name: 'templates_owner_id_users_id_fk',
  }),
]);

export const emailCaptures = pgTable('email_captures', {
  id: text().primaryKey().notNull(),
  email: text().notNull(),
  name: text(),
  practiceName: text('practice_name'),
  practiceSize: text('practice_size'),
  biggestChallenge: text('biggest_challenge'),
  source: text().default('landing_page'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
});

export const mobileTokens = pgTable('mobile_tokens', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: text('user_id').notNull(),
  token: text().notNull(),
  deviceId: text('device_id'),
  deviceName: text('device_name'),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
  lastUsedAt: timestamp('last_used_at', { mode: 'string' }),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
}, table => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'mobile_tokens_user_id_users_id_fk',
  }),
  unique('mobile_tokens_token_unique').on(table.token),
]);

export const drizzleMigrations = pgTable('__drizzle_migrations', {
  id: serial().primaryKey().notNull(),
  hash: text().notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  createdAt: bigint('created_at', { mode: 'number' }),
});

export const patientSessions = pgTable('patient_sessions', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: text('user_id').notNull(),
  patientName: text('patient_name'),
  patientId: text('patient_id'),
  status: text().default('active').notNull(),
  transcriptions: text(),
  notes: text(),
  templateId: text('template_id'),
  consultationItems: text('consultation_items'),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { mode: 'string' }),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  typedInput: text('typed_input'),
  consultationNotes: text('consultation_notes'),
  clinicalImages: text('clinical_images'),
}, table => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: 'patient_sessions_user_id_users_id_fk',
  }),
]);
