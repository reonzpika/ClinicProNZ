'use client';

import { useAuth } from '@clerk/nextjs';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
import { ScrollArea, ScrollBar } from '@/shared/components/ui/scroll-area';

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
  templates = EMPTY_TEMPLATES,
  userDefaultTemplateId,
}: TemplateSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplate?.id || '');
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [expandedExamples, setExpandedExamples] = useState<Set<string>>(new Set());
  const [orderedTemplates, setOrderedTemplates] = useState<Template[]>(templates);
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();

  // Reorder templates based on user settings when modal opens
  useEffect(() => {
    if (!isOpen || !isSignedIn || !userId || templates.length === 0) {
      setOrderedTemplates(templates);
      return;
    }

    async function reorderTemplates() {
      try {
        const settingsRes = await fetch('/api/user/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.settings && Array.isArray(settingsData.settings.templateOrder)) {
            const order = settingsData.settings.templateOrder;
            const idToTemplate = Object.fromEntries(templates.map(t => [t.id, t]));
            const reordered = order.map((id: string) => idToTemplate[id]).filter(Boolean);

            // Add any templates not in the order (e.g., new ones)
            const orderedIds = new Set(order);
            const remainingTemplates = templates.filter(t => !orderedIds.has(t.id));

            setOrderedTemplates([...reordered, ...remainingTemplates]);
          } else {
            setOrderedTemplates(templates);
          }
        } else {
          setOrderedTemplates(templates);
        }
      } catch (error) {
        console.error('Failed to fetch user settings:', error);
        setOrderedTemplates(templates);
      }
    }

    reorderTemplates();
  }, [isOpen, isSignedIn, userId, templates]);

  const filteredTemplates = orderedTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplateId(template.id);
  };

  const toggleDescription = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };

  const toggleExample = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedExamples((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };

  const currentTemplate = orderedTemplates.find(t => t.id === selectedTemplateId);

  const handleCreateEditClick = () => {
    router.push('/templates');
    onClose();
  };

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

          {orderedTemplates.length === 0
            ? (
                <Alert variant="destructive">
                  No templates available. Please create a template first.
                </Alert>
              )
            : (
                <div className="grid grid-cols-1 gap-4">
                  {/* Template List - full width */}
                  <div>
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-2 pr-4">
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
                              <div className="flex-1">
                                <h3 className="flex items-center gap-2 font-medium">
                                  {template.name}
                                  {userDefaultTemplateId === template.id && (
                                    <span title="Default Template" aria-label="Default Template" className="ml-1 text-xs font-semibold text-yellow-500">★ Default</span>
                                  )}
                                </h3>

                                {/* Collapsible Description */}
                                {template.description && (
                                  <div className="mt-1">
                                    <button
                                      onClick={e => toggleDescription(template.id, e)}
                                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      {expandedDescriptions.has(template.id)
                                        ? <ChevronDown className="size-3" />
                                        : <ChevronRight className="size-3" />}
                                      Description
                                    </button>
                                    {expandedDescriptions.has(template.id) && (
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        {template.description.replace(/\\n/g, '\n').split('\n').map((line, index) => (
                                          <div key={index} className={index > 0 ? 'mt-1' : ''}>
                                            {line.trim() || '\u00A0'}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Collapsible Example Output */}
                                {template.prompts?.example && (
                                  <div className="mt-1">
                                    <button
                                      onClick={e => toggleExample(template.id, e)}
                                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      {expandedExamples.has(template.id)
                                        ? <ChevronDown className="size-3" />
                                        : <ChevronRight className="size-3" />}
                                      Example Output
                                    </button>
                                    {expandedExamples.has(template.id) && (
                                      <pre className="mt-1 whitespace-pre-wrap rounded bg-muted p-2 text-xs text-muted-foreground">
                                        {template.prompts.example.replace(/\\n/g, '\n')}
                                      </pre>
                                    )}
                                  </div>
                                )}
                              </div>
                              {selectedTemplateId === template.id && (
                                <Check className="ml-2 size-5 shrink-0 text-primary" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <ScrollBar className="w-3 bg-gray-100 [&>*]:bg-gray-400 hover:[&>*]:bg-gray-500" />
                    </ScrollArea>
                  </div>
                </div>
              )}

          {/* How it works instructions */}
          <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-800">
            <p className="font-medium">How it works:</p>
            <ul className="ml-3 mt-1 list-disc space-y-0.5">
              <li>Select a template to structure your consultation notes</li>
              <li>Your selected template will be used to generate the final consultation note from your transcript and additional info</li>
              <li>You can switch templates at any time during or after your consultation before generating the note</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="!flex !flex-row !items-center !justify-between !space-x-0">
          <Button
            variant="link"
            className="p-0 text-xs text-blue-600 hover:text-blue-800"
            onClick={handleCreateEditClick}
          >
            Create/Edit Templates
          </Button>
          <div className="flex gap-2">
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
              disabled={!currentTemplate || orderedTemplates.length === 0}
            >
              Select Template
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
