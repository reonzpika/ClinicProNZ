'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';

import { TemplateEditor } from '@/features/templates/components/TemplateEditor';
import { TemplateList } from '@/features/templates/components/TemplateList';
import { TemplatePreview } from '@/features/templates/components/TemplatePreview';
import type { Template } from '@/features/templates/types';
import { createTemplate, deleteTemplate, fetchTemplates, updateTemplate } from '@/features/templates/utils/api';
import { Header } from '@/shared/components/Header';
import { Container } from '@/shared/components/layout/Container';
import { Grid } from '@/shared/components/layout/Grid';
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
          const isDifferent
            = reordered.length === templates.length
              && reordered.some((t: Template, i: number) => t && templates[i] && t.id !== templates[i].id);
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
    // Prevent editing default templates
    if (template && template.type === 'default') {
      return;
    }
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
        prompts: { prompt: '', example: '' },
      };
      setSelectedTemplate(newTemplate);
      setIsEditing(true);
    }
  };

  const handleDelete = async (template: Template) => {
    // Prevent deleting default templates
    if (!template.id || template.type === 'default') {
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
    prompts: { prompt: '', example: '' },
  };

  return (
    <>
      <Header />
      <Container size="lg">
        <Grid cols={3} gap="lg">
          {/* Left Column - Template List */}
          <div className="lg:col-span-1">
            <Stack spacing="sm">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between p-2 pb-0">
                  <h2 className="text-xs font-semibold">Templates</h2>
                  <Button onClick={() => handleEdit()} size="sm" className="h-8 px-2 py-1 text-xs">
                    Create New
                  </Button>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  {error && <div className="mb-2 text-xs text-red-500">{error}</div>}
                  {loading
                    ? (
                        <div className="text-xs">Loading templates...</div>
                      )
                    : (
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
                      )}
                </CardContent>
              </Card>

              {/* How it works section */}
              <Card>
                <CardContent className="p-3">
                  <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-800">
                    <p className="font-medium">How it works:</p>
                    <ul className="ml-3 mt-1 list-disc space-y-0.5">
                      <li>Create templates from scratch using "Create New" or copy existing ones</li>
                      <li>Templates structure your consultation notes with consistent formatting</li>
                      <li>Set a default template (★) to automatically use it for new consultations</li>
                      <li>You can copy the default template and edit the example to customise it to your preferences</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </Stack>
          </div>

          {/* Right Column - Template Editor/Preview */}
          <div className="lg:col-span-2">
            <Stack spacing="sm">
              {selectedTemplate && (
                <Card>
                  <CardHeader className="p-2 pb-0">
                    <h2 className="text-xs font-semibold">
                      {isEditing ? 'Edit Template' : 'Template Preview'}
                    </h2>
                  </CardHeader>
                  <CardContent className="p-2 pt-0">
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
            </Stack>
          </div>
        </Grid>
      </Container>
    </>
  );
}
