import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { BILLING_CONFIG } from '@/src/shared/utils/billing-config';

export async function POST(req: Request) {
  // Validate request method (though Next.js handles this)
  if (req.method && req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 },
    );
  }

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
      apiVersion: '2025-06-30.basil', // Use latest stable version
    });

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 },
      );
    }

    const { email } = body;
    const { userId: authUserId } = await auth();

    // Require authenticated user (since public users sign up first)
    if (!authUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }

    const standardPlan = BILLING_CONFIG.plans.standard;
    if (!standardPlan.stripePriceId) {
      return NextResponse.json(
        { error: 'Stripe price ID not configured for Standard plan' },
        { status: 500 },
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: standardPlan.stripePriceId,
          quantity: 1,
        },
      ],
      discounts: [
        {
          coupon: 'hS2CN99E', // ← Use the coupon ID for $30 first 15 GPs discount
        },
      ],
      client_reference_id: authUserId,
      customer_email: email,
      success_url: `${req.headers.get('origin')}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/consultation`,
      metadata: {
        plan: 'standard',
        couponApplied: 'hS2CN99E',
      },
      billing_address_collection: 'required',
      payment_method_types: ['card'],
      subscription_data: {
        metadata: {
          plan: 'standard',
          userId: authUserId,
          couponApplied: 'hS2CN99E',
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
