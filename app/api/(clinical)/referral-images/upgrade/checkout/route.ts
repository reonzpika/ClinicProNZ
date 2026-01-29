import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

/**
 * POST /api/referral-images/upgrade/checkout
 *
 * Create Stripe checkout session for GP Referral Images upgrade
 *
 * Request body:
 * - userId: string
 * - email: string
 *
 * Response:
 * - checkoutUrl: string
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { email } = body;

    const stripe = new Stripe(stripeSecretKey);
    const origin = req.headers.get('origin') || 'https://clinicpro.co.nz';

    // Use environment variable for price ID, or create inline
    const priceId = process.env.STRIPE_REFERRAL_IMAGES_PRICE_ID;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [{
            price_data: {
              currency: 'nzd',
              unit_amount: 5000, // $50 NZD
              product_data: {
                name: 'GP Referral Images - Unlimited',
                description: 'Unlimited referral images forever + all future features',
              },
            },
            quantity: 1,
          }],
      client_reference_id: userId,
      success_url: `${origin}/referral-images/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/referral-images/capture`,
      metadata: {
        product: 'referral_images_premium',
        userId,
        email: email || '',
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('[referral-images/checkout] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
