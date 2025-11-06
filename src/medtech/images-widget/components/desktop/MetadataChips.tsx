/**
 * Metadata Chips Component
 * 
 * Displays quick-select chips for:
 * - Side (Right, Left, Bilateral, N/A)
 * - Body Site (common coded sites + "Other" for search)
 * - View (Close-up, Dermoscopy, Other)
 * - Type (Lesion, Rash, Wound, Infection, Other)
 * 
 * Implements "sticky-last" behavior: last selected value is highlighted
 */

'use client';

import { useState, useEffect } from 'react';
import { Check, ArrowRight, ChevronDown } from 'lucide-react';
import type { CodeableConcept } from '../../types';
import { useImageWidgetStore } from '../../stores/imageWidgetStore';
import { Button } from '@/src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/shared/components/ui/dropdown-menu';

interface MetadataChipsProps {
  imageId: string;
  onMetadataChange?: (metadata: Partial<Record<'laterality' | 'bodySite' | 'view' | 'type', CodeableConcept>>) => void;
  onApplyLaterality?: () => void;
  onApplyBodySite?: () => void;
  onApplyToSelected?: () => void;
  restImagesCount?: number;
  hasLaterality?: boolean;
  hasBodySite?: boolean;
}

export function MetadataChips({ 
  imageId, 
  onMetadataChange,
  onApplyLaterality,
  onApplyBodySite,
  onApplyToSelected,
  restImagesCount = 0,
  hasLaterality = false,
  hasBodySite = false,
}: MetadataChipsProps) {
  const { capabilities, sessionImages, updateMetadata, setStickyMetadata, stickyMetadata } = useImageWidgetStore();
  
  const image = sessionImages.find((img) => img.id === imageId);
  
  if (!capabilities || !image) {
    return null;
  }
  
  const quickChips = capabilities.features.images.quickChips;
  
  const handleSelect = (
    key: 'laterality' | 'bodySite' | 'view' | 'type',
    concept: CodeableConcept
  ) => {
    updateMetadata(imageId, { [key]: concept });
    setStickyMetadata(key, concept);
    onMetadataChange?.({ [key]: concept });
  };
  
  return (
    <div className="space-y-4">
      {/* Side */}
      <ChipGroup
        label="Side"
        options={quickChips.laterality}
        selected={image.metadata.laterality}
        sticky={stickyMetadata.laterality}
        onSelect={(concept) => handleSelect('laterality', concept)}
        showTextInput
        required
        onApply={onApplyLaterality}
        onApplyToSelected={onApplyToSelected}
        restImagesCount={restImagesCount}
        canApply={hasLaterality}
      />
      
      {/* Body Site */}
      <ChipGroup
        label="Body Site"
        options={quickChips.bodySitesCommon}
        selected={image.metadata.bodySite}
        sticky={stickyMetadata.bodySite}
        onSelect={(concept) => handleSelect('bodySite', concept)}
        showTextInput
        required
        onApply={onApplyBodySite}
        onApplyToSelected={onApplyToSelected}
        restImagesCount={restImagesCount}
        canApply={hasBodySite}
      />
      
      {/* View */}
      <ChipGroup
        label="View"
        options={quickChips.views}
        selected={image.metadata.view}
        sticky={stickyMetadata.view}
        onSelect={(concept) => handleSelect('view', concept)}
        showTextInput
        hideOthersDropdown
      />
      
      {/* Type */}
      <ChipGroup
        label="Type"
        options={quickChips.types}
        selected={image.metadata.type}
        sticky={stickyMetadata.type}
        onSelect={(concept) => handleSelect('type', concept)}
        showTextInput
        hideOthersDropdown
      />
      
      {/* Label (free text) */}
      <div>
        <label htmlFor={`label-${imageId}`} className="mb-2 block text-xs font-medium text-slate-700">
          Label <span className="text-slate-500">(optional)</span>
        </label>
        <input
          id={`label-${imageId}`}
          type="text"
          value={image.metadata.label || ''}
          onChange={(e) => updateMetadata(imageId, { label: e.target.value })}
          placeholder="e.g., Lesion 1 (superior)"
          className="w-48 rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          maxLength={100}
        />
      </div>
    </div>
  );
}

interface ChipGroupProps {
  label: string;
  options: CodeableConcept[];
  selected?: CodeableConcept;
  sticky?: CodeableConcept;
  onSelect: (concept: CodeableConcept) => void;
  showTextInput?: boolean;
  hideOthersDropdown?: boolean;
  required?: boolean;
  onApply?: () => void;
  onApplyToSelected?: () => void;
  restImagesCount?: number;
  canApply?: boolean;
}

function ChipGroup({ label, options, selected, sticky, onSelect, showTextInput, hideOthersDropdown, required, onApply, onApplyToSelected, restImagesCount = 0, canApply = false }: ChipGroupProps) {
  const [textInputValue, setTextInputValue] = useState(selected?.display || '');
  
  // Sync text input with selected value
  useEffect(() => {
    if (showTextInput) {
      setTextInputValue(selected?.display || '');
    }
  }, [selected, showTextInput]);
  
  const handleTextInputChange = (value: string) => {
    setTextInputValue(value);
    if (value.trim()) {
      onSelect({
        system: 'clinicpro/custom',
        code: value.toLowerCase().replace(/\s+/g, '-'),
        display: value.trim(),
      });
    }
  };
  
  // Show only first 4 chips, rest in dropdown
  const visibleChips = options.slice(0, 4);
  const remainingChips = options.slice(4);
  
  // Check if field is missing (for inline validation)
  const isMissing = required && !selected;
  
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
        {isMissing && (
          <span className="ml-2 text-xs font-normal text-red-600">
            (is required)
          </span>
        )}
        {!selected && sticky && !isMissing && (
          <span className="ml-2 text-xs font-normal text-slate-500">
            (last: {sticky.display})
          </span>
        )}
      </label>
      
      {/* Text Input with Chips to the right */}
      <div className="flex items-start gap-2">
        {showTextInput && (
          <input
            type="text"
            value={textInputValue}
            onChange={(e) => {
              setTextInputValue(e.target.value);
              handleTextInputChange(e.target.value);
            }}
            placeholder={`Enter ${label.toLowerCase()}...`}
            className="w-48 rounded-md border border-slate-300 px-3 py-1.5 text-xs focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            maxLength={100}
          />
        )}
        
        <div className={`flex flex-wrap gap-1.5 ${showTextInput ? '' : 'w-full'}`}>
        {visibleChips.map((option) => {
          const isSelected = selected?.code === option.code;
          const isSticky = !selected && sticky?.code === option.code;
          
          return (
            <button
              key={option.code}
              type="button"
              onClick={() => {
                onSelect(option);
                if (showTextInput) {
                  setTextInputValue(option.display);
                }
              }}
              className={`
                inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-normal
                transition-all
                ${
                  isSelected
                    ? 'border-purple-400 bg-purple-50 text-purple-700'
                    : isSticky
                      ? 'border-purple-200 bg-purple-50 text-purple-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }
              `}
            >
              {isSelected && <Check className="size-2.5" />}
              {option.display}
            </button>
          );
        })}
        
        {/* Others dropdown if there are more than 4 chips and not hidden */}
        {remainingChips.length > 0 && !hideOthersDropdown && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-normal text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              >
                Others
                <ChevronDown className="size-2.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {remainingChips.map((option) => {
                const isSelected = selected?.code === option.code;
                return (
                  <DropdownMenuItem
                    key={option.code}
                    onClick={() => {
                      onSelect(option);
                      if (showTextInput) {
                        setTextInputValue(option.display);
                      }
                    }}
                  >
                    {isSelected && <Check className="mr-2 size-3" />}
                    {option.display}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        </div>
      </div>
      
      
      {/* Apply Button (for Side and Body Site only) */}
      {required && onApply && (
        <div className="mt-2">
          <div className="inline-flex">
            <Button
              disabled={!canApply || restImagesCount === 0}
              variant="ghost"
              size="sm"
              className="h-6 rounded-r-none border-r-0 text-xs text-slate-600 hover:text-slate-900"
              onClick={onApply}
            >
              <ArrowRight className="mr-1 size-3" />
              Apply to All ({restImagesCount})
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  disabled={!canApply || restImagesCount === 0}
                  variant="ghost"
                  size="sm"
                  className="h-6 rounded-l-none px-2 text-xs text-slate-600 hover:text-slate-900"
                >
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onApplyToSelected}>
                  Apply to Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
}
