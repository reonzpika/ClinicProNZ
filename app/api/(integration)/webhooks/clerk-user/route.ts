import { clerkClient } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

import { users } from '@/db/schema/users';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const db = getDb();
    // Get headers and body for verification
    const id = req.headers.get('svix-id');
    const signature = req.headers.get('svix-signature');
    const timestamp = req.headers.get('svix-timestamp');
    const body = await req.text();

    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.CLERK_WEBHOOK_SECRET) {
        console.error('Missing CLERK_WEBHOOK_SECRET');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
      }

      if (!id || !signature || !timestamp) {
        console.error('Missing webhook headers');
        return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 });
      }

      try {
        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        wh.verify(body, {
          'svix-id': id,
          'svix-timestamp': timestamp,
          'svix-signature': signature,
        });
      } catch (err) {
        console.error('Webhook verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    // Parse the verified body
    const { type, data: userData } = JSON.parse(body);
    const userId = userData.id;
    const email = userData.email_addresses?.[0]?.email_address || null;

    // Only require userId, email is optional
    if (!userId) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Missing user id' }, { status: 400 });
    }

    // Handle user creation AND update events
    if (type === 'user.created' || type === 'user.updated') {
      // Insert or update user in our database
      await db.insert(users)
        .values({ id: userId, email })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email,
            updatedAt: new Date(),
          },
        });

      // Only assign basic tier on creation, not updates
      if (type === 'user.created') {
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            tier: 'basic',
            assignedAt: new Date().toISOString(),
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling Clerk user webhook:', error);
    return NextResponse.json({ code: 'INTERNAL_ERROR', message: 'Failed to sync user' }, { status: 500 });
  }
}
