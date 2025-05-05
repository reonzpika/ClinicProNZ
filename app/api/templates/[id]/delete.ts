import { NextResponse } from 'next/server';
import { TemplateService } from '@/features/templates/template-service';
import { auth } from '@clerk/nextjs';
import type { ApiError } from '@/features/templates/types';

// DELETE /api/templates/[id] - Delete a template
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json<ApiError>(
        { code: 'UNAUTHORIZED', message: 'You must be logged in to delete a template' },
        { status: 401 }
      );
    }
    const template = await TemplateService.getById(params.id);
    if (!template) {
      return NextResponse.json<ApiError>(
        { code: 'NOT_FOUND', message: 'Template not found' },
        { status: 404 }
      );
    }
    if (template.type === 'custom' && template.ownerId !== userId) {
      return NextResponse.json<ApiError>(
        { code: 'FORBIDDEN', message: 'You do not have permission to delete this template' },
        { status: 403 }
      );
    }
    await TemplateService.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json<ApiError>(
      { code: 'INTERNAL_ERROR', message: 'Failed to delete template' },
      { status: 500 }
    );
  }
} 