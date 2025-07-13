/**
 * Client-safe RBAC utilities
 * This file contains only functions and types that can be safely imported by client components.
 * Server-only functions are kept in rbac-enforcer.ts
 */

export type UserTier = 'basic' | 'standard' | 'admin';

export type SessionLimits = {
  coreSessions: number; // -1 = unlimited
  premiumActions: number; // -1 = unlimited
  templateManagement: boolean;
  sessionManagement: boolean;
};

// RBAC tier configuration matching RBAC.md
export const TIER_LIMITS: Record<UserTier, SessionLimits> = {
  basic: {
    coreSessions: 5,
    premiumActions: 5,
    templateManagement: false,
    sessionManagement: false,
  },
  standard: {
    coreSessions: -1, // unlimited
    premiumActions: 5,
    templateManagement: true,
    sessionManagement: true,
  },
  admin: {
    coreSessions: -1, // unlimited
    premiumActions: -1, // unlimited
    templateManagement: true,
    sessionManagement: true,
  },
};

/**
 * Map user role to tier
 */
export function getTierFromRole(role: string): UserTier {
  switch (role) {
    case 'admin':
      return 'admin';
    case 'standard':
      return 'standard';
    case 'signed_up':
    case 'public':
    default:
      return 'basic';
  }
}

/**
 * Check if user can access templates (replaces billing-config function)
 */
export function canAccessTemplates(tier: UserTier): boolean {
  const limits = TIER_LIMITS[tier];
  return limits.templateManagement;
} 