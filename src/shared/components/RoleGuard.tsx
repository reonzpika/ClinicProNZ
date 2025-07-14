'use client';

import type { ReactNode } from 'react';

import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import type { UserTier } from '@/src/shared/utils/roles';
import { TIER_HIERARCHY } from '@/src/shared/utils/roles';

type TierGuardProps = {
  allowedTiers: UserTier[];
  children: ReactNode;
  fallback?: ReactNode;
  requireExact?: boolean; // If true, user must have exactly one of the allowed tiers
};

/**
 * Client-side tier guard component
 */
export function TierGuard({ allowedTiers, children, fallback = null, requireExact = false }: TierGuardProps) {
  const { isLoaded, getUserTier } = useClerkMetadata();

  // Show nothing while loading
  if (!isLoaded) {
    return null;
  }

  // Get user tier from metadata, type-safe
  const userTier = getUserTier();

  // Tier hierarchy for permission checking
  const userTierIndex = TIER_HIERARCHY.indexOf(userTier);

  let hasAccess = false;

  if (requireExact) {
    // User must have exactly one of the allowed tiers
    hasAccess = allowedTiers.includes(userTier);
  } else {
    // User must have at least one of the allowed tiers (hierarchical)
    hasAccess = allowedTiers.some((tier) => {
      const requiredIndex = TIER_HIERARCHY.indexOf(tier);
      return userTierIndex >= requiredIndex;
    });
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Convenience components for common tier checks
 */
export const StandardOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <TierGuard allowedTiers={['standard']} fallback={fallback}>
    {children}
  </TierGuard>
);

export const PremiumOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <TierGuard allowedTiers={['premium']} fallback={fallback}>
    {children}
  </TierGuard>
);

export const AdminOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <TierGuard allowedTiers={['admin']} fallback={fallback}>
    {children}
  </TierGuard>
);

/**
 * Hook to get current user tier
 */
export function useUserTier(): { tier: UserTier; isLoaded: boolean } {
  const { getUserTier, isLoaded } = useClerkMetadata();

  return {
    tier: getUserTier(),
    isLoaded,
  };
}

// Export RoleGuard as alias for backward compatibility
export { TierGuard as RoleGuard };
