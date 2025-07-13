import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const { userId, sessionClaims } = await auth();

    const testResults = {
      timestamp: new Date().toISOString(),
      auth: {
        userId: userId || 'Not authenticated',
        userRole: (sessionClaims as any)?.metadata?.role || 'public',
        hasAccess: userId && (sessionClaims as any)?.metadata?.role !== 'public',
      },
      setup: {
        database: 'Not tested - requires DATABASE_URL',
        embeddings: 'Not tested - requires live database',
        middleware: 'Configured',
        endpoints: {
          query: '/api/rag/query',
          admin: '/api/rag/admin/ingest',
          test: '/api/rag/test',
        },
      },
      nextSteps: [
        '1. Set DATABASE_URL in environment',
        '2. Run: npm run db:generate',
        '3. Run: npm run db:push',
        '4. Enable pgvector: CREATE EXTENSION IF NOT EXISTS vector;',
        '5. Test with admin role to ingest sample document',
        '6. Test query endpoint',
      ],
    };

    return Response.json(testResults);
  } catch (error) {
    console.error('RAG test error:', error);
    return Response.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
