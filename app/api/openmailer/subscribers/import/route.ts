import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { openmailerSubscribers } from '@/db/schema';

function isAdminAuth(req: NextRequest): boolean {
  const tier = req.headers.get('x-user-tier');
  return tier === 'admin';
}

/**
 * Simple CSV parse: first line = headers, rest = rows. Supports quoted fields.
 */
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]!);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]!);
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = values[j] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      i++;
      let val = '';
      while (i < line.length) {
        if (line[i] === '"') {
          i++;
          if (line[i] === '"') {
            val += '"';
            i++;
          } else break;
        } else {
          val += line[i];
          i++;
        }
      }
      out.push(val);
      if (line[i] === ',') i++;
    } else {
      let val = '';
      while (i < line.length && line[i] !== ',') {
        val += line[i];
        i++;
      }
      out.push(val.trim());
      if (line[i] === ',') i++;
    }
  }
  return out;
}

export async function POST(request: NextRequest) {
  if (!isAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form' }, { status: 400 });
  }
  const file = formData.get('file') as File | null;
  const listName = (formData.get('listName') as string) || 'general';
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  const text = await file.text();
  const records = parseCsv(text);
  const db = getDb();
  let success = 0;
  let failed = 0;
  for (const record of records) {
    const email = (record.email ?? record.Email ?? '').trim();
    if (!email) {
      failed++;
      continue;
    }
    const name = (record.name ?? record.Name ?? '').trim() || null;
    const organization = (record.organization ?? record.Organization ?? '').trim() || null;
    try {
      const [existing] = await db
        .select()
        .from(openmailerSubscribers)
        .where(eq(openmailerSubscribers.email, email))
        .limit(1);
      if (existing) {
        await db
          .update(openmailerSubscribers)
          .set({
            listName,
            updatedAt: new Date(),
            metadata:
              organization !== null
                ? { ...((existing.metadata as Record<string, unknown>) ?? {}), organization }
                : existing.metadata,
          })
          .where(eq(openmailerSubscribers.id, existing.id));
      } else {
        await db.insert(openmailerSubscribers).values({
          id: crypto.randomUUID(),
          email,
          name,
          listName,
          source: 'import',
          metadata: organization !== null ? { organization } : null,
        });
      }
      success++;
    } catch {
      failed++;
    }
  }
  return NextResponse.json({ success, failed });
}
