'use client';

import { ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';

import { clinicProLandingData } from '@/shared/data/clinicpro-landing';

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-nz-blue-50/30 py-16 sm:py-24 lg:py-32">
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="from-nz-green-200/8 to-nz-blue-300/6 absolute -left-40 top-32 size-[600px] rounded-full bg-gradient-to-br blur-3xl"></div>
        <div className="from-nz-blue-200/6 to-nz-green-300/8 absolute -right-60 bottom-20 size-[700px] rounded-full bg-gradient-to-tr blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-nz-green-100 to-nz-blue-100 shadow-lg">
              <HelpCircle className="size-8 text-nz-green-600" />
            </div>
          </div>
          <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Everything you need to know about ClinicPro and early access
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {clinicProLandingData.faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
            >
              {/* Question/Trigger */}
              <button
                onClick={() => toggleAccordion(index)}
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50/50"
                aria-expanded={openIndex === index}
              >
                <h3 className="pr-4 text-lg font-semibold text-gray-900">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`size-5 shrink-0 text-gray-500 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Answer/Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="border-t border-gray-100 bg-gray-50/30 px-6 py-4">
                  <p className="leading-relaxed text-gray-700">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-center">
          <div className="rounded-2xl border border-nz-green-200/50 bg-gradient-to-r from-nz-green-50/60 to-nz-blue-50/40 p-6">
            <h3 className="mb-3 text-xl font-bold text-gray-900">
              Still have questions?
            </h3>
            <p className="mb-4 text-gray-600">
              We're here to help! Reach out to Dr Ryo directly for any specific concerns about ClinicPro.
            </p>
            <a
              href="mailto:ryo@clinicpro.nz"
              className="inline-flex items-center rounded-lg bg-nz-green-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-nz-green-700"
            >
              Contact Dr Ryo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
