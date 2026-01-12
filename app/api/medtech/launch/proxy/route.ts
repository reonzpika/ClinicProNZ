import { NextRequest, NextResponse } from 'next/server';

const BFF_URL = process.env.BFF_URL || 'https://api.clinicpro.co.nz';

/**
 * Vercel Proxy for Launch Context Decoding
 *
 * Proxies launch context decoding requests to the BFF to avoid CORS issues.
 * Called by the widget when launched from Medtech Evolution via ALEX Vendor Forms.
 */
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
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'BFF request failed' },
      { status: 500 },
    );
  }
}
