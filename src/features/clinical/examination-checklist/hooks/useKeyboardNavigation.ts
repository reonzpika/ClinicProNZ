import { useCallback, useEffect, useRef, useState } from 'react';

import type { FocusArea } from '../types';

type UseKeyboardNavigationProps = {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  examTypesCount: number;
  filteredItemsCount: number;
  selectedExamTypeIndex: number;
  setSelectedExamTypeIndex: (index: number) => void;
  selectedItemIndex: number;
  setSelectedItemIndex: (index: number) => void;
  onSelectExamType: (index: number) => void;
  onToggleItem: (index: number) => void;
  onSelectAll: () => void;
  onAddToNotes: () => void;
  onClearCart: () => void;
};

export const useKeyboardNavigation = ({
  isModalOpen,
  setIsModalOpen,
  examTypesCount,
  filteredItemsCount,
  selectedExamTypeIndex,
  setSelectedExamTypeIndex,
  selectedItemIndex,
  setSelectedItemIndex,
  onSelectExamType,
  onToggleItem,
  onSelectAll,
  onAddToNotes,
  onClearCart,
}: UseKeyboardNavigationProps) => {
  const [currentFocus, setCurrentFocus] = useState<FocusArea>('search');
  const [actionButtonIndex, setActionButtonIndex] = useState(0); // 0 = Add to Notes, 1 = Clear Cart

  // Refs for focusing elements
  const searchInputRef = useRef<HTMLInputElement>(null);
  const examTypesRef = useRef<HTMLDivElement>(null);
  const checklistRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setCurrentFocus('search');
      setSelectedExamTypeIndex(0);
      setSelectedItemIndex(0);
      setActionButtonIndex(0);
    }
  }, [isModalOpen, setSelectedExamTypeIndex, setSelectedItemIndex]);

  // Focus the appropriate element when currentFocus changes
  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const timeoutId = setTimeout(() => {
      switch (currentFocus) {
        case 'search':
          searchInputRef.current?.focus();
          break;
        case 'examTypes':
          examTypesRef.current?.focus();
          break;
        case 'checklist':
          checklistRef.current?.focus();
          break;
        case 'cart':
          cartRef.current?.focus();
          break;
        case 'actions': {
          const buttons = actionsRef.current?.querySelectorAll('button');
          if (buttons && buttons[actionButtonIndex]) {
            (buttons[actionButtonIndex] as HTMLElement).focus();
          }
          break;
        }
      }
    }, 50); // Small delay to ensure DOM is ready

    return () => clearTimeout(timeoutId);
  }, [currentFocus, isModalOpen, actionButtonIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Alt+C to open modal (global shortcut)
    if (e.altKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      setIsModalOpen(true);
      return;
    }

    if (!isModalOpen) {
      return;
    }

    // Escape to close modal
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsModalOpen(false);
      return;
    }

    // Tab to cycle through focus areas
    if (e.key === 'Tab') {
      e.preventDefault();
      const focusOrder: FocusArea[] = ['search', 'examTypes', 'checklist', 'cart', 'actions'];
      const currentIndex = focusOrder.indexOf(currentFocus);
      const nextIndex = e.shiftKey
        ? (currentIndex - 1 + focusOrder.length) % focusOrder.length
        : (currentIndex + 1) % focusOrder.length;

      setCurrentFocus(focusOrder[nextIndex]!);
      return;
    }

    // Handle navigation within focused areas
    switch (currentFocus) {
      case 'search':
        // Search input handles its own navigation, no special handling needed
        break;

      case 'examTypes':
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const newIndex = Math.max(0, selectedExamTypeIndex - 1);
          setSelectedExamTypeIndex(newIndex);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const newIndex = Math.min(examTypesCount - 1, selectedExamTypeIndex + 1);
          setSelectedExamTypeIndex(newIndex);
        } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault();
          onSelectExamType(selectedExamTypeIndex);
          setCurrentFocus('checklist');
        }
        break;

      case 'checklist':
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const newIndex = Math.max(0, selectedItemIndex - 1);
          setSelectedItemIndex(newIndex);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const newIndex = Math.min(filteredItemsCount - 1, selectedItemIndex + 1);
          setSelectedItemIndex(newIndex);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setCurrentFocus('examTypes');
        } else if (e.key === 'Enter') {
          e.preventDefault();
          onToggleItem(selectedItemIndex);
        } else if (e.key === ' ') {
          e.preventDefault();
          onToggleItem(selectedItemIndex);
        } else if (e.key.toLowerCase() === 'a' && e.ctrlKey) {
          e.preventDefault();
          onSelectAll();
        }
        break;

      case 'cart':
        // Cart items navigation could be implemented here if needed
        break;

      case 'actions':
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setActionButtonIndex(0); // Add to Notes
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setActionButtonIndex(1); // Clear Cart
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (actionButtonIndex === 0) {
            onAddToNotes();
          } else {
            onClearCart();
          }
        }
        break;
    }
  }, [
    isModalOpen,
    setIsModalOpen,
    currentFocus,
    selectedExamTypeIndex,
    selectedItemIndex,
    examTypesCount,
    filteredItemsCount,
    actionButtonIndex,
    setSelectedExamTypeIndex,
    setSelectedItemIndex,
    onSelectExamType,
    onToggleItem,
    onSelectAll,
    onAddToNotes,
    onClearCart,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getFocusClasses = (area: FocusArea) => {
    return currentFocus === area
      ? 'ring-2 ring-blue-500 ring-offset-2'
      : '';
  };

  return {
    currentFocus,
    searchInputRef,
    examTypesRef,
    checklistRef,
    cartRef,
    actionsRef,
    getFocusClasses,
    actionButtonIndex,
  };
};
