'use client';

import { useUser } from '@clerk/nextjs';

import { DashboardHeader } from '@/src/shared/components/DashboardHeader';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

export default function SettingsPage() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Not signed in</h2>
          <p className="text-gray-600">Please sign in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Page Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">
              Manage your account preferences and configuration
            </p>
          </div>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View and manage your account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* User Profile Section */}
                <div className="flex items-center space-x-4">
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="size-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {user.firstName}
{' '}
{user.lastName}
                    </h3>
                    <p className="text-gray-600">
                      {user.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Member Since:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(user.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Delete Account</span>
                    <p className="text-sm text-gray-600">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
