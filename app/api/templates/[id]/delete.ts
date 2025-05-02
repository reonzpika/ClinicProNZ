import { NextResponse } from 'next/server';
import { TemplateService } from '@/features/templates/template-service';
import { checkApiAuth } from '@/shared/services/auth/api-auth';
import type { ApiError } from '@/features/templates/types';

// DELETE /api/templates/[id] - Delete a template
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = checkApiAuth();
    if (userId instanceof NextResponse) return userId;

    await TemplateService.delete(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json<ApiError>(
      { code: 'INTERNAL_ERROR', message: 'Failed to delete template' },
      { status: 500 }
    );
  }
} 