# RAG System Setup - Phase 1

## Overview
Retrieval-Augmented Generation (RAG) system for ClinicPro - provides NZ clinical guidelines search with AI-powered responses.

## Architecture
- **Database**: Neon PostgreSQL + pgvector extension
- **Embeddings**: OpenAI text-embedding-3-small (1536 dimensions)
- **AI Model**: GPT-4o-mini via AI SDK with streaming
- **Auth**: Clerk role-based (`admin` for ingestion, `signed_up+` for queries)

## Setup Steps

### 1. Database Setup
```sql
-- In your Neon database console
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Environment Variables
Ensure these are set in your `.env.local`:
```
DATABASE_URL=your_neon_connection_string
OPENAI_API_KEY=your_openai_api_key
```

### 3. Database Migration
```bash
npm run db:generate
npm run db:push
```

### 4. User Role Setup
Set admin role in Clerk:
```json
{
  "role": "admin"
}
```

## API Endpoints

### Test Setup
```bash
GET /api/rag/test
```
- **Auth**: Any user
- **Purpose**: Verify RAG system configuration

### Get Sample Documents
```bash
GET /api/rag/sample
```
- **Auth**: Admin only
- **Purpose**: Get test documents for ingestion

### Ingest Documents
```bash
POST /api/rag/admin/ingest
Content-Type: application/json

{
  "documents": [
    {
      "title": "Document Title",
      "content": "Document content...",
      "source": "https://example.com",
      "sourceType": "bpac" // or "moh" or "manual"
    }
  ]
}
```
- **Auth**: Admin only
- **Purpose**: Add documents to RAG knowledge base

### Query RAG System
```bash
POST /api/rag/query
Content-Type: application/json

{
  "query": "What are the blood pressure targets for hypertension?"
}
```
- **Auth**: signed_up role or higher
- **Purpose**: Query clinical guidelines with AI responses
- **Response**: Streaming AI response with citations

## Testing Flow

1. **Test setup**: `GET /api/rag/test`
2. **Get samples**: `GET /api/rag/sample`
3. **Ingest samples**: `POST /api/rag/admin/ingest`
4. **Query system**: `POST /api/rag/query`

## File Structure
```
├── database/schema/rag.ts          # Database schema
├── src/lib/rag/
│   ├── index.ts                    # Core RAG functions
│   └── types.ts                    # Type definitions
├── app/api/rag/
│   ├── test/route.ts              # Setup verification
│   ├── sample/route.ts            # Sample documents
│   ├── admin/ingest/route.ts      # Document ingestion
│   └── query/route.ts             # RAG queries
└── middleware.ts                   # Auth protection
```

## Trade-offs
- **Performance**: ~1-2s response time (Neon query + OpenAI streaming)
- **Cost**: ~$0.0001 per embedding + $0.0015 per query (OpenAI)
- **Accuracy**: Depends on document quality and retrieval threshold (0.7)

## Next Steps (Phase 2)
- Document parsing utilities (PDF, HTML)
- Bulk ingestion from BPAC/MoH
- User upload functionality
- Enhanced citation formatting 