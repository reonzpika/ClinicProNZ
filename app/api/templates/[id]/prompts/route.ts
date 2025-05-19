import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { TemplateService } from '@/features/templates/template-service';
import type { ApiError } from '@/features/templates/types';

// PATCH /api/templates/[id]/prompts - Update template prompts
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json<ApiError>(
        { code: 'UNAUTHORIZED', message: 'You must be logged in to update template prompts' },
        { status: 401 },
      );
    }

    const templateId = params.id;
    const body = await request.json();

    // Check if template exists and is owned by user (for custom templates)
    const existingTemplate = await TemplateService.getById(templateId);
    if (!existingTemplate) {
      return NextResponse.json<ApiError>(
        { code: 'NOT_FOUND', message: 'Template not found or unauthorized' },
        { status: 404 },
      );
    }
    if (existingTemplate.type === 'custom' && existingTemplate.ownerId !== userId) {
      return NextResponse.json<ApiError>(
        { code: 'FORBIDDEN', message: 'You do not have permission to update this template' },
        { status: 403 },
      );
    }

    // Update only the prompts field
    const updated = await TemplateService.update(templateId, {
      prompts: {
        ...existingTemplate.prompts,
        ...body,
      },
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating template prompts:', error);
    return NextResponse.json<ApiError>(
      { code: 'INTERNAL_ERROR', message: 'Failed to update template prompts' },
      { status: 500 },
    );
  }
}
