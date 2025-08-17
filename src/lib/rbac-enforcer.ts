import { and, eq } from 'drizzle-orm';

import { db } from '../../database/client';
import { mobileTokens } from '../../database/schema';
// Import client-safe utilities
import {
  canAccessTemplates,
  type SessionLimits,
  TIER_LIMITS,
  type UserTier,
} from './rbac-client';
import { checkUserSessionLimit } from './services/guest-session-service';

// Re-export client-safe utilities for backward compatibility
export { canAccessTemplates, type SessionLimits, type UserTier };

export type RBACContext = {
  userId: string | null;
  tier: UserTier;
  isAuthenticated: boolean;
};

export type RBACResult = {
  allowed: boolean;
  reason?: string;
  upgradePrompt?: string;
  remaining?: number;
  resetTime?: Date;
};

/**
 * Extract RBAC context from request headers (client-side auth pattern)
 */
export async function extractRBACContext(req: Request): Promise<RBACContext> {
  const url = new URL(req.url);

  // Get user information from request headers (sent by client)
  const userId = req.headers.get('x-user-id');
  const userTier = req.headers.get('x-user-tier') as UserTier || 'basic';

  // Check for mobile token first
  const mobileToken = req.headers.get('x-mobile-token') || url.searchParams.get('mobileToken');

  if (mobileToken) {
    try {
      // Validate mobile token and get associated user context (only active tokens)
      const tokenRecord = await db
        .select()
        .from(mobileTokens)
        .where(and(eq(mobileTokens.token, mobileToken), eq(mobileTokens.isActive, true)))
        .limit(1);

      if (tokenRecord.length > 0) {
        const record = tokenRecord[0];

        if (!record) {
          // Invalid token record - treat as unauthenticated
          return {
            userId: null,
            tier: 'basic',
            isAuthenticated: false,
          };
        }

        // Valid mobile token (already filtered for active tokens in query)
        if (record.userId) {
          // MOBILE OPTIMIZATION: Mobile recording doesn't need tier restrictions since:
          // - No session creation (uses existing session)
          // - No premium features (just transcription)
          // - Works for all authenticated users
          // Using 'admin' tier to bypass all restrictions for mobile recording
          return {
            userId: record.userId,
            tier: 'admin', // Bypass all restrictions for mobile recording
            isAuthenticated: true,
          };
        } else {
          // Mobile token for guest user (userId is null) - not supported anymore
          return {
            userId: null,
            tier: 'basic',
            isAuthenticated: false,
          };
        }
      }
    } catch {
      // Fall through to other auth methods
    }
    // Invalid mobile token - fall through to other auth methods
  }

  // Authenticated user required
  if (userId) {
    return {
      userId,
      tier: userTier,
      isAuthenticated: true,
    };
  }

  // No authentication - require sign in
  return {
    userId: null,
    tier: 'basic',
    isAuthenticated: false,
  };
}

/**
 * Check if user can perform a core session action (transcription, note generation, mobile recording)
 */
export async function checkCoreSessionLimit(context: RBACContext): Promise<RBACResult> {
  const limits = TIER_LIMITS[context.tier];

  // Unlimited access for Standard/Premium
  if (limits.coreSessions === -1) {
    return { allowed: true };
  }

  // For Basic tier, check session limits
  if (context.isAuthenticated && context.userId) {
    // Authenticated basic tier user - use user-specific session tracking
    const sessionStatus = await checkUserSessionLimit(context.userId);

    return {
      allowed: sessionStatus.canCreateSession,
      reason: sessionStatus.canCreateSession ? undefined : 'Session limit exceeded',
      upgradePrompt: sessionStatus.canCreateSession ? undefined : 'Upgrade to Standard to get unlimited sessions',
      remaining: sessionStatus.sessionsRemaining,
      resetTime: sessionStatus.resetTime,
    };
  }

  // Unauthenticated user - require sign in
  return {
    allowed: false,
    reason: 'Authentication required',
    upgradePrompt: 'Please sign in to use ClinicPro',
  };
}

/**
 * Check if user can perform premium actions (clinical images, DDx, checklists)
 */
export async function checkPremiumActionLimit(context: RBACContext): Promise<RBACResult> {
  const limits = TIER_LIMITS[context.tier];

  // Unlimited access for Premium tier
  if (limits.premiumActions === -1) {
    return { allowed: true };
  }

  // For Basic/Standard tiers, premium actions are limited
  // Implementation depends on tracking premium action usage
  // For now, return basic limit info
  return {
    allowed: true, // TODO: Implement premium action tracking
    reason: undefined,
    upgradePrompt: context.tier === 'basic' ? 'Upgrade to Standard for more premium features' : undefined,
    remaining: limits.premiumActions,
  };
}

/**
 * Check if user can access feature (templates, session management)
 */
export async function checkFeatureAccess(context: RBACContext, feature: 'templates' | 'sessions' | 'session-history'): Promise<RBACResult> {
  const limits = TIER_LIMITS[context.tier];

  let hasAccess: boolean;

  if (feature === 'templates') {
    hasAccess = limits.templateManagement;
  } else if (feature === 'session-history') {
    // Session history (viewing past sessions) requires standard+
    hasAccess = limits.sessionManagement;
  } else if (feature === 'sessions') {
    // Active session management (during consultation) is allowed for all authenticated users
    hasAccess = context.isAuthenticated;
  } else {
    hasAccess = false;
  }

  if (!hasAccess) {
    const featureName = feature === 'session-history' ? 'session history' : `${feature} management`;
    return {
      allowed: false,
      reason: `${featureName} requires ${feature === 'sessions' ? 'authentication' : 'Standard tier or higher'}`,
      upgradePrompt: feature === 'sessions' ? 'Please sign in to access this feature' : 'Upgrade to Standard to access this feature',
    };
  }

  return { allowed: true };
}

// withRBAC function removed - using direct pattern for better Clerk middleware compatibility
