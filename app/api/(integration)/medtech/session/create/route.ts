/**
 * POST /api/medtech/session/create
 *
 * Create a new encounter session and generate QR token for mobile
 *
 * Request:
 * {
 *   encounterId: string,
 *   patientId: string,
 *   facilityId: string
 * }
 *
 * Response:
 * {
 *   token: string,
 *   mobileUrl: string,
 *   qrDataUrl: string (optional for client-side QR generation),
 *   expiresIn: number (seconds)
 * }
 */

import crypto from 'node:crypto';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { redisSessionService } from '@/src/lib/services/session-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { encounterId, patientId, facilityId, patientName, patientNHI } = body;

    // Validate required fields
    if (!encounterId || !patientId || !facilityId) {
      return NextResponse.json(
        { error: 'encounterId, patientId, and facilityId are required' },
        { status: 400 },
      );
    }

    console.log('[Session Create] Creating session', {
      encounterId,
      patientId,
      facilityId,
      hasPatientName: !!patientName,
      hasPatientNHI: !!patientNHI,
    });

    // Step 1: Create encounter session in Redis
    const session = await redisSessionService.createSession(
      encounterId,
      patientId,
      facilityId,
      patientName,
      patientNHI,
    );

    // Step 2: Generate QR token (2-hour TTL)
    const token = crypto.randomUUID();

    // Step 3: Store token mapping in Redis
    await redisSessionService.createSessionToken(
      token,
      encounterId,
      patientId,
      facilityId,
      patientName,
      patientNHI,
    );

    // Step 4: Generate mobile URL
    // Use request host for dynamic URL (works for preview/production)
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'clinicpro.co.nz';
    const baseUrl = `${protocol}://${host}`;
    const mobileUrl = `${baseUrl}/medtech-images/mobile?t=${token}`;

    console.log('[Session Create] Session created successfully', {
      encounterId,
      token: token.slice(0, 8),
      sessionCreatedAt: session.createdAt,
      mobileUrl: `${mobileUrl.slice(0, 60)}...`,
    });

    return NextResponse.json({
      token,
      mobileUrl,
      expiresIn: 7200, // 2 hours
    });
  } catch (error) {
    console.error('[Session Create] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
