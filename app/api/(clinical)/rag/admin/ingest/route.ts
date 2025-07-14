import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ingestDocument } from '@/src/lib/rag';
import type { DocumentToIngest } from '@/src/lib/rag/types';

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin tier
    const userTier = (sessionClaims as any)?.metadata?.tier || 'basic';
    if (userTier !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse request body
    const { documents } = await request.json();

    if (!documents || !Array.isArray(documents)) {
      return new Response('Documents array is required', { status: 400 });
    }

    // Validate document structure
    for (const doc of documents) {
      if (!doc.title || !doc.content || !doc.source || !doc.sourceType) {
        return new Response('Each document must have title, content, source, and sourceType', { status: 400 });
      }

      if (!['bpac', 'moh', 'manual'].includes(doc.sourceType)) {
        return new Response('sourceType must be one of: bpac, moh, manual', { status: 400 });
      }
    }

    // Ingest documents
    const results = [];
    for (const doc of documents) {
      try {
        await ingestDocument(doc as DocumentToIngest);
        results.push({ success: true, title: doc.title });
      } catch (error) {
        console.error(`Failed to ingest document "${doc.title}":`, error);
        results.push({
          success: false,
          title: doc.title,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return Response.json({
      message: 'Ingestion completed',
      results,
      total: documents.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    });
  } catch (error) {
    console.error('Admin ingestion error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
