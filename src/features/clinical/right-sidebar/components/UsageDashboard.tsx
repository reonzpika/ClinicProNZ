'use client';

import { useAuth } from '@clerk/nextjs';
import { Crown, TrendingUp, Users, Zap } from 'lucide-react';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import type { UserTier } from '@/src/lib/rbac-client';
import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { Progress } from '@/src/shared/components/ui/progress';
import { useConsultation } from '@/src/shared/ConsultationContext';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeadersWithGuest } from '@/src/shared/utils';

type UsageData = {
  tier: UserTier;
  coreSessionsUsed: number;
  coreSessionsLimit: number;
  premiumActionsUsed: number;
  premiumActionsLimit: number;
  resetTime: Date;
};

const UsageDashboard = forwardRef<{ refresh: () => void }, object>((_props, ref) => {
  // Feature flag to hide premium actions UI
  const SHOW_PREMIUM_ACTIONS = false;

  const { isSignedIn, userId } = useAuth();
  const { user } = useClerkMetadata();
  const { mobileV2: _mobileV2, getEffectiveGuestToken } = useConsultation();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Use production tier detection for real features (not testing)
  const { getUserTier, isLoaded } = useClerkMetadata();
  const tier = getUserTier();

  // Refresh usage data function
  const refreshUsage = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Expose refresh function to parent via ref
  useImperativeHandle(ref, () => ({
    refresh: refreshUsage,
  }), []);

  // Fetch usage data
  useEffect(() => {
    const fetchUsageData = async () => {
      setLoading(true);

      try {
        // Get user tier for limits
        const currentTier = tier;

        if (currentTier === 'basic') {
          if (isSignedIn) {
            // Authenticated basic tier user - fetch from user-specific API
            const response = await fetch('/api/user/usage');

            if (response.ok) {
              const data = await response.json();
              setUsageData({
                tier,
                coreSessionsUsed: data.sessionsUsed,
                coreSessionsLimit: 5,
                premiumActionsUsed: 0, // Not tracked for basic tier yet
                premiumActionsLimit: 5,
                resetTime: new Date(data.resetTime),
              });
            }
          } else {
            // Guest user - fetch from guest session API
            const effectiveGuestToken = getEffectiveGuestToken();
            if (effectiveGuestToken) {
              const response = await fetch('/api/guest-sessions/status', {
                method: 'POST',
                headers: createAuthHeadersWithGuest(userId, tier, effectiveGuestToken),
                body: JSON.stringify({ guestToken: effectiveGuestToken }),
              });

              if (response.ok) {
                const data = await response.json();
                setUsageData({
                  tier,
                  coreSessionsUsed: data.sessionsUsed,
                  coreSessionsLimit: 5,
                  premiumActionsUsed: 0, // Not tracked for guests yet
                  premiumActionsLimit: 5,
                  resetTime: new Date(data.resetTime),
                });
              }
            }
          }
        } else {
          // Standard/Premium/Admin authenticated users - set tier-based limits (no API call needed)
          const limits = {
            standard: { core: -1, premium: 5 }, // Unlimited core, limited premium
            premium: { core: -1, premium: 100 }, // Unlimited core, high premium limit
            admin: { core: -1, premium: -1 }, // Unlimited everything
          };

          setUsageData({
            tier,
            coreSessionsUsed: 0, // Standard/Premium/Admin don't have core session limits
            coreSessionsLimit: limits[tier as 'standard' | 'premium' | 'admin'].core,
            premiumActionsUsed: 0,
            premiumActionsLimit: limits[tier as 'standard' | 'premium' | 'admin'].premium,
            resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          });
        }
      } catch (error) {
        console.error('Failed to fetch usage data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data when clerk is loaded
    if (isLoaded) {
      fetchUsageData();
    }
  }, [isSignedIn, getEffectiveGuestToken, user, refreshKey, tier, isLoaded]);

  if (loading || !isLoaded) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4" />
            Usage Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="mt-2 h-2 rounded bg-gray-200"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="mt-2 h-2 rounded bg-gray-200"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usageData) {
    return null;
  }

  const getTierColor = (tier: UserTier) => {
    switch (tier) {
      case 'basic':
        return 'bg-gray-100 text-gray-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (tier: UserTier) => {
    switch (tier) {
      case 'basic':
        return <Users className="size-4" />;
      case 'standard':
        return <Zap className="size-4" />;
      case 'admin':
        return <Crown className="size-4" />;
      default:
        return <Users className="size-4" />;
    }
  };

  const coreUsagePercentage = usageData.coreSessionsLimit === -1
    ? 0
    : (usageData.coreSessionsUsed / usageData.coreSessionsLimit) * 100;

  const premiumUsagePercentage = usageData.premiumActionsLimit === -1
    ? 0
    : (usageData.premiumActionsUsed / usageData.premiumActionsLimit) * 100;

  const isNearCoreLimit = coreUsagePercentage >= 80;
  const isNearPremiumLimit = premiumUsagePercentage >= 80;
  const isCoreAtLimit = usageData.coreSessionsLimit !== -1 && usageData.coreSessionsUsed >= usageData.coreSessionsLimit;
  const isPremiumAtLimit = usageData.premiumActionsLimit !== -1 && usageData.premiumActionsUsed >= usageData.premiumActionsLimit;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4" />
            Usage Dashboard
          </div>
          <Badge className={getTierColor(usageData.tier)}>
            {getTierIcon(usageData.tier)}
            {usageData.tier.charAt(0).toUpperCase() + usageData.tier.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Sessions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Core Sessions</span>
            <span className={`text-sm ${isCoreAtLimit ? 'font-semibold text-red-600' : 'text-gray-500'}`}>
              {usageData.coreSessionsLimit === -1
                ? 'Unlimited'
                : `${usageData.coreSessionsUsed}/${usageData.coreSessionsLimit}`}
              {isCoreAtLimit && ' - LIMIT REACHED'}
            </span>
          </div>
          {usageData.coreSessionsLimit !== -1 && (
            <Progress
              value={coreUsagePercentage}
              className={isCoreAtLimit ? 'bg-red-200' : isNearCoreLimit ? 'bg-red-100' : 'bg-gray-100'}
            />
          )}
          <p className="text-xs text-gray-500">
            Transcription, note generation, mobile recording
          </p>
        </div>

        {/* Premium Actions */}
        {SHOW_PREMIUM_ACTIONS && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Premium Actions</span>
              <span className={`text-sm ${isPremiumAtLimit ? 'font-semibold text-red-600' : 'text-gray-500'}`}>
                {usageData.premiumActionsLimit === -1
                  ? 'Unlimited'
                  : `${usageData.premiumActionsUsed}/${usageData.premiumActionsLimit}`}
                {isPremiumAtLimit && ' - LIMIT REACHED'}
              </span>
            </div>
            {usageData.premiumActionsLimit !== -1 && (
              <Progress
                value={premiumUsagePercentage}
                className={isPremiumAtLimit ? 'bg-red-200' : isNearPremiumLimit ? 'bg-red-100' : 'bg-gray-100'}
              />
            )}
            <p className="text-xs text-gray-500">
              Clinical image analysis, DDx suggestions, checklists
            </p>

            {/* Premium limit reached alert */}
            {isPremiumAtLimit && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                <div className="flex items-start gap-2">
                  <div className="text-amber-600">⚠️</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">
                      Premium actions limit reached
                    </p>
                    <p className="mt-1 text-xs text-amber-700">
                      Clinical images, DDx, and checklists reset at
                      {' '}
                      {usageData.resetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' '}
                      tomorrow.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reset Time */}
        <div className="text-xs text-gray-500">
          Usage resets:
          {' '}
          {usageData.resetTime.toLocaleString()}
        </div>

        {/* Upgrade Prompts */}
        {usageData.tier === 'basic' && (
          <div className="space-y-3">
            {/* Single unified message */}
            <div className={`rounded-lg border p-4 ${
              isCoreAtLimit
                ? 'border-red-300 bg-red-50'
                : isNearCoreLimit
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-blue-300 bg-blue-50'
            }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isCoreAtLimit
                    ? <div className="text-red-600">🚨</div>
                    : isNearCoreLimit
                      ? <div className="text-amber-600">⚠️</div>
                      : <div className="text-blue-600">💡</div>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    isCoreAtLimit
                      ? 'text-red-900'
                      : isNearCoreLimit
                        ? 'text-amber-900'
                        : 'text-blue-900'
                  }`}
                  >
                    {isCoreAtLimit
                      ? 'Session limit reached'
                      : isNearCoreLimit
                        ? 'Approaching session limit'
                        : 'Upgrade for unlimited access'}
                  </p>
                  <p className={`mt-1 text-xs ${
                    isCoreAtLimit
                      ? 'text-red-700'
                      : isNearCoreLimit
                        ? 'text-amber-700'
                        : 'text-blue-700'
                  }`}
                  >
                    {isCoreAtLimit
                      ? `Features disabled until ${usageData.resetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} tomorrow. Upgrade for unlimited sessions.`
                      : isNearCoreLimit
                        ? 'Upgrade to Standard for unlimited sessions and full access.'
                        : 'Get unlimited sessions, full access, and priority support.'}
                  </p>
                </div>
              </div>
            </div>

            <Button
              className={`w-full ${isCoreAtLimit ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              size="sm"
              onClick={async () => {
                // For public users, redirect to sign up first
                if (!isSignedIn) {
                  window.location.href = '/auth/register?redirect=upgrade';
                  return;
                }

                try {
                  const response = await fetch('/api/create-checkout-session', {
                    method: 'POST',
                    headers: createAuthHeadersWithGuest(userId, tier, null),
                    body: JSON.stringify({
                      email: user?.primaryEmailAddress?.emailAddress,
                      userId: user?.id,
                    }),
                  });

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    console.error('Upgrade failed:', errorData.error || 'Please try again later');
                    // TODO: Replace with proper error handling UI (toast notification)
                    return;
                  }

                  const { url } = await response.json();
                  window.location.href = url;
                } catch {
                  // TODO: Replace with proper error handling UI
                  console.error('Upgrade failed. Please try again later.');
                }
              }}
            >
              <Crown className="mr-2 size-4" />
              {!isSignedIn
                ? 'Sign Up to Upgrade - $30/month (First 15 GPs!)'
                : isCoreAtLimit
                  ? 'Upgrade Now - Unlimited Access'
                  : 'Upgrade to Standard - $30/month (First 15 GPs!)'}
            </Button>

            {/* Remove email input section for public users */}
          </div>
        )}

        {SHOW_PREMIUM_ACTIONS && usageData.tier === 'standard' && (
          <div className="space-y-3">
            {/* Single unified message for standard tier */}
            {(isPremiumAtLimit || isNearPremiumLimit) && (
              <div className={`rounded-lg border p-4 ${
                isPremiumAtLimit
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-blue-300 bg-blue-50'
              }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isPremiumAtLimit
                      ? <div className="text-amber-600">⚠️</div>
                      : <div className="text-blue-600">💡</div>}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      isPremiumAtLimit
                        ? 'text-amber-900'
                        : 'text-blue-900'
                    }`}
                    >
                      {isPremiumAtLimit
                        ? 'Premium actions limit reached'
                        : 'Approaching premium actions limit'}
                    </p>
                    <p className={`mt-1 text-xs ${
                      isPremiumAtLimit
                        ? 'text-amber-700'
                        : 'text-blue-700'
                    }`}
                    >
                      {isPremiumAtLimit
                        ? 'Clinical images, DDx, and checklists reset tomorrow.'
                        : 'Upgrade to Premium for unlimited premium actions.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button className="w-full" size="sm" variant="outline" disabled>
              <Crown className="mr-2 size-4" />
              Upgrade to Premium (Coming Soon)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

UsageDashboard.displayName = 'UsageDashboard';

export default UsageDashboard;
