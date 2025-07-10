'use client';

import type { ReactNode } from 'react';

import type { UserRole } from '@/shared/utils/roles';
import { useClerkMetadata } from '@/shared/hooks/useClerkMetadata';

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
  requireExact?: boolean; // If true, user must have exactly one of the allowed roles
};

/**
 * Client-side role guard component
 */
export function RoleGuard({ allowedRoles, children, fallback = null, requireExact = false }: RoleGuardProps) {
  const { isLoaded, getUserRole } = useClerkMetadata();

  // Show nothing while loading
  if (!isLoaded) {
    return null;
  }

  // Get user role from metadata, type-safe
  const userRole = getUserRole();

  // Role hierarchy for permission checking
  const roleHierarchy: UserRole[] = ['public', 'signed_up', 'standard', 'admin'];
  const userRoleIndex = roleHierarchy.indexOf(userRole);

  let hasAccess = false;

  if (requireExact) {
    // User must have exactly one of the allowed roles
    hasAccess = allowedRoles.includes(userRole);
  } else {
    // User must have at least one of the allowed roles (hierarchical)
    hasAccess = allowedRoles.some((role) => {
      const requiredIndex = roleHierarchy.indexOf(role);
      return userRoleIndex >= requiredIndex;
    });
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * Convenience components for common role checks
 */
export const SignedUpOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGuard allowedRoles={['signed_up']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const StandardOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGuard allowedRoles={['standard']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AdminOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGuard allowedRoles={['admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

/**
 * Hook for getting current user role
 */
export function useUserRole(): { role: UserRole; isLoaded: boolean } {
  const { isLoaded, getUserRole } = useClerkMetadata();

  const role = getUserRole();

  return { role, isLoaded };
}
