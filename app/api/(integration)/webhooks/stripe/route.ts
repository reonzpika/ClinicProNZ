import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { getRoleByStripePriceId } from '@/src/shared/utils/billing-config';

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

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-06-30.basil',
    });

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

    // Processing Stripe webhook event

    const clerk = await clerkClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const clientReferenceId = session.client_reference_id;
        const customerEmail = session.customer_details?.email;
        const isNewUser = session.metadata?.isNewUser === 'true';

        if (!clientReferenceId && !customerEmail) {
          // No client_reference_id or customer email in checkout session
          return NextResponse.json({ error: 'Missing user identification' }, { status: 400 });
        }

        // Get the subscription to find the price ID
        if (session.subscription) {
          // Processing successful checkout

          let userId: string | null = clientReferenceId;

          // Handle new user creation
          if (isNewUser && customerEmail && !clientReferenceId) {
            try {
              // Check if user already exists with this email
              const existingUsers = await clerk.users.getUserList({
                emailAddress: [customerEmail],
              });

              if (existingUsers.data.length > 0) {
                // User exists, use existing user ID
                userId = existingUsers.data[0]!.id;
                // Found existing user with email
              } else {
                // Create new user
                const newUser = await clerk.users.createUser({
                  emailAddress: [customerEmail],
                  publicMetadata: {
                    role: 'standard',
                    stripeCustomerId: typeof customerId === 'string' ? customerId : customerId?.id || '',
                    subscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || '',
                    planName: 'Standard',
                    upgradeDate: new Date().toISOString(),
                    emailVerified: false, // Will need email verification
                  },
                  skipPasswordRequirement: true, // User will set password on first login
                });

                userId = newUser.id;
                // Created new user with email
              }
            } catch {
              // Error creating/finding user
              return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
            }
          }

          // Update user metadata for both new and existing users
          if (userId) {
            await clerk.users.updateUserMetadata(userId, {
              publicMetadata: {
                role: 'standard',
                stripeCustomerId: typeof customerId === 'string' ? customerId : customerId?.id || '',
                subscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || '',
                planName: 'Standard',
                upgradeDate: new Date().toISOString(),
              },
            });

            // Updated user to 'standard' role
          }
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const priceId = subscription.items.data[0]?.price.id;

        if (!priceId) {
          // No price ID found in subscription
          break;
        }

        // Find user by Stripe customer ID
        const users = await clerk.users.getUserList({
          limit: 1,
        });

        // Find the user with this Stripe customer ID
        let userId: string | null = null;
        for (const user of users.data) {
          if (user.publicMetadata?.stripeCustomerId === customerId) {
            userId = user.id;
            break;
          }
        }

        if (!userId) {
          // No user found for Stripe customer
          break;
        }

        const role = getRoleByStripePriceId(priceId);
        if (!role) {
          // No role mapping found for price ID
          break;
        }

        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            role,
            stripeCustomerId: typeof customerId === 'string' ? customerId : customerId?.id || '',
            subscriptionId: subscription.id,
            priceId,
            subscriptionStatus: subscription.status,
            currentPeriodEnd: subscription.items.data[0]?.current_period_end
              ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
              : new Date().toISOString(),
          },
        });

        // Updated user role via subscription
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const priceId = subscription.items.data[0]?.price.id;

        // Find user by Stripe customer ID
        const users = await clerk.users.getUserList({
          limit: 1,
        });

        let userId: string | null = null;
        for (const user of users.data) {
          if (user.publicMetadata?.stripeCustomerId === customerId) {
            userId = user.id;
            break;
          }
        }

        if (!userId) {
          // No user found for Stripe customer
          break;
        }

        if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          // Downgrade to free tier
          await clerk.users.updateUserMetadata(userId, {
            publicMetadata: {
              role: 'signed_up',
              stripeCustomerId: typeof customerId === 'string' ? customerId : customerId?.id || '',
              subscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              downgradedAt: new Date().toISOString(),
            },
          });

          // Downgraded user to 'signed_up' role due to subscription status
        } else if (priceId) {
          // Update to new role based on price
          const role = getRoleByStripePriceId(priceId);
          if (role) {
            await clerk.users.updateUserMetadata(userId, {
              publicMetadata: {
                role,
                stripeCustomerId: typeof customerId === 'string' ? customerId : customerId?.id || '',
                subscriptionId: subscription.id,
                priceId,
                subscriptionStatus: subscription.status,
                currentPeriodEnd: subscription.items.data[0]?.current_period_end
                  ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
                  : new Date().toISOString(),
              },
            });

            // Updated user role via subscription update
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user by Stripe customer ID and downgrade to free tier
        const users = await clerk.users.getUserList({
          limit: 1,
        });

        let userId: string | null = null;
        for (const user of users.data) {
          if (user.publicMetadata?.stripeCustomerId === customerId) {
            userId = user.id;
            break;
          }
        }

        if (userId) {
          await clerk.users.updateUserMetadata(userId, {
            publicMetadata: {
              role: 'signed_up',
              stripeCustomerId: typeof customerId === 'string' ? customerId : customerId?.id || '',
              subscriptionStatus: 'canceled',
              canceledAt: new Date().toISOString(),
            },
          });

          // Downgraded user to 'signed_up' role due to subscription cancellation
        }
        break;
      }

      default:
        // Unhandled event type received
    }

    return NextResponse.json({ received: true });
  } catch {
    // Stripe webhook error occurred
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}
