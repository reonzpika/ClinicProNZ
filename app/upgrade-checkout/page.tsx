'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';

import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';

export default function UpgradeCheckoutPage() {
  const { userId, isLoaded } = useAuth();
  const { user } = useClerkMetadata();
  const [hasTriggered, setHasTriggered] = useState(false);
  const [status, setStatus] = useState('Loading...');

  const handleUpgrade = useCallback(async () => {
    try {
      setStatus('Creating checkout session...');

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
        setStatus('Redirecting to Stripe...');
        window.location.href = url;
      } else {
        setStatus('Redirecting to consultation...');
        // Fallback to consultation with upgrade banner
        setTimeout(() => {
          window.location.href = '/ai-scribe/consultation?showUpgrade=true';
        }, 1000);
      }
    } catch {
      setStatus('Redirecting to consultation...');
      // Fallback to consultation with upgrade banner
      setTimeout(() => {
        window.location.href = '/ai-scribe/consultation?showUpgrade=true';
      }, 1000);
    }
  }, [user?.primaryEmailAddress?.emailAddress]);

  useEffect(() => {
    // Wait for Clerk to load
    if (!isLoaded) {
      setStatus('Setting up your account...');
      return;
    }

    // Ensure we have user data
    if (!userId || !user?.primaryEmailAddress?.emailAddress) {
      setStatus('Finalizing account setup...');
      // Fallback after 3 seconds if no user data
      setTimeout(() => {
        window.location.href = '/ai-scribe/consultation?showUpgrade=true';
      }, 3000);
      return;
    }

    // Prevent double execution
    if (hasTriggered) {
      return;
    }
    setHasTriggered(true);

    // Small delay to ensure everything is ready, then trigger upgrade
    setStatus('Redirecting to checkout...');
    setTimeout(() => {
      handleUpgrade();
    }, 200);
  }, [isLoaded, userId, user, hasTriggered, handleUpgrade]);

  // Fallback safety net after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasTriggered) {
        window.location.href = '/ai-scribe/consultation?showUpgrade=true';
      }
    }, 8000);

    return () => {
      clearTimeout(timer);
    };
  }, [hasTriggered]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-blue-100">
            <svg className="size-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Setting up your upgrade</h1>
        <p className="mt-2 text-sm text-gray-600">{status}</p>
        <p className="mt-4 text-xs text-gray-500">This should only take a moment...</p>
      </div>
    </div>
  );
}
