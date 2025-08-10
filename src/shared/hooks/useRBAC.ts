'use client';

import { useAuth } from '@clerk/nextjs';

import { useClerkMetadata } from './useClerkMetadata';

type FeaturePermission = 'sessionManagement' | 'templateManagement' | 'premiumActions';

/**
 * Custom hook for tier-based access control (RBAC) in UI components
 */
export function useRBAC() {
  const { isSignedIn } = useAuth();
  const { getUserTier } = useClerkMetadata();

  // Get user tier directly from Clerk metadata
  const tier = getUserTier();

  // Check if user has access to specific features
  const hasFeatureAccess = (feature: FeaturePermission): boolean => {
    switch (feature) {
      case 'sessionManagement':
        // Only standard/premium/admin tiers have session management
        return tier === 'standard' || tier === 'premium' || tier === 'admin';
      case 'templateManagement':
        // Basic and above have template management (must be signed in at UI usage sites)
        return tier === 'basic' || tier === 'standard' || tier === 'premium' || tier === 'admin';
      case 'premiumActions':
        // All tiers have some premium actions (but limits vary)
        return true;
      default:
        return false;
    }
  };

  // Check if user has unlimited access to core features
  const hasUnlimitedAccess = (): boolean => {
    return tier === 'standard' || tier === 'premium' || tier === 'admin';
  };

  // Check if user should see upgrade prompts
  const shouldShowUpgrade = (): boolean => {
    return tier === 'basic';
  };

  // Check if user has premium tier features
  const isPremiumOrHigher = (): boolean => {
    return tier === 'premium' || tier === 'admin';
  };

  // Check if user is admin
  const isAdmin = (): boolean => {
    return tier === 'admin';
  };

  return {
    isSignedIn,
    tier,
    hasFeatureAccess,
    hasUnlimitedAccess,
    shouldShowUpgrade,
    isPremiumOrHigher,
    isAdmin,
  };
}
