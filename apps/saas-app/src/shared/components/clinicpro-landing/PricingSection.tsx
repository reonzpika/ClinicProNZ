'use client';

import { ArrowRight, Check, Crown, Star, Zap } from 'lucide-react';
import { useState } from 'react';

import { EmailCaptureModal } from '@/shared/components/EmailCaptureModal';
import { First30Modal } from '@/shared/components/First30Modal';
import { Button } from '@/shared/components/ui/button';
import { clinicProLandingData, formatNZD } from '@/shared/data/clinicpro-landing';

export const PricingSection = () => {
  const [showFirst30Modal, setShowFirst30Modal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  return (
    <>
      <section className="relative bg-white py-16 sm:py-24 lg:py-32">
        {/* Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="to-nz-blue-300/8 absolute -right-40 top-20 size-[500px] rounded-full bg-gradient-to-br from-nz-green-200/10 blur-3xl"></div>
          <div className="from-nz-blue-200/8 absolute -left-60 bottom-32 size-[600px] rounded-full bg-gradient-to-tr to-nz-green-300/10 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Choose Your Early Access Level
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl">
              Lock in your pricing now. All early access rates guaranteed for 12 months.
            </p>
          </div>

          {/* Pricing Tiers */}
          <div className="grid gap-8 lg:grid-cols-3">
            {clinicProLandingData.pricing.tiers.map((tier, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  tier.featured
                    ? 'scale-105 border-2 border-nz-green-500 bg-gradient-to-br from-nz-green-50 to-white'
                    : 'border border-gray-200 bg-white'
                }`}
              >
                {/* Featured Badge */}
                {tier.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-nz-green-600 to-nz-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                      <Crown className="size-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Tier Header */}
                  <div className="mb-8 text-center">
                    <div className="mb-2 flex items-center justify-center">
                      {index === 0 && <Crown className="mr-2 size-6 text-nz-green-600" />}
                      {index === 1 && <Star className="mr-2 size-6 text-nz-blue-600" />}
                      {index === 2 && <Zap className="mr-2 size-6 text-gray-600" />}
                      <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{tier.subtitle}</p>

                    {/* Pricing */}
                    <div className="mt-4">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-extrabold text-gray-900">
                          {formatNZD(tier.price)}
                        </span>
                        <span className="ml-1 text-lg font-medium text-gray-600">/month</span>
                      </div>

                      {/* Original price and savings */}
                      {tier.originalPrice && (
                        <div className="mt-2 text-center">
                          <span className="text-lg text-gray-500 line-through">
                            {formatNZD(tier.originalPrice)}
                            /month
                          </span>
                          <div className="mt-1 inline-flex items-center rounded-full bg-nz-green-100 px-3 py-1 text-sm font-medium text-nz-green-800">
                            Save
                            {' '}
                            {tier.savings}
                            %
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check className="size-5 shrink-0 text-nz-green-500" />
                        <span className="text-sm text-gray-700">
                          {index === 0
                            ? 'First 30 founding members only'
                            : index === 1
                              ? 'Limited to first 100 GPs'
                              : 'Standard pricing after 100 GPs'}
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="size-5 shrink-0 text-nz-green-500" />
                        <span className="text-sm text-gray-700">Unlimited consultation notes</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="size-5 shrink-0 text-nz-green-500" />
                        <span className="text-sm text-gray-700">Mobile + desktop recording</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="size-5 shrink-0 text-nz-green-500" />
                        <span className="text-sm text-gray-700">NZ privacy compliance</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="size-5 shrink-0 text-nz-green-500" />
                        <span className="text-sm text-gray-700">
                          {index === 0
                            ? 'Direct founder access'
                            : index === 1
                              ? 'Priority support'
                              : 'Standard support'}
                        </span>
                      </li>
                      {index === 0 && (
                        <li className="flex items-center gap-3">
                          <Check className="size-5 shrink-0 text-nz-green-500" />
                          <span className="text-sm text-gray-700">Shape product roadmap</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full py-3 font-semibold transition-all duration-200 ${
                      tier.featured
                        ? 'bg-gradient-to-r from-nz-green-600 to-nz-blue-600 text-white shadow-lg hover:from-nz-green-700 hover:to-nz-blue-700 hover:shadow-xl'
                        : index === 1
                          ? 'bg-nz-blue-600 text-white hover:bg-nz-blue-700'
                          : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (index === 0) {
                        setShowFirst30Modal(true);
                      } else {
                        setShowEmailModal(true);
                      }
                    }}
                  >
                    {index === 0
                      ? 'Secure Founding Spot'
                      : index === 1
                        ? 'Join Early Adopters'
                        : 'Join Waitlist'}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>

                  {/* Additional info */}
                  <p className="mt-3 text-center text-xs text-gray-500">
                    {index === 0
                      ? 'No payment required now - we\'ll contact you'
                      : index === 1
                        ? 'Get notified when spots open'
                        : 'Standard launch pricing'}
                  </p>
                </div>

                {/* Background decoration */}
                <div className={`absolute -right-8 -top-8 size-20 rounded-full blur-2xl ${
                  tier.featured ? 'bg-nz-green-200/20' : 'bg-gray-200/20'
                }`}
                >
                </div>
              </div>
            ))}
          </div>

          {/* Guarantee Text */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-lg font-medium text-gray-700">
              {clinicProLandingData.pricing.guarantee}
            </p>
            <p className="text-sm text-gray-500">
              All prices include GST • No setup fees • Cancel anytime
            </p>
          </div>

          {/* Final CTA */}
          <div className="mt-16 text-center">
            <div className="mx-auto max-w-3xl rounded-2xl border-2 border-nz-green-200/50 bg-gradient-to-r from-nz-green-50/80 to-nz-blue-50/60 p-8 shadow-lg">
              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                {clinicProLandingData.pricing.cta}
              </h3>
              <p className="mb-6 text-gray-600">
                Don't wait—early access spots are filling up fast. Join the GPs who are already transforming their practice.
              </p>
              <Button
                size="lg"
                onClick={() => setShowFirst30Modal(true)}
                className="bg-gradient-to-r from-nz-green-600 to-nz-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:from-nz-green-700 hover:to-nz-blue-700 hover:shadow-2xl"
              >
                Secure Your Early Access Now
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <First30Modal
        isOpen={showFirst30Modal}
        onClose={() => setShowFirst30Modal(false)}
      />
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </>
  );
};
