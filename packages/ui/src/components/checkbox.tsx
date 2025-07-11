import React from 'react';

type CheckboxProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
};

export function Checkbox({ checked = false, onChange, disabled = false, className = '', id }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange?.(e.target.checked)}
      disabled={disabled}
      className={`size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
      id={id}
    />
  );
}
