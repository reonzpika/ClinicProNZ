'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';

import { TemplateCreationWizard } from '@/features/templates/components/TemplateCreationWizard';
import { TemplateEditor } from '@/features/templates/components/TemplateEditor';
import { TemplateList } from '@/features/templates/components/TemplateList';
import { TemplatePreview } from '@/features/templates/components/TemplatePreview';
import { TemplatePerformanceMonitor } from '@/features/templates/components/TemplatePerformanceMonitor';
import type { Template } from '@/features/templates/types';
import { createTemplate, deleteTemplate, fetchTemplates, updateTemplate } from '@/features/templates/utils/api';
import { Container } from '@/shared/components/layout/Container';
import { Grid } from '@/shared/components/layout/Grid';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { useConsultation } from '@/shared/ConsultationContext';
import { Button } from '@/shared/components/ui/button';

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
        // Don't automatically select the first template - let user choose
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
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

  // Remove unused functions - functionality moved to inline handlers

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
      templateBody: template.templateBody,
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

  // handleCancel function removed - functionality moved inline

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Performance Monitor - only in development */}
      <TemplatePerformanceMonitor />
      
      <Container className="py-8">
        <div className="space-y-6">
          {/* Template Management */}
          {isEditing ? (
            // Check if we're editing an existing template or creating a new one
            selectedTemplate && selectedTemplate.id && !selectedTemplate.id.startsWith('new-') ? (
              // Editing existing template - go directly to TemplateEditor
              <TemplateEditor
                template={selectedTemplate}
                onSave={async (template) => {
                  try {
                    await updateTemplate(selectedTemplate.id!, template);
                    setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? template : t));
                    setIsEditing(false);
                    setSelectedTemplate(null);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to save template');
                  }
                }}
                onCancel={() => {
                  setIsEditing(false);
                  setSelectedTemplate(null);
                }}
              />
            ) : (
              // Creating new template - use TemplateCreationWizard
              <TemplateCreationWizard
                onSave={async (template) => {
                  try {
                    const newTemplate = await createTemplate(template);
                    setTemplates(prev => [...prev, newTemplate]);
                    setIsEditing(false);
                    setSelectedTemplate(null);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to save template');
                  }
                }}
                onCancel={() => {
                  setIsEditing(false);
                  setSelectedTemplate(null);
                }}
              />
            )
          ) : (
            <Grid cols={12} className="gap-6">
              {/* Template List */}
              <div className="col-span-12 lg:col-span-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-lg font-semibold">Your Templates</h2>
                    {!isSignedIn && (
                      <p className="text-xs text-muted-foreground">Sign in to create custom templates</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                        ))}
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-red-600">
                        <p>Error: {error}</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                          Retry
                        </Button>
                      </div>
                    ) : (
                      <TemplateList
                        templates={templates}
                        selectedTemplate={selectedTemplate}
                        onTemplateSelect={setSelectedTemplate}
                        onTemplateHover={() => {}}
                        isSignedIn={!!isSignedIn}
                        onEdit={(template) => {
                          setSelectedTemplate(template);
                          setIsEditing(true);
                        }}
                        onDelete={handleDelete}
                        onCopy={handleCopy}
                        userDefaultTemplateId={userDefaultTemplateId}
                        onSetDefault={setUserDefaultTemplateId}
                        onReorder={handleReorder}
                        onCreateNew={() => setIsEditing(true)}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Template Preview/Details */}
              <div className="col-span-12 lg:col-span-8">
                {selectedTemplate ? (
                  <TemplatePreview template={selectedTemplate} />
                ) : (
                  <Card className="h-full">
                    <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                      <div className="text-center space-y-4">
                        <div className="text-muted-foreground">
                          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h3 className="text-lg font-medium">No Template Selected</h3>
                          <p className="text-sm">Select a template from the list to preview it</p>
                        </div>
                        {isSignedIn && (
                          <Button onClick={() => setIsEditing(true)}>
                            Create Your First Template
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </Grid>
          )}
        </div>
      </Container>
    </div>
  );
}
