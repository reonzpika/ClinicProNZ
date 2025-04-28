'use client';

import { useAuth } from '@clerk/nextjs';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';

import type { Template } from '../types';
import { TemplateList } from './TemplateList';
import { TemplatePreview } from './TemplatePreview';

type TemplateSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: Template;
  onTemplateSelect: (template: Template) => void;
};

export function TemplateSelectorModal({
  isOpen,
  onClose,
  selectedTemplate,
  onTemplateSelect,
}: TemplateSelectorModalProps) {
  const { isSignedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(selectedTemplate);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Consultation Template</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-5 gap-4">
            {/* Template List - 3 columns */}
            <div className="col-span-3 max-h-[400px] overflow-y-auto">
              <TemplateList
                searchQuery={searchQuery}
                selectedTemplate={selectedTemplate}
                onTemplateSelect={onTemplateSelect}
                onTemplateHover={setPreviewTemplate}
                isSignedIn={isSignedIn}
              />
            </div>

            {/* Template Preview - 2 columns */}
            <div className="col-span-2 border-l pl-4">
              <h4 className="mb-2 font-medium">Template Preview</h4>
              {previewTemplate && (
                <TemplatePreview template={previewTemplate} />
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onTemplateSelect(previewTemplate || selectedTemplate);
              onClose();
            }}
            disabled={!previewTemplate}
          >
            Select Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
