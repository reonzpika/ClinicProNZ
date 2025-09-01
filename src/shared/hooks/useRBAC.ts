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

  // Check if user has access to specific features (RBAC legacy removed - all authenticated users have access)
  const hasFeatureAccess = (_feature: FeaturePermission): boolean => {
    // All authenticated users have access to all features
    return !!isSignedIn;
  };

  // Check if user has unlimited access to core features (RBAC legacy removed)
  const hasUnlimitedAccess = (): boolean => {
    return !!isSignedIn;
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
