import { PlanCard } from '@/shared/components/billing/PlanCard';
import { UsageLimits } from '@/shared/components/billing/UsageLimits';
import { requireRole } from '@/shared/utils/roles';

export default async function BillingPage() {
  // Require at least signed_up role to access billing
  const currentRole = await requireRole('signed_up');

  // Removed unused function - Stripe integration would go here

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
            <UsageLimits
              role={currentRole}
              currentUsage={{ sessionsToday: currentUsage.requestsToday }}
            />
          </div>

          {/* Available Plans */}
          <div className="mb-8">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              Available Plans
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <PlanCard
                role="signed_up"
                currentUserRole={currentRole}
              />

              <PlanCard
                role="standard"
                currentUserRole={currentRole}
                onUpgrade={async (role) => {
                  'use server';
                  // In real implementation, redirect to Stripe checkout
                  console.log(`Upgrade to ${role} requested`);
                  // redirect('/api/create-checkout-session?role=' + role);
                }}
              />
            </div>
          </div>

          {/* Billing History */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Billing History
            </h3>

            <div className="py-8 text-center">
              <p className="text-gray-500">
                {currentRole === 'signed_up'
                  ? 'No billing history yet. Upgrade to see your invoices here.'
                  : 'Your billing history will appear here once we integrate with Stripe.'}
              </p>
            </div>
          </div>

          {/* Role Information */}
          <div className="mt-8 rounded-lg bg-blue-50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-blue-900">
              Your Current Role:
              {' '}
              {currentRole}
            </h3>
            <div className="text-sm text-blue-700">
              <p>• Public: No access to protected features</p>
              <p>• Signed Up: Basic access with usage limits</p>
              <p>• Standard: Full access with no limits</p>
              <p>• Admin: Administrative access to all features</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
