import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';

import type { SectionDSL, Template, TemplateDSL, TemplateSettings } from '../types';

type TemplateFormProps = {
  template: Template;
  onChange: (updates: Partial<Template>) => void;
};

export function TemplateForm({ template, onChange }: TemplateFormProps) {
  const [dsl, setDsl] = useState<TemplateDSL>(template.dsl || { sections: [] });

  // Reset state when template changes (e.g., when creating a new template)
  useEffect(() => {
    setDsl(template.dsl || { sections: [] });
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
        investigations: false,
        followUp: false,
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

      // If section is being marked as optional, mark all subsections as optional
      if (updates.optional === true && currentSection.subsections) {
        newSections[index].subsections = currentSection.subsections.map(subsection => ({
          ...subsection,
          optional: true,
        }));
      }

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
  };

  const addSubsection = (sectionIndex: number) => {
    const newSubsection: SectionDSL = {
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

  const updateSubsection = (sectionIndex: number, subsectionIndex: number, updates: Partial<SectionDSL>) => {
    const newSections = [...dsl.sections];
    const currentSection = newSections[sectionIndex];
    if (currentSection?.subsections?.[subsectionIndex]) {
      const currentSubsection = currentSection.subsections[subsectionIndex];
      currentSection.subsections[subsectionIndex] = { ...currentSubsection, ...updates };

      // If any subsection is being marked as required, mark parent section as required
      if (updates.optional === false) {
        currentSection.optional = false;
      }

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

  // Get current settings with defaults
  const currentSettings = dsl.settings || getDefaultSettings();

  // Ensure components exist for backward compatibility
  const safeComponents = currentSettings.aiAnalysis.components || {
    differentialDiagnosis: false,
    assessmentSummary: false,
    managementPlan: false,
    redFlags: false,
    investigations: false,
    followUp: false,
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          {/* AI Analysis */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="aiAnalysis">AI Analysis</Label>
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
              <div className="space-y-4 rounded-lg border p-4">
                <div>
                  <Label className="text-sm font-medium">Analysis Components</Label>
                  <p className="text-sm text-muted-foreground">
                    Select which aspects of the consultation to analyze
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                      Management Plan
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

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="investigations"
                      checked={safeComponents.investigations}
                      onCheckedChange={checked =>
                        updateSettings({
                          aiAnalysis: {
                            ...currentSettings.aiAnalysis,
                            components: {
                              ...safeComponents,
                              investigations: checked,
                            },
                          },
                        })}
                    />
                    <Label htmlFor="investigations" className="text-sm">
                      Investigations
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="followUp"
                      checked={safeComponents.followUp}
                      onCheckedChange={checked =>
                        updateSettings({
                          aiAnalysis: {
                            ...currentSettings.aiAnalysis,
                            components: {
                              ...safeComponents,
                              followUp: checked,
                            },
                          },
                        })}
                    />
                    <Label htmlFor="followUp" className="text-sm">
                      Follow-up Plan
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
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Template Sections</Label>
          <Button type="button" onClick={addSection} size="sm">
            Add Section
          </Button>
        </div>

        {dsl.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Section
                {' '}
                {sectionIndex + 1}
              </h4>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeSection(sectionIndex)}
              >
                Remove
              </Button>
            </div>

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

              {section.subsections?.map((subsection, subsectionIndex) => (
                <div key={subsectionIndex} className="ml-4 space-y-2 rounded border p-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">
                      Subsection
                      {' '}
                      {subsectionIndex + 1}
                    </h5>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeSubsection(sectionIndex, subsectionIndex)}
                    >
                      Remove
                    </Button>
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

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`subsection-optional-${sectionIndex}-${subsectionIndex}`}
                      checked={subsection.optional || false}
                      onCheckedChange={checked => updateSubsection(sectionIndex, subsectionIndex, { optional: checked })}
                    />
                    <Label htmlFor={`subsection-optional-${sectionIndex}-${subsectionIndex}`} className="text-sm">
                      Optional subsection
                    </Label>
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
              ))}
            </div>
          </div>
        ))}

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
