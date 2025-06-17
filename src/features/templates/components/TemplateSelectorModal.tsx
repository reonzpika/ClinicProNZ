'use client';

import { useAuth } from '@clerk/nextjs';
import { Check, ChevronDown, ChevronRight, Settings, Zap } from 'lucide-react';
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

import type { Template, TemplateSettings } from '../types';

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

// Default settings for template comparison
const defaultSettings: TemplateSettings = {
  aiAnalysis: {
    enabled: false,
    components: {
      differentialDiagnosis: false,
      managementPlan: false,
    },
    level: 'medium',
  },
};

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
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [orderedTemplates, setOrderedTemplates] = useState<Template[]>(templates);
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();

  const getTemplateFeatures = (template: Template) => {
    const settings = template.dsl?.settings || defaultSettings;
    const features = [];

    // AI Analysis
    if (settings.aiAnalysis.enabled) {
      const components = settings.aiAnalysis.components;
      const aiComponents = [];
      if (components.differentialDiagnosis) aiComponents.push('Differential');
      if (components.managementPlan) aiComponents.push('Management');
      
      const aiSummary = settings.aiAnalysis.enabled 
        ? `AI: ${aiComponents.length > 0 ? aiComponents.join(', ') : 'None'} (${settings.aiAnalysis.level})`
        : null;

      features.push({
        icon: <Zap className="size-3" />,
        label: aiSummary,
        color: 'text-violet-600',
      });
    }

    return features;
  };

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

  const toggleExpanded = (templateId: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    setExpandedTemplates((prev) => {
      const isCurrentlyExpanded = prev.has(templateId);

      if (isCurrentlyExpanded) {
        // If currently expanded, collapse it
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      } else {
        // If not expanded, collapse all others and expand this one
        return new Set([templateId]);
      }
    });
  };

  const currentTemplate = orderedTemplates.find(t => t.id === selectedTemplateId);

  const handleCreateEditClick = () => {
    if (!isSignedIn) {
      // If not signed in, close modal and let the parent handle auth
      onClose();
      return;
    }
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
                        {filteredTemplates.map((template) => {
                          const isExpanded = expandedTemplates.has(template.id);
                          const settingsSummary = getTemplateFeatures(template);

                          return (
                            <div
                              key={template.id}
                              className={`rounded-md border transition-colors ${
                                selectedTemplateId === template.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:bg-muted/50'
                              }`}
                            >
                              {/* Template Header - Always Visible */}
                              <div
                                className="flex cursor-pointer items-center justify-between p-3"
                                onClick={(e) => {
                                  // Always expand/collapse when clicking on the template
                                  toggleExpanded(template.id, e);
                                  // Also select the template
                                  handleTemplateClick(template);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    toggleExpanded(template.id);
                                    handleTemplateClick(template);
                                  }
                                }}
                                role="button"
                                tabIndex={0}
                              >
                                <div className="flex flex-1 items-center gap-2">
                                  <h3 className="font-medium">{template.name}</h3>
                                  {userDefaultTemplateId === template.id && (
                                    <span title="Default Template" aria-label="Default Template" className="text-xs font-semibold text-yellow-500">★</span>
                                  )}

                                  {/* Settings Summary Icons */}
                                  {settingsSummary.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      {settingsSummary.slice(0, 3).map((setting, index) => (
                                        <span
                                          key={index}
                                          className={`flex items-center ${setting.color}`}
                                          title={setting.label || undefined}
                                        >
                                          {setting.icon}
                                        </span>
                                      ))}
                                      {settingsSummary.length > 3 && (
                                        <span className="text-xs text-muted-foreground">
                                          +
                                          {settingsSummary.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Expand/Collapse Indicator */}
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                  </div>

                                  {/* Selection Indicator */}
                                  {selectedTemplateId === template.id && (
                                    <Check className="size-5 shrink-0 text-primary" />
                                  )}
                                </div>
                              </div>

                              {/* Expanded Content */}
                              {isExpanded && (
                                <div className="border-t bg-muted/20 p-3 pt-2">
                                  {/* Description */}
                                  {template.description && (
                                    <div className="mb-3">
                                      <h4 className="mb-1 text-xs font-medium text-muted-foreground">Description</h4>
                                      <div className="text-sm text-muted-foreground">
                                        {template.description.replace(/\\n/g, '\n').split('\n').map((line, index) => (
                                          <div key={index} className={index > 0 ? 'mt-1' : ''}>
                                            {line.trim() || '\u00A0'}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Template Settings */}
                                  {settingsSummary.length > 0 && (
                                    <div>
                                      <h4 className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                        <Settings className="size-3" />
                                        Template Settings
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        {settingsSummary.map((setting, index) => (
                                          <div
                                            key={index}
                                            className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${setting.color} border-current/20 bg-current/5`}
                                          >
                                            {setting.icon}
                                            <span>{setting.label}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
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
