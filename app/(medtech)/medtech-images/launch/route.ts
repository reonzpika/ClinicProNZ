import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import { createMedtechLaunchCookieValue } from '@/src/lib/services/medtech/launch-session-cookie';

const BFF_BASE_URL = process.env.MEDTECH_BFF_URL || 'https://api.clinicpro.co.nz';
const COOKIE_NAME = 'medtech_launch_session';
const COOKIE_TTL_SECONDS = 300; // 5 minutes (short TTL, launch-only)

type BffDecodeResponse =
  {
    success: true;
    context: {
      patientId: string | null;
      facilityCode: string;
      providerId?: string | null;
      createdTime?: string | null;
    };
    correlationId?: string;
  }
  | {
    success: false;
    error: string;
    correlationId?: string;
  };

function htmlError(message: string, details?: Record<string, unknown>) {
  const safeDetails = details ? JSON.stringify(details, null, 2) : '';
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>ClinicPro Medtech Launch</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; margin: 0; background: #f8fafc; color: #0f172a; }
      .wrap { max-width: 720px; margin: 72px auto; padding: 0 16px; }
      .card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
      h1 { font-size: 18px; margin: 0 0 12px; }
      p { margin: 0 0 12px; color: #334155; }
      a { color: #7c3aed; text-decoration: none; }
      pre { background: #0b1220; color: #e2e8f0; padding: 12px; border-radius: 10px; overflow: auto; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>Medtech launch failed</h1>
        <p>${message}</p>
        <p><a href="/medtech-images">Open the widget</a></p>
        ${safeDetails ? `<pre>${safeDetails}</pre>` : ''}
      </div>
    </div>
  </body>
</html>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const context = url.searchParams.get('context');
  const signature = url.searchParams.get('signature');

  if (!context || !signature) {
    return new Response(htmlError('Missing Medtech launch parameters.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const cookieSecret = process.env.MEDTECH_LAUNCH_COOKIE_SECRET;
  if (!cookieSecret) {
    return new Response(htmlError('Server misconfiguration: missing MEDTECH_LAUNCH_COOKIE_SECRET.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const correlationId = randomUUID();

  const decodeUrl = new URL(`${BFF_BASE_URL}/api/medtech/launch/decode`);
  decodeUrl.searchParams.set('context', context);
  decodeUrl.searchParams.set('signature', signature);
  decodeUrl.searchParams.set('correlationId', correlationId);

  let decoded: BffDecodeResponse;
  try {
    const resp = await fetch(decodeUrl.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    decoded = (await resp.json()) as BffDecodeResponse;
    if (!resp.ok) {
      return new Response(
        htmlError('Failed to decode Medtech launch context.', { status: resp.status, decoded }),
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
      );
    }
  } catch (error) {
    return new Response(
      htmlError('Failed to contact decode service.', { error: error instanceof Error ? error.message : String(error) }),
      { status: 502, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  if (!decoded || decoded.success !== true) {
    return new Response(
      htmlError('Invalid decode response.', { decoded }),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  const facilityCode = decoded.context?.facilityCode;
  if (typeof facilityCode !== 'string' || !facilityCode.trim()) {
    return new Response(
      htmlError('Invalid launch context: facilityCode is missing.'),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  // `patientId` must exist as a field; it may be null if no patient is selected.
  if (!Object.prototype.hasOwnProperty.call(decoded.context, 'patientId')) {
    return new Response(
      htmlError('Invalid launch context: patientId field is missing.'),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  const encounterId = `launch-${Date.now()}`;

  const cookieValue = createMedtechLaunchCookieValue({
    secret: cookieSecret,
    ttlSeconds: COOKIE_TTL_SECONDS,
    context: {
      patientId: decoded.context.patientId ?? null,
      facilityId: facilityCode.trim(),
      providerId: decoded.context.providerId ?? null,
      createdTime: decoded.context.createdTime ?? null,
      encounterId,
    },
  });

  const response = NextResponse.redirect(new URL('/medtech-images', url.origin), { status: 302 });
  response.cookies.set({
    name: COOKIE_NAME,
    value: cookieValue,
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/medtech-images',
    maxAge: COOKIE_TTL_SECONDS,
  });

  return response;
}
