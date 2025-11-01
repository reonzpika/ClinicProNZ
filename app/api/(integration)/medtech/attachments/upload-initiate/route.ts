/**
 * POST /api/medtech/attachments/upload-initiate
 * 
 * Prepare file metadata for upload
 * (Not used in mock mode - files go directly to commit)
 */

import { NextRequest, NextResponse } from 'next/server';
import { medtechAPI } from '@/src/medtech/images-widget/services/mock-medtech-api';
import type { UploadInitiateRequest } from '@/src/medtech/images-widget/types';

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
    
    const response = await medtechAPI.uploadInitiate(body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] POST /api/medtech/attachments/upload-initiate error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate upload' },
      { status: 500 }
    );
  }
}
