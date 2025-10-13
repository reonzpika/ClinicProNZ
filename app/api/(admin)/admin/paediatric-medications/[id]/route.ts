import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { getDb } from 'database/client';
import { paediatricMedications, type NewPaediatricMedication } from 'database/schema/paediatric_medications';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

// GET /api/admin/paediatric-medications/[id]
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  try {
    const rows = await db.select().from(paediatricMedications).where(eq(paediatricMedications.id, params.id)).limit(1);
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching paediatric medication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/paediatric-medications/[id]
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const context = await extractRBACContext(req);
  if (context.tier !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = (await req.json()) as Partial<NewPaediatricMedication>;
    const db = getDb();
    const [updated] = await db
      .update(paediatricMedications)
      .set({
        name: body.name,
        slug: body.slug,
        nzfUrl: body.nzfUrl,
        active: body.active,
        data: body.data as any,
        updatedAt: new Date(),
      })
      .where(eq(paediatricMedications.id, params.id))
      .returning();

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating paediatric medication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/paediatric-medications/[id]
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const context = await extractRBACContext(req);
  if (context.tier !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const db = getDb();
    const [deleted] = await db
      .delete(paediatricMedications)
      .where(eq(paediatricMedications.id, params.id))
      .returning();

    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting paediatric medication:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
