/**
 * GET /api/medtech/document-reference/:id
 *
 * Proxy to Lightsail BFF (static IP allow-listed) to fetch a DocumentReference by id.
 * Useful for validating Inbox Scan write-back behaviour without relying on Evolution UI.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BFF_BASE_URL = process.env.MEDTECH_BFF_URL || 'https://api.clinicpro.co.nz';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(request.url);
  const facilityId = url.searchParams.get('facilityId');

  if (typeof id !== 'string' || !id.trim()) {
    return NextResponse.json(
      { success: false, error: 'id parameter required' },
      { status: 400 },
    );
  }

  const upstream = new URL(`${BFF_BASE_URL}/api/medtech/document-reference/${encodeURIComponent(id.trim())}`);
  if (facilityId && facilityId.trim()) {
    upstream.searchParams.set('facilityId', facilityId.trim());
  }

  const resp = await fetch(upstream.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const contentType = resp.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await resp.json() : await resp.text();

  return NextResponse.json(body, { status: resp.status });
}
