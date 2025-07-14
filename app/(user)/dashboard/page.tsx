import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { QuickToolAccess } from '@/src/features/user/dashboard/components/QuickToolAccess';
import { UpgradeCTA } from '@/src/features/user/dashboard/components/UpgradeCTA';
import UsageTracker from '@/src/features/user/dashboard/components/UsageTracker';
import { DashboardHeader } from '@/src/shared/components/DashboardHeader';
import { checkTierFromSessionClaims } from '@/src/shared/utils/roles';

export default async function DashboardPage() {
  // Ensure user is authenticated and has at least basic tier
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Quick Actions */}
          <QuickToolAccess />

          {/* Usage Tracking */}
          <UsageTracker />

          {/* Upgrade CTA */}
          <UpgradeCTA />
        </div>
      </main>
    </div>
  );
}
