/**
 * POST /api/medtech/attachments/commit
 * 
 * Commit images to encounter (forwards to ALEX FHIR API)
 */

import { NextRequest, NextResponse } from 'next/server';
import type { CommitRequest, CommitResponse } from '@/src/medtech/images-widget/types';

export async function POST(request: NextRequest) {
  try {
    const body: CommitRequest = await request.json();
    
    if (!body.encounterId) {
      return NextResponse.json(
        { error: 'encounterId is required' },
        { status: 400 }
      );
    }
    
    if (!body.files || body.files.length === 0) {
      return NextResponse.json(
        { error: 'files array is required' },
        { status: 400 }
      );
    }
    
    console.log('[MOCK API] POST /api/medtech/attachments/commit');
    console.log('Encounter ID:', body.encounterId);
    console.log('Files:', body.files.map(f => ({
      fileId: f.fileId,
      metadata: f.meta,
      inbox: f.alsoInbox,
      task: f.alsoTask,
    })));
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock success response
    const response: CommitResponse = {
      files: body.files.map(f => ({
        fileId: f.fileId,
        status: 'committed',
        documentReferenceId: `mock-dr-${Math.random().toString(36).slice(2, 10)}`,
        mediaId: `mock-media-${Math.random().toString(36).slice(2, 10)}`,
        inboxMessageId: f.alsoInbox?.enabled
          ? `mock-inbox-${Math.random().toString(36).slice(2, 10)}`
          : undefined,
        taskId: f.alsoTask?.enabled
          ? `mock-task-${Math.random().toString(36).slice(2, 10)}`
          : undefined,
        warnings: [],
      })),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] POST /api/medtech/attachments/commit error:', error);
    return NextResponse.json(
      { error: 'Failed to commit attachments' },
      { status: 500 }
    );
  }
}
