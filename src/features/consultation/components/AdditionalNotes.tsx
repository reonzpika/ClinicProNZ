'use client';

import React from 'react';

import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Textarea } from '@/shared/components/ui/textarea';

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
};

export const AdditionalNotes: React.FC<AdditionalNotesProps> = ({
  items,
  onNotesChange,
  notes,
  placeholder = 'Additional information gathered during consultation...',
  isMinimized = false,
}) => {
  // Track processed items to avoid duplicates
  const [processedItemIds] = React.useState(new Set<string>());
  const [isExpanded, setIsExpanded] = React.useState(!isMinimized);

  // Auto-append new items to notes
  React.useEffect(() => {
    const newItems = items.filter((item: ConsultationItem) => !processedItemIds.has(item.id));

    if (newItems.length > 0) {
      const newItemsText = newItems.map((item: ConsultationItem) => `${item.title}: ${item.content}`).join('\n\n');
      const currentNotes = notes.trim();

      const updatedNotes = currentNotes
        ? `${currentNotes}\n\n${newItemsText}`
        : newItemsText;

      // Mark items as processed
      newItems.forEach((item: ConsultationItem) => processedItemIds.add(item.id));

      onNotesChange(updatedNotes);
    }
  }, [items, notes, onNotesChange, processedItemIds]);

  // Handle text changes
  const handleTextChange = (newText: string) => {
    onNotesChange(newText);
  };

  // Minimized view (in documentation mode)
  if (isMinimized) {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-2 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700">Additional Notes</span>
            {notes.trim() && <span className="text-xs text-slate-500">({notes.trim().length} chars)</span>}
          </div>
          <button 
            type="button" 
            className="h-6 px-2 text-xs text-slate-600 hover:text-slate-800" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </CardHeader>
        {isExpanded && (
          <CardContent className="p-2 pt-0">
            <div>
              <Textarea
                id="additional-notes-minimized"
                value={notes}
                onChange={e => handleTextChange(e.target.value)}
                placeholder={placeholder}
                className="resize-none text-xs"
                rows={4}
              />
              <p className="mt-1 text-xs text-slate-500">
                Information from clinical tools appears here
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  // Standard view
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-medium text-slate-700">Additional Notes</h3>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Editable Additional Notes */}
          <div>
            <label htmlFor="additional-notes" className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-600">
              Additional Notes
            </label>
            <Textarea
              id="additional-notes"
              value={notes}
              onChange={e => handleTextChange(e.target.value)}
              placeholder={placeholder}
              className="resize-none text-sm"
              rows={8}
            />
            <p className="mt-1 text-xs text-slate-500">
              Information added from clinical tools will appear here and can be edited as needed.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 