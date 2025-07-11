import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import QuickToolAccess from '@/src/features/user/dashboard/components/QuickToolAccess';
import UpgradeCTA from '@/src/features/user/dashboard/components/UpgradeCTA';
import UsageTracker from '@/src/features/user/dashboard/components/UsageTracker';
import { DashboardHeader } from '@/src/shared/components/DashboardHeader';
import { checkRole } from '@/src/shared/utils/roles';

export default async function DashboardPage() {
  // Ensure user is authenticated and has at least signed_up role
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
      <DashboardHeader />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Quick Tool Access */}
            <QuickToolAccess />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Usage Tracker */}
            <UsageTracker />

            {/* Upgrade CTA */}
            <UpgradeCTA />

            {/* Quick Links Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 font-medium text-gray-900">Quick Links</h3>
              <div className="space-y-2">
                <a
                  href="/billing"
                  className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Manage Billing
                </a>
                <a
                  href="/settings"
                  className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Account Settings
                </a>
                <a
                  href="/roadmap"
                  className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Feature Roadmap
                </a>
                <a
                  href="/contact"
                  className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Contact Support
                </a>
              </div>
            </div>

            {/* Tips Card */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-medium text-blue-900">ðŸ’¡ Quick Tip</h3>
              <p className="text-sm text-blue-700">
                Start with the Consultation Suite to create your first AI-powered clinical note.
                Use templates to speed up your documentation workflow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
