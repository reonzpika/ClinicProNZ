'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';

// ---------------------------------------------------------------------------
// Desktop: Bookmark prompt (keyboard shortcut)
// ---------------------------------------------------------------------------

function isMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform) || /Mac/.test(navigator.userAgent);
}

export type DesktopBookmarkPromptProps = {
  open: boolean;
  onClose: () => void;
};

export function DesktopBookmarkPrompt({ open, onClose }: DesktopBookmarkPromptProps) {
  const [keyPressed, setKeyPressed] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      const mod = isMac() ? e.metaKey : e.ctrlKey;
      if (mod && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        setKeyPressed(true);
        closeTimeoutRef.current = setTimeout(() => {
          onClose();
        }, 3000);
      }
    },
    [open, onClose],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (!open) {
      setKeyPressed(false);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    }
  }, [open]);

  const mac = isMac();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {keyPressed ? 'Bookmark dialog opened' : 'Bookmark this page'}
          </DialogTitle>
        </DialogHeader>
        {keyPressed ? (
          <div className="mt-4 space-y-2">
            <p className="flex items-center gap-2 font-medium text-text-primary">
              <span aria-hidden>✓</span>
              Bookmark dialog opened
            </p>
            <p className="text-sm text-text-secondary">
              Save it in the dialog that just appeared.
            </p>
            <p className="text-xs text-text-tertiary">Closing in a few seconds…</p>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-text-secondary">
              Press this shortcut to open the bookmark dialog:
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-primary/5 p-6">
              <kbd className="inline-flex min-w-[3rem] justify-center rounded border border-border bg-surface px-3 py-2 font-mono text-xl font-semibold shadow-sm animate-pulse-slow">
                {mac ? '⌘' : 'Ctrl'}
              </kbd>
              <span className="text-2xl font-medium text-text-secondary">+</span>
              <kbd className="inline-flex min-w-[3rem] justify-center rounded border border-border bg-surface px-3 py-2 font-mono text-xl font-semibold shadow-sm animate-pulse-slow">
                D
              </kbd>
            </div>
            <p className="mt-4 text-xs text-text-tertiary">
              Tip: Keep bookmarks bar visible for one-click access.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Mobile: Install / Add to Home Screen prompt
// ---------------------------------------------------------------------------

type MobilePlatform = 'ios' | 'android' | 'other';

function detectMobilePlatform(): MobilePlatform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

export type MobileInstallPromptProps = {
  open: boolean;
  onClose: () => void;
  /** Called when user taps "I've Saved It" (persist that they've seen the prompt). */
  onSaved?: () => void;
};

export function MobileInstallPrompt({ open, onClose, onSaved }: MobileInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installOutcome, setInstallOutcome] = useState<'accepted' | 'dismissed' | null>(null);
  const [isPrompting, setIsPrompting] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const platform = detectMobilePlatform();

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setIsPrompting(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setInstallOutcome(outcome);
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } finally {
      setIsPrompting(false);
    }
  };

  const handleSavedIt = () => {
    onSaved?.();
    onClose();
  };

  const handleRemindLater = () => {
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 text-center text-4xl" aria-hidden>
          📱
        </div>
        <h2 className="mb-2 text-center text-xl font-bold text-text-primary">
          Save to Home Screen
        </h2>
        <p className="mb-4 text-center text-sm text-text-secondary">
          Save this page for instant access during consults. It&apos;ll work like an app – no need
          to find the link again.
        </p>

        {platform === 'android' && deferredPrompt && !installOutcome && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isPrompting}
              className="w-full rounded-lg bg-primary py-3 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {isPrompting ? 'Opening…' : 'Install app'}
            </button>
          </div>
        )}

        {platform === 'android' && installOutcome === 'accepted' && (
          <p className="mb-4 text-center text-sm font-medium text-green-700">
            App installed. Check your home screen.
          </p>
        )}

        {(platform === 'android' && !deferredPrompt) || (platform === 'android' && installOutcome === 'dismissed') ? (
          <ol className="mb-4 list-inside list-decimal space-y-2 text-left text-sm text-text-secondary">
            <li>Tap the menu (⋮) in the top-right corner</li>
            <li>Tap &quot;Add to Home screen&quot; or &quot;Install app&quot;</li>
            <li>Tap &quot;Add&quot;</li>
          </ol>
        ) : null}

        {platform === 'ios' && (
          <ol className="mb-4 list-inside list-decimal space-y-2 text-left text-sm text-text-secondary">
            <li>
              Tap the <strong>Share</strong> button (□↑) at the bottom
            </li>
            <li>
              Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>
            </li>
            <li>You may need to scroll to see it</li>
            <li>
              Tap <strong>&quot;Add&quot;</strong> in the top-right
            </li>
          </ol>
        )}

        {platform === 'other' && (
          <p className="mb-4 text-center text-sm text-text-secondary">
            Look for &quot;Add to Home Screen&quot; or &quot;Install App&quot; in your browser
            menu.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSavedIt}
            className="w-full rounded-lg bg-primary py-3 font-medium text-white transition-colors hover:bg-primary-dark"
          >
            I&apos;ve Saved It
          </button>
          <button
            type="button"
            onClick={handleRemindLater}
            className="w-full rounded-lg border border-border py-3 text-text-secondary transition-colors hover:bg-surface"
          >
            Remind Me Later
          </button>
        </div>
      </div>
    </div>
  );
}

// Type for beforeinstallprompt (not in all TS libs)
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
