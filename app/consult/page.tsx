'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ConsultPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the consultation page
    router.replace('/consultation');
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-nz-green-300 border-t-nz-green-600"></div>
        <p className="text-gray-600">Redirecting to consultation...</p>
      </div>
    </div>
  );
}