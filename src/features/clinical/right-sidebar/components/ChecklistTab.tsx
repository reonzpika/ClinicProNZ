/* eslint-disable style/multiline-ternary */
/* eslint-disable ts/no-use-before-define */
'use client';

import { ChevronDown, ChevronRight, X } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/src/shared/components/ui/card';
import { Checkbox } from '@/src/shared/components/ui/checkbox';
import { Input } from '@/src/shared/components/ui/input';

type ChecklistType = 'driving' | 'baby-6weeks' | 'adult-health' | 'mammography' | 'cervical-screening';
type CategoryType = 'children' | 'adult' | 'screening';

type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

type Checklist = {
  id: ChecklistType;
  title: string;
  description: string;
  category: CategoryType;
  items: ChecklistItem[];
};

type Category = {
  id: CategoryType;
  title: string;
  description: string;
};

const categories: Category[] = [];

const allChecklists: Checklist[] = [];

export const ChecklistTab: React.FC = () => {
  // Use ConsultationContext for adding items
  const { addConsultationItem } = useConsultationStores();

  // Main state
  const [selectedChecklistIds, setSelectedChecklistIds] = useState<ChecklistType[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Selection mode state
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<CategoryType[]>([]);

  // Work mode state
  const [expandedWorkChecklists, setExpandedWorkChecklists] = useState<ChecklistType[]>([]);
  const [workChecklists, setWorkChecklists] = useState<Checklist[]>([]);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Derive selected checklists for work mode
  const selectedChecklists = useMemo(() => {
    return selectedChecklistIds.map((id) => {
      const baseChecklist = allChecklists.find(c => c.id === id);
      const workChecklist = workChecklists.find(c => c.id === id);
      return workChecklist || baseChecklist!;
    }).filter(Boolean);
  }, [selectedChecklistIds, workChecklists]);

  // Filter checklists for selection mode
  const filteredChecklists = useMemo(() => {
    if (!searchTerm.trim()) {
      return allChecklists;
    }

    return allChecklists.filter(checklist =>
      checklist.title.toLowerCase().includes(searchTerm.toLowerCase())
      || checklist.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  // Group checklists by category for selection mode
  const checklistsByCategory = useMemo(() => {
    const grouped: Record<CategoryType, Checklist[]> = {
      children: [],
      adult: [],
      screening: [],
    };

    const checklistsToGroup = searchTerm.trim() ? filteredChecklists : allChecklists;

    checklistsToGroup.forEach((checklist) => {
      grouped[checklist.category].push(checklist);
    });

    return grouped;
  }, [filteredChecklists, searchTerm]);

  // Selection mode handlers
  const handleCategoryToggle = (categoryId: CategoryType) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleChecklistSelect = (checklistId: ChecklistType) => {
    if (!selectedChecklistIds.includes(checklistId)) {
      const checklist = allChecklists.find(c => c.id === checklistId);
      if (checklist) {
        setSelectedChecklistIds(prev => [...prev, checklistId]);
        setWorkChecklists(prev => [...prev, { ...checklist }]);

        // Auto-expand the newly selected checklist
        setExpandedWorkChecklists(prev => [...prev, checklistId]);

        // Auto-close selection mode after adding
        handleExitSelectionMode();
      }
    }
  };

  const handleSearchBarClick = () => {
    setIsSelectionMode(true);
    // Focus on search input after state update
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  const handleExitSelectionMode = () => {
    setIsSelectionMode(false);
    setSearchTerm('');
    setExpandedCategories([]);
  };

  // Work mode handlers
  const handleWorkChecklistToggle = (checklistId: ChecklistType) => {
    setExpandedWorkChecklists(prev =>
      prev.includes(checklistId)
        ? prev.filter(id => id !== checklistId)
        : [...prev, checklistId],
    );
  };

  const handleWorkItemToggle = (checklistId: ChecklistType, itemId: string) => {
    setWorkChecklists(prev =>
      prev.map(checklist =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: checklist.items.map(item =>
                item.id === itemId ? { ...item, checked: !item.checked } : item,
              ),
            }
          : checklist,
      ),
    );
  };

  const handleAddToConsultation = (checklistId: ChecklistType) => {
    const checklist = workChecklists.find(c => c.id === checklistId);
    if (checklist) {
      const checkedItems = checklist.items
        .filter(item => item.checked)
        .map(item => item.label);

      if (checkedItems.length > 0) {
        // Add to consultation context
        addConsultationItem({
          type: 'checklist',
          title: checklist.title,
          content: checkedItems.join(', '),
        });

        // Reset checklist and collapse it
        setWorkChecklists(prev =>
          prev.map(c =>
            c.id === checklistId
              ? {
                  ...c,
                  items: c.items.map(item => ({ ...item, checked: false })),
                }
              : c,
          ),
        );

        // Collapse the checklist
        setExpandedWorkChecklists(prev => prev.filter(id => id !== checklistId));
      }
    }
  };

  const handleRemoveSelectedChecklist = (checklistId: ChecklistType) => {
    setSelectedChecklistIds(prev => prev.filter(id => id !== checklistId));
    setWorkChecklists(prev => prev.filter(c => c.id !== checklistId));
    setExpandedWorkChecklists(prev => prev.filter(id => id !== checklistId));
  };

  // Render selection mode (full categorized library)
  if (isSelectionMode) {
    return (
      <div className="space-y-3">
        {/* Selection Mode Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-700">Select Checklists</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExitSelectionMode}
            className="size-6 p-0 text-slate-600 hover:text-slate-800"
          >
            <X size={14} />
          </Button>
        </div>

        {/* Search Input */}
        <div>
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search checklists..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-sm"
          />
        </div>

        {/* Categories and Checklists */}
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {searchTerm.trim() ? (
            // Search Results - Show filtered checklists without category grouping
            <>
              {filteredChecklists.map((checklist) => {
                const isAlreadySelected = selectedChecklistIds.includes(checklist.id);

                return (
                  <Card
                    key={checklist.id}
                    className={`border-slate-200 bg-white shadow-sm ${!isAlreadySelected ? 'cursor-pointer hover:bg-slate-50' : 'opacity-50'} transition-colors`}
                    onClick={() => !isAlreadySelected && handleChecklistSelect(checklist.id)}
                  >
                    <CardHeader className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-slate-700">{checklist.title}</h5>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-400">
                            {checklist.items.length}
                            {' '}
                            items
                          </span>
                          {isAlreadySelected && (
                            <span className="text-xs font-medium text-green-600">Added</span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}

              {/* No Results */}
              {filteredChecklists.length === 0 && (
                <div className="py-4 text-center">
                  <p className="text-sm text-slate-500">
                    No checklists found matching "
                    {searchTerm}
                    "
                  </p>
                </div>
              )}
            </>
          ) : (
            // Category View - Show categories with checklists grouped
            <>
              {categories.map((category) => {
                const categoryChecklists = checklistsByCategory[category.id];
                const isCategoryExpanded = expandedCategories.includes(category.id);

                if (categoryChecklists.length === 0) {
                  return null;
                }

                return (
                  <Card key={category.id} className="border-slate-300 bg-white shadow-sm">
                    {/* Category Header */}
                    <CardHeader
                      className="cursor-pointer border-b border-slate-200 bg-slate-100 p-3 transition-colors hover:bg-slate-200"
                      onClick={() => handleCategoryToggle(category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {isCategoryExpanded
                            ? (
                                <ChevronDown size={16} className="text-slate-700" />
                              )
                            : (
                                <ChevronRight size={16} className="text-slate-700" />
                              )}
                          <div>
                            <h4 className="text-sm font-semibold text-slate-800">{category.title}</h4>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">
                          {categoryChecklists.length}
                          {' '}
                          checklist
                          {categoryChecklists.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </CardHeader>

                    {/* Category Content */}
                    {isCategoryExpanded && (
                      <CardContent className="p-2">
                        <div className="space-y-2">
                          {categoryChecklists.map((checklist) => {
                            const isAlreadySelected = selectedChecklistIds.includes(checklist.id);

                            return (
                              <Card
                                key={checklist.id}
                                className={`border-slate-200 bg-white shadow-sm ${!isAlreadySelected ? 'cursor-pointer hover:bg-slate-50' : 'opacity-50'} transition-colors`}
                                onClick={() => !isAlreadySelected && handleChecklistSelect(checklist.id)}
                              >
                                <CardHeader className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h5 className="text-sm font-medium text-slate-700">{checklist.title}</h5>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-slate-400">
                                        {checklist.items.length}
                                        {' '}
                                        items
                                      </span>
                                      {isAlreadySelected && (
                                        <span className="text-xs font-medium text-green-600">Added</span>
                                      )}
                                    </div>
                                  </div>
                                </CardHeader>
                              </Card>
                            );
                          })}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </>
          )}
        </div>
      </div>
    );
  }

  // Render work mode (selected checklists only)
  return (
    <div className="space-y-3">
      {/* Search Bar (Clickable to open selection mode) */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleSearchBarClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSearchBarClick();
          }
        }}
        className="cursor-text"
      >
        <Input
          type="text"
          placeholder="Search checklists..."
          value=""
          readOnly
          className="w-full cursor-text text-sm"
        />
      </div>

      {/* Selected Checklists - Stacked Cards */}
      {selectedChecklists.length > 0 ? (
        <div className="space-y-2">
          {selectedChecklists.map((checklist) => {
            const isExpanded = expandedWorkChecklists.includes(checklist.id);
            const checkedCount = checklist.items.filter(item => item.checked).length;

            return (
              <Card key={checklist.id} className="border-slate-200 bg-white shadow-sm">
                {/* Checklist Header - Clickable */}
                <CardHeader
                  className="cursor-pointer border-b border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                  onClick={() => handleWorkChecklistToggle(checklist.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {isExpanded
                          ? (
                              <ChevronDown size={16} className="text-slate-600" />
                            )
                          : (
                              <ChevronRight size={16} className="text-slate-600" />
                            )}
                        <div>
                          <h4 className="text-sm font-medium text-slate-700">{checklist.title}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-slate-400">
                        {checklist.items.length}
                        {' '}
                        items
                        {checkedCount > 0 && (
                          <span className="ml-1 text-blue-600">
                            (
                            {checkedCount}
                            {' '}
                            selected)
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSelectedChecklist(checklist.id);
                        }}
                        className="size-6 p-0 text-slate-400 hover:text-red-600"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Expanded Content */}
                {isExpanded && (
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      {/* Checklist Items */}
                      <div className="space-y-2">
                        {checklist.items.map(item => (
                          <div key={item.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={`work-${checklist.id}-${item.id}`}
                              checked={item.checked}
                              onCheckedChange={() => handleWorkItemToggle(checklist.id, item.id)}
                              className="mt-0.5"
                            />
                            <label
                              htmlFor={`work-${checklist.id}-${item.id}`}
                              className="flex-1 cursor-pointer text-sm leading-5 text-slate-700"
                            >
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>

                      {/* Add to Consultation Button */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-xs text-slate-600">
                          {checkedCount}
                          {' '}
                          of
                          {checklist.items.length}
                          {' '}
                          selected
                        </span>
                        <Button
                          onClick={() => handleAddToConsultation(checklist.id)}
                          disabled={checkedCount === 0}
                          size="sm"
                          className="bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                        >
                          Add to Consultation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        // Empty State
        <div className="py-8 text-center">
          <p className="mb-3 text-sm text-slate-500">No checklists selected</p>
          <p className="text-xs text-slate-400">Click the search bar above to choose from available checklists</p>
        </div>
      )}

    </div>
  );
};
