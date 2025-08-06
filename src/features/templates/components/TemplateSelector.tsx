'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';

import { FeatureFeedbackButton } from '@/src/shared/components/FeatureFeedbackButton';
import { Button } from '@/src/shared/components/ui/button';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeadersWithGuest } from '@/src/shared/utils';

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
        // Use centralized fetchTemplates function with auth headers
        const allTemplates = await fetchTemplates(userId, userTier, null);

        // Add template type labels
        const templatesWithTypes = allTemplates.map((t: Template) => ({
          ...t,
          _templateType: t.type === 'default' ? 'Default' : 'Custom',
        }));

        // Fetch user template order and reorder if available
        if (isSignedIn && userId) {
          const settingsRes = await fetch('/api/user/settings', {
            headers: createAuthHeadersWithGuest(userId, userTier, null),
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

  // Find the selected template from the templates list
  const selectedTemplate = useMemo(() => templates.find(t => t.id === templateId) || templates[0], [templates, templateId]);
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
