/**
 * DELETE /api/medtech/mobile/session/[token]
 *
 * Close/delete mobile session
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { deleteMobileSession } from '@/src/lib/services/medtech/mobile-session-storage';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'token is required' },
        { status: 400 },
      );
    }

    await deleteMobileSession(token);

    return NextResponse.json({
      success: true,
      message: 'Session closed',
    });
  } catch (error) {
    console.error('[API] DELETE /api/medtech/mobile/session/[token] error:', error);
    return NextResponse.json(
      { error: 'Failed to close session' },
      { status: 500 },
    );
  }
}
