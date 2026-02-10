import { getDb } from 'database/client';
import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { openmailerSubscribers } from '@/db/schema';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  const list = request.nextUrl.searchParams.get('list');
  if (!email || !list) {
    return new NextResponse(
      '<!DOCTYPE html><html><body><p>Missing email or list. Cannot unsubscribe.</p></body></html>',
      {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      },
    );
  }
  const db = getDb();
  const [sub] = await db
    .select()
    .from(openmailerSubscribers)
    .where(
      and(
        eq(openmailerSubscribers.email, email),
        eq(openmailerSubscribers.listName, list),
      ),
    )
    .limit(1);
  if (sub) {
    await db
      .update(openmailerSubscribers)
      .set({
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(openmailerSubscribers.id, sub.id));
  }
  return new NextResponse(
    '<!DOCTYPE html><html><body><p>You have been unsubscribed.</p></body></html>',
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    },
  );
}
