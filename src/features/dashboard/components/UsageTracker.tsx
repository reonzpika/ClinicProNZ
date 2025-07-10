'use client';

import { Activity, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

type UsageData = {
  role: string;
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

    // Refresh usage data every 30 seconds
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeUntilReset = (resetIn: number) => {
    const hours = Math.floor(resetIn / (1000 * 60 * 60));
    const minutes = Math.floor((resetIn % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Removed unused getUsageColor function - color logic is inline in JSX

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'signed_up': return 'Free Plan';
      case 'standard': return 'Standard Plan';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5" />
            Usage Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-8 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5" />
            Usage Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Unable to load usage data</p>
        </CardContent>
      </Card>
    );
  }

  const isUnlimited = usage.limit === 'unlimited';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="size-5" />
          Usage Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {getRoleDisplayName(usage.role)}
          </Badge>
          {!isUnlimited && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="size-3" />
              Resets in
              {' '}
              {formatTimeUntilReset(usage.resetIn)}
            </div>
          )}
        </div>

        {/* Usage Display */}
        {isUnlimited ? (
          <div className="py-4 text-center">
            <div className="text-2xl font-bold text-green-600">Unlimited</div>
            <p className="text-sm text-gray-500">No request limits</p>
          </div>
        ) : (
          <>
            {/* Usage Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Daily Requests</span>
                <span className="font-medium">
                  {usage.used}
                  {' '}
                  /
                  {usage.limit}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    usage.percentage >= 90
                      ? 'bg-red-500'
                      : usage.percentage >= 75
                        ? 'bg-orange-500'
                        : usage.percentage >= 50
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(usage.percentage, 100)}%` }}
                >
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  {usage.percentage}
                  % used
                </span>
                <span>
                  {usage.remaining}
                  {' '}
                  remaining
                </span>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-2 gap-4 border-t pt-2">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {usage.used}
                </div>
                <div className="text-xs text-gray-500">Used Today</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {usage.remaining}
                </div>
                <div className="text-xs text-gray-500">Remaining</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
