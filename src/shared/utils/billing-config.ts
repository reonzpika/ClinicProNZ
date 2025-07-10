import type { UserRole } from './roles';

// Billing plan configuration
export const BILLING_CONFIG = {
  plans: {
    // Free plan (default for new users)
    free: {
      name: 'Free',
      price: 0,
      role: 'signed_up' as UserRole,
      stripePriceId: null, // No Stripe involvement for free
      features: [
        'Basic templates',
        'Up to 20 requests/day',
        'Email support',
      ],
    },

    // Paid plans mapped to Stripe Price IDs
    standard: {
      name: 'Standard',
      price: 89,
      role: 'standard' as UserRole,
      stripePriceId: process.env.STRIPE_STANDARD_PRICE_ID, // Set in .env
      features: [
        'Up to 1000 requests/day',
        'All templates',
        'Real-time transcription',
        'AI-generated notes',
        'Priority support',
      ],
    },

    // Admin is manually assigned, not purchased
    admin: {
      name: 'Admin',
      price: 0,
      role: 'admin' as UserRole,
      stripePriceId: null,
      features: [
        'All standard features',
        'Admin dashboard',
        'User management',
        'System analytics',
        'No usage limits',
      ],
    },
  },

} as const;

/**
 * Get plan configuration by role
 */
export function getPlanByRole(role: UserRole) {
  return Object.values(BILLING_CONFIG.plans).find(plan => plan.role === role);
}

/**
 * Get role by Stripe price ID
 */
export function getRoleByStripePriceId(priceId: string): UserRole | null {
  const plan = Object.values(BILLING_CONFIG.plans).find(
    plan => plan.stripePriceId === priceId,
  );
  return plan?.role || null;
}
