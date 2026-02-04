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
  console.log('[referral-images/setup] POST request received at:', new Date().toISOString());
  
  try {
    const { userId } = await auth();
    console.log('[referral-images/setup] User ID from auth:', userId);
    
    if (!userId) {
      console.log('[referral-images/setup] No userId - unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    console.log('[referral-images/setup] Existing user check:', {
      userId,
      exists: !!existingUser,
    });

    let effectiveUserId: string;

    if (existingUser) {
      effectiveUserId = existingUser.id;
      console.log('[referral-images/setup] User already exists, skipping email');
    } else {
      console.log('[referral-images/setup] No row by userId - fetching from Clerk');
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      const email =
        clerkUser.emailAddresses[0]?.emailAddress ?? clerkUser.id + '@clinicpro.app';
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || undefined;

      const [existingByEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingByEmail) {
        effectiveUserId = existingByEmail.id;
        console.log('[referral-images/setup] User exists by email, reusing row:', {
          email,
          effectiveUserId,
        });
      } else {
        console.log('[referral-images/setup] Creating user in database:', {
          userId,
          email,
          name: name || '(none)',
        });
        await db.insert(users).values({
          id: userId,
          email,
          imageTier: 'free',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        effectiveUserId = userId;

        console.log('[referral-images/setup] User created, attempting to send welcome email');
        try {
          const { sendWelcomeEmail } = await import(
            '@/src/lib/services/referral-images/email-service'
          );
          console.log('[referral-images/setup] sendWelcomeEmail function imported');

          const emailResult = await sendWelcomeEmail({
            email,
            name: name || email.split('@')[0],
            userId: effectiveUserId,
          });

          console.log('[referral-images/setup] Welcome email sent successfully:', {
            emailId: emailResult?.data?.id,
          });
        } catch (emailError: unknown) {
          console.error('[referral-images/setup] Failed to send welcome email:', {
            error: emailError instanceof Error ? emailError.message : String(emailError),
            stack: emailError instanceof Error ? emailError.stack : undefined,
            fullError: JSON.stringify(emailError, null, 2),
          });
        }
      }
    }

    const [existingLink] = await db
      .select({ token: imageToolMobileLinks.token })
      .from(imageToolMobileLinks)
      .where(eq(imageToolMobileLinks.userId, effectiveUserId))
      .limit(1);

    let token: string;
    if (existingLink) {
      token = existingLink.token;
    } else {
      token = nanoid(12);
      await db.insert(imageToolMobileLinks).values({
        userId: effectiveUserId,
        token,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.app';
    const desktopLink = `${baseUrl}/referral-images/desktop?u=${effectiveUserId}`;
    const mobileLink = `${baseUrl}/referral-images/capture?token=${token}`;

    return NextResponse.json({
      userId: effectiveUserId,
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
