import { db } from 'database/client';
import { features } from 'database/schema/features';
import { votes } from 'database/schema/votes';
import { and, eq, sql } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { feature_id } = await req.json();
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';

  // Prevent duplicate votes by IP and feature_id
  const existing = await db
    .select()
    .from(votes)
    .where(and(eq(votes.feature_id, feature_id), eq(votes.ip_address, ip)));
  if (existing.length > 0) {
    return NextResponse.json({ success: false, message: 'Already voted' }, { status: 400 });
  }

  // Register vote
  await db.insert(votes).values({ feature_id, ip_address: ip });
  await db.update(features)
    .set({ vote_count: sql`${features.vote_count} + 1` })
    .where(eq(features.id, feature_id));

  return NextResponse.json({ success: true });
}
