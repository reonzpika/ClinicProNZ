'use client';

import { Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Button } from '@/src/shared/components/ui/button';

import { AIReviewModal } from './AIReviewModal';

export function AIReviewButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const generatingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    problemsText,
    objectiveText,
    assessmentText,
    planText,
    generatedNotes,
  } = useConsultationStores();

  const hasSoapContent = Boolean(
    problemsText?.trim()
    || objectiveText?.trim()
    || assessmentText?.trim()
    || planText?.trim(),
  );
  const hasGeneratedNotes = Boolean(generatedNotes?.trim());
  const hasContent = hasSoapContent || hasGeneratedNotes;

  const handleModuleSelect = (moduleType: string) => {
    if (isGenerating) {
 return;
}
    setIsGenerating(true);
    setSelectedModule(moduleType);
    setIsOpen(true);
    if (generatingTimeoutRef.current) {
 clearTimeout(generatingTimeoutRef.current);
}
    generatingTimeoutRef.current = setTimeout(() => setIsGenerating(false), 30000);
  };

  const handleClose = () => {
    if (generatingTimeoutRef.current) {
      clearTimeout(generatingTimeoutRef.current);
      generatingTimeoutRef.current = null;
    }
    setIsGenerating(false);
    setIsOpen(false);
    setSelectedModule(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={!hasContent}
        title="AI Clinical Review"
        className={`flex size-9 items-center justify-center rounded-md border border-slate-200 transition-colors ${
          hasContent
            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            : 'cursor-not-allowed bg-gray-100 text-gray-400'
        } ${isOpen && !selectedModule ? 'ring-2 ring-blue-200' : ''}`}
      >
        <Sparkles size={16} />
      </button>

      {isOpen && !selectedModule && (
        <div className="w-full basis-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-medium text-slate-700">
            Select Review Type
          </h3>
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleModuleSelect('red_flags')}
              className="h-auto w-full justify-start px-4 py-3 text-left"
            >
              <span className="mr-2">🚩</span>
              <div>
                <div className="font-medium">Red Flags Scanner</div>
                <div className="text-xs text-slate-500">
                  Check for must-not-miss diagnoses
                </div>
              </div>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleModuleSelect('ddx')}
              className="h-auto w-full justify-start px-4 py-3 text-left"
            >
              <span className="mr-2">🔬</span>
              <div>
                <div className="font-medium">Differential Diagnosis</div>
                <div className="text-xs text-slate-500">
                  Alternative diagnoses to consider
                </div>
              </div>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleModuleSelect('investigations')}
              className="h-auto w-full justify-start px-4 py-3 text-left"
            >
              <span className="mr-2">🧪</span>
              <div>
                <div className="font-medium">Investigation Advisor</div>
                <div className="text-xs text-slate-500">
                  Suggested investigations
                </div>
              </div>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleModuleSelect('management')}
              className="h-auto w-full justify-start px-4 py-3 text-left"
            >
              <span className="mr-2">💊</span>
              <div>
                <div className="font-medium">Management Review</div>
                <div className="text-xs text-slate-500">
                  Treatment, advice and safety netting
                </div>
              </div>
            </Button>
          </div>
        </div>
      )}

      {selectedModule && (
        <AIReviewModal
          isOpen
          onClose={handleClose}
          reviewType={selectedModule}
          noteContent={
            hasSoapContent
              ? {
                  problemsText: problemsText ?? '',
                  objectiveText: objectiveText ?? '',
                  assessmentText: assessmentText ?? '',
                  planText: planText ?? '',
                }
              : {
                  problemsText: generatedNotes ?? '',
                  objectiveText: '',
                  assessmentText: '',
                  planText: '',
                }
          }
        />
      )}
    </>
  );
}
