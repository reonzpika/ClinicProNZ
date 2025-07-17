'use client';

import { X } from 'lucide-react';
import { forwardRef } from 'react';

import { Button } from '@/src/shared/components/ui/button';

import type { SelectedItem } from '../types';

type SelectedItemsCartProps = {
  selectedItems: SelectedItem[];
  onRemoveItem: (id: string) => void;
  className?: string;
};

export const SelectedItemsCart = forwardRef<HTMLDivElement, SelectedItemsCartProps>(
  ({ selectedItems, onRemoveItem, className }, ref) => {
    if (selectedItems.length === 0) {
      return (
        <div
          ref={ref}
          className={`rounded-lg bg-gray-50 py-4 text-center text-sm text-gray-500 ${className || ''}`}
          tabIndex={-1}
        >
          No examination findings selected. Select items from the checklist above to add them here.
        </div>
      );
    }

    // Group items by examination type
    const groupedItems = selectedItems.reduce((acc, item) => {
      if (!acc[item.examTypeId]) {
        acc[item.examTypeId] = {
          title: item.examTypeTitle,
          items: [],
        };
      }
      acc[item.examTypeId]!.items.push(item);
      return acc;
    }, {} as Record<string, { title: string; items: SelectedItem[] }>);

    return (
      <div
        ref={ref}
        className={`rounded-lg border border-blue-200 bg-blue-50 p-3 ${className || ''}`}
        tabIndex={-1}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium text-blue-800">
            Selected Examination Findings (
            {selectedItems.length}
            )
          </div>
        </div>

        <div className="max-h-32 space-y-3 overflow-y-auto">
          {Object.entries(groupedItems).map(([examTypeId, group]) => (
            <div key={examTypeId} className="space-y-1">
              <div className="text-xs font-medium uppercase tracking-wide text-blue-700">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded border border-blue-200 bg-white px-2 py-1"
                  >
                    <span className="mr-2 flex-1 text-sm text-slate-700">
                      {item.item}
                    </span>
                    <Button
                      onClick={() => onRemoveItem(item.id)}
                      size="sm"
                      variant="ghost"
                      className="size-6 p-0 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Remove item"
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 border-t border-blue-200 pt-3">
          <div className="text-xs text-blue-600">
            These findings will be added to your Additional Notes when you click "Add to Notes" below.
          </div>
        </div>
      </div>
    );
  },
);

SelectedItemsCart.displayName = 'SelectedItemsCart';
