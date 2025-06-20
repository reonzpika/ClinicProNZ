'use client';

import { ArrowRight, Camera, FileCheck, Mic, PenTool, Zap } from 'lucide-react';

export const ProductSection = () => {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            Simple, intuitive workflow that fits seamlessly into your consultation routine.
            <span className="font-medium text-blue-600"> It's designed to make your work easier, not more complicated.</span>
          </p>
        </div>

        {/* Desktop 5-step flow */}
        <div className="hidden items-start justify-between lg:flex">
          <div className="flex-1 text-center">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border-4 border-red-50 bg-gradient-to-br from-red-100 to-red-200">
              <Mic className="size-8 text-red-600" />
            </div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">1. Capture Consultation</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              Record with your desktop mic or scan QR to use your phone.
              You can also type notes directly — whatever works best for you.
            </p>
          </div>

          <div className="mx-4 mt-8 shrink-0">
            <ArrowRight className="size-6 text-gray-400" />
          </div>

          <div className="flex-1 text-center">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border-4 border-blue-50 bg-gradient-to-br from-blue-100 to-blue-200">
              <Camera className="size-8 text-blue-600" />
            </div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">2. Add Context</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              Add images, use clinical checklists, or get decision support.
              Everything stays organised within your consultation.
            </p>
          </div>

          <div className="mx-4 mt-8 shrink-0">
            <ArrowRight className="size-6 text-gray-400" />
          </div>

          <div className="flex-1 text-center">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border-4 border-green-50 bg-gradient-to-br from-green-100 to-green-200">
              <Zap className="size-8 text-green-600" />
            </div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">3. Generate Notes</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              Choose your template and watch structured notes appear instantly.
              Handles multi-problem consultations with ease.
            </p>
          </div>

          <div className="mx-4 mt-8 shrink-0">
            <ArrowRight className="size-6 text-gray-400" />
          </div>

          <div className="flex-1 text-center">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border-4 border-purple-50 bg-gradient-to-br from-purple-100 to-purple-200">
              <PenTool className="size-8 text-purple-600" />
            </div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">4. Review & Edit</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              Fine-tune your notes with full editing control.
              Add details, adjust wording — it's your documentation.
            </p>
          </div>

          <div className="mx-4 mt-8 shrink-0">
            <ArrowRight className="size-6 text-gray-400" />
          </div>

          <div className="flex-1 text-center">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border-4 border-indigo-50 bg-gradient-to-br from-indigo-100 to-indigo-200">
              <FileCheck className="size-8 text-indigo-600" />
            </div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">5. Complete & Share</h3>
            <p className="text-sm leading-relaxed text-gray-600">
              Generate referrals, patient advice sheets, or copy to your PMS.
              Everything ready in under a minute.
            </p>
          </div>
        </div>

        {/* Mobile stacked flow */}
        <div className="space-y-8 lg:hidden">
          <div className="flex items-start space-x-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200">
              <Mic className="size-8 text-red-600" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">1. Capture Consultation</h3>
              <p className="text-gray-600">
                Record with your desktop mic or scan QR to use your phone. You can also type notes directly — whatever works best for you.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
              <Camera className="size-8 text-blue-600" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">2. Add Context</h3>
              <p className="text-gray-600">
                Add images, use clinical checklists, or get decision support. Everything stays organized within your consultation.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200">
              <Zap className="size-8 text-green-600" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">3. Generate Notes</h3>
              <p className="text-gray-600">
                Choose your template and watch structured notes appear instantly. Handles multi-problem consultations with ease.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200">
              <PenTool className="size-8 text-purple-600" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">4. Review & Edit</h3>
              <p className="text-gray-600">
                Fine-tune your notes with full editing control. Add details, adjust wording — it's your documentation.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200">
              <FileCheck className="size-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">5. Complete & Share</h3>
              <p className="text-gray-600">
                Generate referrals, patient advice sheets, or copy to your PMS. Everything ready in under a minute.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
            <div className="mb-2 text-2xl font-bold text-green-600">Easy</div>
            <div className="text-sm text-gray-600">Fits naturally into your workflow</div>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center">
            <div className="mb-2 text-2xl font-bold text-blue-600">Flexible</div>
            <div className="text-sm text-gray-600">Audio, typing, or both — your choice</div>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-6 text-center">
            <div className="mb-2 text-2xl font-bold text-purple-600">Complete</div>
            <div className="text-sm text-gray-600">From consultation to referral in minutes</div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 rounded-full border border-gray-200 bg-gray-50 px-6 py-3">
            <span className="text-sm font-medium text-gray-700">✓ Meets RNZCGP documentation standards</span>
          </div>
        </div>
      </div>
    </section>
  );
};
