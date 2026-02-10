import { clerkClient } from '@clerk/nextjs/server';
import { getDb } from 'database/client';
import { users } from 'database/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { getTierByStripePriceId } from '@/src/shared/utils/billing-config';

// Helper function to find user by Stripe customer ID
async function findUserByStripeCustomerId(customerId: string | Stripe.Customer | Stripe.DeletedCustomer): Promise<string | null> {
  const clerk = await clerkClient();
  const customerIdString = typeof customerId === 'string' ? customerId : customerId.id;

  let offset = 0;
  const limit = 100;

  while (true) {
    const users = await clerk.users.getUserList({
      limit,
      offset,
    });

    // Search through current batch
    for (const user of users.data) {
      if (user.publicMetadata?.stripeCustomerId === customerIdString) {
        return user.id;
      }
    }

    // If we got less than the limit, we've seen all users
    if (users.data.length < limit) {
      break;
    }

    offset += limit;
  }

  return null;
}

// Stripe webhook handler for billing events
export async function POST(req: Request) {
  try {
    // Initialize Stripe inside the function with proper error handling
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY environment variable not set');
      return NextResponse.json(
        { error: 'Payment service configuration error' },
        { status: 500 },
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const db = getDb();

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Parse and verify Stripe event per official docs
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 400 },
      );
    }

    const clerk = await clerkClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const clientReferenceId = session.client_reference_id;

        if (!clientReferenceId) {
          console.error('No client_reference_id in checkout session - user must be signed in');
          return NextResponse.json({ error: 'Missing user identification' }, { status: 400 });
        }

        // Handle subscription payments (AI Scribe)
        if (session.subscription) {
          try {
            await clerk.users.updateUserMetadata(clientReferenceId, {
              publicMetadata: {
                tier: 'standard',
                stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id || '',
                subscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || '',
                planName: 'Standard',
                upgradeDate: new Date().toISOString(),
              },
            });
          } catch (error) {
            console.error('Error updating user metadata:', error);
            // Don't fail the webhook for metadata update errors
          }
        }
        // Handle one-time payments (Referral Images)
        else if (session.mode === 'payment' && session.metadata?.product === 'referral_images') {
          try {
            const paymentIntentId = typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id;

            // Update database: set user to premium tier
            await db
              .update(users)
              .set({
                imageTier: 'premium',
                stripePaymentId: paymentIntentId || null,
                upgradedAt: new Date(),
              })
              .where(eq(users.id, clientReferenceId));

            console.log(`[Webhook] Referral Images upgrade completed for user ${clientReferenceId}`);
          } catch (error) {
            console.error('Error updating Referral Images user to premium:', error);
            // Don't fail the webhook for database update errors
          }
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const priceId = subscription.items.data[0]?.price.id;

        if (!priceId) {
          break;
        }

        // Find user by Stripe customer ID using fixed lookup
        const userId = await findUserByStripeCustomerId(customerId);

        if (!userId) {
          console.error('User not found for Stripe customer ID:', customerId);
          break;
        }

        const tier = getTierByStripePriceId(priceId);
        if (!tier) {
          console.error('No tier found for price ID:', priceId);
          break;
        }

        try {
          await clerk.users.updateUserMetadata(userId, {
            publicMetadata: {
              tier,
              stripeCustomerId: typeof customerId === 'string' ? customerId : customerId.id,
              subscriptionId: subscription.id,
              priceId,
              subscriptionStatus: subscription.status,
              currentPeriodEnd: subscription.items.data[0]?.current_period_end
                ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
                : new Date().toISOString(),
            },
          });
        } catch (error) {
          console.error('Error updating user metadata for subscription.created:', error);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const priceId = subscription.items.data[0]?.price.id;

        // Find user by Stripe customer ID using fixed lookup
        const userId = await findUserByStripeCustomerId(customerId);

        if (!userId) {
          console.error('User not found for Stripe customer ID:', customerId);
          break;
        }

        try {
          if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            // Downgrade to basic tier (authenticated users get basic tier, not signed_up)
            await clerk.users.updateUserMetadata(userId, {
              publicMetadata: {
                tier: 'basic',
                stripeCustomerId: typeof customerId === 'string' ? customerId : customerId.id,
                subscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                downgradedAt: new Date().toISOString(),
              },
            });
          } else if (priceId) {
            // Update to new tier based on price
            const tier = getTierByStripePriceId(priceId);
            if (tier) {
              await clerk.users.updateUserMetadata(userId, {
                publicMetadata: {
                  tier,
                  stripeCustomerId: typeof customerId === 'string' ? customerId : customerId.id,
                  subscriptionId: subscription.id,
                  priceId,
                  subscriptionStatus: subscription.status,
                  currentPeriodEnd: subscription.items.data[0]?.current_period_end
                    ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
                    : new Date().toISOString(),
                },
              });
            }
          }
        } catch (error) {
          console.error('Error updating user metadata for subscription.updated:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user by Stripe customer ID and downgrade to basic tier
        const userId = await findUserByStripeCustomerId(customerId);

        if (!userId) {
          console.error('User not found for Stripe customer ID:', customerId);
          break;
        }

        try {
          await clerk.users.updateUserMetadata(userId, {
            publicMetadata: {
              tier: 'basic',
              stripeCustomerId: typeof customerId === 'string' ? customerId : customerId.id,
              subscriptionStatus: 'canceled',
              canceledAt: new Date().toISOString(),
            },
          });
        } catch (error) {
          console.error('Error updating user metadata for subscription.deleted:', error);
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 },
    );
  }
}
