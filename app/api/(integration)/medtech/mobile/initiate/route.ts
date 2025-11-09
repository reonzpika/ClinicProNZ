/**
 * POST /api/medtech/mobile/initiate
 *
 * Generate QR code for mobile upload session
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import type { MobileSessionResponse } from '@/src/medtech/images-widget/types';

export async function POST(request: NextRequest) {
  try {
    const { encounterId } = await request.json();

    if (!encounterId) {
      return NextResponse.json(
        { error: 'encounterId is required' },
        { status: 400 },
      );
    }

    const token = `mock-token-${Date.now()}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const mobileUrl = `${baseUrl}/medtech-images/mobile?t=${token}`;

    // Simple SVG QR code placeholder (server-side safe)
    const qrSvg = `data:image/svg+xml;base64,${Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-size="12" fill="black">
          QR Code Mock
        </text>
        <text x="100" y="120" text-anchor="middle" font-size="8" fill="gray">
          ${token.slice(0, 20)}...
        </text>
      </svg>
    `).toString('base64')}`;

    const response: MobileSessionResponse = {
      mobileUploadUrl: mobileUrl,
      qrSvg,
      ttlSeconds: 600,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] POST /api/medtech/mobile/initiate error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate mobile session' },
      { status: 500 },
    );
  }
}
