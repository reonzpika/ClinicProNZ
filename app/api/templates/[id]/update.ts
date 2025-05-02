import { NextResponse } from 'next/server';
import { TemplateService } from '@/features/templates/template-service';
import { checkApiAuth } from '@/shared/services/auth/api-auth';
import type { ApiError } from '@/features/templates/types';

// PATCH /api/templates/[id] - Update a template
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = checkApiAuth();
    if (userId instanceof NextResponse) return userId;

    const body = await request.json();
    const template = await TemplateService.update(params.id, {
      ...body,
      metadata: {
        ...body.metadata,
        lastUpdated: new Date().toISOString(),
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json<ApiError>(
      { code: 'INTERNAL_ERROR', message: 'Failed to update template' },
      { status: 500 }
    );
  }
} 