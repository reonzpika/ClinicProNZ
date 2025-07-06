'use client';

import React, { useEffect, useState } from 'react';

import { Textarea } from '@/shared/components/ui/textarea';
import { useConsultation } from '@/shared/ConsultationContext';

import { ClinicalImageUpload } from './ClinicalImageUpload';

type ConsultationItem = {
  id: string;
  type: 'checklist' | 'differential-diagnosis' | 'acc-code' | 'other';
  title: string;
  content: string;
  timestamp: number;
};

type AdditionalNotesProps = {
  items: ConsultationItem[];
  onNotesChange: (notes: string) => void;
  notes: string;
  placeholder?: string;
  isMinimized?: boolean;
  defaultExpanded?: boolean;
  expandedSize?: 'normal' | 'large';
};

export const AdditionalNotes: React.FC<AdditionalNotesProps> = ({
  items,
  onNotesChange,
  notes,
  placeholder = 'Additional information gathered during consultation...',
  isMinimized = false,
  defaultExpanded = true,
  expandedSize = 'normal',
}) => {
  const { saveConsultationNotesToCurrentSession } = useConsultation();
  // Track processed items to avoid duplicates
  const [processedItemIds] = useState(new Set<string>());
  const [isExpanded, setIsExpanded] = useState(isMinimized ? false : defaultExpanded);
  const [lastSavedNotes, setLastSavedNotes] = useState('');

  // Sync expansion state with defaultExpanded prop changes (input mode changes)
  useEffect(() => {
    if (!isMinimized) {
      setIsExpanded(defaultExpanded);
    }
  }, [defaultExpanded, isMinimized]);

  // Initialize lastSavedNotes when component mounts
  useEffect(() => {
    setLastSavedNotes(notes);
  }, []);

  // Update lastSavedNotes when notes are loaded from session switching
  useEffect(() => {
    if (notes !== lastSavedNotes) {
      setLastSavedNotes(notes);
    }
  }, [notes, lastSavedNotes]);

  // Save consultation notes on blur (when user finishes editing)
  const handleNotesBlur = async () => {
    if (notes !== lastSavedNotes && notes.trim() !== '') {
      try {
        const success = await saveConsultationNotesToCurrentSession(notes);
        if (success) {
          setLastSavedNotes(notes);
        }
      } catch (error) {
        console.error('Failed to save consultation notes:', error);
      }
    }
  };

  // Auto-append new items to notes
  useEffect(() => {
    const newItems = items.filter(item => !processedItemIds.has(item.id));

    if (newItems.length > 0) {
      const newItemsText = newItems.map(item => `${item.title}: ${item.content}`).join('\n\n');
      const currentNotes = notes.trim();

      const updatedNotes = currentNotes
        ? `${currentNotes}\n\n${newItemsText}`
        : newItemsText;

      // Mark items as processed
      newItems.forEach(item => processedItemIds.add(item.id));

      onNotesChange(updatedNotes);
    }
  }, [items, notes, onNotesChange, processedItemIds]);

  // Handle text changes
  const handleTextChange = (newText: string) => {
    onNotesChange(newText);
  };

  // Character count display helper
  const renderCharacterCount = () => {
    if (!notes.trim()) {
      return null;
    }
    return (
      <span className="text-xs text-slate-500">
        (
        {notes.trim().length}
        {' '}
        chars)
      </span>
    );
  };

  // Minimized view (in documentation mode)
  if (isMinimized) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700">Additional Notes</span>
            {renderCharacterCount()}
          </div>
          <button
            type="button"
            className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
        {isExpanded && (
          <div className="space-y-3">
            <Textarea
              id="additional-notes-minimized"
              value={notes}
              onChange={e => handleTextChange(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder={placeholder}
              className="w-full resize-none rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              rows={4}
            />
            <ClinicalImageUpload
              isMinimized
              onImageAnalyzed={(filename, analysis) => {
                const analysisText = `\n\n--- AI Analysis of ${filename} ---\n${analysis}`;
                handleTextChange(notes + analysisText);
              }}
            />
            <p className="mt-1 text-xs text-slate-500">
              Information from clinical tools appears here
            </p>
          </div>
        )}
      </div>
    );
  }

  // Collapsed standard view
  if (!isExpanded) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Additional Notes (optional)</span>
            {renderCharacterCount()}
          </div>
          <button
            type="button"
            className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
            onClick={() => setIsExpanded(true)}
          >
            +
          </button>
        </div>
      </div>
    );
  }

  // Standard view
  if (expandedSize === 'large') {
    return (
      <div className="flex h-full flex-col">
        <div className="mb-3 flex items-center justify-between">
          <label htmlFor="additional-notes" className="text-sm font-medium text-slate-700">
            Additional Notes (optional)
          </label>
          <button
            type="button"
            className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
            onClick={() => setIsExpanded(false)}
          >
            −
          </button>
        </div>
        <div className="flex flex-1 flex-col space-y-3">
          <Textarea
            id="additional-notes"
            value={notes}
            onChange={e => handleTextChange(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder={placeholder}
            className="min-h-[200px] w-full flex-1 resize-none overflow-y-auto rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <ClinicalImageUpload
            isMinimized={false}
            onImageAnalyzed={(filename, analysis) => {
              const analysisText = `\n\n--- AI Analysis of ${filename} ---\n${analysis}`;
              handleTextChange(notes + analysisText);
            }}
          />
          <p className="text-xs text-slate-500">
            Information added from clinical tools will appear here and can be edited as needed.
          </p>
        </div>
      </div>
    );
  }

  // Normal sized view
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="additional-notes" className="text-sm font-medium text-slate-700">
          Additional Notes (optional)
        </label>
        <button
          type="button"
          className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
          onClick={() => setIsExpanded(false)}
        >
          −
        </button>
      </div>
      <Textarea
        id="additional-notes"
        value={notes}
        onChange={e => handleTextChange(e.target.value)}
        onBlur={handleNotesBlur}
        placeholder={placeholder}
        className="w-full resize-none rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        rows={8}
      />
      <ClinicalImageUpload
        isMinimized={false}
        onImageAnalyzed={(filename, analysis) => {
          const analysisText = `\n\n--- AI Analysis of ${filename} ---\n${analysis}`;
          handleTextChange(notes + analysisText);
        }}
      />
      <p className="text-xs text-slate-500">
        Information added from clinical tools will appear here and can be edited as needed.
      </p>
    </div>
  );
};
