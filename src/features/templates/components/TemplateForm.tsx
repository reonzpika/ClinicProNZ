import { ChevronDown, ChevronDown as MoveDown, ChevronRight, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';

import type { SectionDSL, SubsectionDSL, Template, TemplateDSL, TemplateSettings } from '../types';

type TemplateFormProps = {
  template: Template;
  onChange: (updates: Partial<Template>) => void;
};

type DragState = {
  draggedSectionIndex: number | null;
  draggedSubsectionIndex: number | null;
  dragOverSectionIndex: number | null;
  dragOverSubsectionIndex: number | null;
  dragOverPosition: 'before' | 'after' | null;
};

export function TemplateForm({ template, onChange }: TemplateFormProps) {
  const [dsl, setDsl] = useState<TemplateDSL>(template.dsl || { sections: [] });
  const [dragState, setDragState] = useState<DragState>({
    draggedSectionIndex: null,
    draggedSubsectionIndex: null,
    dragOverSectionIndex: null,
    dragOverSubsectionIndex: null,
    dragOverPosition: null,
  });
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());

  // Reset state when template changes (e.g., when creating a new template)
  useEffect(() => {
    setDsl(template.dsl || { sections: [] });
    setCollapsedSections(new Set());
  }, [template.id]);

  const updateDsl = (newDsl: TemplateDSL) => {
    setDsl(newDsl);
    onChange({ dsl: newDsl });
  };

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

  // Helper function to update settings
  const updateSettings = (updates: Partial<TemplateSettings>) => {
    const currentSettings = dsl.settings || getDefaultSettings();
    const newSettings = { ...currentSettings, ...updates };
    updateDsl({ ...dsl, settings: newSettings });
  };

  // Section collapse/expand handlers
  const toggleSectionCollapse = (sectionIndex: number) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionIndex)) {
      newCollapsed.delete(sectionIndex);
    } else {
      newCollapsed.add(sectionIndex);
    }
    setCollapsedSections(newCollapsed);
  };

  // Section reordering with buttons
  const moveSectionUp = (sectionIndex: number) => {
    if (sectionIndex === 0) {
      return;
    }

    const newSections = [...dsl.sections];
    const temp = newSections[sectionIndex];
    const prev = newSections[sectionIndex - 1];
    if (temp && prev) {
      newSections[sectionIndex] = prev;
      newSections[sectionIndex - 1] = temp;
    }

    updateDsl({
      ...dsl,
      sections: newSections,
    });

    // Update collapsed state indices
    const newCollapsed = new Set<number>();
    collapsedSections.forEach((index) => {
      if (index === sectionIndex) {
        newCollapsed.add(index - 1);
      } else if (index === sectionIndex - 1) {
        newCollapsed.add(index + 1);
      } else {
        newCollapsed.add(index);
      }
    });
    setCollapsedSections(newCollapsed);
  };

  const moveSectionDown = (sectionIndex: number) => {
    if (sectionIndex === dsl.sections.length - 1) {
      return;
    }

    const newSections = [...dsl.sections];
    const temp = newSections[sectionIndex];
    const next = newSections[sectionIndex + 1];
    if (temp && next) {
      newSections[sectionIndex] = next;
      newSections[sectionIndex + 1] = temp;
    }

    updateDsl({
      ...dsl,
      sections: newSections,
    });

    // Update collapsed state indices
    const newCollapsed = new Set<number>();
    collapsedSections.forEach((index) => {
      if (index === sectionIndex) {
        newCollapsed.add(index + 1);
      } else if (index === sectionIndex + 1) {
        newCollapsed.add(index - 1);
      } else {
        newCollapsed.add(index);
      }
    });
    setCollapsedSections(newCollapsed);
  };

  // Subsection reordering with buttons
  const moveSubsectionUp = (sectionIndex: number, subsectionIndex: number) => {
    if (subsectionIndex === 0) {
      return;
    }

    const newSections = [...dsl.sections];
    const currentSection = newSections[sectionIndex];
    if (currentSection?.subsections) {
      const temp = currentSection.subsections[subsectionIndex];
      const prev = currentSection.subsections[subsectionIndex - 1];
      if (temp && prev) {
        currentSection.subsections[subsectionIndex] = prev;
        currentSection.subsections[subsectionIndex - 1] = temp;

        updateDsl({
          ...dsl,
          sections: newSections,
        });
      }
    }
  };

  const moveSubsectionDown = (sectionIndex: number, subsectionIndex: number) => {
    const newSections = [...dsl.sections];
    const currentSection = newSections[sectionIndex];
    if (currentSection?.subsections && subsectionIndex < currentSection.subsections.length - 1) {
      const temp = currentSection.subsections[subsectionIndex];
      const next = currentSection.subsections[subsectionIndex + 1];
      if (temp && next) {
        currentSection.subsections[subsectionIndex] = next;
        currentSection.subsections[subsectionIndex + 1] = temp;

        updateDsl({
          ...dsl,
          sections: newSections,
        });
      }
    }
  };

  const addSection = () => {
    const newSection: SectionDSL = {
      heading: '',
      prompt: '',
    };
    updateDsl({
      ...dsl,
      sections: [...dsl.sections, newSection],
    });
  };

  const updateSection = (index: number, updates: Partial<SectionDSL>) => {
    const newSections = [...dsl.sections];
    const currentSection = newSections[index];
    if (currentSection) {
      newSections[index] = { ...currentSection, ...updates };

      updateDsl({
        ...dsl,
        sections: newSections,
      });
    }
  };

  const removeSection = (index: number) => {
    const newSections = dsl.sections.filter((_, i) => i !== index);
    updateDsl({
      ...dsl,
      sections: newSections,
    });

    // Update collapsed state indices
    const newCollapsed = new Set<number>();
    collapsedSections.forEach((collapsedIndex) => {
      if (collapsedIndex < index) {
        newCollapsed.add(collapsedIndex);
      } else if (collapsedIndex > index) {
        newCollapsed.add(collapsedIndex - 1);
      }
      // Skip the removed index
    });
    setCollapsedSections(newCollapsed);
  };

  const addSubsection = (sectionIndex: number) => {
    const newSubsection: SubsectionDSL = {
      heading: '',
      prompt: '',
    };
    const newSections = [...dsl.sections];
    const currentSection = newSections[sectionIndex];
    if (currentSection) {
      if (!currentSection.subsections) {
        currentSection.subsections = [];
      }
      currentSection.subsections.push(newSubsection);
      updateDsl({
        ...dsl,
        sections: newSections,
      });
    }
  };

  const updateSubsection = (sectionIndex: number, subsectionIndex: number, updates: Partial<SubsectionDSL>) => {
    const newSections = [...dsl.sections];
    const currentSection = newSections[sectionIndex];
    if (currentSection?.subsections?.[subsectionIndex]) {
      const currentSubsection = currentSection.subsections[subsectionIndex];
      currentSection.subsections[subsectionIndex] = { ...currentSubsection, ...updates };

      updateDsl({
        ...dsl,
        sections: newSections,
      });
    }
  };

  const removeSubsection = (sectionIndex: number, subsectionIndex: number) => {
    const newSections = [...dsl.sections];
    const currentSection = newSections[sectionIndex];
    if (currentSection?.subsections) {
      currentSection.subsections = currentSection.subsections.filter(
        (_, i) => i !== subsectionIndex,
      );
      updateDsl({
        ...dsl,
        sections: newSections,
      });
    }
  };

  // Drag and drop handlers for sections
  const handleSectionDragStart = (e: React.DragEvent, sectionIndex: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDragState({
      ...dragState,
      draggedSectionIndex: sectionIndex,
      draggedSubsectionIndex: null,
    });
  };

  const handleSectionDragOver = (e: React.DragEvent, sectionIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? 'before' : 'after';

    setDragState({
      ...dragState,
      dragOverSectionIndex: sectionIndex,
      dragOverPosition: position,
    });
  };

  const handleSectionDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the section entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragState({
        ...dragState,
        dragOverSectionIndex: null,
        dragOverPosition: null,
      });
    }
  };

  const handleSectionDrop = (e: React.DragEvent, targetSectionIndex: number) => {
    e.preventDefault();

    const { draggedSectionIndex } = dragState;
    if (draggedSectionIndex === null || draggedSectionIndex === targetSectionIndex) {
      setDragState({
        draggedSectionIndex: null,
        draggedSubsectionIndex: null,
        dragOverSectionIndex: null,
        dragOverSubsectionIndex: null,
        dragOverPosition: null,
      });
      return;
    }

    const newSections = [...dsl.sections];
    const draggedSection = newSections[draggedSectionIndex];

    if (!draggedSection) {
      return;
    }

    // Remove the dragged section
    newSections.splice(draggedSectionIndex, 1);

    // Calculate new position
    let newIndex = targetSectionIndex;
    if (draggedSectionIndex < targetSectionIndex) {
      newIndex -= 1;
    }

    if (dragState.dragOverPosition === 'after') {
      newIndex += 1;
    }

    // Insert at new position
    newSections.splice(newIndex, 0, draggedSection);

    updateDsl({
      ...dsl,
      sections: newSections,
    });

    setDragState({
      draggedSectionIndex: null,
      draggedSubsectionIndex: null,
      dragOverSectionIndex: null,
      dragOverSubsectionIndex: null,
      dragOverPosition: null,
    });
  };

  // Drag and drop handlers for subsections
  const handleSubsectionDragStart = (e: React.DragEvent, sectionIndex: number, subsectionIndex: number) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    setDragState({
      ...dragState,
      draggedSectionIndex: sectionIndex,
      draggedSubsectionIndex: subsectionIndex,
    });
  };

  const handleSubsectionDragOver = (e: React.DragEvent, sectionIndex: number, subsectionIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? 'before' : 'after';

    setDragState({
      ...dragState,
      dragOverSectionIndex: sectionIndex,
      dragOverSubsectionIndex: subsectionIndex,
      dragOverPosition: position,
    });
  };

  const handleSubsectionDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragState({
        ...dragState,
        dragOverSubsectionIndex: null,
        dragOverPosition: null,
      });
    }
  };

  const handleSubsectionDrop = (e: React.DragEvent, targetSectionIndex: number, targetSubsectionIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const { draggedSectionIndex, draggedSubsectionIndex } = dragState;
    if (draggedSectionIndex === null || draggedSubsectionIndex === null) {
      setDragState({
        draggedSectionIndex: null,
        draggedSubsectionIndex: null,
        dragOverSectionIndex: null,
        dragOverSubsectionIndex: null,
        dragOverPosition: null,
      });
      return;
    }

    // Don't allow dropping on the same subsection
    if (draggedSectionIndex === targetSectionIndex && draggedSubsectionIndex === targetSubsectionIndex) {
      setDragState({
        draggedSectionIndex: null,
        draggedSubsectionIndex: null,
        dragOverSectionIndex: null,
        dragOverSubsectionIndex: null,
        dragOverPosition: null,
      });
      return;
    }

    const newSections = [...dsl.sections];
    const sourceSection = newSections[draggedSectionIndex];
    const targetSection = newSections[targetSectionIndex];

    if (!sourceSection?.subsections || !targetSection?.subsections) {
      setDragState({
        draggedSectionIndex: null,
        draggedSubsectionIndex: null,
        dragOverSectionIndex: null,
        dragOverSubsectionIndex: null,
        dragOverPosition: null,
      });
      return;
    }

    const draggedSubsection = sourceSection.subsections[draggedSubsectionIndex];

    if (!draggedSubsection) {
      return;
    }

    // Remove from source
    sourceSection.subsections.splice(draggedSubsectionIndex, 1);

    // Calculate new position in target
    let newIndex = targetSubsectionIndex;
    if (draggedSectionIndex === targetSectionIndex && draggedSubsectionIndex < targetSubsectionIndex) {
      newIndex -= 1;
    }

    if (dragState.dragOverPosition === 'after') {
      newIndex += 1;
    }

    // Insert at new position
    targetSection.subsections.splice(newIndex, 0, draggedSubsection);

    updateDsl({
      ...dsl,
      sections: newSections,
    });

    setDragState({
      draggedSectionIndex: null,
      draggedSubsectionIndex: null,
      dragOverSectionIndex: null,
      dragOverSubsectionIndex: null,
      dragOverPosition: null,
    });
  };

  // Get current settings with defaults
  const currentSettings = dsl.settings || getDefaultSettings();

  // Ensure components exist for backward compatibility
  const safeComponents = currentSettings.aiAnalysis.components || {
    differentialDiagnosis: false,
    assessmentSummary: false,
    managementPlan: false,
    redFlags: false,
  };

  // Validation function
  const validateTemplate = () => {
    const hasOverallInstructions = dsl.overallInstructions && dsl.overallInstructions.trim().length > 0;
    const hasSections = dsl.sections.length > 0;
    return hasOverallInstructions || hasSections;
  };

  const isTemplateValid = validateTemplate();

  return (
    <div className="space-y-6">
      {/* Validation Message */}
      {!isTemplateValid && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Template must have either overall instructions or at least one section.
          </p>
        </div>
      )}

      {/* Basic Template Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={template.name || ''}
            onChange={e => onChange({ name: e.target.value })}
            placeholder="Enter template name"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={template.description || ''}
            onChange={e => onChange({ description: e.target.value })}
            placeholder="Enter template description"
            rows={3}
          />
        </div>
      </div>

      {/* Overall Instructions */}
      <div>
        <Label htmlFor="overallInstructions">Overall Instructions (Optional)</Label>
        <Textarea
          id="overallInstructions"
          value={dsl.overallInstructions || ''}
          onChange={e => updateDsl({ ...dsl, overallInstructions: e.target.value })}
          placeholder="Enter overall instructions for the template"
          rows={3}
        />
      </div>

      {/* Template Settings */}
      <div className="space-y-4 rounded-lg border p-4">
        <div>
          <Label className="text-lg font-medium">Template Settings</Label>
          <p className="text-sm text-muted-foreground">
            Configure default settings for note generation with this template
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column - Basic Settings */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Basic Settings</Label>
              <p className="mb-4 text-sm text-muted-foreground">
                Configure general note formatting options
              </p>
            </div>

            {/* Detail Level */}
            <div className="space-y-2">
              <Label htmlFor="detailLevel">Detail Level</Label>
              <Select
                value={currentSettings.detailLevel}
                onValueChange={(value: 'low' | 'medium' | 'high') =>
                  updateSettings({ detailLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select detail level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Key clinical facts only</SelectItem>
                  <SelectItem value="medium">Medium - Standard detail</SelectItem>
                  <SelectItem value="high">High - Thorough descriptions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bullet Points */}
            <div className="flex items-center justify-between space-y-2">
              <div className="space-y-0.5">
                <Label htmlFor="bulletPoints">Bullet Points</Label>
                <p className="text-sm text-muted-foreground">
                  Use bullet points instead of paragraphs
                </p>
              </div>
              <Switch
                id="bulletPoints"
                checked={currentSettings.bulletPoints}
                onCheckedChange={checked => updateSettings({ bulletPoints: checked })}
              />
            </div>

            {/* Abbreviations */}
            <div className="flex items-center justify-between space-y-2">
              <div className="space-y-0.5">
                <Label htmlFor="abbreviations">Medical Abbreviations</Label>
                <p className="text-sm text-muted-foreground">
                  Use common medical abbreviations
                </p>
              </div>
              <Switch
                id="abbreviations"
                checked={currentSettings.abbreviations}
                onCheckedChange={checked => updateSettings({ abbreviations: checked })}
              />
            </div>
          </div>

          {/* Right Column - AI Analysis */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">AI Analysis</Label>
              <p className="mb-4 text-sm text-muted-foreground">
                Configure AI-powered analysis and recommendations
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="aiAnalysis">Enable AI Analysis</Label>
                  <p className="text-sm text-muted-foreground">
                    Include AI-generated analysis and recommendations
                  </p>
                </div>
                <Switch
                  id="aiAnalysis"
                  checked={currentSettings.aiAnalysis.enabled}
                  onCheckedChange={checked =>
                    updateSettings({
                      aiAnalysis: {
                        ...currentSettings.aiAnalysis,
                        enabled: checked,
                      },
                    })}
                />
              </div>

              {currentSettings.aiAnalysis.enabled && (
                <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                  <div>
                    <Label className="text-sm font-medium">Analysis Components</Label>
                    <p className="text-sm text-muted-foreground">
                      Select which aspects of the consultation to analyze
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ddx"
                        checked={safeComponents.differentialDiagnosis}
                        onCheckedChange={checked =>
                          updateSettings({
                            aiAnalysis: {
                              ...currentSettings.aiAnalysis,
                              components: {
                                ...safeComponents,
                                differentialDiagnosis: checked,
                              },
                            },
                          })}
                      />
                      <Label htmlFor="ddx" className="text-sm">
                        Differential Diagnosis
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="assessment"
                        checked={safeComponents.assessmentSummary}
                        onCheckedChange={checked =>
                          updateSettings({
                            aiAnalysis: {
                              ...currentSettings.aiAnalysis,
                              components: {
                                ...safeComponents,
                                assessmentSummary: checked,
                              },
                            },
                          })}
                      />
                      <Label htmlFor="assessment" className="text-sm">
                        Assessment Summary
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="management"
                        checked={safeComponents.managementPlan}
                        onCheckedChange={checked =>
                          updateSettings({
                            aiAnalysis: {
                              ...currentSettings.aiAnalysis,
                              components: {
                                ...safeComponents,
                                managementPlan: checked,
                              },
                            },
                          })}
                      />
                      <Label htmlFor="management" className="text-sm">
                        Management Plan (includes investigations & follow-up)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="redFlags"
                        checked={safeComponents.redFlags}
                        onCheckedChange={checked =>
                          updateSettings({
                            aiAnalysis: {
                              ...currentSettings.aiAnalysis,
                              components: {
                                ...safeComponents,
                                redFlags: checked,
                              },
                            },
                          })}
                      />
                      <Label htmlFor="redFlags" className="text-sm">
                        Red Flags
                      </Label>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="aiAnalysisLevel">Analysis Detail Level</Label>
                    <Select
                      value={currentSettings.aiAnalysis.level}
                      onValueChange={(value: 'low' | 'medium' | 'high') =>
                        updateSettings({
                          aiAnalysis: {
                            ...currentSettings.aiAnalysis,
                            level: value,
                          },
                        })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select analysis detail level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Brief and concise</SelectItem>
                        <SelectItem value="medium">Medium - Balanced detail</SelectItem>
                        <SelectItem value="high">High - Comprehensive and detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Template Sections</Label>
          <Button type="button" onClick={addSection} size="sm">
            Add Section
          </Button>
        </div>

        {dsl.sections.map((section, sectionIndex) => {
          const isDraggedSection = dragState.draggedSectionIndex === sectionIndex && dragState.draggedSubsectionIndex === null;
          const isDragOverSection = dragState.dragOverSectionIndex === sectionIndex && dragState.dragOverSubsectionIndex === null;
          const showDropIndicator = isDragOverSection && dragState.draggedSectionIndex !== null && dragState.draggedSubsectionIndex === null;
          const isCollapsed = collapsedSections.has(sectionIndex);

          return (
            <div key={sectionIndex} className="relative">
              {/* Drop indicator above */}
              {showDropIndicator && dragState.dragOverPosition === 'before' && (
                <div className="absolute inset-x-0 -top-1 z-10 h-0.5 rounded-full bg-blue-500" />
              )}

              <div
                className={`space-y-4 rounded-lg border p-4 transition-all ${
                  isDraggedSection ? 'scale-95 opacity-50' : ''
                } ${isDragOverSection ? 'ring-2 ring-blue-200' : ''}`}
                draggable
                onDragStart={e => handleSectionDragStart(e, sectionIndex)}
                onDragOver={e => handleSectionDragOver(e, sectionIndex)}
                onDragLeave={handleSectionDragLeave}
                onDrop={e => handleSectionDrop(e, sectionIndex)}
              >
                {/* Section Header with Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Collapse/Expand Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSectionCollapse(sectionIndex)}
                      className="h-auto p-1"
                      title={isCollapsed ? 'Expand section' : 'Collapse section'}
                    >
                      {isCollapsed
                        ? (
                            <ChevronRight className="size-4" />
                          )
                        : (
                            <ChevronDown className="size-4" />
                          )}
                    </Button>

                    {/* Drag handle */}
                    <div className="cursor-grab rounded p-1 hover:bg-gray-100 active:cursor-grabbing" title="Drag to reorder">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-gray-400"
                      >
                        <circle cx="4" cy="4" r="1" fill="currentColor" />
                        <circle cx="4" cy="8" r="1" fill="currentColor" />
                        <circle cx="4" cy="12" r="1" fill="currentColor" />
                        <circle cx="8" cy="4" r="1" fill="currentColor" />
                        <circle cx="8" cy="8" r="1" fill="currentColor" />
                        <circle cx="8" cy="12" r="1" fill="currentColor" />
                        <circle cx="12" cy="4" r="1" fill="currentColor" />
                        <circle cx="12" cy="8" r="1" fill="currentColor" />
                        <circle cx="12" cy="12" r="1" fill="currentColor" />
                      </svg>
                    </div>

                    <h4 className="font-medium">
                      Section
                      {' '}
                      {sectionIndex + 1}
                      {section.heading && `: ${section.heading}`}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Up/Down buttons */}
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveSectionUp(sectionIndex)}
                        disabled={sectionIndex === 0}
                        className="size-8 p-1"
                        title="Move section up"
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveSectionDown(sectionIndex)}
                        disabled={sectionIndex === dsl.sections.length - 1}
                        className="size-8 p-1"
                        title="Move section down"
                      >
                        <MoveDown className="size-4" />
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeSection(sectionIndex)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Section Content - Collapsible */}
                {!isCollapsed && (
                  <>
                    <div>
                      <Label htmlFor={`section-heading-${sectionIndex}`}>Section Heading</Label>
                      <Input
                        id={`section-heading-${sectionIndex}`}
                        value={section.heading}
                        onChange={e => updateSection(sectionIndex, { heading: e.target.value })}
                        placeholder="Enter section heading"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`section-optional-${sectionIndex}`}
                        checked={section.optional || false}
                        onCheckedChange={checked => updateSection(sectionIndex, { optional: checked })}
                      />
                      <Label htmlFor={`section-optional-${sectionIndex}`} className="text-sm">
                        Optional section (can be skipped if no relevant content)
                      </Label>
                    </div>

                    <div>
                      <Label htmlFor={`section-prompt-${sectionIndex}`}>Section Prompt</Label>
                      <Textarea
                        id={`section-prompt-${sectionIndex}`}
                        value={section.prompt}
                        onChange={e => updateSection(sectionIndex, { prompt: e.target.value })}
                        placeholder="Enter prompt for this section"
                        rows={3}
                      />
                    </div>

                    {/* Subsections */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Subsections</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSubsection(sectionIndex)}
                        >
                          Add Subsection
                        </Button>
                      </div>

                      {section.subsections?.map((subsection, subsectionIndex) => {
                        const isDraggedSubsection = dragState.draggedSectionIndex === sectionIndex && dragState.draggedSubsectionIndex === subsectionIndex;
                        const isDragOverSubsection = dragState.dragOverSectionIndex === sectionIndex && dragState.dragOverSubsectionIndex === subsectionIndex;
                        const showSubsectionDropIndicator = isDragOverSubsection && dragState.draggedSubsectionIndex !== null;

                        return (
                          <div key={subsectionIndex} className="relative">
                            {/* Drop indicator above subsection */}
                            {showSubsectionDropIndicator && dragState.dragOverPosition === 'before' && (
                              <div className="absolute -top-1 left-4 right-0 z-10 h-0.5 rounded-full bg-blue-500" />
                            )}

                            <div
                              className={`ml-4 space-y-2 rounded border p-3 transition-all ${
                                isDraggedSubsection ? 'scale-95 opacity-50' : ''
                              } ${isDragOverSubsection ? 'ring-2 ring-blue-200' : ''}`}
                              draggable
                              onDragStart={e => handleSubsectionDragStart(e, sectionIndex, subsectionIndex)}
                              onDragOver={e => handleSubsectionDragOver(e, sectionIndex, subsectionIndex)}
                              onDragLeave={handleSubsectionDragLeave}
                              onDrop={e => handleSubsectionDrop(e, sectionIndex, subsectionIndex)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {/* Drag handle for subsection */}
                                  <div className="cursor-grab rounded p-1 hover:bg-gray-100 active:cursor-grabbing" title="Drag to reorder">
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      className="text-gray-400"
                                    >
                                      <circle cx="4" cy="4" r="1" fill="currentColor" />
                                      <circle cx="4" cy="8" r="1" fill="currentColor" />
                                      <circle cx="4" cy="12" r="1" fill="currentColor" />
                                      <circle cx="8" cy="4" r="1" fill="currentColor" />
                                      <circle cx="8" cy="8" r="1" fill="currentColor" />
                                      <circle cx="8" cy="12" r="1" fill="currentColor" />
                                      <circle cx="12" cy="4" r="1" fill="currentColor" />
                                      <circle cx="12" cy="8" r="1" fill="currentColor" />
                                      <circle cx="12" cy="12" r="1" fill="currentColor" />
                                    </svg>
                                  </div>
                                  <h5 className="text-sm font-medium">
                                    Subsection
                                    {' '}
                                    {subsectionIndex + 1}
                                    {subsection.heading && `: ${subsection.heading}`}
                                  </h5>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Up/Down buttons for subsections */}
                                  <div className="flex items-center gap-1">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => moveSubsectionUp(sectionIndex, subsectionIndex)}
                                      disabled={subsectionIndex === 0}
                                      className="size-6 p-1"
                                      title="Move subsection up"
                                    >
                                      <ChevronUp className="size-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => moveSubsectionDown(sectionIndex, subsectionIndex)}
                                      disabled={!section.subsections || subsectionIndex === section.subsections.length - 1}
                                      className="size-6 p-1"
                                      title="Move subsection down"
                                    >
                                      <MoveDown className="size-3" />
                                    </Button>
                                  </div>

                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeSubsection(sectionIndex, subsectionIndex)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <Label htmlFor={`subsection-heading-${sectionIndex}-${subsectionIndex}`} className="text-sm">
                                  Subsection Heading
                                </Label>
                                <Input
                                  id={`subsection-heading-${sectionIndex}-${subsectionIndex}`}
                                  value={subsection.heading}
                                  onChange={e => updateSubsection(sectionIndex, subsectionIndex, { heading: e.target.value })}
                                  placeholder="Enter subsection heading"
                                />
                              </div>

                              <div>
                                <Label htmlFor={`subsection-prompt-${sectionIndex}-${subsectionIndex}`} className="text-sm">
                                  Subsection Prompt
                                </Label>
                                <Textarea
                                  id={`subsection-prompt-${sectionIndex}-${subsectionIndex}`}
                                  value={subsection.prompt}
                                  onChange={e => updateSubsection(sectionIndex, subsectionIndex, { prompt: e.target.value })}
                                  placeholder="Enter prompt for this subsection"
                                  rows={2}
                                />
                              </div>
                            </div>

                            {/* Drop indicator below subsection */}
                            {showSubsectionDropIndicator && dragState.dragOverPosition === 'after' && (
                              <div className="absolute -bottom-1 left-4 right-0 z-10 h-0.5 rounded-full bg-blue-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Drop indicator below */}
              {showDropIndicator && dragState.dragOverPosition === 'after' && (
                <div className="absolute inset-x-0 -bottom-1 z-10 h-0.5 rounded-full bg-blue-500" />
              )}
            </div>
          );
        })}

        {dsl.sections.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              No sections yet. Click "Add Section" to start building your template.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
