'use client';

import {
  ArrowRight,
  Brain,
  Camera,
  FileText,
  Smartphone,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

type ToolLink = {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
};

const tools: ToolLink[] = [
  {
    title: 'Consultation Suite',
    description: 'AI-powered clinical documentation and note-taking',
    href: '/ai-scribe/consultation',
    icon: Stethoscope,
    color: 'text-blue-600',
  },
  {
    title: 'AI Search',
    description: 'Search trusted resources and get quick answers',
    href: '/search',
    icon: FileText,
    color: 'text-green-600',
  },
  {
    title: 'Clinical Images',
    description: 'AI-powered medical image analysis',
    href: '/image/app',
    icon: Camera,
    color: 'text-purple-600',
  },
  {
    title: 'Differential Diagnosis',
    description: 'AI-assisted diagnostic reasoning',
    href: '/differential-diagnosis',
    icon: Brain,
    color: 'text-orange-600',
  },
  {
    title: 'Mobile Upload',
    description: 'Connect mobile devices for real-time data',
    href: '/mobile',
    icon: Smartphone,
    color: 'text-indigo-600',
  },
  {
    title: 'Templates',
    description: 'Manage and customise clinical templates',
    href: '/ai-scribe/templates',
    icon: FileText,
    color: 'text-teal-600',
  },
];

export function QuickToolAccess() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="size-5" />
          Quick Tool Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 ${tool.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                      {tool.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {tool.description}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-gray-400 transition-colors group-hover:text-gray-600" />
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
