'use client';

import { useUser } from '@clerk/nextjs';

import type { UserTier } from '../utils/roles';
import { TIER_HIERARCHY } from '../utils/roles';

/**
 * Type-safe hook for accessing Clerk user metadata
 * Provides safe access to user tier and other metadata with proper TypeScript typing
 */
export function useClerkMetadata() {
  const { user, isLoaded } = useUser();

  /**
   * Get user tier with safe fallback
   */
  const getUserTier = (): UserTier => {
    if (!user) {
      return 'basic'; // Public users get basic tier
    }
    return (user.publicMetadata?.tier as UserTier) || 'basic';
  };

  /**
   * Check if user has a specific tier or higher
   */
  const hasTier = (tier: UserTier): boolean => {
    const userTier = getUserTier();
    const userIndex = TIER_HIERARCHY.indexOf(userTier);
    const requiredIndex = TIER_HIERARCHY.indexOf(tier);
    return userIndex >= requiredIndex;
  };

  /**
   * Check if user has exactly the specified tier
   */
  const hasExactTier = (tier: UserTier): boolean => {
    return getUserTier() === tier;
  };

  /**
   * Check if user is authenticated (has account)
   */
  const isAuthenticated = (): boolean => {
    return !!user;
  };

  /**
   * Get billing metadata safely
   */
  const getBillingMetadata = () => {
    if (!user?.publicMetadata) {
      return null;
    }

    return {
      stripeCustomerId: user.publicMetadata.stripeCustomerId,
      subscriptionId: user.publicMetadata.subscriptionId,
      priceId: user.publicMetadata.priceId,
      subscriptionStatus: user.publicMetadata.subscriptionStatus,
      currentPeriodEnd: user.publicMetadata.currentPeriodEnd,
    };
  };

  /**
   * Get assignment metadata safely
   */
  const getAssignmentMetadata = () => {
    if (!user?.publicMetadata) {
      return null;
    }

    return {
      assignedAt: user.publicMetadata.assignedAt,
      downgradedAt: user.publicMetadata.downgradedAt,
    };
  };

  return {
    user,
    isLoaded,
    getUserTier,
    hasTier,
    hasExactTier,
    isAuthenticated,
    getBillingMetadata,
    getAssignmentMetadata,
    // Direct safe access to metadata
    metadata: user?.publicMetadata || null,
  };
}
