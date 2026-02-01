import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

import { imageToolMobileLinks, users } from '@/db/schema';

export const runtime = 'nodejs';

/**
 * POST /api/referral-images/setup
 *
 * Ensures the signed-in user has referral-images setup (users row + mobile link).
 * Used when a logged-in user clicks "Get Started" on the landing page.
 * Response: { userId, desktopLink, mobileLink } (same shape as signup).
 */
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser) {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      const email =
        clerkUser.emailAddresses[0]?.emailAddress ?? clerkUser.id + '@clinicpro.app';
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || undefined;

      await db.insert(users).values({
        id: userId,
        email,
        imageTier: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      try {
        const { sendWelcomeEmail } = await import(
          '@/src/lib/services/referral-images/email-service'
        );
        await sendWelcomeEmail({
          email,
          name: name || email.split('@')[0],
          userId,
        });
      } catch (emailError) {
        console.error('[referral-images/setup] Failed to send welcome email:', emailError);
      }
    }

    const [existingLink] = await db
      .select({ token: imageToolMobileLinks.token })
      .from(imageToolMobileLinks)
      .where(eq(imageToolMobileLinks.userId, userId))
      .limit(1);

    let token: string;
    if (existingLink) {
      token = existingLink.token;
    } else {
      token = nanoid(12);
      await db.insert(imageToolMobileLinks).values({
        userId,
        token,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.app';
    const desktopLink = `${baseUrl}/referral-images/desktop?u=${userId}`;
    const mobileLink = `${baseUrl}/referral-images/capture?token=${token}`;

    return NextResponse.json({
      userId,
      desktopLink,
      mobileLink,
    });
  } catch (error) {
    console.error('[referral-images/setup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to complete setup' },
      { status: 500 }
    );
  }
}
