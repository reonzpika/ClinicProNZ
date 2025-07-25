import { NextResponse } from 'next/server';

import { extractRBACContext } from '@/src/lib/rbac-enforcer';

export async function POST(req: Request) {
  try {
    const { structuredContent, approved, editedContent } = await req.json();

    // Validate input
    if (!structuredContent) {
      return NextResponse.json({
        error: 'Missing structured content',
      }, { status: 400 });
    }

    // Only admin tier can use this endpoint
    const context = await extractRBACContext(req);
    if (context.tier !== 'admin') {
      return NextResponse.json({
        error: 'Admin access required for content approval',
      }, { status: 403 });
    }

    if (!approved) {
      return NextResponse.json({
        error: 'Content not approved',
        message: 'Admin rejected the structured content for revision',
      }, { status: 400 });
    }

    // Use edited content if provided, otherwise use original
    const finalContent = editedContent || structuredContent;

    return NextResponse.json({
      approvedContent: finalContent,
      wasEdited: !!editedContent,
      approvedAt: new Date().toISOString(),
      approvedBy: context.userId,
      originalLength: structuredContent.length,
      finalLength: finalContent.length,
    });
  } catch (error) {
    console.error('Content approval error:', error);
    return NextResponse.json({
      error: 'Approval process failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
