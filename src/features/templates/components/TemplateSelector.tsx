'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { FeatureFeedbackButton } from '@/src/shared/components/FeatureFeedbackButton';
import { Button } from '@/src/shared/components/ui/button';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeaders } from '@/src/shared/utils';

import type { Template } from '../types';
import { fetchTemplates } from '../utils/api';
import { TemplateSelectorModal } from './TemplateSelectorModal';

export function TemplateSelector() {
  const { isSignedIn, userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const { templateId, setTemplateId, userDefaultTemplateId } = useConsultationStores();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [_, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates on component mount
  useEffect(() => {
    async function loadTemplates() {
      try {
        setIsLoading(true);
        // Require sign-in before fetching templates
        if (!isSignedIn || !userId) {
          setTemplates([]);
          return;
        }
        // Use centralized fetchTemplates function with auth headers
        const allTemplates = await fetchTemplates(userId, userTier);

        // Add template type labels
        const templatesWithTypes = allTemplates.map((t: Template) => ({
          ...t,
          _templateType: t.type === 'default' ? 'Default' : 'Custom',
        }));

        // Fetch user template order and reorder if available
        if (isSignedIn && userId) {
          const settingsRes = await fetch('/api/user/settings', {
            headers: createAuthHeaders(userId, userTier),
          });
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json();
            if (settingsData.settings && Array.isArray(settingsData.settings.templateOrder)) {
              const order = settingsData.settings.templateOrder;
              const idToTemplate = Object.fromEntries(templatesWithTypes.map((t: Template) => [t.id, t]));
              const reorderedTemplates = order.map((id: string) => idToTemplate[id]).filter(Boolean);
              // Add any templates not in the order (e.g., new ones)
              const orderedIds = new Set(order);
              const finalTemplates = [
                ...reorderedTemplates,
                ...Object.values(idToTemplate).filter((t: Template) => !orderedIds.has(t.id)),
              ];
              setTemplates(finalTemplates);
              return;
            }
          }
        }

        setTemplates(templatesWithTypes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      } finally {
        setIsLoading(false);
      }
    }
    loadTemplates();
  }, [isSignedIn, userId, userTier]);

  // Initial template selection: run once when templates load and no templateId is set or invalid
  useEffect(() => {
    if (templates.length === 0) {
      return;
    }
    const current = templateId ? templates.find(t => t.id === templateId) : undefined;
    if (current) {
      return; // already valid
    }
    const byDefault = userDefaultTemplateId ? templates.find(t => t.id === userDefaultTemplateId) : undefined;
    const firstDefault = templates.find(t => t.type === 'default');
    const fallback = templates[0];
    const next = byDefault || firstDefault || fallback;
    if (next && next.id && next.id !== templateId) {
      setTemplateId(next.id);
    }
  }, [templates, templateId, userDefaultTemplateId, setTemplateId]);

  // Compute selected template for display only (no side effects)
  const selectedTemplate = useMemo(() => {
    if (templates.length === 0) {
      return undefined;
    }
    return templateId ? templates.find(t => t.id === templateId) : undefined;
  }, [templates, templateId]);
  const fallbackTemplate: Template = {
    id: '',
    name: '',
    type: 'default',
    description: '',
    templateBody: '',
  };

  const handleTemplateSelect = (template: Template) => {
    setTemplateId(template.id);
    setIsModalOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="h-8 w-full justify-between px-2 py-1 text-xs"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs">{selectedTemplate ? selectedTemplate.name : 'Select a template'}</span>
        </div>
        <span className="text-xs">▼</span>
      </Button>
      {selectedTemplate && selectedTemplate.id && (
        <FeatureFeedbackButton
          feature="templates"
          context={`Template: ${selectedTemplate.name} (${selectedTemplate.id}), Type: ${selectedTemplate.type}`}
          variant="minimal"
        />
      )}

      <TemplateSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedTemplate={selectedTemplate || fallbackTemplate}
        onTemplateSelect={handleTemplateSelect}
        templates={templates}
        userDefaultTemplateId={userDefaultTemplateId}
      />

      {error && (
        <p className="mt-1 text-xs text-red-600">
          Error:
          {' '}
          {error}
        </p>
      )}
    </div>
  );
}
