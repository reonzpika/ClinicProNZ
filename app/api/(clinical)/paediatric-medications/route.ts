import { NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';

import { getDb } from 'database/client';
import { paediatricMedications } from 'database/schema/paediatric_medications';

// Public read: list active medications for calculator
export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(paediatricMedications)
      .where(eq(paediatricMedications.active, true))
      .orderBy(asc(paediatricMedications.name));
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error listing paediatric medications (public):', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
