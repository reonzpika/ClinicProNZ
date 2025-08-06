import { useAuth } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { createAuthHeaders } from '@/src/shared/utils';

import type { Template } from '../types';
import { fetchTemplates } from '../utils/api';

export function useSelectedTemplate() {
  const { isSignedIn, userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const { templateId } = useConsultationStores();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      try {
        setIsLoading(true);
        // Use centralized fetchTemplates function with auth headers
        const userTier = getUserTier();
        const allTemplates = await fetchTemplates(userId, userTier, null);

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
  }, [isSignedIn, userId, getUserTier]);

  // Find the selected template from the templates list
  const selectedTemplate = useMemo(() => templates.find(t => t.id === templateId) || templates[0], [templates, templateId]);

  return {
    selectedTemplate,
    templates,
    isLoading,
    error,
  };
}
