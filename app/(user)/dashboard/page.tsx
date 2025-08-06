import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { AnalyticsDashboard } from '@/src/features/user/dashboard/components/AnalyticsDashboard';
import UsageTracker from '@/src/features/user/dashboard/components/UsageTracker';
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
    <div className="space-y-8">
      {/* GP Analytics Dashboard */}
      <AnalyticsDashboard />

      {/* Usage Tracking - kept from original dashboard */}
      <div className="mx-auto max-w-7xl px-6">
        <UsageTracker />
      </div>
    </div>
  );
}
