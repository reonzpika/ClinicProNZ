/**
 * GET /api/medtech/session/token/[token]
 *
 * Validate QR token and get encounter context
 *
 * Response:
 * {
 *   encounterId: string,
 *   patientId: string,
 *   facilityId: string,
 *   valid: true
 * }
 *
 * Or 404 if token invalid/expired
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { redisSessionService } from '@/src/lib/services/session-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    console.log('[Token Validate] Validating token', {
      token: token.slice(0, 8),
    });

    // Get token data from Redis
    const tokenData = await redisSessionService.getSessionToken(token);

    if (!tokenData) {
      console.warn('[Token Validate] Token not found or expired', {
        token: token.slice(0, 8),
      });

      return NextResponse.json(
        { error: 'Invalid or expired token', valid: false },
        { status: 404 },
      );
    }

    console.log('[Token Validate] Token valid', {
      token: token.slice(0, 8),
      encounterId: tokenData.encounterId,
      patientId: tokenData.patientId,
    });

    return NextResponse.json({
      encounterId: tokenData.encounterId,
      patientId: tokenData.patientId,
      facilityId: tokenData.facilityId,
      valid: true,
    });
  }
  catch (error) {
    console.error('[Token Validate] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to validate token',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
