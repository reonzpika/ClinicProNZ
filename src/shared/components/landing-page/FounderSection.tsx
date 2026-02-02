'use client';

import { Clock, Heart, Users, Zap } from 'lucide-react';
import { useState } from 'react';

import { EmailCaptureModal } from '@/src/shared/components/EmailCaptureModal';

export const FounderSection = () => {
  const [showEmailModal, setShowEmailModal] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-16 sm:py-24 lg:py-32">
        {/* Enhanced Visual Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Large artistic orbs */}
          <div className="from-blue-200/12 to-indigo-300/8 absolute -left-40 top-32 size-[600px] rounded-full bg-gradient-to-br blur-3xl"></div>
          <div className="to-pink-300/6 absolute -right-60 bottom-20 size-[700px] rounded-full bg-gradient-to-tr from-purple-200/10 blur-3xl"></div>

          {/* Medium floating shapes */}
          <div className="absolute left-[20%] top-1/4 size-48 rounded-full bg-gradient-to-r from-emerald-200/15 to-teal-300/10 blur-2xl"></div>
          <div className="from-violet-200/12 to-purple-300/8 absolute right-[15%] top-[60%] size-56 rounded-full bg-gradient-to-r blur-xl"></div>
          <div className="absolute bottom-[30%] left-[60%] size-40 rounded-full bg-gradient-to-r from-amber-200/20 to-orange-300/15 blur-xl"></div>

          {/* Geometric accent shapes */}
          <div className="absolute left-1/4 top-[15%] size-10 rounded-full bg-blue-400/35"></div>
          <div className="absolute right-[30%] top-[20%] size-8 rounded-full bg-emerald-400/45"></div>
          <div className="absolute left-[70%] top-[45%] size-12 rounded-full bg-purple-400/40"></div>
          <div className="absolute bottom-1/4 right-[20%] size-6 rounded-full bg-orange-400/50"></div>
          <div className="absolute bottom-[15%] left-[40%] size-14 rounded-full bg-indigo-400/30"></div>

          {/* Elegant line elements */}
          <div className="absolute left-[30%] top-[30%] h-32 w-px bg-gradient-to-b from-transparent via-blue-400/25 to-transparent"></div>
          <div className="absolute right-[40%] top-[50%] h-28 w-px bg-gradient-to-b from-transparent via-purple-400/30 to-transparent"></div>
          <div className="absolute bottom-[40%] left-[80%] h-36 w-px bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent"></div>
        </div>

        {/* Sophisticated geometric patterns overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.015]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='1'%3E%3Cpath d='M40 40c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm16-16c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm0 32c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8zm-32-16c0-4.4-3.6-8-8-8s-8 3.6-8 8 3.6 8 8 8 8-3.6 8-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
          {/* Stylish Header Section */}
          <div className="mb-20">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left: Title and subtitle */}
              <div className="text-center lg:text-left">
                <div className="relative inline-block">
                  {/* Decorative accents behind title */}
                  <div className="absolute -left-8 top-4 h-20 w-1.5 bg-gradient-to-b from-red-500 to-orange-600"></div>
                  <div className="absolute -right-6 top-8 h-16 w-1 bg-gradient-to-b from-blue-500 to-indigo-600"></div>

                  <h2 className="relative mb-6 text-4xl font-extrabold leading-normal tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                    <span className="block">Built by a GP Who</span>
                    <span className="block text-red-600">Truly Knows the Struggle</span>
                  </h2>

                  {/* Stylish accent elements */}
                  <div className="absolute -right-12 top-6 size-4 rounded-full bg-red-400/60"></div>
                  <div className="absolute -left-10 top-16 size-3 rounded-full bg-blue-400/70"></div>
                </div>

                <div className="relative mx-auto max-w-3xl lg:mx-0">
                  <p className="text-xl leading-relaxed text-gray-600 lg:text-2xl">
                    <span className="font-semibold text-red-600">"79% of GPs report burnout. I've been there too."</span>
                  </p>

                  {/* Decorative line accent */}
                  <div className="absolute -left-4 top-4 h-px w-16 bg-gradient-to-r from-red-400 to-transparent"></div>
                  <div className="absolute -right-4 bottom-4 h-px w-12 bg-gradient-to-l from-orange-400 to-transparent"></div>
                </div>
              </div>

              {/* Right: Profile Image */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
                    <img
                      src="/images/landing-page/DrRyoEguchiProfilePicMain.jpg"
                      alt="Dr. Ryo Eguchi - Founder & Practising GP"
                      className="size-80 object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  {/* Decorative elements around image */}
                  <div className="absolute -right-4 -top-4 size-8 rounded-full bg-blue-500/30"></div>
                  <div className="absolute -bottom-4 -left-4 size-6 rounded-full bg-green-500/40"></div>
                  <div className="absolute -left-6 top-1/2 size-4 rounded-full bg-purple-500/35"></div>

                  {/* Name label under image */}
                  <div className="mt-4 text-center">
                    <h3 className="text-2xl font-bold text-gray-900">Dr. Ryo Eguchi</h3>
                    <p className="text-lg font-medium text-blue-600">Founder & Practising GP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
            {/* Left: Enhanced Personal Story */}
            <div className="order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-2xl border-2 border-blue-200/50 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
                {/* Visual accent background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/25 opacity-50"></div>

                {/* Decorative corner accents */}
                <div className="absolute -right-6 -top-6 size-16 rounded-full bg-gradient-to-br from-blue-200/20 to-indigo-300/15"></div>
                <div className="absolute -bottom-4 -left-4 size-12 rounded-full bg-gradient-to-tr from-purple-200/25 to-pink-300/20"></div>

                <div className="relative z-10">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">My Story</h3>
                  </div>

                  <blockquote className="space-y-6 text-base leading-relaxed text-gray-700">
                    <p>
                      <span className="font-semibold text-red-600">I used to spend up to two extra hours each evening catching up on notes</span>
                      (especially in practices with older patient lists), juggling paperwork long after clinic doors closed.
                    </p>

                    <p>
                      I tried typing notes during consultations, but it disrupted the connection.
                      <span className="font-medium text-gray-900"> Patients could tell I wasn't fully present.</span>
                    </p>

                    <div className="rounded-lg border-l-4 border-red-300 bg-red-50/80 p-4">
                      <p className="font-medium text-red-700">Those extra hours stole time from my patients, and from my family, my downtime, my life.</p>
                    </div>

                    <p>
                      Now that I practice in Auckland, I've trimmed that burden, but I haven't forgotten what it's like to feel buried under admin.
                    </p>

                    <div className="border-l-4 border-blue-300 bg-blue-50/50 p-4 italic">
                      <p>
                        "I tested every solution out there: overpriced, built for overseas systems, or too basic.
                        None matched the pace or needs of New Zealand general practice."
                      </p>
                    </div>

                    <p className="text-lg font-semibold text-blue-700">
                      So I built ClinicPro: a consultation companion by a practising GP for practising GPs.
                    </p>
                  </blockquote>

                  {/* Enhanced personal testimonial */}
                  <div className="mt-8 rounded-xl border-2 border-green-200/60 bg-gradient-to-r from-green-50/80 to-emerald-50/60 p-6 shadow-lg">
                    <p className="text-center text-lg font-medium italic text-green-800">
                      "ClinicPro feels like the assistant I always needed; giving me back time and peace of mind."
                    </p>
                  </div>
                </div>

                {/* Floating accent elements */}
                <div className="absolute -left-2 top-20 size-3 rounded-full bg-blue-400/40"></div>
                <div className="absolute -right-2 bottom-32 size-4 rounded-full bg-purple-400/35"></div>
              </div>
            </div>

            {/* Right: Enhanced Impact & Vision */}
            <div className="order-1 space-y-8 lg:order-2">
              {/* Enhanced Solution Stats */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-green-200/50 bg-gradient-to-br from-green-50/80 to-emerald-50/60 p-8 shadow-xl">
                {/* Background decoratives */}
                <div className="absolute -right-8 -top-8 size-20 rounded-full bg-gradient-to-br from-green-200/15 to-emerald-300/10 blur-xl"></div>

                <div className="relative z-10">
                  <h4 className="mb-6 text-center text-2xl font-bold text-green-800">What ClinicPro Delivers</h4>
                  <div className="grid gap-6 text-center sm:grid-cols-3">
                    <div className="rounded-lg bg-white/60 p-4 shadow-md">
                      <div className="mb-2 text-3xl font-bold text-green-600">0</div>
                      <div className="text-sm font-medium text-green-700">Hours unpaid overtime</div>
                    </div>
                    <div className="rounded-lg bg-white/60 p-4 shadow-md">
                      <div className="mb-2 text-3xl font-bold text-green-600">100%</div>
                      <div className="text-sm font-medium text-green-700">Present with patients</div>
                    </div>
                    <div className="rounded-lg bg-white/60 p-4 shadow-md">
                      <div className="mb-2 text-3xl font-bold text-green-600">∞</div>
                      <div className="text-sm font-medium text-green-700">Time reclaimed for life</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Mission Statement */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-200/50 bg-gradient-to-br from-indigo-50/80 to-purple-50/60 p-8 shadow-xl">
                {/* Background decoratives */}
                <div className="absolute -bottom-6 -left-6 size-24 rounded-full bg-gradient-to-tr from-indigo-200/20 to-purple-300/15 blur-2xl"></div>

                <div className="relative z-10 text-center">
                  <div className="mb-6">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 shadow-lg">
                      <Heart className="size-8 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="mb-6 text-2xl font-bold text-gray-900">My Promise to You</h3>
                  <p className="text-lg leading-relaxed text-gray-700">
                    <span className="font-semibold text-indigo-700">No GP should sacrifice their life for documentation.</span>
                    {' '}
                    ClinicPro gives you back the time that belongs with your patients, your family, and yourself.
                  </p>
                </div>
              </div>

              {/* Enhanced Key Principles */}
              <div className="space-y-6">
                <h4 className="text-xl font-semibold text-gray-900">Built from Real Experience:</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 rounded-lg bg-white/80 p-4 shadow-md">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-red-100">
                      <Clock className="size-5 text-red-500" />
                    </div>
                    <div>
                      <span className="text-lg font-medium text-gray-900">Lived the Burnout</span>
                      <p className="text-sm text-gray-600">Every feature solves a problem I personally faced</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 rounded-lg bg-white/80 p-4 shadow-md">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                      <Users className="size-5 text-blue-500" />
                    </div>
                    <div>
                      <span className="text-lg font-medium text-gray-900">GP-to-GP Understanding</span>
                      <p className="text-sm text-gray-600">Built by someone who practices what they preach</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 rounded-lg bg-white/80 p-4 shadow-md">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                      <Zap className="size-5 text-green-500" />
                    </div>
                    <div>
                      <span className="text-lg font-medium text-gray-900">NZ Healthcare Reality</span>
                      <p className="text-sm text-gray-600">Designed for our unique pace and patient needs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
