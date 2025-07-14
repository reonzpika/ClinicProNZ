import { ArrowLeft, BookOpen, Edit3, FileText, MessageSquare, Sparkles, Wand2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';

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
- [Appearance and behaviour] (only include if mentioned)
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
      <div className="h-full bg-white">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Choose a Starter Template</h2>
              <p className="mt-1 text-sm text-slate-600">Pick a template to customise for your needs</p>
            </div>
            <Button variant="outline" onClick={() => setCreationMode(null)} className="h-9">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {STARTER_TEMPLATES.map((starter, index) => (
              <div
                key={index}
                role="button"
                tabIndex={0}
                className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm"
                onClick={() => handleStarterTemplate(starter)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleStarterTemplate(starter);
                  }
                }}
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-lg font-medium text-slate-900 group-hover:text-slate-700">
                    {starter.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">Starter</Badge>
                </div>
                <p className="mb-4 text-sm text-slate-600">
                  {starter.description}
                </p>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <pre className="line-clamp-4 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
                    {starter.templateBody.substring(0, 200)}
                    ...
                  </pre>
                </div>
              </div>
            ))}
          </div>
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
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="text-xl font-semibold text-slate-900">Create New Template</h2>
            <p className="mt-1 text-sm text-slate-600">Choose how you'd like to create your template</p>
          </div>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="h-9">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Creation Options */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div
              role="button"
              tabIndex={0}
              className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 text-center transition-all hover:border-slate-300 hover:shadow-sm"
              onClick={() => setCreationMode('from-starter')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCreationMode('from-starter');
                }
              }}
            >
              <Sparkles className="mx-auto mb-3 size-12 text-indigo-600" />
              <h3 className="mb-2 text-lg font-medium text-slate-900">Quick Start</h3>
              <Badge variant="secondary" className="mb-3">Recommended</Badge>
              <p className="text-sm text-slate-600">
                Start with a proven template structure and customise it for your needs.
              </p>
            </div>

            <div
              role="button"
              tabIndex={0}
              className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 text-center transition-all hover:border-slate-300 hover:shadow-sm"
              onClick={handleStartGuided}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStartGuided();
                }
              }}
            >
              <Wand2 className="mx-auto mb-3 size-12 text-emerald-600" />
              <h3 className="mb-2 text-lg font-medium text-slate-900">Guided Creator</h3>
              <Badge variant="default" className="mb-3">New</Badge>
              <p className="text-sm text-slate-600">
                Step-by-step wizard to build your template with guided assistance.
              </p>
            </div>

            <div
              role="button"
              tabIndex={0}
              className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 text-center transition-all hover:border-slate-300 hover:shadow-sm"
              onClick={handleStartFromScratch}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStartFromScratch();
                }
              }}
            >
              <Edit3 className="mx-auto mb-3 size-12 text-blue-600" />
              <h3 className="mb-2 text-lg font-medium text-slate-900">From Scratch</h3>
              <p className="text-sm text-slate-600">
                Create a template manually with full control over structure and content.
              </p>
            </div>

            <div
              role="button"
              tabIndex={0}
              className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 text-center transition-all hover:border-slate-300 hover:shadow-sm"
              onClick={() => setCreationMode('from-example')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCreationMode('from-example');
                }
              }}
            >
              <FileText className="mx-auto mb-3 size-12 text-green-600" />
              <h3 className="mb-2 text-lg font-medium text-slate-900">From Examples</h3>
              <p className="text-sm text-slate-600">
                Upload example consultation notes and let AI extract the structure.
              </p>
            </div>

            <div
              role="button"
              tabIndex={0}
              className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 text-center transition-all hover:border-slate-300 hover:shadow-sm"
              onClick={() => setCreationMode('from-description')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCreationMode('from-description');
                }
              }}
            >
              <MessageSquare className="mx-auto mb-3 size-12 text-purple-600" />
              <h3 className="mb-2 text-lg font-medium text-slate-900">From Description</h3>
              <p className="text-sm text-slate-600">
                Describe what you need and let AI generate a template structure.
              </p>
            </div>
          </div>

          {/* Help Section */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <div className="flex items-start gap-4">
              <BookOpen className="mt-0.5 size-6 shrink-0 text-blue-600" />
              <div>
                <h3 className="mb-3 font-medium text-blue-900">Template Creation Tips</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-blue-600">•</span>
                    <span>
                      Use
                      {' '}
                      <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs text-blue-900">[placeholder text]</code>
                      {' '}
                      for dynamic content
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-blue-600">•</span>
                    <span>
                      Add
                      {' '}
                      <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs text-blue-900">(only include if mentioned)</code>
                      {' '}
                      to prevent AI hallucination
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-blue-600">•</span>
                    <span>Organise with clear section headers like HISTORY:, EXAMINATION:, PLAN:</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-blue-600">•</span>
                    <span>Try the new Guided Creator for step-by-step assistance</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
