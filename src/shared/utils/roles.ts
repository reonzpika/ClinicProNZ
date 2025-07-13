import { auth } from '@clerk/nextjs/server';

// Define the role hierarchy
export type UserRole = 'public' | 'signed_up' | 'standard' | 'admin';

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY: UserRole[] = ['public', 'signed_up', 'standard', 'admin'];

/**
 * Get the current user's role from their session claims
 */
export async function getCurrentRole(): Promise<UserRole> {
  try {
    const { sessionClaims, userId } = await auth();

    // No session = public user
    if (!userId) {
      return 'public';
    }

    // Get role from session claims metadata (now available thanks to custom claims)
    const role = (sessionClaims as any)?.metadata?.role;

    return role || 'signed_up';
  } catch (error) {
    console.error('Error getting user role:', error);
    // Fall back to public for safety
    return 'public';
  }
}

/**
 * Check if current user has the specified role or higher
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const currentRole = await getCurrentRole();
  const currentIndex = ROLE_HIERARCHY.indexOf(currentRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);

  return currentIndex >= requiredIndex;
}

/**
 * Require a specific role - throws error if not met
 */
export async function requireRole(requiredRole: UserRole): Promise<UserRole> {
  const currentRole = await getCurrentRole();
  const hasPermission = await hasRole(requiredRole);

  if (!hasPermission) {
    throw new Error(`Insufficient permissions. Required: ${requiredRole}, Current: ${currentRole}`);
  }

  return currentRole;
}

/**
 * Check if current user has exactly the specified role
 */
export async function checkRole(role: UserRole): Promise<boolean> {
  const currentRole = await getCurrentRole();
  return currentRole === role;
}

/**
 * Get user role information with hierarchy context
 */
export async function getUserRoleInfo() {
  const currentRole = await getCurrentRole();
  const roleIndex = ROLE_HIERARCHY.indexOf(currentRole);

  return {
    role: currentRole,
    hierarchy: ROLE_HIERARCHY,
    index: roleIndex,
    permissions: ROLE_HIERARCHY.slice(0, roleIndex + 1),
  };
}

/**
 * Role-based route guards
 */
export const RoleGuards = {
  isPublic: () => hasRole('public'),
  isSignedUp: () => hasRole('signed_up'),
  isStandard: () => hasRole('standard'),
  isAdmin: () => hasRole('admin'),
} as const;
