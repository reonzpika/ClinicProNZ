'use client';

import { useAuth } from '@clerk/nextjs';

import type { UserTier } from '@/src/lib/rbac-enforcer';

import { useClerkMetadata } from './useClerkMetadata';

export type FeaturePermission = 'sessionManagement' | 'templateManagement' | 'premiumActions';

/**
 * Custom hook for role-based access control (RBAC) in UI components
 */
export function useRBAC() {
  const { isSignedIn } = useAuth();
  const { getUserRole } = useClerkMetadata();

  // Determine user tier based on Clerk metadata
  const getUserTier = (): UserTier => {
    if (!isSignedIn) {
      return 'basic';
    }
    const userRole = getUserRole();
    switch (userRole) {
      case 'admin':
        return 'admin'; // Admin users get admin tier features
      case 'standard':
        return 'standard';
      case 'signed_up':
      case 'public':
      default:
        return 'basic';
    }
  };

  // Check if user has access to specific features
  const hasFeatureAccess = (feature: FeaturePermission): boolean => {
    const tier = getUserTier();

    switch (feature) {
      case 'sessionManagement':
        // Only standard/admin tiers have session management
        return tier === 'standard' || tier === 'admin';
      case 'templateManagement':
        // Only standard/admin tiers have template management
        return tier === 'standard' || tier === 'admin';
      case 'premiumActions':
        // All tiers have some premium actions (but limits vary)
        return true;
      default:
        return false;
    }
  };

  // Check if user has unlimited access to core features
  const hasUnlimitedAccess = (): boolean => {
    const tier = getUserTier();
    return tier === 'standard' || tier === 'admin';
  };

  // Check if user should see upgrade prompts
  const shouldShowUpgrade = (): boolean => {
    return getUserTier() === 'basic';
  };

  return {
    isSignedIn,
    tier: getUserTier(),
    hasFeatureAccess,
    hasUnlimitedAccess,
    shouldShowUpgrade,
  };
}
