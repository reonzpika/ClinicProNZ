'use client';

import { ArrowRight, Clock, Shield, Users } from 'lucide-react';
import { useState } from 'react';

import { EmailCaptureModal } from '@/shared/components/EmailCaptureModal';
import { Button } from '@/shared/components/ui/button';

export const FinalCTASection = () => {
  const [showEmailModal, setShowEmailModal] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 py-20 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-black/5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            Ready to Transform Your Documentation?
          </h2>

          <p className="mx-auto mb-8 max-w-3xl text-xl text-blue-100">
            Join the first 30 NZ GPs who will experience the future of clinical documentation.
            Help shape ClinicPro before our public launch.
          </p>

          <div className="mx-auto mb-12 grid max-w-3xl gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                <Clock className="size-8 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Save 2+ Hours Daily</h3>
              <p className="text-sm text-blue-100">Leave the clinic on time, every day</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                <Shield className="size-8 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">NZ Healthcare Focus</h3>
              <p className="text-sm text-blue-100">Built specifically for our health system</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                <Users className="size-8 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">GP Community Driven</h3>
              <p className="text-sm text-blue-100">Your feedback shapes our development</p>
            </div>
          </div>

          <Button
            size="lg"
            className="bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-2xl"
            onClick={() => setShowEmailModal(true)}
          >
            Get Free Access (Limited Time)
            <ArrowRight className="ml-2 size-5" />
          </Button>

          <div className="mt-6 space-y-2">
            <p className="text-blue-100">
              <span className="font-medium">Free access for early feedback</span>
              {' '}
              — No credit card required
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-blue-200">
              <span>✓ Be among the first 30 NZ GPs</span>
              <span>✓ Help shape the future</span>
              <span>✓ No commitment required</span>
            </div>
          </div>
        </div>

        {/* Floating badges */}
        <div className="absolute left-8 top-8 hidden lg:block">
          <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            Built for NZ GPs
          </div>
        </div>
        <div className="absolute right-8 top-8 hidden lg:block">
          <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            Zero Setup Required
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 lg:block">
          <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            🔒 Privacy-First Design
          </div>
        </div>
      </section>

      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </>
  );
};
