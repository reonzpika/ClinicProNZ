import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const origin = req.headers.get('origin') || 'https://clinicpro.co.nz';

  const priceId = process.env.STRIPE_IMAGE_TOOL_PRICE_ID;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: priceId
      ? [{ price: priceId, quantity: 1 }]
      : [{
          price_data: {
            currency: 'nzd',
            unit_amount: 5000,
            product_data: { name: 'Photo Tool Premium' },
          },
          quantity: 1,
        }],
    client_reference_id: userId,
    success_url: `${origin}/image/app?upgraded=true`,
    cancel_url: `${origin}/image/upgrade`,
    metadata: {
      product: 'image_tool_premium',
      userId,
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }

  return NextResponse.json({ checkoutUrl: session.url });
}

