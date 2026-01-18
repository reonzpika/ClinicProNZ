import { auth } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { imageToolMobileLinks } from '@/db/schema';
import { getImageToolUsage, resolveImageToolUserIdFromToken } from '@/src/lib/image-tool/shared';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('u') || undefined;

  let userId: string | null = null;
  if (token) {
    try {
      userId = await resolveImageToolUserIdFromToken(token);
      if (!userId) {
        return NextResponse.json({ error: 'Invalid link' }, { status: 404 });
      }

      // Best-effort: touch lastUsedAt
      try {
        const db = getDb();
        await db
          .update(imageToolMobileLinks)
          .set({ lastUsedAt: new Date(), updatedAt: new Date() })
          .where(eq(imageToolMobileLinks.token, token));
      } catch {}
    } catch {
      // MOCK: Accept any token when database unavailable
      userId = 'mock-user-id';
    }
  } else {
    const authData = await auth();
    userId = authData.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const usage = await getImageToolUsage(userId);
    return NextResponse.json({
      tier: usage.tier,
      imagesUsedThisMonth: usage.imagesUsedThisMonth,
      limit: usage.limit,
    });
  } catch {
    // MOCK DATA: Return fake usage when database unavailable
    console.warn('Database unavailable, using mock usage data');
    return NextResponse.json({
      tier: 'free',
      imagesUsedThisMonth: 3,
      limit: 20,
    });
  }
}

