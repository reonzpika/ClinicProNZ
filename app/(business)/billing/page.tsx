import { redirect } from 'next/navigation';

import { PlanCard } from '@/src/shared/components/billing/PlanCard';
import { UsageLimits } from '@/src/shared/components/billing/UsageLimits';
import { getCurrentTier, hasTier } from '@/src/shared/utils/roles-server';

// Force dynamic rendering since this page depends on user authentication
export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  // Require at least standard tier to access billing
  const hasAccess = await hasTier('standard');
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

          {/* Plan Cards */}
          <div className="mb-8">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              Available Plans
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              <PlanCard
                planTier="basic"
                currentUserTier={currentTier}
              />

              <PlanCard
                planTier="standard"
                currentUserTier={currentTier}
                onUpgrade={async (_planTier) => {
                  'use server';
                  // In real implementation, redirect to Stripe checkout
                  // TODO: Implement Stripe checkout integration
                  // redirect('/api/create-checkout-session?planTier=' + _planTier);
                }}
              />

              <PlanCard
                planTier="premium"
                currentUserTier={currentTier}
                onUpgrade={async (_planTier) => {
                  'use server';
                  // In real implementation, redirect to Stripe checkout
                  // TODO: Implement Stripe checkout integration
                  // redirect('/api/create-checkout-session?planTier=' + _planTier);
                }}
              />
            </div>
          </div>

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
