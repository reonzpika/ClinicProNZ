import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { TemplateService } from '@/src/features/templates/template-service';
import type { ApiError } from '@/src/features/templates/types';

// GET /api/templates/[id] - Get a specific template
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
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

// PATCH /api/templates/[id] - Update a template
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    // Use same auth pattern as middleware
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json<ApiError>(
        { code: 'UNAUTHORIZED', message: 'You must be logged in to update a template' },
        { status: 401 },
      );
    }

    // Check tier - templates require at least standard (same logic as middleware)
    const userTier = (sessionClaims as any)?.metadata?.tier || 'basic';
    if (userTier === 'basic') {
      return NextResponse.json(
        {
          error: 'Template management requires Standard tier or higher',
          message: 'Upgrade to Standard to create and manage custom templates',
        },
        { status: 403 },
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

// DELETE /api/templates/[id] - Delete a template
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    // Use same auth pattern as middleware
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json<ApiError>(
        { code: 'UNAUTHORIZED', message: 'You must be logged in to delete a template' },
        { status: 401 },
      );
    }

    // Check tier - templates require at least standard (same logic as middleware)
    const userTier = (sessionClaims as any)?.metadata?.tier || 'basic';
    if (userTier === 'basic') {
      return NextResponse.json(
        {
          error: 'Template management requires Standard tier or higher',
          message: 'Upgrade to Standard to create and manage custom templates',
        },
        { status: 403 },
      );
    }

    const template = await TemplateService.getById(params.id);
    if (!template) {
      return NextResponse.json<ApiError>(
        { code: 'NOT_FOUND', message: 'Template not found' },
        { status: 404 },
      );
    }

    if (template.type === 'custom' && template.ownerId !== userId) {
      return NextResponse.json<ApiError>(
        { code: 'FORBIDDEN', message: 'You do not have permission to delete this template' },
        { status: 403 },
      );
    }

    await TemplateService.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json<ApiError>(
      { code: 'INTERNAL_ERROR', message: 'Failed to delete template' },
      { status: 500 },
    );
  }
}
