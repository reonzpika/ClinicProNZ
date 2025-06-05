'use client';

import { Check, Clock, FileText, MessageSquare, Play } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
              Finally, Leave the Clinic on Time Every Day -
              <span className="text-blue-600"> Start Documenting Smarter</span>
            </h1>

            <p className="mb-8 text-xl leading-relaxed text-gray-600">
              The dead simple AI scribe that saves family medicine doctors 2+ hours daily on notes,
              without the enterprise price tag or complexity. Start with a 14-day free trial.
            </p>

            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-center space-x-3 lg:justify-start">
                <Check className="size-5 text-green-500" />
                <span className="text-lg">
                  <strong>14-Day Free Trial</strong>
                  {' '}
                  - Test both Basic and Professional plans
                </span>
              </div>
              <div className="flex items-center justify-center space-x-3 lg:justify-start">
                <Clock className="size-5 text-green-500" />
                <span className="text-lg">
                  <strong>30-Second Note Generation</strong>
                  {' '}
                  - Single-button recording to SOAP format
                </span>
              </div>
              <div className="flex items-center justify-center space-x-3 lg:justify-start">
                <FileText className="size-5 text-green-500" />
                <span className="text-lg">
                  <strong>Built for Real Doctors</strong>
                  {' '}
                  - No hallucinations, no enterprise complexity
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Button size="lg" className="bg-blue-600 px-8 py-4 text-lg text-white hover:bg-blue-700">
                Start 14-Day Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-blue-600 px-8 py-4 text-lg text-blue-600 hover:bg-blue-50">
                <Play className="mr-2 size-5" />
                Watch 2-Minute Demo
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-2xl">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-blue-100">
                  <MessageSquare className="size-10 text-blue-600" />
                </div>
                <Button className="rounded-full bg-red-500 px-8 py-3 text-white hover:bg-red-600">
                  🎤 Start Recording
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="mb-3 font-semibold text-gray-900">Generated SOAP Note:</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>S:</strong>
                    {' '}
                    Patient reports fatigue and headaches...
                  </p>
                  <p>
                    <strong>O:</strong>
                    {' '}
                    Vital signs stable, BP 120/80...
                  </p>
                  <p>
                    <strong>A:</strong>
                    {' '}
                    Likely tension headache with stress...
                  </p>
                  <p>
                    <strong>P:</strong>
                    {' '}
                    Recommend stress management...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
