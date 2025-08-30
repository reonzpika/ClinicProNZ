import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: 'Deprecated endpoint' }, { status: 410 });
}
