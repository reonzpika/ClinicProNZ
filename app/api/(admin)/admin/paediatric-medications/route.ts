import { NextResponse } from 'next/server';
import { asc, ilike, or } from 'drizzle-orm';

import { getDb } from 'database/client';
import { paediatricMedications, type NewPaediatricMedication } from 'database/schema/paediatric_medications';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

// GET /api/admin/paediatric-medications?query=par
export async function GET(req: Request) {
  const context = await extractRBACContext(req);
  if (context.tier !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const url = new URL(req.url);
  const query = url.searchParams.get('query')?.trim();

  const db = getDb();

  try {
    if (query) {
      const rows = await db
        .select()
        .from(paediatricMedications)
        .where(
          or(
            ilike(paediatricMedications.name, `%${query}%`),
            ilike(paediatricMedications.slug, `%${query}%`),
          ),
        )
        .orderBy(asc(paediatricMedications.name));
      return NextResponse.json(rows);
    }

    const rows = await db
      .select()
      .from(paediatricMedications)
      .orderBy(asc(paediatricMedications.name));
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error listing paediatric medications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/paediatric-medications
export async function POST(req: Request) {
  const context = await extractRBACContext(req);
  if (context.tier !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = (await req.json()) as NewPaediatricMedication;
    if (!body?.name || !body?.slug || !body?.nzfUrl || !body?.data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();
    const [inserted] = await db.insert(paediatricMedications).values(body).returning();
    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    console.error('Error creating paediatric medication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
