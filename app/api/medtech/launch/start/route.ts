import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { setMedtechLaunchCookieOn } from '@/src/lib/services/medtech/launch-cookie';

export const runtime = 'nodejs';

const BFF_URL = process.env.BFF_URL || 'https://api.clinicpro.co.nz';

type BffDecodeResponse =
  | { success: true; context: { patientId: string | null; facilityCode?: string | null; providerId?: string | null; createdTime?: string | null } }
  | { success: false; error?: string };

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const context = searchParams.get('context');
  const signature = searchParams.get('signature');

  if (!context || !signature) {
    return NextResponse.json(
      { success: false, error: 'Missing context or signature parameter' },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${BFF_URL}/api/medtech/launch/decode?context=${encodeURIComponent(context)}&signature=${encodeURIComponent(signature)}`,
      { method: 'GET', headers: { Accept: 'application/json' } },
    );

    const data = await response.json() as BffDecodeResponse;
    if (!response.ok || !data || (data as any).success !== true) {
      return NextResponse.json(
        { success: false, error: (data as any)?.error || 'Failed to decode launch context' },
        { status: response.status || 502 },
      );
    }

    const decoded = (data as any).context || {};
    const patientId = decoded.patientId ?? null;
    const facilityCode = decoded.facilityCode ?? null;
    const providerId = decoded.providerId ?? null;
    const createdTime = decoded.createdTime ?? null;

    if (!facilityCode || typeof facilityCode !== 'string' || !facilityCode.trim()) {
      return NextResponse.json(
        { success: false, error: 'Launch context missing facilityCode' },
        { status: 400 },
      );
    }

    if (!patientId || typeof patientId !== 'string' || !patientId.trim()) {
      return NextResponse.json(
        { success: false, error: 'No patient selected in Medtech' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    setMedtechLaunchCookieOn(cookieStore as any, {
      patientId: patientId.trim(),
      facilityId: facilityCode.trim(),
      ...(providerId && typeof providerId === 'string' && providerId.trim() ? { providerId: providerId.trim() } : {}),
      ...(createdTime && typeof createdTime === 'string' && createdTime.trim() ? { createdTime: createdTime.trim() } : {}),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Launch initialisation failed' },
      { status: 500 },
    );
  }
}

