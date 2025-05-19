'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';

import { Alert } from '@/shared/components/ui/alert';
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

import type { Template } from '../types';

// Templates are expected to be passed in the user's preferred order from the parent.
// This component does not sort or reorder templates except for search filtering.
type TemplateSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: Template;
  onTemplateSelect: (template: Template) => void;
  templates?: Template[];
  userDefaultTemplateId: string | null;
};

const EMPTY_TEMPLATES: Template[] = [];

export function TemplateSelectorModal({
  isOpen,
  onClose,
  selectedTemplate: initialTemplate,
  onTemplateSelect,
  templates = EMPTY_TEMPLATES, // Use variable for default
  userDefaultTemplateId,
}: TemplateSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplate?.id || '');

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplateId(template.id);
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          if (currentTemplate) {
            onTemplateSelect(currentTemplate);
          }
          onClose();
        }
      }}
    >
      <DialogContent className="bg-white sm:max-w-[600px]">
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

          {templates.length === 0
            ? (
                <Alert variant="destructive">
                  No templates available. Please create a template first.
                </Alert>
              )
            : (
                <div className="grid grid-cols-1 gap-4">
                  {/* Template List - full width */}
                  <div>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {filteredTemplates.map(template => (
                          <div
                            key={template.id}
                            className={`cursor-pointer rounded-md p-3 transition-colors ${
                              selectedTemplateId === template.id
                                ? 'bg-primary/10'
                                : 'hover:bg-muted'
                            }`}
                            onClick={() => handleTemplateClick(template)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleTemplateClick(template);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="flex items-center gap-2 font-medium">
                                  {template.name}
                                  {userDefaultTemplateId === template.id && (
                                    <span title="Default Template" aria-label="Default Template" className="ml-1 text-xs font-semibold text-yellow-500">★ Default</span>
                                  )}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {template.description}
                                </p>
                              </div>
                              {selectedTemplateId === template.id && (
                                <Check className="size-5 text-primary" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
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
              if (currentTemplate) {
                onTemplateSelect(currentTemplate);
                onClose();
              }
            }}
            disabled={!currentTemplate || templates.length === 0}
          >
            Select Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
