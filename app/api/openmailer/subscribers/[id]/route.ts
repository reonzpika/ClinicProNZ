import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { openmailerSubscribers } from '@/db/schema';
import { isAdminAuth } from '@/src/lib/openmailer/auth';

const ALLOWED_STATUSES = ['active', 'unsubscribed', 'bounced'] as const;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdminAuth(_request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { id } = await context.params;
  const db = getDb();
  const [row] = await db
    .select()
    .from(openmailerSubscribers)
    .where(eq(openmailerSubscribers.id, id))
    .limit(1);
  if (!row) {
    return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
  }
  return NextResponse.json(row);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { id } = await context.params;
  let body: { name?: string; listName?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const { name, listName, status } = body;
  if (status !== undefined && !ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
    return NextResponse.json(
      { error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` },
      { status: 400 },
    );
  }
  const db = getDb();
  const [existing] = await db
    .select()
    .from(openmailerSubscribers)
    .where(eq(openmailerSubscribers.id, id))
    .limit(1);
  if (!existing) {
    return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
  }
  const updates: {
    name?: string | null;
    listName?: string;
    status?: string;
    updatedAt: Date;
    unsubscribedAt?: Date | null;
  } = { updatedAt: new Date() };
  if (name !== undefined) {
 updates.name = name === '' ? null : name;
}
  if (listName !== undefined) {
 updates.listName = listName;
}
  if (status !== undefined) {
    updates.status = status;
    updates.unsubscribedAt = status === 'unsubscribed' ? new Date() : null;
  }
  const [updated] = await db
    .update(openmailerSubscribers)
    .set(updates)
    .where(eq(openmailerSubscribers.id, id))
    .returning();
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdminAuth(_request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const { id } = await context.params;
  const db = getDb();
  const [existing] = await db
    .select()
    .from(openmailerSubscribers)
    .where(eq(openmailerSubscribers.id, id))
    .limit(1);
  if (!existing) {
    return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
  }
  await db.delete(openmailerSubscribers).where(eq(openmailerSubscribers.id, id));
  return NextResponse.json({ success: true });
}
