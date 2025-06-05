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
    answer: 'You get full access to either the Basic or Professional plan for 14 days, no credit card required. You can test all features, create unlimited notes during the trial, and decide which plan works best for your practice.',
  },
  {
    question: 'Can I switch between plans?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated. If you upgrade mid-cycle, you\'ll only pay the difference for the remaining days.',
  },
  {
    question: 'What happens if I exceed my note limit on the Basic plan?',
    answer: 'If you reach your 50-note limit on the Basic plan, you\'ll receive a notification. You can either upgrade to Professional for unlimited notes or wait until your next billing cycle. We never charge overage fees.',
  },
  {
    question: 'Is my data secure and HIPAA compliant?',
    answer: 'Absolutely. All plans include end-to-end encryption, HIPAA compliance, secure data storage in New Zealand, and regular security audits. Your patient data is never shared or used for training our AI models.',
  },
  {
    question: 'Do you offer discounts for multiple doctors?',
    answer: 'Yes! We offer volume discounts for practices with 10+ doctors. Contact our sales team for custom pricing. We also offer special rates for medical students and residents.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time with no cancellation fees. Your access continues until the end of your current billing period, and you can export all your data.',
  },
  {
    question: 'What\'s included in the Enterprise plan?',
    answer: 'Enterprise includes everything in Professional plus multi-user management, EMR integrations, custom workflows, advanced analytics, dedicated account manager, 24/7 phone support, on-site training, and SLA guarantees.',
  },
  {
    question: 'Do you integrate with my existing EMR system?',
    answer: 'Professional and Enterprise plans include EMR integrations. We support most major EMR systems used in New Zealand including MedTech, Profile, and others. Contact us to confirm compatibility with your specific system.',
  },
];

export const PricingFAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index],
    );
  };

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about our pricing and plans
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div key={index} className="rounded-lg border border-gray-200 bg-white">
              <button
                className="flex w-full items-center justify-between p-6 text-left"
                onClick={() => toggleItem(index)}
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.question}
                </h3>
                {openItems.includes(index)
                  ? (
                      <ChevronUp className="size-5 text-gray-500" />
                    )
                  : (
                      <ChevronDown className="size-5 text-gray-500" />
                    )}
              </button>
              {openItems.includes(index) && (
                <div className="border-t border-gray-200 px-6 pb-6">
                  <p className="pt-4 leading-relaxed text-gray-600">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Still have questions?
            {' '}
            <a href="mailto:support@consultai.nz" className="font-medium text-blue-600 hover:text-blue-700">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
