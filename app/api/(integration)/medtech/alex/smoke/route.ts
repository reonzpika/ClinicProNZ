import { NextResponse } from 'next/server';
import { alexRequest } from '@/src/lib/integrations/medtech/alex/client';
import { getMedtechAlexConfig } from '@/src/lib/integrations/medtech/alex/env';

// Simple smoke test to validate env + token + connectivity.
// This calls a configurable base URL + ping path if provided.
// Guarded implicitly by server runtime; add auth if exposing beyond dev.
export async function GET() {
  try {
    const cfg = getMedtechAlexConfig();
    if (!cfg.alexBaseUrl) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Set MEDTECH_ALEX_BASE_URL and optional MEDTECH_ALEX_PING_PATH to use smoke test.',
          expectedEnv: ['MEDTECH_CLIENT_ID', 'MEDTECH_CLIENT_SECRET', 'MEDTECH_TENANT_ID', 'MEDTECH_API_SCOPE', 'MEDTECH_FACILITY_ID', 'MEDTECH_ALEX_BASE_URL'],
        },
        { status: 400 },
      );
    }

    const res = await alexRequest({
      method: 'GET',
      path: cfg.alexPingPath || '/',
      includeFacility: true,
    });

    const text = await res.text();
    return NextResponse.json({ ok: res.ok, status: res.status, body: text.slice(0, 500) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
