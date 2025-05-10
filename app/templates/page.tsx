'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState, useRef } from 'react';

import { TemplateEditor } from '@/features/templates/components/TemplateEditor';
import { TemplateList } from '@/features/templates/components/TemplateList';
import { TemplatePreview } from '@/features/templates/components/TemplatePreview';
import type { Template } from '@/features/templates/types';
import { createTemplate, deleteTemplate, fetchTemplates, updateTemplate } from '@/features/templates/utils/api';
import { Header } from '@/shared/components/Header';
import { Container } from '@/shared/components/layout/Container';
import { Grid } from '@/shared/components/layout/Grid';
import { Section } from '@/shared/components/layout/Section';
import { Stack } from '@/shared/components/layout/Stack';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setUserDefaultTemplateId, userDefaultTemplateId } = useConsultation();
  const { isSignedIn } = useAuth();
  const hasReorderedRef = useRef(false);

  useEffect(() => {
    setLoading(true);
    fetchTemplates()
      .then((data) => {
        setTemplates(data);
        setLoading(false);
        if (data.length > 0 && !selectedTemplate) {
          setSelectedTemplate(data[0] || null);
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isSignedIn || loading || templates.length === 0 || hasReorderedRef.current) {
      return;
    }
    fetch('/api/user/settings')
      .then((res) => {
        if (!res.ok) {
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) {
          return;
        }
        if (data.settings && Array.isArray(data.settings.templateOrder)) {
          const order = data.settings.templateOrder;
          const idToTemplate = Object.fromEntries(templates.map(t => [t.id, t]));
          const reordered = order.map((id: string | number) => idToTemplate[id]).filter(Boolean);
          // Only setTemplates if the order is actually different
          const isDifferent = reordered.length === templates.length && reordered.some((t, i) => t.id !== templates[i].id);
          if (isDifferent) {
            setTemplates(reordered);
          }
        }
        hasReorderedRef.current = true;
      });
    // Only run when templates are loaded and not yet reordered
  }, [isSignedIn, loading, templates.length]);

  const handleReorder = (from: number, to: number) => {
    setTemplates((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      if (moved === undefined) {
        return prev;
      } // Guard: do nothing if invalid
      arr.splice(to, 0, moved);
      if (isSignedIn) {
        fetch('/api/user/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: { templateOrder: arr.map(t => t.id) } }),
        });
      }
      return arr;
    });
  };

  const handleTemplateSelect = (template: Template) => {
    if (template) {
      setSelectedTemplate(template);
      setIsEditing(false);
    }
  };

  const handleTemplateSave = async (template: Template) => {
    setError(null);
    try {
      let saved: Template;
      if (!template.id || template.id.startsWith('new-')) {
        // Remove id for creation
        const { id, ...rest } = template;
        saved = await createTemplate(rest as Omit<Template, 'id'>);
        setTemplates(prev => [...prev, saved]);
      } else {
        saved = await updateTemplate(template.id, template);
        setTemplates(prev => prev.map(t => (t.id === saved.id ? saved : t)));
      }
      setSelectedTemplate(saved);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save template');
    }
  };

  const handleEdit = (template?: Template) => {
    if (template) {
      setSelectedTemplate(template);
      setIsEditing(true);
    } else {
      // Create new template
      const newTemplate: Template = {
        id: `new-${Date.now()}`,
        name: 'New Template',
        type: 'custom',
        description: 'A new custom template.',
        sections: [],
        prompts: { structure: '' },
      };
      setSelectedTemplate(newTemplate);
      setIsEditing(true);
    }
  };

  const handleDelete = async (template: Template) => {
    if (!template.id) {
      return;
    }
    try {
      await deleteTemplate(template.id);
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete template');
    }
  };

  const handleCopy = async (template: Template) => {
    const copy = {
      name: `Copy of ${template.name}`,
      type: 'custom' as const,
      description: template.description,
      sections: JSON.parse(JSON.stringify(template.sections)),
      prompts: { ...template.prompts },
    };
    try {
      const newTemplate = await createTemplate(copy);
      setTemplates(prev => [...prev, newTemplate]);
      setSelectedTemplate(newTemplate);
      setIsEditing(true);
    } catch (err: any) {
      setError(err.message || 'Failed to copy template');
    }
  };

  // Always pass a valid Template to TemplateList
  const selectedOrDefault: Template = selectedTemplate || templates[0] || {
    id: 'fallback',
    name: 'Fallback Template',
    type: 'default',
    description: 'Fallback template.',
    sections: [],
    prompts: { structure: '' },
  };

  return (
    <>
      <Header />
      <Container size="lg">
        <Stack spacing="lg">
          <Section>
            <h1 className="text-2xl font-bold">Template Management</h1>
            <p className="text-muted-foreground">
              Create and manage your consultation templates
            </p>
          </Section>
          {error && <div className="text-red-500">{error}</div>}
          {loading
            ? <div>Loading templates...</div>
            : (
                <Grid cols={2} gap="lg">
                  {/* Left Column - Template List */}
                  <div>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold">Templates</h2>
                          <Button onClick={() => handleEdit()} size="sm">
                            Create New
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <TemplateList
                          templates={templates}
                          selectedTemplate={selectedOrDefault}
                          onTemplateSelect={handleTemplateSelect}
                          onTemplateHover={() => {}}
                          isSignedIn
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onCopy={handleCopy}
                          onSetDefault={setUserDefaultTemplateId}
                          userDefaultTemplateId={userDefaultTemplateId}
                          onReorder={handleReorder}
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
                          {isEditing
                            ? (
                                <TemplateEditor
                                  template={selectedTemplate}
                                  onSave={handleTemplateSave}
                                  onCancel={() => setIsEditing(false)}
                                />
                              )
                            : (
                                <TemplatePreview template={selectedTemplate} />
                              )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </Grid>
              )}
        </Stack>
      </Container>
    </>
  );
}
