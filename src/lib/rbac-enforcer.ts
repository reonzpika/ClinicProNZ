import { auth as getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

import { db } from '../../database/client';
import { mobileTokens } from '../../database/schema';
// Import client-safe utilities
import {
  canAccessTemplates,
  type SessionLimits,
  TIER_LIMITS,
  type UserTier,
} from './rbac-client';
import { checkGuestSessionLimit, checkUserSessionLimit } from './services/guest-session-service';

// Re-export client-safe utilities for backward compatibility
export { canAccessTemplates, type SessionLimits, type UserTier };

export type RBACContext = {
  userId: string | null;
  guestToken: string | null;
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
 * Extract RBAC context from request
 */
export async function extractRBACContext(req: Request): Promise<RBACContext> {
  const url = new URL(req.url);
  const guestToken
    = req.headers.get('x-guest-token')
      || url.searchParams.get('guestToken')
      || null;

  // Try Clerk authentication FIRST - authenticated users take priority
  try {
    const { userId, sessionClaims } = await getAuth();

    if (userId) {
      // Authenticated user - get tier directly from session claims
      const tier = (sessionClaims as any)?.metadata?.tier || 'basic';

      // Authenticated users don't use guest tokens - they have user-specific tracking
      return {
        userId,
        guestToken: null,
        tier,
        isAuthenticated: true,
      };
    }
  } catch {
    // Auth not available - this is normal for unauthenticated requests
  }

  // No authenticated user, check for guest token
  if (guestToken) {
    return {
      userId: null,
      guestToken,
      tier: 'basic', // All guests are Basic tier
      isAuthenticated: false,
    };
  }

  // No authentication and no guest token - public user
  return {
    userId: null,
    guestToken: null,
    tier: 'basic', // Public users get basic tier limits
    isAuthenticated: false,
  };
}

/**
 * Extract guest token from mobile token lookup
 */
export async function extractGuestTokenFromMobile(mobileToken: string): Promise<string | null> {
  const tokenRecord = await db
    .select()
    .from(mobileTokens)
    .where(eq(mobileTokens.token, mobileToken))
    .limit(1);

  if (tokenRecord.length === 0) {
    return null;
  }

  const record = tokenRecord[0];
  if (!record) {
    return null;
  }

  const isExpired = record.expiresAt <= new Date();

  // For guest tokens (userId is null), return the mobile token as guest token
  if (!record.userId && !isExpired) {
    return mobileToken;
  }

  return null;
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
  } else if (context.guestToken) {
    // Guest user - use guest token session tracking
    const sessionStatus = await checkGuestSessionLimit(context.guestToken);

    return {
      allowed: sessionStatus.canCreateSession,
      reason: sessionStatus.canCreateSession ? undefined : 'Session limit exceeded',
      upgradePrompt: sessionStatus.canCreateSession ? undefined : 'Sign up to get unlimited sessions',
      remaining: sessionStatus.sessionsRemaining,
      resetTime: sessionStatus.resetTime,
    };
  }

  // Basic tier user without proper tracking - deny access
  return {
    allowed: false,
    reason: 'Session tracking required',
    upgradePrompt: 'Please refresh the page to enable session tracking',
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
export async function checkFeatureAccess(context: RBACContext, feature: 'templates' | 'sessions'): Promise<RBACResult> {
  const limits = TIER_LIMITS[context.tier];

  const hasAccess = feature === 'templates' ? limits.templateManagement : limits.sessionManagement;

  if (!hasAccess) {
    return {
      allowed: false,
      reason: `${feature} management requires Standard tier or higher`,
      upgradePrompt: 'Upgrade to Standard to access this feature',
    };
  }

  return { allowed: true };
}

/**
 * Increment session usage for guest tokens
 */
export async function incrementGuestSessionUsage(guestToken: string, patientName: string, templateId?: string): Promise<void> {
  // This will be handled by the existing guest session service
  // when creating a new patient session
  const { createGuestSession } = await import('./services/guest-session-service');
  await createGuestSession(guestToken, patientName, templateId);
}

// withRBAC function removed - using direct pattern for better Clerk middleware compatibility
