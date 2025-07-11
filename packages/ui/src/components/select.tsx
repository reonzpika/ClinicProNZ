import React from 'react';

type SelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Select({ value, onChange, disabled = false, className = '', children }: SelectProps) {
  return (
    <select
      value={value}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      className={`block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${className}`}
    >
      {children}
    </select>
  );
}
