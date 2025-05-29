import Link from 'next/link';
import React from 'react';

import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';

import { ChatbotWidget } from './ChatbotWidget';

const PlaceholderFeature: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <Card className="mb-4">
    <CardHeader>
      <h3 className="text-xs font-semibold">{title}</h3>
    </CardHeader>
    <CardContent className="p-1">
      <div className="mb-1 text-xs text-muted-foreground">{description}</div>
      <div className="inline-block rounded bg-gray-100 px-1 py-0.5 text-xs">Coming soon</div>
    </CardContent>
  </Card>
);

const RightSidebarFeatures: React.FC = () => {
  return (
    <div>
      {/* AI Scribing Guide */}
      <Card className="mb-4 border-blue-200 bg-blue-50">
        <CardHeader>
          <h3 className="text-xs font-semibold text-blue-900">📚 AI Scribing Guide</h3>
        </CardHeader>
        <CardContent className="p-1">
          <div className="mb-2 text-xs text-blue-700">
            Learn about AI scribing best practices, risks, consent processes, and NZ-specific guidance for primary care.
          </div>
          <Link
            href="/ai-scribing"
            className="inline-block rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
          >
            Read Guide →
          </Link>
        </CardContent>
      </Card>

      {/* AI Chatbot */}
      <div className="mb-4">
        <ChatbotWidget />
      </div>

      <PlaceholderFeature title="ACC Code Suggestions" description="Automatic ACC code suggestions based on your consultation note." />
      <PlaceholderFeature title="NZ Guidelines" description="Relevant New Zealand clinical guidelines based on your note." />
      <PlaceholderFeature title="Red Flags" description="Highlight important red flags detected in the consultation note." />
      <PlaceholderFeature title="Patient Handouts" description="Suggest and provide patient education handouts." />
      {/* TODO: Add props for feature toggling, dynamic feature list, etc. */}
    </div>
  );
};

export default RightSidebarFeatures;
