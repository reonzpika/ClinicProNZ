'use client';

import { FileText } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { ExaminationChecklistButton } from '@/src/features/clinical/examination-checklist/components/ExaminationChecklistButton';
import { PlanSafetyNettingButton } from '@/src/features/clinical/plan-safety-netting';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Textarea } from '@/src/shared/components/ui/textarea';
// Persist per-section fields only

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
  onNotesChange: _onNotesChange,
  notes: _notes,
  placeholder: _placeholder,
  isMinimized = false,
  defaultExpanded = true,
  expandedSize = 'normal',
}) => {
  // Track processed items to avoid duplicates
  const processedItemIds = React.useRef(new Set<string>());
  const [isExpanded, setIsExpanded] = useState(isMinimized ? false : defaultExpanded);

  // Refs for keyboard focus management
  const problemsRef = React.useRef<HTMLTextAreaElement | null>(null);
  const objectiveRef = React.useRef<HTMLTextAreaElement | null>(null);
  const assessmentRef = React.useRef<HTMLTextAreaElement | null>(null);
  const planRef = React.useRef<HTMLTextAreaElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Keydown handler to cycle focus within SOAP textareas only
  const handleTextareaKeyDown = (
    section: 'problems' | 'objective' | 'assessment' | 'plan',
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key !== 'Tab') {
      return;
    }
    e.preventDefault();
    const forward = !e.shiftKey;
    let next: HTMLTextAreaElement | null | undefined;
    if (forward) {
      if (section === 'problems') {
 next = objectiveRef.current;
} else if (section === 'objective') {
 next = assessmentRef.current;
} else if (section === 'assessment') {
 next = planRef.current;
} else {
 next = problemsRef.current;
}
    } else {
      if (section === 'problems') {
 next = planRef.current;
} else if (section === 'objective') {
 next = problemsRef.current;
} else if (section === 'assessment') {
 next = objectiveRef.current;
} else {
 next = assessmentRef.current;
}
    }
    try {
      next?.focus();
    } catch {}
  };

  // Auto-focus Problems when expanding the section
  useEffect(() => {
    if (isExpanded && problemsRef.current) {
      try {
        problemsRef.current.focus();
      } catch {}
    }
  }, [isExpanded]);

  // Document-level Tab trap: when editor is visible and focus is outside, Tab focuses Problems (or Plan with Shift)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isExpanded || e.key !== 'Tab') {
 return;
}
      const container = containerRef.current;
      if (!container) {
 return;
}
      const active = document.activeElement as HTMLElement | null;
      const isInside = !!(active && container.contains(active));
      if (isInside) {
 return;
} // let internal handler manage cycling
      e.preventDefault();
      try {
        if (e.shiftKey) {
          (planRef.current
            || (container.querySelector('#additional-notes-plan') as HTMLTextAreaElement | null)
            || (container.querySelector('#additional-notes-minimized-plan') as HTMLTextAreaElement | null)
          )?.focus();
        } else {
          (problemsRef.current
            || (container.querySelector('#additional-notes') as HTMLTextAreaElement | null)
            || (container.querySelector('#additional-notes-problems') as HTMLTextAreaElement | null)
            || (container.querySelector('#additional-notes-minimized-problems') as HTMLTextAreaElement | null)
          )?.focus();
        }
      } catch {}
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [isExpanded]);

  // Section state is maintained in the store now
  const {
    problemsText,
    objectiveText,
    assessmentText,
    planText,
    setProblemsText,
    setObjectiveText,
    setAssessmentText,
    setPlanText,
    saveProblemsToCurrentSession,
    saveObjectiveToCurrentSession,
    saveAssessmentToCurrentSession,
    savePlanToCurrentSession,
  } = useConsultationStores();

  // Sync expansion state with defaultExpanded prop changes (input mode changes)
  useEffect(() => {
    if (!isMinimized) {
      setIsExpanded(defaultExpanded);
    }
  }, [defaultExpanded, isMinimized]);

  // Save individual section on blur
  const handleSectionBlur = async (section: 'problems' | 'objective' | 'assessment' | 'plan') => {
    let ok = true;
    try {
      switch (section) {
        case 'problems':
          ok = await saveProblemsToCurrentSession(problemsText || '');
          break;
        case 'objective':
          ok = await saveObjectiveToCurrentSession(objectiveText || '');
          break;
        case 'assessment':
          ok = await saveAssessmentToCurrentSession(assessmentText || '');
          break;
        case 'plan':
          ok = await savePlanToCurrentSession(planText || '');
          break;
      }
    } catch (error) {
      ok = false;
      console.error(`Failed to save ${section} section:`, error);
    }
    try {
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast[ok ? 'success' : 'error'](ok ? `${section} saved` : `Failed to save ${section}`);
      }
    } catch {}
  };

  // Auto-append new items to appropriate sections
  useEffect(() => {
    const newItems = items.filter(item => !processedItemIds.current.has(item.id));
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
      newItems.forEach(item => processedItemIds.current.add(item.id));
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
    newItems.forEach(item => processedItemIds.current.add(item.id));

    setObjectiveText(nextObjective);
    setAssessmentText(nextAssessment);
    setPlanText(nextPlan);
    // No longer writing JSON back through onNotesChange
  }, [items]);

  // Debounced autosave per section
  type DebounceEntry = { id: ReturnType<typeof setTimeout>; token: number };
  const debounceTimers = useRef<Record<string, DebounceEntry>>({});
  const debounceMs = 1200;

  const enqueueSave = (section: 'problems' | 'objective' | 'assessment' | 'plan') => {
    const key = `save-${section}`;
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key].id);
    }
    const token = Date.now();
    const id = setTimeout(async () => {
      // Only commit if this timer is still the latest for this key
      if (debounceTimers.current[key] && debounceTimers.current[key].token !== token) {
        return;
      }
      try {
        switch (section) {
          case 'problems':
            await saveProblemsToCurrentSession(problemsText || '');
            break;
          case 'objective':
            await saveObjectiveToCurrentSession(objectiveText || '');
            break;
          case 'assessment':
            await saveAssessmentToCurrentSession(assessmentText || '');
            break;
          case 'plan':
            await savePlanToCurrentSession(planText || '');
            break;
        }
      } catch {}
    }, debounceMs) as unknown as ReturnType<typeof setTimeout>;
    debounceTimers.current[key] = { id, token };
  };

  // Handle text changes per section
  const handleSectionChange = (section: 'problems' | 'objective' | 'assessment' | 'plan', newText: string) => {
    if (section === 'problems') {
 setProblemsText(newText);
}
    if (section === 'objective') {
 setObjectiveText(newText);
}
    if (section === 'assessment') {
 setAssessmentText(newText);
}
    if (section === 'plan') {
 setPlanText(newText);
}
    enqueueSave(section);
    // No longer writing JSON back through onNotesChange
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
        {(problemsText + objectiveText + assessmentText + planText).trim().length}
        {' '}
        chars)
      </span>
    );
  };

  // Minimized view (in documentation mode)
  if (isMinimized) {
    const hasNotes = [problemsText, objectiveText, assessmentText, planText].some(s => s && s.trim().length > 0);
    const hasItems = items && items.length > 0;
    const itemsPreview = hasItems ? items.map(item => item.title).join(', ') : '';
    const combined = [problemsText, objectiveText, assessmentText, planText].filter(Boolean).join(' ').trim();
    const notesPreview = hasNotes ? combined.substring(0, 100) : '';
    const needsNotesTruncation = hasNotes && combined.length > 100;
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
                {hasNotes && `${combined.length} chars`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
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
                      type="button"
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
          <div className="space-y-3" ref={containerRef} role="group" aria-label="Additional notes editor">
            <div className="space-y-3">
              <div>
                <label htmlFor="additional-notes-minimized-problems" className="mb-1 block text-xs font-medium text-slate-500">Problems</label>
                <Textarea
                  id="additional-notes-minimized-problems"
                  value={problemsText}
                  onChange={e => handleSectionChange('problems', e.target.value)}
                  onBlur={() => handleSectionBlur('problems')}
                  onKeyDown={e => handleTextareaKeyDown('problems', e)}
                  className="w-full resize-none rounded border border-slate-200 p-2 text-xs leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={2}
                  ref={problemsRef}
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="additional-notes-minimized-objective" className="block text-xs font-medium text-slate-500">Objective</label>
                  <ExaminationChecklistButton tabIndex={-1} />
                </div>
                <Textarea
                  id="additional-notes-minimized-objective"
                  value={objectiveText}
                  onChange={e => handleSectionChange('objective', e.target.value)}
                  onBlur={() => handleSectionBlur('objective')}
                  onKeyDown={e => handleTextareaKeyDown('objective', e)}
                  className="w-full resize-none rounded border border-slate-200 p-2 text-xs leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={2}
                  ref={objectiveRef}
                />
              </div>
              <div>
                <label htmlFor="additional-notes-minimized-assessment" className="mb-1 block text-xs font-medium text-slate-500">Assessment</label>
                <Textarea
                  id="additional-notes-minimized-assessment"
                  value={assessmentText}
                  onChange={e => handleSectionChange('assessment', e.target.value)}
                  onBlur={() => handleSectionBlur('assessment')}
                  onKeyDown={e => handleTextareaKeyDown('assessment', e)}
                  className="w-full resize-none rounded border border-slate-200 p-2 text-xs leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={2}
                  ref={assessmentRef}
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="additional-notes-minimized-plan" className="block text-xs font-medium text-slate-500">Plan</label>
                  <PlanSafetyNettingButton tabIndex={-1} />
                </div>
                <Textarea
                  id="additional-notes-minimized-plan"
                  value={planText}
                  onChange={e => handleSectionChange('plan', e.target.value)}
                  onBlur={() => handleSectionBlur('plan')}
                  onKeyDown={e => handleTextareaKeyDown('plan', e)}
                  className="w-full resize-none rounded border border-slate-200 p-2 text-xs leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={2}
                  ref={planRef}
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
            <div className="flex items-center gap-1">
              <FileText size={16} className="text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Additional Notes (optional)</span>
            </div>
            <span className="text-xs text-slate-500">Tip: Tab cycles Problems → Objective → Assessment → Plan; Shift+Tab reverses. Alt+C checklist, Alt+P safety-net.</span>
            {renderCharacterCount()}
          </div>
          <div className="flex items-center gap-1">
            <ExaminationChecklistButton tabIndex={-1} />
            <PlanSafetyNettingButton tabIndex={-1} />
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
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <FileText size={16} className="text-slate-600" />
              <label htmlFor="additional-notes" className="text-sm font-medium text-slate-700">
                Additional Notes (optional)
              </label>
            </div>
            <span className="text-xs text-slate-500">Tip: Tab moves Problems → Objective → Assessment → Plan; Shift+Tab goes back</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
              onClick={() => setIsExpanded(false)}
            >
              −
            </button>
          </div>
        </div>
        <div className="flex flex-1 flex-col space-y-2" ref={containerRef} role="group" aria-label="Additional notes editor">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label htmlFor="additional-notes-problems" className="mb-1 block text-xs font-medium text-slate-500">Main Problems Discussed</label>
              <Textarea
                id="additional-notes-problems"
                value={problemsText}
                onChange={e => handleSectionChange('problems', e.target.value)}
                onBlur={() => handleSectionBlur('problems')}
                onKeyDown={e => handleTextareaKeyDown('problems', e)}
                className="min-h-[100px] w-full resize-none overflow-y-auto rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                ref={problemsRef}
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="additional-notes-objective" className="block text-xs font-medium text-slate-500">Objective</label>
                <ExaminationChecklistButton tabIndex={-1} />
              </div>
              <Textarea
                id="additional-notes-objective"
                value={objectiveText}
                onChange={e => handleSectionChange('objective', e.target.value)}
                onBlur={() => handleSectionBlur('objective')}
                onKeyDown={e => handleTextareaKeyDown('objective', e)}
                className="min-h-[100px] w-full resize-none overflow-y-auto rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                ref={objectiveRef}
              />
            </div>
            <div>
              <label htmlFor="additional-notes-assessment" className="mb-1 block text-xs font-medium text-slate-500">Assessment</label>
              <Textarea
                id="additional-notes-assessment"
                value={assessmentText}
                onChange={e => handleSectionChange('assessment', e.target.value)}
                onBlur={() => handleSectionBlur('assessment')}
                onKeyDown={e => handleTextareaKeyDown('assessment', e)}
                className="min-h-[100px] w-full resize-none overflow-y-auto rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                ref={assessmentRef}
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="additional-notes-plan" className="block text-xs font-medium text-slate-500">Plan</label>
                <PlanSafetyNettingButton tabIndex={-1} />
              </div>
              <Textarea
                id="additional-notes-plan"
                value={planText}
                onChange={e => handleSectionChange('plan', e.target.value)}
                onBlur={() => handleSectionBlur('plan')}
                onKeyDown={e => handleTextareaKeyDown('plan', e)}
                className="min-h-[100px] w-full resize-none overflow-y-auto rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                ref={planRef}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal sized view
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <FileText size={16} className="text-slate-600" />
            <label htmlFor="additional-notes" className="text-sm font-medium text-slate-700">
              Additional Notes (optional)
            </label>
          </div>
          <span className="text-xs text-slate-500">Tip: Tab cycles Problems → Objective → Assessment → Plan; Shift+Tab reverses. Alt+C checklist, Alt+P safety-net.</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800"
            onClick={() => setIsExpanded(false)}
          >
            −
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3" ref={containerRef} role="group" aria-label="Additional notes editor">
        <div>
          <label htmlFor="additional-notes" className="mb-1 block text-xs font-medium text-slate-500">Problems</label>
          <Textarea
            id="additional-notes"
            value={problemsText}
            onChange={e => handleSectionChange('problems', e.target.value)}
            onBlur={() => handleSectionBlur('problems')}
            className="w-full resize-none rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            rows={4}
            ref={problemsRef}
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="additional-notes-objective" className="block text-xs font-medium text-slate-500">Objective</label>
            <ExaminationChecklistButton tabIndex={-1} />
          </div>
          <Textarea
            id="additional-notes-objective"
            value={objectiveText}
            onChange={e => handleSectionChange('objective', e.target.value)}
            onBlur={() => handleSectionBlur('objective')}
            className="w-full resize-none rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            rows={4}
            ref={objectiveRef}
          />
        </div>
        <div>
          <label htmlFor="additional-notes-assessment" className="mb-1 block text-xs font-medium text-slate-500">Assessment</label>
          <Textarea
            id="additional-notes-assessment"
            value={assessmentText}
            onChange={e => handleSectionChange('assessment', e.target.value)}
            onBlur={() => handleSectionBlur('assessment')}
            className="w-full resize-none rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            rows={4}
            ref={assessmentRef}
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="additional-notes-plan" className="block text-xs font-medium text-slate-500">Plan</label>
            <PlanSafetyNettingButton tabIndex={-1} />
          </div>
          <Textarea
            id="additional-notes-plan"
            value={planText}
            onChange={e => handleSectionChange('plan', e.target.value)}
            onBlur={() => handleSectionBlur('plan')}
            className="w-full resize-none rounded border border-slate-200 p-3 text-sm leading-relaxed focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            rows={4}
            ref={planRef}
          />
        </div>
      </div>
    </div>
  );
};
