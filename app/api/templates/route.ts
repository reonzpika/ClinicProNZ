import { desc, eq, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getAuth } from '@/shared/services/auth/clerk';

import { db } from '../../../database/client';
import { templates } from '../../../database/schema/templates';

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
    } else if (userId) {
      // Fetch both default and custom for signed-in user
      whereClause = or(eq(templates.type, 'default'), eq(templates.ownerId, userId));
    } else {
      // Guests: only default
      whereClause = eq(templates.type, 'default');
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

export async function POST(req: Request) {
  try {
    const { userId } = await getAuth();
    if (!userId) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'You must be logged in to create a template' },
        { status: 401 }
      );
    }
    const body = await req.json();
    const templateData = {
      ...body,
      ownerId: body.type === 'custom' ? userId : undefined,
    };
    const template = await db.insert(templates).values(templateData).returning();
    return NextResponse.json(template[0]);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to create template' },
      { status: 500 }
    );
  }
}
