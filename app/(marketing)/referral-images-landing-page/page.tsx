'use client';

import { useState } from 'react';
import { Camera, Clock, Shield, Zap, CheckCircle, Mail, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReferralImagesLandingPage() {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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

      // Redirect to desktop page
      router.push(`/referral-images/desktop?u=${data.userId}`);
    } catch (err) {
      setError('Failed to sign up. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-text-primary">
            ClinicPro
          </div>
          <button
            onClick={() => setShowSignupModal(true)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Referral photos from phone to desktop in 30 seconds
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Stop emailing photos to yourself. Capture on mobile, auto-resize, instant desktop sync. Free for your first month.
          </p>
          <button
            onClick={() => setShowSignupModal(true)}
            className="px-8 py-4 text-lg bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 px-4 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Lightning Fast
              </h3>
              <p className="text-text-secondary text-sm">
                Capture to desktop in under 30 seconds. No email delays.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Auto-Resize
              </h3>
              <p className="text-text-secondary text-sm">
                Perfect size for email attachments. No more rejected referrals.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                24h Auto-Delete
              </h3>
              <p className="text-text-secondary text-sm">
                Images delete automatically. Nothing stored long-term.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Save 10 Minutes
              </h3>
              <p className="text-text-secondary text-sm">
                Per referral. Stop fighting with email attachments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
            How It Works
          </h2>
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Sign up & get your links
                </h3>
                <p className="text-text-secondary">
                  Instant access. Permanent desktop and mobile links sent to your email.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Save mobile link to home screen
                </h3>
                <p className="text-text-secondary">
                  One-tap access during consults. Works on iPhone and Android.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Capture, label, sync
                </h3>
                <p className="text-text-secondary">
                  Photos appear on desktop instantly. Download and attach to referral. Done.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 px-4 bg-surface">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
            What's Included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-text-primary mb-1">Unlimited Month 1</h4>
                <p className="text-text-secondary text-sm">Use as much as you need to get started</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-text-primary mb-1">Real-time sync</h4>
                <p className="text-text-secondary text-sm">Instant desktop updates via Ably</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-text-primary mb-1">Auto-compression</h4>
                <p className="text-text-secondary text-sm">Under 500KB guaranteed</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-text-primary mb-1">Image labeling</h4>
                <p className="text-text-secondary text-sm">Side (R/L) + descriptions</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-text-primary mb-1">24h storage</h4>
                <p className="text-text-secondary text-sm">Automatic cleanup</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-text-primary mb-1">No setup required</h4>
                <p className="text-text-secondary text-sm">Works immediately</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
            What GPs Are Saying
          </h2>
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-text-secondary italic">
              Testimonials coming soon from early users...
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to stop emailing photos to yourself?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join GPs who've already saved hours of admin time.
          </p>
          <button
            onClick={() => setShowSignupModal(true)}
            className="px-8 py-4 text-lg bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            Get Started Free
          </button>
          <p className="mt-4 text-sm opacity-75">
            No credit card required • Unlimited for your first month
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-text-tertiary text-sm">
          <p>Built by a practicing GP for GPs</p>
          <div className="mt-4 space-x-6">
            <a href="/terms" className="hover:text-text-primary">Terms</a>
            <a href="/privacy" className="hover:text-text-primary">Privacy</a>
            <a href="/contact" className="hover:text-text-primary">Contact</a>
          </div>
        </div>
      </footer>

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-8">
            <h3 className="text-2xl font-semibold text-text-primary mb-6">
              Get Started with GP Referral Images
            </h3>
            
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-text-secondary">
                  I agree to the <a href="/terms" className="text-primary hover:underline">terms and conditions</a> and <a href="/privacy" className="text-primary hover:underline">privacy policy</a>
                </label>
              </div>

              {error && (
                <div className="text-red-500 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSignupModal(false)}
                  className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-surface transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Get Started'}
                </button>
              </div>
            </form>

            <p className="mt-6 text-xs text-text-tertiary text-center">
              Your permanent desktop and mobile links will be sent to your email immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
