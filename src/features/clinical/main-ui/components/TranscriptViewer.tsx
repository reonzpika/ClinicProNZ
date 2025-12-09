'use client';

import { useState } from 'react';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';

type TranscriptViewerProps = {
  showConsentPill?: boolean;
};

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ showConsentPill = true }) => {
  const { transcription, consentObtained, setConsentObtained } = useConsultationStores();
  const [expanded, setExpanded] = useState(false);

  const text = transcription.transcript || '';
  const hasText = !!text.trim();
  const preview = hasText ? text.slice(0, 180) : '';
  const needsMore = hasText && text.length > 180;

  const handleConsentClick = () => {
    try {
      // Open the shared consent modal via global bridge used in ConsultationPage
      // Fallback: just set consent obtained
      setConsentObtained(true);
    } catch {}
  };

  return (
    <div className="space-y-2" style={{ scrollMarginBottom: 'var(--footer-h, 76px)' } as React.CSSProperties}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Live Transcript</span>
          {hasText && (
            <span className="text-xs text-slate-500">Updated</span>
          )}
        </div>
        {showConsentPill && (
          <button
            type="button"
            onClick={handleConsentClick}
            className={`h-6 rounded-full px-2 text-[11px] ${consentObtained ? 'border border-green-300 bg-green-50 text-green-700' : 'border border-amber-300 bg-amber-50 text-amber-700'}`}
          >
            {consentObtained ? 'Consent: Granted' : 'Consent: Required'}
          </button>
        )}
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-2">
        {!hasText && (
          <div className="text-sm italic text-slate-500">No transcription yet</div>
        )}
        {hasText && !expanded && (
          <div className="text-sm leading-relaxed text-slate-700">
            {preview}
            {needsMore && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="ml-1 text-xs text-blue-600 underline hover:text-blue-800"
              >
                Show more
              </button>
            )}
          </div>
        )}
        {hasText && expanded && (
          <div className="max-h-48 overflow-y-auto text-sm leading-relaxed text-slate-700">
            {text}
          </div>
        )}
      </div>
    </div>
  );
};
