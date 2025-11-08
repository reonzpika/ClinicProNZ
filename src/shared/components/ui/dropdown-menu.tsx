import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const DropdownMenuContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = React.useMemo(() => ({ open, setOpen }), [open, setOpen]);
  return (
    <DropdownMenuContext.Provider value={value}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children }: { children: React.ReactNode }) {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  }
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        ctx.setOpen(!ctx.open);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          ctx.setOpen(!ctx.open);
        }
      }}
      className="cursor-pointer focus:outline-none"
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

export function DropdownMenuContent({ children }: { children: React.ReactNode }) {
  const ctx = useContext(DropdownMenuContext);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ctx || !ctx.open) {
      return;
    }
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node) && ctx) {
        ctx.setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ctx]);
  if (!ctx || !ctx.open) {
    return null;
  }
  return (
    <div ref={ref} className="absolute right-0 z-50 mt-2 w-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  const ctx = useContext(DropdownMenuContext);
  return (
    <button
      type="button"
      className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
      onClick={(_e) => {
        if (onClick) {
          onClick();
        }
        if (ctx) {
          ctx.setOpen(false);
        }
      }}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
