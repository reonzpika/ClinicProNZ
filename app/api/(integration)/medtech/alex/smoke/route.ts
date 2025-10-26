import { NextResponse } from 'next/server';
import { alexRequest } from '@/src/lib/integrations/medtech/alex/client';
import { getMedtechAlexConfig } from '@/src/lib/integrations/medtech/alex/env';
import { getAccessToken } from '@/src/lib/integrations/medtech/alex/token-service';

// Simple smoke test to validate env + token + connectivity.
// This calls a configurable base URL + ping path if provided.
// Guarded implicitly by server runtime; add auth if exposing beyond dev.
export async function GET() {
  try {
    const cfg = getMedtechAlexConfig();
    // If no base URL, at least validate we can fetch a token successfully.
    if (!cfg.alexBaseUrl) {
      const token = await getAccessToken();
      return NextResponse.json({ ok: true, tokenSample: token.slice(0, 12) + '...' });
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
