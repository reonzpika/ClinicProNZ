'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Copy, Mail, CheckCircle } from 'lucide-react';

const STORAGE_DESKTOP = 'referral-images-desktop-link';
const STORAGE_MOBILE = 'referral-images-mobile-link';

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
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
    if (typeof window === 'undefined' || !userId) return;

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
    if (!desktopLink) return;
    try {
      await navigator.clipboard.writeText(desktopLink);
      setDesktopCopied(true);
      setTimeout(() => setDesktopCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyMobile = async () => {
    if (!mobileLink) return;
    try {
      await navigator.clipboard.writeText(mobileLink);
      setMobileCopied(true);
      setTimeout(() => setMobileCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const emailDesktop = () => {
    window.location.href = `mailto:?subject=GP Referral Images Desktop Link&body=Bookmark this on your computer:%0A%0A${encodeURIComponent(desktopLink)}`;
  };

  const openDesktopPage = () => {
    window.location.href = desktopLink;
  };

  const openMobilePage = () => {
    window.location.href = mobileLink;
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <p className="text-text-secondary">Missing user ID. Please sign up from the landing page.</p>
        </div>
      </div>
    );
  }

  const mobile = isMobileDevice();

  return (
    <div className="min-h-screen bg-background p-4 pb-12">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Setup Complete!</h1>
          <p className="text-text-secondary">Your referral images links are ready:</p>
        </div>

        {/* Desktop Link */}
        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🖥️</span>
            <h3 className="text-lg font-semibold text-text-primary">Desktop Link</h3>
          </div>
          <p className="text-sm text-text-secondary mb-3">Use this on your computer to view images</p>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              readOnly
              value={desktopLink}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg font-mono text-sm text-text-primary"
            />
            <button
              onClick={copyDesktop}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 shrink-0"
            >
              {desktopCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {desktopCopied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={emailDesktop}
              className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors flex items-center gap-2 shrink-0"
            >
              <Mail className="w-4 h-4" />
              Email Me
            </button>
          </div>
        </div>

        {/* Mobile Link */}
        <div className="bg-white rounded-lg border border-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📱</span>
            <h3 className="text-lg font-semibold text-text-primary">Mobile Link</h3>
          </div>
          <p className="text-sm text-text-secondary mb-3">Save this to your phone&apos;s home screen</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={mobileLink}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg font-mono text-sm text-text-primary"
            />
            <button
              onClick={copyMobile}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 shrink-0"
            >
              {mobileCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {mobileCopied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="text-center text-text-tertiary text-sm mb-6">
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        </div>
        <p className="text-center text-text-secondary text-sm mb-6">
          📧 We&apos;ve also emailed these links to you
        </p>

        {mobile ? (
          <button
            onClick={openMobilePage}
            className="w-full py-4 px-6 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold text-lg"
          >
            Open Mobile Page
          </button>
        ) : (
          <button
            onClick={openDesktopPage}
            className="w-full py-4 px-6 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold text-lg"
          >
            Open Desktop Page
          </button>
        )}

        <p className="text-center text-text-tertiary text-sm mt-4">
          These links work forever - bookmark them!
        </p>
      </div>
    </div>
  );
}

export default function ReferralImagesSetupCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-text-secondary">Loading...</p>
        </div>
      }
    >
      <ReferralImagesSetupCompleteContent />
    </Suspense>
  );
}
