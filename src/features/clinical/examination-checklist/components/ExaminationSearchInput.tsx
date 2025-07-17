'use client';

import { Search } from 'lucide-react';
import { forwardRef } from 'react';

import { Input } from '@/src/shared/components/ui/input';

type ExaminationSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export const ExaminationSearchInput = forwardRef<HTMLInputElement, ExaminationSearchInputProps>(
  ({ value, onChange, placeholder = 'Search examinations and findings...', className }, ref) => {
    return (
      <div className={`relative ${className || ''}`}>
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="pl-10"
        />
      </div>
    );
  },
);

ExaminationSearchInput.displayName = 'ExaminationSearchInput';
