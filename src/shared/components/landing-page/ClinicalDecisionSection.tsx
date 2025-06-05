'use client';

import { AlertTriangle, BookOpen, Brain, Calendar, CheckCircle, Target } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

export const ClinicalDecisionSection = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Not Just Documentation - Clinical Intelligence That Thinks Alongside You
          </h2>
          <p className="text-xl text-gray-600">
            Go beyond transcription. Get AI that catches what you might miss and suggests what comes next.
          </p>
        </div>

        <div className="mb-16 rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="mb-3 text-lg font-semibold text-red-900">The Problem with Basic AI Scribes</h3>
          <p className="text-red-800">
            AI scribes often miss important clinical details or add irrelevant information that wasn't part of the consultation.
            GPs need documentation that is not just a transcription but accurate and clinically insightful. Otherwise,
            extensive editing and fact-checking are needed, reducing the efficiency of using AI scribes.
          </p>
        </div>

        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 text-center shadow-lg">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <Calendar className="size-8 text-green-600" />
            </div>
            <h4 className="mb-4 text-lg font-semibold text-gray-900">Predictive Care Insights</h4>
            <ul className="space-y-3 text-left text-gray-600">
              <li className="flex items-center space-x-2">
                <Calendar className="size-4 text-green-500" />
                <span className="text-sm">Follow-up timing suggestions</span>
              </li>
              <li className="flex items-center space-x-2">
                <Target className="size-4 text-green-500" />
                <span className="text-sm">Preventive care reminders</span>
              </li>
              <li className="flex items-center space-x-2">
                <AlertTriangle className="size-4 text-green-500" />
                <span className="text-sm">Risk stratification alerts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="size-4 text-green-500" />
                <span className="text-sm">Care pathway recommendations</span>
              </li>
            </ul>
            <p className="mt-4 text-sm italic text-gray-500">
              "Never miss important follow-up opportunities"
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 text-center shadow-lg">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-blue-100">
              <Brain className="size-8 text-blue-600" />
            </div>
            <h4 className="mb-4 text-lg font-semibold text-gray-900">Clinical Reasoning Support</h4>
            <ul className="space-y-3 text-left text-gray-600">
              <li className="flex items-center space-x-2">
                <Brain className="size-4 text-blue-500" />
                <span className="text-sm">Differential diagnosis prompts</span>
              </li>
              <li className="flex items-center space-x-2">
                <BookOpen className="size-4 text-blue-500" />
                <span className="text-sm">Evidence-based suggestions</span>
              </li>
              <li className="flex items-center space-x-2">
                <AlertTriangle className="size-4 text-blue-500" />
                <span className="text-sm">Red flag identification</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="size-4 text-blue-500" />
                <span className="text-sm">Assessment completeness checks</span>
              </li>
            </ul>
            <p className="mt-4 text-sm italic text-gray-500">
              "AI-powered clinical thinking support"
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 text-center shadow-lg">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-purple-100">
              <CheckCircle className="size-8 text-purple-600" />
            </div>
            <h4 className="mb-4 text-lg font-semibold text-gray-900">Quality Documentation</h4>
            <ul className="space-y-3 text-left text-gray-600">
              <li className="flex items-center space-x-2">
                <CheckCircle className="size-4 text-purple-500" />
                <span className="text-sm">Documentation completeness checks</span>
              </li>
              <li className="flex items-center space-x-2">
                <Target className="size-4 text-purple-500" />
                <span className="text-sm">Clinical accuracy verification</span>
              </li>
              <li className="flex items-center space-x-2">
                <BookOpen className="size-4 text-purple-500" />
                <span className="text-sm">Professional standard compliance</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="size-4 text-purple-500" />
                <span className="text-sm">Template auto-completion</span>
              </li>
            </ul>
            <p className="mt-4 text-sm italic text-gray-500">
              "Ensure every note meets clinical standards"
            </p>
          </div>
        </div>

        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-6">
            <h4 className="mb-4 text-lg font-semibold text-gray-900">Basic Transcription</h4>
            <div className="rounded border bg-white p-4 text-sm text-gray-600">
              <p className="mb-2">
                <strong>Chief Complaint:</strong>
                {' '}
                Patient complains of chest pain
              </p>
              <p className="mb-2">
                <strong>Assessment:</strong>
                {' '}
                Chest pain, likely musculoskeletal
              </p>
              <p className="text-red-600">⚠️ Missing: Duration, triggers, associated symptoms</p>
              <p className="text-red-600">⚠️ No risk assessment or follow-up plan</p>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-6">
            <h4 className="mb-4 text-lg font-semibold text-gray-900">ClinicalMind Enhanced Output</h4>
            <div className="rounded border bg-white p-4 text-sm">
              <p className="mb-2">
                <strong>Chief Complaint:</strong>
                {' '}
                45-year-old presents with acute chest pain, onset 2 hours ago
              </p>
              <p className="mb-2">
                <strong>Assessment:</strong>
                {' '}
                Chest pain, likely musculoskeletal based on examination
              </p>
              <div className="mt-2 rounded bg-blue-50 p-2">
                <p className="text-xs text-blue-800"><strong>Clinical Insights:</strong></p>
                <p className="text-xs text-blue-700">• Consider cardiac risk factors in 45+ patient</p>
                <p className="text-xs text-blue-700">• Follow-up recommended in 24-48 hours if symptoms persist</p>
                <p className="text-xs text-blue-700">• Safety net advice provided</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-lg bg-white p-8 shadow-md">
          <blockquote className="mb-4 text-lg italic leading-relaxed text-gray-700">
            "The AI highlights any statements with low confidence to help catch errors. It also generates a checklist
            of clinical considerations at the bottom so I can verify everything important was captured."
          </blockquote>
          <cite className="font-semibold not-italic text-blue-600">
            - Dr. [Name], General Practitioner
          </cite>
        </div>

        <div className="mb-8 overflow-hidden rounded-lg bg-white shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Basic AI Scribes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    ClinicalMind Pro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">Transcription</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-green-600">✅ Basic</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-green-600">✅ Enhanced</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">Clinical Insights</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">❌</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-green-600">✅ Predictive suggestions</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">Follow-up Planning</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">❌</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-green-600">✅ Automated recommendations</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">Risk Assessment</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">❌</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-green-600">✅ Clinical risk alerts</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">Differential Support</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">❌</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-green-600">✅ Evidence-based prompts</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">Confidence Scoring</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">❌</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-green-600">✅ Uncertainty highlighting</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center">
          <Button className="bg-blue-600 px-8 py-3 text-white hover:bg-blue-700">
            Experience Clinical Intelligence
          </Button>
        </div>
      </div>
    </section>
  );
};
