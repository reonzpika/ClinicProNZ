import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import SessionStats from '@/src/features/user/dashboard/components/SessionStats';
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
          <SessionStats />
        </div>
      </main>
    </div>
  );
}
