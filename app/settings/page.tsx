import { UserButton, UserProfile } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { ArrowLeft, Bell, CreditCard, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { checkRole } from '@/shared/utils/roles';

export default async function SettingsPage() {
  // Ensure user is authenticated
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  const hasAccess = await checkRole('signed_up');
  if (!hasAccess) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
              >
                <ArrowLeft className="size-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500">Manage your account and preferences</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-900">Profile & Security</h4>
                  <p className="text-xs text-gray-500">
                    Managed through Clerk authentication - includes profile, email, password, and 2FA settings.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/billing" className="flex items-center gap-2">
                      <CreditCard className="size-4" />
                      Billing & Subscription
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/roadmap" className="flex items-center gap-2">
                      <Bell className="size-4" />
                      Feature Requests
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/contact" className="flex items-center gap-2">
                      <Shield className="size-4" />
                      Support & Privacy
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="ghost" size="sm" className="w-full justify-start text-left">
                  <Link href="/templates">
                    Manage Templates
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="w-full justify-start text-left">
                  <Link href="/consultation">
                    Start Consultation
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="w-full justify-start text-left">
                  <a href="mailto:support@clinicpro.co.nz">
                    Contact Support
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Clerk User Profile */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-hidden rounded-lg">
                  <UserProfile
                    appearance={{
                      elements: {
                        rootBox: 'w-full',
                        card: 'shadow-none border-none',
                        navbar: 'hidden',
                        pageScrollBox: 'p-6',
                        profilePage: 'gap-6',
                        profileSection: 'bg-white rounded-lg border border-gray-200 p-4',
                        profileSectionTitle: 'text-lg font-semibold text-gray-900 mb-4',
                        profileSectionContent: 'space-y-4',
                        formFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                        formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                        dividerLine: 'bg-gray-200',
                        dividerText: 'text-gray-500',
                      },
                      layout: {
                        showOptionalFields: true,
                      },
                    }}
                    routing="path"
                    path="/settings"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
