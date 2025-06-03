import { Edit3, FileText, MessageSquare } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

import type { Template, TemplateDSL } from '../types';
import { TemplateEditor } from './TemplateEditor';
import { TemplateFromDescription } from './TemplateFromDescription';
import { TemplateFromExample } from './TemplateFromExample';

type CreationMode = 'blank' | 'example' | 'description';

type TemplateCreationWizardProps = {
  onSave: (template: Template) => void;
  onCancel: () => void;
};

export function TemplateCreationWizard({ onSave }: TemplateCreationWizardProps) {
  const [creationMode, setCreationMode] = useState<CreationMode | null>(null);
  const [generatedTemplate, setGeneratedTemplate] = useState<Template | null>(null);

  const handleTemplateGenerated = (generatedDsl: TemplateDSL, title?: string, description?: string) => {
    // Create a new template with the generated DSL and switch to editor
    const newTemplate: Template = {
      id: `new-${Date.now()}`,
      name: title || '',
      type: 'custom',
      description: description || '',
      dsl: generatedDsl,
    };
    setGeneratedTemplate(newTemplate);
    setCreationMode('blank');
  };

  const handleStartFromScratch = () => {
    setGeneratedTemplate(null);
    setCreationMode('blank');
  };

  const handleCancelGeneration = () => {
    setGeneratedTemplate(null);
    setCreationMode(null);
  };

  // Show creation mode selector
  if (creationMode === null) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-lg font-semibold">How would you like to create your template?</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Choose the method that works best for you. You can always edit the template manually afterwards.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={handleStartFromScratch}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="size-5 text-blue-600" />
                <CardTitle className="text-base">Start from Scratch</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build your template step-by-step using our guided editor with sections and subsections.
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => setCreationMode('example')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-green-600" />
                <CardTitle className="text-base">From Example Notes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Paste existing consultation notes and let AI extract the structure to create a template.
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => setCreationMode('description')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-5 text-purple-600" />
                <CardTitle className="text-base">Describe Your Needs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Tell us what kind of template you need and AI will generate the structure for you.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show AI creation methods
  if (creationMode === 'example') {
    return (
      <TemplateFromExample
        onTemplateGenerated={handleTemplateGenerated}
        onCancel={handleCancelGeneration}
      />
    );
  }

  if (creationMode === 'description') {
    return (
      <TemplateFromDescription
        onTemplateGenerated={handleTemplateGenerated}
        onCancel={handleCancelGeneration}
      />
    );
  }

  // Show template editor for "Start from Scratch"
  if (creationMode === 'blank') {
    const templateToEdit = generatedTemplate || {
      id: `new-${Date.now()}`,
      name: '',
      type: 'custom' as const,
      description: '',
      dsl: { sections: [] },
    };

    const handleEditorCancel = () => {
      // Go back to creation mode selector
      setGeneratedTemplate(null);
      setCreationMode(null);
    };

    return (
      <TemplateEditor
        template={templateToEdit}
        onSave={onSave}
        onCancel={handleEditorCancel}
      />
    );
  }

  return null;
}
