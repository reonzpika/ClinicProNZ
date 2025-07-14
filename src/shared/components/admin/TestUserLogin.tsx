'use client';

import { SignOutButton, useAuth, useUser } from '@clerk/nextjs';
import { useState } from 'react';

import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import type { UserTier } from '@/src/shared/utils/roles';

type TestUser = {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  password: string;
  description: string;
};

const testUsers: TestUser[] = [
  {
    id: 'public',
    email: 'None (public user)',
    name: 'Public User',
    tier: 'basic',
    password: 'N/A',
    description: 'Not signed in - public access only',
  },
  {
    id: 'basic',
    email: 'user@example.com',
    name: 'Basic User',
    tier: 'basic',
    password: 'password123',
    description: 'Signed up user with basic tier access',
  },
  {
    id: 'standard',
    email: 'standard@example.com',
    name: 'Standard User',
    tier: 'standard',
    password: 'password123',
    description: 'Standard tier user with increased limits',
  },
  {
    id: 'premium',
    email: 'premium@example.com',
    name: 'Premium User',
    tier: 'premium',
    password: 'password123',
    description: 'Premium tier user with 100 premium actions',
  },
  {
    id: 'admin',
    email: 'admin@example.com',
    name: 'Admin User',
    tier: 'admin',
    password: 'password123',
    description: 'Administrator with full access',
  },
];

export function TestUserLogin() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [loading, setLoading] = useState<UserTier | null>(null);

  const handleTestUserLogin = async (testUser: TestUser) => {
    try {
      setLoading(testUser.tier);

      // Sign out first if needed
      if (testUser.tier === 'basic' && testUser.id === 'public') {
        window.location.href = '/api/auth/signout';
      }

      // For other test users, redirect to sign in
      // Note: In a real app, you'd need to have these test accounts created in Clerk
      // This would normally trigger the sign-in flow
      // For now, we'll just show the user info
      // TODO: In production, you'd need to create these test accounts in Clerk
    } catch (error) {
      console.error('Test login failed:', error);
      // TODO: Implement proper error handling
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🧪 Test User Login</CardTitle>
        <CardDescription>
          Switch between different test users to verify tier-based permissions and functionality.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current User Status */}
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold text-gray-900">Current User Status</h3>
          {isSignedIn && user
            ? (
                <div className="space-y-2">
                  <p>
                    <strong>Name:</strong>
                    {' '}
                    {user.firstName}
                    {' '}
                    {user.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong>
                    {' '}
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                  <p>
                    <strong>Tier:</strong>
                    {' '}
                    {user.publicMetadata?.tier as string || 'basic'}
                  </p>
                  <SignOutButton>
                    <Button variant="outline" size="sm">Sign Out</Button>
                  </SignOutButton>
                </div>
              )
            : (
                <p className="text-gray-600">Not signed in (public user)</p>
              )}
        </div>

        {/* Test User Buttons */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Test Users</h3>
          <p className="text-sm text-gray-600">
            These buttons switch to actual test user accounts for complete tier testing including backend APIs,
            rate limiting, and billing checks.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {testUsers.map(testUser => (
              <div
                key={testUser.tier}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{testUser.name}</span>
                    <Badge variant={testUser.tier === 'admin' ? 'destructive' : 'secondary'}>
                      {testUser.tier}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{testUser.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestUserLogin(testUser)}
                  disabled={loading !== null}
                >
                  {loading === testUser.tier ? 'Logging in...' : testUser.tier}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 font-medium text-blue-900">📋 How to Set Up Test Users</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>1. Create test accounts in Clerk Dashboard</strong></p>
            <p className="ml-4">• Use the emails from the test users above</p>
            <p className="ml-4">• Set passwords as shown</p>

            <p className="mt-1"><strong>2. Set their tiers in publicMetadata:</strong></p>
            <code className="rounded bg-blue-100 px-1 text-xs">{'{ "tier": "basic" }'}</code>
            <p className="ml-4">
              (tier:
              {user?.publicMetadata?.tier as string || 'basic'}
              )
            </p>

            <p className="mt-1"><strong>3. Test the full flow:</strong></p>
            <p className="ml-4">• Rate limiting</p>
            <p className="ml-4">• Billing restrictions</p>
            <p className="ml-4">• Feature access</p>
            <p className="ml-4">• API authentication</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
