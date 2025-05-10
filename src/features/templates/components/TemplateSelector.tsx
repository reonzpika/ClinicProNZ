'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState, useMemo } from 'react';

import { Button } from '@/shared/components/ui/button';
import { useConsultation } from '@/shared/ConsultationContext';
import type { Template } from '../types';
import { TemplateSelectorModal } from './TemplateSelectorModal';

export function TemplateSelector() {
  const { isSignedIn, userId } = useAuth();
  const { templateId, setTemplateId } = useConsultation();
  const [isModalOpen, setIsModalOpen] = useState(false);
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
          // Optionally, add a label to distinguish
          allTemplates = [
            ...allTemplates.map(t => ({ ...t, _templateType: 'Default' })),
            ...customTemplates.map(t => ({ ...t, _templateType: 'Custom' })),
          ];
        } else {
          // Only default templates
          allTemplates = allTemplates.map(t => ({ ...t, _templateType: 'Default' }));
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
  const fallbackTemplate = { id: '', name: '', type: 'default', description: '', sections: [], prompts: { structure: '' } };

  const handleTemplateSelect = (template: Template) => {
    setTemplateId(template.id);
    setIsModalOpen(false);
  };

  return (
    <div>
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsModalOpen(true)}
      >
        <span>{selectedTemplate ? selectedTemplate.name : 'Select a template'}</span>
        <span>▼</span>
      </Button>

      <TemplateSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedTemplate={selectedTemplate || fallbackTemplate}
        onTemplateSelect={handleTemplateSelect}
        templates={templates}
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">
          Error:
          {' '}
          {error}
        </p>
      )}
    </div>
  );
}
