'use client';

import { useEffect, useState } from 'react';

import { Badge } from '@/src/shared/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { Progress } from '@/src/shared/components/ui/progress';

type UsageData = {
  tier: string;
  limit: string | number;
  used: number;
  remaining: string | number;
  resetIn: number;
  resetAt: string;
  percentage: number;
};

export default function UsageTracker() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/user/usage');
        if (response.ok) {
          const data = await response.json();
          setUsage(data);
        }
      } catch (error) {
        console.error('Failed to fetch usage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, []);

  const formatTimeUntilReset = (resetIn: number) => {
    const hours = Math.floor(resetIn / 3600);
    const minutes = Math.floor((resetIn % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Removed unused getUsageColor function - color logic is inline in JSX

  const getTierDisplayName = (tier: string) => {
    switch (tier) {
      case 'basic': return 'Basic Plan';
      case 'standard': return 'Standard Plan';
      case 'premium': return 'Premium Plan';
      case 'admin': return 'Admin';
      default: return tier;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Tracking</CardTitle>
          <CardDescription>Monitor your API usage and limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              <p className="text-gray-600">Loading usage data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Tracking</CardTitle>
          <CardDescription>Monitor your API usage and limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-gray-600">Unable to load usage data</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Try again
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Tracking</CardTitle>
        <CardDescription>Monitor your API usage and limits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Current Plan</h3>
              <p className="text-gray-600">
                {getTierDisplayName(usage.tier)}
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {usage.tier}
            </Badge>
          </div>

          {/* Usage Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sessions Used</span>
              <span className="text-sm text-gray-600">
                {usage.used}
                {' '}
                of
                {usage.limit === -1 ? 'unlimited' : usage.limit}
              </span>
            </div>

            {usage.limit !== -1 && (
              <div className="space-y-2">
                <Progress
                  value={usage.percentage}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>
                    {usage.used}
                    {' '}
                    used
                  </span>
                  <span>
                    {usage.remaining}
                    {' '}
                    remaining
                  </span>
                </div>
              </div>
            )}

            {usage.limit === -1 && (
              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <svg className="size-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Unlimited Usage
                    </p>
                    <p className="text-sm text-green-700">
                      You have unlimited sessions with your current plan
                    </p>
                  </div>
                </div>
              </div>
            )}

            {usage.limit !== -1 && (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Usage resets in
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTimeUntilReset(usage.resetIn)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Reset time
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(usage.resetAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upgrade Prompt */}
          {usage.percentage > 80 && usage.limit !== -1 && (
            <div className="rounded-lg bg-orange-50 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <svg className="size-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-800">
                    Approaching Usage Limit
                  </p>
                  <p className="text-sm text-orange-700">
                    You've used
                    {' '}
                    {usage.percentage}
                    % of your monthly limit. Consider upgrading for unlimited access.
                  </p>
                  <div className="mt-2">
                    <button
                      type="button"
                      className="text-sm font-medium text-orange-800 hover:text-orange-900"
                    >
                      Upgrade Plan →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
