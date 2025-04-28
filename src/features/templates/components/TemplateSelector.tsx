'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';

import type { Template } from '../types';
import { TemplateSelectorModal } from './TemplateSelectorModal';

type TemplateSelectorProps = {
  selectedTemplate: Template;
  onTemplateSelect: (template: Template) => void;
};

export function TemplateSelector({ selectedTemplate, onTemplateSelect }: TemplateSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isModalOpen}
        className="w-full justify-between"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="truncate">{selectedTemplate?.name || 'Select Template'}</span>
        <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
      </Button>

      <TemplateSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={(template) => {
          onTemplateSelect(template);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
