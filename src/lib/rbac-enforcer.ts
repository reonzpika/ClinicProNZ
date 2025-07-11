import { auth as getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

import { db } from '../../database/client';
import { mobileTokens } from '../../database/schema';
import { checkGuestSessionLimit, checkUserSessionLimit } from './services/guest-session-service';

export type UserTier = 'basic' | 'standard' | 'admin';

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

export type SessionLimits = {
  coreSessions: number; // -1 = unlimited
  premiumActions: number; // -1 = unlimited
  templateManagement: boolean;
  sessionManagement: boolean;
};

// RBAC tier configuration matching RBAC.md
const TIER_LIMITS: Record<UserTier, SessionLimits> = {
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
      // Authenticated user - get tier from session claims
      const userRole = sessionClaims?.metadata?.role;
      const tier = mapRoleToTier(userRole || 'signed_up');

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

  // No authentication and no guest token
  return {
    userId: null,
    guestToken: null,
    tier: 'basic', // Default to basic tier
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
 * Map user role to tier
 */
function mapRoleToTier(role: string): UserTier {
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

/**
 * Check if user can access templates (replaces billing-config function)
 */
export function canAccessTemplates(tier: UserTier): boolean {
  const limits = TIER_LIMITS[tier];
  return limits.templateManagement;
}

/**
 * Get user tier from role (convenience function)
 */
export function getTierFromRole(role: string): UserTier {
  return mapRoleToTier(role);
}

// withRBAC function removed - using direct pattern for better Clerk middleware compatibility
