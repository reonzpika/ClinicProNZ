import { getDb } from 'database/client';
import { desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { openmailerCampaigns } from '@/db/schema';

function isAdminAuth(req: NextRequest): boolean {
  return req.headers.get('x-user-tier') === 'admin';
}

export async function GET(request: NextRequest) {
  if (!isAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  const db = getDb();
  const rows = await db
    .select()
    .from(openmailerCampaigns)
    .orderBy(desc(openmailerCampaigns.createdAt));
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  if (!isAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  let body: {
    name: string;
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    fromName?: string;
    fromEmail?: string;
    replyTo?: string;
    listName: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const {
    name,
    subject,
    bodyHtml,
    bodyText,
    fromName = 'Dr. Ryo Eguchi',
    fromEmail = 'ryo@clinicpro.co.nz',
    replyTo,
    listName,
  } = body;
  if (!name || !subject || !bodyHtml || !listName) {
    return NextResponse.json(
      { error: 'name, subject, bodyHtml, listName required' },
      { status: 400 }
    );
  }
  const id = crypto.randomUUID();
  const db = getDb();
  const [created] = await db
    .insert(openmailerCampaigns)
    .values({
      id,
      name,
      subject,
      bodyHtml,
      bodyText: bodyText ?? null,
      fromName,
      fromEmail,
      replyTo: replyTo ?? null,
      listName,
    })
    .returning();
  return NextResponse.json(created);
}
