'use client';

import { Camera, Clock, MessageSquare, Share2, Shield, Smartphone, Star, Users } from 'lucide-react';

export const PricingSection = () => {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Testimonials Section */}
        <div className="mb-20">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              Early Feedback from Our Beta Testing
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Here's what we're hearing from GPs testing ClinicPro during our development phase.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Time Saved Testimonial */}
            <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-blue-50 p-8 shadow-lg">
              <div className="mb-4 flex items-center">
                <div className="mr-4 flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-5 fill-current text-yellow-500" />
                  ))}
                </div>
                <Clock className="size-6 text-green-600" />
              </div>
              <blockquote className="mb-6 text-lg italic text-gray-700">
                "I used to stay 2 hours late every day just finishing notes. Now I leave the clinic on time,
                and my documentation is actually better than before. The mobile recording is a game-changer —
                I can record anywhere without any setup."
              </blockquote>
            </div>

            {/* Clinical Confidence Testimonial */}
            <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-8 shadow-lg">
              <div className="mb-4 flex items-center">
                <div className="mr-4 flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-5 fill-current text-yellow-500" />
                  ))}
                </div>
                <Shield className="size-6 text-blue-600" />
              </div>
              <blockquote className="mb-6 text-lg italic text-gray-700">
                "The clinical decision support tools are incredibly helpful without being intrusive.
                Better documentation means better patient care and reduced liability risks.
                Finally, something that understands how we actually practice in NZ."
              </blockquote>
            </div>

            {/* Local Trust Testimonial */}
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-green-50 p-8 shadow-lg">
              <div className="mb-4 flex items-center">
                <div className="mr-4 flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-5 fill-current text-yellow-500" />
                  ))}
                </div>
                <Users className="size-6 text-indigo-600" />
              </div>
              <blockquote className="mb-6 text-lg italic text-gray-700">
                "Finally, something built for NZ GPs by NZ GPs! The templates use our terminology,
                understand our workflows, and meet RNZCGP standards. It's like having a colleague
                who knows exactly how you like to document."
              </blockquote>
            </div>

            {/* Mobile Convenience Testimonial */}
            <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-8 shadow-lg">
              <div className="mb-4 flex items-center">
                <div className="mr-4 flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-5 fill-current text-yellow-500" />
                  ))}
                </div>
                <Smartphone className="size-6 text-orange-600" />
              </div>
              <blockquote className="mb-6 text-lg italic text-gray-700">
                "The ease of use is incredible. Scan QR code, start recording — that's it.
                No microphone setup, no technical issues. I can focus entirely on my patient
                knowing the documentation will be perfect."
              </blockquote>
            </div>
          </div>
        </div>

        {/* What's Coming Next Section */}
        <div className="border-t pt-20">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              What's Coming Next
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              We're constantly evolving based on feedback from NZ GPs. Here's what we're building next.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="group text-center">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border-4 border-purple-50 bg-gradient-to-br from-purple-100 to-indigo-100 transition-transform duration-300 group-hover:scale-110">
                <Camera className="size-10 text-purple-600" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">QR Image Capture</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Scan QR code to capture clinical photos (skin lesions, wounds)
                directly synced with consultation notes.
              </p>
            </div>

            <div className="group text-center">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border-4 border-green-50 bg-gradient-to-br from-green-100 to-blue-100 transition-transform duration-300 group-hover:scale-110">
                <Share2 className="size-10 text-green-600" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">Template Marketplace</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Share and discover templates created by fellow NZ GPs.
                Best practices from the community, for the community.
              </p>
            </div>

            <div className="group text-center">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border-4 border-blue-50 bg-gradient-to-br from-blue-100 to-indigo-100 transition-transform duration-300 group-hover:scale-110">
                <MessageSquare className="size-10 text-blue-600" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">NZ Health Hub</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Centralised access to NZ health resources, guidelines, and tools.
                Everything GPs commonly use, integrated into your workflow.
              </p>
            </div>

            <div className="group text-center">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border-4 border-orange-50 bg-gradient-to-br from-orange-100 to-red-100 transition-transform duration-300 group-hover:scale-110">
                <Users className="size-10 text-orange-600" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">Practice Integration</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Direct integration with popular NZ practice management systems
                for seamless workflow automation.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex flex-col items-center space-y-3 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-blue-600">🚀</span>
                <span className="text-lg font-semibold text-gray-900">Help shape our roadmap</span>
              </div>
              <p className="max-w-md text-center text-sm text-gray-600">
                As an early access member, you'll have direct input into which features we prioritise.
                Your feedback drives our development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
