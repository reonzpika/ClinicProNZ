import { auth } from '@clerk/nextjs/server';

import { getCurrentTier, type UserTier } from '@/src/shared/utils/roles';

/**
 * Server-side helper functions for Clerk authentication
 */

/**
 * Get the current user's tier
 */
export const getUserTier = async (): Promise<UserTier> => getCurrentTier();

/**
 * Check if the current user has a specific tier or higher
 */
export const checkUserTier = async (requiredTier: UserTier): Promise<boolean> => {
  const { hasTier } = await import('@/src/shared/utils/roles');
  return hasTier(requiredTier);
};

/**
 * Get the current user's authentication context
 */
export const getAuthContext = async () => {
  const { userId, sessionClaims } = await auth();
  const tier = await getCurrentTier();

  return {
    userId,
    tier,
    isAuthenticated: !!userId,
    sessionClaims,
  };
};
