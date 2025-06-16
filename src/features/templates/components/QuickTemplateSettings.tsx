import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { useConsultation } from '@/shared/ConsultationContext';

import type { Template, TemplateSettings } from '../types';

type QuickTemplateSettingsProps = {
  selectedTemplate: Template | null;
};

export function QuickTemplateSettings({ selectedTemplate }: QuickTemplateSettingsProps) {
  const { settingsOverride, updateSettingsOverride, clearSettingsOverride } = useConsultation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get default settings
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

  // Get current effective settings (template + override)
  const templateSettings = selectedTemplate?.dsl?.settings || defaultSettings;
  const effectiveSettings: TemplateSettings = {
    ...templateSettings,
    ...settingsOverride,
    aiAnalysis: {
      ...templateSettings.aiAnalysis,
      ...(settingsOverride?.aiAnalysis || {}),
      components: {
        ...templateSettings.aiAnalysis.components,
        ...(settingsOverride?.aiAnalysis?.components || {}),
      },
    },
  };

  // Track if settings have been modified
  const [hasOverrides, setHasOverrides] = useState(false);

  useEffect(() => {
    setHasOverrides(settingsOverride !== null && settingsOverride !== undefined && Object.keys(settingsOverride).length > 0);
  }, [settingsOverride]);

  // Helper to update AI analysis settings
  const updateAIAnalysis = (updates: Partial<TemplateSettings['aiAnalysis']>) => {
    updateSettingsOverride({
      aiAnalysis: {
        ...effectiveSettings.aiAnalysis,
        ...updates,
        components: {
          ...effectiveSettings.aiAnalysis.components,
          ...(updates.components || {}),
        },
      },
    });
  };

  // Reset to template defaults
  const resetToDefaults = () => {
    clearSettingsOverride();
  };

  // Get AI components summary for dropdown
  const getAIComponentsSummary = () => {
    const components = effectiveSettings.aiAnalysis.components;
    const enabledComponents = Object.entries(components)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => {
        switch (key) {
          case 'differentialDiagnosis': return 'Differential';
          case 'managementPlan': return 'Management';
          default: return key;
        }
      });

    if (enabledComponents.length === 0) {
      return 'None selected';
    }
    if (enabledComponents.length === 2) {
      return 'All components';
    }
    return enabledComponents.join(', ');
  };

  if (!selectedTemplate) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Collapsible Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:bg-muted/50"
        >
          {isExpanded
            ? (
                <ChevronDown className="size-3 text-muted-foreground" />
              )
            : (
                <ChevronRight className="size-3 text-muted-foreground" />
              )}
          <Label className="cursor-pointer text-xs font-medium text-muted-foreground">
            Quick Template Settings
          </Label>
          {hasOverrides && (
            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">
              Modified
            </span>
          )}
        </button>
        {hasOverrides && (
          <button
            onClick={resetToDefaults}
            className="text-[10px] text-blue-600 transition-colors hover:text-blue-800 hover:underline"
          >
            Reset to Template
          </button>
        )}
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="space-y-2 pl-4">
          {/* Main Settings - Inline Layout */}
          <div className="flex flex-wrap items-center gap-3">

            {/* AI Analysis - All in One Line */}
            <div className="flex items-center gap-1.5">
              <Label htmlFor="quick-ai-analysis" className="whitespace-nowrap text-xs text-muted-foreground">
                AI Analysis:
              </Label>
              <Switch
                id="quick-ai-analysis"
                checked={effectiveSettings.aiAnalysis.enabled}
                onCheckedChange={checked => updateAIAnalysis({ enabled: checked })}
                className="scale-75 data-[state=checked]:bg-blue-600"
              />

              {/* AI Components and Analysis Detail - Inline when enabled */}
              {effectiveSettings.aiAnalysis.enabled && (
                <>
                  <Label className="whitespace-nowrap text-xs text-muted-foreground">
                    Components:
                  </Label>
                  <Select
                    value={getAIComponentsSummary()}
                    onValueChange={() => {}} // Handled by individual switches below
                  >
                    <SelectTrigger className="h-6 w-32 border-muted-foreground/20 text-xs transition-colors hover:border-muted-foreground/40">
                      <SelectValue placeholder="Select components" />
                    </SelectTrigger>
                    <SelectContent className="w-48">
                      <div className="space-y-2 p-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="dropdown-ddx"
                            checked={effectiveSettings.aiAnalysis.components.differentialDiagnosis}
                            onCheckedChange={checked =>
                              updateAIAnalysis({
                                components: {
                                  ...effectiveSettings.aiAnalysis.components,
                                  differentialDiagnosis: checked,
                                },
                              })}
                            className="scale-75 data-[state=checked]:bg-blue-600"
                          />
                          <Label htmlFor="dropdown-ddx" className="cursor-pointer text-xs">
                            Differential Diagnosis
                          </Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            id="dropdown-management"
                            checked={effectiveSettings.aiAnalysis.components.managementPlan}
                            onCheckedChange={checked =>
                              updateAIAnalysis({
                                components: {
                                  ...effectiveSettings.aiAnalysis.components,
                                  managementPlan: checked,
                                },
                              })}
                            className="scale-75 data-[state=checked]:bg-blue-600"
                          />
                          <Label htmlFor="dropdown-management" className="cursor-pointer text-xs">
                            Management Plan
                          </Label>
                        </div>

                      </div>
                    </SelectContent>
                  </Select>

                  <Label htmlFor="quick-ai-level" className="whitespace-nowrap text-xs text-muted-foreground">
                    Analysis Detail:
                  </Label>
                  <Select
                    value={effectiveSettings.aiAnalysis.level}
                    onValueChange={(value: 'low' | 'medium' | 'high') =>
                      updateAIAnalysis({ level: value })}
                  >
                    <SelectTrigger className="h-6 w-16 border-muted-foreground/20 text-xs transition-colors hover:border-muted-foreground/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low" className="text-xs">Low</SelectItem>
                      <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                      <SelectItem value="high" className="text-xs">High</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
