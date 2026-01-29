import { clerkClient } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { imageToolMobileLinks, users } from '@/db/schema';

export const runtime = 'nodejs';

/**
 * POST /api/referral-images/signup
 *
 * Create account and generate permanent links for GP Referral Images
 *
 * Request body:
 * - email: string (required)
 * - name?: string (optional)
 *
 * Response:
 * - userId: string
 * - desktopLink: string
 * - mobileLink: string
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if email already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let userId: string;

    if (existingUser.length > 0) {
      // User already exists, return existing userId
      userId = existingUser[0].id;
    } else {
      // Create Clerk user
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.createUser({
        emailAddress: [email],
        ...(name && {
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
        }),
      });

      userId = clerkUser.id;

      // Insert into database
      await db.insert(users).values({
        id: userId,
        email: email,
        imageTier: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Generate or get existing mobile token
    const existingToken = await db
      .select({ token: imageToolMobileLinks.token })
      .from(imageToolMobileLinks)
      .where(eq(imageToolMobileLinks.userId, userId))
      .limit(1);

    let token: string;
    if (existingToken.length > 0) {
      token = existingToken[0].token;
    } else {
      // Generate new token
      token = nanoid(12);
      await db.insert(imageToolMobileLinks).values({
        userId,
        token,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Generate permanent links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.app';
    const desktopLink = `${baseUrl}/referral-images/desktop?u=${userId}`;
    const mobileLink = `${baseUrl}/referral-images/capture?token=${token}`;

    // Send welcome email (don't block on email failure)
    try {
      const { sendWelcomeEmail } = await import('@/src/lib/services/referral-images/email-service');
      await sendWelcomeEmail({
        email,
        name: name || email.split('@')[0],
        userId,
      });
    } catch (emailError) {
      console.error('[referral-images/signup] Failed to send welcome email:', emailError);
      // Don't fail signup if email fails
    }

    return NextResponse.json({
      userId,
      desktopLink,
      mobileLink,
    });
  } catch (error) {
    console.error('[referral-images/signup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
