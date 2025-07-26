import { redirect } from 'next/navigation';

import { BillingPageClient } from '@/src/shared/components/billing/BillingPageClient';
import { UsageLimits } from '@/src/shared/components/billing/UsageLimits';
import { getCurrentTier, hasTier } from '@/src/shared/utils/roles-server';

// Force dynamic rendering since this page depends on user authentication
export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  // Require at least basic tier to access billing (allow basic users to upgrade)
  const hasAccess = await hasTier('basic');
  if (!hasAccess) {
    redirect('/login');
  }

  const currentTier = await getCurrentTier();

  // Mock usage data - in real app, fetch from rate limit store
  const currentUsage = {
    requestsToday: 8,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
            <p className="mt-2 text-gray-600">
              Manage your subscription and view usage limits
            </p>
          </div>

          {/* Current Usage */}
          <div className="mb-8">
            <UsageLimits tier={currentTier} currentUsage={currentUsage} />
          </div>

          {/* Plan Cards with Client-side functionality */}
          <BillingPageClient currentTier={currentTier} />

          {/* Billing History */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Billing History
            </h3>
            <p className="text-gray-600">
              Your billing history will appear here when you have an active subscription.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
