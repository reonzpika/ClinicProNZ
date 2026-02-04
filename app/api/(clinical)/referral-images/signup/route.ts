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
  console.log('[referral-images/signup] POST request received at:', new Date().toISOString());
  
  try {
    const body = await req.json();
    const { email, name } = body;

    console.log('[referral-images/signup] Request body:', { email, name: name || '(not provided)' });

    if (!email || typeof email !== 'string') {
      console.log('[referral-images/signup] Invalid email provided');
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
    const clerk = await clerkClient();

    let userId: string;

    // Step 1: Check if user exists in Clerk first (source of truth)
    try {
      const existingClerkUsers = await clerk.users.getUserList({
        emailAddress: [email],
      });

      const existingUser = existingClerkUsers.data[0];
      if (existingUser) {
        // User exists in Clerk
        userId = existingUser.id;
        console.log('[referral-images/signup] User exists in Clerk:', userId);

        // Ensure database entry exists (sync Clerk -> DB)
        const [dbUser] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (!dbUser) {
          console.log('[referral-images/signup] Syncing Clerk user to database:', userId);
          await db.insert(users).values({
            id: userId,
            email: email,
            imageTier: 'free',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } else {
        // User doesn't exist - create new user in Clerk
        console.log('[referral-images/signup] Creating new user in Clerk:', email);
        
        try {
          const clerkUser = await clerk.users.createUser({
            emailAddress: [email],
            skipPasswordRequirement: true,
            skipPasswordChecks: true,
            ...(name && {
              firstName: name.split(' ')[0],
              lastName: name.split(' ').slice(1).join(' '),
            }),
          });

          userId = clerkUser.id;
          console.log('[referral-images/signup] Clerk user created:', userId);

          // Insert into database
          await db.insert(users).values({
            id: userId,
            email: email,
            imageTier: 'free',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log('[referral-images/signup] Database entry created:', userId);
        } catch (clerkError: any) {
          // Comprehensive error logging for diagnosis
          console.error('[referral-images/signup] Clerk API Error:', {
            status: clerkError.status,
            code: clerkError.code,
            message: clerkError.message,
            errors: clerkError.errors,
            clerkTraceId: clerkError.clerkTraceId,
            email: email,
          });

          // Return user-friendly error with details for debugging
          return NextResponse.json(
            {
              error: 'Failed to create account',
              details: clerkError.errors || clerkError.message,
              clerkTraceId: clerkError.clerkTraceId,
            },
            { status: clerkError.status || 500 }
          );
        }
      }
    } catch (clerkListError: any) {
      // Error checking for existing users
      console.error('[referral-images/signup] Clerk getUserList Error:', {
        status: clerkListError.status,
        message: clerkListError.message,
        email: email,
      });
      return NextResponse.json(
        { error: 'Failed to verify account status' },
        { status: 500 }
      );
    }

    // Generate or get existing mobile token
    const existingToken = await db
      .select({ token: imageToolMobileLinks.token })
      .from(imageToolMobileLinks)
      .where(eq(imageToolMobileLinks.userId, userId))
      .limit(1);

    const existingLink = existingToken[0];
    let token: string;
    if (existingLink) {
      token = existingLink.token;
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
    console.log('[referral-images/signup] Attempting to send welcome email to:', email);
    try {
      const { sendWelcomeEmail } = await import('@/src/lib/services/referral-images/email-service');
      console.log('[referral-images/signup] sendWelcomeEmail function imported successfully');
      
      const emailResult = await sendWelcomeEmail({
        email,
        name: name || email.split('@')[0],
        userId,
      });
      
      console.log('[referral-images/signup] Welcome email sent successfully:', {
        emailId: emailResult?.data?.id,
        to: email,
      });
    } catch (emailError: any) {
      console.error('[referral-images/signup] Failed to send welcome email:', {
        error: emailError.message,
        stack: emailError.stack,
        name: emailError.name,
        email: email,
        userId: userId,
        fullError: JSON.stringify(emailError, null, 2),
      });
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
