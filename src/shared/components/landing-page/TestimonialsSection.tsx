'use client';

import { Clock, Shield, Smartphone, Star, Users } from 'lucide-react';
import { useState } from 'react';

import { EmailCaptureModal } from '@/src/shared/components/EmailCaptureModal';

export const TestimonialsSection = () => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const testimonials = [
    {
      id: 1,
      icon: Clock,
      category: 'Time Efficiency',
      categoryColor: 'green',
      rating: 5,
      quote: 'I used to stay 2 hours late every day just finishing notes. Now I leave the clinic on time, and my documentation is actually better than before. The mobile recording is a game-changer — I can record anywhere without any setup.',
      gradient: 'from-green-50 to-blue-50',
      border: 'border-green-200',
    },
    {
      id: 2,
      icon: Shield,
      category: 'Clinical Support',
      categoryColor: 'blue',
      rating: 5,
      quote: 'The clinical decision support tools are incredibly helpful without being intrusive. Better documentation means better patient care and reduced liability risks. Finally, something that understands how we actually practice in NZ.',
      gradient: 'from-blue-50 to-purple-50',
      border: 'border-blue-200',
    },
    {
      id: 3,
      icon: Users,
      category: 'NZ Focus',
      categoryColor: 'indigo',
      rating: 5,
      quote: 'Finally, something built for NZ GPs by NZ GPs! The templates use our terminology, understand our workflows, and meet RNZCGP standards. It\'s like having a colleague who knows exactly how you like to document.',
      gradient: 'from-indigo-50 to-green-50',
      border: 'border-indigo-200',
    },
    {
      id: 4,
      icon: Smartphone,
      category: 'Ease of Use',
      categoryColor: 'orange',
      rating: 5,
      quote: 'The ease of use is incredible. Scan QR code, start recording — that\'s it. No microphone setup, no technical issues. I can focus entirely on my patient knowing the documentation will be perfect.',
      gradient: 'from-orange-50 to-red-50',
      border: 'border-orange-200',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24 lg:py-32">
      {/* Enhanced Visual Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large artistic orbs */}
        <div className="to-indigo-300/6 absolute -left-60 top-20 size-[700px] rounded-full bg-gradient-to-br from-blue-200/10 blur-3xl"></div>
        <div className="from-purple-200/8 absolute -right-80 bottom-32 size-[800px] rounded-full bg-gradient-to-tr to-pink-300/5 blur-3xl"></div>

        {/* Medium floating shapes */}
        <div className="from-emerald-200/12 to-teal-300/8 absolute left-[15%] top-[30%] size-48 rounded-full bg-gradient-to-r blur-2xl"></div>
        <div className="to-purple-300/6 absolute right-[20%] top-[50%] size-56 rounded-full bg-gradient-to-r from-violet-200/10 blur-xl"></div>
        <div className="absolute bottom-1/4 left-[70%] size-40 rounded-full bg-gradient-to-r from-amber-200/15 to-orange-300/10 blur-xl"></div>

        {/* Geometric accent shapes */}
        <div className="absolute left-1/4 top-[20%] size-8 rounded-full bg-blue-400/30"></div>
        <div className="absolute right-[30%] top-[15%] size-6 rounded-full bg-emerald-400/40"></div>
        <div className="absolute left-[80%] top-[40%] size-10 rounded-full bg-purple-400/35"></div>
        <div className="absolute bottom-[30%] right-[15%] size-4 rounded-full bg-orange-400/45"></div>
        <div className="absolute bottom-[20%] left-[45%] size-12 rounded-full bg-indigo-400/25"></div>

        {/* Elegant line elements */}
        <div className="absolute left-[35%] top-1/4 h-36 w-px bg-gradient-to-b from-transparent via-blue-400/20 to-transparent"></div>
        <div className="absolute right-[50%] top-[60%] h-32 w-px bg-gradient-to-b from-transparent via-purple-400/25 to-transparent"></div>
        <div className="absolute bottom-[35%] left-[85%] h-28 w-px bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent"></div>
      </div>

      {/* Sophisticated geometric patterns overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235b21b6' fill-opacity='1'%3E%3Cpath d='M40 40c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm16-16c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm0 32c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm-32-16c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
        {/* Stylish Header Section */}
        <div className="mb-20 text-center">
          <div className="relative inline-block">
            {/* Decorative accents behind title */}
            <div className="absolute -left-10 top-6 h-24 w-1.5 bg-gradient-to-b from-green-500 to-blue-600"></div>
            <div className="absolute -right-8 top-10 h-20 w-1 bg-gradient-to-b from-purple-500 to-indigo-600"></div>

            <h2 className="relative mb-6 text-4xl font-extrabold leading-normal tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              <span className="block">Early Feedback from Our</span>
              <span className="block text-green-600">Beta Testing</span>
            </h2>

            {/* Stylish accent elements */}
            <div className="absolute -right-14 top-4 size-4 rounded-full bg-green-400/60"></div>
            <div className="top-18 absolute -left-12 size-3 rounded-full bg-blue-400/70"></div>
          </div>

          <div className="relative mx-auto max-w-3xl">
            <p className="text-xl leading-relaxed text-gray-600 lg:text-2xl">
              Here's what we're hearing from GPs testing ClinicPro during our development phase.
            </p>

            {/* Decorative line accent */}
            <div className="absolute -left-6 top-4 h-px w-20 bg-gradient-to-r from-green-400 to-transparent"></div>
            <div className="absolute -right-6 bottom-4 h-px w-16 bg-gradient-to-l from-blue-400 to-transparent"></div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {testimonials.map((testimonial) => {
            const Icon = testimonial.icon;

            return (
              <div
                key={testimonial.id}
                className={`group relative overflow-hidden rounded-2xl border ${testimonial.border} bg-gradient-to-br ${testimonial.gradient} p-8 shadow-xl transition-all duration-300 hover:shadow-2xl`}
              >
                {/* Visual accent background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-50"></div>

                {/* Decorative corner accents */}
                <div className={`absolute -right-6 -top-6 size-16 rounded-full bg-gradient-to-br ${testimonial.gradient} opacity-30`}></div>
                <div className="absolute -bottom-4 -left-4 size-12 rounded-full bg-gradient-to-tr from-gray-200/20 to-white/15"></div>

                <div className="relative z-10">
                  {/* Enhanced Header */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Profile Icon */}
                      <div className="relative">
                        <div className="size-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 shadow-lg">
                          <div className="flex size-full items-center justify-center rounded-full">
                            <Icon className={`text- size-6${testimonial.categoryColor}-600`} />
                          </div>
                        </div>
                      </div>

                      <div>
                        {/* Name and role removed for privacy */}
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="size-5 fill-current text-yellow-500" />
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Quote */}
                  <blockquote className="mb-6 text-base italic leading-relaxed text-gray-700 group-hover:text-gray-800">
                    "
                    {testimonial.quote}
                    "
                  </blockquote>

                  {/* Enhanced Footer */}
                  <div className="flex items-center justify-between">
                    <div className={`bg- rounded-full${testimonial.categoryColor}-100 text- px-4 py-2 text-sm font-medium${testimonial.categoryColor}-700`}>
                      {testimonial.category}
                    </div>
                    <div className="text-sm text-gray-500">Beta Tester</div>
                  </div>
                </div>

                {/* Floating accent elements */}
                <div className="absolute -left-2 top-24 size-3 rounded-full bg-blue-400/30"></div>
                <div className="absolute -right-2 bottom-28 size-4 rounded-full bg-purple-400/25"></div>
              </div>
            );
          })}
        </div>

        {/* Enhanced CTA Section */}
        <div className="mt-20 text-center">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border-2 border-green-200/50 bg-gradient-to-r from-green-50/80 to-blue-50/60 p-8 shadow-2xl">
            {/* Background decoratives */}
            <div className="absolute -right-12 -top-12 size-32 rounded-full bg-gradient-to-br from-green-200/15 to-blue-300/10 blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 size-24 rounded-full bg-gradient-to-tr from-emerald-200/20 to-teal-300/15 blur-2xl"></div>

            <div className="relative z-10">
              <h3 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">
                Join the GPs Already Transforming Their Practice
              </h3>
              <p className="text-lg leading-relaxed text-gray-600 lg:text-xl">
                These results come from real GPs testing ClinicPro in their daily practice.
                <span className="block font-medium text-green-600 sm:inline"> Experience the same transformation in your clinic.</span>
              </p>

              {/* CTA Button */}
              <div className="mt-8">
                <button
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-green-500/25 focus:outline-none focus:ring-4 focus:ring-green-500/50"
                  onClick={() => setShowEmailModal(true)}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 -top-2 flex size-full justify-center blur-md">
                    <div className="size-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>

                  {/* Button content */}
                  <span className="relative z-10 flex items-center">
                    Start Your Free Trial
                    <svg
                      className="ml-2 size-5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30"></div>
                </button>
              </div>

              {/* Enhanced trust indicators */}
              <div className="mt-8 flex flex-col items-center justify-center gap-4 text-base text-gray-500 sm:flex-row sm:gap-8">
                <span className="flex items-center rounded-full border border-green-200 bg-white/60 px-4 py-2 shadow-sm">
                  <span className="mr-2 text-lg">⭐</span>
                  Real Beta Feedback
                </span>
                <span className="flex items-center rounded-full border border-blue-200 bg-white/60 px-4 py-2 shadow-sm">
                  <span className="mr-2 text-lg">🇳🇿</span>
                  NZ GP Tested
                </span>
                <span className="flex items-center rounded-full border border-purple-200 bg-white/60 px-4 py-2 shadow-sm">
                  <span className="mr-2 text-lg">🔒</span>
                  Privacy Protected
                </span>
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -left-3 top-20 size-3 rounded-full bg-green-400/40"></div>
            <div className="absolute -right-2 bottom-24 size-4 rounded-full bg-blue-400/35"></div>
          </div>
        </div>
      </div>

      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </section>
  );
};
