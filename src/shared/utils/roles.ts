// Define the tier hierarchy
export type UserTier = 'basic' | 'standard' | 'premium' | 'admin';

// Tier hierarchy for comparison (higher index = more permissions)
export const TIER_HIERARCHY: UserTier[] = ['basic', 'standard', 'premium', 'admin'];

/**
 * Helper function to check tier in middleware and API routes
 */
export function checkTierFromSessionClaims(sessionClaims: any, requiredTier: UserTier): boolean {
  const userTier = sessionClaims?.metadata?.tier || 'basic';
  const userIndex = TIER_HIERARCHY.indexOf(userTier);
  const requiredIndex = TIER_HIERARCHY.indexOf(requiredTier);

  return userIndex >= requiredIndex;
}
