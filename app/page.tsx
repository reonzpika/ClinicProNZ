'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        // All authenticated users go to consultation
        router.push('/consultation');
      } else {
        // Unauthenticated users go to landing page
        router.push('/landing-page');
      }
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while auth is being determined
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-nz-green-300 border-t-nz-green-600"></div>
        <p className="text-gray-600">Loading ClinicPro...</p>
      </div>
    </div>
  );
}
