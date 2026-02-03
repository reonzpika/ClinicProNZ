// app/api/(clinical)/consultation/ai-review/feedback/route.ts

import { NextResponse } from 'next/server';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';
import { getDb } from 'database/client';
import { aiSuggestions } from '@/db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { feedback, reviewType, sessionId } = body;

    if (!feedback || !['helpful', 'not_helpful'].includes(feedback)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 }
      );
    }

    // Check authentication
    const context = await extractRBACContext(req);
    if (!context.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
          isNull(aiSuggestions.userFeedback)
        )
      )
      .orderBy(desc(aiSuggestions.createdAt))
      .limit(1);

    if (recentSuggestion.length === 0) {
      return NextResponse.json(
        { error: 'No recent suggestion found' },
        { status: 404 }
      );
    }

    // Update the feedback
    await db
      .update(aiSuggestions)
      .set({ userFeedback: feedback })
      .where(eq(aiSuggestions.id, recentSuggestion[0].id));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Feedback save error:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}
