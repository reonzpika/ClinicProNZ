'use client';

import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader } from '@/src/shared/components/ui/card';
import { useRBAC } from '@/src/shared/hooks/useRBAC';

export const WorkflowInstructions: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { tier, hasFeatureAccess } = useRBAC();

  // Check if user has standard tier or higher features
  const _hasSessionManagement = hasFeatureAccess('sessionManagement');
  const _hasTemplateManagement = hasFeatureAccess('templateManagement');
  const isBasicTier = tier === 'basic';

  // Basic tier workflow (simplified 3-step process)
  const basicWorkflow = [
    {
      step: 1,
      title: 'Input Mode & Template',
      description: 'Choose Audio or Typed input. Uses default Multi-Problem SOAP template (5 consultations/day limit)',
    },
    {
      step: 2,
      title: 'Capture Consultation',
      description: 'Record voice during consultation or type notes directly. Add examination findings in Additional Notes section',
    },
    {
      step: 3,
      title: 'Generate & Review',
      description: 'Process to create structured clinical note, then review and copy to your system',
    },
  ];

  // Standard tier workflow (full 5-step process)
  const standardWorkflow = [
    {
      step: 1,
      title: 'Patient Session',
      description: 'Select existing patient or create new session (unlimited sessions)',
    },
    {
      step: 2,
      title: 'Documentation Setup',
      description: 'Choose template (GP Standard, Specialist, Custom, etc.) and input mode (Audio/Typed)',
    },
    {
      step: 3,
      title: 'Capture Consultation',
      description: 'Record voice during consultation or type notes directly',
    },
    {
      step: 4,
      title: 'Additional Notes (Optional)',
      description: 'For audio mode: Add vitals, examination findings etc. For typed mode: Include all details directly in Consultation Note',
    },
    {
      step: 5,
      title: 'Generate & Review',
      description: 'Process to create structured clinical note, then review and copy to your system',
    },
  ];

  const workflow = isBasicTier ? basicWorkflow : standardWorkflow;

  return (
    <Card className="border-blue-200 bg-blue-50 shadow-sm">
      <CardHeader className="p-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="size-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Quick Start Guide
              {' '}
              {isBasicTier && '(Basic)'}
            </span>
          </div>
          {isExpanded
            ? (
                <ChevronUp className="size-4 text-blue-600" />
              )
            : (
                <ChevronDown className="size-4 text-blue-600" />
              )}
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="px-3 pb-3 pt-0">
          <div className="space-y-3 text-xs text-blue-800">
            {/* Tier-specific workflow steps */}
            <div className="space-y-2">
              {workflow.map(({ step, title, description }) => (
                <div key={step} className="flex items-start gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium">
                    {step}
                  </span>
                  <div>
                    <div className="font-medium">{title}</div>
                    <div className="text-blue-700">{description}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tier-specific important notes */}
            <div className="border-t border-blue-200 pt-2">
              <div className="font-medium text-blue-800">⚠️ Important Notes:</div>
              <ul className="mt-1 space-y-1 text-blue-700">
                <li>• Use mobile for best transcription quality - desktop recording may stop working when switching browser tabs or apps</li>
                <li>• Always review the generated notes before copying to your system</li>
                {isBasicTier && (
                  <>
                    <li>• Basic tier: 5 consultations per day, resets at midnight</li>
                    <li>• Upgrade to Standard for unlimited sessions and custom templates</li>
                  </>
                )}
                {!isBasicTier && (
                  <>
                    <li>• Unlimited consultations and custom template creation available</li>
                    <li>• Session history is saved for easy patient management</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
