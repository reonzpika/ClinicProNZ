import { jsonb, pgTable, text, timestamp, uuid, vector } from 'drizzle-orm/pg-core';

export const ragDocuments = pgTable('rag_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(), // Original full content (or basic content for light scrapes)
  source: text('source').notNull(), // URL or filename
  sourceType: text('source_type').notNull(), // 'bpac', 'moh', 'manual', 'healthify'

  // Enhancement tracking
  enhancementStatus: text('enhancement_status').default('basic').notNull(), // 'basic', 'enhanced', 'failed'
  basicContent: text('basic_content'), // Light scraped content for initial indexing
  lastEnhanced: timestamp('last_enhanced'), // When full enhancement was completed

  // Structured medical content (populated after enhancement)
  sections: jsonb('sections'), // { "symptoms": "...", "treatment": "...", etc }
  overallSummary: text('overall_summary'), // LLM-generated overall summary
  sectionSummaries: jsonb('section_summaries'), // { "symptoms": ["point1", "point2"], etc }

  // Metadata
  author: text('author'), // Author/reviewer
  lastUpdated: timestamp('last_updated'), // Content last updated date
  categories: jsonb('categories'), // Tags/categories array
  contentType: text('content_type'), // article, guide, fact sheet
  medicalSpecialty: text('medical_specialty'), // cardiology, dermatology, etc
  targetAudience: text('target_audience'), // patients, professionals, families

  // Links and references
  internalLinks: jsonb('internal_links'), // [{"text": "...", "url": "..."}]
  externalCitations: jsonb('external_citations'), // External reference links

  // Original fields
  embedding: vector('embedding', { dimensions: 1536 }), // OpenAI embeddings
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type RagDocument = typeof ragDocuments.$inferSelect;
export type NewRagDocument = typeof ragDocuments.$inferInsert;
