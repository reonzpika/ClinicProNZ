'use client';

import { FileText, Settings, User, Zap } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

export const CustomTemplatesSection = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Finally, Templates That Actually Match How You Work
          </h2>
          <p className="text-xl text-gray-600">
            Stop fighting rigid formats. Create documentation that fits your practice and personal style.
          </p>
        </div>

        <div className="mb-16 grid items-center gap-16 lg:grid-cols-2">
          <div>
            <h3 className="mb-6 text-2xl font-bold text-gray-900">The Template Problem</h3>
            <p className="mb-8 text-lg leading-relaxed text-gray-700">
              Templates are too rigid and don't match how GPs actually document. Most AI scribes force you into
              generic formats that don't work for the variety of consultations GPs handle daily. You need
              flexibility to document everything from routine check-ups to complex assessments in your own style.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h4 className="mb-4 text-lg font-semibold text-gray-900">Template Gallery</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 rounded-lg bg-blue-50 p-3">
                <FileText className="size-5 text-blue-600" />
                <span className="text-sm font-medium">Driver Licence Medical</span>
              </div>
              <div className="flex items-center space-x-3 rounded-lg bg-blue-50 p-3">
                <FileText className="size-5 text-blue-600" />
                <span className="text-sm font-medium">6 Weeks Baby Check-up</span>
              </div>
              <div className="flex items-center space-x-3 rounded-lg bg-blue-50 p-3">
                <FileText className="size-5 text-blue-600" />
                <span className="text-sm font-medium">Travel Medicine Consultation</span>
              </div>
              <div className="flex items-center space-x-3 rounded-lg bg-blue-50 p-3">
                <FileText className="size-5 text-blue-600" />
                <span className="text-sm font-medium">Paediatric/Adolescent Assessment</span>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border border-green-200 bg-green-50 p-3">
                <FileText className="size-5 text-green-600" />
                <span className="text-sm font-medium">GP Standard Consultation (covers 80%+ of visits)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12 grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100">
              <Settings className="size-8 text-blue-600" />
            </div>
            <h4 className="mb-3 text-lg font-semibold text-gray-900">Easy Builder</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Simple template editor</li>
              <li>• Rearrange sections with clicks</li>
              <li>• Preview as you build</li>
              <li>• Save unlimited variations</li>
            </ul>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100">
              <User className="size-8 text-blue-600" />
            </div>
            <h4 className="mb-3 text-lg font-semibold text-gray-900">GP Personalisation</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Your preferred heading styles</li>
              <li>• Custom abbreviations and shortcuts</li>
              <li>• Personal documentation preferences</li>
              <li>• Practice-specific workflows</li>
            </ul>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100">
              <Zap className="size-8 text-blue-600" />
            </div>
            <h4 className="mb-3 text-lg font-semibold text-gray-900">Full AI Control</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• Choose detail level (brief to comprehensive)</li>
              <li>• Adjust AI insight frequency</li>
              <li>• Set clinical suggestion preferences</li>
              <li>• Control what AI highlights and suggests</li>
            </ul>
          </div>
        </div>

        <div className="mb-8 rounded-lg bg-white p-8 shadow-md">
          <blockquote className="mb-4 text-lg italic leading-relaxed text-gray-700">
            "I created a template with my preferred style and the AI now generates notes exactly how I like them.
            The level of customisation means I barely need to edit anything anymore."
          </blockquote>
          <cite className="font-semibold not-italic text-blue-600">
            - Dr. [Name], General Practitioner
          </cite>
        </div>

        <div className="text-center">
          <Button className="bg-blue-600 px-8 py-3 text-white hover:bg-blue-700">
            See Template Builder Demo
          </Button>
        </div>
      </div>
    </section>
  );
};
