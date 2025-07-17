'use client';

import { forwardRef } from 'react';

import type { ExaminationType } from '../types';

type ExaminationTypesListProps = {
  examTypes: ExaminationType[];
  selectedTypeId?: string;
  onSelectType: (typeId: string) => void;
  searchQuery: string;
  highlightSearchTerm: (text: string) => string;
  focusedIndex?: number; // Index of focused exam type for keyboard navigation
  className?: string;
};

export const ExaminationTypesList = forwardRef<HTMLDivElement, ExaminationTypesListProps>(
  ({ examTypes, selectedTypeId, onSelectType, searchQuery, highlightSearchTerm, focusedIndex, className }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col space-y-1 ${className || ''}`}
        tabIndex={-1}
      >
        <div className="mb-2 text-sm font-medium text-slate-700">
          Examination Types (
          {examTypes.length}
          )
        </div>

        <div className="space-y-1 overflow-y-auto">
          {examTypes.length === 0
            ? (
                <div className="py-4 text-center text-sm text-gray-500">
                  No examination types match your search
                </div>
              )
            : (
                examTypes.map((examType, index) => {
                  const isSelected = selectedTypeId === examType.id;
                  const isFocused = focusedIndex === index;

                  return (
                    <button
                      key={examType.id}
                      onClick={() => onSelectType(examType.id)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? 'border border-blue-300 bg-blue-100 text-blue-800'
                          : isFocused
                            ? 'border border-indigo-300 bg-indigo-100 text-indigo-800'
                            : 'border border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div
                        className="font-medium"
                        dangerouslySetInnerHTML={{
                          __html: highlightSearchTerm(examType.title),
                        }}
                      />
                      <div className="mt-1 text-xs text-gray-600">
                        {examType.items.length}
                        {' '}
                        items
                      </div>
                    </button>
                  );
                })
              )}
        </div>

        {searchQuery && examTypes.length > 0 && (
          <div className="mt-2 border-t pt-2 text-xs text-gray-500">
            Showing
            {' '}
            {examTypes.length}
            {' '}
            examination type
            {examTypes.length !== 1 ? 's' : ''}
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

ExaminationTypesList.displayName = 'ExaminationTypesList';
