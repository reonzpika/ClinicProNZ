import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

import { db } from '@/db/client';
import { users } from '@/db/schema/users';

export async function POST(req: Request) {
  try {
    // Get headers and body for verification
    const signature = req.headers.get('svix-signature');
    const timestamp = req.headers.get('svix-timestamp');
    const body = await req.text();

    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.CLERK_WEBHOOK_SECRET) {
        console.error('Missing CLERK_WEBHOOK_SECRET');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
      }

      if (!signature || !timestamp) {
        console.error('Missing webhook headers');
        return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 });
      }

      try {
        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        wh.verify(body, {
          'svix-signature': signature,
          'svix-timestamp': timestamp,
        });
      } catch (err) {
        console.error('Webhook verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    // Parse the verified body
    const { type, data: userData } = JSON.parse(body);
    const userId = userData.id;
    const email = userData.email_addresses?.[0]?.email_address;

    if (!userId || !email) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Missing user id or email' }, { status: 400 });
    }

    // Handle user creation event
    if (type === 'user.created') {
      // Insert user into our database
      await db.insert(users)
        .values({ id: userId, email })
        .onConflictDoNothing();

      // Assign 'signed_up' role via Clerk metadata
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: 'signed_up',
          assignedAt: new Date().toISOString(),
        },
      });

      // Assigned 'signed_up' role to user
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling Clerk user webhook:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to sync user' }, { status: 500 });
  }
}
