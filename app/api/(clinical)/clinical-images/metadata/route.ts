import { auth } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { clinicalImageMetadata } from '@/db/schema';
import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';

function sanitizePart(part?: string): string | undefined {
  if (!part) {
 return undefined;
}
  const cleaned = part
    .replace(/[^\w -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) {
 return undefined;
}
  return cleaned.slice(0, 80);
}

export async function PATCH(req: NextRequest) {
  try {
    const db = getDb();
    const context = await extractRBACContext(req);
    const permissionCheck = await checkCoreAccess(context);
    if (!permissionCheck.allowed) {
      return NextResponse.json({ error: permissionCheck.reason || 'Access denied' }, { status: 403 });
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const imageKey = body?.imageKey as string | undefined;
    const displayNameRaw = body?.displayName as string | undefined;

    if (!imageKey || !imageKey.startsWith(`clinical-images/${userId}/`)) {
      return NextResponse.json({ error: 'Invalid imageKey' }, { status: 400 });
    }
    const displayName = sanitizePart(displayNameRaw);
    if (!displayName) {
      return NextResponse.json({ error: 'Invalid displayName' }, { status: 400 });
    }

    // Upsert single row
    const updated = await db
      .update(clinicalImageMetadata)
      .set({ displayName, updatedAt: new Date() })
      .where(eq(clinicalImageMetadata.imageKey, imageKey))
      .returning({ imageKey: clinicalImageMetadata.imageKey });

    if (!updated?.[0]) {
      await db.insert(clinicalImageMetadata).values({ imageKey, userId, sessionId: null, displayName });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error renaming image:', error);
    return NextResponse.json({ error: 'Failed to rename image' }, { status: 500 });
  }
}
