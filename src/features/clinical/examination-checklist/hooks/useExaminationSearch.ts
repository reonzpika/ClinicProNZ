import { useMemo } from 'react';

import { EXAMINATION_CHECKLISTS } from '../data/examinationData';

export const useExaminationSearch = (searchQuery: string, selectedExamTypeId?: string) => {
  const filteredExamTypes = useMemo(() => {
    if (!searchQuery.trim()) {
      return EXAMINATION_CHECKLISTS;
    }

    const query = searchQuery.toLowerCase();

    return EXAMINATION_CHECKLISTS.filter(examType =>
      // Search in exam type title
      examType.title.toLowerCase().includes(query)
      // Search in individual checklist items
      || examType.items.some(item =>
        item.toLowerCase().includes(query),
      ),
    );
  }, [searchQuery]);

  const filteredItems = useMemo(() => {
    if (!selectedExamTypeId) {
      return [];
    }

    const examType = EXAMINATION_CHECKLISTS.find(e => e.id === selectedExamTypeId);
    if (!examType) {
      return [];
    }

    if (!searchQuery.trim()) {
      return examType.items;
    }

    const query = searchQuery.toLowerCase();

    // Filter items within selected exam type
    return examType.items.filter(item =>
      item.toLowerCase().includes(query),
    );
  }, [selectedExamTypeId, searchQuery]);

  const getSearchResultsCount = () => {
    if (!searchQuery.trim()) {
      return {
        examTypesCount: EXAMINATION_CHECKLISTS.length,
        itemsCount: selectedExamTypeId
          ? (EXAMINATION_CHECKLISTS.find(e => e.id === selectedExamTypeId)?.items.length || 0)
          : 0,
      };
    }

    return {
      examTypesCount: filteredExamTypes.length,
      itemsCount: filteredItems.length,
    };
  };

  const highlightSearchTerm = (text: string) => {
    if (!searchQuery.trim()) {
      return text;
    }

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  return {
    filteredExamTypes,
    filteredItems,
    getSearchResultsCount,
    highlightSearchTerm,
  };
};
