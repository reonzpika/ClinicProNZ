import React from 'react';

type TextareaProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
};

export function Textarea({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  rows = 4,
}: TextareaProps) {
  return (
    <textarea
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={`block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${className}`}
    />
  );
}
