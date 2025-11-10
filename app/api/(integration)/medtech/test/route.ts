/**
 * Medtech ALEX API - Test Endpoint
 *
 * Tests OAuth token acquisition and FHIR API connectivity
 * GET /api/medtech/test?nhi=ZZZ0016
 *
 * Query Parameters:
 * - nhi: NZ National Health Index number (optional, defaults to ZZZ0016)
 *
 * Response:
 * - 200: Success with token info and patient data
 * - 401: Authentication failed
 * - 403: Forbidden (IP not allow-listed or incorrect facility)
 * - 500: Internal error
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  alexApiClient,
  AlexApiError,
  generateCorrelationId,
  oauthTokenService,
} from '@/src/lib/services/medtech';
import type { FhirBundle, FhirPatient } from '@/src/lib/services/medtech/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const startTime = Date.now();

  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const nhi = searchParams.get('nhi') || 'ZZZ0016';

    console.log('[Medtech Test] Starting test', {
      correlationId,
      nhi,
    });

    // Step 1: Get token info (for diagnostics)
    const tokenInfo = oauthTokenService.getTokenInfo();

    // Step 2: Test FHIR API call (GET Patient by NHI)
    const patientBundle = await alexApiClient.get<FhirBundle<FhirPatient>>(
      `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`,
      { correlationId },
    );

    const duration = Date.now() - startTime;

    // Success response
    return NextResponse.json({
      success: true,
      correlationId,
      duration,
      environment: {
        baseUrl: process.env.MEDTECH_API_BASE_URL,
        facilityId: process.env.MEDTECH_FACILITY_ID,
        hasClientId: !!process.env.MEDTECH_CLIENT_ID,
        hasClientSecret: !!process.env.MEDTECH_CLIENT_SECRET,
      },
      tokenInfo: {
        isCached: tokenInfo.isCached,
        expiresIn: tokenInfo.expiresIn ? Math.round(tokenInfo.expiresIn / 1000) : undefined,
      },
      fhirResult: {
        resourceType: patientBundle.resourceType,
        type: patientBundle.type,
        total: patientBundle.total,
        patientCount: patientBundle.entry?.length || 0,
        firstPatient: patientBundle.entry?.[0]?.resource
          ? {
              id: patientBundle.entry[0].resource.id,
              name: patientBundle.entry[0].resource.name?.[0],
              gender: patientBundle.entry[0].resource.gender,
              birthDate: patientBundle.entry[0].resource.birthDate,
            }
          : null,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('[Medtech Test] Failed', {
      correlationId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    });

    // Handle ALEX API errors
    if (error instanceof AlexApiError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          statusCode: error.statusCode,
          correlationId: error.correlationId,
          operationOutcome: error.operationOutcome,
          duration,
        },
        { status: error.statusCode === 401 || error.statusCode === 403 ? error.statusCode : 500 },
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        correlationId,
        duration,
      },
      { status: 500 },
    );
  }
}
