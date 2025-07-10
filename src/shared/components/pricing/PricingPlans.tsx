'use client';

import { Check, Star } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

export const PricingPlans = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {/* Basic Plan */}
          <div className="rounded-lg border bg-white p-8 shadow-lg">
            <div className="mb-8 text-center">
              <h3 className="mb-2 text-2xl font-bold text-gray-900">Basic</h3>
              <div className="mb-2 text-4xl font-bold text-gray-900">
                $30
                <span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>

            <ul className="mb-8 space-y-4">
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Unlimited SOAP note generation</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Basic templates library</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>30-second processing time</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Standard accuracy (95%+)</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Email support</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>HIPAA compliant</span>
              </li>
            </ul>

            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
              Start Free Trial
            </Button>
          </div>

          {/* Professional Plan */}
          <div className="relative rounded-lg border-2 border-blue-600 bg-white p-8 shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="flex items-center space-x-1 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                <Star className="size-4" />
                <span>Most Popular</span>
              </span>
            </div>

            <div className="mb-8 text-center">
              <h3 className="mb-2 text-2xl font-bold text-gray-900">Professional</h3>
              <div className="mb-2 text-4xl font-bold text-gray-900">
                $70
                <span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">For busy practices</p>
            </div>

            <ul className="mb-8 space-y-4">
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span className="font-medium">Everything in Basic, plus:</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Clinical intelligence & insights</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Custom template builder</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Follow-up recommendations</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Risk assessment alerts</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Differential diagnosis prompts</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Priority support</span>
              </li>
            </ul>

            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
              Start Free Trial
            </Button>
          </div>

          {/* Enterprise Plan */}
          <div className="rounded-lg border bg-white p-8 shadow-lg">
            <div className="mb-8 text-center">
              <h3 className="mb-2 text-2xl font-bold text-gray-900">Enterprise</h3>
              <div className="mb-2 text-4xl font-bold text-gray-900">Custom</div>
              <p className="text-gray-600">For large practices</p>
            </div>

            <ul className="mb-8 space-y-4">
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span className="font-medium">Everything in Professional, plus:</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Multi-user management</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Advanced analytics dashboard</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Custom EMR integrations</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>White-label options</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="size-5 text-green-500" />
                <span>24/7 phone support</span>
              </li>
            </ul>

            <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
              Contact Sales
            </Button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4 text-gray-600">
            All plans include a 14-day free trial • No setup fees • Cancel anytime
          </p>
          <p className="text-sm text-gray-500">
            HIPAA compliant • Australian data hosting • 99.9% uptime guarantee
          </p>
        </div>
      </div>
    </section>
  );
};
