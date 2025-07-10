'use client';

import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

import { getTierFromRole, type UserTier } from '@/lib/rbac-enforcer';
import type { UserRole } from '@/shared/utils/roles';

type UsageLimitsProps = {
  role: UserRole;
  currentUsage?: {
    sessionsToday?: number;
  };
  className?: string;
};

export function UsageLimits({ role, currentUsage = {}, className = '' }: UsageLimitsProps) {
  const tier = getTierFromRole(role);

  // Session limits per tier
  const sessionLimits = {
    basic: 5,
    standard: -1, // unlimited
    admin: -1, // unlimited
  } as Record<UserTier, number>;

  const getUsageStatus = (current: number, limit: number) => {
    if (limit === -1) {
      return 'unlimited';
    } // Unlimited
    if (current >= limit) {
      return 'exceeded';
    }
    if (current >= limit * 0.8) {
      return 'warning';
    }
    return 'ok';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded':
        return <XCircle className="size-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="size-4 text-yellow-500" />;
      case 'unlimited':
      case 'ok':
        return <CheckCircle className="size-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (current: number, limit: number) => {
    if (limit === -1) {
      return 'Unlimited';
    }
    return `${current} / ${limit}`;
  };

  const sessionLimit = sessionLimits[tier];
  const dailyStatus = getUsageStatus(
    currentUsage.sessionsToday || 0,
    sessionLimit,
  );

  return (
    <div className={`rounded-lg border bg-white p-6 ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Current Usage Limits
      </h3>

      <div className="space-y-4">
        {/* Daily Sessions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Daily Sessions</p>
            <p className="text-sm text-gray-500">
              {getStatusText(
                currentUsage.sessionsToday || 0,
                sessionLimit,
              )}
            </p>
          </div>
          <div className="flex items-center">
            {getStatusIcon(dailyStatus)}
          </div>
        </div>

        {/* Feature Access */}
        <div className="border-t pt-4">
          <p className="mb-3 font-medium text-gray-700">Feature Access</p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Templates</span>
              <div className="flex items-center">
                {tier !== 'basic'
                  ? (
                      <CheckCircle className="size-4 text-green-500" />
                    )
                  : (
                      <XCircle className="size-4 text-red-500" />
                    )}
                <span className="ml-2 text-sm">
                  {tier !== 'basic' ? 'Available' : 'Upgrade required'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier-specific messaging */}
        {tier === 'basic' && (
          <div className="rounded-md bg-blue-50 p-3">
            <p className="text-sm text-blue-700">
              Upgrade to Standard for unlimited sessions and template management.
            </p>
          </div>
        )}

        {role === 'public' && (
          <div className="rounded-md bg-yellow-50 p-3">
            <p className="text-sm text-yellow-700">
              Sign up for free to start using ClinicPro.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
