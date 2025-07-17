import { useCallback, useState } from 'react';

import type { ExaminationCartState, SelectedItem } from '../types';

export const useExaminationCart = (): ExaminationCartState => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const addItem = useCallback((examTypeId: string, examTypeTitle: string, item: string) => {
    const id = `${examTypeId}-${item}`;

    setSelectedItems((prev) => {
      // Check if item already exists
      if (prev.some(selectedItem => selectedItem.id === id)) {
        return prev;
      }

      return [...prev, {
        id,
        examTypeId,
        examTypeTitle,
        item,
      }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const hasItem = useCallback((examTypeId: string, item: string) => {
    const id = `${examTypeId}-${item}`;
    return selectedItems.some(selectedItem => selectedItem.id === id);
  }, [selectedItems]);

  const getItemsForExamType = useCallback((examTypeId: string) => {
    return selectedItems.filter(item => item.examTypeId === examTypeId);
  }, [selectedItems]);

  const getTotalCount = useCallback(() => {
    return selectedItems.length;
  }, [selectedItems]);

  return {
    selectedItems,
    addItem,
    removeItem,
    clearAll,
    hasItem,
    getItemsForExamType,
    getTotalCount,
  };
};
