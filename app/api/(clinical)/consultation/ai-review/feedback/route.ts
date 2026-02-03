import { NextResponse } from 'next/server';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { getDb } from 'database/client';
import { aiSuggestions } from '@/db/schema';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { feedback, reviewType, sessionId } = body;

    if (!feedback || !['helpful', 'not_helpful'].includes(feedback)) {
      return NextResponse.json({ error: 'Invalid feedback type' }, { status: 400 });
    }

    const context = await extractRBACContext(req);
    if (!context.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const recentSuggestion = await db
      .select()
      .from(aiSuggestions)
      .where(
        and(
          eq(aiSuggestions.userId, context.userId),
          eq(aiSuggestions.reviewType, reviewType),
          sessionId ? eq(aiSuggestions.sessionId, sessionId) : isNull(aiSuggestions.sessionId),
          isNull(aiSuggestions.userFeedback),
        ),
      )
      .orderBy(desc(aiSuggestions.createdAt))
      .limit(1);

    const first = recentSuggestion[0];
    if (!first) {
      return NextResponse.json({ error: 'No recent suggestion found' }, { status: 404 });
    }

    await db
      .update(aiSuggestions)
      .set({ userFeedback: feedback })
      .where(eq(aiSuggestions.id, first.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback save error:', error);
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }
}
