/**
 * POST /api/medtech/attachments/commit
 * 
 * Commit images to encounter (forwards to ALEX FHIR API)
 */

import { NextRequest, NextResponse } from 'next/server';
import { medtechAPI } from '@/src/medtech/images-widget/services/mock-medtech-api';
import type { CommitRequest } from '@/src/medtech/images-widget/types';

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
    
    const response = await medtechAPI.commit(body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] POST /api/medtech/attachments/commit error:', error);
    return NextResponse.json(
      { error: 'Failed to commit attachments' },
      { status: 500 }
    );
  }
}
