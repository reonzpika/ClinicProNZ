'use client';

import { useState } from 'react';

import { getTierFromRole } from '@/lib/rbac-enforcer';
import { useRoleTesting } from '@/shared/contexts/RoleTestingContext';
import type { UserRole } from '@/shared/utils/roles';

type RoleImpersonatorProps = {
  currentRole: UserRole;
};

const ROLE_COLORS = {
  public: 'bg-gray-100 text-gray-800',
  signed_up: 'bg-blue-100 text-blue-800',
  standard: 'bg-green-100 text-green-800',
  admin: 'bg-purple-100 text-purple-800',
} as const;

const ROLE_DESCRIPTIONS = {
  public: 'Unauthenticated user (5 sessions/day)',
  signed_up: 'Basic account (5 sessions/day, no template management)',
  standard: 'Paid account (unlimited sessions, all features)',
  admin: 'Administrator (unlimited access)',
} as const;

export function RoleImpersonator({ currentRole }: RoleImpersonatorProps) {
  const { testingRole, isTestingRole, startRoleTesting, stopRoleTesting } = useRoleTesting();
  const [selectedRole, setSelectedRole] = useState<UserRole>('public');

  const allRoles: UserRole[] = ['public', 'signed_up', 'standard', 'admin'];
  const effectiveRole = testingRole || currentRole;

  const handleStartTesting = () => {
    startRoleTesting(selectedRole, currentRole);
  };

  const handleStopTesting = () => {
    stopRoleTesting();
  };

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-yellow-900">
          🎭 Role Impersonation Testing
        </h3>
        {isTestingRole && (
          <button
            onClick={handleStopTesting}
            className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm font-medium leading-4 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            🚨 Revert to Admin
          </button>
        )}
      </div>

      {/* Current Status */}
      <div className="mb-4 rounded border bg-white p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Current Role:</span>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${ROLE_COLORS[effectiveRole]}`}>
            {effectiveRole}
            {isTestingRole && ' (TESTING)'}
          </span>
        </div>
        <div className="mt-1 text-sm text-gray-600">
          {ROLE_DESCRIPTIONS[effectiveRole]}
        </div>
        {isTestingRole && (
          <div className="mt-2 text-xs text-yellow-700">
            ⚠️ Original role:
            {' '}
            <strong>{currentRole}</strong>
            {' '}
            - Click "Revert to Admin" to restore
          </div>
        )}
      </div>

      {/* Role Selection */}
      {!isTestingRole && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Test as Role:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {allRoles.map(role => (
              <label key={role} className="flex cursor-pointer items-center space-x-2">
                <input
                  type="radio"
                  name="testRole"
                  value={role}
                  checked={selectedRole === role}
                  onChange={e => setSelectedRole(e.target.value as UserRole)}
                  className="text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-sm">
                  <span className={`rounded px-2 py-1 text-xs font-medium ${ROLE_COLORS[role]}`}>
                    {role}
                  </span>
                  <span className="ml-2 text-gray-600">
                    {(() => {
                      const tier = getTierFromRole(role);
                      const sessionLimit = tier === 'basic' ? 5 : -1;
                      return `(${sessionLimit === -1 ? 'unlimited' : `${sessionLimit} sessions/day`})`;
                    })()}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <button
            onClick={handleStartTesting}
            disabled={selectedRole === currentRole}
            className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {selectedRole === currentRole ? 'Already in this role' : `Start Testing as "${selectedRole}"`}
          </button>
        </div>
      )}

      {/* Testing Instructions */}
      {isTestingRole && (
        <div className="mt-4 rounded bg-yellow-100 p-3">
          <h4 className="mb-2 text-sm font-medium text-yellow-900">Testing Mode Active</h4>
          <ul className="space-y-1 text-sm text-yellow-800">
            <li>• UI components will show role-appropriate content</li>
            <li>• Session limits displayed reflect this role's limits</li>
            <li>• Some backend permissions still use real admin role</li>
            <li>• Use "Test Users" for full backend testing</li>
          </ul>
        </div>
      )}
    </div>
  );
}
