import { NextResponse } from 'next/server';

import { TemplateService } from '@/features/templates/template-service';
import type { ApiError } from '@/features/templates/types';
import { checkApiAuth } from '@/shared/services/auth/api-auth';

// GET /api/templates - List all templates
export async function GET() {
  try {
    const userId = checkApiAuth();
    if (userId instanceof NextResponse) {
      return userId;
    }

    const templates = await TemplateService.list(userId);
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error listing templates:', error);
    return NextResponse.json<ApiError>(
      { code: 'INTERNAL_ERROR', message: 'Failed to list templates' },
      { status: 500 },
    );
  }
}
