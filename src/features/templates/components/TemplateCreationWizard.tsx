import { BookOpen, Edit3, FileText, MessageSquare, Sparkles, Wand2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

import type { Template } from '../types';
import { TemplateEditor } from './TemplateEditor';
import { TemplateFromDescription } from './TemplateFromDescription';
import { TemplateFromExample } from './TemplateFromExample';
import { TemplateGuidedEditor } from './TemplateGuidedEditor';

type CreationMode = 'blank' | 'from-description' | 'from-example' | 'from-starter' | 'guided';

type TemplateCreationWizardProps = {
  onSave: (template: Template) => void;
  onCancel?: () => void;
};

// Starter templates for common use cases
const STARTER_TEMPLATES = [
  {
    name: 'Basic Consultation Note',
    description: 'Simple structure for general consultations',
    templateBody: `(This template is for general practice consultations. Only include information explicitly mentioned in the consultation data.)

CONSULTATION DETAILS:
- [Date and type of consultation] (only include if mentioned)
- [Reason for visit] (only include if mentioned)

HISTORY:
- [Presenting complaint] (only include if mentioned)
- [History of presenting complaint] (only include if mentioned)
- [Past medical history] (only include if mentioned)
- [Current medications] (only include if mentioned)

EXAMINATION:
- [Physical examination findings] (only include if mentioned)

ASSESSMENT:
- [Clinical impression] (only include if mentioned)

PLAN:
- [Treatment plan] (only include if mentioned)
- [Follow-up arrangements] (only include if mentioned)

(Do not generate any information not explicitly mentioned in the consultation data.)`,
  },
  {
    name: 'Mental Health Assessment',
    description: 'Template for mental health consultations',
    templateBody: `(This template is for mental health assessments. Only include information explicitly mentioned in the consultation.)

PRESENTING CONCERNS:
- [Patient's main concerns] (only include if mentioned)
- [Duration and onset] (only include if mentioned)

MENTAL STATE EXAMINATION:
- [Appearance and behavior] (only include if mentioned)
- [Mood and affect] (only include if mentioned)
- [Thought content and process] (only include if mentioned)
- [Risk assessment] (only include if mentioned)

ASSESSMENT:
- [Clinical formulation] (only include if mentioned)

PLAN:
- [Therapeutic interventions] (only include if mentioned)
- [Safety planning] (only include if mentioned)
- [Follow-up] (only include if mentioned)

(Only use information explicitly provided in the consultation data.)`,
  },
  {
    name: 'Pediatric Consultation',
    description: 'Template for pediatric consultations',
    templateBody: `(This template is for pediatric consultations. Only include information explicitly mentioned.)

PATIENT DETAILS:
- [Child's name and age] (only include if mentioned)
- [Accompanied by] (only include if mentioned)

PRESENTING COMPLAINT:
- [Chief complaint as reported] (only include if mentioned)
- [Duration and characteristics] (only include if mentioned)

HISTORY:
- [History from parent/caregiver] (only include if mentioned)
- [Birth and developmental history] (only include if mentioned)
- [Immunization status] (only include if mentioned)

EXAMINATION:
- [Growth parameters] (only include if mentioned)
- [Physical examination findings] (only include if mentioned)

ASSESSMENT AND PLAN:
- [Clinical assessment] (only include if mentioned)
- [Treatment recommendations] (only include if mentioned)
- [Parent education provided] (only include if mentioned)

(Use only information explicitly mentioned in the consultation data.)`,
  },
];

export function TemplateCreationWizard({ onSave, onCancel }: TemplateCreationWizardProps) {
  const [creationMode, setCreationMode] = useState<CreationMode | null>(null);
  const [generatedTemplate, setGeneratedTemplate] = useState<Template | null>(null);

  const handleTemplateGenerated = (templateBody: string, title?: string, description?: string) => {
    // Create a new template with the generated templateBody and switch to editor
    const newTemplate: Template = {
      id: `new-${Date.now()}`,
      name: title || '',
      type: 'custom',
      description: description || '',
      templateBody,
    };
    setGeneratedTemplate(newTemplate);
    setCreationMode('blank');
  };

  const handleStartFromScratch = () => {
    setGeneratedTemplate(null);
    setCreationMode('blank');
  };

  const handleStartGuided = () => {
    const newTemplate: Template = {
      id: `new-${Date.now()}`,
      name: '',
      type: 'custom',
      description: '',
      templateBody: '',
    };
    setGeneratedTemplate(newTemplate);
    setCreationMode('guided');
  };

  const handleStarterTemplate = (starter: typeof STARTER_TEMPLATES[0]) => {
    const newTemplate: Template = {
      id: `new-${Date.now()}`,
      name: starter.name,
      type: 'custom',
      description: starter.description,
      templateBody: starter.templateBody,
    };
    setGeneratedTemplate(newTemplate);
    setCreationMode('blank');
  };

  const handleCancelGeneration = () => {
    setGeneratedTemplate(null);
    setCreationMode(null);
  };

  // If we're in guided mode, show the guided editor
  if (creationMode === 'guided') {
    const templateToEdit = generatedTemplate || {
      id: `new-${Date.now()}`,
      name: '',
      type: 'custom' as const,
      description: '',
      templateBody: '',
    };

    return (
      <TemplateGuidedEditor
        template={templateToEdit}
        onSave={onSave}
        onCancel={handleCancelGeneration}
      />
    );
  }

  // If we're in blank mode (manual editing), show the editor
  if (creationMode === 'blank') {
    const templateToEdit = generatedTemplate || {
      id: `new-${Date.now()}`,
      name: '',
      type: 'custom' as const,
      description: '',
      templateBody: '',
    };

    return (
      <TemplateEditor
        template={templateToEdit}
        onSave={onSave}
        onCancel={handleCancelGeneration}
      />
    );
  }

  // If we're in starter template mode, show starter options
  if (creationMode === 'from-starter') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Choose a Starter Template</h2>
            <p className="mt-2 text-muted-foreground">Pick a template to customize for your needs</p>
          </div>
          <Button variant="outline" onClick={() => setCreationMode(null)}>
            Back
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          {STARTER_TEMPLATES.map((starter, index) => (
            <Card key={index} className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => handleStarterTemplate(starter)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{starter.name}</CardTitle>
                  <Badge variant="secondary">Starter</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3">
                  {starter.description}
                </CardDescription>
                <div className="rounded bg-muted p-2 text-xs text-muted-foreground">
                  <pre className="line-clamp-4 whitespace-pre-wrap">
                    {starter.templateBody.substring(0, 200)}
                    ...
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If we're in from-example mode, show the example extraction
  if (creationMode === 'from-example') {
    return (
      <TemplateFromExample
        onTemplateGenerated={handleTemplateGenerated}
        onCancel={handleCancelGeneration}
      />
    );
  }

  // If we're in from-description mode, show the description generation
  if (creationMode === 'from-description') {
    return (
      <TemplateFromDescription
        onTemplateGenerated={handleTemplateGenerated}
        onCancel={handleCancelGeneration}
      />
    );
  }

  // Default: Show creation mode selector
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 text-center">
          <h2 className="text-xl font-semibold">Create New Template</h2>
          <p className="mt-2 text-muted-foreground">Choose how you'd like to create your template</p>
        </div>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Back
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => setCreationMode('from-starter')}>
          <CardHeader className="text-center">
            <Sparkles className="mx-auto size-12 text-indigo-600" />
            <CardTitle className="text-lg">Quick Start</CardTitle>
            <Badge variant="secondary" className="mx-auto">Recommended</Badge>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Start with a proven template structure and customize it for your needs.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={handleStartGuided}>
          <CardHeader className="text-center">
            <Wand2 className="mx-auto size-12 text-emerald-600" />
            <CardTitle className="text-lg">Guided Creator</CardTitle>
            <Badge variant="default" className="mx-auto">New</Badge>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Step-by-step wizard to build your template with guided assistance.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={handleStartFromScratch}>
          <CardHeader className="text-center">
            <Edit3 className="mx-auto size-12 text-blue-600" />
            <CardTitle className="text-lg">From Scratch</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Create a template manually with full control over structure and content.
            </CardDescription>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => setCreationMode('from-example')}
        >
          <CardHeader className="text-center">
            <FileText className="mx-auto size-12 text-green-600" />
            <CardTitle className="text-lg">From Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Upload example consultation notes and let AI extract the structure.
            </CardDescription>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => setCreationMode('from-description')}
        >
          <CardHeader className="text-center">
            <MessageSquare className="mx-auto size-12 text-purple-600" />
            <CardTitle className="text-lg">From Description</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Describe what you need and let AI generate a template structure.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-0.5 size-5 text-blue-600" />
            <div className="space-y-2 text-sm">
              <h3 className="font-medium text-blue-900">Template Creation Tips</h3>
              <ul className="space-y-1 text-blue-800">
                <li>
                  • Use
                  <code className="rounded bg-blue-100 px-1">[placeholder text]</code>
                  {' '}
                  for dynamic content
                </li>
                <li>
                  • Add
                  <code className="rounded bg-blue-100 px-1">(only include if mentioned)</code>
                  {' '}
                  to prevent AI hallucination
                </li>
                <li>• Organize with clear section headers like HISTORY:, EXAMINATION:, PLAN:</li>
                <li>• Try the new Guided Creator for step-by-step assistance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
