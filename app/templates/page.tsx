/* eslint-disable style/multiline-ternary */
'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';

import { TemplateCreationWizard } from '@/features/templates/components/TemplateCreationWizard';
import { TemplateEditor } from '@/features/templates/components/TemplateEditor';
import { TemplateList } from '@/features/templates/components/TemplateList';
import { TemplatePerformanceMonitor } from '@/features/templates/components/TemplatePerformanceMonitor';
import { TemplatePreview } from '@/features/templates/components/TemplatePreview';
import type { Template } from '@/features/templates/types';
import { createTemplate, deleteTemplate, fetchTemplates, updateTemplate } from '@/features/templates/utils/api';
import { Container } from '@/shared/components/layout/Container';
import { Button } from '@/shared/components/ui/button';
import { useConsultation } from '@/shared/ConsultationContext';
import { useRBAC } from '@/shared/hooks/useRBAC';
import { useResponsive } from '@/shared/hooks/useResponsive';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setUserDefaultTemplateId, userDefaultTemplateId } = useConsultation();
  const { isSignedIn } = useAuth();
  const { hasFeatureAccess } = useRBAC();
  const { isMobile: _isMobile, isTablet: _isTablet, isLargeDesktop } = useResponsive();
  const hasReorderedRef = useRef(false);

  // Check if user has template management access
  const hasTemplateAccess = hasFeatureAccess('templateManagement');

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

  const handleSaveTemplate = async (template: Omit<Template, 'id'>) => {
    try {
      if (selectedTemplate && selectedTemplate.id && !selectedTemplate.id.startsWith('new-')) {
        // Editing existing template
        await updateTemplate(selectedTemplate.id, template);
        setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? { ...template, id: selectedTemplate.id } : t));
      } else {
        // Creating new template
        const newTemplate = await createTemplate(template);
        setTemplates(prev => [...prev, newTemplate]);
        setSelectedTemplate(newTemplate);
      }
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (selectedTemplate && selectedTemplate.id?.startsWith('new-')) {
      setSelectedTemplate(null);
    }
  };

  const renderEmptyState = () => (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="text-slate-500">
          <svg className="mx-auto mb-4 size-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-slate-700">No Template Selected</h3>
          <p className="text-sm text-slate-500">Select a template from the list to preview it</p>
        </div>
        {isSignedIn && hasTemplateAccess && (
          <Button onClick={() => setIsEditing(true)} className="bg-slate-600 hover:bg-slate-700">
            Create Your First Template
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-white">
      {/* Performance Monitor - only in development */}
      <TemplatePerformanceMonitor />

      <Container size="fluid" className="h-full">
        <div className="flex h-full flex-col">
          {(!isSignedIn || !hasTemplateAccess) && (
            <div className="p-4">
              <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-600">
                {!isSignedIn 
                  ? "Sign in to create and manage custom templates"
                  : "Upgrade to Standard to create and manage custom templates"
                }
              </p>
            </div>
          )}

          {/* Main Content Area */}
          <div className="min-h-0 flex-1">
            {isEditing && hasTemplateAccess ? (
              // Full-width editing mode
              <div className="h-full">
                {selectedTemplate && selectedTemplate.id && !selectedTemplate.id.startsWith('new-') ? (
                  <TemplateEditor
                    template={selectedTemplate}
                    onSave={handleSaveTemplate}
                    onCancel={handleCancel}
                  />
                ) : (
                  <TemplateCreationWizard
                    onSave={handleSaveTemplate}
                    onCancel={handleCancel}
                  />
                )}
              </div>
            ) : (
              // Dual-column or single-column layout based on screen size
              <>
                {isLargeDesktop ? (
                  <div className="flex h-full gap-6 p-4">
                    {/* Left Column - Template Navigator (30-35%) */}
                    <div className="h-full w-1/3">
                      <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white">
                        <div className="shrink-0 border-b border-slate-200 p-4">
                          <h2 className="text-lg font-medium text-slate-900">Your Templates</h2>
                          <p className="mt-1 text-sm text-slate-600">
                            {templates.length}
                            {' '}
                            template
                            {templates.length !== 1 ? 's' : ''}
                            {' '}
                            available
                          </p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                          {loading ? (
                            <div className="space-y-2">
                              {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 animate-pulse rounded bg-slate-100" />
                              ))}
                            </div>
                          ) : error ? (
                            <div className="py-8 text-center text-red-600">
                              <p className="text-sm">
                                Error:
                                {error}
                              </p>
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
                              onCreateNew={() => {
                                setSelectedTemplate(null);
                                setIsEditing(true);
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vertical Divider */}
                    <div className="w-px bg-slate-200" />

                    {/* Right Column - Template Preview/Details (65-70%) */}
                    <div className="h-full flex-1">
                      <div className="h-full rounded-lg border border-slate-200 bg-white">
                        {selectedTemplate ? (
                          <TemplatePreview
                            template={selectedTemplate}
                            onEdit={(template) => {
                              setSelectedTemplate(template);
                              setIsEditing(true);
                            }}
                          />
                        ) : (
                          renderEmptyState()
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Mobile/Tablet single-column layout
                  <div className="flex h-full flex-col gap-4 p-4">
                    {/* Template List Section */}
                    <div className="shrink-0 rounded-lg border border-slate-200 bg-white">
                      <div className="border-b border-slate-200 p-4">
                        <h2 className="text-lg font-medium text-slate-900">Your Templates</h2>
                        <p className="mt-1 text-sm text-slate-600">
                          {templates.length}
                          {' '}
                          template
                          {templates.length !== 1 ? 's' : ''}
                          {' '}
                          available
                        </p>
                      </div>
                      <div className="max-h-60 overflow-y-auto p-4">
                        {loading ? (
                          <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="h-12 animate-pulse rounded bg-slate-100" />
                            ))}
                          </div>
                        ) : error ? (
                          <div className="py-8 text-center text-red-600">
                            <p className="text-sm">
                              Error:
                              {error}
                            </p>
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
                            onCreateNew={() => {
                              setSelectedTemplate(null);
                              setIsEditing(true);
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Template Preview Section */}
                    <div className="min-h-0 flex-1 rounded-lg border border-slate-200 bg-white">
                      {selectedTemplate ? (
                        <TemplatePreview
                          template={selectedTemplate}
                          onEdit={(template) => {
                            setSelectedTemplate(template);
                            setIsEditing(true);
                          }}
                        />
                      ) : (
                        renderEmptyState()
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
