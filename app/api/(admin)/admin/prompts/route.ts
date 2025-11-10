import { getDb } from 'database/client';
import { and, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { promptRollouts, promptVersions, users } from '@/db/schema';
import { PromptOverridesService } from '@/src/features/prompts/prompt-overrides-service';
import { extractRBACContext } from '@/src/lib/rbac-enforcer';

function ensureAdmin(context: any) {
  const isAdmin = context?.tier === 'admin';
  if (!isAdmin) {
    throw new Error('Admin access required');
  }
}

export async function GET(req: Request) {
  try {
    const context = await extractRBACContext(req);
    ensureAdmin(context);

    const db = getDb();

    const versions = await db.select().from(promptVersions).orderBy(desc(promptVersions.versionNumber));

    // Resolve active rollouts
    const selfRollout = context.userId
      ? await db
          .select({ versionId: promptRollouts.versionId })
          .from(promptRollouts)
          .where(and(eq(promptRollouts.scope, 'self'), eq(promptRollouts.userId, context.userId!)))
          .orderBy(desc(promptRollouts.createdAt))
          .limit(1)
      : [];

    const globalRollout = await db
      .select({ versionId: promptRollouts.versionId })
      .from(promptRollouts)
      .where(eq(promptRollouts.scope, 'global'))
      .orderBy(desc(promptRollouts.createdAt))
      .limit(1);

    return NextResponse.json({
      versions,
      activeSelfVersionId: selfRollout?.[0]?.versionId || null,
      activeGlobalVersionId: globalRollout?.[0]?.versionId || null,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Failed to fetch prompt settings' }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const context = await extractRBACContext(req);
    ensureAdmin(context);

    const db = getDb();
    const body = await req.json();

    if (body.action === 'createVersion') {
      const { systemText, userText, rating, feedback } = body;

      // Validation
      if (typeof systemText !== 'string' || typeof userText !== 'string') {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
      }
      if (!systemText.includes('{{TEMPLATE}}')) {
        return NextResponse.json({ error: 'System override must include {{TEMPLATE}}' }, { status: 400 });
      }
      if (!userText.includes('{{DATA}}')) {
        return NextResponse.json({ error: 'User override must include {{DATA}}' }, { status: 400 });
      }
      if (systemText.length > 16000 || userText.length > 16000) {
        return NextResponse.json({ error: 'Prompt text too long (16k max)' }, { status: 400 });
      }

      // Compute next available (fills gaps)
      const rows = await db.select({ v: promptVersions.versionNumber }).from(promptVersions).orderBy(promptVersions.versionNumber);
      let nextVersion = 1;
      for (const r of rows) {
        if (r.v === nextVersion) {
          nextVersion += 1;
        } else if ((r.v || 0) > nextVersion) {
          break; // found gap
        }
      }

      const [row] = await db
        .insert(promptVersions)
        .values({
          versionNumber: nextVersion,
          systemText,
          userText,
          rating: typeof rating === 'number' ? rating : null,
          feedback: typeof feedback === 'string' ? feedback : null,
          createdBy: context.userId || null,
        } as any)
        .returning();

      return NextResponse.json({ version: row });
    }

    if (body.action === 'updateVersion') {
      const { versionId, systemText, userText, rating, feedback } = body;
      if (!versionId) {
        return NextResponse.json({ error: 'versionId required' }, { status: 400 });
      }
      if (typeof systemText !== 'string' || typeof userText !== 'string') {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
      }
      if (!systemText.includes('{{TEMPLATE}}')) {
        return NextResponse.json({ error: 'System override must include {{TEMPLATE}}' }, { status: 400 });
      }
      if (!userText.includes('{{DATA}}')) {
        return NextResponse.json({ error: 'User override must include {{DATA}}' }, { status: 400 });
      }
      if (systemText.length > 16000 || userText.length > 16000) {
        return NextResponse.json({ error: 'Prompt text too long (16k max)' }, { status: 400 });
      }

      const [row] = await db
        .update(promptVersions)
        .set({
          systemText,
          userText,
          rating: typeof rating === 'number' ? rating : null,
          feedback: typeof feedback === 'string' ? feedback : null,
        } as any)
        .where(eq(promptVersions.id, versionId))
        .returning();
      if (!row) {
        return NextResponse.json({ error: 'Version not found' }, { status: 404 });
      }
      return NextResponse.json({ version: row });
    }

    if (body.action === 'deleteVersion') {
      const { versionId } = body;
      if (!versionId) {
        return NextResponse.json({ error: 'versionId required' }, { status: 400 });
      }
      // Remove rollouts referencing this version
      await db.delete(promptRollouts).where(eq(promptRollouts.versionId, versionId));
      // Delete the version itself
      await db.delete(promptVersions).where(eq(promptVersions.id, versionId));
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'activateSelf') {
      const { versionId } = body;
      if (!versionId || !context.userId) {
        return NextResponse.json({ error: 'versionId required' }, { status: 400 });
      }

      await db.insert(users).values({ id: context.userId }).onConflictDoNothing();

      await db.insert(promptRollouts).values({
        versionId,
        scope: 'self',
        userId: context.userId,
        createdBy: context.userId,
      } as any);

      PromptOverridesService.invalidate(context.userId);
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'publishGlobal') {
      const { versionId } = body;
      if (!versionId) {
        return NextResponse.json({ error: 'versionId required' }, { status: 400 });
      }
      await db.insert(promptRollouts).values({
        versionId,
        scope: 'global',
        createdBy: context.userId || null,
      } as any);

      PromptOverridesService.invalidate(null);
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'clearSelf') {
      if (!context.userId) {
        return NextResponse.json({ error: 'Not signed in' }, { status: 400 });
      }
      // No hard delete policy; add a no-op by pointing to null is not supported.
      // Instead, we rely on precedence and time ordering; to clear, insert a sentinel rollout with invalid version? Avoid.
      // Safer: client can activate oldest base by not having a self rollout — emulate by inserting self rollout to a special empty version? We'll skip clearing and let client choose another version.
      return NextResponse.json({ error: 'Clearing self rollout not supported; activate another version instead' }, { status: 400 });
    }

    if (body.action === 'clearGlobal') {
      return NextResponse.json({ error: 'Clearing global rollout not supported; publish another version instead' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Failed to update prompt settings' }, { status: 400 });
  }
}
