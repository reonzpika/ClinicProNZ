/**
 * Client-safe RBAC utilities (simplified)
 * This file contains only functions and types that can be safely imported by client components.
 * Server-only functions are kept in rbac-enforcer.ts
 */

// Types - Simplified tier system
export type UserTier = 'basic' | 'standard' | 'premium' | 'admin';

export type SessionLimits = {
  templateManagement: boolean;
  sessionManagement: boolean;
};

// Simplified tier configuration - all authenticated users have access
export const TIER_LIMITS: Record<UserTier, SessionLimits> = {
  basic: {
    templateManagement: true, // Now same as standard
    sessionManagement: true, // Now same as standard
  },
  standard: {
    templateManagement: true,
    sessionManagement: true,
  },
  premium: {
    templateManagement: true,
    sessionManagement: true,
  },
  admin: {
    templateManagement: true,
    sessionManagement: true,
  },
};

/**
 * Check if user can access templates (simplified - all authenticated users can access)
 */
export function canAccessTemplates(_tier: UserTier): boolean {
  return true; // All tiers have access now
}
