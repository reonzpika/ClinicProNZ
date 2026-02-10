import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { checkTierFromSessionClaims } from '@/src/shared/utils/roles';

import { ReferralImagesAnalytics } from './ReferralImagesAnalytics';

export default async function AdminReferralImagesPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    redirect('/login');
  }

  const isAdmin = checkTierFromSessionClaims(sessionClaims, 'admin');
  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Referral Images Analytics</h1>
          <p className="mt-1 text-gray-600">
            Share and referral metrics for GP Referral Images
          </p>
        </div>
        <ReferralImagesAnalytics />
      </div>
    </div>
  );
}
