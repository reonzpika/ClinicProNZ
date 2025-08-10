import { createClerkClient } from '@clerk/nextjs/server';
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

// Simple in-memory cache for user tiers (5 minute TTL)
const tierCache = new Map<string, { tier: UserTier; timestamp: number }>();
const TIER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000; // Prevent memory leaks

/**
 * Clean up expired cache entries to prevent memory leaks
 */
function cleanupTierCache() {
  const now = Date.now();
  for (const [userId, cached] of tierCache.entries()) {
    if (now - cached.timestamp > TIER_CACHE_TTL) {
      tierCache.delete(userId);
    }
  }

  // If cache is still too large, remove oldest entries
  if (tierCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(tierCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, tierCache.size - MAX_CACHE_SIZE);
    for (const [userId] of toRemove) {
      tierCache.delete(userId);
    }
  }
}

/**
 * Look up user tier from Clerk for authenticated users with caching
 */
async function getUserTierFromClerk(userId: string): Promise<UserTier> {
  try {
    // Check cache first
    const cached = tierCache.get(userId);
    if (cached && Date.now() - cached.timestamp < TIER_CACHE_TTL) {
      return cached.tier;
    }

    if (!process.env.CLERK_SECRET_KEY) {
      console.warn('CLERK_SECRET_KEY not found, defaulting to basic tier');
      return 'basic';
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Add timeout protection for Clerk API calls
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Clerk API timeout')), 5000), // 5 second timeout
    );

    const userPromise = clerkClient.users.getUser(userId);
    const user = await Promise.race([userPromise, timeoutPromise]);

    const tier = (user.publicMetadata?.tier as UserTier) || 'basic';

    // Cache the result and cleanup if needed
    tierCache.set(userId, { tier, timestamp: Date.now() });

    // Periodically clean up cache (every 100 lookups)
    if (Math.random() < 0.01) {
      cleanupTierCache();
    }

    return tier;
  } catch (error) {
    console.error('Error fetching user tier from Clerk for userId:', userId, error);

    // If we have a stale cached value, use it as fallback
    const staleCache = tierCache.get(userId);
    if (staleCache) {
      console.warn('Using stale cached tier for userId:', userId, 'tier:', staleCache.tier);
      return staleCache.tier;
    }

    // Ultimate fallback to basic tier to prevent blocking requests
    console.warn('Falling back to basic tier for userId:', userId);
    return 'basic';
  }
}

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
    // Validate mobile token and get associated user context
    const tokenRecord = await db
      .select()
      .from(mobileTokens)
      .where(eq(mobileTokens.token, mobileToken))
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

      const isExpired = record.expiresAt <= new Date();
      if (isExpired) {
        // Expired mobile token - treat as unauthenticated
        return {
          userId: null,
          tier: 'basic',
          isAuthenticated: false,
        };
      }

      // Valid mobile token
      if (record.userId) {
        // Mobile token linked to authenticated user
        // FIXED: Look up actual user tier from Clerk instead of defaulting to basic
        const actualUserTier = await getUserTierFromClerk(record.userId);

        return {
          userId: record.userId,
          tier: actualUserTier, // Use actual user tier from Clerk
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
