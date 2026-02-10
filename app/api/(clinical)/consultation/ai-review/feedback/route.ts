// app/api/(clinical)/consultation/ai-review/feedback/route.ts

import { getDb } from 'database/client';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { aiSuggestions } from '@/db/schema';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { feedback, reviewType, sessionId } = body;

    if (!feedback || !['helpful', 'not_helpful'].includes(feedback)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 },
      );
    }

    // Check authentication
    const context = await extractRBACContext(req);
    if (!context.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Update the most recent AI suggestion for this user/session/reviewType
    const db = getDb();

    // Find the most recent suggestion without feedback
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

    const row = recentSuggestion[0];
    if (!row) {
      return NextResponse.json(
        { error: 'No recent suggestion found' },
        { status: 404 },
      );
    }

    // Update the feedback
    await db
      .update(aiSuggestions)
      .set({ userFeedback: feedback })
      .where(eq(aiSuggestions.id, row.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback save error:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 },
    );
  }
}
