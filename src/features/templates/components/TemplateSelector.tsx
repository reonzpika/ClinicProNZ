'use client';

import { useAuth } from '@clerk/nextjs';
import { FileText, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { useConsultation } from '@/shared/ConsultationContext';

import type { Template, TemplateSettings } from '../types';
import { TemplateSelectorModal } from './TemplateSelectorModal';

export function TemplateSelector() {
  const { isSignedIn, userId } = useAuth();
  const { templateId, setTemplateId } = useConsultation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [_, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user default templateId from localStorage (for highlight)
  let userDefaultTemplateId: string | null = null;
  if (typeof window !== 'undefined') {
    userDefaultTemplateId = localStorage.getItem('userDefaultTemplateId');
  }

  // Helper function to get default settings
  const getDefaultSettings = (): TemplateSettings => ({
    detailLevel: 'medium',
    bulletPoints: false,
    aiAnalysis: {
      enabled: false,
      components: {
        differentialDiagnosis: false,
        assessmentSummary: false,
        managementPlan: false,
        redFlags: false,
      },
      level: 'medium',
    },
    abbreviations: false,
  });

  // Helper function to get template settings summary
  const getSettingsSummary = (template: Template) => {
    const settings = template.dsl?.settings || getDefaultSettings();
    const summary = [];

    // Detail level
    if (settings.detailLevel !== 'medium') {
      summary.push({
        icon: <FileText className="size-3" />,
        label: `${settings.detailLevel.charAt(0).toUpperCase() + settings.detailLevel.slice(1)} Detail`,
        color: settings.detailLevel === 'high' ? 'text-purple-600' : 'text-blue-600',
      });
    }

    // Bullet points
    if (settings.bulletPoints) {
      summary.push({
        icon: <span className="text-xs font-bold">•</span>,
        label: 'Bullet Points',
        color: 'text-orange-600',
      });
    }

    // Abbreviations
    if (settings.abbreviations) {
      summary.push({
        icon: <span className="text-xs font-bold">Ab</span>,
        label: 'Abbreviations',
        color: 'text-cyan-600',
      });
    }

    // AI Analysis
    if (settings.aiAnalysis.enabled) {
      const enabledCount = Object.values(settings.aiAnalysis.components || {}).filter(Boolean).length;
      summary.push({
        icon: <Zap className="size-3" />,
        label: `AI Analysis (${enabledCount})`,
        color: 'text-violet-600',
      });
    }

    return summary;
  };

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
  const fallbackTemplate: Template = {
    id: '',
    name: '',
    type: 'default',
    description: '',
    dsl: { sections: [{ heading: 'Default Section', prompt: 'Default prompt' }] },
  };

  const handleTemplateSelect = (template: Template) => {
    setTemplateId(template.id);
    setIsModalOpen(false);
  };

  // Get settings summary for selected template
  const settingsSummary = selectedTemplate ? getSettingsSummary(selectedTemplate) : [];

  return (
    <div>
      <Button
        variant="outline"
        className="h-8 w-full justify-between px-2 py-1 text-xs"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs">{selectedTemplate ? selectedTemplate.name : 'Select a template'}</span>

          {/* Settings Summary Icons */}
          {settingsSummary.length > 0 && (
            <div className="flex items-center gap-1">
              {settingsSummary.map((setting, index) => (
                <span
                  key={index}
                  className={`flex items-center ${setting.color}`}
                  title={setting.label}
                >
                  {setting.icon}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="text-xs">▼</span>
      </Button>

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
