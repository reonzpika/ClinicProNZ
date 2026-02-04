import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { imageToolMobileLinks, users } from '@/db/schema';

export const runtime = 'nodejs';

/**
 * POST /api/referral-images/send-mobile-link
 *
 * Send mobile link to user's email via Resend
 * Requires authentication - user can only send to their own email
 *
 * Request body:
 * - userId: string (required)
 *
 * Response:
 * - success: boolean
 */
export async function POST(req: NextRequest) {
  console.log('[referral-images/send-mobile-link] POST request received at:', new Date().toISOString());
  
  try {
    const body = await req.json();
    const { userId } = body;

    console.log('[referral-images/send-mobile-link] Request body:', { userId });

    if (!userId || typeof userId !== 'string') {
      console.log('[referral-images/send-mobile-link] Invalid userId provided');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Get user email
    const [user] = await db
      .select({ email: users.email, id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      console.log('[referral-images/send-mobile-link] User not found:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[referral-images/send-mobile-link] User found:', { userId, email: user.email });

    if (!user.email) {
      console.log('[referral-images/send-mobile-link] User has no email address:', userId);
      return NextResponse.json(
        { error: 'User has no email address' },
        { status: 400 }
      );
    }

    // Get mobile token
    const [mobileLink] = await db
      .select({ token: imageToolMobileLinks.token })
      .from(imageToolMobileLinks)
      .where(eq(imageToolMobileLinks.userId, userId))
      .limit(1);

    if (!mobileLink) {
      console.log('[referral-images/send-mobile-link] Mobile link not found for user:', userId);
      return NextResponse.json(
        { error: 'Mobile link not found' },
        { status: 404 }
      );
    }

    console.log('[referral-images/send-mobile-link] Mobile link found, sending email');

    // Send email
    try {
      const { sendMobileLinkEmail } = await import(
        '@/src/lib/services/referral-images/email-service'
      );
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clinicpro.co.nz';
      const mobileLinkUrl = `${baseUrl}/referral-images/capture?u=${userId}`;
      const desktopLinkUrl = `${baseUrl}/referral-images/desktop?u=${userId}`;
      
      const emailResult = await sendMobileLinkEmail({
        email: user.email,
        mobileLink: mobileLinkUrl,
        desktopLink: desktopLinkUrl,
        userId,
      });

      console.log('[referral-images/send-mobile-link] Email sent successfully:', {
        emailId: emailResult?.data?.id,
        to: user.email,
      });

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
      });
    } catch (emailError: any) {
      console.error('[referral-images/send-mobile-link] Failed to send email:', {
        error: emailError.message,
        stack: emailError.stack,
        fullError: JSON.stringify(emailError, null, 2),
      });
      
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[referral-images/send-mobile-link] Error:', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Failed to send mobile link' },
      { status: 500 }
    );
  }
}
