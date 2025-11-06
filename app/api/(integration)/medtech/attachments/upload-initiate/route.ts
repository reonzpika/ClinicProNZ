/**
 * POST /api/medtech/attachments/upload-initiate
 * 
 * Prepare file metadata for upload
 * (Not used in mock mode - files go directly to commit)
 */

import { NextRequest, NextResponse } from 'next/server';
import type { UploadInitiateRequest, UploadInitiateResponse } from '@/src/medtech/images-widget/types';

export async function POST(request: NextRequest) {
  try {
    const body: UploadInitiateRequest = await request.json();
    
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
    
    console.log('[MOCK API] POST /api/medtech/attachments/upload-initiate', body);
    
    const response: UploadInitiateResponse = {
      uploadSessionId: `mock-session-${Date.now()}`,
      files: body.files.map(f => ({
        clientRef: f.clientRef,
        fileId: `mock-file-${Math.random().toString(36).slice(2)}`,
        uploadUrl: '/api/mock-upload', // Not used in mock
        headers: {},
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      })),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] POST /api/medtech/attachments/upload-initiate error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate upload' },
      { status: 500 }
    );
  }
}
