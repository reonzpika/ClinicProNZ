import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { consumeMedtechLaunchCookieFrom } from '@/src/lib/services/medtech/launch-cookie';

export const runtime = 'nodejs';

export async function GET() {
  const cookieStore = await cookies();
  const ctx = consumeMedtechLaunchCookieFrom(cookieStore as any);
  if (!ctx) {
    return NextResponse.json(
      { success: false, error: 'Launch session missing or expired' },
      { status: 401 },
    );
  }

  return NextResponse.json({ success: true, context: ctx });
}

