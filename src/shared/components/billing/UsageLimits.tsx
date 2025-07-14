'use client';

import { TIER_LIMITS } from '@/src/lib/rbac-client';
import { Progress } from '@/src/shared/components/ui/progress';
import type { UserTier } from '@/src/shared/utils/roles';

type UsageLimitsProps = {
  tier: UserTier;
  currentUsage: {
    requestsToday: number;
  };
};

export function UsageLimits({ tier, currentUsage }: UsageLimitsProps) {
  const limits = TIER_LIMITS[tier];

  const coreSessionsUsed = currentUsage.requestsToday;
  const coreSessionsLimit = limits.coreSessions;
  const premiumActionsLimit = limits.premiumActions;

  const coreSessionsPercentage = coreSessionsLimit === -1 ? 0 : (coreSessionsUsed / coreSessionsLimit) * 100;

  const getTierColor = (tier: UserTier) => {
    switch (tier) {
      case 'basic': return 'text-blue-600';
      case 'standard': return 'text-green-600';
      case 'premium': return 'text-purple-600';
      case 'admin': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Current Usage -
        {' '}
        <span className={`capitalize ${getTierColor(tier)}`}>
          {tier}
          {' '}
          Tier
        </span>
      </h3>

      <div className="space-y-4">
        {/* Core Sessions */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Core Sessions</span>
            <span className="text-sm text-gray-500">
              {coreSessionsUsed}
              {' '}
              /
              {coreSessionsLimit === -1 ? 'Unlimited' : coreSessionsLimit}
            </span>
          </div>
          {coreSessionsLimit !== -1 && (
            <Progress value={coreSessionsPercentage} className="mt-2" />
          )}
        </div>

        {/* Premium Actions */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Premium Actions</span>
            <span className="text-sm text-gray-500">
              0 /
              {' '}
              {premiumActionsLimit === -1 ? 'Unlimited' : premiumActionsLimit}
            </span>
          </div>
          {premiumActionsLimit !== -1 && (
            <Progress value={0} className="mt-2" />
          )}
        </div>

        {/* Features */}
        <div className="pt-2">
          <span className="text-sm font-medium text-gray-700">Available Features:</span>
          <ul className="mt-1 space-y-1 text-sm text-gray-600">
            <li>
              • Template Management:
              {limits.templateManagement ? '✓' : '✗'}
            </li>
            <li>
              • Session Management:
              {limits.sessionManagement ? '✓' : '✗'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
