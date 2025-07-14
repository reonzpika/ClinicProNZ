'use client';

import { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { useTierTestingContext } from '@/src/shared/contexts/RoleTestingContext';
import type { UserTier } from '@/src/shared/utils/roles';

type TierImpersonatorProps = {
  currentTier: UserTier;
};

export function RoleImpersonator({ currentTier }: TierImpersonatorProps) {
  return <TierImpersonator currentTier={currentTier} />;
}

export function TierImpersonator({ currentTier }: TierImpersonatorProps) {
  const { testingTier, isTestingTier, startTierTesting, stopTierTesting } = useTierTestingContext();
  const [selectedTier, setSelectedTier] = useState<UserTier>('basic');

  const allTiers: UserTier[] = ['basic', 'standard', 'premium', 'admin'];
  const effectiveTier = testingTier || currentTier;

  const handleStartTesting = () => {
    startTierTesting(selectedTier, currentTier);
  };

  const handleStopTesting = () => {
    stopTierTesting();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎭 Tier Impersonation
          {isTestingTier && (
            <span className="text-sm font-normal text-orange-600">
              (TESTING MODE)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Test different user tiers without switching accounts.
          Only affects frontend - backend still uses real user tier.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="rounded-lg border bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold text-gray-900">Current Status</h3>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Real Tier:</strong>
              {' '}
              {currentTier}
            </p>
            <p>
              <strong>Effective Tier:</strong>
              {' '}
              {effectiveTier}
              {isTestingTier && ' (TESTING)'}
            </p>
            <p>
              <strong>Testing Mode:</strong>
              {' '}
              {isTestingTier ? '✅ Active' : '❌ Inactive'}
            </p>
          </div>
        </div>

        {/* Testing Controls */}
        {isTestingTier && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-orange-900">
                  Testing as:
                  {testingTier}
                </h4>
                <p className="text-sm text-orange-800">Frontend components will behave as this tier</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStopTesting}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Stop Testing
              </Button>
            </div>
          </div>
        )}

        {/* Tier Selection */}
        {!isTestingTier && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Start Tier Testing</h3>
            <div className="flex items-center gap-4">
              <select
                value={selectedTier}
                onChange={e => setSelectedTier(e.target.value as UserTier)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {allTiers.map(tier => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleStartTesting}
                disabled={selectedTier === currentTier}
                size="sm"
              >
                Start Testing
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Select a different tier to test how components behave for that tier level.
            </p>
          </div>
        )}

        {/* Warning */}
        {isTestingTier && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h4 className="mb-2 font-medium text-yellow-900">⚠️ Important Notes</h4>
            <ul className="space-y-1 text-sm text-yellow-800">
              <li>• Only frontend components are affected</li>
              <li>
                • API calls still use your real tier (
                {currentTier}
                )
              </li>
              <li>• Rate limiting and billing use real tier</li>
              <li>• Remember to stop testing when done</li>
            </ul>
          </div>
        )}

        {/* Tier Descriptions */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Tier Descriptions</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {allTiers.map(tier => (
              <div
                key={tier}
                className={`rounded-lg border p-3 ${
                  tier === effectiveTier
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{tier}</span>
                  {tier === effectiveTier && (
                    <span className="text-xs text-blue-600">CURRENT</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  {tier === 'basic' && 'Basic access, limited features'}
                  {tier === 'standard' && 'Standard access, increased limits'}
                  {tier === 'premium' && 'Premium access, 100 premium actions'}
                  {tier === 'admin' && 'Full administrative access'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
