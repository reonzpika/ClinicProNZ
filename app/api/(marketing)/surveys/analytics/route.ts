import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    // Minimal fallback logger
    console.log('analytics:event', event);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('analytics:error', error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
