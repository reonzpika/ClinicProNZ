'use client';

import { useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

import { useRoleTesting } from '@/src/shared/contexts/RoleTestingContext';
import { useTestUser } from '@/src/shared/contexts/TestUserContext';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';

export default function EmergencyAdminPage() {
  const { originalAdminEmail, clearOriginalAdminEmail, isTestUserMode } = useTestUser();
  const { stopRoleTesting, isTestingRole } = useRoleTesting();
  const { user } = useClerkMetadata();
  const clerk = useClerk();
  const [localStorageChecked, setLocalStorageChecked] = useState(false);

  useEffect(() => {
    // Check localStorage directly as fallback
    const storedEmail = localStorage.getItem('clinicpro-test-mode-admin-email');
    if (storedEmail) {
      setLocalStorageChecked(true);
    }
  }, []);

  const handleBackToAdmin = async () => {
    try {
      // Emergency admin recovery - forcing sign out

      // STEP 1: Force sign out of current user (critical!)
      await clerk.signOut();

      // STEP 2: Clear all testing modes
      if (isTestingRole) {
        stopRoleTesting();
      }

      // STEP 3: Clear test user mode
      clearOriginalAdminEmail();
      localStorage.removeItem('clinicpro-test-mode-admin-email');

      // STEP 4: Wait for sign out to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // STEP 5: Get admin email and redirect
      const adminEmail = originalAdminEmail || localStorage.getItem('clinicpro-test-mode-admin-email');

      if (adminEmail) {
        // Redirecting to admin login
        window.location.href = `/login?email=${encodeURIComponent(adminEmail)}`;
      } else {
        // No admin email found, going to login page
        window.location.href = '/login';
      }
    } catch {
      // Emergency recovery failed - nuclear option: force page reload to clear everything
      localStorage.removeItem('clinicpro-test-mode-admin-email');
      window.location.href = '/login';
    }
  };

  const handleClearAllTestingData = async () => {
    try {
      // Nuclear option - clearing everything

      // Force sign out
      await clerk.signOut();

      // Clear all testing data
      localStorage.removeItem('clinicpro-test-mode-admin-email');
      if (isTestingRole) {
        stopRoleTesting();
      }
      if (isTestUserMode) {
        clearOriginalAdminEmail();
      }

      // Clear all localStorage data related to our app
      Object.keys(localStorage).forEach((key) => {
        if (key.includes('clinicpro') || key.includes('clerk')) {
          localStorage.removeItem(key);
        }
      });

      // Wait and redirect
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.href = '/login';
    } catch {
      // Nuclear clear failed - force reload
      window.location.reload();
    }
  };

  // New: Force manual admin login (bypasses all automation)
  const handleForceManualLogin = async () => {
    try {
      // Force manual login - signing out and clearing everything
      await clerk.signOut();
      localStorage.clear();
      sessionStorage.clear();
      await new Promise(resolve => setTimeout(resolve, 1500));
      window.location.href = '/login';
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">
            Emergency Admin Access
          </h1>
          <p className="mb-6 text-gray-600">
            Use this page to get back to admin access if you're stuck in test mode.
          </p>
        </div>

        {/* Current Status */}
        <div className="mb-6 rounded bg-gray-100 p-4">
          <h3 className="mb-2 font-medium text-gray-900">Current Status:</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>
              â€¢ Role Impersonation:
              {isTestingRole ? 'âœ… Active' : 'âŒ Inactive'}
            </li>
            <li>
              â€¢ Test User Login:
              {isTestUserMode ? 'âœ… Active' : 'âŒ Inactive'}
            </li>
            <li>
              â€¢ Stored Admin Email:
              {originalAdminEmail || 'None'}
            </li>
            <li>
              â€¢ Current User:
              {user?.emailAddresses?.[0]?.emailAddress || 'Not logged in'}
            </li>
            <li>
              â€¢ LocalStorage Backup:
              {localStorageChecked ? 'âœ… Found' : 'âŒ Not found'}
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleBackToAdmin}
            className="w-full rounded bg-red-600 px-4 py-3 font-medium text-white transition-colors hover:bg-red-700"
          >
            Back to Admin Login (Improved)
          </button>

          <button
            type="button"
            onClick={handleForceManualLogin}
            className="w-full rounded bg-orange-600 px-4 py-3 font-medium text-white transition-colors hover:bg-orange-700"
          >
            FORCE Sign Out & Manual Login
          </button>

          <button
            type="button"
            onClick={handleClearAllTestingData}
            className="w-full rounded bg-gray-600 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-700"
          >
            Nuclear Option (Clear Everything)
          </button>

          <a
            href="/login"
            className="block w-full rounded bg-blue-600 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-blue-700"
          >
            â†—ï¸ Direct Login Page
          </a>
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded bg-blue-50 p-4 text-sm text-blue-800">
          <p className="mb-2 font-medium">How to use (try in order):</p>
          <ol className="space-y-1">
            <li>
              <strong>1. "Back to Admin Login"</strong>
              {' '}
              - Improved with proper sign out
            </li>
            <li>
              <strong>2. "FORCE Sign Out"</strong>
              {' '}
              - If still stuck, this clears everything
            </li>
            <li>
              <strong>3. "Nuclear Option"</strong>
              {' '}
              - Clears all app data (last resort)
            </li>
            <li>
              <strong>4. "Direct Login Page"</strong>
              {' '}
              - Manual login without automation
            </li>
          </ol>
        </div>

        {/* Access Info */}
        <div className="mt-4 text-center text-xs text-gray-500">
          Bookmark this page:
          {' '}
          <strong>/emergency-admin</strong>
        </div>
      </div>
    </div>
  );
}
