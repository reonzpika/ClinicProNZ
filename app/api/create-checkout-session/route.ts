import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { BILLING_CONFIG } from '@/shared/utils/billing-config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil', // Use latest stable version
});

export async function POST(req: Request) {
  // Validate request method (though Next.js handles this)
  if (req.method && req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 },
    );
  }

  try {
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

    const { userId, email } = body;
    const { userId: authUserId } = await auth();

    // For signed-up users, use authenticated user ID
    // For public users, use provided email
    const clientReferenceId = authUserId || userId;
    const customerEmail = email;

    // Enhanced validation per docs recommendations
    if (!clientReferenceId && !customerEmail) {
      return NextResponse.json(
        { error: 'Either user ID or email required' },
        { status: 400 },
      );
    }

    // Validate email format if provided
    if (customerEmail && !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(customerEmail)) {
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
          coupon: 'earlydiscount', // ← Use the coupon ID, not promo code ID
        },
      ],
      client_reference_id: clientReferenceId,
      customer_email: customerEmail,
      success_url: `${req.headers.get('origin')}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/consultation`,
      metadata: {
        plan: 'standard',
        isNewUser: !authUserId ? 'true' : 'false',
        couponApplied: 'EARLYDISCOUNT',
      },
      billing_address_collection: 'required',
      payment_method_types: ['card'],
      subscription_data: {
        metadata: {
          plan: 'standard',
          userId: clientReferenceId,
          couponApplied: 'EARLYDISCOUNT',
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);

    // Enhanced error handling per docs recommendations
    if (error instanceof Error) {
      // Handle specific Stripe errors
      if (error.message.includes('No such price')) {
        return NextResponse.json(
          { error: 'Invalid price configuration' },
          { status: 400 },
        );
      }

      if (error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Payment service configuration error' },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
