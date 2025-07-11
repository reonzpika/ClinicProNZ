'use client';

import { Check, FileText, Mic, Type } from 'lucide-react';
import { useState } from 'react';

import type { Template } from '@/src/features/templates/types';
import { Button } from '@/src/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';

type DocumentationSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateId: string, inputMode: 'audio' | 'typed') => void;
  currentTemplateId: string;
  currentInputMode: 'audio' | 'typed';
  templates: Template[];
  isLoading: boolean;
};

export const DocumentationSettingsModal: React.FC<DocumentationSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentTemplateId,
  currentInputMode,
  templates,
  isLoading,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(currentTemplateId);
  const [selectedInputMode, setSelectedInputMode] = useState<'audio' | 'typed'>(currentInputMode);

  // Reset selections when modal opens
  const handleModalOpen = () => {
    setSelectedTemplateId(currentTemplateId);
    setSelectedInputMode(currentInputMode);
  };

  // Handle input mode selection (update state only)
  const handleInputModeChange = (newInputMode: 'audio' | 'typed') => {
    setSelectedInputMode(newInputMode);
    // Apply change immediately to badge
    onSave(selectedTemplateId, newInputMode);
  };

  // Handle template selection (update state only)
  const handleTemplateChange = (newTemplateId: string) => {
    setSelectedTemplateId(newTemplateId);
    // Apply change immediately to badge
    onSave(newTemplateId, selectedInputMode);
  };

  // Handle save
  const handleSave = () => {
    onSave(selectedTemplateId, selectedInputMode);
    onClose();
  };

  // Handle close without saving (for outside clicks or escape)
  const handleClose = () => {
    setSelectedTemplateId(currentTemplateId);
    setSelectedInputMode(currentInputMode);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex h-auto max-h-[90vh] max-w-lg flex-col border border-gray-200 bg-white shadow-xl" onOpenAutoFocus={handleModalOpen}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Documentation Settings
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Input Method Selection */}
          <div className="shrink-0">
            <h3 className="mb-2 text-sm font-medium text-gray-900">Input Method</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleInputModeChange('audio')}
                className={`flex-1 rounded-md border px-3 py-2 text-sm transition-all ${
                  selectedInputMode === 'audio'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Mic className="size-4" />
                  <span>Audio</span>
                  {selectedInputMode === 'audio' && <Check className="size-3" />}
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleInputModeChange('typed')}
                className={`flex-1 rounded-md border px-3 py-2 text-sm transition-all ${
                  selectedInputMode === 'typed'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Type className="size-4" />
                  <span>Typed</span>
                  {selectedInputMode === 'typed' && <Check className="size-3" />}
                </div>
              </button>
            </div>
          </div>

          {/* Template Selection */}
          <div className="flex min-h-0 flex-1 flex-col">
            <h3 className="mb-2 shrink-0 text-sm font-medium text-gray-900">Note Template</h3>
            {isLoading
              ? (
                  <div className="flex items-center justify-center py-4 text-sm text-gray-500">
                    Loading templates...
                  </div>
                )
              : (
                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {templates.map(template => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleTemplateChange(template.id)}
                        className={`w-full rounded-md border px-3 py-2 text-left transition-all ${
                          selectedTemplateId === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium text-gray-900">
                                {template.name}
                              </span>
                              <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                                {(template as any)._templateType || 'Default'}
                              </span>
                            </div>
                          </div>
                          {selectedTemplateId === template.id && (
                            <Check className="ml-2 size-3 shrink-0 text-blue-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
          </div>

          {/* Action Buttons */}
          <div className="flex shrink-0 gap-3 border-t pt-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
