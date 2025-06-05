'use client';

import { Check } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Start with a 14-day free trial, then choose your plan
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
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
            </ul>

            <Button className="w-full bg-gray-600 text-white hover:bg-gray-700">
              Start 14-Day Free Trial
            </Button>
          </div>

          <div className="relative rounded-lg bg-blue-600 p-8 text-white">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <span className="rounded-full bg-orange-500 px-4 py-1 text-sm font-semibold text-white">
                Most Popular
              </span>
            </div>

            <div className="mb-8 text-center">
              <h3 className="mb-2 text-2xl font-bold">Professional</h3>
              <div className="mb-4 text-4xl font-bold">
                $70
                <span className="text-lg text-blue-200">/month</span>
              </div>
              <p className="text-blue-200">For busy practices</p>
            </div>

            <ul className="mb-8 space-y-4">
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-400" />
                <span>Unlimited notes</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-400" />
                <span>All Basic features included</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-400" />
                <span>Clinical intelligence features</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-400" />
                <span>Predictive care insights</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-400" />
                <span>Clinical reasoning support</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-400" />
                <span>Priority processing</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-400" />
                <span>Priority support</span>
              </li>
            </ul>

            <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
              Start 14-Day Free Trial
            </Button>
            <p className="mt-2 text-center text-sm text-blue-200">
              14-day free trial for both plans
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
