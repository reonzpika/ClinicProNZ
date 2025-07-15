import { auth } from '@clerk/nextjs/server';

import type { UserTier } from './roles';
import { TIER_HIERARCHY } from './roles';

// Re-export UserTier for server-side use
export type { UserTier };

/**
 * Get the current user's tier from their session claims
 */
export async function getCurrentTier(): Promise<UserTier> {
  try {
    const { sessionClaims, userId } = await auth();

    // No session = basic tier (public user)
    if (!userId) {
      return 'basic';
    }

    // Get tier from session claims metadata
    const tier = (sessionClaims as any)?.metadata?.tier;

    return tier || 'basic';
  } catch (error) {
    console.error('Error getting user tier:', error);
    // Fall back to basic for safety
    return 'basic';
  }
}

/**
 * Check if current user has the specified tier or higher
 */
export async function hasTier(requiredTier: UserTier): Promise<boolean> {
  const currentTier = await getCurrentTier();
  const currentIndex = TIER_HIERARCHY.indexOf(currentTier);
  const requiredIndex = TIER_HIERARCHY.indexOf(requiredTier);

  return currentIndex >= requiredIndex;
}

/**
 * Check if current user has exactly the specified tier
 */
export async function hasExactTier(tier: UserTier): Promise<boolean> {
  const currentTier = await getCurrentTier();
  return currentTier === tier;
}

/**
 * Check if current user can access admin features
 */
export async function isAdmin(): Promise<boolean> {
  return await hasExactTier('admin');
}

/**
 * Check if current user can access premium features
 */
export async function isPremiumOrHigher(): Promise<boolean> {
  return await hasTier('premium');
}

/**
 * Check if current user can access standard features
 */
export async function isStandardOrHigher(): Promise<boolean> {
  return await hasTier('standard');
}
