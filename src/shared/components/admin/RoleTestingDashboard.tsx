'use client';

import { useRole } from '@/src/shared/hooks/useRole';

import { RoleImpersonator } from './RoleImpersonator';
import { TestUserLogin } from './TestUserLogin';

export function RoleTestingDashboard() {
  const { realRole, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="text-center text-gray-500">Loading role testing dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          🧪 Role Testing Dashboard
        </h2>
        <p className="text-gray-600">
          Test different user roles to verify permissions, rate limits, and UI behaviour.
          Choose between
          {' '}
          <strong>Role Impersonation</strong>
          {' '}
          (UI testing) or
          {' '}
          <strong>Test User Login</strong>
          {' '}
          (full backend testing).
        </p>
      </div>

      {/* Role Impersonation */}
      <RoleImpersonator currentRole={realRole || 'admin'} />

      {/* Test User Login */}
      <TestUserLogin />

      {/* Quick Testing Guide */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          🚀 Quick Testing Guide
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">🎭 Role Impersonation (Frontend)</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Test UI component visibility</li>
              <li>• Check rate limit displays</li>
              <li>• Verify navigation access</li>
              <li>• Quick role switching</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">👥 Test User Login (Backend)</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Test API permissions</li>
              <li>• Verify middleware protection</li>
              <li>• Check actual rate limiting</li>
              <li>• Test authentication flows</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded bg-blue-100 p-3">
          <h4 className="mb-1 text-sm font-medium text-blue-900">💡 Testing Workflow</h4>
          <ol className="space-y-1 text-sm text-blue-800">
            <li>
              1. Use
              <strong>Role Impersonation</strong>
              {' '}
              for quick UI checks
            </li>
            <li>
              2. Use
              <strong>Test User Login</strong>
              {' '}
              for comprehensive backend testing
            </li>
            <li>3. Always test critical features like `/consultation`, `/templates`, rate limits</li>
            <li>4. Use "🔙 Back to Admin" to return to admin privileges</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
