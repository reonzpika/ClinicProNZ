import { getDb } from 'database/client';
import { featureRequests } from 'database/schema/feature_requests';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const db = getDb();
  const { idea, details, email } = await req.json();
  if (!idea || idea.trim().length === 0) {
    return NextResponse.json({ success: false, message: 'Idea is required' }, { status: 400 });
  }
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  await db.insert(featureRequests).values({
    idea,
    details,
    email,
    ip_address: ip,
  });
  return NextResponse.json({ success: true });
}
