/**
 * Medtech ALEX API - Token Info Endpoint
 *
 * Returns OAuth token cache status (for debugging/monitoring)
 * GET /api/medtech/token-info
 *
 * Response:
 * - 200: Token info (does not expose actual token)
 *
 * Security: Consider restricting this endpoint to admin users in production
 */

import { NextResponse } from 'next/server';

import { oauthTokenService } from '@/src/lib/services/medtech';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const tokenInfo = oauthTokenService.getTokenInfo();

  return NextResponse.json({
    tokenCache: {
      isCached: tokenInfo.isCached,
      expiresIn: tokenInfo.expiresIn
        ? {
            seconds: Math.round(tokenInfo.expiresIn / 1000),
            minutes: Math.round(tokenInfo.expiresIn / 60000),
            formatted: formatDuration(tokenInfo.expiresIn),
          }
        : null,
      expiresAt: tokenInfo.expiresAt
        ? new Date(tokenInfo.expiresAt).toISOString()
        : null,
    },
    environment: {
      baseUrl: process.env.MEDTECH_API_BASE_URL,
      facilityId: process.env.MEDTECH_FACILITY_ID,
      tenantId: `${process.env.MEDTECH_TENANT_ID?.substring(0, 8)}...`,
      hasClientId: !!process.env.MEDTECH_CLIENT_ID,
      hasClientSecret: !!process.env.MEDTECH_CLIENT_SECRET,
    },
  });
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}
