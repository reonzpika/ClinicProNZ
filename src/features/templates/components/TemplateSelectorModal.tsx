/* eslint-disable jsx-a11y/click-events-have-key-events */
'use client';

import { useAuth } from '@clerk/nextjs';
import { Check, Heart, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';
import { ScrollArea } from '@/src/shared/components/ui/scroll-area';

import type { Template } from '../types';

type TemplateSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: Template;
  onTemplateSelect: (template: Template) => void;
  templates: Template[];
  userDefaultTemplateId: string | null;
};

export function TemplateSelectorModal({
  isOpen,
  onClose,
  selectedTemplate,
  onTemplateSelect,
  templates,
  userDefaultTemplateId,
}: TemplateSelectorModalProps) {
  const { isSignedIn } = useAuth();
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);

  const handleTemplateSelect = (template: Template) => {
    onTemplateSelect(template);
  };

  const handleSetDefault = (templateId: string) => {
    localStorage.setItem('userDefaultTemplateId', templateId);
    // Force a re-render by updating the state or triggering a refresh
    window.location.reload();
  };

  const handleDeleteTemplate = async (templateId: string) => {
    // eslint-disable-next-line curly
    if (!isSignedIn) return;

    setDeletingTemplateId(templateId);
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      // Refresh the page to update templates list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting template:', error);
      // eslint-disable-next-line no-alert
      alert('Failed to delete template. Please try again.');
    } finally {
      setDeletingTemplateId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-background">
        <DialogHeader>
          <DialogTitle>Select Template</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          <div className="space-y-2">
            {templates.map((template) => {
              const isSelected = selectedTemplate?.id === template.id;
              const isDefault = userDefaultTemplateId === template.id;
              const isCustom = template.type === 'custom';

              return (
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                <div
                  key={template.id}
                  className={`group cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{template.name}</h4>
                        {isSelected && <Check className="size-4 text-primary" />}
                        {isDefault && <Heart className="size-4 text-red-500" />}
                        <Badge variant={isCustom ? 'default' : 'secondary'} className="text-xs">
                          {isCustom ? 'Custom' : 'Default'}
                        </Badge>
                      </div>
                      {template.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      {isSignedIn && !isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(template.id);
                          }}
                          title="Set as default"
                        >
                          <Star className="size-4" />
                        </Button>
                      )}

                      {isSignedIn && isCustom && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id);
                          }}
                          disabled={deletingTemplateId === template.id}
                          title="Delete template"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
