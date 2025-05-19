import React from 'react';

import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';

import { AccCodeSuggestions } from './AccCodeSuggestions';

const PlaceholderFeature: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <Card className="mt-1">
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
      <AccCodeSuggestions />
      <PlaceholderFeature title="NZ Guidelines" description="Relevant New Zealand clinical guidelines based on your note." />
      <PlaceholderFeature title="Red Flags" description="Highlight important red flags detected in the consultation note." />
      <PlaceholderFeature title="Patient Handouts" description="Suggest and provide patient education handouts." />
      {/* TODO: Add props for feature toggling, dynamic feature list, etc. */}
    </div>
  );
};

export default RightSidebarFeatures;
