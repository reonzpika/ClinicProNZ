import { pgTable, text, timestamp, uuid, vector } from 'drizzle-orm/pg-core';

export const ragDocuments = pgTable('rag_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  source: text('source').notNull(), // URL or filename
  sourceType: text('source_type').notNull(), // 'bpac', 'moh', 'manual'
  embedding: vector('embedding', { dimensions: 1536 }), // OpenAI embeddings
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RagDocument = typeof ragDocuments.$inferSelect;
export type NewRagDocument = typeof ragDocuments.$inferInsert;
