import { getDb } from 'database/client';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { users } from '@/db/schema';

export const runtime = 'nodejs';

/**
 * POST /api/referral-images/upgrade/webhook
 *
 * Stripe webhook handler for GP Referral Images payment events
 *
 * Handles:
 * - checkout.session.completed: Upgrade user to premium
 * - payment_intent.succeeded: Log successful payment
 * - payment_intent.failed: Log failed payment
 */
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

  const webhookSecret = process.env.STRIPE_REFERRAL_IMAGES_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (e) {
    console.error('[referral-images/webhook] Signature verification failed:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Invalid signature' },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || (session.metadata?.userId ?? null);
        const product = session.metadata?.product;

        // Only handle referral images purchase
        if (product === 'referral_images_premium' && userId) {
          const db = getDb();

          // Update user to premium tier
          await db
            .update(users)
            .set({
              imageTier: 'premium',
              stripePaymentId: session.payment_intent as string,
              upgradedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

          console.log('[referral-images/webhook] User upgraded to premium:', userId);

          // Send premium confirmation email
          try {
            const { sendPremiumConfirmationEmail } = await import('@/src/lib/services/referral-images/email-service');
            const userRow = await db
              .select({ email: users.email })
              .from(users)
              .where(eq(users.id, userId))
              .limit(1);

            const user = userRow[0];
            if (user?.email) {
              await sendPremiumConfirmationEmail({
                email: user.email,
                name: user.email.split('@')[0],
              });
            }
          } catch (emailError) {
            console.error('[referral-images/webhook] Failed to send confirmation email:', emailError);
            // Don't fail webhook if email fails
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('[referral-images/webhook] Payment succeeded:', paymentIntent.id);
        break;
      }

      default: {
        if ((event.type as string) === 'payment_intent.failed') {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.error('[referral-images/webhook] Payment failed:', paymentIntent.id, paymentIntent.last_payment_error);
          // TODO: Alert support
        } else {
          console.log('[referral-images/webhook] Unhandled event type:', event.type);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[referral-images/webhook] Error processing webhook:', error);
    // Return 200 to avoid Stripe retrying (log error instead)
    return NextResponse.json({ received: true, error: 'Processing error' });
  }
}
