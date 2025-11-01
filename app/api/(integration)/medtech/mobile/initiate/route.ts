/**
 * POST /api/medtech/mobile/initiate
 * 
 * Generate QR code for mobile upload session
 */

import { NextRequest, NextResponse } from 'next/server';
import { medtechAPI } from '@/src/medtech/images-widget/services/mock-medtech-api';

export async function POST(request: NextRequest) {
  try {
    const { encounterId } = await request.json();
    
    if (!encounterId) {
      return NextResponse.json(
        { error: 'encounterId is required' },
        { status: 400 }
      );
    }
    
    const session = await medtechAPI.initiateMobile(encounterId);
    return NextResponse.json(session);
  } catch (error) {
    console.error('[API] POST /api/medtech/mobile/initiate error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate mobile session' },
      { status: 500 }
    );
  }
}
