import { auth } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { count, eq, and, isNull, gt } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { patientSessions } from '@/db/schema';

export async function GET() {
  try {
    const db = getDb();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const now = new Date();

    const [lifetimeRow, activeRow] = await Promise.all([
      db
        .select({ value: count() })
        .from(patientSessions)
        .where(eq(patientSessions.userId, userId))
        .then((rows: Array<{ value: number }>) => rows[0] || { value: 0 }),
      db
        .select({ value: count() })
        .from(patientSessions)
        .where(
          and(
            eq(patientSessions.userId, userId),
            isNull(patientSessions.deletedAt),
            gt(patientSessions.expiresAt, now),
          ),
        )
        .then((rows: Array<{ value: number }>) => rows[0] || { value: 0 }),
    ]);

    return NextResponse.json({ lifetime: lifetimeRow.value, active: activeRow.value });
  } catch (error) {
    console.error('Error fetching session stats:', error);
    return NextResponse.json({ error: 'Failed to fetch session stats' }, { status: 500 });
  }
}

