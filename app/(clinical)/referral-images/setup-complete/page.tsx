'use client';

import { CheckCircle, Copy, Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const STORAGE_DESKTOP = 'referral-images-desktop-link';
const STORAGE_MOBILE = 'referral-images-mobile-link';

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') {
 return false;
}
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod|Android/i.test(ua);
}

function ReferralImagesSetupCompleteContent() {
  const searchParams = useSearchParams();
  const userId = searchParams?.get('u');

  const [desktopLink, setDesktopLink] = useState('');
  const [mobileLink, setMobileLink] = useState('');
  const [desktopCopied, setDesktopCopied] = useState(false);
  const [mobileCopied, setMobileCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !userId) {
 return;
}

    const storedDesktop = sessionStorage.getItem(STORAGE_DESKTOP);
    const storedMobile = sessionStorage.getItem(STORAGE_MOBILE);

    if (storedDesktop && storedMobile) {
      setDesktopLink(storedDesktop);
      setMobileLink(storedMobile);
    } else {
      const origin = window.location.origin;
      setDesktopLink(`${origin}/referral-images/desktop?u=${userId}`);
      setMobileLink(`${origin}/referral-images/capture?u=${userId}`);
    }
  }, [userId]);

  const copyDesktop = async () => {
    if (!desktopLink) {
 return;
}
    try {
      await navigator.clipboard.writeText(desktopLink);
      setDesktopCopied(true);
      setTimeout(() => setDesktopCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyMobile = async () => {
    if (!mobileLink) {
 return;
}
    try {
      await navigator.clipboard.writeText(mobileLink);
      setMobileCopied(true);
      setTimeout(() => setMobileCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openDesktopPage = () => {
    const url = desktopLink || (typeof window !== 'undefined' ? `${window.location.origin}/referral-images/desktop?u=${userId}` : '');
    if (url) {
 window.location.href = url;
}
  };

  const openMobilePage = () => {
    const url = mobileLink || (typeof window !== 'undefined' ? `${window.location.origin}/referral-images/capture?u=${userId}` : '');
    if (url) {
 window.location.href = url;
}
  };

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">
          <p className="text-text-secondary">Missing user ID. Please sign up from the landing page.</p>
        </div>
      </div>
    );
  }

  const mobile = isMobileDevice();

  return (
    <div className="min-h-screen bg-background p-4 pb-12">
      <div className="mx-auto max-w-lg">
        {/* 1. Reassurance first */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-4xl">✅</span>
          </div>
          <p className="mb-2 flex items-center justify-center gap-2 text-text-secondary">
            <Mail className="size-5 shrink-0" />
            We&apos;ve emailed your links to you
          </p>
          <h1 className="text-2xl font-bold text-text-primary">Setup complete. You&apos;re all set.</h1>
        </div>

        {/* 2. How it works */}
        <div className="mb-6 rounded-lg border border-border bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-text-primary">How it works</h2>
          <ol className="list-inside list-decimal space-y-2 text-text-secondary">
            <li>
<strong className="text-text-primary">On your computer:</strong>
{' '}
Open the desktop link and leave the tab open
            </li>
            <li>
<strong className="text-text-primary">On your phone:</strong>
{' '}
Open the mobile page (or add it to your home screen)
            </li>
            <li>
<strong className="text-text-primary">Take a photo</strong>
{' '}
and watch it appear on your desktop instantly
            </li>
          </ol>
          {mobile && (
            <p className="mt-4 text-sm text-text-secondary">
              Photos you take on your phone are sent to your desktop page. Open the desktop link on your computer to view and download.
            </p>
          )}
        </div>

        {/* 3. Primary CTA */}
        <div className="mb-8">
          {mobile
? (
            <button
              onClick={openMobilePage}
              className="w-full rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Start taking photos
            </button>
          )
: (
            <button
              onClick={openDesktopPage}
              className="w-full rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              Open desktop page
            </button>
          )}
        </div>

        {/* 4. Links (reference / bookmarking) */}
        <p className="mb-3 text-sm text-text-tertiary">Your links (for reference or bookmarking)</p>

        <div className="mb-4 rounded-lg border border-border bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">🖥️</span>
            <h3 className="text-base font-semibold text-text-primary">Desktop link</h3>
          </div>
          <div className="mb-2 flex flex-wrap gap-2">
            <input
              type="text"
              readOnly
              value={desktopLink}
              onClick={e => (e.target as HTMLInputElement).select()}
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary"
            />
            <button
              onClick={copyDesktop}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark"
            >
              {desktopCopied ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}
              {desktopCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-border bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">📱</span>
            <h3 className="text-base font-semibold text-text-primary">Mobile link</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              readOnly
              value={mobileLink}
              onClick={e => (e.target as HTMLInputElement).select()}
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary"
            />
            <button
              onClick={copyMobile}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-dark"
            >
              {mobileCopied ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}
              {mobileCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-text-tertiary">
          These links work forever. Bookmark them.
        </p>
      </div>
    </div>
  );
}

export default function ReferralImagesSetupCompletePage() {
  return (
    <Suspense
      fallback={(
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-text-secondary">Loading...</p>
        </div>
      )}
    >
      <ReferralImagesSetupCompleteContent />
    </Suspense>
  );
}
