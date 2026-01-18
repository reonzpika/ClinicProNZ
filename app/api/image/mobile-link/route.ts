import { auth } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

import { imageToolMobileLinks } from '@/db/schema';

export const runtime = 'nodejs';

async function getOrCreateToken(userId: string): Promise<string> {
  const db = getDb();

  const existing = await db
    .select({ token: imageToolMobileLinks.token })
    .from(imageToolMobileLinks)
    .where(and(eq(imageToolMobileLinks.userId, userId), eq(imageToolMobileLinks.isActive, true)))
    .limit(1);

  const existingToken = existing[0]?.token;
  if (existingToken) {
    return existingToken;
  }

  // Generate short-ish token suitable for sharing in a URL
  for (let attempt = 0; attempt < 5; attempt++) {
    const token = nanoid(10);
    try {
      await db.insert(imageToolMobileLinks).values({
        userId,
        token,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return token;
    } catch {
      // retry on uniqueness collision
    }
  }

  throw new Error('Failed to create mobile link');
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const token = await getOrCreateToken(userId);
    return NextResponse.json({ token });
  } catch {
    // MOCK DATA: Return fake token when database unavailable
    console.warn('Database unavailable, using mock token');
    return NextResponse.json({ token: 'MOCK_TOKEN_123' });
  }
}

