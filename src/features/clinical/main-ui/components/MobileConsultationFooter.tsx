'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Button } from '@/src/shared/components/ui/button';
import { TranscriptionControls } from './TranscriptionControls';

export const MobileConsultationFooter: React.FC = () => {
  const { generatedNotes, isDocumentationMode, transcription, typedInput } = useConsultationStores() as any;
  const [mounted, setMounted] = useState(false);
  const [footerRoot, setFooterRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const el = document.getElementById('app-footer-slot');
    setFooterRoot(el);
  }, []);

  const hasGenerated = useMemo(() => !!(generatedNotes && generatedNotes.trim().length > 0), [generatedNotes]);
  const hasUserContent = useMemo(() => {
    const t = transcription?.transcript || '';
    const ti = typedInput || '';
    return (t.trim().length > 0) || (ti.trim().length > 0);
  }, [transcription?.transcript, typedInput]);

  if (!mounted || !footerRoot) return null;

  return createPortal(
    <div className="flex items-center gap-3">
      <TranscriptionControls
        collapsed={false}
        isMinimized={false}
        enableRemoteMobile={false}
        showRecordingMethodToggle={false}
        mobileMode
        footerMode
      />

      {/* CTAs */}
      {!hasGenerated && (
        <Button
          type="button"
          variant="default"
          onClick={() => {
            const btn = document.getElementById('generate-notes-btn');
            (btn as HTMLButtonElement | null)?.click();
          }}
          disabled={!hasUserContent}
          className="h-12 flex-1 rounded-full bg-slate-700 px-4 text-base text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Process Notes
        </Button>
      )}

      {hasGenerated && (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const btn = document.getElementById('finish-notes-btn');
              (btn as HTMLButtonElement | null)?.click();
            }}
            className="h-12 flex-1 rounded-full border-red-300 text-base text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Finish
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => {
              const btn = document.getElementById('new-session-btn');
              (btn as HTMLButtonElement | null)?.click();
            }}
            className="h-12 flex-1 rounded-full bg-blue-600 text-base text-white hover:bg-blue-700"
          >
            New Session
          </Button>
        </>
      )}
    </div>,
    footerRoot,
  );
};
