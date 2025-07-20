import { useState } from 'react';

import type { PlanCartState, SelectedPlanItem } from '../types';

export const usePlanCart = (): PlanCartState => {
  const [selectedItems, setSelectedItems] = useState<SelectedPlanItem[]>([]);

  const addItem = (categoryId: string, categoryTitle: string, item: string) => {
    const id = `${categoryId}-${item}`;
    setSelectedItems(prev => [
      ...prev.filter(existing => existing.id !== id),
      { id, categoryId, categoryTitle, item },
    ]);
  };

  const removeItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setSelectedItems([]);
  };

  const hasItem = (categoryId: string, item: string) => {
    const id = `${categoryId}-${item}`;
    return selectedItems.some(selectedItem => selectedItem.id === id);
  };

  const getItemsForCategory = (categoryId: string) => {
    return selectedItems.filter(item => item.categoryId === categoryId);
  };

  const getTotalCount = () => {
    return selectedItems.length;
  };

  return {
    selectedItems,
    addItem,
    removeItem,
    clearAll,
    hasItem,
    getItemsForCategory,
    getTotalCount,
  };
};
