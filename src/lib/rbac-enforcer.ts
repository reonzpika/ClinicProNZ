import { and, eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

import { getDb } from '../../database/client';
import { mobileTokens } from '../../database/schema';

// Simplified tier system - authentication-based only
export type UserTier = 'basic' | 'standard' | 'premium' | 'admin';

export type RBACContext = {
  userId: string | null;
  tier: UserTier;
  isAuthenticated: boolean;
};

export type RBACResult = {
  allowed: boolean;
  reason?: string;
};

/**
 * Validate mobile token and return associated user ID
 */
export async function validateMobileToken(req: Request): Promise<string | null> {
  const url = new URL(req.url);
  const mobileToken = req.headers.get('x-mobile-token') || url.searchParams.get('token');

  if (!mobileToken) {
 return null;
}

  try {
    const db = getDb();
    const tokenRecord = await db
      .select()
      .from(mobileTokens)
      .where(and(eq(mobileTokens.token, mobileToken), eq(mobileTokens.isActive, true)))
      .limit(1);

    return tokenRecord[0]?.userId || null;
  } catch {
    return null;
  }
}

/**
 * Extract RBAC context from request headers (simplified for mobile token validation)
 */
export async function extractRBACContext(req: Request): Promise<RBACContext> {
  // 1) Try Clerk server auth (cookie-based) first
  try {
    const resolved = await auth();
    const cookieUserId = resolved?.userId || null;
    if (cookieUserId) {
      const tierFromClaims = (resolved.sessionClaims as any)?.metadata?.tier as UserTier | undefined;
      return {
        userId: cookieUserId,
        tier: tierFromClaims || 'basic',
        isAuthenticated: true,
      };
    }
  } catch {
    // Ignore and fall through
  }

  // 2) Check for mobile token
  const mobileUserId = await validateMobileToken(req);
  if (mobileUserId) {
    return {
      userId: mobileUserId,
      tier: 'admin', // Mobile tokens get admin access for recording
      isAuthenticated: true,
    };
  }

  // 3) Fall back to client-provided headers (legacy)
  const headerUserId = req.headers.get('x-user-id');
  const headerUserTier = (req.headers.get('x-user-tier') as UserTier) || 'basic';
  if (headerUserId) {
    return {
      userId: headerUserId,
      tier: headerUserTier,
      isAuthenticated: true,
    };
  }

  // 4) Unauthenticated
  return {
    userId: null,
    tier: 'basic',
    isAuthenticated: false,
  };
}

/**
 * Check if user can access core functionality (simplified - just requires authentication)
 */
export async function checkCoreAccess(context: RBACContext): Promise<RBACResult> {
  if (!context.isAuthenticated) {
    return {
      allowed: false,
      reason: 'Authentication required - please sign in to use ClinicPro',
    };
  }

  return { allowed: true };
}

/**
 * Check if user can access any feature (all authenticated users have access)
 */
export async function checkFeatureAccess(context: RBACContext, _feature: 'templates' | 'sessions' | 'session-history'): Promise<RBACResult> {
  if (!context.isAuthenticated) {
      return {
        allowed: false,
        reason: 'Authentication required - please sign in to access this feature',
    };
  }

  // All authenticated users have access to all features
  return { allowed: true };
}

// Legacy function aliases for backward compatibility
export const checkCoreSessionLimit = checkCoreAccess;
export const checkPremiumActionLimit = checkCoreAccess;
