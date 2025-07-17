'use client';

import { Check } from 'lucide-react';
import { forwardRef } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Checkbox } from '@/src/shared/components/ui/checkbox';

type ChecklistItemsPanelProps = {
  selectedExamType?: {
    id: string;
    title: string;
    items: string[];
  };
  filteredItems: string[];
  hasItem: (examTypeId: string, item: string) => boolean;
  onToggleItem: (examTypeId: string, examTypeTitle: string, item: string) => void;
  onSelectAll: (examTypeId: string, examTypeTitle: string, items: string[]) => void;
  searchQuery: string;
  highlightSearchTerm: (text: string) => string;
  className?: string;
};

export const ChecklistItemsPanel = forwardRef<HTMLDivElement, ChecklistItemsPanelProps>(
  ({
    selectedExamType,
    filteredItems,
    hasItem,
    onToggleItem,
    onSelectAll,
    searchQuery,
    highlightSearchTerm,
    className,
  }, ref) => {
    if (!selectedExamType) {
      return (
        <div
          ref={ref}
          className={`flex flex-col items-center justify-center text-center ${className || ''}`}
          tabIndex={-1}
        >
          <div className="text-gray-500">
            <div className="mb-2 text-lg">👈</div>
            <div className="text-sm">Select an examination type to view its checklist</div>
          </div>
        </div>
      );
    }

    const selectedCount = filteredItems.filter(item => hasItem(selectedExamType.id, item)).length;
    const allSelected = filteredItems.length > 0 && selectedCount === filteredItems.length;

    return (
      <div
        ref={ref}
        className={`flex flex-col space-y-3 ${className || ''}`}
        tabIndex={-1}
      >
        {/* Header with title and select all */}
        <div className="flex items-center justify-between">
          <div>
            <div
              className="text-sm font-medium text-slate-700"
              dangerouslySetInnerHTML={{
                __html: highlightSearchTerm(selectedExamType.title),
              }}
            />
            <div className="mt-1 text-xs text-gray-600">
              {selectedCount}
              {' '}
              of
              {filteredItems.length}
              {' '}
              selected
            </div>
          </div>

          {filteredItems.length > 0 && (
            <Button
              onClick={() => onSelectAll(selectedExamType.id, selectedExamType.title, filteredItems)}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Check className="mr-1 size-3" />
              {allSelected ? 'Deselect All' : 'Select All Normal'}
            </Button>
          )}
        </div>

        {/* Items list */}
        <div className="flex-1 space-y-2 overflow-y-auto">
          {filteredItems.length === 0
            ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  {searchQuery
                    ? `No items in ${selectedExamType.title} match your search`
                    : `No items available for ${selectedExamType.title}`}
                </div>
              )
            : (
                filteredItems.map((item, index) => {
                  const isSelected = hasItem(selectedExamType.id, item);
                  const itemId = `${selectedExamType.id}-${index}`;

                  return (
                    <div key={itemId} className="group flex items-start space-x-3">
                      <Checkbox
                        id={itemId}
                        checked={isSelected}
                        onCheckedChange={() => onToggleItem(selectedExamType.id, selectedExamType.title, item)}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={itemId}
                        className={`flex-1 cursor-pointer text-sm leading-5 transition-colors ${
                          isSelected
                            ? 'font-medium text-slate-700'
                            : 'text-slate-600 group-hover:text-slate-700'
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: highlightSearchTerm(item),
                        }}
                      />
                    </div>
                  );
                })
              )}
        </div>

        {/* Search results info */}
        {searchQuery && filteredItems.length > 0 && (
          <div className="border-t pt-2 text-xs text-gray-500">
            Showing
            {' '}
            {filteredItems.length}
            {' '}
            item
            {filteredItems.length !== 1 ? 's' : ''}
            {' '}
            matching "
            {searchQuery}
            "
          </div>
        )}
      </div>
    );
  },
);

ChecklistItemsPanel.displayName = 'ChecklistItemsPanel';
