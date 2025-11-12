/**
 * POST /api/medtech/mobile/initiate
 *
 * Generate QR code for mobile upload session
 */

import QRCode from 'qrcode';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createMobileSession } from '@/src/lib/services/medtech/mobile-session-storage';
import type { MobileSessionResponse } from '@/src/medtech/images-widget/types';

export async function POST(request: NextRequest) {
  try {
    const { encounterId, patientId, facilityId } = await request.json();

    if (!encounterId || !patientId || !facilityId) {
      return NextResponse.json(
        { error: 'encounterId, patientId, and facilityId are required' },
        { status: 400 },
      );
    }

    // Create session in Redis
    const token = await createMobileSession(encounterId, patientId, facilityId);

    // Generate mobile URL
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else {
        baseUrl = 'http://localhost:3000';
      }
    }
    const mobileUrl = `${baseUrl}/medtech-images/mobile?t=${token}`;

    // Generate QR code as SVG
    const qrSvg = await QRCode.toString(mobileUrl, {
      type: 'svg',
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Convert to data URI
    const qrSvgDataUri = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`;

    const response: MobileSessionResponse = {
      token, // Return token directly
      mobileUploadUrl: mobileUrl,
      qrSvg: qrSvgDataUri,
      ttlSeconds: 3600, // 1 hour (session lasts until desktop closes)
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
