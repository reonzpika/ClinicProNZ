import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { DashboardHeader } from '@/src/shared/components/DashboardHeader';
import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { checkTierFromSessionClaims } from '@/src/shared/utils/roles';

export default async function SettingsPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    redirect('/login');
  }

  const hasAccess = checkTierFromSessionClaims(sessionClaims, 'basic');
  if (!hasAccess) {
    redirect('/login');
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">User ID:</span>
                  <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                    {userId}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Current Tier:</span>
                  <Badge variant="secondary">
                    {(sessionClaims as any)?.metadata?.tier || 'basic'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Account Status:</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Current Plan:</span>
                  <span className="capitalize">
                    {(sessionClaims as any)?.metadata?.tier || 'basic'}
                    {' '}
                    tier
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Billing Status:</span>
                  <Badge variant="default">
                    {(sessionClaims as any)?.metadata?.subscriptionStatus || 'Active'}
                  </Badge>
                </div>
                <div className="pt-4">
                  <Button>
                    Manage Subscription
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your ClinicPro experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Email Notifications:</span>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Data Export:</span>
                  <Button variant="outline" size="sm">
                    Export Data
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Account Privacy:</span>
                  <Button variant="outline" size="sm">
                    Privacy Settings
                  </Button>
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
