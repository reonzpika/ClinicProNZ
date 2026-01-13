import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { readMedtechLaunchCookieValue } from '@/src/lib/services/medtech/launch-session-cookie';

const COOKIE_NAME = 'medtech_launch_session';

export async function GET() {
  const cookieSecret = process.env.MEDTECH_LAUNCH_COOKIE_SECRET;
  if (!cookieSecret) {
    return NextResponse.json(
      { success: false, error: 'Server misconfiguration: missing MEDTECH_LAUNCH_COOKIE_SECRET' },
      { status: 500 },
    );
  }

  const jar = await cookies();
  const cookie = jar.get(COOKIE_NAME);

  // Always clear cookie on read attempt to enforce single-use.
  // If a valid session exists, caller will immediately get it back in the JSON response.
  jar.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/medtech-images',
    maxAge: 0,
  });

  if (!cookie?.value) {
    return NextResponse.json(
      { success: false, error: 'No launch session' },
      { status: 404 },
    );
  }

  const payload = readMedtechLaunchCookieValue({
    secret: cookieSecret,
    value: cookie.value,
  });

  if (!payload) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired launch session' },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    context: payload.context,
  });
}

