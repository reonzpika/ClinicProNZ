import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { TemplateService } from '@/features/templates/template-service';
import type { ApiError } from '@/features/templates/types';

// POST /api/templates - Create a new template
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json<ApiError>(
        { code: 'UNAUTHORIZED', message: 'You must be logged in to create a template' },
        { status: 401 },
      );
    }

    const body = await request.json();
    // Ensure ownerId is set for custom templates
    const templateData = {
      ...body,
      ownerId: body.type === 'custom' ? userId : undefined,
    };
    const template = await TemplateService.create(templateData);

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json<ApiError>(
      { code: 'INTERNAL_ERROR', message: 'Failed to create template' },
      { status: 500 },
    );
  }
}
