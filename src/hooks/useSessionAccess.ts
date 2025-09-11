import { useAuth } from '@clerk/nextjs';

import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';

/**
 * Hook to check if user has access to session management features
 * Returns whether user can view session history (requires Standard+ tier)
 */
export function useSessionAccess() {
  const { isSignedIn } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();

  // Session history available for all authenticated users
  const hasSessionHistoryAccess = isSignedIn;

  // Active session management (creating sessions during consultation) is available for all authenticated users
  const hasActiveSessionAccess = isSignedIn;

  return {
    hasSessionHistoryAccess,
    hasActiveSessionAccess,
    userTier,
    isSignedIn,
  };
}
