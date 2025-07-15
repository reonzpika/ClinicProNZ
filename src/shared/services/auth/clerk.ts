import { auth } from '@clerk/nextjs/server';

import { getCurrentTier, hasTier, type UserTier } from '@/src/shared/utils/roles-server';

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

/**
 * Get authentication information (alias for auth function)
 */
export const getAuth = auth;
