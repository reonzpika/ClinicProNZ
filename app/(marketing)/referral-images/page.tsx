'use client';

import { useAuth } from '@clerk/nextjs';
import { Camera, CheckCircle, Clock, FileImage, Loader2, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const LOADING_MESSAGES = [
  'Creating your account...',
  'Generating your links...',
  'Almost there.',
] as const;

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') {
 return false;
}
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export default function ReferralImagesLandingPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [hasSetup, setHasSetup] = useState<boolean | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSetupLoading, setIsSetupLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const referralImagesFaqItems = [
    {
      question: 'How does this save me >10 minutes per referral?',
      answer:
        'The old workflow: email photo to yourself → check email on desktop → download → open in image editor → resize → save → attach → hope it\'s under 500KB. When things go wrong, this takes ages. With Referral Images: take photo → it\'s on your desktop in 30 seconds, auto-sized as JPEG, ready to attach. That\'s it.',
    },
    {
      question: 'Does it work with HealthLink/Manawatū e-referral systems?',
      answer:
        'Yes. You get a JPEG file on your desktop (or download from the desktop page). You attach that file to your e-referral in HealthLink, Manawatū, or any system that accepts image attachments. We don\'t integrate directly into your PMS; you use the file where you need it.',
    },
    {
      question: 'Is my patient data secure?',
      answer:
        'Images are stored securely and automatically deleted after 24 hours. We don\'t use your images for training or share them with third parties. The service is built with NZ healthcare data standards in mind. For full details see our Privacy policy.',
    },
    {
      question: 'Why is it free?',
      answer:
        'Because GPs deserve better tools. I built this for myself and my colleagues. The goal is to make clinical work easier, not to extract value from doctors.',
    },
    {
      question: 'How is this different from MedImage?',
      answer:
        'MedImage requires installing software on your PC and costs NZ$15 + $3/month. We\'re browser-only and free. More importantly: MedImage can create PDFs. We only create JPEGs, because dermatologists reject PDFs and ask for JPEGs instead. Simple, free, always the right format.',
    },
    {
      question: 'Do I need to install anything?',
      answer:
        'No. You sign up, get a desktop link and a mobile link (save the mobile link to your home screen for one-tap access). Use your browser on desktop and your browser on phone. No app store install required.',
    },
  ];

  // Smart redirect: when signed in, check setup; if has setup, redirect to desktop or capture by device
  // If no setup, auto-trigger setup for seamless post-signup experience
  useEffect(() => {
    if (!isLoaded) {
 return;
}
    if (!userId) {
      setHasSetup(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/referral-images/check-setup?userId=${encodeURIComponent(userId)}`)
      .then((res) => {
        if (!res.ok) {
          if (!cancelled) {
 setHasSetup(false);
}
          return null;
        }
        return res.json() as Promise<{ hasSetup?: boolean; referralUserId?: string | null }>;
      })
      .then(async (data) => {
        if (cancelled || data == null) {
 return;
}
        const hasSetupVal = !!data.hasSetup;
        const referralUserId = data.referralUserId ?? userId;
        setHasSetup(hasSetupVal);

        if (hasSetupVal) {
          // User has setup - redirect to desktop/capture page
          setIsRedirecting(true);
          const isMobile = isMobileDevice();
          router.push(
            isMobile
              ? `/referral-images/capture?u=${referralUserId}`
              : `/referral-images/desktop?u=${referralUserId}`,
          );
        } else {
          // User is signed in but no setup - auto-trigger setup for seamless experience
          console.log('[referral-images] User signed in but no setup detected - auto-triggering setup');
          setIsSetupLoading(true);
          try {
            const response = await fetch('/api/referral-images/setup', { method: 'POST' });
            if (!response.ok) {
 throw new Error('Setup failed');
}
            const setupData = await response.json();
            if (typeof window !== 'undefined' && setupData.desktopLink != null && setupData.mobileLink != null) {
              sessionStorage.setItem('referral-images-desktop-link', setupData.desktopLink);
              sessionStorage.setItem('referral-images-mobile-link', setupData.mobileLink);
            }
            router.push(`/referral-images/setup-complete?u=${setupData.userId}`);
          } catch (err) {
            console.error('[referral-images] Auto-setup failed:', err);
            setError('Failed to complete setup. Please try again.');
          } finally {
            setIsSetupLoading(false);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
 setHasSetup(false);
}
      });
    return () => {
      cancelled = true;
    };
  }, [userId, isLoaded, router]);

  const handleGetStarted = async () => {
    if (!userId) {
 return;
}
    setIsSetupLoading(true);
    try {
      const response = await fetch('/api/referral-images/setup', { method: 'POST' });
      if (!response.ok) {
 throw new Error('Setup failed');
}
      const data = await response.json();
      if (typeof window !== 'undefined' && data.desktopLink != null && data.mobileLink != null) {
        sessionStorage.setItem('referral-images-desktop-link', data.desktopLink);
        sessionStorage.setItem('referral-images-mobile-link', data.mobileLink);
      }
      router.push(`/referral-images/setup-complete?u=${data.userId}`);
    } catch (err) {
      setError('Failed to get started. Please try again.');
      console.error(err);
    } finally {
      setIsSetupLoading(false);
    }
  };

  const showLoading
    = !isLoaded
      || (userId && hasSetup === null)
      || isRedirecting
      || isSetupLoading
      || isLoading;
  const showLanding = isLoaded && (hasSetup === false || !userId);

  useEffect(() => {
    if (!showLoading) {
      setLoadingMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMessageIndex(prev =>
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev,
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [showLoading]);
  const primaryCtaSignedInNoSetup = userId && hasSetup === false;
  const signupRedirectUrl = `/auth/register?redirect_url=${encodeURIComponent('/referral-images')}`;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/referral-images/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const data = await response.json();

      // Store links so setup-complete can show same URLs as email
      if (typeof window !== 'undefined' && data.desktopLink != null && data.mobileLink != null) {
        sessionStorage.setItem('referral-images-desktop-link', data.desktopLink);
        sessionStorage.setItem('referral-images-mobile-link', data.mobileLink);
      }

      // Redirect to setup-complete page
      router.push(`/referral-images/setup-complete?u=${data.userId}`);
    } catch (err) {
      setError('Failed to sign up. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (showLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95">
        <Loader2 className="mb-4 size-12 animate-spin text-primary" />
        <p className="text-lg text-text-primary">
          {LOADING_MESSAGES[loadingMessageIndex]}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <div className="text-xl font-bold text-text-primary">
            ClinicPro
          </div>
          {primaryCtaSignedInNoSetup
? (
            <button
              onClick={handleGetStarted}
              disabled={isSetupLoading}
              className="rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {isSetupLoading ? 'Setting up...' : 'Get Started'}
            </button>
          )
: (
            <Link
              href={signupRedirectUrl}
              className="inline-block rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-dark"
            >
              Get Started
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      {showLanding && (
      <>
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h1 className="mb-6 text-4xl font-bold text-text-primary md:text-5xl">
              Referral photos from phone to desktop in 30 seconds
            </h1>
            <p className="mx-auto mb-4 max-w-2xl text-xl text-text-secondary">
              Stop emailing photos to yourself. Take photo → instant desktop transfer → auto-sized JPEG → attach to referral. Done. Saves &gt;10 minutes per referral. Free.
            </p>
            <p className="mx-auto mb-8 max-w-2xl text-text-secondary">
              Built by Dr. Ryo Eguchi, Auckland GP. I hated this workflow, so I fixed it.
              <br />
              <em className="text-text-tertiary">&quot;It&apos;s intolerable how long it takes&quot;, Fellow NZ GP</em>
            </p>
            {primaryCtaSignedInNoSetup
? (
              <button
                onClick={handleGetStarted}
                disabled={isSetupLoading}
                className="rounded-lg bg-primary px-8 py-4 text-lg text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {isSetupLoading ? 'Setting up...' : 'Get Started'}
              </button>
            )
: (
              <>
                <Link
                  href={signupRedirectUrl}
                  className="inline-block rounded-lg bg-primary px-8 py-4 text-lg text-white transition-colors hover:bg-primary-dark"
                >
                  Get Started
                </Link>
                <p className="mt-3 text-sm text-text-tertiary">
                  Prefer to sign up with email?
{' '}
                  <button
                    type="button"
                    onClick={() => setShowSignupModal(true)}
                    className="text-primary hover:underline"
                  >
                    Use email instead
                  </button>
                </p>
              </>
            )}
            {!userId && (
              <div className="mt-4 flex justify-center">
                <p className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-5 py-3 text-base text-amber-900">
                  <span aria-hidden>💡</span>
                  Why free? I&apos;m a GP who hated this workflow. Built this to fix it. No catch.
                </p>
              </div>
            )}
          </div>
          <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-xl shadow-lg">
            <Image
              src="/images/referral-images/referral_images_hero_image_2.png"
              alt="GP before: stressed at desk; after: photo to desktop in 30 seconds"
              width={1200}
              height={675}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="bg-surface px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 text-center">
              <Clock className="mx-auto mb-4 size-12 text-primary" />
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                Save &gt;10 Minutes Per Referral
              </h3>
              <p className="text-sm text-text-secondary">
                No more email-to-self, download, resize, re-upload. Photo to desktop in 30 seconds, ready to attach.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 text-center">
              <Camera className="mx-auto mb-4 size-12 text-primary" />
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                Auto-Resize
              </h3>
              <p className="text-sm text-text-secondary">
                Perfect size for email attachments (&lt;500KB). No more rejected referrals.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 text-center">
              <FileImage className="mx-auto mb-4 size-12 text-primary" />
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                JPEG Format (Not PDF)
              </h3>
              <p className="text-sm text-text-secondary">
                Always JPEG, never PDF. Specialists won&apos;t ask you to resend.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 text-center">
              <Shield className="mx-auto mb-4 size-12 text-primary" />
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                24h Auto-Delete
              </h3>
              <p className="text-sm text-text-secondary">
                Images delete automatically. Nothing stored long-term.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-text-primary">
            How It Works
          </h2>
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                1
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-text-primary">
                  Sign up & get your links
                </h3>
                <p className="text-text-secondary">
                  Instant access. Permanent desktop and mobile links sent to your email.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                2
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-text-primary">
                  Save mobile link to home screen
                </h3>
                <p className="text-text-secondary">
                  One-tap access during consults. Works on iPhone and Android.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                3
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-text-primary">
                  Capture, label, sync
                </h3>
                <p className="text-text-secondary">
                  Photos appear on desktop instantly. Download JPEG, attach to e-referral. Done.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="bg-surface px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-text-primary">
            What's Included
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-1 size-6 shrink-0 text-green-500" />
              <div>
                <h4 className="mb-1 font-semibold text-text-primary">Free to use</h4>
                <p className="text-sm text-text-secondary">No credit card required</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="mt-1 size-6 shrink-0 text-green-500" />
              <div>
                <h4 className="mb-1 font-semibold text-text-primary">Easy file naming</h4>
                <p className="text-sm text-text-secondary">Quick metadata for organisation</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="mt-1 size-6 shrink-0 text-green-500" />
              <div>
                <h4 className="mb-1 font-semibold text-text-primary">24h storage</h4>
                <p className="text-sm text-text-secondary">Automatic cleanup</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="mt-1 size-6 shrink-0 text-green-500" />
              <div>
                <h4 className="mb-1 font-semibold text-text-primary">Auto-compression</h4>
                <p className="text-sm text-text-secondary">Under 500KB guaranteed</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="mt-1 size-6 shrink-0 text-green-500" />
              <div>
                <h4 className="mb-1 font-semibold text-text-primary">Real-time sync</h4>
                <p className="text-sm text-text-secondary">Photos appear on desktop instantly</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="mt-1 size-6 shrink-0 text-green-500" />
              <div>
                <h4 className="mb-1 font-semibold text-text-primary">Easy e-Referral Downloads</h4>
                <p className="text-sm text-text-secondary">Always JPEG (never PDF). Auto-sized for e-referrals. Specialists won&apos;t reject them.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What GPs Are Saying About the Problem */}
      <section className="bg-[#F8FAFC] px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-10 text-3xl font-bold text-text-primary">
            What GPs Are Saying About the Problem
          </h2>

          <div className="space-y-6">
            <blockquote className="mx-auto max-w-[700px] rounded-r-lg border-l-4 border-primary bg-white px-6 py-5 text-left shadow-sm sm:px-8 sm:py-6">
              <p className="mb-2 text-lg italic text-text-secondary sm:text-xl">
                &quot;It&apos;s intolerable how long it takes&quot;
              </p>
              <footer className="text-sm font-medium text-text-tertiary">, NZ GP</footer>
            </blockquote>

            <blockquote className="mx-auto max-w-[700px] rounded-r-lg border-l-4 border-primary bg-white px-5 py-4 text-left shadow-sm sm:px-8 sm:py-6">
              <p className="mb-2 text-base italic text-text-secondary sm:text-lg">
                &quot;I&apos;ve had to make referrals without photos after &gt;1/2 hr faffing around&quot;
              </p>
              <footer className="text-sm font-medium text-text-tertiary">, NZ GP</footer>
            </blockquote>

            <blockquote className="mx-auto max-w-[700px] rounded-r-lg border-l-4 border-primary bg-white px-5 py-4 text-left shadow-sm sm:px-8 sm:py-6">
              <p className="mb-2 text-base italic text-text-secondary sm:text-lg">
                &quot;Whenever we attach [PDFs] to derm referrals we always get a request back &apos;can we please have jpeg&apos; so have given up using it&quot;
              </p>
              <footer className="text-sm font-medium text-text-tertiary">, NZ GP on competing tools</footer>
            </blockquote>
          </div>

          <p className="mb-8 mt-10 text-lg text-text-tertiary">
            Built by a GP who had the same frustrations.
          </p>

          {primaryCtaSignedInNoSetup
? (
            <button
              onClick={handleGetStarted}
              disabled={isSetupLoading}
              className="rounded-lg bg-primary px-8 py-4 text-lg text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {isSetupLoading ? 'Setting up...' : 'Get Started'}
            </button>
          )
: (
            <Link
              href={signupRedirectUrl}
              className="inline-block rounded-lg bg-primary px-8 py-4 text-lg text-white transition-colors hover:bg-primary-dark"
            >
              Get Started
            </Link>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary px-4 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Ready to stop wasting &gt;10 minutes per referral?
          </h2>
          <p className="mb-8 text-xl opacity-90">
            Join NZ GPs who&apos;ve stopped emailing photos to themselves.
          </p>
          {primaryCtaSignedInNoSetup
? (
            <button
              onClick={handleGetStarted}
              disabled={isSetupLoading}
              className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-primary transition-colors hover:bg-gray-100 disabled:opacity-50"
            >
              {isSetupLoading ? 'Setting up...' : 'Get Started'}
            </button>
          )
: (
            <Link
              href={signupRedirectUrl}
              className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold text-primary transition-colors hover:bg-gray-100"
            >
              Get Started
            </Link>
          )}
          <p className="mt-4 text-sm opacity-75">
            No credit card required • Free to use
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-text-primary">
            Common Questions
          </h2>
          <div className="space-y-4">
            {referralImagesFaqItems.map((item, index) => (
              <details
                key={index}
                className="group overflow-hidden rounded-lg border border-border bg-white"
                open={expandedFaq === index}
              >
                <summary
                  className="flex cursor-pointer list-none items-center justify-between px-6 py-4 transition hover:bg-black/5 [&::-webkit-details-marker]:hidden"
                  onClick={(e) => {
                    e.preventDefault();
                    setExpandedFaq(expandedFaq === index ? null : index);
                  }}
                >
                  <span className="pr-4 font-medium text-text-primary">{item.question}</span>
                  <span
                    className={`shrink-0 text-text-tertiary transition-transform ${expandedFaq === index ? 'rotate-90' : ''}`}
                    aria-hidden
                  >
                    →
                  </span>
                </summary>
                <div className="border-t border-border bg-white px-6 py-4 text-text-secondary">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white px-4 py-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-text-tertiary">
          <p>Built by a practising GP for GPs</p>
          <div className="mt-4 space-x-6">
            <a href="/terms" className="hover:text-text-primary">Terms</a>
            <a href="/privacy" className="hover:text-text-primary">Privacy</a>
            <a href="/contact" className="hover:text-text-primary">Contact</a>
          </div>
        </div>
      </footer>
      </>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-8">
            <h3 className="mb-6 text-2xl font-semibold text-text-primary">
              Get Started with GP Referral Images
            </h3>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-text-secondary">
                  I agree to the
{' '}
<a href="/terms" className="text-primary hover:underline">terms and conditions</a>
{' '}
and
{' '}
<a href="/privacy" className="text-primary hover:underline">privacy policy</a>
                </label>
              </div>

              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSignupModal(false)}
                  className="flex-1 rounded-lg border border-border px-6 py-3 transition-colors hover:bg-surface"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Get Started'}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-xs text-text-tertiary">
              Your permanent desktop and mobile links will be sent to your email immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
