'use client';

import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';

import { PlanCard } from '@/src/shared/components/billing/PlanCard';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import type { UserTier } from '@/src/shared/utils/roles';

type BillingPageClientProps = {
  currentTier: UserTier;
};

export function BillingPageClient({ currentTier }: BillingPageClientProps) {
  const { userId: _userId } = useAuth();
  const { user } = useClerkMetadata();
  const [_isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (_planTier: UserTier) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Failed to create checkout session');
        // TODO: Replace with proper toast notification
        console.error('Something went wrong. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      // TODO: Replace with proper toast notification
      console.error('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
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
          onUpgrade={handleUpgrade}
        />

        <PlanCard
          planTier="premium"
          currentUserTier={currentTier}
          onUpgrade={handleUpgrade}
        />
      </div>
    </div>
  );
}

export default BillingPageClient;
