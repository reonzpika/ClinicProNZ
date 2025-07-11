import { useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';

import { useConsultation } from '@/src/shared/ConsultationContext';

import type { Template } from '../types';

export function useSelectedTemplate() {
  const { isSignedIn, userId } = useAuth();
  const { templateId } = useConsultation();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setIsLoading(true);
        // Fetch default templates
        const defaultRes = await fetch('/api/templates?type=default');
        if (!defaultRes.ok) {
          throw new Error('Failed to fetch default templates');
        }
        const defaultData = await defaultRes.json();
        let allTemplates = defaultData.templates || defaultData || [];

        // If signed in, fetch custom templates
        if (isSignedIn && userId) {
          const customRes = await fetch(`/api/templates?type=custom&userId=${userId}`);
          if (!customRes.ok) {
            throw new Error('Failed to fetch custom templates');
          }
          const customData = await customRes.json();
          const customTemplates = customData.templates || customData || [];
          allTemplates = [
            ...allTemplates.map((t: Template) => ({ ...t, _templateType: 'Default' })),
            ...customTemplates.map((t: Template) => ({ ...t, _templateType: 'Custom' })),
          ];

          // Fetch user template order and reorder if available
          const settingsRes = await fetch('/api/user/settings');
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json();
            if (settingsData.settings && Array.isArray(settingsData.settings.templateOrder)) {
              const order = settingsData.settings.templateOrder;
              const idToTemplate = Object.fromEntries(allTemplates.map((t: Template) => [t.id, t]));
              allTemplates = order.map((id: string) => idToTemplate[id]).filter(Boolean);
              // Add any templates not in the order (e.g., new ones)
              const orderedIds = new Set(order);
              allTemplates = [
                ...allTemplates,
                ...Object.values(idToTemplate).filter((t: Template) => !orderedIds.has(t.id)),
              ];
            }
          }
        } else {
          // Only default templates
          allTemplates = allTemplates.map((t: Template) => ({ ...t, _templateType: 'Default' }));
        }
        setTemplates(allTemplates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTemplates();
  }, [isSignedIn, userId]);

  // Find the selected template from the templates list
  const selectedTemplate = useMemo(() => templates.find(t => t.id === templateId) || templates[0], [templates, templateId]);

  return {
    selectedTemplate,
    templates,
    isLoading,
    error,
  };
}
