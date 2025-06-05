'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

type FAQItem = {
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    question: 'How does the 14-day free trial work?',
    answer: 'You get full access to either the Basic or Professional plan for 14 days without providing a credit card. You can test all features, generate unlimited notes, and see how ClinicalMind fits your workflow. No automatic billing - you choose to continue after the trial ends.',
  },
  {
    question: 'Can I switch between plans?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated. You can also pause your subscription if needed and resume later.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'Your data remains accessible for 30 days after cancellation, giving you time to export your notes and templates. After 30 days, data is permanently deleted from our servers in compliance with privacy regulations.',
  },
  {
    question: 'Is my patient data secure and HIPAA compliant?',
    answer: 'Absolutely. We use enterprise-grade encryption, Australian data hosting, and are fully HIPAA compliant. All audio recordings are processed securely and deleted after transcription. We never store patient conversations.',
  },
  {
    question: 'How accurate are the AI-generated notes?',
    answer: 'Our Basic plan achieves 95%+ accuracy for standard consultations. The Professional plan with clinical intelligence reaches 98%+ accuracy by understanding medical context and terminology specific to general practice.',
  },
  {
    question: 'Do you integrate with EMR systems?',
    answer: 'Currently, notes are generated for copy-paste into any EMR system. We\'re developing direct integrations with major EMR platforms. Enterprise customers can request custom integrations.',
  },
  {
    question: 'What if I need help getting started?',
    answer: 'All plans include comprehensive onboarding support. Professional and Enterprise plans get priority support with faster response times. We also provide training resources and best practice guides.',
  },
  {
    question: 'Can I use this for telehealth consultations?',
    answer: 'Yes! ClinicalMind works perfectly for telehealth appointments. Simply record your video consultation audio and generate notes the same way as in-person visits.',
  },
];

export const PricingFAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index) ? prev.filter(item => item !== index) : [...prev, index],
    );
  };

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about ClinicalMind pricing and features
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="rounded-lg border bg-white shadow-sm">
              <button
                type="button"
                className="flex w-full items-center justify-between p-6 text-left"
                onClick={() => toggleItem(index)}
              >
                <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                {openItems.includes(index)
                  ? (
                      <ChevronUp className="size-5 text-gray-500" />
                    )
                  : (
                      <ChevronDown className="size-5 text-gray-500" />
                    )}
              </button>
              {openItems.includes(index) && (
                <div className="border-t px-6 pb-6 pt-4">
                  <p className="leading-relaxed text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
