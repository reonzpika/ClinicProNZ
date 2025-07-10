'use client';

import { useUser } from '@clerk/nextjs';

import { useRoleTesting } from '@/shared/contexts/RoleTestingContext';
import { useTestUser } from '@/shared/contexts/TestUserContext';

export function RoleTestingBanner() {
  const { isTestingRole, testingRole, originalRole, stopRoleTesting } = useRoleTesting();
  const { isTestUserMode, originalAdminEmail, clearOriginalAdminEmail } = useTestUser();
  const { user } = useUser();

  // Only show banner for role impersonation, NOT for test user login
  // (Test users should use emergency page to switch back)
  const showBanner = isTestingRole;

  if (!showBanner) {
    return null;
  }

  // Determine what we're showing
  const isRoleImpersonation = isTestingRole && testingRole && originalRole;
  const isTestUserLogin = isTestUserMode && originalAdminEmail;

  // Handle revert for both modes
  const handleRevert = async () => {
    if (isRoleImpersonation) {
      stopRoleTesting();
    } else if (isTestUserLogin) {
      try {
        // CRITICAL: Sign out the test user first
        console.log('Signing out test user and returning to admin...');
        await window.Clerk?.signOut();

        // Clear the test mode
        clearOriginalAdminEmail();

        // Redirect to login with admin email pre-filled
        window.location.href = `/login?email=${encodeURIComponent(originalAdminEmail)}`;
      } catch (error) {
        console.error('Error during admin revert:', error);
        // Fallback: just redirect to login
        clearOriginalAdminEmail();
        window.location.href = '/login';
      }
    }
  };

  // Get display info based on mode
  const getDisplayInfo = () => {
    if (isRoleImpersonation) {
      return {
        mode: '🎭 Role Impersonation',
        currentRole: testingRole,
        originalInfo: originalRole,
      };
    } else if (isTestUserLogin) {
      const currentRole = user?.publicMetadata?.role as string || (user ? 'signed_up' : 'public');
      return {
        mode: '👥 Test User Login',
        currentRole,
        originalInfo: originalAdminEmail?.split('@')[0] || 'admin',
      };
    }
    return { mode: 'Testing', currentRole: 'unknown', originalInfo: 'unknown' };
  };

  const { mode, currentRole, originalInfo } = getDisplayInfo();

  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-red-600 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        {/* Left side - Testing info */}
        <div className="flex min-w-0 flex-1 items-center space-x-2 md:space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium md:text-base">{mode}</span>
          </div>
          <div className="whitespace-nowrap rounded bg-red-700 px-2 py-1 text-xs md:text-sm">
            <span className="hidden sm:inline">Current: </span>
            <span className="font-semibold capitalize">{currentRole}</span>
          </div>
          <div className="hidden truncate text-xs text-red-200 md:block">
            Original:
            {' '}
            {originalInfo}
          </div>
        </div>

        {/* Right side - Revert button */}
        <button
          onClick={handleRevert}
          className="ml-2 whitespace-nowrap rounded bg-white px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 md:px-4 md:text-sm"
        >
          <span className="hidden sm:inline">🚨 Back to Admin</span>
          <span className="sm:hidden">🚨 Admin</span>
        </button>
      </div>
    </div>
  );
}
