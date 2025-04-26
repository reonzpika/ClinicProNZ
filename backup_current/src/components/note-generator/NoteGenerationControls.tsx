'use client';

import { AlertCircle, ChevronRight } from 'lucide-react';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { AIProcessingStatus } from '@/components/note-generator/AIProcessingStatus';
import { AnalysisOptions } from '@/components/note-generator/AnalysisOptions';
import { FormattedNote } from '@/components/note-generator/FormattedNote';
import { TemplateBrowser } from '@/components/template-management/TemplateBrowser';
import type { TemplateConfig } from '@/components/template-management/TemplateConfigPanel';
import { TemplateConfigPanel } from '@/components/template-management/TemplateConfigPanel';
import { TemplatePreview } from '@/components/template-preview/TemplatePreview';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAIProcessing } from '@/hooks/useAIProcessing';
import { useTemplateNoteSync } from '@/hooks/useTemplateNoteSync';
import type { Template } from '@/types/templates';
import { cn } from '@/utils/ui';

type NoteGenerationControlsProps = {
  className?: string;
  onGenerate?: (config: NoteGenerationConfig) => void;
};

type NoteGenerationConfig = {
  templateId: number;
  variables: Record<string, any>;
  sections: {
    id: number;
    visible: boolean;
    order: number;
  }[];
  analysisLevel: string;
  conciseLevel: string;
};

export const NoteGenerationControls: FC<NoteGenerationControlsProps> = ({
  className,
  onGenerate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(null);
  const [analysisLevel, setAnalysisLevel] = useState('basic');
  const [conciseLevel, setConciseLevel] = useState('standard');
  const [generatedNote, setGeneratedNote] = useState<any>(null);
  const { toast } = useToast();

  // Initialize template-note synchronization
  const syncState = useTemplateNoteSync(
    selectedTemplate && templateConfig
      ? {
          template: selectedTemplate,
          variables: templateConfig.variables,
          sections: templateConfig.sections,
        }
      : undefined,
  );

  // Initialize AI processing
  const {
    processing,
    startProcessing,
    cancel,
    retry,
    canRetry,
  } = useAIProcessing({
    onSuccess: (result) => {
      setGeneratedNote(result);
      onGenerate?.({
        templateId: selectedTemplate!.id,
        variables: templateConfig!.variables,
        sections: templateConfig!.sections,
        analysisLevel,
        conciseLevel,
      });
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Reset generated note when template or config changes
  useEffect(() => {
    setGeneratedNote(null);
  }, [selectedTemplate, templateConfig]);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setTemplateConfig(null); // Reset config when template changes
  };

  const handleConfigChange = (config: TemplateConfig) => {
    setTemplateConfig(config);
  };

  const handleGenerate = () => {
    if (!selectedTemplate || !templateConfig) {
      return;
    }

    // Check if template is valid before generating
    if (!syncState.isValid) {
      toast({
        title: 'Cannot Generate Note',
        description: 'Please fix the validation errors before generating the note.',
        variant: 'destructive',
      });
      return;
    }

    startProcessing();
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Step 1: Template Selection */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">1. Select Template</h2>
        <TemplateBrowser
          onTemplateSelect={handleTemplateSelect}
        />
      </Card>

      {selectedTemplate && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {/* Step 2: Template Configuration */}
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-semibold">2. Configure Template</h2>
              <TemplateConfigPanel
                template={selectedTemplate}
                variables={selectedTemplate.variables}
                onConfigChange={handleConfigChange}
                fieldValidation={syncState.getFieldValidation}
              />

              {/* Validation Errors */}
              {syncState.errors.length > 0 && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>
                    <ul className="list-inside list-disc">
                      {syncState.errors.map((error, index) => (
                        <li key={index}>{error.message}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </Card>

            {/* Step 3: Analysis Options */}
            {templateConfig && (
              <Card className="p-6">
                <h2 className="mb-4 text-xl font-semibold">3. Analysis Options</h2>
                <AnalysisOptions
                  analysisLevel={analysisLevel}
                  conciseLevel={conciseLevel}
                  onAnalysisLevelChange={setAnalysisLevel}
                  onConciseLevelChange={setConciseLevel}
                />
              </Card>
            )}

            {/* Processing Status */}
            {processing.status !== 'idle' && (
              <Card className="p-6">
                <h2 className="mb-4 text-xl font-semibold">Generation Status</h2>
                <AIProcessingStatus
                  status={processing.status}
                  progress={processing.progress}
                  currentStep={processing.currentStep}
                  error={processing.error}
                  onCancel={cancel}
                  onRetry={retry}
                  canRetry={canRetry}
                />
              </Card>
            )}
          </div>

          {/* Preview or Generated Note */}
          <div className="lg:sticky lg:top-6">
            {generatedNote
              ? (
                  <FormattedNote
                    title={generatedNote.title}
                    metadata={{
                      generatedAt: new Date(),
                      templateName: selectedTemplate.name,
                      analysisLevel,
                      conciseLevel,
                    }}
                    sections={generatedNote.sections}
                  />
                )
              : (
                  <Card className="p-6">
                    <h2 className="mb-4 text-xl font-semibold">Preview</h2>
                    <TemplatePreview
                      template={selectedTemplate}
                      variables={templateConfig?.variables ?? {}}
                      sectionConfig={templateConfig?.sections}
                    />
                  </Card>
                )}
          </div>
        </div>
      )}

      {/* Generate Button */}
      {selectedTemplate && templateConfig && !generatedNote && (
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!syncState.isValid || processing.status === 'processing'}
          >
            {processing.status === 'processing'
              ? (
                  <>Generating...</>
                )
              : (
                  <>
                    Generate Note
                    <ChevronRight className="ml-2 size-4" />
                  </>
                )}
          </Button>
        </div>
      )}
    </div>
  );
};
