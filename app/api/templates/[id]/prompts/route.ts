import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { TemplateService } from '@/features/templates/template-service';
import type { ApiError } from '@/features/templates/types';

// PATCH /api/templates/[id]/prompts - Update template prompts
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json<ApiError>(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const templateId = params.id;
    const body = await request.json();

    // Check if template exists and is owned by user (for custom templates)
    const existingTemplate = await TemplateService.getById(templateId);
    if (!existingTemplate) {
      return NextResponse.json<ApiError>(
        { error: 'Template not found or unauthorized' },
        { status: 404 },
      );
    }
    if (existingTemplate.type === 'custom' && existingTemplate.ownerId !== userId) {
      return NextResponse.json<ApiError>(
        { error: 'You do not have permission to update this template' },
        { status: 403 },
      );
    }

    // Update only the prompts field
    const updated = await TemplateService.update(templateId, {
      prompts: {
        ...existingTemplate.prompts,
        ...body,
      },
      updatedAt: new Date(),
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating template prompts:', error);
    return NextResponse.json(
      { error: 'Failed to update template prompts' },
      { status: 500 },
    );
  }
}
