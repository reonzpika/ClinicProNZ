'use client';

import * as React from 'react';

type Toast = {
  id: string;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void } | null;
  variant?: 'default' | 'destructive';
};

type ToastContextValue = {
  toasts: Toast[];
  show: (toast: Omit<Toast, 'id'> & { durationMs?: number }) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = React.useCallback((toast: Omit<Toast, 'id'> & { durationMs?: number }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...toast, id }]);
    const duration = toast.durationMs ?? 4000;
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toasts, show, dismiss }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-2 p-4">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex max-w-sm items-start gap-3 rounded-md border p-3 shadow ${t.variant === 'destructive' ? 'border-red-300 bg-red-50 text-red-800' : 'border-slate-200 bg-white text-slate-900'}`}>
            <div className="flex-1">
              {t.title && <div className="text-sm font-semibold">{t.title}</div>}
              {t.description && <div className="text-sm opacity-80">{t.description}</div>}
            </div>
            {t.action && (
              <button
                className="rounded border px-2 py-1 text-xs"
                onClick={() => {
 t.action?.onClick(); dismiss(t.id);
}}
              >
                {t.action.label}
              </button>
            )}
            <button className="rounded border px-2 py-1 text-xs" onClick={() => dismiss(t.id)}>Close</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
 throw new Error('useToast must be used within ToastProvider');
}
  return ctx;
}
