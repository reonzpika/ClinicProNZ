import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/lib/db';
import { templateSchema } from '@/models/Schema';
import type { TemplateType } from '@/types/templates';

// Input validation schemas
const templateInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  type: z.enum(['multi-problem', 'specialized', 'follow-up', 'assessment'] as const),
  content: z.string(),
  structure: z.object({
    sections: z.array(z.object({
      key: z.string(),
      label: z.string(),
      prompt: z.string(),
      required: z.boolean(),
      order: z.number(),
      variables: z.array(z.string()).optional(),
    })),
    defaultOrder: z.array(z.string()).optional(),
  }),
  variables: z.record(z.object({
    key: z.string(),
    label: z.string(),
    type: z.enum(['string', 'number', 'date', 'boolean']),
    required: z.boolean(),
    defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
    description: z.string().optional(),
  })),
});

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as TemplateType | null;
    const isSystem = searchParams.get('isSystem') === 'true';
    const search = searchParams.get('search');
    const latest = searchParams.get('latest') !== 'false';

    let query = db.select().from(templateSchema);

    // Build where clause
    const whereConditions = [];

    // User or system templates
    whereConditions.push(eq(templateSchema.userId, isSystem ? 'system' : userId));

    // Type filter
    if (type) {
      whereConditions.push(eq(templateSchema.type, type));
    }

    // Latest version filter
    if (latest) {
      whereConditions.push(eq(templateSchema.isLatest, true));
    }

    // Apply where conditions
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }

    const templates = await query;

    // Apply search filter in memory (since it might need to search in JSON fields)
    let filteredTemplates = templates;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(searchLower)
        || template.description?.toLowerCase().includes(searchLower),
      );
    }

    return NextResponse.json(filteredTemplates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate input
    const validationResult = templateInputSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation Error',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const newTemplate = await db.insert(templateSchema).values({
      ...validationResult.data,
      userId,
      version: 1,
      isLatest: true,
      isSystem: false,
      isActive: true,
    }).returning();

    return NextResponse.json(newTemplate[0]);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { id, createNewVersion, ...updateData } = data;

    // Validate input
    const validationResult = templateInputSchema.partial().safeParse(updateData);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Validation Error',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    // Check if template exists and belongs to user
    const existingTemplate = await db.select()
      .from(templateSchema)
      .where(and(
        eq(templateSchema.id, id),
        eq(templateSchema.userId, userId),
      ))
      .limit(1);

    if (!existingTemplate.length) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (createNewVersion) {
      // Set current version as not latest
      await db.update(templateSchema)
        .set({ isLatest: false })
        .where(eq(templateSchema.id, id));

      // Create new version
      const newVersion = await db.insert(templateSchema).values({
        ...existingTemplate[0],
        ...validationResult.data,
        id: undefined,
        version: existingTemplate[0].version + 1,
        isLatest: true,
      }).returning();

      return NextResponse.json(newVersion[0]);
    }

    // Regular update
    const updatedTemplate = await db.update(templateSchema)
      .set(validationResult.data)
      .where(eq(templateSchema.id, id))
      .returning();

    return NextResponse.json(updatedTemplate[0]);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    const deletedTemplate = await db.delete(templateSchema)
      .where(eq(templateSchema.id, id))
      .returning();

    if (deletedTemplate.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
