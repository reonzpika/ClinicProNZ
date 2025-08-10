import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '@/db/client';
import { users } from '@/db/schema';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

// PUT - Persist the user's current session selection for mobile fallback
export async function PUT(req: NextRequest) {
  try {
    const context = await extractRBACContext(req);
    const { userId } = context;

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    await db.update(users).set({ currentSessionId: sessionId }).where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating current session:', error);
    return NextResponse.json({ error: 'Failed to update current session' }, { status: 500 });
  }
}


