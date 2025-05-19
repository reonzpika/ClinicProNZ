'use client';

import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/consultation');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-3xl text-center">
        <h1 className="mb-6 text-5xl font-bold text-gray-900">
          ConsultAI NZ
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          AI-powered medical consultation platform for New Zealand healthcare professionals
        </p>
        <div className="mb-12">
          <Link
            href="/consultation"
            className="rounded-lg bg-blue-600 px-8 py-3 text-lg text-white hover:bg-blue-700"
          >
            Start Using Now
          </Link>
        </div>
        <div className="space-y-4">
          <p className="text-gray-600">Want to create and manage custom templates?</p>
          <div className="space-x-4">
            <SignInButton mode="modal">
              <button type="button" className="rounded-lg border-2 border-blue-600 bg-white px-6 py-2 text-blue-600 hover:bg-blue-50">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button type="button" className="rounded-lg border-2 border-gray-300 px-6 py-2 text-gray-600 hover:bg-gray-50">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </div>
  );
}
