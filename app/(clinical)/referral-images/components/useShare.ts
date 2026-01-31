'use client';

import { useCallback, useState } from 'react';
import { trackShare } from './trackShare';

const SHARE_TITLE = 'ClinicPro - Referral Images';
const SHARE_TEXT =
  'Stop wasting >10 minutes on referral photos. Phone to desktop in 30 seconds. Free for GPs.';

export function useShare(userId: string | null, shareUrl: string) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLocation, setShareLocation] = useState('');

  const handleShare = useCallback(
    async (location: string): Promise<boolean> => {
      if (!userId || !shareUrl) return false;
      await trackShare(userId, location);
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: SHARE_TITLE,
            text: SHARE_TEXT,
            url: shareUrl,
          });
          await trackShare(userId, location, 'native_sheet');
          return true;
        } catch (err) {
          if ((err as Error).name === 'AbortError') return false;
          setShareLocation(location);
          setShareModalOpen(true);
          return false;
        }
      }
      setShareLocation(location);
      setShareModalOpen(true);
      return false;
    },
    [userId, shareUrl]
  );

  return {
    handleShare,
    shareModalOpen,
    setShareModalOpen,
    shareLocation,
  };
}
