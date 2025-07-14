'use client';

import { useRoleTestingContext } from '@/src/shared/contexts/RoleTestingContext';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import type { UserTier } from '@/src/shared/utils/roles';

/**
 * Hook to get current user tier with testing support
 */
export function useTier(): {
  tier: UserTier;
  isLoading: boolean;
  realTier: UserTier | null;
} {
  const { isLoaded, getUserTier } = useClerkMetadata();
  const { testingTier } = useRoleTestingContext();

  const realTier = getUserTier();

  return {
    tier: testingTier || realTier,
    isLoading: !isLoaded,
    realTier: testingTier ? realTier : null,
  };
}

/**
 * Hook for checking if user has a specific tier or higher
 * Uses the effective tier (testing tier if active)
 */
export function useHasTier(requiredTier: UserTier): boolean {
  const { tier, isLoading } = useTier();

  if (isLoading) {
    return false;
  }

  const tierHierarchy: UserTier[] = ['basic', 'standard', 'premium', 'admin'];
  const userTierIndex = tierHierarchy.indexOf(tier);
  const requiredTierIndex = tierHierarchy.indexOf(requiredTier);

  return userTierIndex >= requiredTierIndex;
}

// Export useRole as alias for backward compatibility
export const useRole = useTier;
export const useHasRole = useHasTier;
