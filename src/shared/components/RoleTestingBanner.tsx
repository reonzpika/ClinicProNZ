'use client';

import { useTierTestingContext } from '@/src/shared/contexts/RoleTestingContext';

export function RoleTestingBanner() {
  const {
    testingTier,
    isTestingTier,
    originalTier,
    stopTierTesting,
  } = useTierTestingContext();

  // Only show banner if currently testing a tier
  if (!isTestingTier) {
    return null;
  }

  const handleRevert = async () => {
    stopTierTesting();
  };

  const getDisplayInfo = () => {
    if (isTestingTier && testingTier && originalTier) {
      return {
        mode: '🎭 Tier Testing',
        currentTier: testingTier,
        originalInfo: originalTier,
      };
    }
    return null;
  };

  const displayInfo = getDisplayInfo();

  if (!displayInfo) {
    return null;
  }

  return (
    <div className="bg-yellow-500 px-4 py-2 text-sm font-medium text-yellow-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-semibold">
            {displayInfo.mode}
          </span>
          <span>
            Current:
            {' '}
            <span className="font-bold">{displayInfo.currentTier}</span>
            {' '}
            {' '}
            | Original:
            <span className="font-bold">{displayInfo.originalInfo}</span>
          </span>
        </div>
        <button
          onClick={handleRevert}
          className="rounded bg-yellow-600 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-700"
        >
          Revert to
          {' '}
          {displayInfo.originalInfo}
        </button>
      </div>
    </div>
  );
}
