'use client';

/* eslint-disable style/multiline-ternary */
import { useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useRef, useState } from 'react';

import { TemplateEditor } from '@/src/features/templates/components/TemplateEditor';
import { TemplateList } from '@/src/features/templates/components/TemplateList';
import { TemplatePerformanceMonitor } from '@/src/features/templates/components/TemplatePerformanceMonitor';
import { TemplatePreview } from '@/src/features/templates/components/TemplatePreview';
import type { Template } from '@/src/features/templates/types';
import { createTemplate, deleteTemplate, fetchTemplates, updateTemplate } from '@/src/features/templates/utils/api';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Container } from '@/src/shared/components/layout/Container';
import { Button } from '@/src/shared/components/ui/button';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { useRBAC } from '@/src/shared/hooks/useRBAC';
import { useResponsive } from '@/src/shared/hooks/useResponsive';
import { createAuthHeaders } from '@/src/shared/utils';
import { useUserSettingsStore } from '@/src/stores/userSettingsStore';

export const dynamic = 'force-dynamic';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setUserDefaultTemplateId, userDefaultTemplateId } = useConsultationStores();
  const { settings, updateSettings } = useUserSettingsStore();
  const { isSignedIn, isLoaded, userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const { hasFeatureAccess } = useRBAC();
  const { isMobile: _isMobile, isTablet: _isTablet, isLargeDesktop } = useResponsive();
  const hasReorderedRef = useRef(false);

  // Check if user has template management access
  const hasTemplateAccess = hasFeatureAccess('templateManagement');

  // Stable blank template for creating new templates (used instead of wizard)
  const newBlankTemplate = useMemo<Template>(() => ({
    id: `new-${Date.now()}`,
    name: '',
    type: 'custom',
    description: '',
    templateBody: '',
  }), []);

  useEffect(() => {
    // Avoid treating "not loaded yet" as "signed out" (prevents false logout flashes).
    if (!isLoaded) {
      setLoading(true);
      return;
    }
    if (!isSignedIn) {
      setTemplates([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchTemplates(userId, userTier)
      .then((data) => {
        setTemplates(data);
        setLoading(false);
        // Don't automatically select the first template - let user choose
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [isLoaded, isSignedIn, userId, userTier]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || loading || templates.length === 0 || hasReorderedRef.current || !userId) {
      return;
    }
    fetch('/api/user/settings', {
      headers: createAuthHeaders(userId, userTier),
    })
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
  }, [isLoaded, isSignedIn, loading, templates, userId, userTier]);

  const handleReorder = (from: number, to: number) => {
    setTemplates((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      if (moved === undefined) {
        return prev;
      } // Guard: do nothing if invalid
      arr.splice(to, 0, moved);
      if (isSignedIn && userId) {
        fetch('/api/user/settings', {
          method: 'POST',
          headers: createAuthHeaders(userId, userTier),
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
      await deleteTemplate(template.id, userId, userTier);
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
      const newTemplate = await createTemplate(copy, userId, userTier);
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
        await updateTemplate(selectedTemplate.id, template, userId, userTier);
        setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? { ...template, id: selectedTemplate.id } : t));
      } else {
        // Creating new template
        const newTemplate = await createTemplate(template, userId, userTier);
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

  const handleSetDefault = async (templateId: string) => {
    // Update both localStorage (for backward compatibility) and database
    setUserDefaultTemplateId(templateId);
    // Persist to database via user settings
    await updateSettings({ favouriteTemplateId: templateId }, userId, userTier);
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
          {isLoaded && !isSignedIn && (
            <div className="p-4">
              <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-600">
                Sign in to create and manage templates
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
                  <TemplateEditor
                    template={newBlankTemplate}
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
                              {Array.from({ length: 3 }, (_, index) => (
                                <div key={`skeleton-loading-${index}`} className="h-12 animate-pulse rounded bg-slate-100" />
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
                            userDefaultTemplateId={settings?.favouriteTemplateId || userDefaultTemplateId}
                            onSetDefault={handleSetDefault}
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
                            {Array.from({ length: 3 }, (_, index) => (
                              <div key={`mobile-skeleton-loading-${index}`} className="h-12 animate-pulse rounded bg-slate-100" />
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
                            userDefaultTemplateId={settings?.favouriteTemplateId || userDefaultTemplateId}
                            onSetDefault={handleSetDefault}
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
