import type { UserTier } from './roles';

// Billing plan configuration
export const BILLING_CONFIG = {
  plans: {
    // Free plan (default for new users)
    free: {
      name: 'Free',
      price: 0,
      tier: 'basic' as UserTier,
      stripePriceId: null, // No Stripe involvement for free
      features: [
        'Basic templates',
        'Up to 5 core sessions/day',
        'Up to 5 premium actions/day',
        'Email support',
      ],
    },

    // Paid plans mapped to Stripe Price IDs
    standard: {
      name: 'Standard',
      price: 30, // Special discount: $30 for first 15 GPs (was $89)
      originalPrice: 89,
      tier: 'standard' as UserTier,
      stripePriceId: process.env.STRIPE_STANDARD_PRICE_ID, // Set in .env
      features: [
        'Unlimited core sessions',
        'Up to 5 premium actions/day',
        'All templates',
        'Template management',
        'Session management',
        'Real-time transcription',
        'AI-generated notes',
        'Priority support',
      ],
    },

    premium: {
      name: 'Premium',
      price: 199,
      tier: 'premium' as UserTier,
      stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID, // Set in .env
      features: [
        'All standard features',
        'Up to 100 premium actions/day',
        'Advanced clinical tools',
        'Differential diagnosis',
        'Image analysis',
        'Premium support',
      ],
    },

    // Admin is manually assigned, not purchased
    admin: {
      name: 'Admin',
      price: 0,
      tier: 'admin' as UserTier,
      stripePriceId: null,
      features: [
        'All premium features',
        'Unlimited premium actions',
        'Admin dashboard',
        'User management',
        'System analytics',
        'No usage limits',
      ],
    },
  },

} as const;

/**
 * Get plan configuration by tier
 */
export function getPlanByTier(tier: UserTier) {
  // Handle basic tier (authenticated users) - map to free plan
  if (tier === 'basic') {
    return BILLING_CONFIG.plans.free;
  }

  return Object.values(BILLING_CONFIG.plans).find(plan => plan.tier === tier);
}

/**
 * Get tier by Stripe Price ID
 */
export function getTierByStripePriceId(priceId: string): UserTier | null {
  const plan = Object.values(BILLING_CONFIG.plans).find(p => p.stripePriceId === priceId);
  return plan?.tier || null;
}
