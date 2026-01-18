import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { users } from '@/db/schema';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey);

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_IMAGE_TOOL_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Invalid signature' },
      { status: 400 },
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id || (session.metadata?.userId ?? null);
    const product = session.metadata?.product;

    // Only handle our image tool purchase (avoid interfering with other checkout flows)
    if (product === 'image_tool_premium' && userId) {
      try {
        const db = getDb();
        await db
          .update(users)
          .set({ imageTier: 'premium', updatedAt: new Date() })
          .where(eq(users.id, userId));
      } catch (e) {
        // Do not fail webhook on DB update errors (Stripe will retry anyway)
        console.error('[Image Tool] Failed to mark premium:', e);
      }
    }
  }

  return NextResponse.json({ received: true });
}
