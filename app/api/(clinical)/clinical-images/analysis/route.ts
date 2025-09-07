import { auth } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { and, desc, eq, isNull } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { clinicalImageAnalyses } from '@/db/schema';
import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';

// GET /api/clinical-images/analysis?imageKey={key} - Get latest analysis for an image
export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    // Extract RBAC context and check authentication
    const context = await extractRBACContext(req);
    const permissionCheck = await checkCoreAccess(context);

    if (!permissionCheck.allowed) {
      return NextResponse.json({
        error: permissionCheck.reason || 'Access denied',
      }, { status: 403 });
    }

    // Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const imageKey = searchParams.get('imageKey');

    if (!imageKey) {
      return NextResponse.json({ error: 'imageKey parameter is required' }, { status: 400 });
    }

    // Get latest analysis for this image by this user
    const analyses = await db
      .select()
      .from(clinicalImageAnalyses)
      .where(
        and(
          eq(clinicalImageAnalyses.imageKey, imageKey),
          eq(clinicalImageAnalyses.userId, userId),
        ),
      )
      .orderBy(desc(clinicalImageAnalyses.analyzedAt))
      .limit(1);

    const analysis = analyses[0] || null;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error fetching image analysis:', error);
    return NextResponse.json({
      error: 'Failed to fetch analysis',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    }, { status: 500 });
  }
}

// POST /api/clinical-images/analysis - Save analysis result
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    // Extract RBAC context and check authentication
    const context = await extractRBACContext(req);
    const permissionCheck = await checkCoreAccess(context);

    if (!permissionCheck.allowed) {
      return NextResponse.json({
        error: permissionCheck.reason || 'Access denied',
      }, { status: 403 });
    }

    // Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { imageKey, prompt, result, modelUsed, sessionId } = body;

    if (!imageKey || !result) {
      return NextResponse.json({
        error: 'imageKey and result are required',
      }, { status: 400 });
    }

    // Check if analysis with same imageKey and prompt already exists
    const existingAnalyses = await db
      .select({ id: clinicalImageAnalyses.id })
      .from(clinicalImageAnalyses)
      .where(
        and(
          eq(clinicalImageAnalyses.imageKey, imageKey),
          eq(clinicalImageAnalyses.userId, userId),
          prompt
            ? eq(clinicalImageAnalyses.prompt, prompt)
            : isNull(clinicalImageAnalyses.prompt), // Handle null prompt case
        ),
      );

    let analysisId: string;

    if (existingAnalyses.length > 0 && existingAnalyses[0]) {
      // Update existing analysis
      const updateResult = await db
        .update(clinicalImageAnalyses)
        .set({
          result,
          modelUsed,
          analyzedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(clinicalImageAnalyses.id, existingAnalyses[0].id))
        .returning({ id: clinicalImageAnalyses.id });

      if (!updateResult[0]) {
        throw new Error('Failed to update analysis');
      }
      analysisId = updateResult[0].id;
    } else {
      // Create new analysis
      const insertResult = await db
        .insert(clinicalImageAnalyses)
        .values({
          imageKey,
          userId,
          sessionId: sessionId || null,
          prompt: prompt || null,
          result,
          modelUsed: modelUsed || null,
          analyzedAt: new Date(),
        })
        .returning({ id: clinicalImageAnalyses.id });

      if (!insertResult[0]) {
        throw new Error('Failed to create analysis');
      }
      analysisId = insertResult[0].id;
    }

    return NextResponse.json({
      success: true,
      analysisId,
      message: existingAnalyses.length > 0 ? 'Analysis updated' : 'Analysis saved',
    });
  } catch (error) {
    console.error('Error saving image analysis:', error);
    return NextResponse.json({
      error: 'Failed to save analysis',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    }, { status: 500 });
  }
}
