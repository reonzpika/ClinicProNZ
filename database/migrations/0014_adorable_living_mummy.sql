ALTER TABLE "rag_documents" DROP CONSTRAINT "rag_documents_source_unique";--> statement-breakpoint
ALTER TABLE "patient_sessions" ADD COLUMN "deepgram_duration_sec" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "rag_documents" ADD COLUMN "chunk_index" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "rag_documents_source_chunk_unique" ON "rag_documents" USING btree ("source","chunk_index");--> statement-breakpoint
CREATE INDEX "rag_documents_source_idx" ON "rag_documents" USING btree ("source");