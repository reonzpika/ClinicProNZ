import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { TemplateService } from '@/features/templates/template-service';
import type { ApiError } from '@/features/templates/types';

// PATCH /api/templates/[id] - Update a template
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json<ApiError>(
        { code: 'UNAUTHORIZED', message: 'You must be logged in to update a template' },
        { status: 401 },
      );
    }

    const body = await request.json();
    // Only allow update if user owns the template or it's a system template
    const template = await TemplateService.getById(params.id);
    if (!template) {
      return NextResponse.json<ApiError>(
        { code: 'NOT_FOUND', message: 'Template not found' },
        { status: 404 },
      );
    }
    if (template.type === 'custom' && template.ownerId !== userId) {
      return NextResponse.json<ApiError>(
        { code: 'FORBIDDEN', message: 'You do not have permission to update this template' },
        { status: 403 },
      );
    }
    const updated = await TemplateService.update(params.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json<ApiError>(
      { code: 'INTERNAL_ERROR', message: 'Failed to update template' },
      { status: 500 },
    );
  }
}
