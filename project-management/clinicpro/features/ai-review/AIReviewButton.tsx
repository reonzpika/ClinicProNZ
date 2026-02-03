// src/features/clinical/ai-review/components/AIReviewButton.tsx
'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/button';
import { AIReviewModal } from './AIReviewModal';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';

export function AIReviewButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  
  const {
    problemsText,
    objectiveText,
    assessmentText,
    planText,
  } = useConsultationStores();

  // Check if there's content to review
  const hasContent = Boolean(
    problemsText?.trim() || 
    objectiveText?.trim() || 
    assessmentText?.trim() || 
    planText?.trim()
  );

  const handleModuleSelect = (moduleType: string) => {
    setSelectedModule(moduleType);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedModule(null);
  };

  return (
    <>
      {/* AI Review Button - matches camera/referral icon style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!hasContent}
        className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
          hasContent
            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title="AI Clinical Review"
        type="button"
      >
        <Sparkles className="w-5 h-5" />
      </button>

      {/* Module Selection Panel - shows when button clicked */}
      {isOpen && !selectedModule && (
        <div className="mt-2 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Select Review Type
          </h3>
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleModuleSelect('red_flags')}
              className="w-full justify-start text-left h-auto py-3 px-4"
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
              className="w-full justify-start text-left h-auto py-3 px-4"
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
              className="w-full justify-start text-left h-auto py-3 px-4"
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
              className="w-full justify-start text-left h-auto py-3 px-4"
            >
              <span className="mr-2">💊</span>
              <div>
                <div className="font-medium">Management Review</div>
                <div className="text-xs text-slate-500">
                  Treatment, advice & safety netting
                </div>
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* Modal for showing AI response */}
      {selectedModule && (
        <AIReviewModal
          isOpen={true}
          onClose={handleClose}
          reviewType={selectedModule}
          noteContent={{
            problemsText: problemsText || '',
            objectiveText: objectiveText || '',
            assessmentText: assessmentText || '',
            planText: planText || '',
          }}
        />
      )}
    </>
  );
}
