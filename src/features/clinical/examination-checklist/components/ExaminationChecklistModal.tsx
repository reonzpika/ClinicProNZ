'use client';

import { Stethoscope } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';
import { useConsultation } from '@/src/shared/ConsultationContext';

import { EXAMINATION_CHECKLISTS } from '../data/examinationData';
import { useExaminationCart } from '../hooks/useExaminationCart';
import { useExaminationSearch } from '../hooks/useExaminationSearch';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { ChecklistItemsPanel } from './ChecklistItemsPanel';
import { ExaminationSearchInput } from './ExaminationSearchInput';
import { ExaminationTypesList } from './ExaminationTypesList';

type ExaminationChecklistModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ExaminationChecklistModal: React.FC<ExaminationChecklistModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addConsultationItem } = useConsultation();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamTypeId, setSelectedExamTypeId] = useState<string | undefined>();
  const [selectedExamTypeIndex, setSelectedExamTypeIndex] = useState(0);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  // Custom hooks
  const cart = useExaminationCart();
  const { filteredExamTypes, filteredItems, highlightSearchTerm } = useExaminationSearch(
    searchQuery,
    selectedExamTypeId,
  );

  // Auto-select first examination type from search results
  useEffect(() => {
    if (filteredExamTypes.length > 0) {
      // If no current selection or current selection not in filtered results
      const isCurrentSelectionInResults = selectedExamTypeId
        && filteredExamTypes.some(examType => examType.id === selectedExamTypeId);

      if (!selectedExamTypeId || !isCurrentSelectionInResults) {
        // Auto-select the first examination type from search results
        setSelectedExamTypeId(filteredExamTypes[0]!.id);
        setSelectedExamTypeIndex(0);
        setSelectedItemIndex(0);
      }
    }
  }, [filteredExamTypes, selectedExamTypeId]);

  // Get current selected exam type
  const selectedExamType = selectedExamTypeId
    ? EXAMINATION_CHECKLISTS.find(e => e.id === selectedExamTypeId)
    : undefined;

  // Handlers (defined before keyboard navigation to avoid use-before-define errors)
  const handleSelectExamType = useCallback((typeId: string) => {
    setSelectedExamTypeId(typeId);
    setSelectedItemIndex(0);
  }, []);

  const handleToggleItem = useCallback((examTypeId: string, examTypeTitle: string, item: string) => {
    if (cart.hasItem(examTypeId, item)) {
      const itemId = `${examTypeId}-${item}`;
      cart.removeItem(itemId);
    } else {
      cart.addItem(examTypeId, examTypeTitle, item);
    }
  }, [cart]);

  const handleSelectAll = useCallback((examTypeId: string, examTypeTitle: string, items: string[]) => {
    const selectedCount = items.filter(item => cart.hasItem(examTypeId, item)).length;
    const allSelected = selectedCount === items.length;

    if (allSelected) {
      // Deselect all items for this exam type
      items.forEach((item) => {
        const itemId = `${examTypeId}-${item}`;
        cart.removeItem(itemId);
      });
    } else {
      // Select all items for this exam type
      items.forEach((item) => {
        if (!cart.hasItem(examTypeId, item)) {
          cart.addItem(examTypeId, examTypeTitle, item);
        }
      });
    }
  }, [cart]);

  function handleAddToNotes() {
    if (cart.selectedItems.length === 0) {
      return;
    }

    // Group items by examination type
    const groupedItems = cart.selectedItems.reduce((acc, item) => {
      if (!acc[item.examTypeId]) {
        acc[item.examTypeId] = {
          title: item.examTypeTitle,
          items: [],
        };
      }
      acc[item.examTypeId]!.items.push(item.item);
      return acc;
    }, {} as Record<string, { title: string; items: string[] }>);

    // Add each examination type as a separate consultation item
    Object.entries(groupedItems).forEach(([_, group]) => {
      addConsultationItem({
        type: 'checklist',
        title: `${group.title} Examination`,
        content: group.items.join(', '),
      });
    });

    // Clear cart and close modal
    cart.clearAll();
    onClose();
  }

  // Keyboard navigation
  const navigation = useKeyboardNavigation({
    isModalOpen: isOpen,
    setIsModalOpen: (open) => {
      if (!open) {
        onClose();
      }
    },
    examTypesCount: filteredExamTypes.length,
    filteredItemsCount: filteredItems.length,
    selectedExamTypeIndex,
    setSelectedExamTypeIndex,
    selectedItemIndex,
    setSelectedItemIndex,
    onSelectExamType: (index) => {
      const examType = filteredExamTypes[index];
      if (examType) {
        setSelectedExamTypeId(examType.id);
        setSelectedItemIndex(0);
      }
    },
    onToggleItem: (index) => {
      if (selectedExamType && filteredItems[index]) {
        const item = filteredItems[index];
        if (cart.hasItem(selectedExamType.id, item)) {
          const itemId = `${selectedExamType.id}-${item}`;
          cart.removeItem(itemId);
        } else {
          cart.addItem(selectedExamType.id, selectedExamType.title, item);
        }
      }
    },
    onSelectAll: () => {
      if (selectedExamType && filteredItems.length > 0) {
        handleSelectAll(selectedExamType.id, selectedExamType.title, filteredItems);
      }
    },
    onAddToNotes: handleAddToNotes,
    onClearCart: cart.clearAll,
  });

  const handleClose = useCallback(() => {
    setSearchQuery('');
    setSelectedExamTypeId(undefined);
    setSelectedExamTypeIndex(0);
    setSelectedItemIndex(0);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col border border-slate-200 bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="size-5" />
            Examination Checklist
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {/* Search Input */}
          <ExaminationSearchInput
            ref={navigation.searchInputRef}
            value={searchQuery}
            onChange={setSearchQuery}
            className={navigation.getFocusClasses('search')}
          />

          {/* Search results info */}
          {searchQuery && (
            <div className="text-sm text-gray-600">
              Found
              {' '}
              {filteredExamTypes.length}
              {' '}
              examination type
              {filteredExamTypes.length !== 1 ? 's' : ''}
              {selectedExamType && ` with ${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''}`}
              {' '}
              matching "
              {searchQuery}
              "
            </div>
          )}

          {/* Two-column layout */}
          <div className="flex flex-1 gap-4 overflow-hidden">
            {/* Left panel - Examination types */}
            <div className={`w-1/3 overflow-hidden rounded-lg border p-3 ${navigation.getFocusClasses('examTypes')}`}>
              <ExaminationTypesList
                ref={navigation.examTypesRef}
                examTypes={filteredExamTypes}
                selectedTypeId={selectedExamTypeId}
                onSelectType={handleSelectExamType}
                searchQuery={searchQuery}
                highlightSearchTerm={highlightSearchTerm}
                focusedIndex={navigation.currentFocus === 'examTypes' ? selectedExamTypeIndex : undefined}
              />
            </div>

            {/* Right panel - Checklist items */}
            <div className={`flex-1 overflow-hidden rounded-lg border p-3 ${navigation.getFocusClasses('checklist')}`}>
              <ChecklistItemsPanel
                ref={navigation.checklistRef}
                selectedExamType={selectedExamType}
                filteredItems={filteredItems}
                hasItem={cart.hasItem}
                onToggleItem={handleToggleItem}
                onSelectAll={handleSelectAll}
                searchQuery={searchQuery}
                highlightSearchTerm={highlightSearchTerm}
                focusedIndex={navigation.currentFocus === 'checklist' ? selectedItemIndex : undefined}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className={`flex gap-2 ${navigation.getFocusClasses('actions')}`} ref={navigation.actionsRef}>
            <Button
              onClick={handleAddToNotes}
              disabled={cart.selectedItems.length === 0}
              className={`flex-1 ${navigation.actionButtonIndex === 0 ? 'ring-2 ring-blue-300 ring-offset-1' : ''}`}
            >
              Add Selected to Notes (
              {cart.getTotalCount()}
              )
            </Button>
            <Button
              onClick={cart.clearAll}
              disabled={cart.selectedItems.length === 0}
              variant="outline"
              className={`${navigation.actionButtonIndex === 1 ? 'ring-2 ring-blue-300 ring-offset-1' : ''}`}
            >
              Clear All
            </Button>
          </div>

          {/* Keyboard shortcuts help */}
          <div className="border-t pt-3 text-xs text-gray-500">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <kbd className="rounded bg-gray-100 px-1 py-0.5 text-xs">Alt+C</kbd>
                {' '}
                Open checklist
              </div>
              <div>
                <kbd className="rounded bg-gray-100 px-1 py-0.5 text-xs">Tab</kbd>
                {' '}
                Navigate sections
              </div>
              <div>
                <kbd className="rounded bg-gray-100 px-1 py-0.5 text-xs">↑↓</kbd>
                {' '}
                Navigate items
              </div>
              <div>
                <kbd className="rounded bg-gray-100 px-1 py-0.5 text-xs">Enter</kbd>
                {' '}
                Select/toggle
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
