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
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Alert } from '@/shared/components/ui/alert';

import type { Template } from '../types';
import { TemplatePreview } from './TemplatePreview';

type TemplateSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: Template;
  onTemplateSelect: (template: Template) => void;
  templates?: Template[];
};

export function TemplateSelectorModal({
  isOpen,
  onClose,
  selectedTemplate,
  onTemplateSelect,
  templates = [], // Default empty array
}: TemplateSelectorModalProps) {
  const { isSignedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(selectedTemplate);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

          {templates.length === 0 ? (
            <Alert variant="destructive">
              No templates available. Please create a template first.
            </Alert>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              {/* Template List - 3 columns */}
              <div className="col-span-3">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredTemplates.map(template => (
                      <div
                        key={template.id}
                        className={`cursor-pointer rounded-md p-3 transition-colors ${
                          previewTemplate?.id === template.id
                            ? 'bg-primary/10'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setPreviewTemplate(template)}
                        onMouseEnter={() => setPreviewTemplate(template)}
                      >
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-muted-foreground text-sm">
                          {template.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Template Preview - 2 columns */}
              <div className="col-span-2 border-l pl-4">
                <h4 className="mb-2 font-medium">Template Preview</h4>
                {previewTemplate && (
                  <TemplatePreview template={previewTemplate} />
                )}
              </div>
            </div>
          )}
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
            disabled={!previewTemplate || templates.length === 0}
          >
            Select Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
