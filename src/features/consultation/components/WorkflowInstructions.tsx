'use client';

import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';

export const WorkflowInstructions: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-blue-200 bg-blue-50 shadow-sm">
      <CardHeader className="p-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="size-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Quick Start Guide</span>
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
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium">1</span>
                <div>
                  <div className="font-medium">Patient Session</div>
                  <div className="text-blue-700">Select existing patient or create new session</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium">2</span>
                <div>
                  <div className="font-medium">Documentation Setup</div>
                  <div className="text-blue-700">Choose template (GP Standard, Specialist, etc.) and input mode (Audio/Typed)</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium">3</span>
                <div>
                  <div className="font-medium">Capture Consultation</div>
                  <div className="text-blue-700">Record voice during consultation or type notes directly</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium">4</span>
                <div>
                  <div className="font-medium">Additional Notes (Optional)</div>
                  <div className="text-blue-700">For audio mode: Add vitals, examination findings etc. Gather anything that is not captured by the audio recording. For typed mode: Include all details directly in Consultation Note</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium">5</span>
                <div>
                  <div className="font-medium">Generate & Review</div>
                  <div className="text-blue-700">Process to create structured clinical note, then review and copy to your system</div>
                </div>
              </div>
            </div>

            <div className="border-t border-blue-200 pt-2">
              <div className="font-medium text-blue-800">⚠️ Important Notes:</div>
              <ul className="mt-1 space-y-1 text-blue-700">
                <li>• Use mobile for best transcription quality - desktop recording may stop working when switching browser tabs or apps</li>
                <li>• Always review the generated notes before copying to your system</li>
              </ul>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
