'use client';

import { CheckSquare, ClipboardList, RotateCcw } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Checkbox } from '@/src/shared/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';
import { Textarea } from '@/src/shared/components/ui/textarea';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';

import { PLAN_CATEGORIES } from '../data/planData';
import { usePlanCart } from '../hooks/usePlanCart';

type PlanSafetyNettingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const PlanSafetyNettingModal: React.FC<PlanSafetyNettingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addConsultationItem } = useConsultationStores();
  const cart = usePlanCart();

  // Preview text state
  const [previewText, setPreviewText] = useState('');
  const [hasManualEdit, setHasManualEdit] = useState(false);

  // Generate preview text from selected items
  const generatePreviewFromItems = useCallback(() => {
    if (cart.selectedItems.length === 0) {
      return '';
    }

    // Group items by category
    const groupedItems = cart.selectedItems.reduce((acc, item) => {
      if (!acc[item.categoryId]) {
        acc[item.categoryId] = {
          title: item.categoryTitle,
          items: [],
        };
      }
      acc[item.categoryId]!.items.push(item.item);
      return acc;
    }, {} as Record<string, { title: string; items: string[] }>);

    // Format as text
    const formatted = Object.entries(groupedItems)
      .map(([, group]) => `${group.title}:\n${group.items.map(item => `• ${item}`).join('\n')}`)
      .join('\n\n');

    return formatted;
  }, [cart.selectedItems]);

  // Update preview when cart changes, but only if user hasn't manually edited
  useEffect(() => {
    if (!hasManualEdit) {
      const newPreview = generatePreviewFromItems();
      setPreviewText(newPreview);
    }
  }, [generatePreviewFromItems, hasManualEdit]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasManualEdit(false);
      setPreviewText('');
    }
  }, [isOpen]);

  const handleToggleItem = (categoryId: string, categoryTitle: string, item: string) => {
    if (cart.hasItem(categoryId, item)) {
      const itemId = `${categoryId}-${item}`;
      cart.removeItem(itemId);
    } else {
      cart.addItem(categoryId, categoryTitle, item);
    }
  };

  const handleSelectAllForCategory = (categoryId: string, categoryTitle: string, items: string[]) => {
    const selectedCount = items.filter(item => cart.hasItem(categoryId, item)).length;
    const allSelected = selectedCount === items.length;

    if (allSelected) {
      // Deselect all items for this category
      items.forEach((item) => {
        const itemId = `${categoryId}-${item}`;
        cart.removeItem(itemId);
      });
    } else {
      // Select all items for this category
      items.forEach((item) => {
        if (!cart.hasItem(categoryId, item)) {
          cart.addItem(categoryId, categoryTitle, item);
        }
      });
    }
  };

  const handlePreviewTextChange = (newText: string) => {
    setPreviewText(newText);
    setHasManualEdit(true);
  };

  const handleRegeneratePreview = () => {
    const newPreview = generatePreviewFromItems();
    setPreviewText(newPreview);
    setHasManualEdit(false);
  };

  const handleAddToNotes = () => {
    if (cart.selectedItems.length === 0) {
      return;
    }

    // Use the preview text (which user can edit) as the content
    addConsultationItem({
      type: 'checklist',
      title: 'Plan & Safety-Netting',
      content: previewText || cart.selectedItems.map(item => item.item).join(', '),
    });

    // Clear cart and close modal
    cart.clearAll();
    setPreviewText('');
    setHasManualEdit(false);
    onClose();
  };

  const handleClearAll = () => {
    cart.clearAll();
    setPreviewText('');
    setHasManualEdit(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList size={20} />
            Plan & Safety-Netting
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Categories and Items */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6">
              {PLAN_CATEGORIES.map((category) => {
                const selectedInCategory = category.items.filter(item =>
                  cart.hasItem(category.id, item),
                ).length;

                return (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-slate-900">
                        {category.title}
                        {selectedInCategory > 0 && (
                          <span className="ml-2 text-sm text-slate-500">
                            (
                            {selectedInCategory}
                            {' '}
                            selected)
                          </span>
                        )}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAllForCategory(category.id, category.title, category.items)}
                      >
                        {selectedInCategory === category.items.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>

                    <div className="grid gap-2">
                      {category.items.map(item => (
                        <div key={item} className="flex items-start space-x-3">
                          <Checkbox
                            id={`${category.id}-${item}`}
                            checked={cart.hasItem(category.id, item)}
                            onCheckedChange={() => handleToggleItem(category.id, category.title, item)}
                            className="mt-0.5"
                          />
                          <label
                            htmlFor={`${category.id}-${item}`}
                            className="flex-1 cursor-pointer text-sm leading-5 text-slate-700 hover:text-slate-900"
                          >
                            {item}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex w-1/3 flex-col border-l border-slate-200 pl-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-900">Preview</h3>
              <div className="flex items-center gap-2">
                {hasManualEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRegeneratePreview}
                    className="h-6 px-2 text-xs"
                    title="Regenerate from selections"
                  >
                    <RotateCcw size={12} />
                  </Button>
                )}
                <span className="text-xs text-slate-500">
                  {cart.getTotalCount()}
                  {' '}
                  items selected
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col">
              <Textarea
                value={previewText}
                onChange={e => handlePreviewTextChange(e.target.value)}
                placeholder="Selected items will appear here..."
                className="min-h-[200px] flex-1 resize-none text-sm"
                disabled={cart.selectedItems.length === 0}
              />

              {hasManualEdit && (
                <p className="mt-1 text-xs text-slate-500">
                  Preview edited manually. Use regenerate button to sync with selections.
                </p>
              )}

              <div className="mt-4 space-y-2">
                <Button
                  onClick={handleAddToNotes}
                  disabled={cart.selectedItems.length === 0}
                  className="w-full"
                >
                  <CheckSquare size={16} className="mr-2" />
                  Add to Notes
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  disabled={cart.selectedItems.length === 0}
                  className="w-full"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
