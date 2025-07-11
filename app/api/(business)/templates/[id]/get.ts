import { NextResponse } from 'next/server';

import { TemplateService } from '@/src/features/templates/template-service';
import type { ApiError } from '@/src/features/templates/types';
import { checkApiAuth } from '@/src/shared/services/auth/api-auth';

// GET /api/templates/[id] - Get a specific template
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const userId = checkApiAuth();
    if (userId instanceof NextResponse) {
      return userId;
    }

    const template = await TemplateService.getById(params.id);
    if (!template) {
      return NextResponse.json<ApiError>(
        { code: 'NOT_FOUND', message: 'Template not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json<ApiError>(
      { code: 'INTERNAL_ERROR', message: 'Failed to fetch template' },
      { status: 500 },
    );
  }
}
