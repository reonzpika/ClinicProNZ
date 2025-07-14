# RAG (Retrieval-Augmented Generation) Setup Guide

## Overview
ClinicPro's RAG system provides contextual clinical information during consultations by searching through a curated knowledge base of medical resources.

**Key Features:**
- **Knowledge Base**: Curated medical content for clinical decision support
- **Semantic Search**: Vector-based search for relevant clinical information
- **Auth**: Clerk tier-based (`admin` for ingestion, `basic+` for queries)
- **Rate Limiting**: Tier-based limits (5 queries/day for basic, unlimited for standard+)

## Quick Start

### 1. Environment Setup
```bash
# Required environment variables
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=clinicpro-rag
```

### 2. Pinecone Index Setup
```bash
# Create index (1536 dimensions for OpenAI text-embedding-ada-002)
curl -X POST "https://controller.${PINECONE_ENVIRONMENT}.pinecone.io/databases" \
  -H "Api-Key: ${PINECONE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "clinicpro-rag",
    "dimension": 1536,
    "metric": "cosine"
  }'
```

### 3. Database Schema
Already included in main migrations - see `schema/rag.ts`

### 4. User Tier Setup
Set admin tier in Clerk:
```json
{
  "tier": "admin"
}
```

## API Endpoints

### Content Ingestion (Admin Only)
```
POST /api/rag/admin/ingest
Content-Type: application/json
Authorization: Basic tier or higher required

{
  "content": "Clinical content to index",
  "source": "Source reference",
  "category": "diagnosis|treatment|medication|procedure"
}
```

### Query Interface
```
POST /api/rag/query
Content-Type: application/json
Authorization: Basic tier or higher required

{
  "query": "What are the symptoms of pneumonia?",
  "limit": 5
}
```

### Sample Data
```
GET /api/rag/sample
Authorization: Basic tier or higher required
```

## Usage Examples

### Basic Query
```javascript
const response = await fetch('/api/rag/query', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'chest pain differential diagnosis',
    limit: 3
  })
});

const { results } = await response.json();
```

### Content Ingestion
```javascript
const response = await fetch('/api/rag/admin/ingest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'Acute myocardial infarction presents with...',
    source: 'Clinical Guidelines 2024',
    category: 'diagnosis'
  })
});
```

## Rate Limiting
- **Basic Tier**: 5 queries per day
- **Standard Tier**: Unlimited queries
- **Premium Tier**: Unlimited queries
- **Admin Tier**: Unlimited queries

## Security Features
- **Authentication**: Clerk-based tier verification
- **Authorization**: Tier-based access control
- **Rate Limiting**: Prevents abuse
- **Content Validation**: Sanitizes input data

## Implementation Details

### Vector Search Flow
1. User submits query
2. System checks tier permissions
3. Query is embedded using OpenAI
4. Vector search performed in Pinecone
5. Results ranked by relevance
6. Formatted response returned

### Data Pipeline
1. **Ingestion**: Content → Embeddings → Pinecone
2. **Storage**: Metadata stored in PostgreSQL
3. **Search**: Query → Embeddings → Vector Search
4. **Retrieval**: Results + Metadata → Formatted Response

## Testing
- **Unit Tests**: `npm test rag`
- **Integration Tests**: Available in `/api/rag/test`
- **Manual Testing**: Use `/api/rag/sample` for test data

## Performance Considerations
- **Caching**: Implement Redis for frequent queries
- **Batch Processing**: For large ingestion jobs
- **Index Optimization**: Regular Pinecone index maintenance

## Troubleshooting
- **Auth Issues**: Check tier in Clerk metadata
- **Rate Limits**: Verify tier-based limits
- **Vector Search**: Ensure Pinecone index is properly configured
- **OpenAI API**: Verify API key and rate limits

## Future Enhancements
- **Semantic Caching**: Cache similar queries
- **Advanced Filters**: Category-based filtering
- **Multi-Modal**: Support for image/document upload
- **Personalization**: User-specific relevance scoring 