import { desc, eq, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getAuth } from '@/shared/services/auth/clerk';

import { db } from '../../../database/client';
import { templates } from '../../../database/schema';

export async function GET(req: Request) {
  try {
    const { userId } = await getAuth();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    let whereClause;
    if (type === 'default') {
      whereClause = eq(templates.type, 'default');
    } else if (type === 'custom' && userId) {
      whereClause = eq(templates.ownerId, userId);
    } else {
      // Default: fetch both default and custom for signed-in user, or just default for guests
      whereClause = or(
        eq(templates.type, 'default'),
        userId ? eq(templates.ownerId, userId) : undefined,
      );
    }

    const allTemplates = await db
      .select()
      .from(templates)
      .where(whereClause)
      .orderBy(desc(templates.type), desc(templates.createdAt));

    return NextResponse.json({ templates: allTemplates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 },
    );
  }
}
