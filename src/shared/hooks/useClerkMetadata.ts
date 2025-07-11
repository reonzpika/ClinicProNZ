'use client';

import { useUser } from '@clerk/nextjs';

import type { UserRole } from '../utils/roles';

/**
 * Type-safe hook for accessing Clerk user metadata
 * Provides safe access to user role and other metadata with proper TypeScript typing
 */
export function useClerkMetadata() {
  const { user, isLoaded } = useUser();

  /**
   * Get user role with safe fallback
   */
  const getUserRole = (): UserRole => {
    if (!user) {
      return 'public';
    }
    return (user.publicMetadata?.role as UserRole) || 'signed_up';
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: UserRole): boolean => {
    const userRole = getUserRole();
    const roleHierarchy: UserRole[] = ['public', 'signed_up', 'standard', 'admin'];
    const userIndex = roleHierarchy.indexOf(userRole);
    const requiredIndex = roleHierarchy.indexOf(role);
    return userIndex >= requiredIndex;
  };

  /**
   * Check if user has exactly the specified role
   */
  const hasExactRole = (role: UserRole): boolean => {
    return getUserRole() === role;
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
    getUserRole,
    hasRole,
    hasExactRole,
    getBillingMetadata,
    getAssignmentMetadata,
    // Direct safe access to metadata
    metadata: user?.publicMetadata || null,
  };
}
