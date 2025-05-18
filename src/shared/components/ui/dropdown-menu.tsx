import React, { useState, createContext, useContext, useRef, useEffect } from 'react';

const DropdownMenuContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children }: { children: React.ReactNode }) {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className="focus:outline-none"
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({ children }: { children: React.ReactNode }) {
  const ctx = useContext(DropdownMenuContext);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ctx || !ctx.open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        ctx.setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ctx && ctx.open]);
  if (!ctx || !ctx.open) return null;
  return (
    <div ref={ref} className="absolute right-0 z-50 mt-2 w-40 rounded-md bg-white shadow-lg border border-gray-200 p-1">
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  const ctx = useContext(DropdownMenuContext);
  return (
    <button
      type="button"
      className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
      onClick={e => {
        if (onClick) onClick();
        if (ctx) ctx.setOpen(false);
      }}
      disabled={disabled}
    >
      {children}
    </button>
  );
} 