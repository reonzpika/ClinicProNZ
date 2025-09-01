'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Only redirect unauthenticated users to early access page
      router.push('/landing-page');
    }
  }, [isLoaded, isSignedIn, router]);

  // Loading state while auth is being determined
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-nz-green-300 border-t-nz-green-600"></div>
          <p className="text-gray-600">Loading ClinicPro...</p>
        </div>
      </div>
    );
  }

  // Authenticated users see the main dashboard/landing
  if (isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Welcome to ClinicPro</h1>
          <p className="mb-8 text-lg text-gray-600">Choose a tool to get started</p>
          <div className="space-y-4">
            <a
              href="/consultation"
              className="block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              Consultation Assistant
            </a>
            <a
              href="/image"
              className="block rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700"
            >
              Clinical Image Analysis
            </a>
            <a
              href="/dashboard"
              className="block rounded-lg bg-gray-600 px-6 py-3 text-white hover:bg-gray-700"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // This shouldn't render (unauthenticated users are redirected)
  return null;
}
