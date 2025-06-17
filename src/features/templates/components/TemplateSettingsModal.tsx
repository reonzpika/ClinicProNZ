'use client';

import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { useConsultation } from '@/shared/ConsultationContext';

import type { Template, TemplateSettings } from '../types';

interface TemplateSettingsDropdownProps {
  selectedTemplate: Template;
}

export const TemplateSettingsDropdown: React.FC<TemplateSettingsDropdownProps> = ({ 
  selectedTemplate 
}) => {
  const { settingsOverride, updateSettingsOverride, clearSettingsOverride } = useConsultation();

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 min-w-0 rounded border bg-white px-2 py-1 text-xs hover:bg-gray-100 ${hasOverrides ? 'border-blue-500 bg-blue-50' : ''}`}
          title="Template Settings"
        >
          <Settings className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="w-80 p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Template Settings</h4>
            {hasOverrides && (
              <button
                onClick={resetToDefaults}
                className="text-xs text-blue-600 transition-colors hover:text-blue-800 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* AI Analysis Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-analysis-enabled" className="text-sm font-medium text-gray-700">
                AI Analysis
              </Label>
              <Switch
                id="ai-analysis-enabled"
                checked={effectiveSettings.aiAnalysis.enabled}
                onCheckedChange={checked => updateAIAnalysis({ enabled: checked })}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>

            {effectiveSettings.aiAnalysis.enabled && (
              <div className="space-y-3 pl-3 border-l-2 border-blue-100">
                {/* AI Components */}
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-2 block">
                    Components
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="differential-diagnosis"
                        checked={effectiveSettings.aiAnalysis.components.differentialDiagnosis}
                        onCheckedChange={checked =>
                          updateAIAnalysis({
                            components: {
                              ...effectiveSettings.aiAnalysis.components,
                              differentialDiagnosis: checked,
                            },
                          })}
                        className="data-[state=checked]:bg-blue-600 scale-75"
                      />
                      <Label htmlFor="differential-diagnosis" className="text-xs text-gray-600">
                        Differential Diagnosis
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id="management-plan"
                        checked={effectiveSettings.aiAnalysis.components.managementPlan}
                        onCheckedChange={checked =>
                          updateAIAnalysis({
                            components: {
                              ...effectiveSettings.aiAnalysis.components,
                              managementPlan: checked,
                            },
                          })}
                        className="data-[state=checked]:bg-blue-600 scale-75"
                      />
                      <Label htmlFor="management-plan" className="text-xs text-gray-600">
                        Management Plan
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Analysis Detail Level */}
                <div>
                  <Label className="text-xs font-medium text-gray-700 mb-2 block">
                    Detail Level
                  </Label>
                  <Select
                    value={effectiveSettings.aiAnalysis.level}
                    onValueChange={(value: 'low' | 'medium' | 'high') =>
                      updateAIAnalysis({ level: value })}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low" className="text-xs">Low</SelectItem>
                      <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                      <SelectItem value="high" className="text-xs">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 