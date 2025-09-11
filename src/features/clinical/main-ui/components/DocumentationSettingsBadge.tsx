'use client';

import { useAuth } from '@clerk/nextjs';
import { Edit3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { Template } from '@/src/features/templates/types';
import { fetchTemplates } from '@/src/features/templates/utils/api';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent } from '@/src/shared/components/ui/card';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { useResponsive } from '@/src/shared/hooks/useResponsive';
import { createAuthHeaders } from '@/src/shared/utils';
import { MULTIPROBLEM_SOAP_UUID } from '@/src/stores/consultationStore';

import { DocumentationSettingsModal } from './DocumentationSettingsModal';

// Persistence utilities for last-used settings
const getLastUsedSettings = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const stored = localStorage.getItem('lastUsedDocumentationSettings');
  if (!stored) {
    return null;
  }

  const parsed = JSON.parse(stored);
  // Migrate old default template ID to new one
  if (parsed.templateId === 'ef6b3139-69a0-4b4b-bf80-dcdabe0559ba') {
    const migrated = { ...parsed, templateId: MULTIPROBLEM_SOAP_UUID };
    localStorage.setItem('lastUsedDocumentationSettings', JSON.stringify(migrated));
    return migrated;
  }
  return parsed;
};

const saveLastUsedSettings = (templateId: string, inputMode: 'audio') => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('lastUsedDocumentationSettings', JSON.stringify({
    templateId,
    inputMode,
    updatedAt: new Date().toISOString(),
  }));
};

export const DocumentationSettingsBadge: React.FC = () => {
  const { isSignedIn, userId } = useAuth();
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const { templateId, inputMode, setTemplateId, setInputMode } = useConsultationStores();
  const { isLargeDesktop } = useResponsive();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track if this is initial load
  const [favouriteTemplateId, setFavouriteTemplateId] = useState<string | null>(null); // Database favourite

  // Fetch templates on component mount using centralized function
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

        // Fetch user settings including favourite template and template order
        if (isSignedIn && userId) {
          const settingsRes = await fetch('/api/user/settings', {
            headers: createAuthHeaders(userId, userTier),
          });
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json();
            if (settingsData.settings) {
              // Store favourite template from database
              if (settingsData.settings.favouriteTemplateId) {
                setFavouriteTemplateId(settingsData.settings.favouriteTemplateId);
              }

              // Handle template ordering
              if (Array.isArray(settingsData.settings.templateOrder)) {
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
        }

        setTemplates(templatesWithTypes);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTemplates();
  }, [isSignedIn, userId, userTier]);

  // Apply smart defaults on first load ONLY
  useEffect(() => {
    if (templates.length === 0 || !isInitialLoad) {
      return;
    }

    const lastUsed = getLastUsedSettings();
    const userDefault = typeof window !== 'undefined'
      ? localStorage.getItem('userDefaultTemplateId')
      : null;

    // Validate current template exists, migrate if needed
    const currentTemplateExists = templates.some(t => t.id === templateId);
    if (!currentTemplateExists && templates.some(t => t.id === MULTIPROBLEM_SOAP_UUID)) {
      setTemplateId(MULTIPROBLEM_SOAP_UUID);

      // Clean up invalid localStorage entries
      if (userDefault && !templates.some(t => t.id === userDefault)) {
        localStorage.removeItem('userDefaultTemplateId');
      }
      if (lastUsed && !templates.some(t => t.id === lastUsed.templateId)) {
        localStorage.removeItem('lastUsedDocumentationSettings');
      }
    }

    // Apply user preferences if we're on system default - ONLY on initial load
    // Priority: Database favourite → Last used → localStorage default → System default
    const isSystemDefault = templateId === MULTIPROBLEM_SOAP_UUID && inputMode === 'audio';
    if (isSystemDefault) {
      // 1. Database favourite template (highest priority)
      if (favouriteTemplateId && templates.some(t => t.id === favouriteTemplateId)) {
        setTemplateId(favouriteTemplateId);
      } else if (lastUsed?.templateId && templates.some(t => t.id === lastUsed.templateId)) {
        // 2. Last used settings
        setTemplateId(lastUsed.templateId);
        setInputMode('audio');
      } else if (userDefault && templates.some(t => t.id === userDefault)) {
        // 3. localStorage default (deprecated but kept for migration)
        setTemplateId(userDefault);
      }
    }

    // Mark initial load as complete
    setIsInitialLoad(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates, isInitialLoad, favouriteTemplateId]); // Added favouriteTemplateId dependency

  // Save settings when they change
  useEffect(() => {
    if (templateId && inputMode && templates.length > 0) {
      saveLastUsedSettings(templateId, inputMode);
    }
  }, [templateId, inputMode, templates.length]);

  // Find current template name
  const currentTemplate = useMemo(() => {
    return templates.find(t => t.id === templateId);
  }, [templates, templateId]);

  const templateDisplayName = currentTemplate?.name || (isLoading ? 'Loading...' : 'Select Template');
  const inputDisplayName = 'Audio';

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSettingsChange = (newTemplateId: string, _newInputMode: 'audio') => {
    setTemplateId(newTemplateId);
    setInputMode('audio');
  };

  const handleInputModeToggle = () => {
    setInputMode('audio');
  };

  const handleTemplateClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="border-gray-200 bg-gray-50 shadow-sm">
        <CardContent className="p-3">
          <div className={isLargeDesktop ? 'space-y-2' : 'flex items-center justify-between gap-3'}>
            {/* Settings Display */}
            {isLargeDesktop
              ? (
                  <div className="space-y-1 text-sm text-gray-700">
                    {/* Template - Clickable to open modal */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 text-xs font-medium text-gray-500">Template:</span>
                        <button
                          type="button"
                          onClick={handleTemplateClick}
                          className="cursor-pointer truncate text-left font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          title="Click to change template"
                        >
                          {templateDisplayName}
                        </button>
                      </div>
                      {/* Edit Button */}
                      <Button
                        onClick={handleOpenModal}
                        size="sm"
                        variant="ghost"
                        className="size-7 p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        title="Edit documentation settings"
                      >
                        <Edit3 className="size-3" />
                      </Button>
                    </div>
                    {/* Input - Clickable to toggle mode */}
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-xs font-medium text-gray-500">Input:</span>
                      <button
                        type="button"
                        onClick={handleInputModeToggle}
                        className="cursor-pointer font-medium text-green-600 hover:text-green-800 hover:underline"
                        title={`Audio input only`}
                      >
                        {inputDisplayName}
                      </button>
                    </div>
                  </div>
                )
              : (
                  <>
                    {/* Settings Display */}
                    <div className="flex min-w-0 flex-1 items-center gap-3 text-sm text-gray-700">
                      {/* Horizontal layout for smaller screens */}
                      <span className="shrink-0 text-xs font-medium text-gray-500">Template:</span>
                      <button
                        type="button"
                        onClick={handleTemplateClick}
                        className="cursor-pointer truncate font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        title="Click to change template"
                      >
                        {templateDisplayName}
                      </button>
                      <span className="text-gray-400">|</span>
                      <span className="shrink-0 text-xs font-medium text-gray-500">Input:</span>
                      <button
                        type="button"
                        onClick={handleInputModeToggle}
                        className="cursor-pointer font-medium text-green-600 hover:text-green-800 hover:underline"
                        title={`Audio input only`}
                      >
                        {inputDisplayName}
                      </button>
                    </div>

                    {/* Edit Button */}
                    <Button
                      onClick={handleOpenModal}
                      size="sm"
                      variant="ghost"
                      className="size-7 shrink-0 p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      title="Edit documentation settings"
                    >
                      <Edit3 className="size-3" />
                    </Button>
                  </>
                )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Modal */}
      <DocumentationSettingsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSettingsChange}
        currentTemplateId={templateId}
        currentInputMode={inputMode}
        templates={templates}
        isLoading={isLoading}
      />
    </>
  );
};
