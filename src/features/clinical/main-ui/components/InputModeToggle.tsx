'use client';

import { useConsultationStores } from '@/src/hooks/useConsultationStores';

export function InputModeToggle() {
  const { inputMode, setInputMode } = useConsultationStores();

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground">Input:</span>
      <div className="flex rounded border bg-white">
        <button
          type="button"
          onClick={() => setInputMode('audio')}
          className={`px-2 py-1 text-xs transition-colors ${
            inputMode === 'audio'
              ? 'bg-blue-600 text-white'
              : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground'
          } rounded-l`}
        >
          Audio
        </button>
        <button
          type="button"
          onClick={() => setInputMode('typed')}
          className={`px-2 py-1 text-xs transition-colors ${
            inputMode === 'typed'
              ? 'bg-blue-600 text-white'
              : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground'
          } rounded-r`}
        >
          Typed
        </button>
      </div>
    </div>
  );
}
