import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Create auth headers for API requests to work with serverless-safe endpoints
 * @param userId - User ID from useAuth hook
 * @param userTier - User tier from useClerkMetadata hook or sessionClaims
 * @returns Headers object with auth information
 */
export function createAuthHeaders(userId?: string | null, userTier?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (userId) {
    headers['x-user-id'] = userId;
  }

  if (userTier) {
    headers['x-user-tier'] = userTier;
  }

  return headers;
}

/**
 * Create auth headers with optional guest token support
 * @param userId - User ID from useAuth hook
 * @param userTier - User tier from useClerkMetadata hook or sessionClaims
 * @param guestToken - Guest token for non-authenticated users
 * @returns Headers object with auth information
 */
export function createAuthHeadersWithGuest(
  userId?: string | null,
  userTier?: string,
  guestToken?: string | null,
): HeadersInit {
  const headers = createAuthHeaders(userId, userTier);

  if (guestToken && !userId) {
    (headers as Record<string, string>)['x-guest-token'] = guestToken;
  }

  return headers;
}

// Tier-based access control utilities
export type { UserTier } from './roles';
export { checkTierFromSessionClaims, TIER_HIERARCHY } from './roles';

// Billing and plan utilities
export { BILLING_CONFIG, getPlanByTier, getTierByStripePriceId } from './billing-config';

// Other utilities
export { LAUNCH_CONFIG } from './launch-config';
