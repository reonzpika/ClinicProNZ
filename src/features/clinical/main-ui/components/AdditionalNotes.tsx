'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { ExaminationChecklistButton } from '@/src/features/clinical/examination-checklist/components/ExaminationChecklistButton';
import { PlanSafetyNettingButton } from '@/src/features/clinical/plan-safety-netting';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Textarea } from '@/src/shared/components/ui/textarea';
import { parseSectionedNotes, serializeSectionedNotes } from '@/src/features/clinical/main-ui/utils/consultationNotesSerializer';

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

  // Local section states derived from notes string
  const initialSections = useMemo(() => parseSectionedNotes(notes), [notes]);
  const [problemsText, setProblemsText] = useState<string>(initialSections.problems);
  const [objectiveText, setObjectiveText] = useState<string>(initialSections.objective);
  const [assessmentText, setAssessmentText] = useState<string>(initialSections.assessment);
  const [planText, setPlanText] = useState<string>(initialSections.plan);

  // Sync expansion state with defaultExpanded prop changes (input mode changes)
  useEffect(() => {
    if (!isMinimized) {
      setIsExpanded(defaultExpanded);
    }
  }, [defaultExpanded, isMinimized]);

  // Initialize lastSavedNotes and local sections when component mounts
  useEffect(() => {
    setLastSavedNotes(notes);
  }, []);

  // Update local sections and lastSavedNotes when notes are loaded from session switching
  useEffect(() => {
    if (notes !== lastSavedNotes) {
      const s = parseSectionedNotes(notes);
      setProblemsText(s.problems);
      setObjectiveText(s.objective);
      setAssessmentText(s.assessment);
      setPlanText(s.plan);
      setLastSavedNotes(notes);
    }
  }, [notes, lastSavedNotes]);

  // Save consultation notes on blur (when user finishes editing)
  const handleNotesBlur = async () => {
    const serialized = serializeSectionedNotes({
      problems: problemsText,
      objective: objectiveText,
      assessment: assessmentText,
      plan: planText,
    });
    if (serialized !== lastSavedNotes && serialized.trim() !== '') {
      try {
        const success = await saveConsultationNotesToCurrentSession(serialized);
        if (success) {
          setLastSavedNotes(serialized);
        }
      } catch (error) {
        console.error('Failed to save consultation notes:', error);
      }
    }
  };

  // Auto-append new items to appropriate sections
  useEffect(() => {
    const newItems = items.filter(item => !processedItemIds.has(item.id));
    if (newItems.length === 0) {
      return;
    }
    // Route items by type/title and avoid adding duplicates already present in sections
    const isPlanItem = (title: string) => /plan|safety[- ]?net/i.test(title);
    const toLine = (i: any) => `${i.title}: ${i.content}`;

    const objAdds = newItems
      .filter(i => (i.type === 'checklist' || i.type === 'other' || i.type === 'acc-code') && !isPlanItem(i.title))
      .map(toLine)
      .filter(line => !objectiveText.includes(line));
    const asmtAdds = newItems
      .filter(i => i.type === 'differential-diagnosis')
      .map(toLine)
      .filter(line => !assessmentText.includes(line));
    const planAdds = newItems
      .filter(i => isPlanItem(i.title))
      .map(toLine)
      .filter(line => !planText.includes(line));

    if (objAdds.length === 0 && asmtAdds.length === 0 && planAdds.length === 0) {
      // still mark processed to avoid future work
      newItems.forEach(item => processedItemIds.add(item.id));
      return;
    }

    const nextObjective = objAdds.length > 0
      ? [objectiveText.trim(), objAdds.join('\n\n')].filter(Boolean).join('\n\n')
      : objectiveText;
    const nextAssessment = asmtAdds.length > 0
      ? [assessmentText.trim(), asmtAdds.join('\n\n')].filter(Boolean).join('\n\n')
      : assessmentText;
    const nextPlan = planAdds.length > 0
      ? [planText.trim(), planAdds.join('\n\n')].filter(Boolean).join('\n\n')
      : planText;

    // Mark items as processed
    newItems.forEach(item => processedItemIds.add(item.id));

    setObjectiveText(nextObjective);
    setAssessmentText(nextAssessment);
    setPlanText(nextPlan);
    const serialized = serializeSectionedNotes({
      problems: problemsText,
      objective: nextObjective,
      assessment: nextAssessment,
      plan: nextPlan,
    });
    if (serialized !== lastSavedNotes) {
      onNotesChange(serialized);
    }
  }, [items, objectiveText, assessmentText, planText, problemsText, lastSavedNotes, onNotesChange, processedItemIds]);

  // Handle text changes per section
  const handleSectionChange = (section: 'problems' | 'objective' | 'assessment' | 'plan', newText: string) => {
    if (section === 'problems') setProblemsText(newText);
    if (section === 'objective') setObjectiveText(newText);
    if (section === 'assessment') setAssessmentText(newText);
    if (section === 'plan') setPlanText(newText);
    const serialized = serializeSectionedNotes({
      problems: section === 'problems' ? newText : problemsText,
      objective: section === 'objective' ? newText : objectiveText,
      assessment: section === 'assessment' ? newText : assessmentText,
      plan: section === 'plan' ? newText : planText,
    });
    onNotesChange(serialized);
  };

  // Character count display helper
  const renderCharacterCount = () => {
    const anyContent = [problemsText, objectiveText, assessmentText, planText].some(s => s && s.trim());
    if (!anyContent) {
      return null;
    }
    return (
      <span className="text-xs text-slate-500">
        (
        {serializeSectionedNotes({ problems: problemsText, objective: objectiveText, assessment: assessmentText, plan: planText }).trim().length}
        {' '}
        chars)
      </span>
    );
  };

  // Minimized view (in documentation mode)
  if (isMinimized) {
    const serialized = serializeSectionedNotes({ problems: problemsText, objective: objectiveText, assessment: assessmentText, plan: planText });
    const hasNotes = serialized && serialized.trim().length > 0;
    const hasItems = items && items.length > 0;
    const itemsPreview = hasItems ? items.map(item => item.title).join(', ') : '';
    const notesPreview = hasNotes ? serialized.substring(0, 100) : '';
    const needsNotesTruncation = hasNotes && serialized.length > 100;
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
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Problems</label>
                <Textarea
                  id="additional-notes-minimized-problems"
                  value={problemsText}
                  onChange={e => handleSectionChange('problems', e.target.value)}
                  onBlur={handleNotesBlur}
                  placeholder="List problems..."
                  className="w-full resize-none rounded border border-slate-200 p-2 text-xs leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Objective</label>
                <Textarea
                  id="additional-notes-minimized-objective"
                  value={objectiveText}
                  onChange={e => handleSectionChange('objective', e.target.value)}
                  onBlur={handleNotesBlur}
                  placeholder={placeholder}
                  className="w-full resize-none rounded border border-slate-200 p-2 text-xs leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={3}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Assessment</label>
                <Textarea
                  id="additional-notes-minimized-assessment"
                  value={assessmentText}
                  onChange={e => handleSectionChange('assessment', e.target.value)}
                  onBlur={handleNotesBlur}
                  placeholder="Assessment..."
                  className="w-full resize-none rounded border border-slate-200 p-2 text-xs leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Plan</label>
                <Textarea
                  id="additional-notes-minimized-plan"
                  value={planText}
                  onChange={e => handleSectionChange('plan', e.target.value)}
                  onBlur={handleNotesBlur}
                  placeholder="Plan..."
                  className="w-full resize-none rounded border border-slate-200 p-2 text-xs leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={2}
                />
              </div>
            </div>
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
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Problems</label>
              <Textarea
                id="additional-notes-problems"
                value={problemsText}
                onChange={e => handleSectionChange('problems', e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="List problems..."
                className="min-h-[60px] w-full resize-none overflow-y-auto rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Objective</label>
              <Textarea
                id="additional-notes-objective"
                value={objectiveText}
                onChange={e => handleSectionChange('objective', e.target.value)}
                onBlur={handleNotesBlur}
                placeholder={placeholder}
                className="min-h-[120px] w-full resize-none overflow-y-auto rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Assessment</label>
              <Textarea
                id="additional-notes-assessment"
                value={assessmentText}
                onChange={e => handleSectionChange('assessment', e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Assessment..."
                className="min-h-[80px] w-full resize-none overflow-y-auto rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Plan</label>
              <Textarea
                id="additional-notes-plan"
                value={planText}
                onChange={e => handleSectionChange('plan', e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Plan..."
                className="min-h-[80px] w-full resize-none overflow-y-auto rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Information added from clinical tools will appear in Objective/Assessment/Plan and can be edited.
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
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Problems</label>
          <Textarea
            id="additional-notes"
            value={problemsText}
            onChange={e => handleSectionChange('problems', e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="List problems..."
            className="w-full resize-none rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            rows={3}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Objective</label>
          <Textarea
            id="additional-notes-objective"
            value={objectiveText}
            onChange={e => handleSectionChange('objective', e.target.value)}
            onBlur={handleNotesBlur}
            placeholder={placeholder}
            className="w-full resize-none rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            rows={5}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Assessment</label>
          <Textarea
            id="additional-notes-assessment"
            value={assessmentText}
            onChange={e => handleSectionChange('assessment', e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Assessment..."
            className="w-full resize-none rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            rows={4}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Plan</label>
          <Textarea
            id="additional-notes-plan"
            value={planText}
            onChange={e => handleSectionChange('plan', e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Plan..."
            className="w-full resize-none rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            rows={4}
          />
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Information added from clinical tools will appear in Objective/Assessment/Plan and can be edited.
      </p>
    </div>
  );
};
