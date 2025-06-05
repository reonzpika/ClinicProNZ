'use client';

import { Check, Star } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

export const PricingPlans = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600">
            All plans include a 14-day free trial. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Basic Plan */}
          <div className="rounded-lg border-2 border-gray-200 bg-white p-8">
            <div className="mb-8 text-center">
              <h3 className="mb-2 text-2xl font-bold text-gray-900">Basic</h3>
              <div className="mb-4 text-4xl font-bold text-gray-900">
                $30
                <span className="text-lg text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>

            <ul className="mb-8 space-y-4">
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>50 notes per month</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>SOAP format templates</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Mobile + web access</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Email support</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Custom template builder</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Basic transcription accuracy</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Standard processing speed</span>
              </li>
            </ul>

            <Button className="w-full bg-gray-600 text-white hover:bg-gray-700">
              Start 14-Day Free Trial
            </Button>
          </div>

          {/* Professional Plan */}
          <div className="relative rounded-lg border-2 border-blue-500 bg-white p-8 shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="flex items-center space-x-1 rounded-full bg-blue-500 px-4 py-1 text-sm font-semibold text-white">
                <Star className="size-4" />
                <span>Most Popular</span>
              </span>
            </div>

            <div className="mb-8 text-center">
              <h3 className="mb-2 text-2xl font-bold text-gray-900">Professional</h3>
              <div className="mb-4 text-4xl font-bold text-gray-900">
                $70
                <span className="text-lg text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">For busy practices</p>
            </div>

            <ul className="mb-8 space-y-4">
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span className="font-medium">Unlimited notes</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>All Basic features included</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span className="font-medium">Clinical intelligence features</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Predictive care insights</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Clinical reasoning support</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Risk assessment alerts</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Priority processing (under 15 seconds)</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Advanced template customization</span>
              </li>
            </ul>

            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
              Start 14-Day Free Trial
            </Button>
            <p className="mt-2 text-center text-sm text-gray-500">
              Most popular choice for GPs
            </p>
          </div>

          {/* Enterprise Plan */}
          <div className="rounded-lg border-2 border-gray-200 bg-white p-8">
            <div className="mb-8 text-center">
              <h3 className="mb-2 text-2xl font-bold text-gray-900">Enterprise</h3>
              <div className="mb-4 text-4xl font-bold text-gray-900">
                Custom
                <span className="text-lg text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">For large practices & clinics</p>
            </div>

            <ul className="mb-8 space-y-4">
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Everything in Professional</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Multi-user management</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>EMR integrations</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Custom workflows</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>24/7 phone support</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>On-site training</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>SLA guarantees</span>
              </li>
            </ul>

            <Button className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              Contact Sales
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            All plans include HIPAA compliance, data encryption, and regular backups.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Prices shown in NZD. Volume discounts available for practices with 10+ doctors.
          </p>
        </div>
      </div>
    </section>
  );
};
