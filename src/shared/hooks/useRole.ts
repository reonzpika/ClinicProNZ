'use client';

import { useUser } from '@clerk/nextjs';

import { useRoleTesting } from '@/shared/contexts/RoleTestingContext';
import type { UserRole } from '@/shared/utils/roles';

/**
 * Hook that returns the effective role for the current user
 * This will be the testing role if role impersonation is active,
 * otherwise the user's actual role from Clerk client-side
 */
export function useRole(): {
  role: UserRole;
  isLoading: boolean;
  isTestingRole: boolean;
  realRole: UserRole | null;
} {
  const { user, isLoaded } = useUser();
  const { testingRole, isTestingRole } = useRoleTesting();

  // Get role from Clerk user metadata (client-safe)
  const realRole = user?.publicMetadata?.role as UserRole || (user ? 'signed_up' : 'public');
  const effectiveRole = testingRole || realRole;

  return {
    role: effectiveRole,
    isLoading: !isLoaded,
    isTestingRole,
    realRole,
  };
}

/**
 * Hook for checking if user has a specific role or higher
 * Uses the effective role (testing role if active)
 */
export function useHasRole(requiredRole: UserRole): boolean {
  const { role, isLoading } = useRole();

  if (isLoading) {
    return false;
  }

  const roleHierarchy: UserRole[] = ['public', 'signed_up', 'standard', 'admin'];
  const userRoleIndex = roleHierarchy.indexOf(role);
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

  return userRoleIndex >= requiredRoleIndex;
}
