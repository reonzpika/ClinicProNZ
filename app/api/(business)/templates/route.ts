import { desc, eq, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb } from 'database/client';
import { templates } from '@/db/schema/templates';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

export async function GET(req: Request) {
  try {
    const db = getDb();
    // Extract RBAC context from client headers
    const context = await extractRBACContext(req);

    // Require authentication for all template access
    if (!context.isAuthenticated) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'You must be logged in to access templates' },
        { status: 401 },
      );
    }
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    let whereClause;
    if (type === 'default') {
      whereClause = eq(templates.type, 'default');
    } else if (type === 'custom' && context.userId) {
      whereClause = eq(templates.ownerId, context.userId);
    } else {
      // Authenticated users: show both default and their custom templates
      whereClause = or(eq(templates.type, 'default'), eq(templates.ownerId, context.userId!));
    }

    const allTemplates = await db
      .select({
        id: templates.id,
        name: templates.name,
        type: templates.type,
        description: templates.description,
        templateBody: templates.templateBody,
        ownerId: templates.ownerId,
        createdAt: templates.createdAt,
        updatedAt: templates.updatedAt,
      })
      .from(templates)
      .where(whereClause)
      .orderBy(desc(templates.type), desc(templates.createdAt));

    return NextResponse.json({ templates: allTemplates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to fetch templates' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const db = getDb();
    // Extract RBAC context from client headers
    const context = await extractRBACContext(req);

    if (!context.isAuthenticated) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'You must be logged in to create a template' },
        { status: 401 },
      );
    }

    const body = await req.json();

    // Remove temporary IDs that start with 'new-' to let database auto-generate UUID
    const { id, ...templateDataWithoutId } = body;
    const shouldIncludeId = id && !id.startsWith('new-');

    const templateData = {
      ...(shouldIncludeId ? { id } : {}),
      ...templateDataWithoutId,
      type: 'custom',
      ownerId: context.userId,
    };

    const template = await db.insert(templates).values(templateData).returning();
    return NextResponse.json(template[0]);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to create template' },
      { status: 500 },
    );
  }
}
