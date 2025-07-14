'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { useTier } from '@/src/shared/hooks/useRole';

import { TierImpersonator } from './RoleImpersonator';
import { TestUserLogin } from './TestUserLogin';

export function RoleTestingDashboard() {
  return <TierTestingDashboard />;
}

export function TierTestingDashboard() {
  const { realTier, isLoading } = useTier();

  if (isLoading) {
    return (
      <div className="text-center text-gray-500">Loading tier testing dashboard...</div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          🧪 Tier Testing Dashboard
        </h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          Test different user tiers to verify permissions, rate limits, and UI behaviour.
        </p>
      </div>

      {/* Tier Impersonation Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          <strong>Tier Impersonation</strong>
        </h2>
        <p className="text-gray-600">
          Test how the frontend behaves for different user tiers without switching accounts.
        </p>

        <div className="flex justify-center">
          <TierImpersonator currentTier={realTier || 'admin'} />
        </div>
      </div>

      {/* Test User Login Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          <strong>Test User Login</strong>
        </h2>
        <p className="text-gray-600">
          Switch to actual test user accounts for complete end-to-end testing.
        </p>

        <div className="flex justify-center">
          <TestUserLogin />
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎭 Tier Impersonation (Frontend)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Quick tier switching</li>
              <li>• Frontend-only changes</li>
              <li>• Real API calls unaffected</li>
              <li>• Perfect for UI testing</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">👤 Test User Login (Full Stack)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Complete tier testing</li>
              <li>• Real API authentication</li>
              <li>• Rate limiting verification</li>
              <li>• Billing system testing</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Testing Guide</CardTitle>
          <CardDescription>
            How to effectively test different user tiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="mb-2 font-medium text-gray-900">🎯 What to Test</h4>
              <ul className="ml-4 space-y-1 text-gray-600">
                <li>• Feature access and restrictions</li>
                <li>• Rate limiting behaviour</li>
                <li>• Billing and usage limits</li>
                <li>• UI component visibility</li>
                <li>• Navigation and redirects</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-medium text-gray-900">🔄 Testing Workflow</h4>
              <ol className="ml-4 list-decimal space-y-1 text-gray-600">
                <li>Start with tier impersonation for quick UI checks</li>
                <li>Switch to test user login for full API testing</li>
                <li>Test edge cases and error handling</li>
                <li>Verify tier transitions work correctly</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
