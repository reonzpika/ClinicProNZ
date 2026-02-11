import { clerkClient } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
const NEWSLETTER_KEY = 'inbox-management';

/**
 * POST /api/inbox-management/subscribe
 *
 * Public route. Adds email as a Clerk user with newsletter metadata so they
 * appear in Clerk Dashboard as inbox-management (Inbox Intelligence) waitlist signups.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim() : '';

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 },
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }

    const clerk = await clerkClient();

    const existing = await clerk.users.getUserList({
      emailAddress: [email],
    });

    const existingUser = existing.data[0];

    if (existingUser) {
      const existingMetadata = (existingUser.publicMetadata || {}) as Record<string, unknown>;
      if (existingMetadata.newsletter !== NEWSLETTER_KEY) {
        await clerk.users.updateUserMetadata(existingUser.id, {
          publicMetadata: {
            ...existingMetadata,
            newsletter: NEWSLETTER_KEY,
          },
        });
      }
      return NextResponse.json(
        { success: true, message: "You're already on the list." },
        { status: 200 },
      );
    }

    await clerk.users.createUser({
      emailAddress: [email],
      skipPasswordRequirement: true,
      publicMetadata: { newsletter: NEWSLETTER_KEY },
    });

    return NextResponse.json(
      { success: true, message: 'Subscribed.' },
      { status: 200 },
    );
  } catch (err) {
    console.error('[inbox-management/subscribe] Error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
