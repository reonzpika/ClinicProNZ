'use client';

import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Container } from '@/shared/components/layout/Container';
import { Grid } from '@/shared/components/layout/Grid';
import { Stack } from '@/shared/components/layout/Stack';
import { Section } from '@/shared/components/layout/Section';
import type { Template } from '@/shared/types/templates';

import { TemplateEditor } from '@/features/templates/components/TemplateEditor';
import { TemplateList } from '@/features/templates/components/TemplateList';
import { TemplatePreview } from '@/features/templates/components/TemplatePreview';

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Replace with actual data from API
  const defaultTemplates: Template[] = [
    {
      id: '1',
      name: 'Multi-problem SOAP (Default)',
      type: 'default',
      sessionId: 'default',
      sections: [
        {
          name: 'Subjective',
          type: 'text',
          required: true,
          description: 'Patient-reported symptoms and history',
          prompt: 'Document the patient\'s chief complaint and history of present illness',
        },
        {
          name: 'Objective',
          type: 'text',
          required: true,
          description: 'Clinical findings and observations',
          prompt: 'Record vital signs, physical exam findings, and test results',
        },
        {
          name: 'Assessment',
          type: 'text',
          required: true,
          description: 'Clinical assessment and diagnosis',
          prompt: 'Provide your assessment and differential diagnosis',
        },
        {
          name: 'Plan',
          type: 'text',
          required: true,
          description: 'Treatment plan and follow-up',
          prompt: 'Outline the treatment plan and follow-up recommendations',
        },
      ],
      prompts: {
        system: 'You are a medical assistant helping to document clinical notes.',
        structure: 'Follow the SOAP format for comprehensive documentation.',
      },
    },
  ];

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditing(false);
  };

  const handleTemplateSave = (template: Template) => {
    // TODO: Implement API call to save template
    console.log('Saving template:', template);
    setSelectedTemplate(template);
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: 'New Template',
      type: 'custom',
      sessionId: 'default',
      sections: [],
      prompts: {
        system: '',
        structure: '',
      },
    };
    setSelectedTemplate(newTemplate);
    setIsEditing(true);
  };

  return (
    <Container size="lg">
      <Stack spacing="lg">
        <Section>
          <h1 className="text-2xl font-bold">Template Management</h1>
          <p className="text-muted-foreground">
            Create and manage your consultation templates
          </p>
        </Section>

        <Grid cols={2} gap="lg">
          {/* Left Column - Template List */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Templates</h2>
                  <Button onClick={handleCreateNew} size="sm">
                    Create New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <TemplateList
                  searchQuery={searchQuery}
                  selectedTemplate={selectedTemplate || defaultTemplates[0]}
                  onTemplateSelect={handleTemplateSelect}
                  onTemplateHover={() => {}}
                  isSignedIn={true} // TODO: Replace with actual auth state
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Template Editor/Preview */}
          <div>
            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">
                    {isEditing ? 'Edit Template' : 'Template Preview'}
                  </h2>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <TemplateEditor
                      template={selectedTemplate}
                      onSave={handleTemplateSave}
                      onCancel={() => setIsEditing(false)}
                    />
                  ) : (
                    <TemplatePreview template={selectedTemplate} />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </Grid>
      </Stack>
    </Container>
  );
} 