/**
 * GET /api/medtech/capabilities
 * 
 * Returns feature flags and coded value lists
 */

import { NextResponse } from 'next/server';
import { medtechAPI } from '@/src/medtech/images-widget/services/mock-medtech-api';

export async function GET() {
  try {
    const capabilities = await medtechAPI.getCapabilities();
    return NextResponse.json(capabilities);
  } catch (error) {
    console.error('[API] GET /api/medtech/capabilities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch capabilities' },
      { status: 500 }
    );
  }
}
