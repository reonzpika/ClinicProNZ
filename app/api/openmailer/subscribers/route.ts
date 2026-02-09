import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { openmailerSubscribers } from '@/db/schema';
import { isAdminAuth } from '@/src/lib/openmailer/auth';

export async function GET(request: NextRequest) {
  if (!isAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const listName = request.nextUrl.searchParams.get('list');
  const db = getDb();
  const rows = listName
    ? await db
        .select()
        .from(openmailerSubscribers)
        .where(eq(openmailerSubscribers.listName, listName))
    : await db.select().from(openmailerSubscribers);
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  if (!isAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  let body: { email: string; name?: string; listName?: string; source?: string; metadata?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { email, name, listName = 'general', source, metadata } = body;
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }
  const db = getDb();
  const [existing] = await db
    .select()
    .from(openmailerSubscribers)
    .where(eq(openmailerSubscribers.email, email))
    .limit(1);
  if (existing) {
    if (existing.listName !== listName) {
      const [updated] = await db
        .update(openmailerSubscribers)
        .set({ listName, updatedAt: new Date() })
        .where(eq(openmailerSubscribers.id, existing.id))
        .returning();
      return NextResponse.json(updated ?? existing);
    }
    return NextResponse.json(existing);
  }
  const id = crypto.randomUUID();
  const [created] = await db
    .insert(openmailerSubscribers)
    .values({
      id,
      email,
      name: name ?? null,
      listName,
      source: source ?? 'manual',
      metadata: metadata ?? null,
    })
    .returning();
  return NextResponse.json(created);
}
