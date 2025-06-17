import { Brain, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';

import type { Template, TemplateSettings } from '../types';
import { compileTemplate } from '../utils/compileTemplate';
import { SYSTEM_PROMPT } from '../utils/systemPrompt';

type TemplatePreviewProps = {
  template: Template;
};

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [showSettingsDetails, setShowSettingsDetails] = useState(false);
  const sampleTranscription = 'This is a sample transcription of a general practice consultation.';
  const sampleQuickNotes = ['Sample quick note 1', 'Sample quick note 2'];

  // Default settings
  const defaultSettings: TemplateSettings = {
    aiAnalysis: {
      enabled: false,
      components: {
        differentialDiagnosis: false,
        managementPlan: false,
      },
      level: 'medium',
    },
  };

  const settings = template.dsl?.settings || defaultSettings;

  // Helper function to get component display names
  const getComponentName = (key: string): string => {
    switch (key) {
      case 'differentialDiagnosis': return 'Differential Diagnosis';
      case 'managementPlan': return 'Management Plan';
      default: return key;
    }
  };

  // Helper function to get AI analysis display
  const getAiAnalysisDisplay = (settings: TemplateSettings) => {
    if (!settings.aiAnalysis.enabled) {
      return null;
    }

    const enabledComponents = Object.entries(settings.aiAnalysis.components)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => getComponentName(key));

    if (enabledComponents.length === 0) {
      return null;
    }

    return {
      label: `AI Analysis (${settings.aiAnalysis.level})`,
      components: enabledComponents,
      color: 'text-purple-600',
    };
  };

  // Render DSL sections for preview
  const renderSections = (sections: any[], level = 0) => {
    return sections.map((section, index) => (
      <div key={index} className={`${level > 0 ? 'ml-4' : ''} mb-2`}>
        <div className="text-sm font-medium">{section.heading}</div>
        <div className="mb-1 text-xs text-muted-foreground">{section.prompt}</div>
        {section.subsections && section.subsections.length > 0 && (
          <div className="ml-2">
            {renderSections(section.subsections, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const aiAnalysis = getAiAnalysisDisplay(settings);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Card className="flex h-full min-h-0 flex-col">
        <CardContent className="flex h-full min-h-0 flex-col p-4">
          <ScrollArea className="h-full min-h-0 flex-1">
            <div className="space-y-4">
              <h3 className="mb-2 text-lg font-semibold">{template.name}</h3>

              <div>
                <h4 className="mb-1 text-xs font-medium">Description</h4>
                <div className="text-sm text-muted-foreground">
                  {template.description?.replace(/\\n/g, '\n').split('\n').map((line, index) => (
                    <div key={index} className={index > 0 ? 'mt-1' : ''}>
                      {line.trim() || '\u00A0'}
                    </div>
                  ))}
                </div>
              </div>

              {/* Template Settings Preview */}
              <div>
                <button
                  type="button"
                  className="-m-1 flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => setShowSettingsDetails(!showSettingsDetails)}
                >
                  {showSettingsDetails ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  <Settings className="size-4" />
                  <h4 className="text-xs font-medium">Template Settings</h4>
                </button>

                {/* Settings Display */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {/* AI Analysis */}
                  {(() => {
                    if (!aiAnalysis) {
                      return null;
                    }

                    return (
                      <Badge variant="outline" className={aiAnalysis.color}>
                        <Brain className="mr-1 size-3" />
                        {aiAnalysis.label}
                      </Badge>
                    );
                  })()}
                </div>

                {/* Settings Details */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">AI Analysis:</span>
                    <span>{aiAnalysis?.components.join(', ')}</span>
                    <span className="text-gray-400">
                      (
                      {settings.aiAnalysis.level}
                      )
                    </span>
                  </div>
                </div>
              </div>

              {/* Overall Instructions */}
              {template.dsl?.overallInstructions && (
                <div>
                  <h4 className="mb-1 text-xs font-medium">Overall Instructions</h4>
                  <div className="rounded bg-muted p-2 text-sm text-muted-foreground">
                    {template.dsl.overallInstructions}
                  </div>
                </div>
              )}

              {/* Template Structure */}
              <div>
                <h4 className="mb-1 text-xs font-medium">Template Structure</h4>
                <div className="rounded bg-muted p-2">
                  {template.dsl?.sections
                    ? renderSections(template.dsl.sections)
                    : (
                        <div className="text-sm text-muted-foreground">No sections defined</div>
                      )}
                </div>
              </div>

              <div>
                <button
                  className="mt-2 text-xs text-blue-600 underline"
                  onClick={() => setShowFullPrompt(v => !v)}
                >
                  {showFullPrompt ? 'Hide Full Final Prompt' : 'Show Full Final Prompt (Advanced)'}
                </button>
              </div>
              {showFullPrompt && template.dsl && (
                <div>
                  <h4 className="mt-2 text-xs font-medium">System Prompt (as sent to AI)</h4>
                  <pre className="mb-1 whitespace-pre-wrap rounded bg-muted p-1 text-xs">
                    {SYSTEM_PROMPT}
                  </pre>
                  <h4 className="mt-2 text-xs font-medium">Full Final Prompt (as sent to AI)</h4>
                  <pre className="whitespace-pre-wrap rounded bg-muted p-1 text-xs">
                    {compileTemplate(template.dsl, sampleTranscription, sampleQuickNotes, undefined, 'audio').user}
                  </pre>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
