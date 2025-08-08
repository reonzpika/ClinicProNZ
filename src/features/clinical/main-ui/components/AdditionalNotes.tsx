'use client';

import React, { useEffect, useState } from 'react';

import { ExaminationChecklistButton } from '@/src/features/clinical/examination-checklist/components/ExaminationChecklistButton';
import { PlanSafetyNettingButton } from '@/src/features/clinical/plan-safety-netting';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Textarea } from '@/src/shared/components/ui/textarea';

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
  const { saveConsultationNotesToCurrentSession } = useConsultationStores();
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
    const hasNotes = notes && notes.trim().length > 0;
    const hasItems = items && items.length > 0;
    const itemsPreview = hasItems ? items.map(item => item.title).join(', ') : '';
    const notesPreview = hasNotes ? notes.substring(0, 100) : '';
    const needsNotesTruncation = hasNotes && notes.length > 100;
    const needsItemsTruncation = itemsPreview.length > 60;
    const displayItemsPreview = needsItemsTruncation ? `${itemsPreview.substring(0, 60)}...` : itemsPreview;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-sm">📝</span>
              <span className="text-xs font-medium text-slate-700">Additional Notes</span>
            </div>
            {(hasNotes || hasItems) && (
              <span className="text-xs text-slate-500">
                {hasItems && `${items.length} item${items.length !== 1 ? 's' : ''}`}
                {hasItems && hasNotes && ', '}
                {hasNotes && `${notes.length} chars`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <ExaminationChecklistButton />
            <PlanSafetyNettingButton />
            <button
              type="button"
              className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? '−' : '+'}
            </button>
          </div>
        </div>

        {/* Preview when collapsed */}
        {!isExpanded && (hasItems || hasNotes) && (
          <div className="space-y-2 rounded border border-slate-200 bg-slate-50 p-2">
            {/* Consultation items summary */}
            {hasItems && (
              <div className="text-sm">
                <span className="font-medium text-slate-700">Items: </span>
                <span className="text-slate-600">{displayItemsPreview}</span>
              </div>
            )}

            {/* Notes preview */}
            {hasNotes && (
              <div className="text-sm leading-relaxed text-slate-700">
                <span className="font-medium">Notes: </span>
                {notesPreview}
                {needsNotesTruncation && (
                  <span className="text-slate-500">
                    ...
                    {' '}
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      (click to expand)
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* No content state */}
        {!isExpanded && !hasItems && !hasNotes && (
          <div className="rounded border border-slate-200 bg-slate-50 p-2">
            <div className="text-sm italic text-slate-500">
              No additional notes or items yet...
            </div>
          </div>
        )}

        {/* Full editing interface when expanded */}
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
            <p className="mt-1 text-xs text-slate-500">
              Information from clinical tools appears here and can be edited as needed.
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
          <div className="flex items-center gap-1">
            <ExaminationChecklistButton />
            <PlanSafetyNettingButton />
            <button
              type="button"
              className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
              onClick={() => setIsExpanded(true)}
            >
              +
            </button>
          </div>
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
          <div className="flex items-center gap-1">
            <ExaminationChecklistButton />
            <PlanSafetyNettingButton />
            <button
              type="button"
              className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
              onClick={() => setIsExpanded(false)}
            >
              −
            </button>
          </div>
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
        <div className="flex items-center gap-1">
          <ExaminationChecklistButton />
          <PlanSafetyNettingButton />
          <button
            type="button"
            className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
            onClick={() => setIsExpanded(false)}
          >
            −
          </button>
        </div>
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
      <p className="text-xs text-slate-500">
        Information added from clinical tools will appear here and can be edited as needed.
      </p>
    </div>
  );
};
