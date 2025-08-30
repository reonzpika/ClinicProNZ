import { pgTable, unique, text, timestamp, integer, date, jsonb, boolean, foreignKey, serial, varchar, uuid, vector, pgEnum } from "drizzle-orm/pg-core"

export const featureStatus = pgEnum("feature_status", ['planned', 'in_progress', 'completed'])
export const mailStatus = pgEnum("mail_status", ['queued', 'sent', 'failed'])


export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	coreSessionsUsed: integer("core_sessions_used").default(0).notNull(),
	sessionResetDate: date("session_reset_date").defaultNow().notNull(),
	currentSessionId: text("current_session_id"),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const surveyResponses = pgTable("survey_responses", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	email: text(),
	q1: jsonb().notNull(),
	q3: jsonb().notNull(),
	q4: jsonb().notNull(),
	q2: integer().notNull(),
	q4PriceBand: text("q4_price_band"),
	callOptIn: boolean("call_opt_in").default(false).notNull(),
	goldLead: boolean("gold_lead").default(false).notNull(),
	rawPayload: jsonb("raw_payload").notNull(),
	ipAddress: text("ip_address"),
});

export const mailQueue = pgTable("mail_queue", {
	id: text().primaryKey().notNull(),
	toEmail: text("to_email").notNull(),
	subject: text().notNull(),
	htmlBody: text("html_body").notNull(),
	textBody: text("text_body").notNull(),
	status: mailStatus().default('queued').notNull(),
	error: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	sentAt: timestamp("sent_at", { withTimezone: true, mode: 'string' }),
});

export const userSettings = pgTable("user_settings", {
	userId: text("user_id").primaryKey().notNull(),
	settings: jsonb().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_settings_user_id_users_id_fk"
		}),
]);

export const features = pgTable("features", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 128 }).notNull(),
	description: varchar({ length: 512 }).notNull(),
	status: featureStatus().notNull(),
	voteCount: integer("vote_count").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const votes = pgTable("votes", {
	id: serial().primaryKey().notNull(),
	featureId: integer("feature_id").notNull(),
	ipAddress: varchar("ip_address", { length: 64 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.featureId],
			foreignColumns: [features.id],
			name: "votes_feature_id_features_id_fk"
		}),
]);

export const featureRequests = pgTable("feature_requests", {
	id: serial().primaryKey().notNull(),
	idea: varchar({ length: 256 }).notNull(),
	details: varchar({ length: 1024 }),
	email: varchar({ length: 128 }),
	ipAddress: varchar("ip_address", { length: 64 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const templates = pgTable("templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	type: text().notNull(),
	ownerId: text("owner_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	description: text(),
	templateBody: text("template_body").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "templates_owner_id_users_id_fk"
		}),
]);

export const clinicalImageAnalyses = pgTable("clinical_image_analyses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	imageKey: text("image_key").notNull(),
	userId: text("user_id").notNull(),
	sessionId: uuid("session_id"),
	prompt: text(),
	result: text().notNull(),
	modelUsed: text("model_used"),
	analyzedAt: timestamp("analyzed_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "clinical_image_analyses_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [patientSessions.id],
			name: "clinical_image_analyses_session_id_patient_sessions_id_fk"
		}).onDelete("cascade"),
]);

export const emailCaptures = pgTable("email_captures", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	practiceName: text("practice_name"),
	practiceSize: text("practice_size"),
	biggestChallenge: text("biggest_challenge"),
	source: text().default('landing_page'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const mobileTokens = pgTable("mobile_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id"),
	token: text().notNull(),
	deviceId: text("device_id"),
	deviceName: text("device_name"),
	isActive: boolean("is_active").default(true).notNull(),
	lastUsedAt: timestamp("last_used_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isPermanent: boolean("is_permanent").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mobile_tokens_user_id_users_id_fk"
		}),
	unique("mobile_tokens_token_unique").on(table.token),
]);

export const patientSessions = pgTable("patient_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id"),
	patientName: text("patient_name"),
	patientId: text("patient_id"),
	status: text().default('active').notNull(),
	transcriptions: text(),
	notes: text(),
	templateId: text("template_id"),
	consultationItems: text("consultation_items"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	typedInput: text("typed_input"),
	consultationNotes: text("consultation_notes"),
	guestToken: text("guest_token"),
	isRecording: boolean("is_recording").default(false).notNull(),
	clinicalImages: text("clinical_images"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "patient_sessions_user_id_users_id_fk"
		}),
]);

export const ragDocuments = pgTable("rag_documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	source: text().notNull(),
	sourceType: text("source_type").notNull(),
	embedding: vector({ dimensions: 1536 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	subject: text().notNull(),
	message: text().notNull(),
	userTier: text("user_tier"),
	userId: text("user_id"),
	source: text().default('contact_page'),
	status: text().default('new'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});
