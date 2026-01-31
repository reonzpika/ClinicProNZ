import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { getDb } from 'database/client';
import { users } from 'database/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

/**
 * POST /api/referral-images/upgrade/checkout
 *
 * Create Stripe checkout session for GP Referral Images upgrade
 *
 * Request body:
 * - email: string (optional)
 *
 * Response:
 * - checkoutUrl: string
 */
export async function POST(req: Request) {
  try {
    // Initialize Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    // Debug: log which mode (do not log the key itself)
    console.log('[referral-images/upgrade/checkout] Stripe key mode:', stripeSecretKey?.slice(0, 7) ?? 'missing');
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY environment variable not set');
      return NextResponse.json(
        { error: 'Payment service configuration error' },
        { status: 500 },
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 },
      );
    }

    const { userId } = body;

    // Require userId
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 },
      );
    }

    const db = getDb();

    // Check if user already upgraded
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (existingUser?.imageTier === 'premium') {
      return NextResponse.json(
        { error: 'Already upgraded to premium' },
        { status: 400 },
      );
    }

    // Get price ID from environment
    const priceId = process.env.STRIPE_REFERRAL_IMAGES_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: 'Stripe price ID not configured for Referral Images' },
        { status: 500 },
      );
    }

    const origin = req.headers.get('origin') || 'https://clinicpro.co.nz';

    // Create checkout session for ONE-TIME payment
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // ONE-TIME payment (not subscription)
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      ...(existingUser?.email && { customer_email: existingUser.email }),
      success_url: `${origin}/referral-images/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/referral-images/capture?u=${userId}`,
      metadata: {
        product: 'referral_images',
        userId: userId,
      },
      payment_intent_data: {
        metadata: {
          product: 'referral_images',
          userId: userId,
        },
      },
      billing_address_collection: 'required',
      payment_method_types: ['card'],
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stripeError =
      error && typeof error === 'object' && 'type' in error
        ? { type: (error as { type: string }).type, code: (error as { code?: string }).code, message }
        : null;
    console.error('[referral-images/upgrade/checkout] Error:', message, stripeError ?? error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: stripeError?.message ?? message },
      { status: 500 },
    );
  }
}
