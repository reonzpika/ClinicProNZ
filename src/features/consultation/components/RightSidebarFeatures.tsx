import Link from 'next/link';
import React from 'react';

import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';

import { ChatbotWidget } from './ChatbotWidget';

const PlaceholderFeature: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <Card className="mb-4 border-slate-200 bg-white shadow-sm">
    <CardHeader className="border-b border-slate-100 bg-slate-50">
      <h3 className="text-sm font-medium text-slate-700">{title}</h3>
    </CardHeader>
    <CardContent className="p-3">
      <div className="mb-2 text-sm text-slate-600">{description}</div>
      <div className="inline-block rounded bg-slate-100 px-2 py-1 text-xs text-slate-500">Coming soon</div>
    </CardContent>
  </Card>
);

const RightSidebarFeatures: React.FC = () => {
  return (
    <div>
      {/* Clinical Documentation Guide */}
      <Card className="mb-4 border-blue-200 bg-blue-50 shadow-sm">
        <CardHeader className="border-b border-blue-100 bg-blue-100">
          <h3 className="text-sm font-medium text-blue-900">📚 Digital Documentation Guide</h3>
        </CardHeader>
        <CardContent className="p-3">
          <div className="mb-3 text-sm text-blue-700">
            Learn about digital scribing best practices, privacy considerations, consent processes, and NZ-specific guidance for primary care documentation.
          </div>
          <Link
            href="/ai-scribing"
            className="inline-block rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            Read Guide →
          </Link>
        </CardContent>
      </Card>

      {/* Clinical Reference Tool */}
      <div className="mb-4">
        <ChatbotWidget />
      </div>

      <PlaceholderFeature title="ACC Code Lookup" description="Automatic ACC code suggestions based on your clinical documentation." />
      <PlaceholderFeature title="NZ Clinical Guidelines" description="Relevant New Zealand clinical guidelines and protocols based on your notes." />
      <PlaceholderFeature title="Clinical Alerts" description="Highlight important clinical flags and considerations detected in documentation." />
      <PlaceholderFeature title="Patient Resources" description="Suggest and provide patient education materials and handouts." />
      <PlaceholderFeature title="Drug Interactions" description="Check for potential drug interactions and contraindications." />
      <PlaceholderFeature title="Billing Codes" description="Suggest appropriate billing codes based on consultation content." />
    </div>
  );
};

export default RightSidebarFeatures;
