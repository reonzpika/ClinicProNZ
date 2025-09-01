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

// createAuthHeadersWithGuest removed - authentication required

/**
 * Create auth headers for FormData requests (excludes Content-Type)
 * @param userId - User ID from useAuth hook
 * @param userTier - User tier from useClerkMetadata hook or sessionClaims
 * @returns Headers object without Content-Type for FormData compatibility
 */
export function createAuthHeadersForFormData(
  userId?: string | null,
  userTier?: string,
): HeadersInit {
  const headers: HeadersInit = {};

  if (userId) {
    (headers as Record<string, string>)['x-user-id'] = userId;
  }

  if (userTier) {
    (headers as Record<string, string>)['x-user-tier'] = userTier;
  }

  // FIXED: No Content-Type header - let browser set multipart/form-data
  return headers;
}

/**
 * Create auth headers for mobile devices using mobile tokens
 * @param mobileToken - Mobile token from QR code authentication
 * @param userTier - Optional user tier if known (defaults to 'basic')
 * @returns Headers object with mobile token authentication
 */
// createAuthHeadersForMobile removed - mobile tokens deprecated

// Tier-based access control utilities
export type { UserTier } from './roles';
export { checkTierFromSessionClaims, TIER_HIERARCHY } from './roles';

// Billing and plan utilities
export { BILLING_CONFIG, getPlanByTier, getTierByStripePriceId } from './billing-config';

// Other utilities
export { LAUNCH_CONFIG } from './launch-config';
