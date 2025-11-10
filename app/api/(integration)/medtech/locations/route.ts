/**
 * GET /api/medtech/locations
 *
 * Query ALEX API Location endpoint to discover available facilities
 * This helps identify which facility IDs are available/configured
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  alexApiClient,
  AlexApiError,
  generateCorrelationId,
} from '@/src/lib/services/medtech';
import type { FhirBundle, FhirLocation } from '@/src/lib/services/medtech/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
  const correlationId = generateCorrelationId();
  const startTime = Date.now();

  try {
    console.log('[Medtech Locations] Querying Location endpoint', {
      correlationId,
    });

    // Try querying Location without facility ID filter first
    // This might return all available facilities
    const locationBundle = await alexApiClient.get<FhirBundle<FhirLocation>>(
      '/Location',
      { correlationId },
    );

    const duration = Date.now() - startTime;

    console.log('[Medtech Locations] Success', {
      correlationId,
      total: locationBundle.total,
      entryCount: locationBundle.entry?.length || 0,
      duration,
    });

    return NextResponse.json({
      success: true,
      correlationId,
      duration,
      total: locationBundle.total,
      locations: locationBundle.entry?.map(entry => ({
        id: entry.resource.id,
        name: entry.resource.name,
        identifier: entry.resource.identifier,
        status: entry.resource.status,
        description: entry.resource.description,
      })) || [],
      rawBundle: locationBundle,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('[Medtech Locations] Failed', {
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
