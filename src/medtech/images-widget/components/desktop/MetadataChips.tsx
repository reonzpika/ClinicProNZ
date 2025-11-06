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

import { useState } from 'react';
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
        showOther
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
      />
      
      {/* Type */}
      <ChipGroup
        label="Type"
        options={quickChips.types}
        selected={image.metadata.type}
        sticky={stickyMetadata.type}
        onSelect={(concept) => handleSelect('type', concept)}
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
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
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
  showOther?: boolean;
  required?: boolean;
  onApply?: () => void;
  onApplyToSelected?: () => void;
  restImagesCount?: number;
  canApply?: boolean;
}

function ChipGroup({ label, options, selected, sticky, onSelect, showOther, required, onApply, onApplyToSelected, restImagesCount = 0, canApply = false }: ChipGroupProps) {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState('');
  
  const handleOtherSubmit = () => {
    if (otherValue.trim()) {
      onSelect({
        system: 'clinicpro/custom',
        code: otherValue.toLowerCase().replace(/\s+/g, '-'),
        display: otherValue.trim(),
      });
      setOtherValue('');
      setShowOtherInput(false);
    }
  };
  
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
      
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected?.code === option.code;
          const isSticky = !selected && sticky?.code === option.code;
          
          return (
            <button
              key={option.code}
              type="button"
              onClick={() => onSelect(option)}
              className={`
                inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium
                transition-all
                ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500 text-white shadow-sm'
                    : isSticky
                      ? 'border-purple-300 bg-purple-50 text-purple-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                }
              `}
            >
              {isSelected && <Check className="size-3.5" />}
              {option.display}
            </button>
          );
        })}
        
        {showOther && !showOtherInput && (
          <button
            type="button"
            onClick={() => setShowOtherInput(true)}
            className="rounded-full border border-dashed border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50"
          >
            Other...
          </button>
        )}
        
        {showOtherInput && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleOtherSubmit();
                } else if (e.key === 'Escape') {
                  setShowOtherInput(false);
                  setOtherValue('');
                }
              }}
              placeholder="Type body site..."
              className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              autoFocus
            />
            <button
              type="button"
              onClick={handleOtherSubmit}
              className="rounded bg-purple-500 px-2 py-1 text-xs text-white hover:bg-purple-600"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowOtherInput(false);
                setOtherValue('');
              }}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      {/* Apply Button (for Side and Body Site only) */}
      {required && onApply && (
        <div className="mt-2">
          <div className="inline-flex">
            <Button
              disabled={!canApply || restImagesCount === 0}
              variant="outline"
              size="sm"
              className="h-7 rounded-r-none border-r-0 text-xs"
              onClick={onApply}
            >
              <ArrowRight className="mr-1 size-3" />
              Apply to All ({restImagesCount})
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  disabled={!canApply || restImagesCount === 0}
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-l-none px-2 text-xs"
                >
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onApplyToSelected}>
                  <Check className="mr-2 size-3" />
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
