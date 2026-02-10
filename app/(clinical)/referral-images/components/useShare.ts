'use client';

import { useCallback, useState } from 'react';

import { trackShare } from './trackShare';

const SHARE_TITLE = 'ClinicPro - Referral Images';
const SHARE_TEXT
  = 'Stop wasting >10 minutes on referral photos. Phone to desktop in 30 seconds. Free for GPs.';

export function useShare(userId: string | null, shareUrl: string) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLocation, setShareLocation] = useState('');

  const handleShare = useCallback(
    async (location: string): Promise<boolean> => {
      if (!userId || !shareUrl) {
 return false;
}
      await trackShare(userId, location);

      // Check if we're on mobile - only use native share on mobile devices
      const isMobile = typeof window !== 'undefined'
        && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile && typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: SHARE_TITLE,
            text: SHARE_TEXT,
            url: shareUrl,
          });
          await trackShare(userId, location, 'native_sheet');
          return true;
        } catch (err) {
          // If user cancels, just return without showing modal
          if ((err as Error).name === 'AbortError') {
 return false;
}
          // For any other error, fall through to custom modal
          console.log('[useShare] Native share failed, falling back to modal:', err);
        }
      }

      // Always use custom modal on desktop or if native share failed
      setShareLocation(location);
      setShareModalOpen(true);
      return false;
    },
    [userId, shareUrl],
  );

  return {
    handleShare,
    shareModalOpen,
    setShareModalOpen,
    shareLocation,
  };
}
