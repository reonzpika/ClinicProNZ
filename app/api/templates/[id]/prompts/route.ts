import { auth } from '@clerk/nextjs';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/database/client';
import { templates } from '@/database/schema/templates';

// PATCH /api/templates/[id]/prompts - Update template prompts
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const templateId = params.id;
    const body = await request.json();

    // Check if template exists and is owned by user
    const existingTemplate = await db
      .select()
      .from(templates)
      .where(
        and(
          eq(templates.id, templateId),
          eq(templates.ownerId, userId),
        ),
      )
      .first();

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found or unauthorized' },
        { status: 404 },
      );
    }

    // Update only the prompts field
    const [updatedTemplate] = await db
      .update(templates)
      .set({
        prompts: {
          ...existingTemplate.prompts,
          ...body,
        },
        updatedAt: new Date(),
      })
      .where(eq(templates.id, templateId))
      .returning();

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template prompts:', error);
    return NextResponse.json(
      { error: 'Failed to update template prompts' },
      { status: 500 },
    );
  }
}
