'use client';

import { useSignIn } from '@clerk/nextjs';
import { useState } from 'react';

import { useTestUser } from '@/src/shared/contexts/TestUserContext';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import type { UserRole } from '@/src/shared/utils/roles';

// Type assertion for Clerk on window
type ClerkWindow = Window & {
  Clerk?: {
    signOut: () => Promise<void>;
  };
};

type TestUser = {
  role: UserRole;
  email: string;
  password: string;
  description: string;
  color: string;
};

const TEST_USERS: TestUser[] = [
  {
    role: 'public',
    email: 'test-public@clinicpro-staging.com',
    password: 'test',
    description: 'Unauthenticated state',
    color: 'bg-gray-500 hover:bg-gray-600',
  },
  {
    role: 'signed_up',
    email: 'test-signedup@clinicpro-staging.com',
    password: 'test',
    description: 'New user (20 req/day)',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    role: 'standard',
    email: 'test-standard@clinicpro-staging.com',
    password: 'test',
    description: 'Paid user (1000 req/day)',
    color: 'bg-green-500 hover:bg-green-600',
  },
];

export function TestUserLogin() {
  const { signIn, isLoaded } = useSignIn();
  const { user: _user } = useClerkMetadata();
  const { setOriginalAdminEmail } = useTestUser();
  const [loading, setLoading] = useState<string | null>(null);
  const [adminEmail] = useState(_user?.emailAddresses?.[0]?.emailAddress || '');

  const handleTestLogin = async (testUser: TestUser) => {
    if (!isLoaded || !signIn) {
      return;
    }

    try {
      setLoading(testUser.role);

      // Store admin email before switching (critical for getting back!)
      if (adminEmail) {
        setOriginalAdminEmail(adminEmail);
      }

      if (testUser.role === 'public') {
        // Sign out for public testing
        await (window as ClerkWindow).Clerk?.signOut();
        window.location.reload();
        return;
      }

      // Must sign out first before signing in as different user
      await (window as ClerkWindow).Clerk?.signOut();

      // Small delay to ensure sign out completes
      await new Promise(resolve => setTimeout(resolve, 500));

      await signIn.create({
        identifier: testUser.email,
        password: testUser.password,
      });
      // Redirect to dashboard after login
      window.location.href = '/dashboard';
    } catch (error: any) {
      // Show more specific error message
      let errorMessage = 'Test login failed. ';

      if (error?.errors?.[0]?.code === 'form_identifier_not_found') {
        errorMessage += `User ${testUser.email} doesn't exist in Clerk. Please create this user first.`;
      } else if (error?.errors?.[0]?.code === 'form_password_incorrect') {
        errorMessage += `Wrong password for ${testUser.email}. Check if password is "test" in Clerk.`;
      } else if (error?.errors?.[0]?.code) {
        errorMessage += `Error code: ${error.errors[0].code}. Message: ${error.errors[0].message || 'No message'}`;
      } else if (error?.status === 400) {
        errorMessage += `400 Bad Request. Likely user doesn't exist or wrong credentials.`;
      } else {
        errorMessage += `Unknown error (status: ${error?.status}). Check browser console for details.`;
      }

      // TODO: Replace with proper error handling UI
      console.error(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const handleBackToAdmin = async () => {
    if (!adminEmail) {
      // TODO: Replace with proper error handling UI
      console.error('Admin email not found. Please login manually.');
      return;
    }

    setLoading('admin');
    try {
      // Redirect to sign in with admin email pre-filled
      window.location.href = `/login?email=${encodeURIComponent(adminEmail)}`;
    } catch {
      // Error handling for redirect failure
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-blue-900">
          👥 Test User Quick Login
        </h3>
        <button
          type="button"
          onClick={handleBackToAdmin}
          disabled={loading !== null}
          className="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-3 py-2 text-sm font-medium leading-4 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {loading === 'admin' ? 'Loading...' : '🔙 Back to Admin'}
        </button>
      </div>

      <div className="mb-4 rounded bg-blue-100 p-3">
        <h4 className="mb-2 text-sm font-medium text-blue-900">Full Backend Testing</h4>
        <p className="text-sm text-blue-800">
          These buttons switch to actual test user accounts for complete role testing including backend APIs,
          middleware, and rate limiting.
        </p>
      </div>

      {/* Test User Buttons */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {TEST_USERS.map(testUser => (
          <button
            key={testUser.role}
            type="button"
            onClick={() => handleTestLogin(testUser)}
            disabled={loading !== null}
            className={`rounded-lg p-4 text-white transition-colors ${testUser.color} disabled:cursor-not-allowed disabled:bg-gray-300`}
          >
            <div className="text-sm font-medium capitalize">
              {loading === testUser.role ? 'Logging in...' : testUser.role}
            </div>
            <div className="mt-1 text-xs opacity-90">
              {testUser.description}
            </div>
          </button>
        ))}
      </div>

      {/* Setup Instructions */}
      <div className="mt-4 rounded border bg-white p-3">
        <h4 className="mb-2 text-sm font-medium text-gray-900">⚙️ Test User Setup Required</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p><strong>1. Create test users in Clerk Dashboard:</strong></p>
          <ul className="ml-4 space-y-1 text-xs">
            {TEST_USERS.map(user => (
              <li key={user.email}>
                •
                {user.email}
                {' '}
                (role:
                {user.role}
                )
              </li>
            ))}
          </ul>
          <p className="mt-2">
            <strong>2. Set password to:</strong>
            {' '}
            <code className="rounded bg-gray-100 px-1">test</code>
          </p>
          <p className="mt-1"><strong>3. Set their roles in publicMetadata:</strong></p>
          <code className="rounded bg-gray-100 px-1 text-xs">{'{ "role": "signed_up" }'}</code>
        </div>
      </div>

      {/* Current User Info */}
      {_user && (
        <div className="mt-4 rounded border border-green-200 bg-green-100 p-3">
          <div className="text-sm">
            <strong>Current Admin:</strong>
            {' '}
            {_user.emailAddresses?.[0]?.emailAddress}
          </div>
        </div>
      )}
    </div>
  );
}
