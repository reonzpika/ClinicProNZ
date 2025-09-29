import { clerkClient } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

import { users } from '@/db/schema/users';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // Get headers and body for verification
    const id = req.headers.get('svix-id');
    const signature = req.headers.get('svix-signature');
    const timestamp = req.headers.get('svix-timestamp');
    const body = await req.text();

    // Debug: basic request diagnostics (no secrets)
    const nowSec = Math.floor(Date.now() / 1000);
    const tsNum = timestamp ? Number(timestamp) : undefined;
    console.info('[Clerk Webhook] Incoming', {
      path: '/api/webhooks/clerk-user',
      env: process.env.NODE_ENV,
      hasId: !!id,
      hasSignature: !!signature,
      hasTimestamp: !!timestamp,
      bodyLength: body.length,
      timestamp: timestamp,
      skewSeconds: typeof tsNum === 'number' && Number.isFinite(tsNum) ? nowSec - tsNum : null,
    });

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
        console.error('[Clerk Webhook] Verification failed', {
          message: err instanceof Error ? err.message : String(err),
          idPresent: !!id,
          signaturePresent: !!signature,
          timestampPresent: !!timestamp,
          secretConfigured: !!process.env.CLERK_WEBHOOK_SECRET,
          secretLength: process.env.CLERK_WEBHOOK_SECRET?.length,
        });
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    // Parse the verified body
    let parsed: any;
    try {
      parsed = JSON.parse(body);
    } catch (e) {
      console.error('[Clerk Webhook] Invalid JSON body', {
        message: e instanceof Error ? e.message : String(e),
      });
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { type, data: userData } = parsed;
    const userId = userData.id;
    const email = userData.email_addresses?.[0]?.email_address || null;

    console.info('[Clerk Webhook] Event parsed', {
      type,
      userIdPresent: !!userId,
      emailPresent: !!email,
    });

    // Initialize DB only after successful verification and parsing
    const db = getDb();

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

// Lightweight reachability check for debugging
export async function GET() {
  try {
    console.info('[Clerk Webhook] Ping');
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
