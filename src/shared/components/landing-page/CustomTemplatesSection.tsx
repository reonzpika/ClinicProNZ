'use client';

import { Brain, Database, FileText, Globe, Share2, Smartphone } from 'lucide-react';

export const CustomTemplatesSection = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Core Features with NZ Context
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            Tailored features that address real NZ GP workflows, built specifically for our healthcare system.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Mobile Recording - Key Differentiator */}
          <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute right-0 top-0 size-20 bg-gradient-to-l from-green-500 to-transparent opacity-10"></div>
            <div className="mb-4 flex items-center space-x-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Smartphone className="size-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mobile Recording Option</h3>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Unique to Us
                </span>
              </div>
            </div>
            <p className="mb-4 leading-relaxed text-gray-600">
              Use your desktop microphone or scan QR code with your phone for recording.
              Perfect when desktop mic setup is a hassle — no hardware needed.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-green-500"></span>
                <span>Desktop or mobile — your choice</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-green-500"></span>
                <span>Zero mobile setup required</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-green-500"></span>
                <span>Real-time desktop sync</span>
              </div>
            </div>
          </div>

          {/* Custom Templates */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-4 flex items-center space-x-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <FileText className="size-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">NZ GP Templates</h3>
            </div>
            <p className="mb-4 leading-relaxed text-gray-600">
              Templates designed around actual NZ GP workflows. Create custom templates from examples
              or natural language descriptions.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-blue-500"></span>
                <span>Preserves your documentation style</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-blue-500"></span>
                <span>NZ medical abbreviations</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-blue-500"></span>
                <span>Extract from your existing notes</span>
              </div>
            </div>
          </div>

          {/* Clinical Decision Support */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-4 flex items-center space-x-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Brain className="size-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Clinical Decision Support</h3>
            </div>
            <p className="mb-4 leading-relaxed text-gray-600">
              Intelligent clinical reasoning support that understands NZ healthcare context.
              Never replaces your judgment, always supports it.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-purple-500"></span>
                <span>Differential diagnosis support</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-purple-500"></span>
                <span>Management plan suggestions</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-purple-500"></span>
                <span>Customizable reasoning levels</span>
              </div>
            </div>
          </div>

          {/* NZ Healthcare Integration */}
          <div className="relative rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute right-3 top-3 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              Coming Soon
            </div>
            <div className="mb-4 flex items-center space-x-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Globe className="size-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">NZ Health Resources</h3>
            </div>
            <p className="mb-4 leading-relaxed text-gray-600">
              Centralised access to NZ health resources, guidelines, and tools.
              Everything GPs commonly use, integrated into your workflow.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-green-500"></span>
                <span>RNZCGP guidelines integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-green-500"></span>
                <span>Local health pathways</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-green-500"></span>
                <span>ACC screening tools</span>
              </div>
            </div>
          </div>

          {/* Template Marketplace - Coming Soon */}
          <div className="relative rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute right-3 top-3 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              Coming Soon
            </div>
            <div className="mb-4 flex items-center space-x-3">
              <div className="rounded-lg bg-indigo-100 p-2">
                <Share2 className="size-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Template Marketplace</h3>
            </div>
            <p className="mb-4 leading-relaxed text-gray-600">
              Share and discover templates created by fellow NZ GPs.
              Best practices from the community, for the community.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-indigo-500"></span>
                <span>Community-driven templates</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-indigo-500"></span>
                <span>Specialty-specific documentation</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-indigo-500"></span>
                <span>Best practice sharing</span>
              </div>
            </div>
          </div>

          {/* QR Image Capture - Coming Soon */}
          <div className="relative rounded-xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute right-3 top-3 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              Coming Soon
            </div>
            <div className="mb-4 flex items-center space-x-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <Database className="size-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">QR Image Capture</h3>
            </div>
            <p className="mb-4 leading-relaxed text-gray-600">
              Scan QR code to capture clinical photos (skin lesions, wounds, etc.)
              directly synced with your consultation notes.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-orange-500"></span>
                <span>Mobile photo capture</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-orange-500"></span>
                <span>Automatic sync with notes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="size-2 rounded-full bg-orange-500"></span>
                <span>Privacy-first approach</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center space-y-2 rounded-xl border border-blue-200 bg-blue-50 px-8 py-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-800">Built specifically for NZ healthcare</span>
            </div>
            <span className="text-xs text-blue-600">While others focus on transcription, we focus on complete clinical workflows</span>
          </div>
        </div>
      </div>
    </section>
  );
};
